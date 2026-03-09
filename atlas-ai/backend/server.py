"""
Atlas AI — Main FastAPI Server
- Chat API (local GPT-2 with streaming)
- Twilio webhooks (voice, SMS, video)
- WebSocket for real-time comm feed
- Database REST API
- GOAT Royalty integration
"""

import os
import uuid
import json
import asyncio
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import Response, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from dotenv import load_dotenv

from database import (
    init_db, get_db, Contact, ChatConversation, ChatMessage,
    CallLog, MessageLog, VideoSession, ActivityEvent
)
from gpt2_engine import gpt2, preload_model
from stream_hub import hub

load_dotenv()

TWILIO_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8765")
AGENT_NAME = os.getenv("AGENT_NAME", "Atlas")
PORT = int(os.getenv("PORT", "8765"))

# ── Lifespan ──────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    import threading
    threading.Thread(target=preload_model, daemon=True).start()
    await hub.broadcast_system(f"{AGENT_NAME} is online and ready.", "success")
    print(f"🤖 {AGENT_NAME} starting on port {PORT}...")
    yield
    print(f"🤖 {AGENT_NAME} shutting down.")


app = FastAPI(title="Atlas AI", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Twilio client (optional)
twilio_client = None
if os.getenv("TWILIO_ACCOUNT_SID") and os.getenv("TWILIO_AUTH_TOKEN"):
    try:
        from twilio.rest import Client as TwilioClient
        twilio_client = TwilioClient(
            os.getenv("TWILIO_ACCOUNT_SID"),
            os.getenv("TWILIO_AUTH_TOKEN")
        )
        print("✅ Twilio connected")
    except Exception as e:
        print(f"⚠️  Twilio not configured: {e}")


# ══════════════════════════════════════════════════════════════
#  HEALTH CHECK
# ══════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    return {
        "name": "Atlas AI",
        "version": "2.0.0",
        "agent": AGENT_NAME,
        "status": "online",
        "websocket_connections": hub.connection_count,
    }

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# ══════════════════════════════════════════════════════════════
#  WEBSOCKET — Real-time comm stream
# ══════════════════════════════════════════════════════════════

@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    await websocket.accept()
    await hub.connect(websocket)
    try:
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connected",
            "data": {"message": f"Connected to {AGENT_NAME} stream"},
            "timestamp": datetime.utcnow().isoformat(),
        }))
        # Keep alive
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                # Echo ping/pong
                if data == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                await websocket.send_text(json.dumps({"type": "heartbeat"}))
    except WebSocketDisconnect:
        pass
    finally:
        await hub.disconnect(websocket)


# ══════════════════════════════════════════════════════════════
#  CHAT API — Local GPT-2
# ══════════════════════════════════════════════════════════════

class ChatSendRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    stream: bool = True
    max_tokens: int = 200
    temperature: float = 0.8


@app.post("/api/chat")
async def chat(req: ChatSendRequest, db: Session = Depends(get_db)):
    """Send a message and get a GPT-2 response (non-streaming)."""
    conv_id = req.conversation_id or uuid.uuid4().hex

    conv = db.query(ChatConversation).filter_by(conversation_id=conv_id).first()
    if not conv:
        conv = ChatConversation(
            conversation_id=conv_id,
            title=req.message[:50] + ("..." if len(req.message) > 50 else ""),
        )
        db.add(conv)
        db.commit()

    # Save user message
    user_msg = ChatMessage(
        conversation_id=conv_id,
        role="user",
        content=req.message,
    )
    db.add(user_msg)

    # Generate response
    response_text = gpt2.generate(
        req.message,
        conversation_id=conv_id,
        max_new_tokens=req.max_tokens,
        temperature=req.temperature,
    )

    # Save assistant message
    ai_msg = ChatMessage(
        conversation_id=conv_id,
        role="assistant",
        content=response_text,
    )
    db.add(ai_msg)

    # Update conversation
    conv.message_count = (conv.message_count or 0) + 2
    conv.updated_at = datetime.utcnow()
    db.commit()

    # Broadcast to WebSocket
    await hub.broadcast_chat({
        "conversation_id": conv_id,
        "message": response_text[:100] + "...",
    })

    return {
        "conversation_id": conv_id,
        "response": response_text,
        "role": "assistant",
    }


@app.post("/api/chat/stream")
async def chat_stream(req: ChatSendRequest, db: Session = Depends(get_db)):
    """Stream GPT-2 response token by token (Server-Sent Events)."""
    conv_id = req.conversation_id or uuid.uuid4().hex

    conv = db.query(ChatConversation).filter_by(conversation_id=conv_id).first()
    if not conv:
        conv = ChatConversation(
            conversation_id=conv_id,
            title=req.message[:50] + ("..." if len(req.message) > 50 else ""),
        )
        db.add(conv)
        db.commit()

    # Save user message
    user_msg = ChatMessage(conversation_id=conv_id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()

    def generate():
        full = []
        for token in gpt2.generate_stream(
            req.message,
            conversation_id=conv_id,
            max_new_tokens=req.max_tokens,
            temperature=req.temperature,
        ):
            full.append(token)
            yield f"data: {json.dumps({'token': token, 'conversation_id': conv_id})}\n\n"

        # Save complete response
        complete = "".join(full).strip()
        ai_msg = ChatMessage(conversation_id=conv_id, role="assistant", content=complete)
        db.add(ai_msg)
        conv.message_count = (conv.message_count or 0) + 2
        conv.updated_at = datetime.utcnow()
        db.commit()

        yield f"data: {json.dumps({'done': True, 'conversation_id': conv_id})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


# ══════════════════════════════════════════════════════════════
#  CONVERSATION API
# ══════════════════════════════════════════════════════════════

@app.get("/api/conversations")
async def list_conversations(db: Session = Depends(get_db)):
    convs = db.query(ChatConversation).order_by(
        ChatConversation.updated_at.desc()
    ).limit(50).all()
    return [
        {
            "conversation_id": c.conversation_id,
            "title": c.title,
            "message_count": c.message_count,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            "is_pinned": c.is_pinned,
        }
        for c in convs
    ]


@app.get("/api/conversations/{conv_id}")
async def get_conversation(conv_id: str, db: Session = Depends(get_db)):
    conv = db.query(ChatConversation).filter_by(conversation_id=conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(ChatMessage).filter_by(
        conversation_id=conv_id
    ).order_by(ChatMessage.created_at).all()

    return {
        "conversation_id": conv.conversation_id,
        "title": conv.title,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ],
    }


@app.delete("/api/conversations/{conv_id}")
async def delete_conversation(conv_id: str, db: Session = Depends(get_db)):
    conv = db.query(ChatConversation).filter_by(conversation_id=conv_id).first()
    if conv:
        db.delete(conv)
        db.commit()
    gpt2.clear_history(conv_id)
    return {"deleted": True}


# ══════════════════════════════════════════════════════════════
#  DASHBOARD API
# ══════════════════════════════════════════════════════════════

@app.get("/api/dashboard")
async def dashboard(db: Session = Depends(get_db)):
    total_convs = db.query(ChatConversation).count()
    total_msgs = db.query(ChatMessage).count()
    total_calls = db.query(CallLog).count()
    total_sms = db.query(MessageLog).count()
    total_videos = db.query(VideoSession).count()

    recent_activity = db.query(ActivityEvent).order_by(
        ActivityEvent.created_at.desc()
    ).limit(20).all()

    return {
        "stats": {
            "conversations": total_convs,
            "messages": total_msgs,
            "calls": total_calls,
            "sms": total_sms,
            "video_sessions": total_videos,
            "ws_connections": hub.connection_count,
        },
        "recent_activity": [
            {
                "id": e.id,
                "type": e.event_type,
                "title": e.title,
                "description": e.description,
                "severity": e.severity,
                "created_at": e.created_at.isoformat(),
            }
            for e in recent_activity
        ],
    }


# ══════════════════════════════════════════════════════════════
#  TWILIO WEBHOOKS — Voice
# ══════════════════════════════════════════════════════════════

@app.post("/webhooks/voice/incoming")
async def voice_incoming(request: Request, db: Session = Depends(get_db)):
    """Handle incoming voice calls."""
    try:
        from twilio.twiml.voice_response import VoiceResponse, Gather
    except ImportError:
        return Response(content="<Response><Say>Service unavailable.</Say></Response>", media_type="text/xml")

    form = await request.form()
    call_sid = form.get("CallSid", "")
    from_number = form.get("From", "")
    to_number = form.get("To", "")

    # Log the call
    call = CallLog(
        call_sid=call_sid,
        from_number=from_number,
        to_number=to_number,
        direction="inbound",
        status="in-progress",
    )
    db.add(call)

    # Update/create contact
    contact = db.query(Contact).filter_by(phone_number=from_number).first()
    if not contact:
        contact = Contact(phone_number=from_number)
        db.add(contact)
    contact.call_count = (contact.call_count or 0) + 1
    contact.last_contact = datetime.utcnow()
    db.commit()

    # Broadcast to WebSocket
    await hub.broadcast_call({
        "call_sid": call_sid,
        "from": from_number,
        "to": to_number,
        "status": "incoming",
        "contact_name": contact.name,
    })

    # Log activity
    event = ActivityEvent(
        event_type="call",
        title=f"Incoming call from {contact.name or from_number}",
        description=f"Call SID: {call_sid}",
        severity="info",
    )
    db.add(event)
    db.commit()

    # TwiML response
    response = VoiceResponse()
    gather = Gather(
        input="speech",
        action=f"{BASE_URL}/webhooks/voice/gather",
        timeout=5,
        speech_timeout="auto",
    )
    gather.say(
        f"Hello, you've reached {AGENT_NAME}. How can I help you today?",
        voice="Polly.Joanna"
    )
    response.append(gather)
    response.say("I didn't catch that. Please call back.", voice="Polly.Joanna")

    return Response(content=str(response), media_type="text/xml")


@app.post("/webhooks/voice/gather")
async def voice_gather(request: Request, db: Session = Depends(get_db)):
    """Process speech input from caller."""
    try:
        from twilio.twiml.voice_response import VoiceResponse
    except ImportError:
        return Response(content="<Response><Hangup/></Response>", media_type="text/xml")

    form = await request.form()
    call_sid = form.get("CallSid", "")
    speech_result = form.get("SpeechResult", "")

    # Generate AI response
    ai_response = gpt2.generate(
        speech_result,
        conversation_id=f"call_{call_sid}",
        max_new_tokens=100,
        temperature=0.7,
    )

    # Update call log
    call = db.query(CallLog).filter_by(call_sid=call_sid).first()
    if call:
        call.transcription = speech_result
        call.ai_response = ai_response
        db.commit()

    # Broadcast
    await hub.broadcast_call({
        "call_sid": call_sid,
        "transcription": speech_result,
        "ai_response": ai_response,
        "status": "transcribed",
    })

    response = VoiceResponse()
    response.say(ai_response[:500], voice="Polly.Joanna")
    response.hangup()

    return Response(content=str(response), media_type="text/xml")


# ══════════════════════════════════════════════════════════════
#  TWILIO WEBHOOKS — SMS
# ══════════════════════════════════════════════════════════════

@app.post("/webhooks/sms/incoming")
async def sms_incoming(request: Request, db: Session = Depends(get_db)):
    """Handle incoming SMS messages."""
    try:
        from twilio.twiml.messaging_response import MessagingResponse
    except ImportError:
        return Response(content="<Response/>", media_type="text/xml")

    form = await request.form()
    message_sid = form.get("MessageSid", uuid.uuid4().hex)
    from_number = form.get("From", "")
    to_number = form.get("To", "")
    body = form.get("Body", "")

    # Generate AI response
    ai_response = gpt2.generate(
        body,
        conversation_id=f"sms_{from_number}",
        max_new_tokens=150,
        temperature=0.8,
    )

    # Log message
    msg = MessageLog(
        message_sid=message_sid,
        from_number=from_number,
        to_number=to_number,
        body=body,
        direction="inbound",
        status="received",
        ai_response=ai_response,
    )
    db.add(msg)

    # Update contact
    contact = db.query(Contact).filter_by(phone_number=from_number).first()
    if not contact:
        contact = Contact(phone_number=from_number)
        db.add(contact)
    contact.message_count = (contact.message_count or 0) + 1
    contact.last_contact = datetime.utcnow()

    # Log activity
    event = ActivityEvent(
        event_type="sms",
        title=f"SMS from {contact.name or from_number}",
        description=body[:100],
        severity="info",
    )
    db.add(event)
    db.commit()

    # Broadcast
    await hub.broadcast_sms({
        "from": from_number,
        "body": body,
        "ai_response": ai_response,
        "contact_name": contact.name,
    })

    response = MessagingResponse()
    response.message(ai_response[:1600])
    return Response(content=str(response), media_type="text/xml")


# ══════════════════════════════════════════════════════════════
#  CONTACTS API
# ══════════════════════════════════════════════════════════════

@app.get("/api/contacts")
async def list_contacts(db: Session = Depends(get_db)):
    contacts = db.query(Contact).order_by(Contact.last_contact.desc()).limit(100).all()
    return [
        {
            "id": c.id,
            "phone_number": c.phone_number,
            "name": c.name,
            "call_count": c.call_count,
            "message_count": c.message_count,
            "last_contact": c.last_contact.isoformat() if c.last_contact else None,
            "is_favorite": c.is_favorite,
        }
        for c in contacts
    ]


@app.get("/api/calls")
async def list_calls(db: Session = Depends(get_db)):
    calls = db.query(CallLog).order_by(CallLog.started_at.desc()).limit(50).all()
    return [
        {
            "id": c.id,
            "call_sid": c.call_sid,
            "from_number": c.from_number,
            "direction": c.direction,
            "status": c.status,
            "duration": c.duration,
            "transcription": c.transcription[:200] if c.transcription else "",
            "started_at": c.started_at.isoformat(),
        }
        for c in calls
    ]


@app.get("/api/messages")
async def list_messages(db: Session = Depends(get_db)):
    msgs = db.query(MessageLog).order_by(MessageLog.created_at.desc()).limit(50).all()
    return [
        {
            "id": m.id,
            "from_number": m.from_number,
            "body": m.body[:200],
            "direction": m.direction,
            "ai_response": m.ai_response[:200] if m.ai_response else "",
            "created_at": m.created_at.isoformat(),
        }
        for m in msgs
    ]


# ══════════════════════════════════════════════════════════════
#  SEND OUTBOUND (requires Twilio)
# ══════════════════════════════════════════════════════════════

class SendSMSRequest(BaseModel):
    to: str
    message: str


@app.post("/api/send/sms")
async def send_sms(req: SendSMSRequest, db: Session = Depends(get_db)):
    if not twilio_client:
        raise HTTPException(status_code=503, detail="Twilio not configured")

    msg = twilio_client.messages.create(
        body=req.message,
        from_=TWILIO_NUMBER,
        to=req.to,
    )

    log = MessageLog(
        message_sid=msg.sid,
        from_number=TWILIO_NUMBER,
        to_number=req.to,
        body=req.message,
        direction="outbound",
        status="sent",
    )
    db.add(log)
    db.commit()

    await hub.broadcast_sms({
        "to": req.to,
        "body": req.message,
        "direction": "outbound",
        "status": "sent",
    })

    return {"sent": True, "sid": msg.sid}


# ══════════════════════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=PORT,
        reload=False,
        log_level="info",
    )
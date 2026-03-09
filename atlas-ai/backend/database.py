"""
Atlas AI — Database Models
SQLAlchemy models for conversations, comms, contacts, and activity feed.
"""

import os
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, String, Integer, Float, Boolean,
    Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "atlas.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized")


# ─────────────────────────────────────────────────────────────
#  CHAT MODELS
# ─────────────────────────────────────────────────────────────

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, unique=True, index=True)
    title = Column(String, default="New Conversation")
    model = Column(String, default="gpt2-medium")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    message_count = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    tags = Column(JSON, default=list)

    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("chat_conversations.conversation_id"))
    role = Column(String)  # "user" | "assistant" | "system"
    content = Column(Text)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_ = Column("metadata", JSON, default=dict)

    conversation = relationship("ChatConversation", back_populates="messages")


# ─────────────────────────────────────────────────────────────
#  COMMUNICATION MODELS
# ─────────────────────────────────────────────────────────────

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True)
    name = Column(String, default="Unknown")
    email = Column(String, nullable=True)
    notes = Column(Text, default="")
    call_count = Column(Integer, default=0)
    message_count = Column(Integer, default=0)
    last_contact = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    tags = Column(JSON, default=list)
    is_favorite = Column(Boolean, default=False)


class CallLog(Base):
    __tablename__ = "call_logs"

    id = Column(Integer, primary_key=True, index=True)
    call_sid = Column(String, unique=True, index=True)
    from_number = Column(String)
    to_number = Column(String)
    direction = Column(String)  # "inbound" | "outbound"
    status = Column(String)     # "completed" | "missed" | "in-progress"
    duration = Column(Integer, default=0)  # seconds
    transcription = Column(Text, default="")
    ai_summary = Column(Text, default="")
    ai_response = Column(Text, default="")
    recording_url = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)


class MessageLog(Base):
    __tablename__ = "message_logs"

    id = Column(Integer, primary_key=True, index=True)
    message_sid = Column(String, unique=True, index=True)
    from_number = Column(String)
    to_number = Column(String)
    body = Column(Text)
    direction = Column(String)  # "inbound" | "outbound"
    status = Column(String)
    ai_response = Column(Text, default="")
    media_urls = Column(JSON, default=list)
    is_group = Column(Boolean, default=False)
    group_participants = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class VideoSession(Base):
    __tablename__ = "video_sessions"

    id = Column(Integer, primary_key=True, index=True)
    room_name = Column(String, unique=True, index=True)
    room_sid = Column(String, nullable=True)
    participants = Column(JSON, default=list)
    status = Column(String, default="created")  # "created" | "in-progress" | "completed"
    duration = Column(Integer, default=0)
    recording_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)


class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True)  # "call" | "sms" | "video" | "chat" | "system"
    title = Column(String)
    description = Column(Text, default="")
    data = Column(JSON, default=dict)
    severity = Column(String, default="info")  # "info" | "warning" | "error" | "success"
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
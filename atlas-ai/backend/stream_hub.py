"""
Atlas AI — WebSocket Stream Hub
Broadcasts all comm events (calls, SMS, video) to connected chat clients in real-time.
"""

import json
import asyncio
from datetime import datetime
from typing import Any


class StreamHub:
    """Pub/sub hub for real-time comm event broadcasting."""

    def __init__(self):
        self._connections: set = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket):
        async with self._lock:
            self._connections.add(websocket)
        print(f"🔌 WebSocket connected. Total: {len(self._connections)}")

    async def disconnect(self, websocket):
        async with self._lock:
            self._connections.discard(websocket)
        print(f"🔌 WebSocket disconnected. Total: {len(self._connections)}")

    async def broadcast(self, event_type: str, data: dict):
        """Broadcast an event to all connected clients."""
        payload = json.dumps({
            "type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        })

        dead = set()
        async with self._lock:
            connections = set(self._connections)

        for ws in connections:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.add(ws)

        if dead:
            async with self._lock:
                self._connections -= dead

    async def broadcast_call(self, call_data: dict):
        await self.broadcast("call", call_data)

    async def broadcast_sms(self, sms_data: dict):
        await self.broadcast("sms", sms_data)

    async def broadcast_video(self, video_data: dict):
        await self.broadcast("video", video_data)

    async def broadcast_chat(self, chat_data: dict):
        await self.broadcast("chat", chat_data)

    async def broadcast_system(self, message: str, severity: str = "info"):
        await self.broadcast("system", {
            "message": message,
            "severity": severity,
        })

    @property
    def connection_count(self) -> int:
        return len(self._connections)


# Singleton
hub = StreamHub()
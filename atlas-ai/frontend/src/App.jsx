import React, { useState, useEffect, useRef, useCallback } from "react";

const API = "http://127.0.0.1:8765";
const WS_URL = "ws://127.0.0.1:8765/ws/stream";

// ─────────────────────────────────────────────────────────────
//  ICONS (inline SVG — no dependencies)
// ─────────────────────────────────────────────────────────────
const Icon = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Send: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  SMS: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Video: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  Bot: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  User: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Settings: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Menu: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Activity: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Crown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 20h20M4 20l2-8 6 4 6-4 2 8"/><circle cx="12" cy="8" r="2"/></svg>,
  Wifi: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  WifiOff: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  Music: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  Dollar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Chart: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Stop: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
};

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const commColor = (type) => {
  switch (type) {
    case "call": return "#22c55e";
    case "sms": return "#3b82f6";
    case "video": return "#a855f7";
    case "chat": return "#FFD700";
    default: return "#6b7280";
  }
};

const commIcon = (type) => {
  switch (type) {
    case "call": return <Icon.Phone />;
    case "sms": return <Icon.SMS />;
    case "video": return <Icon.Video />;
    default: return <Icon.Activity />;
  }
};

// ─────────────────────────────────────────────────────────────
//  GOAT LOGO COMPONENT
// ─────────────────────────────────────────────────────────────
const GoatLogo = ({ size = 32 }) => (
  <div style={{
    width: size, height: size,
    borderRadius: size * 0.25,
    background: "linear-gradient(135deg, #FFD700, #FF6B35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 12px rgba(255,215,0,0.3)",
  }}>
    <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>🐐</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  TYPING INDICATOR
// ─────────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{ display: "flex", gap: 4, padding: "12px 0", alignItems: "center" }}>
    {[0, 1, 2].map(i => (
      <div key={i} className="typing-dot" style={{
        width: 6, height: 6, borderRadius: "50%",
        background: "#FFD700", opacity: 0.4,
      }} />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
//  MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isStreaming }) => {
  const isUser = msg.role === "user";
  return (
    <div className="message-enter" style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 10,
      padding: "6px 20px",
      alignItems: "flex-start",
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: isUser
          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
          : "linear-gradient(135deg, #FFD700, #FF6B35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, marginTop: 2,
      }}>
        {isUser ? <Icon.User /> : <Icon.Bot />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: "72%",
        background: isUser
          ? "rgba(99,102,241,0.15)"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${isUser ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
        padding: "10px 14px",
      }}>
        <div className="message-content" style={{
          fontSize: 14, lineHeight: 1.6, color: "#e5e7eb",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {msg.content}
          {isStreaming && <span className="cursor-blink" />}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, textAlign: isUser ? "right" : "left" }}>
          {timeAgo(msg.created_at)}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  COMM EVENT CARD
// ─────────────────────────────────────────────────────────────
const CommEventCard = ({ event }) => {
  const color = commColor(event.type);
  return (
    <div style={{
      padding: "10px 12px",
      borderRadius: 10,
      background: "rgba(255,255,255,0.03)",
      border: `1px solid rgba(255,255,255,0.06)`,
      borderLeft: `3px solid ${color}`,
      marginBottom: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ color }}>{commIcon(event.type)}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#e5e7eb" }}>
          {event.data?.contact_name || event.data?.from || event.data?.title || event.type.toUpperCase()}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>
          {timeAgo(event.timestamp)}
        </span>
      </div>
      {(event.data?.body || event.data?.transcription || event.data?.message) && (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
          {(event.data?.body || event.data?.transcription || event.data?.message || "").substring(0, 80)}
          {(event.data?.body || event.data?.transcription || event.data?.message || "").length > 80 ? "..." : ""}
        </p>
      )}
      {event.data?.ai_response && (
        <p style={{ fontSize: 11, color: "#FFD700", marginTop: 4, lineHeight: 1.4 }}>
          🤖 {event.data.ai_response.substring(0, 60)}...
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  DASHBOARD STATS
// ─────────────────────────────────────────────────────────────
const DashboardStats = ({ stats }) => {
  if (!stats) return null;
  const items = [
    { label: "Conversations", value: stats.conversations, icon: <Icon.SMS />, color: "#3b82f6" },
    { label: "Messages", value: stats.messages, icon: <Icon.Activity />, color: "#FFD700" },
    { label: "Calls", value: stats.calls, icon: <Icon.Phone />, color: "#22c55e" },
    { label: "SMS", value: stats.sms, icon: <Icon.SMS />, color: "#a855f7" },
    { label: "Video", value: stats.video_sessions, icon: <Icon.Video />, color: "#f59e0b" },
    { label: "Live WS", value: stats.ws_connections, icon: <Icon.Wifi />, color: "#06b6d4" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: "12px 16px" }}>
      {items.map(item => (
        <div key={item.label} style={{
          padding: "10px 8px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
        }}>
          <div style={{ color: item.color, marginBottom: 4, display: "flex", justifyContent: "center" }}>
            {item.icon}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{item.value ?? 0}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  QUICK PROMPTS
// ─────────────────────────────────────────────────────────────
const quickPrompts = [
  { label: "Royalty Summary", prompt: "Give me a summary of my royalty earnings and top performing tracks.", icon: "💰" },
  { label: "Catalog Analysis", prompt: "Analyze my music catalog and identify the most valuable tracks.", icon: "🎵" },
  { label: "Recent Calls", prompt: "Summarize my recent phone calls and any important messages.", icon: "📞" },
  { label: "Music Trends", prompt: "What are the current trends in hip-hop and R&B music production?", icon: "📈" },
  { label: "Publishing Tips", prompt: "Give me tips on maximizing my music publishing royalties.", icon: "📝" },
  { label: "AI Strategy", prompt: "How can I use AI tools to grow my music career and royalty income?", icon: "🤖" },
];

// ─────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commPanelOpen, setCommPanelOpen] = useState(true);
  const [commEvents, setCommEvents] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "comms" | "dashboard"
  const [backendOnline, setBackendOnline] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [settings, setSettings] = useState({ temperature: 0.8, maxTokens: 200, model: "gpt2-medium" });
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  const abortRef = useRef(null);

  // ── Scroll to bottom ──────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, streamingContent]);

  // ── Check backend health ──────────────────────────────────
  const checkBackend = useCallback(async () => {
    try {
      const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) });
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // ── Load conversations ────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/conversations`);
      if (res.ok) setConversations(await res.json());
    } catch {}
  }, []);

  // ── Load conversation messages ────────────────────────────
  const loadConversation = useCallback(async (convId) => {
    try {
      const res = await fetch(`${API}/api/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setActiveConvId(convId);
      }
    } catch {}
  }, []);

  // ── Load dashboard ────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/dashboard`);
      if (res.ok) setDashboard(await res.json());
    } catch {}
  }, []);

  // ── WebSocket connection ──────────────────────────────────
  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      console.log("🔌 WebSocket connected");
    };

    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === "heartbeat" || event.type === "connected") return;

        setCommEvents(prev => [event, ...prev].slice(0, 100));

        // Flash notification for calls/SMS
        if (event.type === "call" || event.type === "sms") {
          loadDashboard();
        }
      } catch {}
    };

    ws.onclose = () => {
      setWsConnected(false);
      // Reconnect after 3s
      setTimeout(connectWS, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [loadDashboard]);

  // ── Init ──────────────────────────────────────────────────
  useEffect(() => {
    checkBackend();
    loadConversations();
    loadDashboard();
    connectWS();

    const interval = setInterval(() => {
      checkBackend();
      loadConversations();
    }, 10000);

    return () => {
      clearInterval(interval);
      wsRef.current?.close();
    };
  }, [checkBackend, loadConversations, loadDashboard, connectWS]);

  // ── New conversation ──────────────────────────────────────
  const newConversation = useCallback(() => {
    setActiveConvId(null);
    setMessages([]);
    setStreamingContent("");
    inputRef.current?.focus();
  }, []);

  // ── Delete conversation ───────────────────────────────────
  const deleteConversation = useCallback(async (convId, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API}/api/conversations/${convId}`, { method: "DELETE" });
      if (activeConvId === convId) newConversation();
      loadConversations();
    } catch {}
  }, [activeConvId, newConversation, loadConversations]);

  // ── Send message ──────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || isGenerating) return;

    setInput("");
    setIsGenerating(true);
    setStreamingContent("");

    // Add user message immediately
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: msg,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${API}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          conversation_id: activeConvId,
          stream: true,
          max_tokens: settings.maxTokens,
          temperature: settings.temperature,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let convId = activeConvId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              convId = data.conversation_id || convId;
              break;
            }
            if (data.token) {
              fullText += data.token;
              setStreamingContent(fullText);
              if (data.conversation_id && !activeConvId) {
                setActiveConvId(data.conversation_id);
              }
            }
          } catch {}
        }
      }

      // Add final AI message
      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: fullText.trim(),
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setStreamingContent("");

      if (convId) {
        setActiveConvId(convId);
        loadConversations();
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        // Fallback: non-streaming
        try {
          const res = await fetch(`${API}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: msg,
              conversation_id: activeConvId,
              max_tokens: settings.maxTokens,
              temperature: settings.temperature,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setMessages(prev => [...prev, {
              id: Date.now() + 1,
              role: "assistant",
              content: data.response,
              created_at: new Date().toISOString(),
            }]);
            if (data.conversation_id) {
              setActiveConvId(data.conversation_id);
              loadConversations();
            }
          }
        } catch {}
      }
    } finally {
      setIsGenerating(false);
      setStreamingContent("");
      abortRef.current = null;
    }
  }, [input, isGenerating, activeConvId, settings, loadConversations]);

  // ── Stop generation ───────────────────────────────────────
  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    if (streamingContent) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: streamingContent,
        created_at: new Date().toISOString(),
      }]);
      setStreamingContent("");
    }
  }, [streamingContent]);

  // ── Key handler ───────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // ─────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0f", overflow: "hidden" }}>

      {/* ── macOS Title Bar ── */}
      <div className="titlebar">
        <span className="titlebar-title">Atlas AI — GOAT Royalty</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, WebkitAppRegion: "no-drag" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "2px 8px", borderRadius: 10,
            background: backendOnline ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${backendOnline ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: backendOnline ? "#22c55e" : "#ef4444",
            }} />
            <span style={{ fontSize: 10, color: backendOnline ? "#22c55e" : "#ef4444" }}>
              {backendOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            color: wsConnected ? "#22c55e" : "rgba(255,255,255,0.3)",
          }}>
            {wsConnected ? <Icon.Wifi /> : <Icon.WifiOff />}
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── LEFT SIDEBAR ── */}
        {sidebarOpen && (
          <div style={{
            width: 240, flexShrink: 0,
            background: "#050508",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Logo */}
            <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <GoatLogo size={34} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Atlas AI</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>GOAT Royalty</div>
                </div>
              </div>
            </div>

            {/* New Chat Button */}
            <div style={{ padding: "10px 10px 6px" }}>
              <button
                onClick={newConversation}
                style={{
                  width: "100%", padding: "9px 12px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,107,53,0.1))",
                  border: "1px solid rgba(255,215,0,0.2)",
                  color: "#FFD700", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 13, fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                <Icon.Plus />
                New Conversation
              </button>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: "flex", padding: "0 10px 8px", gap: 4 }}>
              {[
                { id: "chat", label: "Chats", icon: <Icon.SMS /> },
                { id: "comms", label: "Comms", icon: <Icon.Activity /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1, padding: "6px 4px",
                    borderRadius: 8,
                    background: activeTab === tab.id ? "rgba(255,215,0,0.1)" : "transparent",
                    border: `1px solid ${activeTab === tab.id ? "rgba(255,215,0,0.2)" : "transparent"}`,
                    color: activeTab === tab.id ? "#FFD700" : "rgba(255,255,255,0.4)",
                    cursor: "pointer", fontSize: 11,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Conversation List / Comm Events */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
              {activeTab === "chat" ? (
                conversations.length === 0 ? (
                  <div style={{ padding: "20px 8px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                    No conversations yet.<br />Start chatting below!
                  </div>
                ) : (
                  conversations.map(conv => (
                    <div
                      key={conv.conversation_id}
                      onClick={() => loadConversation(conv.conversation_id)}
                      style={{
                        padding: "9px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: activeConvId === conv.conversation_id
                          ? "rgba(255,215,0,0.08)"
                          : "transparent",
                        border: `1px solid ${activeConvId === conv.conversation_id ? "rgba(255,215,0,0.15)" : "transparent"}`,
                        marginBottom: 2,
                        display: "flex", alignItems: "center", gap: 8,
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: 500, color: "#e5e7eb",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {conv.title || "Untitled"}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                          {conv.message_count} msgs · {timeAgo(conv.updated_at)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv.conversation_id, e)}
                        style={{
                          padding: 4, borderRadius: 4,
                          background: "transparent", border: "none",
                          color: "rgba(255,255,255,0.2)", cursor: "pointer",
                          opacity: 0, transition: "opacity 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                      >
                        <Icon.Trash />
                      </button>
                    </div>
                  ))
                )
              ) : (
                commEvents.length === 0 ? (
                  <div style={{ padding: "20px 8px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                    No comm events yet.<br />Waiting for calls & SMS...
                  </div>
                ) : (
                  commEvents.map((event, i) => (
                    <CommEventCard key={i} event={event} />
                  ))
                )
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{
              padding: "10px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", gap: 6,
            }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  flex: 1, padding: "8px",
                  borderRadius: 8,
                  background: showSettings ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${showSettings ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.08)"}`,
                  color: showSettings ? "#FFD700" : "rgba(255,255,255,0.5)",
                  cursor: "pointer", fontSize: 11,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                }}
              >
                <Icon.Settings /> Settings
              </button>
              <button
                onClick={() => { loadDashboard(); setActiveTab("dashboard"); }}
                style={{
                  flex: 1, padding: "8px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer", fontSize: 11,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                }}
              >
                <Icon.Chart /> Stats
              </button>
            </div>
          </div>
        )}

        {/* ── MAIN CHAT AREA ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

          {/* Top Bar */}
          <div style={{
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(10,10,15,0.8)", backdropFilter: "blur(10px)",
            flexShrink: 0,
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: 6, borderRadius: 6,
                background: "transparent", border: "none",
                color: "rgba(255,255,255,0.5)", cursor: "pointer",
              }}
            >
              <Icon.Menu />
            </button>

            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>
                {activeConvId
                  ? conversations.find(c => c.conversation_id === activeConvId)?.title || "Conversation"
                  : "New Conversation"}
              </span>
            </div>

            {/* Model badge */}
            <div style={{
              padding: "3px 10px", borderRadius: 20,
              background: "rgba(255,215,0,0.08)",
              border: "1px solid rgba(255,215,0,0.15)",
              fontSize: 11, color: "#FFD700",
            }}>
              🧠 {settings.model}
            </div>

            <button
              onClick={() => setCommPanelOpen(!commPanelOpen)}
              style={{
                padding: "4px 10px", borderRadius: 8,
                background: commPanelOpen ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${commPanelOpen ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
                color: commPanelOpen ? "#22c55e" : "rgba(255,255,255,0.4)",
                cursor: "pointer", fontSize: 11,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Icon.Activity />
              Live Feed
              {commEvents.length > 0 && (
                <span style={{
                  background: "#ef4444", color: "#fff",
                  borderRadius: "50%", width: 16, height: 16,
                  fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {Math.min(commEvents.length, 99)}
                </span>
              )}
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div style={{
              padding: "14px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
              display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Model</label>
                <select
                  value={settings.model}
                  onChange={e => setSettings(s => ({ ...s, model: e.target.value }))}
                  style={{
                    padding: "4px 8px", borderRadius: 6,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", fontSize: 12,
                  }}
                >
                  <option value="gpt2">GPT-2 Small (117M)</option>
                  <option value="gpt2-medium">GPT-2 Medium (345M)</option>
                  <option value="gpt2-large">GPT-2 Large (774M)</option>
                  <option value="gpt2-xl">GPT-2 XL (1.5B)</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  Temperature: {settings.temperature}
                </label>
                <input
                  type="range" min="0.1" max="2.0" step="0.1"
                  value={settings.temperature}
                  onChange={e => setSettings(s => ({ ...s, temperature: parseFloat(e.target.value) }))}
                  style={{ accentColor: "#FFD700", width: 100 }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  Max Tokens: {settings.maxTokens}
                </label>
                <input
                  type="range" min="50" max="500" step="50"
                  value={settings.maxTokens}
                  onChange={e => setSettings(s => ({ ...s, maxTokens: parseInt(e.target.value) }))}
                  style={{ accentColor: "#FFD700", width: 100 }}
                />
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
            {messages.length === 0 && !streamingContent ? (
              /* Welcome Screen */
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                height: "100%", padding: "40px 20px", textAlign: "center",
              }}>
                <GoatLogo size={64} />
                <h1 style={{
                  fontSize: 26, fontWeight: 800, marginTop: 20, marginBottom: 8,
                  background: "linear-gradient(135deg, #FFD700, #FF6B35)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  Atlas AI
                </h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 32, maxWidth: 400, lineHeight: 1.6 }}>
                  Your local AI assistant for GOAT Royalty. Powered by GPT-2 running entirely on your machine — no API keys, no cloud, full privacy.
                </p>

                {!backendOnline && (
                  <div style={{
                    padding: "12px 20px", borderRadius: 12,
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#ef4444", fontSize: 13, marginBottom: 24,
                  }}>
                    ⚠️ Backend offline. Start the Python server first:<br />
                    <code style={{ fontSize: 11, opacity: 0.8 }}>cd backend && python server.py</code>
                  </div>
                )}

                {/* Quick Prompts */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 10, maxWidth: 560, width: "100%",
                }}>
                  {quickPrompts.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(qp.prompt)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e5e7eb", cursor: "pointer",
                        textAlign: "left", fontSize: 12, lineHeight: 1.4,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(255,215,0,0.06)";
                        e.currentTarget.style.borderColor = "rgba(255,215,0,0.15)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{qp.icon}</div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{qp.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.3 }}>
                        {qp.prompt.substring(0, 60)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id || i}
                    msg={msg}
                    isStreaming={false}
                  />
                ))}
                {streamingContent && (
                  <MessageBubble
                    msg={{ role: "assistant", content: streamingContent, created_at: new Date().toISOString() }}
                    isStreaming={true}
                  />
                )}
                {isGenerating && !streamingContent && (
                  <div style={{ padding: "6px 20px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: "linear-gradient(135deg, #FFD700, #FF6B35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon.Bot />
                    </div>
                    <div style={{
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "4px 18px 18px 18px",
                    }}>
                      <TypingIndicator />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,10,15,0.9)",
            backdropFilter: "blur(10px)",
            flexShrink: 0,
          }}>
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14, padding: "10px 14px",
              transition: "border-color 0.2s",
            }}
              onFocus={() => {}}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={backendOnline ? "Message Atlas AI... (Enter to send, Shift+Enter for newline)" : "Start the backend server to chat..."}
                disabled={!backendOnline || isGenerating}
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none",
                  color: "#e5e7eb", fontSize: 14, resize: "none",
                  lineHeight: 1.5, maxHeight: 120, overflowY: "auto",
                  fontFamily: "inherit",
                  opacity: backendOnline ? 1 : 0.5,
                }}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              {isGenerating ? (
                <button
                  onClick={stopGeneration}
                  style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#ef4444", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon.Stop />
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || !backendOnline}
                  style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: input.trim() && backendOnline
                      ? "linear-gradient(135deg, #FFD700, #FF6B35)"
                      : "rgba(255,255,255,0.06)",
                    border: "none",
                    color: input.trim() && backendOnline ? "#000" : "rgba(255,255,255,0.3)",
                    cursor: input.trim() && backendOnline ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <Icon.Send />
                </button>
              )}
            </div>
            <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
              Atlas AI runs locally on your device · No data leaves your machine
            </div>
          </div>
        </div>

        {/* ── RIGHT COMM FEED PANEL ── */}
        {commPanelOpen && (
          <div style={{
            width: 280, flexShrink: 0,
            background: "#050508",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Panel Header */}
            <div style={{
              padding: "12px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: wsConnected ? "#22c55e" : "#ef4444",
              }} className={wsConnected ? "comm-pulse" : ""} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>Live Comm Feed</span>
              <span style={{
                marginLeft: "auto", fontSize: 10,
                color: wsConnected ? "#22c55e" : "#ef4444",
              }}>
                {wsConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {/* Dashboard Stats */}
            {dashboard?.stats && <DashboardStats stats={dashboard.stats} />}

            {/* Comm Events */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
              {commEvents.length === 0 ? (
                <div style={{
                  padding: "30px 10px", textAlign: "center",
                  color: "rgba(255,255,255,0.25)", fontSize: 12, lineHeight: 1.6,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📡</div>
                  Waiting for live events...<br />
                  Calls, SMS, and video sessions<br />
                  will appear here in real-time.
                </div>
              ) : (
                commEvents.map((event, i) => (
                  <CommEventCard key={i} event={event} />
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div style={{
              padding: "10px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8, textAlign: "center" }}>
                GOAT Royalty Integration
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { label: "Royalties", icon: <Icon.Dollar />, color: "#FFD700" },
                  { label: "Catalog", icon: <Icon.Music />, color: "#FF6B35" },
                  { label: "Analytics", icon: <Icon.Chart />, color: "#3b82f6" },
                  { label: "Publishing", icon: <Icon.Crown />, color: "#a855f7" },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => sendMessage(`Show me my ${item.label.toLowerCase()} data`)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: item.color, cursor: "pointer",
                      fontSize: 11, fontWeight: 500,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      transition: "all 0.2s",
                    }}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
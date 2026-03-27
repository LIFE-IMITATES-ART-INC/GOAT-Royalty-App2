/**
 * GOAT Brain Interface - Atlas Brain Style Conversational UI
 * 
 * A conversational interface that turns natural language into executed workflows,
 * combining the AI agent system with the LLM router for a seamless experience.
 * 
 * Features:
 * - Natural language command processing
 * - Real-time workflow execution
 * - Approval checkpoints for high-stakes actions
 * - Performance tracking and reporting
 * - Multi-agent orchestration
 */

import React, { useState, useRef, useEffect } from 'react';
import { getAgentManager } from '../lib/agents';
import { getLLMRouter } from '../lib/llm/LLMRouter';

const GOATBrainInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgents, setActiveAgents] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);
  const [showApprovals, setShowApprovals] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  
  const messagesEndRef = useRef(null);
  const agentManager = useRef(null);
  const llmRouter = useRef(null);

  useEffect(() => {
    // Initialize agent manager and LLM router
    agentManager.current = getAgentManager();
    llmRouter.current = getLLMRouter();
    
    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `🐐 **Welcome to GOAT Brain**

I'm your AI execution engine, ready to turn your intentions into actions.

**What I can do:**
• 🎵 Analyze royalty data and streaming performance
• 💰 Track blockchain royalty payments
• 🎬 Edit videos with effects and transitions
• 🎹 Produce music, mix and master tracks
• 🤖 Automate workflows and run bots
• 💻 Write, review, and optimize code
• 🔍 Research any topic in depth

Just tell me what you need in natural language, and I'll decompose your goal, coordinate the right agents, and execute the workflow.

*Example: "Analyze my Spotify earnings for the last month and suggest optimization strategies"*

**Ready to execute. What would you like to accomplish?**`,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Add to execution log
    setExecutionLog(prev => [...prev, {
      type: 'request',
      message: input,
      timestamp: new Date().toISOString()
    }]);
    
    try {
      // Process through agent manager
      const response = await agentManager.current.chat(input, {
        conversationHistory: messages
      });
      
      // Format the response
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: formatResponse(response),
        agent: response.agent,
        timestamp: new Date().toISOString(),
        raw: response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update active agents
      if (response.agent) {
        setActiveAgents(prev => {
          const newAgents = new Set(prev);
          newAgents.add(response.agent);
          return [...newAgents];
        });
      }
      
      // Add to execution log
      setExecutionLog(prev => [...prev, {
        type: 'response',
        agent: response.agent,
        success: response.success,
        timestamp: new Date().toISOString()
      }]);
      
    } catch (error) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error executing request**\n\n\`${error.message}\`\n\nPlease try again or rephrase your request.`,
        isError: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  const formatResponse = (response) => {
    if (!response.success) {
      return `❌ **Execution Failed**\n\n${response.error || 'Unknown error occurred'}`;
    }
    
    const r = response.response;
    let formatted = `✅ **Execution Complete**\n\n`;
    
    if (r.type) {
      formatted += `**Task Type:** ${r.type}\n\n`;
    }
    
    if (r.summary) {
      formatted += `**Summary:** ${r.summary}\n\n`;
    }
    
    if (r.insights && Array.isArray(r.insights)) {
      formatted += `**Insights:**\n`;
      r.insights.forEach((insight, i) => {
        formatted += `${i + 1}. ${insight}\n`;
      });
      formatted += '\n';
    }
    
    if (r.recommendations && Array.isArray(r.recommendations)) {
      formatted += `**Recommendations:**\n`;
      r.recommendations.forEach((rec, i) => {
        formatted += `${i + 1}. ${rec}\n`;
      });
      formatted += '\n';
    }
    
    if (r.message) {
      formatted += `*${r.message}*\n`;
    }
    
    return formatted;
  };

  const handleQuickAction = async (action) => {
    setInput(action);
    // Auto-submit after a brief delay
    setTimeout(() => {
      const form = document.querySelector('.goat-brain-form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  };

  const quickActions = [
    { label: '📊 Royalty Analysis', action: 'Analyze my royalty earnings across all platforms' },
    { label: '🔍 Research', action: 'Research the latest music streaming trends' },
    { label: '💰 Blockchain Verify', action: 'Verify my royalty payments on the blockchain' },
    { label: '🎵 Generate Beat', action: 'Generate a hip-hop beat at 90 BPM' },
    { label: '🤖 Run Automation', action: 'Run the Spotify playlist scraper bot' },
    { label: '📈 Performance Report', action: 'Generate a monthly performance report' }
  ];

  return (
    <div className="goat-brain-container" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <span style={styles.goatIcon}>🐐</span>
          <h1 style={styles.title}>GOAT Brain</h1>
        </div>
        <div style={styles.status}>
          <span style={styles.statusDot}></span>
          <span>AI Execution Engine Active</span>
        </div>
      </div>

      {/* Agent Status Bar */}
      <div style={styles.agentBar}>
        <span style={styles.agentLabel}>Active Agents:</span>
        {activeAgents.length > 0 ? (
          activeAgents.map(agent => (
            <span key={agent} style={styles.agentTag}>{agent}</span>
          ))
        ) : (
          <span style={styles.agentTagIdle}>Awaiting command...</span>
        )}
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.message,
              ...(message.role === 'user' ? styles.messageUser : styles.messageAssistant)
            }}
          >
            <div style={styles.messageHeader}>
              <span style={styles.messageRole}>
                {message.role === 'user' ? '👤 You' : `🐐 GOAT Brain${message.agent ? ` (${message.agent})` : ''}`}
              </span>
              <span style={styles.messageTime}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div style={styles.messageContent}>
              {message.content.split('\n').map((line, i) => (
                <p key={i} style={styles.messageLine}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={styles.loading}>
            <span>🔄 Executing workflow...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        {quickActions.map((qa, i) => (
          <button
            key={i}
            style={styles.quickActionBtn}
            onClick={() => handleQuickAction(qa.action)}
          >
            {qa.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form className="goat-brain-form" onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me what you need... (e.g., 'Analyze my YouTube revenue trends')"
          style={styles.input}
          disabled={isLoading}
        />
        <button
          type="submit"
          style={styles.submitBtn}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? '⏳' : '🚀'}
        </button>
      </form>

      {/* Execution Log */}
      <div style={styles.logContainer}>
        <details>
          <summary style={styles.logSummary}>📋 Execution Log</summary>
          <div style={styles.logContent}>
            {executionLog.slice(-10).map((log, i) => (
              <div key={i} style={styles.logEntry}>
                <span style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span style={styles.logType}>{log.type}</span>
                <span>{log.message || log.agent || ''}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#0a0a0f',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#12121a',
    borderBottom: '1px solid #2a2a3a'
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  goatIcon: {
    fontSize: '32px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#888'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00ff00',
    animation: 'pulse 2s infinite'
  },
  agentBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#0f0f15',
    borderBottom: '1px solid #2a2a3a'
  },
  agentLabel: {
    fontSize: '12px',
    color: '#666',
    marginRight: '8px'
  },
  agentTag: {
    padding: '4px 12px',
    backgroundColor: '#1a472a',
    color: '#00ff88',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  agentTagIdle: {
    padding: '4px 12px',
    backgroundColor: '#1a1a2a',
    color: '#666',
    borderRadius: '12px',
    fontSize: '12px'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  message: {
    maxWidth: '80%',
    padding: '16px 20px',
    borderRadius: '16px',
    lineHeight: '1.6'
  },
  messageUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#1a1a2a',
    border: '1px solid #2a2a3a'
  },
  messageAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#12121a',
    border: '1px solid #ffd70033'
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '12px',
    color: '#888'
  },
  messageRole: {
    fontWeight: '600',
    color: '#aaa'
  },
  messageTime: {
    color: '#666'
  },
  messageContent: {
    fontSize: '14px',
    whiteSpace: 'pre-wrap'
  },
  messageLine: {
    margin: '4px 0'
  },
  loading: {
    padding: '16px',
    textAlign: 'center',
    color: '#888'
  },
  quickActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#0f0f15'
  },
  quickActionBtn: {
    padding: '8px 16px',
    backgroundColor: '#1a1a2a',
    color: '#ccc',
    border: '1px solid #2a2a3a',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s'
  },
  form: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    backgroundColor: '#12121a',
    borderTop: '1px solid #2a2a3a'
  },
  input: {
    flex: 1,
    padding: '14px 20px',
    backgroundColor: '#0a0a0f',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none'
  },
  submitBtn: {
    padding: '14px 24px',
    backgroundColor: 'linear-gradient(135deg, #ffd700, #ff8c00)',
    backgroundColor: '#ffd700',
    border: 'none',
    borderRadius: '12px',
    fontSize: '20px',
    cursor: 'pointer'
  },
  logContainer: {
    padding: '8px 24px',
    backgroundColor: '#0a0a0f',
    borderTop: '1px solid #2a2a3a'
  },
  logSummary: {
    cursor: 'pointer',
    color: '#666',
    fontSize: '12px'
  },
  logContent: {
    marginTop: '8px',
    maxHeight: '100px',
    overflowY: 'auto',
    fontSize: '11px',
    color: '#888'
  },
  logEntry: {
    display: 'flex',
    gap: '12px',
    padding: '4px 0'
  },
  logTime: {
    color: '#555'
  },
  logType: {
    color: '#ffd700',
    textTransform: 'uppercase'
  }
};

export default GOATBrainInterface;
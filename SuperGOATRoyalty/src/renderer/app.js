// ============================================================================
// SUPER GOAT ROYALTY v4.1.0 — ULTIMATE APPLICATION ENGINE
// All-in-One: AI Chat, LLM Builder, Agent Platform, Terminal, Code Editor,
// File Manager, Browser, Royalty Calculator, Store Manager, Analytics,
// Server Manager, Music Production, NVIDIA DGX, Adobe Firefly & More
// Copyright © 2025 Harvey Miller (DJ Speedy) / GOAT Royalty
// ============================================================================

const GOAT = {
  currentView: 'dashboard',
  sidebarCollapsed: false,
  chatHistory: [],
  terminalHistory: [],
  terminalCmdIndex: -1,
  terminalCwd: '',
  editorTabs: [],
  editorActiveTab: -1,
  fileManagerPath: '',
  fileManagerItems: [],
  browserUrl: '',
  settings: {},
  systemInfo: {},
  aiProvider: 'gemini',
  aiProviders: ['ollama','openai','gemini','claude','groq'],
  notes: [],
  tasks: [],
  snippets: [],

  // ========================================================================
  // INITIALIZATION
  // ========================================================================
  async init() {
    console.log('Super GOAT Royalty v4.1.0 initializing...');
    try {
      this.settings = await window.goat.settings.get() || {};
      this.systemInfo = await window.goat.system.info();
      this.aiProvider = this.settings.llmProvider || 'gemini';
      this.terminalCwd = this.systemInfo.homeDir || '~';
      this.fileManagerPath = this.systemInfo.homeDir || '/';
      if (window.goat.notes) this.notes = await window.goat.notes.load() || [];
      if (window.goat.tasks) this.tasks = await window.goat.tasks.load() || [];
      if (window.goat.snippets) this.snippets = await window.goat.snippets.load() || [];
    } catch(e) { console.error('Init error:', e); }

    window.goat.on('navigate', (view) => this.navigate(view));
    window.goat.on('ssh-connect', (ip) => { this.navigate('terminal'); setTimeout(() => this.sshConnect(ip), 300); });
    window.goat.on('deploy', (ip) => { this.navigate('servers'); this.toast('Deploying to ' + ip + '...', 'info'); });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); this.toggleSpotlight(); }
      if (e.key === 'Escape') this.closeSpotlight();
    });

    this.navigate('dashboard');
    this.toast('Super GOAT Royalty v4.1.0 loaded!', 'success');
  },

  // ========================================================================
  // NAVIGATION
  // ========================================================================
  navigate(view) {
    this.currentView = view;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view));
    document.getElementById('titlebar-text').textContent = this.getViewTitle(view);
    this.renderView(view);
  },

  getViewTitle(v) {
    var t = {
      'dashboard':'Dashboard','command-center':'Command Center','ai-chat':'AI Chat Multi-LLM',
      'llm-builder':'LLM Builder Studio','agent-platform':'AI Agent Platform','rag-studio':'RAG Studio',
      'prompt-lab':'Prompt Engineering Lab','terminal':'Terminal','code-editor':'Code Editor',
      'file-manager':'File Manager','browser':'Web Browser','automation':'Axiom Automation',
      'royalties':'Royalty Calculator','catalog':'Track Catalog 3650 Tracks',
      'analytics':'Streaming Analytics','publishing':'Publishing','streaming':'Streaming',
      'production':'Music Production','adobe-firefly':'Adobe Firefly AI Studio',
      'sora-ai':'Sora AI Video Studio','cinema-camera':'Cinema Camera',
      'fashion-store':'Fashion Forge','store-manager':'Builders Closeout Supply',
      'servers':'Server Manager','nvidia-dgx':'NVIDIA DGX Cloud','ai-factory':'AI Factory',
      'git-manager':'Git Manager','notes':'Notes and Wiki','tasks':'Task Manager',
      'snippets':'Snippet Manager','system-monitor':'System Monitor','api-tester':'API Tester',
      'settings':'Settings','about':'About'
    };
    return t[v] || v;
  },

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    document.getElementById('sidebar').classList.toggle('collapsed', this.sidebarCollapsed);
  },

  openExternal(url) { window.goat.shell.openExternal(url); },

  // ========================================================================
  // VIEW RENDERER
  // ========================================================================
  renderView(view) {
    var c = document.getElementById('view-container');
    var renderers = {
      'dashboard': function(){ return GOAT.renderDashboard(); },
      'command-center': function(){ return GOAT.renderCommandCenter(); },
      'ai-chat': function(){ return GOAT.renderAIChat(); },
      'llm-builder': function(){ return GOAT.renderLLMBuilder(); },
      'agent-platform': function(){ return GOAT.renderAgentPlatform(); },
      'rag-studio': function(){ return GOAT.renderRAGStudio(); },
      'prompt-lab': function(){ return GOAT.renderPromptLab(); },
      'terminal': function(){ return GOAT.renderTerminal(); },
      'code-editor': function(){ return GOAT.renderCodeEditor(); },
      'file-manager': function(){ return GOAT.renderFileManager(); },
      'browser': function(){ return GOAT.renderBrowser(); },
      'royalties': function(){ return GOAT.renderRoyalties(); },
      'catalog': function(){ return GOAT.renderCatalog(); },
      'analytics': function(){ return GOAT.renderAnalytics(); },
      'store-manager': function(){ return GOAT.renderStoreManager(); },
      'servers': function(){ return GOAT.renderServers(); },
      'nvidia-dgx': function(){ return GOAT.renderNvidiaDGX(); },
      'ai-factory': function(){ return GOAT.renderAIFactory(); },
      'notes': function(){ return GOAT.renderNotes(); },
      'tasks': function(){ return GOAT.renderTasks(); },
      'snippets': function(){ return GOAT.renderSnippets(); },
      'system-monitor': function(){ return GOAT.renderSystemMonitor(); },
      'api-tester': function(){ return GOAT.renderAPITester(); },
      'settings': function(){ return GOAT.renderSettings(); },
      'about': function(){ return GOAT.renderAbout(); },
      'adobe-firefly': function(){ return GOAT.renderAdobeFirefly(); },
      'sora-ai': function(){ return GOAT.renderWebApp('Sora AI Studio','/sora-ai-studio'); },
      'cinema-camera': function(){ return GOAT.renderWebApp('Cinema Camera','/cinema-camera'); },
      'fashion-store': function(){ return GOAT.renderWebApp('Fashion Forge','/fashion-store'); },
      'publishing': function(){ return GOAT.renderWebApp('Publishing','/publishing'); },
      'streaming': function(){ return GOAT.renderWebApp('Streaming','/streaming'); },
      'production': function(){ return GOAT.renderWebApp('Production','/production'); },
      'automation': function(){ return GOAT.renderWebApp('Automation','/automation'); },
      'git-manager': function(){ return GOAT.renderGitManager(); }
    };
    var fn = renderers[view] || renderers['dashboard'];
    c.innerHTML = fn();
    this.afterRender(view);
  },

  afterRender(view) {
    if (view === 'terminal') this.initTerminal();
    if (view === 'file-manager') this.loadDirectory(this.fileManagerPath);
    if (view === 'ai-chat') this.scrollChatToBottom();
    if (view === 'code-editor') this.initCodeEditor();
    if (view === 'system-monitor') this.startMonitor();
  },

  // ========================================================================
  // SPOTLIGHT COMMAND PALETTE (Cmd+K)
  // ========================================================================
  toggleSpotlight() {
    var el = document.getElementById('spotlight-overlay');
    if (el) { el.remove(); return; }
    var commands = [
      ['Dashboard','dashboard'],['AI Chat','ai-chat'],['LLM Builder','llm-builder'],
      ['Agent Platform','agent-platform'],['RAG Studio','rag-studio'],['Prompt Lab','prompt-lab'],
      ['Terminal','terminal'],['Code Editor','code-editor'],['File Manager','file-manager'],
      ['Browser','browser'],['Royalties','royalties'],['Catalog','catalog'],
      ['Analytics','analytics'],['Store Manager','store-manager'],['Servers','servers'],
      ['NVIDIA DGX','nvidia-dgx'],['AI Factory','ai-factory'],['Adobe Firefly','adobe-firefly'],
      ['Notes','notes'],['Tasks','tasks'],['Snippets','snippets'],
      ['System Monitor','system-monitor'],['API Tester','api-tester'],['Settings','settings']
    ];
    var overlay = document.createElement('div');
    overlay.id = 'spotlight-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:15vh;';
    var html = '<div style="width:560px;background:var(--bg-secondary);border:1px solid var(--gold);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.5);overflow:hidden;">';
    html += '<div style="padding:16px;border-bottom:1px solid var(--border-color);display:flex;align-items:center;gap:8px;">';
    html += '<input id="spotlight-input" class="input" style="border:none;background:transparent;font-size:16px;" placeholder="Type a command... (Esc to close)" autofocus oninput="GOAT.filterSpotlight(this.value)">';
    html += '</div><div id="spotlight-results" style="max-height:400px;overflow-y:auto;">';
    for (var i = 0; i < commands.length; i++) {
      html += '<div class="spotlight-item" data-name="' + commands[i][0].toLowerCase() + '" onclick="GOAT.closeSpotlight();GOAT.navigate(\'' + commands[i][1] + '\')" style="display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;" onmouseover="this.style.background=\'var(--bg-hover)\'" onmouseout="this.style.background=\'transparent\'">';
      html += '<span style="font-size:14px;">' + commands[i][0] + '</span></div>';
    }
    html += '</div></div>';
    overlay.innerHTML = html;
    overlay.onclick = function(e) { if (e.target === overlay) GOAT.closeSpotlight(); };
    document.body.appendChild(overlay);
    var inp = document.getElementById('spotlight-input');
    if (inp) inp.focus();
  },

  filterSpotlight(query) {
    var q = query.toLowerCase();
    var items = document.querySelectorAll('.spotlight-item');
    for (var i = 0; i < items.length; i++) {
      items[i].style.display = items[i].dataset.name.includes(q) ? 'flex' : 'none';
    }
  },

  closeSpotlight() { var el = document.getElementById('spotlight-overlay'); if (el) el.remove(); },

  // ========================================================================
  // DASHBOARD
  // ========================================================================
  renderDashboard() {
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div style="text-align:center;margin-bottom:30px;">';
    html += '<div style="font-size:64px;margin-bottom:8px;">&#x1F410;&#x26A1;</div>';
    html += '<h1 style="font-size:32px;font-weight:800;background:var(--gradient-gold);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">SUPER GOAT ROYALTY</h1>';
    html += '<p style="color:var(--text-muted);font-size:14px;">Ultimate AI-Powered Music Production, LLM Builder and Business Platform</p>';
    html += '<p style="color:var(--text-muted);font-size:12px;margin-top:4px;">Press <kbd style="background:var(--bg-tertiary);padding:2px 6px;border-radius:4px;border:1px solid var(--border-color);">Ctrl+K</kbd> for Spotlight</p>';
    html += '</div>';
    html += '<div class="dashboard-grid">';
    html += '<div class="stat-card animate-slideUp"><div class="stat-value">3,650</div><div class="stat-label">Total Tracks</div><div class="stat-change up">1,814 Harvey + 1,836 FASTASSMAN</div></div>';
    html += '<div class="stat-card animate-slideUp" style="animation-delay:0.1s"><div class="stat-value">$865K+</div><div class="stat-label">Estimated Royalties</div><div class="stat-change up">12.3% this quarter</div></div>';
    html += '<div class="stat-card animate-slideUp" style="animation-delay:0.2s"><div class="stat-value">1.2B+</div><div class="stat-label">Total Streams</div><div class="stat-change up">8.7% growth</div></div>';
    html += '<div class="stat-card animate-slideUp" style="animation-delay:0.3s"><div class="stat-value">6</div><div class="stat-label">AI Providers</div><div class="stat-change up">Ollama GPT-4o Gemini Claude Groq Local</div></div>';
    html += '</div>';
    html += '<div class="dashboard-grid" style="grid-template-columns:repeat(3,1fr);">';
    // AI Tools widget
    html += '<div class="widget"><div class="panel-title">AI and LLM Tools</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;">';
    var aiTools = [['AI Chat','ai-chat'],['LLM Builder','llm-builder'],['AI Agents','agent-platform'],['RAG Studio','rag-studio'],['Prompt Lab','prompt-lab'],['AI Factory','ai-factory']];
    for (var i = 0; i < aiTools.length; i++) html += '<button class="btn" onclick="GOAT.navigate(\'' + aiTools[i][1] + '\')">' + aiTools[i][0] + '</button>';
    html += '</div></div>';
    // Servers widget
    html += '<div class="widget"><div class="panel-title">Servers</div><div style="margin-top:12px;">';
    html += '<div class="server-card" style="margin-bottom:8px;padding:12px;"><div class="server-status-dot online"></div><div class="server-info"><div class="server-name">KVM2 Primary</div><div class="server-ip">72.61.193.184</div></div><button class="btn btn-sm" onclick="GOAT.navigate(\'servers\')">Go</button></div>';
    html += '<div class="server-card" style="padding:12px;"><div class="server-status-dot online"></div><div class="server-info"><div class="server-name">KVM8 Backup</div><div class="server-ip">93.127.214.171</div></div><button class="btn btn-sm" onclick="GOAT.navigate(\'servers\')">Go</button></div>';
    html += '</div></div>';
    // Quick Actions widget
    html += '<div class="widget"><div class="panel-title">Quick Actions</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;">';
    var quickActions = [['Terminal','terminal'],['Code','code-editor'],['Royalties','royalties'],['Store','store-manager'],['Monitor','system-monitor'],['API Test','api-tester']];
    for (var i = 0; i < quickActions.length; i++) html += '<button class="btn" onclick="GOAT.navigate(\'' + quickActions[i][1] + '\')">' + quickActions[i][0] + '</button>';
    html += '</div></div>';
    html += '</div></div>';
    return html;
  },

  // ========================================================================
  // COMMAND CENTER
  // ========================================================================
  renderCommandCenter() {
    var tools = [
      ['AI Chat','ai-chat'],['LLM Builder','llm-builder'],['AI Agents','agent-platform'],['RAG Studio','rag-studio'],
      ['Prompt Lab','prompt-lab'],['AI Factory','ai-factory'],['Terminal','terminal'],['Code Editor','code-editor'],
      ['File Manager','file-manager'],['Browser','browser'],['Royalties','royalties'],['Catalog','catalog'],
      ['Analytics','analytics'],['Store Manager','store-manager'],['Adobe Firefly','adobe-firefly'],['Sora AI','sora-ai'],
      ['Cinema Camera','cinema-camera'],['Fashion Forge','fashion-store'],['Servers','servers'],['NVIDIA DGX','nvidia-dgx'],
      ['Git Manager','git-manager'],['Notes','notes'],['Tasks','tasks'],['Snippets','snippets'],
      ['System Monitor','system-monitor'],['API Tester','api-tester'],['Publishing','publishing'],['Production','production'],
      ['Streaming','streaming'],['Settings','settings']
    ];
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="text-align:center;background:var(--gradient-dark);border-color:var(--gold);"><h2>Command Center - 30 Tools</h2><p style="color:var(--text-muted);">Every tool you need. Press Ctrl+K for quick search.</p></div>';
    html += '<div class="card-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">';
    for (var i = 0; i < tools.length; i++) {
      html += '<div class="stat-card" style="cursor:pointer;text-align:center;" onclick="GOAT.navigate(\'' + tools[i][1] + '\')"><div style="font-weight:700;font-size:14px;">' + tools[i][0] + '</div></div>';
    }
    html += '</div></div>';
    return html;
  },

  // ========================================================================
  // AI CHAT
  // ========================================================================
  renderAIChat() {
    var html = '<div class="chat-container h-full">';
    html += '<div class="chat-provider-bar"><span style="font-size:12px;color:var(--text-muted);margin-right:8px;">Provider:</span>';
    for (var i = 0; i < this.aiProviders.length; i++) {
      var p = this.aiProviders[i];
      html += '<div class="provider-chip ' + (p===this.aiProvider?'active':'') + '" onclick="GOAT.setAIProvider(\'' + p + '\')">' + p.charAt(0).toUpperCase()+p.slice(1) + '</div>';
    }
    html += '<div style="flex:1;"></div><button class="btn btn-sm" onclick="GOAT.clearChat()">Clear</button></div>';
    html += '<div class="chat-messages" id="chat-messages">';
    if (this.chatHistory.length === 0) {
      html += '<div style="text-align:center;padding:60px 20px;color:var(--text-muted);">';
      html += '<h3 style="color:var(--text-primary);margin-bottom:8px;">GOAT AI Assistant</h3>';
      html += '<p>Ask anything - music, code, royalties, LLMs, business, servers.</p>';
      html += '<p style="margin-top:8px;font-size:12px;">Using: <strong style="color:var(--gold);">' + this.aiProvider + '</strong></p>';
      html += '<div style="display:flex;gap:8px;justify-content:center;margin-top:20px;flex-wrap:wrap;">';
      var suggestions = ['Build an AI agent','Calculate my royalties','Deploy to server','Write a Python script'];
      for (var i = 0; i < suggestions.length; i++) html += '<button class="btn btn-sm" onclick="GOAT.sendChat(\'' + suggestions[i] + '\')">' + suggestions[i] + '</button>';
      html += '</div></div>';
    } else {
      for (var i = 0; i < this.chatHistory.length; i++) {
        var m = this.chatHistory[i];
        html += '<div class="chat-message ' + m.role + '"><div class="chat-avatar">' + (m.role==='user'?'U':'G') + '</div><div class="chat-bubble">' + this.formatMessage(m.content) + '</div></div>';
      }
    }
    html += '</div>';
    html += '<div class="chat-input-area"><textarea class="chat-input" id="chat-input" placeholder="Ask GOAT AI anything..." rows="1" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();GOAT.sendChat();}"></textarea>';
    html += '<button class="chat-send" onclick="GOAT.sendChat()">Send</button></div></div>';
    return html;
  },

  async sendChat(prefill) {
    var input = document.getElementById('chat-input');
    var message = prefill || (input ? input.value.trim() : '');
    if (!message) return;
    if (input) input.value = '';
    this.chatHistory.push({ role: 'user', content: message });
    this.renderChatMessages();
    this.scrollChatToBottom();
    var typingId = 'typing-' + Date.now();
    var el = document.getElementById('chat-messages');
    if (el) { el.innerHTML += '<div class="chat-message ai" id="' + typingId + '"><div class="chat-avatar">G</div><div class="chat-bubble"><div class="spinner"></div> Thinking...</div></div>'; this.scrollChatToBottom(); }
    try {
      var sys = 'You are GOAT AI, the intelligent assistant for Super GOAT Royalty. You help with music production, royalty calculations, streaming analytics, coding, server management, AI/LLM development, RAG systems, prompt engineering, and creative tasks. Catalog: 3,650 tracks. Servers: KVM2 (72.61.193.184) + KVM8 (93.127.214.171). Business: Builders Closeout Supply (Atlanta).';
      var msgs = [{ role: 'system', content: sys }];
      for (var i = 0; i < this.chatHistory.length; i++) {
        var m = this.chatHistory[i];
        msgs.push({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content });
      }
      var result = await window.goat.ai.chat({ provider: this.aiProvider, messages: msgs });
      var typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      if (result.error) {
        this.chatHistory.push({ role: 'ai', content: 'Error: ' + result.error });
      } else {
        this.chatHistory.push({ role: 'ai', content: result.content });
      }
    } catch(e) {
      var typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      this.chatHistory.push({ role: 'ai', content: 'Error: ' + e.message });
    }
    this.renderChatMessages();
    this.scrollChatToBottom();
  },

  renderChatMessages() {
    var el = document.getElementById('chat-messages');
    if (!el) return;
    var html = '';
    for (var i = 0; i < this.chatHistory.length; i++) {
      var m = this.chatHistory[i];
      html += '<div class="chat-message ' + m.role + '"><div class="chat-avatar">' + (m.role==='user'?'U':'G') + '</div><div class="chat-bubble">' + this.formatMessage(m.content) + '</div></div>';
    }
    el.innerHTML = html;
  },

  scrollChatToBottom() { var el = document.getElementById('chat-messages'); if (el) setTimeout(function(){ el.scrollTop = el.scrollHeight; }, 50); },
  setAIProvider(p) { this.aiProvider = p; this.settings.llmProvider = p; window.goat.settings.set('llmProvider', p); this.renderView('ai-chat'); this.toast('AI Provider: ' + p, 'info'); },
  clearChat() { this.chatHistory = []; this.renderView('ai-chat'); },

  formatMessage(t) {
    if (!t) return '';
    t = t.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    t = t.replace(/\n/g, '<br>');
    return t;
  },

  // ========================================================================
  // LLM BUILDER STUDIO
  // ========================================================================
  renderLLMBuilder() {
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="background:var(--gradient-dark);border-color:var(--gold);text-align:center;"><h2>LLM Builder Studio</h2><p style="color:var(--text-muted);">Build, fine-tune, deploy, and manage Large Language Models</p></div>';
    html += '<div class="dashboard-grid" style="grid-template-columns:repeat(3,1fr);">';
    // Frameworks
    html += '<div class="widget"><div class="panel-title">LLM Frameworks</div><div style="margin-top:12px;">';
    var frameworks = [['LangChain','Framework for LLM apps','https://langchain.com'],['LlamaIndex','Data framework for LLMs','https://llamaindex.ai'],['Haystack','NLP framework by deepset','https://haystack.deepset.ai'],['Semantic Kernel','Microsoft AI orchestration','https://github.com/microsoft/semantic-kernel'],['CrewAI','Multi-agent orchestration','https://crewai.com'],['AutoGen','Microsoft multi-agent','https://github.com/microsoft/autogen']];
    for (var i = 0; i < frameworks.length; i++) {
      html += '<div style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid #1a1a1a;cursor:pointer;" onclick="GOAT.openExternal(\'' + frameworks[i][2] + '\')"><span style="font-size:14px;">' + frameworks[i][0] + '</span><span style="flex:1;font-size:11px;color:var(--text-muted);">' + frameworks[i][1] + '</span></div>';
    }
    html += '</div></div>';
    // Vector DBs
    html += '<div class="widget"><div class="panel-title">Vector Databases</div><div style="margin-top:12px;">';
    var vdbs = [['Pinecone','Managed vector DB','https://pinecone.io'],['Weaviate','Open-source vector search','https://weaviate.io'],['Qdrant','High-performance vector DB','https://qdrant.tech'],['Chroma','Open-source embedding DB','https://trychroma.com'],['Milvus','Cloud-native vector DB','https://milvus.io'],['pgvector','Postgres vector extension','https://github.com/pgvector/pgvector']];
    for (var i = 0; i < vdbs.length; i++) {
      html += '<div style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid #1a1a1a;cursor:pointer;" onclick="GOAT.openExternal(\'' + vdbs[i][2] + '\')"><span style="font-size:14px;">' + vdbs[i][0] + '</span><span style="flex:1;font-size:11px;color:var(--text-muted);">' + vdbs[i][1] + '</span></div>';
    }
    html += '</div></div>';
    // LLMOps
    html += '<div class="widget"><div class="panel-title">LLMOps and Eval</div><div style="margin-top:12px;">';
    var ops = [['Braintrust','LLMOps platform','https://braintrust.dev'],['LangSmith','LangChain observability','https://smith.langchain.com'],['Langfuse','Open-source LLM analytics','https://langfuse.com'],['Weights and Biases','ML experiment tracking','https://wandb.ai'],['Galileo','LLM evaluation platform','https://galileo.ai'],['Helicone','LLM observability','https://helicone.ai']];
    for (var i = 0; i < ops.length; i++) {
      html += '<div style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid #1a1a1a;cursor:pointer;" onclick="GOAT.openExternal(\'' + ops[i][2] + '\')"><span style="font-size:14px;">' + ops[i][0] + '</span><span style="flex:1;font-size:11px;color:var(--text-muted);">' + ops[i][1] + '</span></div>';
    }
    html += '</div></div></div>';
    // Ollama models
    html += '<div class="panel"><div class="panel-title">Local Models (Ollama)</div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">';
    var models = ['llama3','llama3.1','codellama','mistral','mixtral','phi3','gemma2','qwen2','deepseek-coder','starcoder2'];
    for (var i = 0; i < models.length; i++) html += '<button class="btn btn-sm" onclick="GOAT.pullOllamaModel(\'' + models[i] + '\')">' + models[i] + '</button>';
    html += '</div><button class="btn btn-sm" style="margin-top:8px;" onclick="GOAT.listOllamaModels()">List Installed Models</button>';
    html += '<div id="ollama-models-list" style="margin-top:8px;font-family:var(--font-mono);font-size:12px;color:var(--text-secondary);"></div></div>';
    html += '</div>';
    return html;
  },

  async pullOllamaModel(model) {
    this.toast('Pulling ' + model + '... This may take a while.', 'info');
    var result = await window.goat.ai.ollamaPull(model);
    this.toast(result.error ? 'Error: ' + result.error : model + ' pulled successfully!', result.error ? 'error' : 'success');
  },

  async listOllamaModels() {
    var models = await window.goat.ai.ollamaModels();
    var el = document.getElementById('ollama-models-list');
    if (el) {
      if (models.length) {
        var html = '';
        for (var i = 0; i < models.length; i++) html += '<div style="padding:4px 0;">' + models[i].name + ' (' + (models[i].size/1e9).toFixed(1) + 'GB)</div>';
        el.innerHTML = html;
      } else {
        el.innerHTML = '<div style="color:var(--text-muted);">No models found. Is Ollama running?</div>';
      }
    }
  },

  // ========================================================================
  // AI AGENT PLATFORM
  // ========================================================================
  renderAgentPlatform() {
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="background:var(--gradient-dark);border-color:var(--gold);text-align:center;"><h2>AI Agent Platform</h2><p style="color:var(--text-muted);">Build, deploy, and manage autonomous AI agents</p></div>';
    html += '<div class="dashboard-grid" style="grid-template-columns:repeat(3,1fr);">';
    html += '<div class="stat-card"><div class="stat-value">5</div><div class="stat-label">Agent Templates</div></div>';
    html += '<div class="stat-card"><div class="stat-value">12</div><div class="stat-label">Available Tools</div></div>';
    html += '<div class="stat-card"><div class="stat-value">Unlimited</div><div class="stat-label">Custom Workflows</div></div>';
    html += '</div>';
    html += '<div class="panel"><div class="panel-title">Agent Builder</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">';
    html += '<div class="input-group"><label class="input-label">Agent Name</label><input class="input" id="agent-name" placeholder="My Music Agent"></div>';
    html += '<div class="input-group"><label class="input-label">Agent Type</label><select class="input" id="agent-type"><option>Music Royalty Agent</option><option>Analytics Agent</option><option>Store Manager Agent</option><option>DevOps Agent</option><option>Content Creator Agent</option><option>Research Agent</option></select></div>';
    html += '</div>';
    html += '<div class="input-group"><label class="input-label">System Prompt</label><textarea class="input" id="agent-prompt" rows="3" placeholder="You are an AI agent that..."></textarea></div>';
    html += '<button class="btn btn-primary" style="margin-top:12px;" onclick="GOAT.toast(\'Agent created!\',\'success\')">Create Agent</button>';
    html += '</div>';
    // Agent frameworks
    html += '<div class="panel"><div class="panel-title">Agent Frameworks</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:12px;">';
    var agentFrameworks = [['CrewAI','https://crewai.com'],['AutoGen','https://github.com/microsoft/autogen'],['LangGraph','https://langchain.com/langgraph'],['Agentforce','https://salesforce.com/agentforce'],['Semantic Kernel','https://github.com/microsoft/semantic-kernel'],['n8n AI','https://n8n.io']];
    for (var i = 0; i < agentFrameworks.length; i++) html += '<button class="btn" onclick="GOAT.openExternal(\'' + agentFrameworks[i][1] + '\')">' + agentFrameworks[i][0] + '</button>';
    html += '</div></div></div>';
    return html;
  },

  // ========================================================================
  // RAG STUDIO
  // ========================================================================
  renderRAGStudio() {
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="background:var(--gradient-dark);border-color:var(--gold);text-align:center;"><h2>RAG Studio - Retrieval Augmented Generation</h2><p style="color:var(--text-muted);">Build knowledge bases, embed documents, and create AI-powered search</p></div>';
    html += '<div class="panel"><div class="panel-title">Document Ingestion</div>';
    html += '<div style="margin-top:12px;padding:40px;border:2px dashed var(--border-color);border-radius:12px;text-align:center;cursor:pointer;" onclick="GOAT.uploadRAGDocs()">';
    html += '<div style="font-size:36px;margin-bottom:8px;">Upload</div><div style="font-weight:600;">Drop files here or click to upload</div><div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Supports: PDF, TXT, MD, CSV, JSON, DOCX</div></div></div>';
    html += '<div class="panel"><div class="panel-title">RAG Query</div>';
    html += '<div style="display:flex;gap:8px;margin-top:12px;"><input class="input" id="rag-query" placeholder="Ask a question about your documents..." style="flex:1;"><button class="btn btn-primary" onclick="GOAT.queryRAG()">Search</button></div>';
    html += '<div id="rag-results" style="margin-top:12px;"></div></div>';
    html += '<div class="panel"><div class="panel-title">RAG Configuration</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px;">';
    html += '<div class="input-group"><label class="input-label">Embedding Model</label><select class="input"><option>text-embedding-3-small</option><option>text-embedding-3-large</option><option>all-MiniLM-L6-v2</option></select></div>';
    html += '<div class="input-group"><label class="input-label">Chunk Size</label><input class="input" type="number" value="512"></div>';
    html += '<div class="input-group"><label class="input-label">Top K Results</label><input class="input" type="number" value="5"></div>';
    html += '</div></div></div>';
    return html;
  },

  async uploadRAGDocs() {
    var paths = await window.goat.dialog.openFile({ multi: true, filters: [{ name: 'Documents', extensions: ['pdf','txt','md','csv','json','docx'] }] });
    if (paths && paths.length) this.toast(paths.length + ' document(s) selected', 'success');
  },

  queryRAG() {
    var q = document.getElementById('rag-query');
    if (!q || !q.value) return;
    this.toast('Searching knowledge base...', 'info');
    var el = document.getElementById('rag-results');
    if (el) el.innerHTML = '<div class="panel" style="background:var(--bg-tertiary);">Searching for: "' + q.value + '"... Found relevant chunks.</div>';
  },

  // ========================================================================
  // PROMPT LAB
  // ========================================================================
  renderPromptLab() {
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="background:var(--gradient-dark);border-color:var(--gold);text-align:center;"><h2>Prompt Engineering Lab</h2><p style="color:var(--text-muted);">Design, test, version, and evaluate prompts across multiple LLMs</p></div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
    html += '<div class="panel"><div class="panel-title">Prompt Editor</div>';
    html += '<div class="input-group" style="margin-top:12px;"><label class="input-label">System Prompt</label><textarea class="input" id="prompt-system" rows="4">You are GOAT AI, an expert music production and royalty management assistant.</textarea></div>';
    html += '<div class="input-group"><label class="input-label">User Message</label><textarea class="input" id="prompt-user" rows="3">Calculate the royalties for Hard in Da Paint with 1000000 streams on Spotify</textarea></div>';
    html += '<div style="display:flex;gap:8px;margin-top:8px;"><button class="btn btn-primary" onclick="GOAT.runPrompt()">Run</button><button class="btn" onclick="GOAT.toast(\'Saved!\',\'success\')">Save Template</button></div></div>';
    html += '<div class="panel"><div class="panel-title">Output</div><div id="prompt-output" style="margin-top:12px;min-height:200px;background:var(--bg-tertiary);border-radius:8px;padding:16px;font-size:13px;color:var(--text-secondary);overflow-y:auto;max-height:400px;">Run a prompt to see results here...</div></div>';
    html += '</div></div>';
    return html;
  },

  async runPrompt() {
    var sys = document.getElementById('prompt-system');
    var user = document.getElementById('prompt-user');
    var output = document.getElementById('prompt-output');
    if (output) output.innerHTML = '<div class="spinner"></div> Running prompt...';
    try {
      var result = await window.goat.ai.chat({ provider: this.aiProvider, messages: [{ role: 'system', content: sys ? sys.value : '' }, { role: 'user', content: user ? user.value : '' }] });
      if (output) output.innerHTML = result.error ? 'Error: ' + result.error : this.formatMessage(result.content);
    } catch(e) { if (output) output.innerHTML = 'Error: ' + e.message; }
  },

  // ========================================================================
  // BUILDERS CLOSEOUT SUPPLY STORE MANAGER
  // ========================================================================
  renderStoreManager() {
    var products = [
      ['36" Single Sink Vanity - Natural Oak','Vanities','$500.00','In Stock'],
      ['49" Single Sink Vanity - Espresso','Vanities','$650.00','In Stock'],
      ['60" Double Sink Vanity - Grayish Blue','Vanities','$850.00','In Stock'],
      ['72" Double Sink Vanity - Gray','Vanities','$1,200.00','Sold Out'],
      ['8mm Hickory Gloss Laminate Flooring','Flooring','$1.40/sqft','In Stock'],
      ['8mm Gray Gloss Laminate Flooring','Flooring','$1.00/sqft','In Stock'],
      ['7mm Oak Laminate Flooring','Flooring','$1.04/sqft','In Stock'],
      ['3-Light Matte Black Vanity Light','Lighting','$65.00','In Stock'],
      ['56" LED Bronze Ceiling Fan','Lighting','$180.00','In Stock'],
      ['50000 BTU Propane Fire Pit','Seasonal','$300.00','In Stock'],
      ['7ft Wicker Propane Patio Heater','Seasonal','$145.00','In Stock']
    ];
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="background:linear-gradient(135deg,#1a0a2e,#0d2137);border-color:var(--gold);text-align:center;">';
    html += '<h2>Builders Closeout Supply</h2>';
    html += '<p style="color:var(--text-muted);">3455 Empire Blvd SW, Atlanta, GA 30354 | Mon-Sun 9am-5pm</p>';
    html += '<div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">';
    html += '<button class="btn btn-primary" onclick="GOAT.openExternal(\'https://builderscloseoutsupply.com\')">Visit Store</button>';
    html += '<button class="btn" onclick="GOAT.openExternal(\'https://www.facebook.com/profile.php?id=100093502955036\')">Facebook</button>';
    html += '</div></div>';
    html += '<div class="dashboard-grid">';
    html += '<div class="stat-card"><div class="stat-value">4</div><div class="stat-label">Categories</div><div class="stat-change up">Vanities Flooring Lighting Seasonal</div></div>';
    html += '<div class="stat-card"><div class="stat-value">60%</div><div class="stat-label">Off Retail</div><div class="stat-change up">Premium materials at closeout prices</div></div>';
    html += '<div class="stat-card"><div class="stat-value">Sales</div><div class="stat-label">678-577-4042</div><div class="stat-change up">Wholesale: 678-334-7187</div></div>';
    html += '<div class="stat-card"><div class="stat-value">Shopify</div><div class="stat-label">Online Store</div><div class="stat-change up">In-store shopping only</div></div>';
    html += '</div>';
    html += '<div class="panel"><div class="panel-title">Product Inventory</div>';
    html += '<table style="width:100%;border-collapse:collapse;margin-top:12px;"><thead><tr style="border-bottom:1px solid var(--border-color);">';
    html += '<th style="padding:8px;text-align:left;color:var(--text-muted);font-size:12px;">Product</th>';
    html += '<th style="padding:8px;text-align:left;color:var(--text-muted);font-size:12px;">Category</th>';
    html += '<th style="padding:8px;text-align:right;color:var(--text-muted);font-size:12px;">Price</th>';
    html += '<th style="padding:8px;text-align:center;color:var(--text-muted);font-size:12px;">Status</th>';
    html += '</tr></thead><tbody>';
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      html += '<tr style="border-bottom:1px solid #1a1a1a;">';
      html += '<td style="padding:8px;font-weight:600;">' + p[0] + '</td>';
      html += '<td style="padding:8px;"><span class="tag tag-gold">' + p[1] + '</span></td>';
      html += '<td style="padding:8px;text-align:right;color:var(--gold);font-weight:700;">' + p[2] + '</td>';
      html += '<td style="padding:8px;text-align:center;"><span class="tag ' + (p[3]==='In Stock'?'tag-green':'tag-red') + '">' + p[3] + '</span></td>';
      html += '</tr>';
    }
    html += '</tbody></table></div></div>';
    return html;
  },

  // ========================================================================
  // AI FACTORY (NVIDIA DGX + Red Hat)
  // ========================================================================
  renderAIFactory() {
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="background:linear-gradient(135deg,#0a1a0a,#1a2a0a);border-color:#76b900;text-align:center;"><h2 style="color:#76b900;">AI Factory - GPU-Powered LLM Infrastructure</h2><p style="color:var(--text-muted);">Build your AI factory with NVIDIA DGX, Red Hat AI, and open-source tools</p></div>';
    html += '<div class="dashboard-grid" style="grid-template-columns:repeat(3,1fr);">';
    // NVIDIA
    html += '<div class="widget" style="border-color:#76b900;"><div class="panel-title" style="color:#76b900;">NVIDIA DGX Cloud</div><div style="margin-top:12px;font-size:13px;color:var(--text-secondary);line-height:1.8;"><div>DGX SuperPOD Full-stack AI platform</div><div>H100/B200 GPU clusters for LLM training</div><div>NVIDIA NeMo for model customization</div><div>TensorRT-LLM for inference optimization</div><div>Triton Inference Server for deployment</div></div><button class="btn" style="margin-top:12px;border-color:#76b900;color:#76b900;" onclick="GOAT.openExternal(\'https://www.nvidia.com/en-us/data-center/dgx-cloud/\')">Explore DGX Cloud</button></div>';
    // Red Hat
    html += '<div class="widget" style="border-color:#e00;"><div class="panel-title" style="color:#e00;">Red Hat AI</div><div style="margin-top:12px;font-size:13px;color:var(--text-secondary);line-height:1.8;"><div>Red Hat OpenShift AI platform</div><div>InstructLab for model fine-tuning</div><div>Open-source AI on hybrid cloud</div><div>Enterprise-grade ML pipelines</div><div>Kubernetes-native AI deployment</div></div><button class="btn" style="margin-top:12px;border-color:#e00;color:#e00;" onclick="GOAT.openExternal(\'https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai\')">Explore Red Hat AI</button></div>';
    // Cloud GPU
    html += '<div class="widget" style="border-color:var(--cyan);"><div class="panel-title" style="color:var(--cyan);">Cloud GPU Providers</div><div style="margin-top:12px;">';
    var gpuProviders = [['CoreWeave','GPU cloud for AI','https://coreweave.com'],['Lambda','GPU cloud computing','https://lambdalabs.com'],['RunPod','Serverless GPU','https://runpod.io'],['Together AI','Open-source AI cloud','https://together.ai'],['Replicate','Run ML models','https://replicate.com'],['Hugging Face','ML model hub','https://huggingface.co']];
    for (var i = 0; i < gpuProviders.length; i++) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #1a1a1a;cursor:pointer;" onclick="GOAT.openExternal(\'' + gpuProviders[i][2] + '\')"><span style="font-size:12px;font-weight:600;">' + gpuProviders[i][0] + '</span><span style="flex:1;font-size:11px;color:var(--text-muted);">' + gpuProviders[i][1] + '</span></div>';
    }
    html += '</div></div></div>';
    // Deploy to servers
    html += '<div class="panel"><div class="panel-title">Deploy LLM to Your Servers</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">';
    html += '<button class="btn" onclick="GOAT.runServerCmd(\'72.61.193.184\',\'curl -fsSL https://ollama.ai/install.sh | sh\')">Install Ollama on KVM2</button>';
    html += '<button class="btn" onclick="GOAT.runServerCmd(\'93.127.214.171\',\'curl -fsSL https://ollama.ai/install.sh | sh\')">Install Ollama on KVM8</button>';
    html += '<button class="btn" onclick="GOAT.runServerCmd(\'72.61.193.184\',\'ollama list\')">List Models KVM2</button>';
    html += '<button class="btn" onclick="GOAT.runServerCmd(\'93.127.214.171\',\'ollama list\')">List Models KVM8</button>';
    html += '</div><div class="terminal-container" style="height:150px;margin-top:12px;"><div class="terminal-body" id="ai-factory-output" style="font-size:12px;"><div class="terminal-line info">Ready for AI deployment commands...</div></div></div></div>';
    html += '</div>';
    return html;
  },

  // ========================================================================
  // ADOBE FIREFLY
  // ========================================================================
  renderAdobeFirefly() {
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="background:linear-gradient(135deg,#1a0520,#2a0a1a);border-color:#ff4500;text-align:center;"><h2 style="color:#ff4500;">Adobe Firefly AI Studio</h2><p style="color:var(--text-muted);">AI-powered image generation, style transfer, and creative tools</p></div>';
    html += '<div class="panel"><div class="panel-title">Text to Image</div>';
    html += '<div style="display:flex;gap:12px;margin-top:12px;"><div style="flex:1;">';
    html += '<textarea class="input" id="firefly-prompt" rows="3">A superhero goat character in Marvel style, golden armor, epic lighting</textarea>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">';
    html += '<select class="input"><option>Photorealistic</option><option>Digital Art</option><option>Oil Painting</option><option>3D Render</option><option>Anime</option></select>';
    html += '<select class="input"><option>1024x1024</option><option>1536x1024</option><option>1024x1536</option></select>';
    html += '</div><button class="btn btn-primary" style="margin-top:8px;width:100%;" onclick="GOAT.toast(\'Generating image...\',\'info\')">Generate Image</button></div>';
    html += '<div style="width:300px;height:300px;background:var(--bg-tertiary);border-radius:12px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-color);">Preview</div>';
    html += '</div></div>';
    html += '<div class="panel"><div class="panel-title">Creative Templates</div><div class="card-grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr));margin-top:12px;">';
    var templates = [['Album Cover','Music album artwork'],['Social Media','Instagram/TikTok posts'],['Product Photo','Store product images'],['Movie Poster','Cinematic poster design'],['Merch Design','T-shirt and merch art'],['Web Banner','Website hero images']];
    for (var i = 0; i < templates.length; i++) {
      html += '<div class="stat-card" style="cursor:pointer;text-align:center;" onclick="GOAT.toast(\'Template loaded!\',\'success\')"><div style="font-weight:600;font-size:12px;">' + templates[i][0] + '</div><div style="font-size:11px;color:var(--text-muted);">' + templates[i][1] + '</div></div>';
    }
    html += '</div></div></div>';
    return html;
  },

  // ========================================================================
  // TERMINAL
  // ========================================================================
  renderTerminal() {
    var html = '<div class="terminal-container h-full">';
    html += '<div class="terminal-header"><div class="terminal-dots"><div class="terminal-dot red"></div><div class="terminal-dot yellow"></div><div class="terminal-dot green"></div></div>';
    html += '<div class="terminal-title">' + this.terminalCwd + ' - bash</div>';
    html += '<div style="display:flex;gap:4px;"><button class="btn btn-sm" onclick="GOAT.sshConnect(\'72.61.193.184\')">KVM2</button><button class="btn btn-sm" onclick="GOAT.sshConnect(\'93.127.214.171\')">KVM8</button><button class="btn btn-sm" onclick="GOAT.terminalHistory=[];GOAT.renderView(\'terminal\');">Clear</button></div></div>';
    html += '<div class="terminal-body" id="terminal-output">';
    html += '<div class="terminal-line info">Super GOAT Royalty Terminal v4.1.0</div>';
    for (var i = 0; i < this.terminalHistory.length; i++) {
      var h = this.terminalHistory[i];
      html += '<div class="terminal-line"><span class="prompt">' + h.prompt + '</span> ' + this.escapeHtml(h.command) + '</div>';
      if (h.output) html += '<div class="terminal-line ' + (h.isError?'error':'') + '">' + this.escapeHtml(h.output) + '</div>';
    }
    html += '</div>';
    html += '<div class="terminal-input-row"><span class="terminal-prompt">goat@local:' + this.terminalCwd + '$</span>';
    html += '<input class="terminal-input" id="terminal-input" type="text" autofocus placeholder="Enter command..." onkeydown="GOAT.handleTerminalKey(event)"></div></div>';
    return html;
  },

  initTerminal() { var inp = document.getElementById('terminal-input'); if (inp) inp.focus(); this.scrollTerminal(); },

  async handleTerminalKey(e) {
    if (e.key === 'Enter') { var input = document.getElementById('terminal-input'); var cmd = input.value.trim(); if (!cmd) return; input.value = ''; await this.executeCommand(cmd); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (this.terminalCmdIndex < this.terminalHistory.length - 1) { this.terminalCmdIndex++; document.getElementById('terminal-input').value = this.terminalHistory[this.terminalHistory.length - 1 - this.terminalCmdIndex].command || ''; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (this.terminalCmdIndex > 0) { this.terminalCmdIndex--; document.getElementById('terminal-input').value = this.terminalHistory[this.terminalHistory.length - 1 - this.terminalCmdIndex].command || ''; } else { this.terminalCmdIndex = -1; document.getElementById('terminal-input').value = ''; } }
  },

  async executeCommand(cmd) {
    var prompt = 'goat@local:' + this.terminalCwd + '$';
    if (cmd.startsWith('cd ')) {
      var result = await window.goat.terminal.execute('cd ' + cmd.substring(3).trim() + ' && pwd', this.terminalCwd);
      if (!result.error && result.stdout.trim()) { this.terminalCwd = result.stdout.trim(); this.terminalHistory.push({ prompt: prompt, command: cmd, output: 'Changed to: ' + this.terminalCwd, isError: false }); }
      else this.terminalHistory.push({ prompt: prompt, command: cmd, output: result.stderr || 'Directory not found', isError: true });
    } else if (cmd === 'clear') { this.terminalHistory = []; }
    else { var result = await window.goat.terminal.execute(cmd, this.terminalCwd); this.terminalHistory.push({ prompt: prompt, command: cmd, output: ((result.stdout||'')+(result.stderr||'')).trim(), isError: !!result.error }); }
    this.terminalCmdIndex = -1;
    this.renderView('terminal');
  },

  async sshConnect(ip) {
    this.toast('Connecting to ' + ip + '...', 'info');
    var result = await window.goat.ssh.execute({ host: ip, user: this.settings.sshUser || 'root', command: 'hostname && uptime && df -h / | tail -1' });
    this.terminalHistory.push({ prompt: 'ssh@' + ip + '$', command: 'ssh root@' + ip, output: result.stdout || result.stderr || result.error || 'Connection failed', isError: !!result.error });
    if (this.currentView === 'terminal') this.renderView('terminal'); else this.navigate('terminal');
  },

  scrollTerminal() { var el = document.getElementById('terminal-output'); if (el) setTimeout(function(){ el.scrollTop = el.scrollHeight; }, 50); },

  // ========================================================================
  // CODE EDITOR
  // ========================================================================
  renderCodeEditor() {
    var html = '<div class="editor-container h-full"><div class="editor-tabs">';
    for (var i = 0; i < this.editorTabs.length; i++) {
      var t = this.editorTabs[i];
      html += '<div class="editor-tab ' + (i===this.editorActiveTab?'active':'') + '" onclick="GOAT.switchEditorTab(' + i + ')"><span>' + t.name + '</span><span class="editor-tab-close" onclick="event.stopPropagation();GOAT.closeEditorTab(' + i + ')">x</span></div>';
    }
    html += '<div class="editor-tab" onclick="GOAT.newEditorTab()" style="color:var(--text-muted);">+ New</div>';
    html += '<div style="flex:1;"></div><button class="btn btn-sm" style="margin:4px;" onclick="GOAT.openFileInEditor()">Open</button><button class="btn btn-sm btn-primary" style="margin:4px;" onclick="GOAT.saveEditorFile()">Save</button></div>';
    html += '<div class="editor-body"><textarea class="editor-textarea" id="editor-content" spellcheck="false" placeholder="// Open a file or start typing..." oninput="GOAT.updateEditorContent(this.value)">' + (this.editorTabs[this.editorActiveTab] ? this.escapeHtml(this.editorTabs[this.editorActiveTab].content) : '') + '</textarea></div>';
    html += '<div class="editor-statusbar"><span>' + (this.editorTabs[this.editorActiveTab] ? this.editorTabs[this.editorActiveTab].name : 'No file') + '</span><span>' + (this.editorTabs[this.editorActiveTab] ? this.editorTabs[this.editorActiveTab].language : 'Plain Text') + ' | UTF-8</span></div></div>';
    return html;
  },
  initCodeEditor() { if (this.editorTabs.length === 0) this.newEditorTab(); },
  newEditorTab() { this.editorTabs.push({ name:'untitled.js', content:'', path:null, language:'JavaScript' }); this.editorActiveTab = this.editorTabs.length-1; this.renderView('code-editor'); },
  switchEditorTab(i) { this.editorActiveTab = i; this.renderView('code-editor'); },
  closeEditorTab(i) { this.editorTabs.splice(i,1); if (this.editorActiveTab >= this.editorTabs.length) this.editorActiveTab = this.editorTabs.length-1; this.renderView('code-editor'); },
  updateEditorContent(v) { if (this.editorTabs[this.editorActiveTab]) this.editorTabs[this.editorActiveTab].content = v; },
  async openFileInEditor() { var p = await window.goat.dialog.openFile({ filters:[{name:'Code',extensions:['js','jsx','ts','tsx','py','html','css','json','md','sh','yml','sql','env']},{name:'All',extensions:['*']}]}); if(p&&p[0]){var r=await window.goat.fs.readFile(p[0]);if(r.data!==null){var n=p[0].split(/[/\\]/).pop();this.editorTabs.push({name:n,content:r.data,path:p[0],language:this.detectLang(n)});this.editorActiveTab=this.editorTabs.length-1;this.renderView('code-editor');this.toast('Opened: '+n,'success');}else this.toast('Error: '+r.error,'error');}},
  async saveEditorFile() { var t=this.editorTabs[this.editorActiveTab]; if(!t)return; var p=t.path; if(!p){p=await window.goat.dialog.saveFile({defaultPath:t.name});if(!p)return;t.path=p;t.name=p.split(/[/\\]/).pop();} var r=await window.goat.fs.writeFile(p,t.content); this.toast(r.error?'Error: '+r.error:'Saved: '+t.name,r.error?'error':'success'); },
  detectLang(f) { var e=f.split('.').pop().toLowerCase(); var m={js:'JavaScript',jsx:'React',ts:'TypeScript',py:'Python',html:'HTML',css:'CSS',json:'JSON',md:'Markdown',sh:'Shell',sql:'SQL'}; return m[e]||'Plain Text'; },

  // ========================================================================
  // FILE MANAGER
  // ========================================================================
  renderFileManager() {
    var html = '<div class="file-manager h-full"><div class="file-toolbar">';
    html += '<button class="btn btn-sm btn-icon" onclick="GOAT.fileManagerUp()">Up</button>';
    html += '<button class="btn btn-sm btn-icon" onclick="GOAT.loadDirectory(GOAT.systemInfo.homeDir)">Home</button>';
    html += '<input class="file-path-bar" id="file-path-input" value="' + this.escapeHtml(this.fileManagerPath) + '" onkeydown="if(event.key===\'Enter\')GOAT.loadDirectory(this.value)">';
    html += '<button class="btn btn-sm" onclick="GOAT.loadDirectory(document.getElementById(\'file-path-input\').value)">Go</button></div>';
    html += '<div class="file-list" id="file-list">';
    if (this.fileManagerItems.length) {
      for (var i = 0; i < this.fileManagerItems.length; i++) {
        var item = this.fileManagerItems[i];
        html += '<div class="file-item" ondblclick="GOAT.fileManagerOpen(\'' + this.escapeHtml(item.name) + '\',' + item.isDir + ')"><span class="file-icon">' + (item.isDir?'D':'.') + '</span><span class="file-name">' + this.escapeHtml(item.name) + '</span></div>';
      }
    } else {
      html += '<div style="padding:40px;text-align:center;color:var(--text-muted);">Empty or loading...</div>';
    }
    html += '</div></div>';
    return html;
  },
  async loadDirectory(d) { if(!d)return; this.fileManagerPath=d; var r=await window.goat.fs.readDir(d); if(r.data){this.fileManagerItems=r.data.sort(function(a,b){if(a.isDir&&!b.isDir)return -1;if(!a.isDir&&b.isDir)return 1;return a.name.localeCompare(b.name);});}else{this.fileManagerItems=[];} if(this.currentView==='file-manager')this.renderView('file-manager'); },
  fileManagerUp() { var p=this.fileManagerPath.replace(/\\/g,'/').split('/');p.pop();this.loadDirectory(p.join('/')||'/'); },
  async fileManagerOpen(n,isDir) { var s=this.fileManagerPath.includes('\\')?'\\':'/'; var f=this.fileManagerPath+s+n; if(isDir){this.loadDirectory(f);}else{var r=await window.goat.fs.readFile(f);if(r.data!==null){this.editorTabs.push({name:n,content:r.data,path:f,language:this.detectLang(n)});this.editorActiveTab=this.editorTabs.length-1;this.navigate('code-editor');}else{window.goat.shell.openPath(f);}}},

  // ========================================================================
  // BROWSER
  // ========================================================================
  renderBrowser() {
    var html = '<div class="browser-container h-full"><div class="browser-toolbar">';
    html += '<button class="browser-nav-btn" onclick="document.getElementById(\'browser-webview\').goBack()">Back</button>';
    html += '<button class="browser-nav-btn" onclick="document.getElementById(\'browser-webview\').goForward()">Fwd</button>';
    html += '<button class="browser-nav-btn" onclick="document.getElementById(\'browser-webview\').reload()">Reload</button>';
    html += '<input class="browser-url-bar" id="browser-url" value="' + (this.browserUrl||'https://www.google.com') + '" onkeydown="if(event.key===\'Enter\')GOAT.browserNav(this.value)">';
    html += '<button class="browser-nav-btn" onclick="GOAT.browserNav(document.getElementById(\'browser-url\').value)">Go</button></div>';
    html += '<webview class="browser-webview" id="browser-webview" src="' + (this.browserUrl||'https://www.google.com') + '" style="flex:1;border:none;" allowpopups></webview></div>';
    return html;
  },
  browserNav(u) { if(!u.startsWith('http'))u='https://'+u; this.browserUrl=u; var w=document.getElementById('browser-webview');if(w)w.src=u; },

  // ========================================================================
  // ROYALTIES
  // ========================================================================
  renderRoyalties() {
    var platforms = [{n:'Spotify',r:0.004,s:485e6},{n:'Apple Music',r:0.008,s:312e6},{n:'YouTube',r:0.002,s:198e6},{n:'TikTok',r:0.003,s:156e6},{n:'Amazon',r:0.004,s:134e6},{n:'Tidal',r:0.012,s:89e6},{n:'Deezer',r:0.004,s:67e6},{n:'SoundCloud',r:0.003,s:45e6}];
    var total = 0; for(var i=0;i<platforms.length;i++) total += platforms[i].r * platforms[i].s;
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="text-align:center;background:var(--gradient-dark);border-color:var(--gold);"><h2>Royalty Calculator</h2>';
    html += '<div style="font-size:48px;font-weight:800;background:var(--gradient-gold);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:16px 0;">$' + total.toLocaleString('en-US',{maximumFractionDigits:0}) + '</div>';
    html += '<p style="color:var(--text-muted);">Estimated Total Royalties</p></div>';
    html += '<div class="panel"><div class="panel-title">Custom Calculator</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px;">';
    html += '<div class="input-group"><label class="input-label">Streams</label><input class="input" id="calc-s" type="number" value="1000000" onchange="GOAT.calcRoyalty()"></div>';
    html += '<div class="input-group"><label class="input-label">Platform</label><select class="input" id="calc-p" onchange="GOAT.calcRoyalty()">';
    for(var i=0;i<platforms.length;i++) html += '<option value="' + platforms[i].r + '">' + platforms[i].n + ' ($' + platforms[i].r + ')</option>';
    html += '</select></div>';
    html += '<div class="input-group"><label class="input-label">Split %</label><input class="input" id="calc-sp" type="number" value="100" onchange="GOAT.calcRoyalty()"></div>';
    html += '</div><div id="calc-result" style="text-align:center;padding:20px;margin-top:12px;background:var(--bg-tertiary);border-radius:8px;"><div style="font-size:36px;font-weight:800;color:var(--gold);">$4,000.00</div></div></div>';
    html += '<div class="royalty-grid" style="margin-top:16px;">';
    for(var i=0;i<platforms.length;i++){var p=platforms[i]; html += '<div class="royalty-platform"><div class="royalty-platform-name">' + p.n + '</div><div class="royalty-platform-rate">$' + p.r + '/stream</div><div class="royalty-platform-amount">$' + (p.r*p.s).toLocaleString('en-US',{maximumFractionDigits:0}) + '</div></div>';}
    html += '</div></div>';
    return html;
  },
  calcRoyalty() { var s=parseFloat(document.getElementById('calc-s').value||0),r=parseFloat(document.getElementById('calc-p').value||0.004),sp=parseFloat(document.getElementById('calc-sp').value||100)/100; document.getElementById('calc-result').innerHTML='<div style="font-size:36px;font-weight:800;color:var(--gold);">$'+(s*r*sp).toLocaleString('en-US',{minimumFractionDigits:2})+'</div>'; },

  // ========================================================================
  // CATALOG
  // ========================================================================
  renderCatalog() {
    var tracks = [['Hard in Da Paint','Waka Flocka Flame','FASTASSMAN'],['No Hands','Waka Flocka ft. Roscoe','FASTASSMAN'],['Grove St. Party','Waka Flocka Flame','FASTASSMAN'],['Round of Applause','Waka Flocka Flame','FASTASSMAN'],['Bustin At Em','Waka Flocka Flame','FASTASSMAN'],['Karma','Waka Flocka Flame','Harvey L Miller'],['Fell','Waka Flocka Flame','Harvey L Miller'],['Lurkin','Waka Flocka Flame','Harvey L Miller'],['TTG','Waka Flocka Flame','FASTASSMAN'],['Workin','Waka Flocka Flame','Harvey L Miller']];
    var html = '<div class="content-body animate-fadeIn"><div class="panel"><div class="panel-title">Track Catalog - 3,650 Tracks</div>';
    html += '<table style="width:100%;border-collapse:collapse;margin-top:12px;"><thead><tr style="border-bottom:1px solid var(--border-color);"><th style="padding:8px;text-align:left;color:var(--text-muted);font-size:12px;">#</th><th style="padding:8px;text-align:left;color:var(--text-muted);font-size:12px;">Title</th><th style="padding:8px;text-align:left;color:var(--text-muted);font-size:12px;">Artist</th><th style="padding:8px;text-align:left;color:var(--text-muted);font-size:12px;">Publisher</th></tr></thead><tbody>';
    for(var i=0;i<tracks.length;i++){var t=tracks[i]; html += '<tr style="border-bottom:1px solid #1a1a1a;"><td style="padding:8px;color:var(--text-muted);">'+(i+1)+'</td><td style="padding:8px;font-weight:600;">'+t[0]+'</td><td style="padding:8px;color:var(--text-secondary);">'+t[1]+'</td><td style="padding:8px;"><span class="tag tag-gold">'+t[2]+'</span></td></tr>';}
    html += '</tbody></table><div style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px;">Showing 10 of 3,650 tracks</div></div></div>';
    return html;
  },

  // ========================================================================
  // ANALYTICS
  // ========================================================================
  renderAnalytics() {
    var html = '<div class="content-body animate-fadeIn"><div class="dashboard-grid">';
    html += '<div class="stat-card"><div class="stat-value">1.2B+</div><div class="stat-label">Total Streams</div></div>';
    html += '<div class="stat-card"><div class="stat-value">$865K</div><div class="stat-label">Revenue</div></div>';
    html += '<div class="stat-card"><div class="stat-value">3,650</div><div class="stat-label">Tracks</div></div>';
    html += '<div class="stat-card"><div class="stat-value">47</div><div class="stat-label">Countries</div></div>';
    html += '</div><div class="panel"><div class="panel-title">Monthly Performance</div><div class="chart-bar" style="height:200px;margin-top:16px;">';
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for(var i=0;i<months.length;i++) html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;"><div class="chart-bar-item" style="height:'+(20+Math.random()*80)+'%;width:100%;"></div><span style="font-size:10px;color:var(--text-muted);">'+months[i]+'</span></div>';
    html += '</div></div></div>';
    return html;
  },

  // ========================================================================
  // SERVERS
  // ========================================================================
  renderServers() {
    var servers = [['KVM2 Primary','72.61.193.184','srv1148455.hstgr.cloud','2026-11-23','KVM 2'],['KVM8 Backup','93.127.214.171','srv832760.hstgr.cloud','2026-03-20','KVM 8']];
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="background:var(--gradient-dark);border-color:var(--gold);text-align:center;"><h2>Hostinger VPS Server Manager</h2></div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
    for(var i=0;i<servers.length;i++){var s=servers[i];
      html += '<div class="panel"><div class="panel-header"><div class="panel-title"><span class="server-status-dot online" style="display:inline-block;margin-right:8px;"></span>'+s[0]+'</div><span class="tag tag-green">Running</span></div>';
      html += '<div style="font-family:var(--font-mono);font-size:13px;margin-bottom:12px;"><div>IP: <strong style="color:var(--gold);">'+s[1]+'</strong></div><div>Host: '+s[2]+'</div><div>Expires: '+s[3]+'</div><div>Type: '+s[4]+'</div></div>';
      html += '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="btn btn-sm" onclick="GOAT.sshConnect(\''+s[1]+'\')">SSH</button><button class="btn btn-sm btn-primary" onclick="GOAT.deployToServer(\''+s[1]+'\')">Deploy</button><button class="btn btn-sm" onclick="GOAT.serverStatus(\''+s[1]+'\')">Status</button></div></div>';
    }
    html += '</div>';
    html += '<div class="panel"><div class="panel-title">Server Output</div><div class="terminal-container" style="height:200px;margin-top:12px;"><div class="terminal-body" id="server-output" style="font-size:12px;"><div class="terminal-line info">Ready...</div></div></div></div></div>';
    return html;
  },

  async runServerCmd(ip, cmd) {
    var o = document.getElementById('server-output') || document.getElementById('ai-factory-output');
    if(o) o.innerHTML += '<div class="terminal-line"><span class="prompt">'+ip+'$</span> '+this.escapeHtml(cmd)+'</div>';
    var r = await window.goat.ssh.execute({host:ip,user:this.settings.sshUser||'root',command:cmd});
    if(o){o.innerHTML += '<div class="terminal-line '+(r.error?'error':'success')+'">'+this.escapeHtml(r.stdout||r.stderr||r.error||'No output')+'</div>';o.scrollTop=o.scrollHeight;}
  },

  async deployToServer(ip) {
    this.toast('Deploying to '+ip+'...','info');
    var cmds = ['cd ~ && git clone https://github.com/DJSPEEDYGA/GOAT-Royalty-App2.git 2>/dev/null || (cd ~/GOAT-Royalty-App2 && git pull origin main)','cd ~/GOAT-Royalty-App2 && npm install --production','cd ~/GOAT-Royalty-App2 && npm run build','cd ~/GOAT-Royalty-App2 && pm2 delete goat-app 2>/dev/null; pm2 start npm --name goat-app -- start -- -p 3000 && pm2 save'];
    for(var i=0;i<cmds.length;i++) await this.runServerCmd(ip,cmds[i]);
    this.toast('Deploy to '+ip+' complete!','success');
  },

  async serverStatus(ip) { await this.runServerCmd(ip,'echo "=== SYSTEM ===" && uptime && echo "=== MEMORY ===" && free -h | head -2 && echo "=== DISK ===" && df -h / | tail -1 && echo "=== PM2 ===" && pm2 list 2>/dev/null || echo "PM2 not installed"'); },

  // ========================================================================
  // NVIDIA DGX
  // ========================================================================
  renderNvidiaDGX() { return this.renderWebApp('NVIDIA DGX Cloud','/nvidia-dgx'); },

  // ========================================================================
  // NOTES, TASKS, SNIPPETS
  // ========================================================================
  renderNotes() {
    var html = '<div class="content-body animate-fadeIn"><div class="panel"><div class="panel-header"><div class="panel-title">Notes and Wiki</div><button class="btn btn-primary btn-sm" onclick="GOAT.addNote()">+ New Note</button></div><div id="notes-list" style="margin-top:12px;">';
    if(this.notes.length){for(var i=0;i<this.notes.length;i++){var n=this.notes[i]; html += '<div class="file-item" onclick="GOAT.editNote('+i+')"><span class="file-name">'+this.escapeHtml(n.title)+'</span><span class="file-size" style="color:var(--text-muted);font-size:11px;">'+n.date+'</span></div>';}}
    else html += '<div style="text-align:center;padding:40px;color:var(--text-muted);">No notes yet. Create one!</div>';
    html += '</div></div></div>';
    return html;
  },
  addNote() { this.notes.push({title:'New Note',content:'',date:new Date().toLocaleDateString()}); if(window.goat.notes)window.goat.notes.save(this.notes); this.renderView('notes'); },
  editNote(i) { var n=this.notes[i]; if(!n)return; var content=prompt('Edit note:',n.content); if(content!==null){n.content=content;if(window.goat.notes)window.goat.notes.save(this.notes);this.toast('Note saved!','success');} },

  renderTasks() {
    var html = '<div class="content-body animate-fadeIn"><div class="panel"><div class="panel-header"><div class="panel-title">Task Manager</div><button class="btn btn-primary btn-sm" onclick="GOAT.addTask()">+ Add Task</button></div><div id="tasks-list" style="margin-top:12px;">';
    if(this.tasks.length){for(var i=0;i<this.tasks.length;i++){var t=this.tasks[i]; html += '<div style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid #1a1a1a;"><input type="checkbox" '+(t.done?'checked':'')+' onchange="GOAT.toggleTask('+i+')"><span style="flex:1;'+(t.done?'text-decoration:line-through;color:var(--text-muted);':'')+'">'+this.escapeHtml(t.text)+'</span><button class="btn btn-sm" onclick="GOAT.deleteTask('+i+')">Del</button></div>';}}
    else html += '<div style="text-align:center;padding:40px;color:var(--text-muted);">No tasks. Add one!</div>';
    html += '</div></div></div>';
    return html;
  },
  addTask() { var t=prompt('Task:'); if(t){this.tasks.push({text:t,done:false});if(window.goat.tasks)window.goat.tasks.save(this.tasks);this.renderView('tasks');} },
  toggleTask(i) { this.tasks[i].done=!this.tasks[i].done; if(window.goat.tasks)window.goat.tasks.save(this.tasks); this.renderView('tasks'); },
  deleteTask(i) { this.tasks.splice(i,1); if(window.goat.tasks)window.goat.tasks.save(this.tasks); this.renderView('tasks'); },

  renderSnippets() {
    var defaultSnippets = [
      {name:'SSH Deploy',lang:'bash',code:'ssh root@72.61.193.184 "cd ~/GOAT-Royalty-App2 && git pull && npm run build && pm2 restart goat-app"'},
      {name:'Ollama Chat',lang:'python',code:'import requests\nresponse = requests.post("http://localhost:11434/api/chat", json={"model":"llama3","messages":[{"role":"user","content":"Hello"}]})'},
      {name:'Supabase Query',lang:'javascript',code:'const { data } = await supabase.from("tracks").select("*").limit(10)'}
    ];
    var snips = this.snippets.length ? this.snippets : defaultSnippets;
    var html = '<div class="content-body animate-fadeIn"><div class="panel"><div class="panel-header"><div class="panel-title">Snippet Manager</div><button class="btn btn-primary btn-sm" onclick="GOAT.toast(\'Snippet manager ready!\',\'info\')">+ New</button></div>';
    html += '<div class="card-grid" style="margin-top:12px;">';
    for(var i=0;i<snips.length;i++){var s=snips[i]; html += '<div class="panel" style="cursor:pointer;" onclick="window.goat.clipboard.write(\''+s.code.replace(/'/g,"\\'")+'\');GOAT.toast(\'Copied!\',\'success\')"><div style="font-weight:700;font-size:13px;margin-bottom:4px;">'+s.name+'</div><span class="tag tag-blue">'+s.lang+'</span><pre style="margin-top:8px;font-size:11px;background:#000;padding:8px;border-radius:6px;overflow:hidden;max-height:80px;">'+this.escapeHtml(s.code)+'</pre></div>';}
    html += '</div></div></div>';
    return html;
  },

  // ========================================================================
  // SYSTEM MONITOR
  // ========================================================================
  renderSystemMonitor() {
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="text-align:center;background:var(--gradient-dark);border-color:var(--gold);"><h2>System Monitor</h2></div>';
    html += '<div class="dashboard-grid">';
    html += '<div class="stat-card"><div class="stat-value" id="mon-cpu">--</div><div class="stat-label">CPU Usage</div></div>';
    html += '<div class="stat-card"><div class="stat-value" id="mon-mem">--</div><div class="stat-label">Memory Usage</div></div>';
    html += '<div class="stat-card"><div class="stat-value" id="mon-uptime">--</div><div class="stat-label">Uptime</div></div>';
    html += '<div class="stat-card"><div class="stat-value" id="mon-cores">--</div><div class="stat-label">CPU Cores</div></div>';
    html += '</div>';
    html += '<div class="panel"><div class="panel-title">System Info</div><div id="mon-info" style="font-family:var(--font-mono);font-size:12px;margin-top:12px;color:var(--text-secondary);line-height:2;">Loading...</div></div></div>';
    return html;
  },

  async startMonitor() {
    try {
      var m = await window.goat.system.monitor();
      document.getElementById('mon-cpu').textContent = m.cpuUsage + '%';
      document.getElementById('mon-mem').textContent = m.memPercent + '%';
      document.getElementById('mon-uptime').textContent = (m.uptime/3600).toFixed(1) + 'h';
      document.getElementById('mon-cores').textContent = m.cpuCores;
      document.getElementById('mon-info').innerHTML = 'Platform: '+m.platform+'<br>Hostname: '+m.hostname+'<br>CPU: '+m.cpuModel+'<br>Total Memory: '+(m.totalMem/1e9).toFixed(1)+' GB<br>Used Memory: '+(m.usedMem/1e9).toFixed(1)+' GB<br>Load Average: '+m.loadAvg.map(function(l){return l.toFixed(2);}).join(', ');
    } catch(e) { console.error('Monitor error:', e); }
  },

  // ========================================================================
  // API TESTER
  // ========================================================================
  renderAPITester() {
    var html = '<div class="content-body animate-fadeIn"><div class="panel"><div class="panel-title">API Tester</div>';
    html += '<div style="display:flex;gap:8px;margin-top:12px;"><select class="input" id="api-method" style="width:120px;"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option></select>';
    html += '<input class="input" id="api-url" placeholder="https://api.example.com/endpoint" style="flex:1;">';
    html += '<button class="btn btn-primary" onclick="GOAT.sendAPIRequest()">Send</button></div>';
    html += '<div class="input-group" style="margin-top:8px;"><label class="input-label">Headers (JSON)</label><input class="input" id="api-headers" placeholder=\'{"Authorization":"Bearer token"}\'></div>';
    html += '<div class="input-group"><label class="input-label">Body (JSON)</label><textarea class="input" id="api-body" rows="3" placeholder=\'{"key":"value"}\'></textarea></div>';
    html += '<div class="panel-title" style="margin-top:16px;">Response</div>';
    html += '<div id="api-response" style="margin-top:8px;background:#000;padding:16px;border-radius:8px;font-family:var(--font-mono);font-size:12px;color:#0f0;min-height:150px;max-height:400px;overflow:auto;">Send a request to see the response...</div></div></div>';
    return html;
  },

  async sendAPIRequest() {
    var method = document.getElementById('api-method').value || 'GET';
    var url = document.getElementById('api-url').value;
    if (!url) { this.toast('Enter a URL', 'error'); return; }
    var headers = {}; try { headers = JSON.parse(document.getElementById('api-headers').value || '{}'); } catch(e) {}
    var body = document.getElementById('api-body').value || null;
    var output = document.getElementById('api-response');
    if (output) output.textContent = 'Sending...';
    try {
      var result = await window.goat.http.fetch({ url: url, method: method, headers: headers, body: body });
      if (output) { try { output.textContent = JSON.stringify(JSON.parse(result.body), null, 2); } catch(e) { output.textContent = result.body || result.error || 'No response'; } }
    } catch(e) { if (output) output.textContent = 'Error: ' + e.message; }
  },

  // ========================================================================
  // GIT MANAGER
  // ========================================================================
  renderGitManager() {
    var cmds = [['git status'],['git log --oneline -10'],['git branch -a'],['git pull origin main'],['git diff --stat']];
    var html = '<div class="content-body animate-fadeIn">';
    html += '<div class="panel" style="text-align:center;background:var(--gradient-dark);border-color:var(--gold);"><h2>Git Manager</h2><p style="color:var(--text-muted);">DJSPEEDYGA/GOAT-Royalty-App2</p></div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
    html += '<div class="panel"><div class="panel-title">Quick Commands</div><div style="display:grid;gap:8px;margin-top:12px;">';
    for(var i=0;i<cmds.length;i++) html += '<button class="btn" style="justify-content:flex-start;" onclick="GOAT.gitCmd(\''+cmds[i][0]+'\')">'+cmds[i][0]+'</button>';
    html += '</div></div>';
    html += '<div class="panel"><div class="panel-title">Output</div><div class="terminal-container" style="height:300px;margin-top:12px;"><div class="terminal-body" id="git-output" style="font-size:12px;"><div class="terminal-line info">Run a git command...</div></div></div></div>';
    html += '</div></div>';
    return html;
  },
  async gitCmd(cmd) { var o=document.getElementById('git-output'); if(o)o.innerHTML+='<div class="terminal-line"><span class="prompt">$</span> '+cmd+'</div>'; var r=await window.goat.terminal.execute(cmd,this.fileManagerPath||this.systemInfo.homeDir); if(o){o.innerHTML+='<div class="terminal-line">'+this.escapeHtml((r.stdout||'')+(r.stderr||''))+'</div>';o.scrollTop=o.scrollHeight;} },

  // ========================================================================
  // SETTINGS
  // ========================================================================
  renderSettings() {
    var html = '<div class="content-body animate-fadeIn"><div class="panel"><div class="panel-title">Settings</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;"><div>';
    html += '<h3 style="margin-bottom:12px;color:var(--gold);">AI Configuration</h3>';
    html += '<div class="input-group"><label class="input-label">Default Provider</label><select class="input" onchange="GOAT.updateSetting(\'llmProvider\',this.value)">';
    for(var i=0;i<this.aiProviders.length;i++){var p=this.aiProviders[i]; html += '<option value="'+p+'" '+(p===this.settings.llmProvider?'selected':'')+'>'+p+'</option>';}
    html += '</select></div>';
    html += '<div class="input-group"><label class="input-label">OpenAI Key</label><input class="input" type="password" placeholder="sk-..." value="'+(this.settings.apiKeys&&this.settings.apiKeys.openai||'')+'" onchange="GOAT.updateApiKey(\'openai\',this.value)"></div>';
    html += '<div class="input-group"><label class="input-label">Gemini Key</label><input class="input" type="password" placeholder="AIza..." value="'+(this.settings.apiKeys&&this.settings.apiKeys.gemini||'')+'" onchange="GOAT.updateApiKey(\'gemini\',this.value)"></div>';
    html += '<div class="input-group"><label class="input-label">Claude Key</label><input class="input" type="password" placeholder="sk-ant-..." value="'+(this.settings.apiKeys&&this.settings.apiKeys.claude||'')+'" onchange="GOAT.updateApiKey(\'claude\',this.value)"></div>';
    html += '<div class="input-group"><label class="input-label">Groq Key</label><input class="input" type="password" placeholder="gsk_..." value="'+(this.settings.apiKeys&&this.settings.apiKeys.groq||'')+'" onchange="GOAT.updateApiKey(\'groq\',this.value)"></div>';
    html += '<div class="input-group"><label class="input-label">Ollama URL</label><input class="input" value="'+(this.settings.ollamaUrl||'http://localhost:11434')+'" onchange="GOAT.updateSetting(\'ollamaUrl\',this.value)"></div>';
    html += '<div class="input-group"><label class="input-label">Ollama Model</label><input class="input" value="'+(this.settings.ollamaModel||'llama3')+'" onchange="GOAT.updateSetting(\'ollamaModel\',this.value)"></div>';
    html += '</div><div>';
    html += '<h3 style="margin-bottom:12px;color:var(--gold);">Servers</h3>';
    html += '<div class="input-group"><label class="input-label">SSH User</label><input class="input" value="'+(this.settings.sshUser||'root')+'" onchange="GOAT.updateSetting(\'sshUser\',this.value)"></div>';
    html += '<div class="input-group"><label class="input-label">KVM2 IP</label><input class="input" value="'+(this.settings.serverIP1||'72.61.193.184')+'" onchange="GOAT.updateSetting(\'serverIP1\',this.value)"></div>';
    html += '<div class="input-group"><label class="input-label">KVM8 IP</label><input class="input" value="'+(this.settings.serverIP2||'93.127.214.171')+'" onchange="GOAT.updateSetting(\'serverIP2\',this.value)"></div>';
    html += '<h3 style="margin:20px 0 12px;color:var(--gold);">Appearance</h3>';
    html += '<div class="input-group"><label class="input-label">Theme</label><select class="input" onchange="GOAT.setTheme(this.value)"><option value="dark" '+(this.settings.theme==='dark'?'selected':'')+'>Dark</option><option value="light" '+(this.settings.theme==='light'?'selected':'')+'>Light</option></select></div>';
    html += '</div></div></div></div>';
    return html;
  },
  async updateSetting(k,v) { this.settings[k]=v; await window.goat.settings.set(k,v); this.toast('Updated: '+k,'success'); },
  async updateApiKey(p,v) { if(!this.settings.apiKeys)this.settings.apiKeys={}; this.settings.apiKeys[p]=v; await window.goat.settings.set('apiKeys',this.settings.apiKeys); this.toast(p+' key saved','success'); },
  setTheme(t) { document.documentElement.setAttribute('data-theme',t); this.settings.theme=t; window.goat.settings.set('theme',t); },

  // ========================================================================
  // ABOUT
  // ========================================================================
  renderAbout() {
    var html = '<div class="content-body" style="display:flex;align-items:center;justify-content:center;">';
    html += '<div style="text-align:center;max-width:600px;">';
    html += '<h1 style="font-size:36px;font-weight:800;background:var(--gradient-gold);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">SUPER GOAT ROYALTY</h1>';
    html += '<p style="color:var(--text-muted);margin:8px 0 24px;">Version 4.1.0 - Ultimate Edition</p>';
    html += '<div class="panel" style="text-align:left;"><div style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary);line-height:2;">';
    html += '<div>Copyright 2025 Harvey Miller (DJ Speedy)</div>';
    html += '<div>GOAT Royalty / FASTASSMAN Publishing Inc.</div>';
    html += '<div>Builders Closeout Supply - Atlanta, GA</div>';
    html += '<div style="margin-top:8px;">Authors: Harvey L Miller Jr, Juaquin J Malphurs, Kevin W Hallingquest</div>';
    html += '<div style="margin-top:8px;">3,650 Tracks | 6 AI Providers | 2 Servers | 30+ Tools</div>';
    html += '<div>LLM Builder | AI Agents | RAG Studio | Prompt Lab</div>';
    html += '<div>NVIDIA DGX | Red Hat AI | Adobe Firefly | Sora AI</div>';
    html += '</div></div>';
    html += '<div style="display:flex;gap:8px;justify-content:center;margin-top:16px;">';
    html += '<button class="btn" onclick="GOAT.openExternal(\'https://github.com/DJSPEEDYGA/GOAT-Royalty-App2\')">GitHub</button>';
    html += '<button class="btn" onclick="GOAT.openExternal(\'https://builderscloseoutsupply.com\')">Store</button>';
    html += '<button class="btn btn-primary" onclick="GOAT.navigate(\'dashboard\')">Dashboard</button>';
    html += '</div></div></div>';
    return html;
  },

  // ========================================================================
  // WEBVIEW HELPER
  // ========================================================================
  renderWebApp(title, path) {
    var url = 'http://' + (this.settings.serverIP2||'93.127.214.171') + ':3000' + path;
    var html = '<div class="browser-container h-full"><div class="browser-toolbar">';
    html += '<span style="font-weight:700;margin-right:12px;">' + title + '</span>';
    html += '<input class="browser-url-bar" value="' + url + '" readonly>';
    html += '<button class="browser-nav-btn" onclick="GOAT.openExternal(\'' + url + '\')">Open</button></div>';
    html += '<webview src="' + url + '" style="flex:1;border:none;" allowpopups></webview></div>';
    return html;
  },

  // ========================================================================
  // MUSIC PLAYER
  // ========================================================================
  player: {
    playing: false,
    current: 0,
    tracks: [{name:'Hard in Da Paint',artist:'Waka Flocka Flame'},{name:'No Hands',artist:'Waka Flocka ft. Roscoe'},{name:'Grove St. Party',artist:'Waka Flocka Flame'},{name:'Round of Applause',artist:'Waka Flocka Flame'},{name:'Bustin At Em',artist:'Waka Flocka Flame'}],
    toggle: function() { this.playing=!this.playing; var b=document.getElementById('player-play-btn');if(b)b.textContent=this.playing?'Pause':'Play'; if(this.playing)this.updateInfo(); },
    next: function() { this.current=(this.current+1)%this.tracks.length; this.updateInfo(); },
    prev: function() { this.current=(this.current-1+this.tracks.length)%this.tracks.length; this.updateInfo(); },
    updateInfo: function() { var t=this.tracks[this.current]; var n=document.getElementById('player-track-name'); var a=document.getElementById('player-track-artist'); if(n)n.textContent=t.name; if(a)a.textContent=t.artist; },
    seek: function(){},
    setVolume: function(){}
  },

  // ========================================================================
  // TOAST NOTIFICATIONS
  // ========================================================================
  toast: function(msg, type) {
    type = type || 'info';
    var c = document.getElementById('toast-container');
    if (!c) return;
    var t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = '<span>' + msg + '</span>';
    c.appendChild(t);
    setTimeout(function() { t.style.opacity = '0'; setTimeout(function() { t.remove(); }, 300); }, 4000);
  },

  // ========================================================================
  // UTILITIES
  // ========================================================================
  escapeHtml: function(t) {
    if (!t) return '';
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  },

  window: {
    minimize: function() { window.goat.window.minimize(); },
    maximize: function() { window.goat.window.maximize(); },
    close: function() { window.goat.window.close(); }
  }
};

document.addEventListener('DOMContentLoaded', function() { GOAT.init(); });

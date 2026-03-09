// SuperNinja AI - Renderer Application Logic
// Handles UI, chat, tools, and AI integration

// ============================================================
// STATE MANAGEMENT
// ============================================================

const state = {
  chats: [],
  currentChatId: null,
  messages: [],
  isProcessing: false,
  attachedFiles: [],
  sidebarOpen: true,
  toolPanelOpen: false,
  currentTool: null,
  settings: {},
  terminalHistory: [],
  terminalOutput: ''
};

// ============================================================
// INITIALIZATION
// ============================================================

async function init() {
  state.settings = await window.superNinja.getSettings();
  
  // Apply theme
  document.documentElement.setAttribute('data-theme', state.settings.theme || 'dark');
  
  // Load saved chats
  loadChats();
  
  // Set up event listeners from main process
  setupMainProcessListeners();
  
  // Load settings into UI
  loadSettingsUI();
  
  // Focus input
  document.getElementById('message-input').focus();
  
  console.log('SuperNinja AI initialized');
}

function setupMainProcessListeners() {
  window.superNinja.on('new-chat', () => newChat());
  window.superNinja.on('save-chat', () => saveCurrentChat());
  window.superNinja.on('open-settings', (tab) => openSettings(tab));
  window.superNinja.on('open-tool', (tool) => openTool(tool));
  window.superNinja.on('toggle-sidebar', () => toggleSidebar());
  window.superNinja.on('theme-changed', (theme) => setTheme(theme));
  window.superNinja.on('ai-provider-changed', (provider) => {
    state.settings.aiProvider = provider;
  });
  window.superNinja.on('files-opened', (filePaths) => {
    filePaths.forEach(fp => addAttachedFile(fp));
  });
}

function loadSettingsUI() {
  const s = state.settings;
  if (s.openaiKey) document.getElementById('openaiKeyInput').value = s.openaiKey;
  if (s.googleKey) document.getElementById('googleKeyInput').value = s.googleKey;
  if (s.anthropicKey) document.getElementById('anthropicKeyInput').value = s.anthropicKey;
  if (s.ollamaUrl) document.getElementById('ollamaUrlInput').value = s.ollamaUrl;
  if (s.theme) document.getElementById('themeSelect').value = s.theme;
  if (s.spotifyClientId) document.getElementById('spotifyIdInput').value = s.spotifyClientId;
  if (s.supabaseUrl) document.getElementById('supabaseUrlInput').value = s.supabaseUrl;
}

// ============================================================
// CHAT MANAGEMENT
// ============================================================

function newChat() {
  const chatId = 'chat_' + Date.now();
  const chat = {
    id: chatId,
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    model: document.getElementById('modelSelector').value
  };
  
  state.chats.unshift(chat);
  state.currentChatId = chatId;
  state.messages = [];
  
  renderChatHistory();
  clearChatArea();
  showWelcomeScreen();
  saveChats();
  
  document.getElementById('message-input').focus();
}

function loadChats() {
  try {
    const saved = localStorage.getItem('superninja_chats');
    if (saved) {
      state.chats = JSON.parse(saved);
    }
  } catch (e) {
    state.chats = [];
  }
  renderChatHistory();
}

function saveChats() {
  try {
    localStorage.setItem('superninja_chats', JSON.stringify(state.chats));
  } catch (e) {
    console.error('Failed to save chats:', e);
  }
}

function saveCurrentChat() {
  if (!state.currentChatId) return;
  const chat = state.chats.find(c => c.id === state.currentChatId);
  if (chat) {
    chat.messages = [...state.messages];
    saveChats();
  }
}

function selectChat(chatId) {
  saveCurrentChat();
  
  state.currentChatId = chatId;
  const chat = state.chats.find(c => c.id === chatId);
  if (chat) {
    state.messages = chat.messages || [];
    renderMessages();
    renderChatHistory();
  }
}

function deleteChat(chatId, event) {
  event.stopPropagation();
  state.chats = state.chats.filter(c => c.id !== chatId);
  if (state.currentChatId === chatId) {
    state.currentChatId = null;
    state.messages = [];
    clearChatArea();
    showWelcomeScreen();
  }
  renderChatHistory();
  saveChats();
}

function renderChatHistory() {
  const container = document.getElementById('chatHistory');
  container.innerHTML = state.chats.map(chat => `
    <div class="chat-item ${chat.id === state.currentChatId ? 'active' : ''}" onclick="selectChat('${chat.id}')">
      <span class="chat-icon">&#128172;</span>
      <div style="flex:1;min-width:0">
        <div class="chat-title">${escapeHtml(chat.title)}</div>
        <div class="chat-date">${formatDate(chat.createdAt)}</div>
      </div>
      <button onclick="deleteChat('${chat.id}', event)" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;padding:4px" title="Delete">&times;</button>
    </div>
  `).join('');
}

// ============================================================
// MESSAGE HANDLING
// ============================================================

async function sendMessage() {
  const input = document.getElementById('message-input');
  const text = input.value.trim();
  if (!text || state.isProcessing) return;

  // Hide welcome screen
  hideWelcomeScreen();

  // Ensure we have a chat
  if (!state.currentChatId) {
    newChat();
    hideWelcomeScreen();
  }

  // Add user message
  const userMessage = {
    role: 'user',
    content: text,
    timestamp: new Date().toISOString(),
    files: [...state.attachedFiles]
  };
  state.messages.push(userMessage);
  renderMessage(userMessage);

  // Update chat title from first message
  const chat = state.chats.find(c => c.id === state.currentChatId);
  if (chat && chat.title === 'New Chat') {
    chat.title = text.substring(0, 50) + (text.length > 50 ? '...' : '');
    renderChatHistory();
  }

  // Clear input
  input.value = '';
  autoResize(input);
  clearAttachedFiles();

  // Show typing indicator
  state.isProcessing = true;
  updateSendButton();
  showTypingIndicator();

  try {
    // Get AI response
    const response = await getAIResponse(state.messages);
    
    // Remove typing indicator
    removeTypingIndicator();

    // Add assistant message
    const assistantMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      model: document.getElementById('modelSelector').value
    };
    state.messages.push(assistantMessage);
    renderMessage(assistantMessage);

    // Check for tool calls in response
    await processToolCalls(response);

  } catch (error) {
    removeTypingIndicator();
    const errorMessage = {
      role: 'assistant',
      content: `**Error:** ${error.message}\n\nPlease check your API key in Settings and try again.`,
      timestamp: new Date().toISOString(),
      isError: true
    };
    state.messages.push(errorMessage);
    renderMessage(errorMessage);
  }

  state.isProcessing = false;
  updateSendButton();
  saveCurrentChat();
  scrollToBottom();
}

function quickAction(text) {
  document.getElementById('message-input').value = text;
  sendMessage();
}

// ============================================================
// AI PROVIDER INTEGRATION
// ============================================================

async function getAIResponse(messages) {
  const model = document.getElementById('modelSelector').value;
  const settings = state.settings;

  // Determine provider from model
  if (model.startsWith('gpt') || model.startsWith('o1')) {
    return await callOpenAI(messages, model, settings.openaiKey);
  } else if (model.startsWith('gemini')) {
    return await callGemini(messages, model, settings.googleKey);
  } else if (model.startsWith('claude')) {
    return await callAnthropic(messages, model, settings.anthropicKey);
  } else if (model.startsWith('ollama')) {
    return await callOllama(messages, model, settings.ollamaUrl || 'http://localhost:11434');
  }

  throw new Error('Unknown model: ' + model);
}

async function callOpenAI(messages, model, apiKey) {
  if (!apiKey) throw new Error('OpenAI API key not configured. Go to Settings to add it.');

  const systemPrompt = getSystemPrompt();
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: apiMessages,
      max_tokens: 4096,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(messages, model, apiKey) {
  if (!apiKey) throw new Error('Google AI API key not configured. Go to Settings to add it.');

  const systemPrompt = getSystemPrompt();
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: contents,
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.7
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callAnthropic(messages, model, apiKey) {
  if (!apiKey) throw new Error('Anthropic API key not configured. Go to Settings to add it.');

  const systemPrompt = getSystemPrompt();
  const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: model.replace('claude-3.5-sonnet', 'claude-3-5-sonnet-20241022').replace('claude-3-opus', 'claude-3-opus-20240229'),
      system: systemPrompt,
      messages: apiMessages,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callOllama(messages, model, baseUrl) {
  const modelName = model.replace('ollama-', '');
  const systemPrompt = getSystemPrompt();

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}. Make sure Ollama is running at ${baseUrl}`);
  }

  const data = await response.json();
  return data.message.content;
}

function getSystemPrompt() {
  return `You are SuperNinja AI, an autonomous AI desktop assistant built for Harvey Miller (DJ Speedy) and the GOAT Royalty App ecosystem.

You are a full-spectrum assistant capable of:
- Writing and debugging code in any language
- Executing terminal commands (user will confirm)
- Analyzing files (PDF, CSV, JSON, images, audio)
- Web research and data extraction
- Music production assistance and royalty calculations
- Data analysis with visualizations
- Image generation and editing guidance
- System administration

When the user asks you to run a command, format it as:
\`\`\`terminal
command here
\`\`\`

When writing code, always specify the language:
\`\`\`javascript
// code here
\`\`\`

Be concise, helpful, and proactive. Suggest next steps when appropriate.
Format responses with Markdown for readability.
You have access to the local file system and terminal through the desktop app tools.`;
}

// ============================================================
// TOOL CALLS PROCESSING
// ============================================================

async function processToolCalls(response) {
  // Detect terminal commands in response
  const terminalRegex = /```terminal\n([\s\S]*?)```/g;
  let match;
  
  while ((match = terminalRegex.exec(response)) !== null) {
    const command = match[1].trim();
    if (command) {
      // Auto-execute safe commands, prompt for others
      const isSafe = isSafeCommand(command);
      if (isSafe) {
        await executeTerminalCommand(command);
      }
    }
  }
}

function isSafeCommand(command) {
  const safeCommands = ['ls', 'pwd', 'whoami', 'date', 'uptime', 'df', 'free', 'cat', 'head', 'tail', 'wc', 'echo', 'node -v', 'npm -v', 'python3 --version', 'git status', 'git log'];
  return safeCommands.some(safe => command.startsWith(safe));
}

// ============================================================
// TOOL PANELS
// ============================================================

function openTool(toolName) {
  state.currentTool = toolName;
  const panel = document.getElementById('toolPanel');
  const title = document.getElementById('toolPanelTitle');
  const content = document.getElementById('toolPanelContent');

  const tools = {
    terminal: { title: '&#9000; Terminal', render: renderTerminal },
    filemanager: { title: '&#128193; File Manager', render: renderFileManager },
    codeeditor: { title: '&#128187; Code Editor', render: renderCodeEditor },
    webbrowser: { title: '&#127760; Web Browser', render: renderWebBrowser },
    imagetools: { title: '&#127912; Image Tools', render: renderImageTools },
    audiotools: { title: '&#127925; Audio Tools', render: renderAudioTools },
    pdftools: { title: '&#128196; PDF Tools', render: renderPDFTools },
    dataanalysis: { title: '&#128202; Data Analysis', render: renderDataAnalysis },
    musicprod: { title: '&#127925; Music Production', render: renderMusicProd },
    royaltycalc: { title: '&#128176; Royalty Calculator', render: renderRoyaltyCalc },
    axiom: { title: '&#129302; Axiom AI - Browser Automation', render: renderAxiomPanel }
  };

  const tool = tools[toolName];
  if (tool) {
    title.innerHTML = tool.title;
    tool.render(content);
    panel.classList.add('open');
    state.toolPanelOpen = true;
  }
}

function closeToolPanel() {
  document.getElementById('toolPanel').classList.remove('open');
  state.toolPanelOpen = false;
}

// Terminal Tool
function renderTerminal(container) {
  container.innerHTML = `
    <div class="terminal-output" id="terminalOutput">${state.terminalOutput || 'SuperNinja Terminal Ready...\n$ '}</div>
    <div class="terminal-input-row">
      <input type="text" class="terminal-input" id="terminalInput" placeholder="Enter command..." onkeydown="if(event.key==='Enter')runTerminalCommand()">
      <button class="terminal-run-btn" onclick="runTerminalCommand()">Run</button>
    </div>
    <div style="margin-top:12px">
      <h4 style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Quick Commands</h4>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <button class="tool-btn" onclick="quickTerminal('ls -la')" style="padding:6px 10px;flex-direction:row;gap:4px"><span style="font-size:12px">ls -la</span></button>
        <button class="tool-btn" onclick="quickTerminal('pwd')" style="padding:6px 10px;flex-direction:row;gap:4px"><span style="font-size:12px">pwd</span></button>
        <button class="tool-btn" onclick="quickTerminal('df -h')" style="padding:6px 10px;flex-direction:row;gap:4px"><span style="font-size:12px">df -h</span></button>
        <button class="tool-btn" onclick="quickTerminal('free -h')" style="padding:6px 10px;flex-direction:row;gap:4px"><span style="font-size:12px">free -h</span></button>
        <button class="tool-btn" onclick="quickTerminal('git status')" style="padding:6px 10px;flex-direction:row;gap:4px"><span style="font-size:12px">git status</span></button>
        <button class="tool-btn" onclick="quickTerminal('node -v')" style="padding:6px 10px;flex-direction:row;gap:4px"><span style="font-size:12px">node -v</span></button>
        <button class="tool-btn" onclick="quickTerminal('npm -v')" style="padding:6px 10px;flex-direction:row;gap:4px"><span style="font-size:12px">npm -v</span></button>
      </div>
    </div>
  `;
  document.getElementById('terminalInput').focus();
}

async function runTerminalCommand() {
  const input = document.getElementById('terminalInput');
  const command = input.value.trim();
  if (!command) return;

  input.value = '';
  await executeTerminalCommand(command);
}

function quickTerminal(cmd) {
  document.getElementById('terminalInput').value = cmd;
  runTerminalCommand();
}

async function executeTerminalCommand(command) {
  const output = document.getElementById('terminalOutput');
  state.terminalOutput += `\n$ ${command}\n`;
  
  if (output) output.textContent = state.terminalOutput;

  try {
    const result = await window.superNinja.executeCommand(command);
    const resultText = result.stdout || result.stderr || (result.error ? `Error: ${result.error}` : 'Command completed');
    state.terminalOutput += resultText + '\n';
    
    // Add to chat as tool result
    const toolMessage = {
      role: 'assistant',
      content: `**Terminal Output** (\`${command}\`):\n\`\`\`\n${resultText}\n\`\`\``,
      timestamp: new Date().toISOString(),
      isTool: true
    };
    
    if (state.currentChatId) {
      state.messages.push(toolMessage);
      renderMessage(toolMessage);
    }
  } catch (error) {
    state.terminalOutput += `Error: ${error.message}\n`;
  }

  if (output) {
    output.textContent = state.terminalOutput;
    output.scrollTop = output.scrollHeight;
  }
}

// File Manager Tool
function renderFileManager(container) {
  container.innerHTML = `
    <div style="margin-bottom:12px">
      <input type="text" class="terminal-input" id="filePathInput" value="${process.env?.HOME || '~'}" placeholder="Enter path..." style="width:100%" onkeydown="if(event.key==='Enter')browseDirectory()">
    </div>
    <button class="terminal-run-btn" onclick="browseDirectory()" style="margin-bottom:16px;width:100%">Browse</button>
    <div id="fileList" style="font-family:var(--font-mono);font-size:13px">
      <p style="color:var(--text-muted)">Enter a path and click Browse to view files</p>
    </div>
  `;
}

async function browseDirectory() {
  const pathInput = document.getElementById('filePathInput');
  const dirPath = pathInput.value.trim();
  const fileList = document.getElementById('fileList');

  try {
    const result = await window.superNinja.listDirectory(dirPath);
    if (result.success) {
      fileList.innerHTML = result.items.map(item => `
        <div style="padding:6px 8px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;cursor:pointer" 
             onclick="${item.isDirectory ? `document.getElementById('filePathInput').value='${item.path.replace(/\\/g, '\\\\')}';browseDirectory()` : `openFileInEditor('${item.path.replace(/\\/g, '\\\\')}')`}">
          <span>${item.isDirectory ? '&#128193;' : '&#128196;'}</span>
          <span style="color:${item.isDirectory ? 'var(--accent)' : 'var(--text-primary)'}">${item.name}</span>
        </div>
      `).join('');
    } else {
      fileList.innerHTML = `<p style="color:var(--red)">Error: ${result.error}</p>`;
    }
  } catch (error) {
    fileList.innerHTML = `<p style="color:var(--red)">Error: ${error.message}</p>`;
  }
}

async function openFileInEditor(filePath) {
  try {
    const result = await window.superNinja.readFile(filePath);
    if (result.success) {
      openTool('codeeditor');
      setTimeout(() => {
        const editor = document.getElementById('codeEditorArea');
        const pathDisplay = document.getElementById('codeEditorPath');
        if (editor) editor.value = result.content;
        if (pathDisplay) pathDisplay.value = filePath;
      }, 100);
    }
  } catch (error) {
    console.error('Failed to open file:', error);
  }
}

// Code Editor Tool
function renderCodeEditor(container) {
  container.innerHTML = `
    <div style="margin-bottom:8px;display:flex;gap:8px">
      <input type="text" class="terminal-input" id="codeEditorPath" placeholder="File path..." style="flex:1">
      <button class="terminal-run-btn" onclick="loadFileInEditor()">Open</button>
      <button class="terminal-run-btn" onclick="saveFileFromEditor()" style="background:var(--accent)">Save</button>
    </div>
    <textarea id="codeEditorArea" style="width:100%;min-height:400px;background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;font-family:var(--font-mono);font-size:13px;line-height:1.5;resize:vertical;outline:none;tab-size:2" spellcheck="false" placeholder="// Write or paste code here..."></textarea>
    <div style="margin-top:8px;display:flex;gap:8px">
      <button class="terminal-run-btn" onclick="runCodeFromEditor()" style="background:var(--green)">&#9654; Run</button>
      <button class="tool-btn" onclick="formatCode()" style="padding:8px 12px;flex-direction:row">Format</button>
      <button class="tool-btn" onclick="copyCode()" style="padding:8px 12px;flex-direction:row">Copy</button>
    </div>
  `;
}

async function loadFileInEditor() {
  const filePath = document.getElementById('codeEditorPath').value.trim();
  if (!filePath) return;
  const result = await window.superNinja.readFile(filePath);
  if (result.success) {
    document.getElementById('codeEditorArea').value = result.content;
  }
}

async function saveFileFromEditor() {
  const filePath = document.getElementById('codeEditorPath').value.trim();
  const content = document.getElementById('codeEditorArea').value;
  if (!filePath) {
    const result = await window.superNinja.saveDialog({
      filters: [{ name: 'All Files', extensions: ['*'] }]
    });
    if (!result.canceled) {
      document.getElementById('codeEditorPath').value = result.filePath;
      await window.superNinja.writeFile(result.filePath, content);
    }
    return;
  }
  await window.superNinja.writeFile(filePath, content);
}

async function runCodeFromEditor() {
  const code = document.getElementById('codeEditorArea').value;
  const filePath = document.getElementById('codeEditorPath').value.trim();
  
  if (filePath.endsWith('.js')) {
    await executeTerminalCommand(`node "${filePath}"`);
  } else if (filePath.endsWith('.py')) {
    await executeTerminalCommand(`python3 "${filePath}"`);
  } else {
    // Save to temp and run
    const tmpFile = '/tmp/superninja_run.js';
    await window.superNinja.writeFile(tmpFile, code);
    await executeTerminalCommand(`node "${tmpFile}"`);
  }
}

function copyCode() {
  const code = document.getElementById('codeEditorArea').value;
  navigator.clipboard.writeText(code);
}

// Web Browser Tool
function renderWebBrowser(container) {
  container.innerHTML = `
    <div style="margin-bottom:12px;display:flex;gap:8px">
      <input type="text" class="terminal-input" id="webSearchInput" placeholder="Search the web or enter URL..." style="flex:1" onkeydown="if(event.key==='Enter')webSearch()">
      <button class="terminal-run-btn" onclick="webSearch()">Search</button>
    </div>
    <div id="webResults" style="font-size:13px">
      <p style="color:var(--text-muted)">Enter a search query or URL to browse the web</p>
    </div>
  `;
}

async function webSearch() {
  const query = document.getElementById('webSearchInput').value.trim();
  const results = document.getElementById('webResults');
  if (!query) return;
  
  results.innerHTML = '<div class="spinner" style="margin:20px auto"></div>';
  
  // Use the AI to search
  const searchMessage = `Search the web for: "${query}" and provide the top results with summaries.`;
  document.getElementById('message-input').value = searchMessage;
  closeToolPanel();
  sendMessage();
}

// Image Tools
function renderImageTools(container) {
  container.innerHTML = `
    <h4 style="margin-bottom:12px;color:var(--text-secondary)">Image Generation & Editing</h4>
    <textarea id="imagePrompt" class="terminal-input" style="width:100%;min-height:100px;resize:vertical;margin-bottom:12px" placeholder="Describe the image you want to generate..."></textarea>
    <button class="terminal-run-btn" onclick="generateImage()" style="width:100%;margin-bottom:16px;background:linear-gradient(135deg,var(--accent),var(--cyan))">Generate Image</button>
    <h4 style="margin-bottom:12px;color:var(--text-secondary)">Open Image File</h4>
    <button class="terminal-run-btn" onclick="openImageFile()" style="width:100%;background:var(--blue)">Browse Images</button>
    <div id="imagePreview" style="margin-top:16px"></div>
  `;
}

function generateImage() {
  const prompt = document.getElementById('imagePrompt').value.trim();
  if (!prompt) return;
  document.getElementById('message-input').value = `Generate an image: ${prompt}`;
  closeToolPanel();
  sendMessage();
}

async function openImageFile() {
  const result = await window.superNinja.openDialog({
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    addAttachedFile(result.filePaths[0]);
  }
}

// Audio Tools
function renderAudioTools(container) {
  container.innerHTML = `
    <h4 style="margin-bottom:12px;color:var(--text-secondary)">Audio Processing</h4>
    <button class="terminal-run-btn" onclick="openAudioFile()" style="width:100%;margin-bottom:12px">Open Audio File</button>
    <button class="terminal-run-btn" onclick="transcribeAudio()" style="width:100%;margin-bottom:12px;background:var(--green)">Transcribe Audio</button>
    <button class="terminal-run-btn" onclick="analyzeAudio()" style="width:100%;background:var(--blue)">Analyze Audio</button>
    <div id="audioPreview" style="margin-top:16px"></div>
  `;
}

async function openAudioFile() {
  const result = await window.superNinja.openDialog({
    filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    addAttachedFile(result.filePaths[0]);
  }
}

function transcribeAudio() {
  document.getElementById('message-input').value = 'Transcribe the attached audio file';
  closeToolPanel();
  sendMessage();
}

function analyzeAudio() {
  document.getElementById('message-input').value = 'Analyze the attached audio file - BPM, key, frequency analysis';
  closeToolPanel();
  sendMessage();
}

// PDF Tools
function renderPDFTools(container) {
  container.innerHTML = `
    <h4 style="margin-bottom:12px;color:var(--text-secondary)">PDF Processing</h4>
    <button class="terminal-run-btn" onclick="openPDFFile()" style="width:100%;margin-bottom:12px">Open PDF</button>
    <button class="terminal-run-btn" onclick="extractPDFText()" style="width:100%;margin-bottom:12px;background:var(--green)">Extract Text</button>
    <button class="terminal-run-btn" onclick="summarizePDF()" style="width:100%;background:var(--blue)">Summarize PDF</button>
  `;
}

async function openPDFFile() {
  const result = await window.superNinja.openDialog({
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    addAttachedFile(result.filePaths[0]);
  }
}

function extractPDFText() {
  document.getElementById('message-input').value = 'Extract all text from the attached PDF file';
  closeToolPanel();
  sendMessage();
}

function summarizePDF() {
  document.getElementById('message-input').value = 'Summarize the attached PDF document';
  closeToolPanel();
  sendMessage();
}

// Data Analysis Tool
function renderDataAnalysis(container) {
  container.innerHTML = `
    <h4 style="margin-bottom:12px;color:var(--text-secondary)">Data Analysis</h4>
    <button class="terminal-run-btn" onclick="openDataFile()" style="width:100%;margin-bottom:12px">Open Data File (CSV/JSON/Excel)</button>
    <button class="terminal-run-btn" onclick="analyzeData()" style="width:100%;margin-bottom:12px;background:var(--green)">Analyze Data</button>
    <button class="terminal-run-btn" onclick="visualizeData()" style="width:100%;background:var(--blue)">Create Visualization</button>
  `;
}

async function openDataFile() {
  const result = await window.superNinja.openDialog({
    filters: [{ name: 'Data Files', extensions: ['csv', 'json', 'xlsx', 'xls', 'xml'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    addAttachedFile(result.filePaths[0]);
  }
}

function analyzeData() {
  document.getElementById('message-input').value = 'Analyze the attached data file - provide statistics, patterns, and insights';
  closeToolPanel();
  sendMessage();
}

function visualizeData() {
  document.getElementById('message-input').value = 'Create charts and visualizations from the attached data file';
  closeToolPanel();
  sendMessage();
}

// Music Production Tool
function renderMusicProd(container) {
  container.innerHTML = `
    <h4 style="margin-bottom:16px;color:var(--text-secondary)">Music Production Assistant</h4>
    <div style="display:grid;gap:8px">
      <button class="terminal-run-btn" onclick="musicAction('Analyze my track catalog and suggest which tracks to promote')" style="background:var(--accent)">Catalog Analysis</button>
      <button class="terminal-run-btn" onclick="musicAction('Generate beat ideas based on current trending sounds')" style="background:var(--blue)">Beat Ideas</button>
      <button class="terminal-run-btn" onclick="musicAction('Help me write lyrics for a new track')" style="background:var(--green)">Lyric Writer</button>
      <button class="terminal-run-btn" onclick="musicAction('Analyze current music industry trends and opportunities')" style="background:var(--orange)">Industry Trends</button>
      <button class="terminal-run-btn" onclick="musicAction('Create a marketing plan for my next release')" style="background:var(--cyan)">Release Marketing</button>
    </div>
  `;
}

function musicAction(prompt) {
  document.getElementById('message-input').value = prompt;
  closeToolPanel();
  sendMessage();
}

// Royalty Calculator Tool
function renderRoyaltyCalc(container) {
  container.innerHTML = `
    <h4 style="margin-bottom:16px;color:var(--text-secondary)">Royalty Calculator</h4>
    <div style="margin-bottom:16px">
      <label style="font-size:13px;color:var(--text-secondary);display:block;margin-bottom:6px">Total Streams</label>
      <input type="number" class="terminal-input" id="royaltyStreams" value="1000000" style="width:100%">
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:13px;color:var(--text-secondary);display:block;margin-bottom:6px">Platform</label>
      <select class="terminal-input" id="royaltyPlatform" style="width:100%">
        <option value="all">All Platforms (Average)</option>
        <option value="spotify">Spotify ($0.00437/stream)</option>
        <option value="apple">Apple Music ($0.00783/stream)</option>
        <option value="youtube">YouTube ($0.00274/view)</option>
        <option value="tiktok">TikTok ($0.00069/play)</option>
        <option value="tidal">Tidal ($0.01284/stream)</option>
        <option value="amazon">Amazon Music ($0.00402/stream)</option>
      </select>
    </div>
    <button class="terminal-run-btn" onclick="calculateRoyalty()" style="width:100%;background:linear-gradient(135deg,var(--green),var(--cyan))">Calculate Royalties</button>
    <div id="royaltyResult" style="margin-top:16px"></div>
  `;
}

function calculateRoyalty() {
  const streams = parseInt(document.getElementById('royaltyStreams').value) || 0;
  const platform = document.getElementById('royaltyPlatform').value;
  
  const rates = {
    spotify: 0.00437, apple: 0.00783, youtube: 0.00274,
    tiktok: 0.00069, tidal: 0.01284, amazon: 0.00402
  };

  let result = '';
  
  if (platform === 'all') {
    let total = 0;
    result = '<div style="background:var(--bg-primary);border-radius:var(--radius-sm);padding:16px;border:1px solid var(--border)">';
    result += `<h4 style="margin-bottom:12px;color:var(--accent)">Royalty Estimate for ${streams.toLocaleString()} streams</h4>`;
    
    Object.keys(rates).forEach(p => {
      const rev = streams * rates[p];
      total += rev;
      result += `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
        <span style="text-transform:capitalize">${p}</span>
        <span style="color:var(--green);font-weight:600">$${rev.toFixed(2)}</span>
      </div>`;
    });
    
    result += `<div style="display:flex;justify-content:space-between;padding:10px 0;margin-top:8px;font-weight:700;font-size:16px">
      <span>Average Total</span>
      <span style="color:var(--green)">$${(total / Object.keys(rates).length).toFixed(2)}</span>
    </div>`;
    result += '</div>';
  } else {
    const rev = streams * rates[platform];
    result = `<div style="background:var(--bg-primary);border-radius:var(--radius-sm);padding:16px;border:1px solid var(--border);text-align:center">
      <div style="font-size:12px;color:var(--text-muted);text-transform:capitalize">${platform}</div>
      <div style="font-size:32px;font-weight:700;color:var(--green);margin:8px 0">$${rev.toFixed(2)}</div>
      <div style="font-size:12px;color:var(--text-muted)">${streams.toLocaleString()} streams x $${rates[platform]}/stream</div>
    </div>`;
  }

  document.getElementById('royaltyResult').innerHTML = result;
}

// ============================================================
// UI RENDERING
// ============================================================

function renderMessages() {
  clearChatArea();
  if (state.messages.length === 0) {
    showWelcomeScreen();
    return;
  }
  hideWelcomeScreen();
  state.messages.forEach(msg => renderMessage(msg));
  scrollToBottom();
}

function renderMessage(message) {
  const chatArea = document.getElementById('chatArea');
  const welcome = document.getElementById('welcomeScreen');
  if (welcome) welcome.style.display = 'none';

  const div = document.createElement('div');
  div.className = `message ${message.role}`;
  
  const avatar = message.role === 'user' ? '&#128100;' : '&#9889;';
  const name = message.role === 'user' ? 'You' : 'SuperNinja AI';
  const time = formatTime(message.timestamp);

  div.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-name">${name}</span>
        <span class="message-time">${time}</span>
        ${message.model ? `<span class="message-time" style="color:var(--accent)">${message.model}</span>` : ''}
      </div>
      <div class="message-body">${renderMarkdown(message.content)}</div>
      ${message.files && message.files.length > 0 ? `
        <div class="file-chips" style="padding:8px 0 0">
          ${message.files.map(f => `<span class="file-chip">&#128206; ${f.split('/').pop()}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;

  chatArea.appendChild(div);
  scrollToBottom();
}

function renderMarkdown(text) {
  if (!text) return '';
  
  // Basic markdown rendering
  let html = text
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code><button class="copy-code-btn" onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent)">Copy</button></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" onclick="event.preventDefault();window.superNinja.openExternal(\'$2\')" style="color:var(--accent)">$1</a>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}

function showTypingIndicator() {
  const chatArea = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'message assistant';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="message-avatar">&#9889;</div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-name">SuperNinja AI</span>
        <span class="message-time">thinking...</span>
      </div>
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatArea.appendChild(div);
  scrollToBottom();
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

function showWelcomeScreen() {
  const welcome = document.getElementById('welcomeScreen');
  if (welcome) welcome.style.display = 'flex';
}

function hideWelcomeScreen() {
  const welcome = document.getElementById('welcomeScreen');
  if (welcome) welcome.style.display = 'none';
}

function clearChatArea() {
  const chatArea = document.getElementById('chatArea');
  const welcome = document.getElementById('welcomeScreen');
  chatArea.innerHTML = '';
  if (welcome) chatArea.appendChild(welcome);
}

function clearChat() {
  if (state.messages.length === 0) return;
  state.messages = [];
  clearChatArea();
  showWelcomeScreen();
  saveCurrentChat();
}

// ============================================================
// FILE ATTACHMENTS
// ============================================================

async function attachFile() {
  const result = await window.superNinja.openDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'All Files', extensions: ['*'] }]
  });
  
  if (!result.canceled) {
    result.filePaths.forEach(fp => addAttachedFile(fp));
  }
}

function addAttachedFile(filePath) {
  if (!state.attachedFiles.includes(filePath)) {
    state.attachedFiles.push(filePath);
    renderFileChips();
  }
}

function removeAttachedFile(index) {
  state.attachedFiles.splice(index, 1);
  renderFileChips();
}

function clearAttachedFiles() {
  state.attachedFiles = [];
  renderFileChips();
}

function renderFileChips() {
  const container = document.getElementById('fileChips');
  container.innerHTML = state.attachedFiles.map((fp, i) => `
    <span class="file-chip">
      &#128206; ${fp.split('/').pop().split('\\\\').pop()}
      <span class="remove-chip" onclick="removeAttachedFile(${i})">&times;</span>
    </span>
  `).join('');
}

// ============================================================
// UI HELPERS
// ============================================================

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
  state.sidebarOpen = !state.sidebarOpen;
}

function changeModel(model) {
  document.getElementById('topBarTitle').textContent = `SuperNinja AI - ${model}`;
}

function openSettings(tab) {
  document.getElementById('settingsModal').classList.add('open');
  loadSettingsUI();
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
}

async function saveSetting(key, value) {
  state.settings[key] = value;
  await window.superNinja.setSetting(key, value);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  saveSetting('theme', theme);
}

function handleKeyDown(event) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    sendMessage();
  }
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    sendMessage();
  }
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

function updateSendButton() {
  const btn = document.getElementById('sendBtn');
  btn.disabled = state.isProcessing;
  btn.innerHTML = state.isProcessing ? '<div class="spinner" style="width:16px;height:16px"></div>' : '&#10148;';
}

function scrollToBottom() {
  const chatArea = document.getElementById('chatArea');
  chatArea.scrollTop = chatArea.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 86400000) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return date.toLocaleDateString();
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener('DOMContentLoaded', init);
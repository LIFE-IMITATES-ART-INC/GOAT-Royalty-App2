/**
 * GOAT Royalty Ultimate Launcher — Renderer
 * Master hub for ALL tools, apps, and integrations
 */

// ── Configuration ─────────────────────────────────────────────
const GOAT_APP_URL = 'http://93.127.214.171:3002';
const LOCAL_URL = 'http://localhost:3000';

// ── Tool Registry — ALL tools in one place ────────────────────
const TOOLS = {
  // ═══ GOAT ROYALTY BUILT-IN PAGES ═══
  goatPages: {
    title: '🐐 GOAT Royalty Platform',
    items: [
      { id: 'home', name: 'Home', icon: '🏠', desc: 'Landing page & overview', url: '/', badge: 'built', color: '#FFD700' },
      { id: 'dashboard', name: 'Dashboard', icon: '📊', desc: 'Analytics & revenue overview', url: '/dashboard', badge: 'built', color: '#3b82f6' },
      { id: 'super-goat', name: 'Super GOAT Command', icon: '⚡', desc: 'Unified AI + Music command center', url: '/super-goat-command', badge: 'built', color: '#FFD700' },
      { id: 'complete-platform', name: 'Complete Platform', icon: '👑', desc: 'Full platform overview', url: '/complete-platform', badge: 'built', color: '#a855f7' },
      { id: 'investor-demo', name: 'Investor Demo', icon: '📈', desc: 'Investor presentation & metrics', url: '/investor-demo', badge: 'built', color: '#22c55e' },
    ]
  },

  // ═══ AI & CREATIVE TOOLS ═══
  aiTools: {
    title: '🤖 AI & Creative Studio',
    items: [
      { id: 'adobe-firefly', name: 'Adobe Firefly AI', icon: '🎨', desc: 'AI image generation, text effects, style transfer', url: '/adobe-firefly', badge: 'ai', color: '#FF6B35' },
      { id: 'sora-ai', name: 'Sora AI Studio', icon: '🎬', desc: 'AI video generation & editing', url: '/sora-ai-studio', badge: 'ai', color: '#a855f7' },
      { id: 'ms-vanessa', name: 'Ms. Vanessa AI', icon: '🤖', desc: 'AI assistant for music business', url: '/ms-vanessa', badge: 'ai', color: '#ec4899' },
      { id: 'interactive', name: 'Interactive AI', icon: '💡', desc: 'AI-powered interactive features', url: '/interactive', badge: 'ai', color: '#06b6d4' },
      { id: 'cinema-camera', name: 'Cinema Camera', icon: '🎥', desc: 'Professional video production suite', url: '/cinema-camera', badge: 'built', color: '#f59e0b' },
      { id: 'artwork', name: 'Artwork Studio', icon: '🖼️', desc: 'Album art & visual design', url: '/artwork', badge: 'built', color: '#8b5cf6' },
    ]
  },

  // ═══ MUSIC & CATALOG ═══
  musicTools: {
    title: '🎵 Music & Catalog',
    items: [
      { id: 'tracks', name: 'Track Manager', icon: '🎵', desc: 'Manage your 3,650+ track catalog', url: '/tracks', badge: 'built', color: '#22c55e' },
      { id: 'streaming', name: 'Streaming Hub', icon: '🎧', desc: 'Spotify, Apple Music, YouTube analytics', url: '/streaming', badge: 'built', color: '#1DB954' },
      { id: 'publishing', name: 'Publishing', icon: '📝', desc: 'Music publishing & rights management', url: '/publishing', badge: 'built', color: '#3b82f6' },
      { id: 'asap-catalog', name: 'ASAP Catalog', icon: '📀', desc: 'Full ASCAP catalog browser', url: '/asap-catalog', badge: 'built', color: '#f59e0b' },
      { id: 'search', name: 'Search', icon: '🔍', desc: 'Search across all catalogs & data', url: '/search', badge: 'built', color: '#6b7280' },
      { id: 'media-gallery', name: 'Media Gallery', icon: '📸', desc: 'Photos, videos, and media assets', url: '/media-gallery', badge: 'built', color: '#ec4899' },
    ]
  },

  // ═══ BUSINESS & LEGAL ═══
  businessTools: {
    title: '💼 Business & Legal',
    items: [
      { id: 'analytics', name: 'Analytics', icon: '📊', desc: 'Deep analytics & performance data', url: '/analytics', badge: 'built', color: '#3b82f6' },
      { id: 'copyright', name: 'Copyright Vault', icon: '🛡️', desc: 'IP protection & copyright management', url: '/copyright', badge: 'built', color: '#ef4444' },
      { id: 'documents', name: 'Documents', icon: '📄', desc: 'Contracts, NDAs, legal documents', url: '/documents', badge: 'built', color: '#6b7280' },
      { id: 'fashion-store', name: 'Fashion Store', icon: '👕', desc: 'GOAT Royalty merchandise & fashion', url: '/fashion-store', badge: 'built', color: '#f59e0b' },
      { id: 'contact', name: 'Contact', icon: '📞', desc: 'Contact management & CRM', url: '/contact', badge: 'built', color: '#22c55e' },
      { id: 'deploy', name: 'Deploy Manager', icon: '🚀', desc: 'Deployment & server management', url: '/deploy', badge: 'built', color: '#a855f7' },
    ]
  },

  // ═══ TECHNOLOGY ═══
  techTools: {
    title: '⚙️ Technology & Infrastructure',
    items: [
      { id: 'nvidia-dgx', name: 'NVIDIA DGX Cloud', icon: '🖥️', desc: 'GPU computing & AI training', url: '/nvidia-dgx', badge: 'built', color: '#76b900' },
      { id: 'fingerprint', name: 'Fingerprint Auth', icon: '🔐', desc: 'Biometric security & authentication', url: '/fingerprint-auth', badge: 'built', color: '#ef4444' },
      { id: 'login', name: 'Auth System', icon: '🔑', desc: 'Login & user management', url: '/login', badge: 'built', color: '#6b7280' },
    ]
  },

  // ═══ EXTERNAL TOOLS — Outside Ninja Config ═══
  externalTools: {
    title: '🌐 External Tools & Services',
    items: [
      { id: 'ext-chatgpt', name: 'ChatGPT', icon: '🧠', desc: 'OpenAI ChatGPT — Advanced AI chat', url: 'https://chat.openai.com', badge: 'external', color: '#10a37f' },
      { id: 'ext-claude', name: 'Claude AI', icon: '🤖', desc: 'Anthropic Claude — AI assistant', url: 'https://claude.ai', badge: 'external', color: '#d97706' },
      { id: 'ext-midjourney', name: 'Midjourney', icon: '🎨', desc: 'AI art generation', url: 'https://www.midjourney.com', badge: 'external', color: '#fff' },
      { id: 'ext-github', name: 'GitHub', icon: '🐙', desc: 'GOAT Royalty repository', url: 'https://github.com/DJSPEEDYGA/GOAT-Royalty-App2', badge: 'external', color: '#fff' },
      { id: 'ext-supabase', name: 'Supabase', icon: '⚡', desc: 'Database & backend services', url: 'https://supabase.com/dashboard', badge: 'external', color: '#3ecf8e' },
      { id: 'ext-vercel', name: 'Vercel', icon: '▲', desc: 'Deployment & hosting', url: 'https://vercel.com/dashboard', badge: 'external', color: '#fff' },
      { id: 'ext-spotify-dash', name: 'Spotify for Artists', icon: '🎵', desc: 'Spotify artist dashboard', url: 'https://artists.spotify.com', badge: 'external', color: '#1DB954' },
      { id: 'ext-distrokid', name: 'DistroKid', icon: '📀', desc: 'Music distribution', url: 'https://distrokid.com', badge: 'external', color: '#ff5722' },
      { id: 'ext-ascap', name: 'ASCAP', icon: '📝', desc: 'Performance rights organization', url: 'https://www.ascap.com/member-access', badge: 'external', color: '#003366' },
      { id: 'ext-bmi', name: 'BMI', icon: '📝', desc: 'Broadcast Music Inc.', url: 'https://www.bmi.com/creators', badge: 'external', color: '#e31937' },
    ]
  },

  // ═══ PRODUCTION TOOLS ═══
  productionTools: {
    title: '🎛️ Production & DAW Tools',
    items: [
      { id: 'ext-splice', name: 'Splice', icon: '🎹', desc: 'Samples, presets & plugins', url: 'https://splice.com', badge: 'external', color: '#ff4081' },
      { id: 'ext-landr', name: 'LANDR', icon: '🔊', desc: 'AI mastering & distribution', url: 'https://www.landr.com', badge: 'external', color: '#6c63ff' },
      { id: 'ext-izotope', name: 'iZotope', icon: '🎚️', desc: 'Audio processing & mastering', url: 'https://www.izotope.com', badge: 'external', color: '#00bcd4' },
      { id: 'ext-waves', name: 'Waves Audio', icon: '🌊', desc: 'Professional audio plugins', url: 'https://www.waves.com', badge: 'external', color: '#ff9800' },
      { id: 'ext-native', name: 'Native Instruments', icon: '🎹', desc: 'Virtual instruments & effects', url: 'https://www.native-instruments.com', badge: 'external', color: '#fff' },
      { id: 'ext-soundcloud', name: 'SoundCloud', icon: '☁️', desc: 'Music sharing & discovery', url: 'https://soundcloud.com', badge: 'external', color: '#ff5500' },
    ]
  },

  // ═══ SOCIAL & MARKETING ═══
  socialTools: {
    title: '📱 Social Media & Marketing',
    items: [
      { id: 'ext-instagram', name: 'Instagram', icon: '📷', desc: 'Social media management', url: 'https://www.instagram.com', badge: 'external', color: '#e4405f' },
      { id: 'ext-tiktok', name: 'TikTok', icon: '🎵', desc: 'Short-form video platform', url: 'https://www.tiktok.com', badge: 'external', color: '#000' },
      { id: 'ext-youtube', name: 'YouTube Studio', icon: '📺', desc: 'Video management & analytics', url: 'https://studio.youtube.com', badge: 'external', color: '#ff0000' },
      { id: 'ext-twitter', name: 'X (Twitter)', icon: '🐦', desc: 'Social media & announcements', url: 'https://x.com', badge: 'external', color: '#1da1f2' },
      { id: 'ext-canva', name: 'Canva', icon: '🎨', desc: 'Graphic design & social media', url: 'https://www.canva.com', badge: 'external', color: '#00c4cc' },
      { id: 'ext-mailchimp', name: 'Mailchimp', icon: '📧', desc: 'Email marketing & newsletters', url: 'https://mailchimp.com', badge: 'external', color: '#ffe01b' },
    ]
  },
};

// ── Sidebar Navigation ────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home', icon: '🐐', label: 'Home' },
  { id: 'sep1', type: 'separator' },
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'super-goat', icon: '⚡', label: 'Command Center' },
  { id: 'atlas-ai', icon: '🤖', label: 'Atlas AI' },
  { id: 'adobe-firefly', icon: '🎨', label: 'Firefly AI' },
  { id: 'sep2', type: 'separator' },
  { id: 'tracks', icon: '🎵', label: 'Tracks' },
  { id: 'streaming', icon: '🎧', label: 'Streaming' },
  { id: 'publishing', icon: '📝', label: 'Publishing' },
  { id: 'analytics', icon: '📈', label: 'Analytics' },
  { id: 'sep3', type: 'separator' },
  { id: 'cinema-camera', icon: '🎥', label: 'Cinema' },
  { id: 'sora-ai', icon: '🎬', label: 'Sora AI' },
  { id: 'nvidia-dgx', icon: '🖥️', label: 'NVIDIA DGX' },
  { id: 'sep4', type: 'separator' },
  { id: 'fashion-store', icon: '👕', label: 'Fashion' },
  { id: 'copyright', icon: '🛡️', label: 'Copyright' },
  { id: 'documents', icon: '📄', label: 'Documents' },
  { id: 'sep5', type: 'separator' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

// ── State ─────────────────────────────────────────────────────
let currentPage = 'home';
let appUrl = LOCAL_URL; // Will try local first, fallback to remote
let searchQuery = '';

// ── Initialize ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Check which server is available
  try {
    const res = await fetch(`${LOCAL_URL}/api/royalty-engine`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) appUrl = LOCAL_URL;
    else throw new Error();
  } catch {
    try {
      const res = await fetch(`${GOAT_APP_URL}/api/royalty-engine`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) appUrl = GOAT_APP_URL;
      else appUrl = LOCAL_URL;
    } catch {
      appUrl = LOCAL_URL;
    }
  }

  // Get version
  if (window.goat) {
    const ver = await window.goat.getVersion();
    document.getElementById('version').textContent = `v${ver}`;
  }

  // Listen for menu navigation
  if (window.goat) {
    window.goat.onNavigate((page) => navigateTo(page));
  }

  renderSidebar();
  navigateTo('home');
});

// ── Render Sidebar ────────────────────────────────────────────
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = NAV_ITEMS.map(item => {
    if (item.type === 'separator') return '<div class="nav-sep"></div>';
    return `
      <button class="nav-icon ${currentPage === item.id ? 'active' : ''}" onclick="navigateTo('${item.id}')" title="${item.label}">
        ${item.icon}
        <span class="nav-tooltip">${item.label}</span>
      </button>
    `;
  }).join('');
}

// ── Navigate ──────────────────────────────────────────────────
function navigateTo(page) {
  currentPage = page;
  renderSidebar();

  const main = document.getElementById('main');

  // Check if it's a built-in page that should load in webview
  const allTools = Object.values(TOOLS).flatMap(cat => cat.items);
  const tool = allTools.find(t => t.id === page);

  if (page === 'home') {
    renderHomePage(main);
  } else if (page === 'settings') {
    renderSettingsPage(main);
  } else if (page === 'atlas-ai') {
    renderWebview(main, `${appUrl}/super-goat-command`, 'Atlas AI — Super GOAT Command Center');
  } else if (tool) {
    if (tool.url.startsWith('http')) {
      // External URL — open in webview
      renderWebview(main, tool.url, tool.name);
    } else {
      // Internal GOAT page
      renderWebview(main, `${appUrl}${tool.url}`, tool.name);
    }
  } else {
    renderHomePage(main);
  }
}

// ── Render Home Page ──────────────────────────────────────────
function renderHomePage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-title">🐐 GOAT Royalty — Ultimate Launcher</div>
      <div class="page-subtitle">All your tools, apps, and integrations in one place</div>
    </div>
    <div class="content content-padded fade-in">
      <!-- Stats -->
      <div class="stats-bar">
        <div class="stat-card">
          <div class="stat-value">690</div>
          <div class="stat-label">Total Files</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">211K</div>
          <div class="stat-label">Lines of Code</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">29</div>
          <div class="stat-label">Pages</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">58</div>
          <div class="stat-label">Components</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">20</div>
          <div class="stat-label">API Endpoints</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">3,650</div>
          <div class="stat-label">Tracks</div>
        </div>
      </div>

      <!-- Search -->
      <input type="text" class="search-box" placeholder="🔍 Search all tools, pages, and apps..." oninput="filterTools(this.value)" id="searchBox">

      <!-- Tool Sections -->
      <div id="toolSections">
        ${renderAllSections()}
      </div>
    </div>
  `;
}

// ── Render All Sections ───────────────────────────────────────
function renderAllSections(filter = '') {
  const f = filter.toLowerCase();
  return Object.entries(TOOLS).map(([key, section]) => {
    const items = section.items.filter(t =>
      !f || t.name.toLowerCase().includes(f) || t.desc.toLowerCase().includes(f)
    );
    if (items.length === 0) return '';
    return `
      <div class="section-title">${section.title}</div>
      <div class="tool-grid">
        ${items.map(tool => `
          <div class="tool-card" onclick="navigateTo('${tool.id}')">
            <div class="tool-icon" style="background: ${tool.color}15; color: ${tool.color};">${tool.icon}</div>
            <div class="tool-name">${tool.name}</div>
            <div class="tool-desc">${tool.desc}</div>
            <span class="tool-badge badge-${tool.badge}">${badgeLabel(tool.badge)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function badgeLabel(badge) {
  switch(badge) {
    case 'built': return '✅ Built-in';
    case 'web': return '🌐 Web App';
    case 'desktop': return '🖥️ Desktop';
    case 'ai': return '🤖 AI Powered';
    case 'external': return '🔗 External';
    default: return badge;
  }
}

// ── Filter Tools ──────────────────────────────────────────────
function filterTools(query) {
  searchQuery = query;
  const sections = document.getElementById('toolSections');
  if (sections) sections.innerHTML = renderAllSections(query);
}

// ── Render Webview ────────────────────────────────────────────
function renderWebview(container, url, title) {
  container.innerHTML = `
    <div class="webview-bar">
      <button class="webview-btn" onclick="navigateTo('home')">← Home</button>
      <button class="webview-btn" onclick="webviewBack()">◀</button>
      <button class="webview-btn" onclick="webviewForward()">▶</button>
      <button class="webview-btn" onclick="webviewReload()">↻</button>
      <div class="webview-url" id="webviewUrl">${url}</div>
      <button class="webview-btn" onclick="openInBrowser('${url}')">↗ Browser</button>
    </div>
    <div class="webview-container">
      <webview id="toolWebview" src="${url}" style="width:100%;height:100%;" allowpopups></webview>
    </div>
  `;

  const wv = document.getElementById('toolWebview');
  if (wv) {
    wv.addEventListener('did-navigate', (e) => {
      const urlEl = document.getElementById('webviewUrl');
      if (urlEl) urlEl.textContent = e.url;
    });
    wv.addEventListener('did-fail-load', () => {
      container.innerHTML = `
        <div class="page-header">
          <div class="page-title">${title}</div>
          <div class="page-subtitle">Unable to load — server may be offline</div>
        </div>
        <div class="content content-padded fade-in" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;">
          <div style="font-size:64px;margin-bottom:20px;">🔌</div>
          <h2 style="color:#e5e7eb;margin-bottom:8px;">Connection Failed</h2>
          <p style="color:rgba(255,255,255,0.4);margin-bottom:24px;text-align:center;">
            Could not connect to <code style="color:#FFD700;">${url}</code><br>
            Make sure the GOAT Royalty server is running.
          </p>
          <div style="display:flex;gap:12px;">
            <button class="webview-btn" onclick="navigateTo('${currentPage}')" style="padding:10px 20px;">↻ Retry</button>
            <button class="webview-btn" onclick="navigateTo('home')" style="padding:10px 20px;">← Home</button>
            <button class="webview-btn" onclick="openInBrowser('${url}')" style="padding:10px 20px;">↗ Open in Browser</button>
          </div>
        </div>
      `;
    });
  }
}

function webviewBack() { document.getElementById('toolWebview')?.goBack(); }
function webviewForward() { document.getElementById('toolWebview')?.goForward(); }
function webviewReload() { document.getElementById('toolWebview')?.reload(); }
function openInBrowser(url) {
  if (window.goat) window.goat.openExternal(url);
  else window.open(url, '_blank');
}

// ── Settings Page ─────────────────────────────────────────────
function renderSettingsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-title">⚙️ Settings</div>
      <div class="page-subtitle">Configure your GOAT Royalty Launcher</div>
    </div>
    <div class="content content-padded fade-in">
      <div class="section-title">Server Configuration</div>
      <div style="display:grid;gap:16px;max-width:600px;">
        <div class="tool-card" style="cursor:default;">
          <div class="tool-name">App Server URL</div>
          <div class="tool-desc">Current: <code style="color:#FFD700;">${appUrl}</code></div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button class="webview-btn" onclick="setAppUrl('${LOCAL_URL}')">Use Local (localhost:3000)</button>
            <button class="webview-btn" onclick="setAppUrl('${GOAT_APP_URL}')">Use Remote Server</button>
          </div>
        </div>
        <div class="tool-card" style="cursor:default;">
          <div class="tool-name">Platform Info</div>
          <div class="tool-desc" id="platformInfo">Loading...</div>
        </div>
        <div class="tool-card" style="cursor:default;">
          <div class="tool-name">Keyboard Shortcuts</div>
          <div class="tool-desc" style="line-height:2;">
            <code>Ctrl/Cmd + Shift + G</code> — Show/Focus Launcher<br>
            <code>Ctrl/Cmd + 1</code> — Dashboard<br>
            <code>Ctrl/Cmd + 2</code> — Atlas AI<br>
            <code>Ctrl/Cmd + 3</code> — Adobe Firefly<br>
            <code>Ctrl/Cmd + 4</code> — Music Studio<br>
            <code>Ctrl/Cmd + G</code> — Super GOAT Command
          </div>
        </div>
      </div>

      <div class="section-title">About</div>
      <div class="tool-card" style="cursor:default;max-width:600px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-size:40px;">🐐</div>
          <div>
            <div class="tool-name" style="font-size:18px;">GOAT Royalty Ultimate Launcher</div>
            <div class="tool-desc">Version 3.0.0 — Built by SuperNinja AI for Harvey Miller (DJ Speedy)</div>
            <div class="tool-desc" style="margin-top:4px;">690 files · 211,086 lines · 29 pages · 58 components · 20 APIs</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load platform info
  if (window.goat) {
    Promise.all([window.goat.getPlatform(), window.goat.getArch(), window.goat.getVersion()])
      .then(([platform, arch, version]) => {
        const el = document.getElementById('platformInfo');
        if (el) el.innerHTML = `Platform: <code style="color:#FFD700;">${platform}</code> · Arch: <code style="color:#FFD700;">${arch}</code> · Version: <code style="color:#FFD700;">${version}</code>`;
      });
  }
}

function setAppUrl(url) {
  appUrl = url;
  alert(`Server URL set to: ${url}`);
}
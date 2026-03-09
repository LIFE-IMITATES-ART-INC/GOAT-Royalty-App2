#!/bin/bash
# Atlas AI — macOS .dmg Build Script
# Packages the full app (Python backend + Electron frontend) into a .dmg

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
DIST_DIR="$FRONTEND_DIR/dist-electron"

echo "🐐 Atlas AI — macOS .dmg Builder"
echo "=================================="
echo ""

# ── Check macOS ───────────────────────────────────────────────
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "⚠️  This script is for macOS only."
  echo "   For Windows/Linux, use: npm run electron:win or electron:linux"
  exit 1
fi

# ── Check dependencies ────────────────────────────────────────
echo "🔍 Checking dependencies..."

if ! command -v node &>/dev/null; then
  echo "❌ Node.js required. Install: https://nodejs.org"
  exit 1
fi

if ! command -v python3 &>/dev/null; then
  echo "❌ Python 3 required. Install: brew install python3"
  exit 1
fi

echo "   Node: $(node --version)"
echo "   npm:  $(npm --version)"
echo "   Python: $(python3 --version)"

# ── Install frontend deps ─────────────────────────────────────
echo ""
echo "📦 Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install

# ── Generate app icon ─────────────────────────────────────────
echo ""
echo "🎨 Generating app icons..."
ASSETS_DIR="$FRONTEND_DIR/assets"
mkdir -p "$ASSETS_DIR"

# Create a simple icon using Python if no icon exists
if [ ! -f "$ASSETS_DIR/icon.png" ]; then
  python3 - <<'PYEOF'
import os, sys

# Try to create icon with PIL
try:
    from PIL import Image, ImageDraw, ImageFont
    
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background circle with gradient effect
    for i in range(size//2, 0, -1):
        ratio = i / (size//2)
        r = int(255 * ratio + 10 * (1-ratio))
        g = int(215 * ratio + 107 * (1-ratio))
        b = int(0 * ratio + 53 * (1-ratio))
        draw.ellipse([size//2-i, size//2-i, size//2+i, size//2+i], fill=(r, g, b, 255))
    
    # Goat emoji text
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Apple Color Emoji.ttc', 280)
        draw.text((size//2, size//2), '🐐', font=font, anchor='mm')
    except:
        draw.text((size//2 - 100, size//2 - 100), 'AI', fill='white')
    
    assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'assets')
    os.makedirs(assets_dir, exist_ok=True)
    img.save(os.path.join(assets_dir, 'icon.png'))
    print('✅ Icon created with PIL')
except ImportError:
    # Create minimal PNG without PIL
    import struct, zlib
    
    def create_minimal_png(filename, size=64):
        """Create a minimal valid PNG file."""
        def png_chunk(chunk_type, data):
            c = chunk_type + data
            return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        
        # IHDR
        ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
        
        # Image data (orange gradient)
        raw_data = b''
        for y in range(size):
            raw_data += b'\x00'  # filter type
            for x in range(size):
                r = min(255, int(255 * (1 - (x+y)/(2*size)) + 255 * (x+y)/(2*size)))
                g = min(255, int(215 * (1 - (x+y)/(2*size)) + 107 * (x+y)/(2*size)))
                b = 0
                raw_data += bytes([r, g, b])
        
        compressed = zlib.compress(raw_data)
        
        png = b'\x89PNG\r\n\x1a\n'
        png += png_chunk(b'IHDR', ihdr_data)
        png += png_chunk(b'IDAT', compressed)
        png += png_chunk(b'IEND', b'')
        
        with open(filename, 'wb') as f:
            f.write(png)
    
    assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'assets')
    os.makedirs(assets_dir, exist_ok=True)
    create_minimal_png(os.path.join(assets_dir, 'icon.png'), 512)
    print('✅ Minimal icon created')
PYEOF
fi

# Convert PNG to ICNS for macOS
if [ -f "$ASSETS_DIR/icon.png" ] && ! [ -f "$ASSETS_DIR/icon.icns" ]; then
  echo "   Converting to .icns..."
  ICONSET="$ASSETS_DIR/icon.iconset"
  mkdir -p "$ICONSET"
  
  for size in 16 32 64 128 256 512; do
    sips -z $size $size "$ASSETS_DIR/icon.png" --out "$ICONSET/icon_${size}x${size}.png" 2>/dev/null || true
    double=$((size * 2))
    sips -z $double $double "$ASSETS_DIR/icon.png" --out "$ICONSET/icon_${size}x${size}@2x.png" 2>/dev/null || true
  done
  
  iconutil -c icns "$ICONSET" -o "$ASSETS_DIR/icon.icns" 2>/dev/null || echo "   ⚠️  iconutil failed, using PNG"
  rm -rf "$ICONSET"
fi

# Create entitlements file
cat > "$ASSETS_DIR/entitlements.mac.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key><true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
  <key>com.apple.security.cs.disable-library-validation</key><true/>
  <key>com.apple.security.network.client</key><true/>
  <key>com.apple.security.network.server</key><true/>
</dict>
</plist>
EOF

# ── Build React frontend ──────────────────────────────────────
echo ""
echo "⚛️  Building React frontend..."
cd "$FRONTEND_DIR"
npm run build

echo "✅ React build complete"

# ── Package with electron-builder ────────────────────────────
echo ""
echo "📦 Packaging with electron-builder..."
echo "   This may take several minutes..."
cd "$FRONTEND_DIR"

# Build for current architecture
npm run electron:mac 2>&1 | grep -E "(Building|Packaging|Writing|✓|Error|error|warn)" || true

# ── Results ───────────────────────────────────────────────────
echo ""
echo "🎉 Build complete!"
echo ""

if [ -d "$DIST_DIR" ]; then
  echo "📁 Output files:"
  find "$DIST_DIR" -name "*.dmg" -o -name "*.zip" | while read f; do
    size=$(du -sh "$f" | cut -f1)
    echo "   ✅ $f ($size)"
  done
  echo ""
  echo "📂 Open output folder:"
  echo "   open $DIST_DIR"
  open "$DIST_DIR" 2>/dev/null || true
else
  echo "⚠️  No output directory found. Check build logs above."
fi

echo ""
echo "🐐 GOAT Royalty — Atlas AI Desktop App"
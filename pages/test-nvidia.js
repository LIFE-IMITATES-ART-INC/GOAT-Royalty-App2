/**
 * Simple test page for NVIDIA integration
 */

export default function TestNVIDIA() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#76b900' }}>NVIDIA Integration Test Page</h1>
      <p>✅ This page loaded successfully!</p>
      <p>📅 Time: {new Date().toLocaleString()}</p>
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px' }}>
        <h3>Quick Links:</h3>
        <ul>
          <li><a href="/nvidia-nim-hub" style={{ color: '#76b900' }}>NVIDIA NIM Hub</a></li>
          <li><a href="/super-shazam" style={{ color: '#76b900' }}>Super Shazam</a></li>
          <li><a href="/api/nvidia/models" style={{ color: '#76b900' }}>API: List Models</a></li>
        </ul>
      </div>
    </div>
  );
}
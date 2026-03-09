/**
 * Super GOAT Music Player
 * Full-featured music player with audio visualizer
 * Integrated into the Super GOAT Command Center
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Repeat, Shuffle, Heart, Share2, ListMusic, Maximize2,
  Music, Disc3
} from 'lucide-react';

const SuperGOATMusicPlayer = ({ minimized = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(75);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState({});
  const [showPlaylist, setShowPlaylist] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const playlist = [
    { title: 'ROYALTY FLOW', artist: 'DJ Speedy ft. Beyoncé', duration: '3:42', streams: '52.1M', bpm: 128, key: 'F# Minor' },
    { title: 'BLUE GOAT', artist: 'DJ Speedy ft. Waka Flocka', duration: '4:15', streams: '45.2M', bpm: 140, key: 'A Minor' },
    { title: 'CANT FUCK WITH ME', artist: 'DJ Speedy', duration: '3:28', streams: '38.7M', bpm: 135, key: 'C Minor' },
    { title: 'NERD BITCH', artist: 'DJ Speedy ft. Gucci Mane', duration: '3:55', streams: '31.4M', bpm: 130, key: 'G Minor' },
    { title: 'GOAT FORCE', artist: 'DJ Speedy', duration: '4:02', streams: '28.9M', bpm: 145, key: 'D Minor' },
    { title: 'ATLANTA NIGHTS', artist: 'DJ Speedy ft. Outkast', duration: '4:30', streams: '24.3M', bpm: 120, key: 'E Minor' },
    { title: 'DIAMOND CHAINS', artist: 'DJ Speedy ft. Jay-Z', duration: '3:48', streams: '21.7M', bpm: 138, key: 'B Minor' },
    { title: 'TRAP SYMPHONY', artist: 'DJ Speedy', duration: '5:12', streams: '18.5M', bpm: 128, key: 'A Minor' },
    { title: 'CROWN ME', artist: 'DJ Speedy ft. Gucci Mane', duration: '3:35', streams: '15.2M', bpm: 142, key: 'F Minor' },
    { title: 'MIDNIGHT HUSTLE', artist: 'DJ Speedy', duration: '4:08', streams: '12.8M', bpm: 132, key: 'C# Minor' },
  ];

  const track = playlist[currentTrack];
  const emojis = ['👑', '🔵', '🔥', '🤓', '🐐', '🌃', '💎', '🎹', '👑', '🌙'];

  // Audio visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    const bars = 64;
    const barWidth = (canvas.offsetWidth / bars) - 2;
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < bars; i++) {
        const barHeight = isPlaying 
          ? (Math.sin(Date.now() * 0.003 + i * 0.5) * 0.5 + 0.5) * (canvas.offsetHeight * 0.8) * (volume / 100)
          : 3;
        
        const x = i * (barWidth + 2);
        const y = canvas.offsetHeight - barHeight;
        
        const gradient = ctx.createLinearGradient(x, y, x, canvas.offsetHeight);
        gradient.addColorStop(0, '#6c5ce7');
        gradient.addColorStop(0.5, '#ffd700');
        gradient.addColorStop(1, '#00d2ff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, volume]);

  // Progress simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextTrack();
          return 0;
        }
        return prev + 0.15;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const nextTrack = useCallback(() => {
    if (shuffle) {
      setCurrentTrack(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentTrack(prev => (prev + 1) % playlist.length);
    }
    setProgress(0);
  }, [shuffle, playlist.length]);

  const prevTrack = () => {
    if (progress > 5) {
      setProgress(0);
    } else {
      setCurrentTrack(prev => prev === 0 ? playlist.length - 1 : prev - 1);
      setProgress(0);
    }
  };

  const toggleLike = (idx) => {
    setLiked(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const formatTime = (pct, duration) => {
    const parts = duration.split(':');
    const totalSec = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    const currentSec = Math.floor((pct / 100) * totalSec);
    const min = Math.floor(currentSec / 60);
    const sec = currentSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // Minimized player bar
  if (minimized) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '8px 16px', background: 'var(--sg-bg-secondary)',
        borderTop: '1px solid var(--sg-border)'
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: 'var(--sg-gradient-goat)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          animation: isPlaying ? 'spin 3s linear infinite' : 'none'
        }}>
          {emojis[currentTrack]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track.title}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--sg-text-muted)' }}>{track.artist}</div>
        </div>
        <button onClick={prevTrack} style={{ background: 'none', border: 'none', color: 'var(--sg-text-secondary)', cursor: 'pointer' }}>
          <SkipBack size={16} />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)} style={{
          background: 'var(--sg-gradient-goat)', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', color: 'white'
        }}>
          {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
        </button>
        <button onClick={nextTrack} style={{ background: 'none', border: 'none', color: 'var(--sg-text-secondary)', cursor: 'pointer' }}>
          <SkipForward size={16} />
        </button>
        <div style={{ width: '80px', height: '3px', background: 'var(--sg-bg-primary)', borderRadius: '2px' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--sg-gradient-goat)', borderRadius: '2px' }} />
        </div>
      </div>
    );
  }

  // Full player
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Visualizer */}
      <div style={{
        position: 'relative', height: '180px', background: 'var(--sg-bg-primary)',
        borderRadius: 'var(--sg-radius)', overflow: 'hidden', marginBottom: '20px'
      }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: 'rgba(0,0,0,0.6)', borderRadius: '8px', padding: '6px 12px',
          fontSize: '11px', color: 'var(--sg-accent-cyan)'
        }}>
          {track.bpm} BPM • {track.key}
        </div>
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: isPlaying ? 'rgba(0,230,118,0.2)' : 'rgba(255,71,87,0.2)',
          borderRadius: '8px', padding: '6px 12px', fontSize: '11px',
          color: isPlaying ? 'var(--sg-accent-green)' : 'var(--sg-accent-red)'
        }}>
          {isPlaying ? '● LIVE' : '○ PAUSED'}
        </div>
      </div>

      {/* Now Playing */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '16px', margin: '0 auto 12px',
          background: 'var(--sg-gradient-goat)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '36px', boxShadow: 'var(--sg-shadow-gold)',
          animation: isPlaying ? 'sgFloat 3s ease-in-out infinite' : 'none'
        }}>
          {emojis[currentTrack]}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{track.title}</div>
        <div style={{ fontSize: '14px', color: 'var(--sg-text-muted)', marginBottom: '4px' }}>{track.artist}</div>
        <div style={{ fontSize: '12px', color: 'var(--sg-accent-cyan)' }}>🎧 {track.streams} streams</div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px', padding: '0 8px' }}>
        <div style={{
          width: '100%', height: '6px', background: 'var(--sg-bg-primary)',
          borderRadius: '3px', cursor: 'pointer', position: 'relative'
        }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress((e.clientX - rect.left) / rect.width * 100);
          }}
        >
          <div style={{
            width: `${progress}%`, height: '100%',
            background: 'var(--sg-gradient-goat)', borderRadius: '3px',
            transition: 'width 0.1s linear'
          }} />
          <div style={{
            position: 'absolute', top: '-4px', left: `${progress}%`,
            width: '14px', height: '14px', borderRadius: '50%',
            background: 'var(--sg-accent-gold)', transform: 'translateX(-50%)',
            boxShadow: 'var(--sg-shadow-gold)'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--sg-text-muted)' }}>
          <span>{formatTime(progress, track.duration)}</span>
          <span>{track.duration}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
        <button onClick={() => setShuffle(!shuffle)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: shuffle ? 'var(--sg-accent-purple)' : 'var(--sg-text-muted)'
        }}>
          <Shuffle size={18} />
        </button>
        <button onClick={prevTrack} className="sg-btn sg-btn-ghost sg-btn-icon">
          <SkipBack size={20} />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)} style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--sg-gradient-goat)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'white', boxShadow: 'var(--sg-shadow-glow)',
          transition: 'var(--sg-transition)'
        }}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '3px' }} />}
        </button>
        <button onClick={nextTrack} className="sg-btn sg-btn-ghost sg-btn-icon">
          <SkipForward size={20} />
        </button>
        <button onClick={() => setRepeat(!repeat)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: repeat ? 'var(--sg-accent-purple)' : 'var(--sg-text-muted)'
        }}>
          <Repeat size={18} />
        </button>
      </div>

      {/* Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px', marginBottom: '20px' }}>
        <button onClick={() => setMuted(!muted)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sg-text-muted)' }}>
          {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range" min="0" max="100" value={muted ? 0 : volume}
          onChange={(e) => { setVolume(parseInt(e.target.value)); setMuted(false); }}
          style={{ flex: 1, accentColor: '#6c5ce7' }}
        />
        <span style={{ fontSize: '11px', color: 'var(--sg-text-muted)', width: '30px' }}>{muted ? 0 : volume}%</span>
      </div>

      {/* Playlist Toggle */}
      <button onClick={() => setShowPlaylist(!showPlaylist)} className="sg-btn sg-btn-secondary" style={{ width: '100%', marginBottom: '12px' }}>
        <ListMusic size={16} /> {showPlaylist ? 'Hide' : 'Show'} Playlist ({playlist.length} tracks)
      </button>

      {/* Playlist */}
      {showPlaylist && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {playlist.map((t, i) => (
            <div key={i} onClick={() => { setCurrentTrack(i); setProgress(0); setIsPlaying(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                background: i === currentTrack ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
                borderLeft: i === currentTrack ? '3px solid var(--sg-accent-purple)' : '3px solid transparent',
                marginBottom: '4px', transition: 'var(--sg-transition)'
              }}
            >
              <span style={{ width: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--sg-text-muted)' }}>
                {i === currentTrack && isPlaying ? '▶' : i + 1}
              </span>
              <span style={{ fontSize: '16px' }}>{emojis[i]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px', fontWeight: i === currentTrack ? '700' : '500',
                  color: i === currentTrack ? 'var(--sg-accent-purple)' : 'var(--sg-text-primary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {t.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sg-text-muted)' }}>{t.artist}</div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--sg-text-muted)' }}>{t.duration}</span>
              <button onClick={(e) => { e.stopPropagation(); toggleLike(i); }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: liked[i] ? 'var(--sg-accent-red)' : 'var(--sg-text-muted)'
              }}>
                <Heart size={14} fill={liked[i] ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperGOATMusicPlayer;
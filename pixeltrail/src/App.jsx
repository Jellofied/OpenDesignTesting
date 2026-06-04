import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sliders, 
  Layers, 
  Settings, 
  Terminal, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Info,
  RefreshCw
} from 'lucide-react';
import PixelTrail from './PixelTrail';
import './App.css';

const PRESETS = [
  {
    name: "Cyber Orange",
    desc: "Default dynamic gooey grid",
    settings: {
      gridSize: 73,
      trailSize: 0.09,
      maxAge: 850,
      interpolate: 2.9,
      color: "#F97316",
      gooey: true,
      gooStrength: 2
    }
  },
  {
    name: "Cosmic Nebula",
    desc: "Slow fading heavy purple goo",
    settings: {
      gridSize: 42,
      trailSize: 0.14,
      maxAge: 1200,
      interpolate: 4.5,
      color: "#8B5CF6",
      gooey: true,
      gooStrength: 4
    }
  },
  {
    name: "Digital Matrix",
    desc: "High density responsive green rain",
    settings: {
      gridSize: 100,
      trailSize: 0.06,
      maxAge: 450,
      interpolate: 1.8,
      color: "#10B981",
      gooey: false,
      gooStrength: 1
    }
  },
  {
    name: "Liquid Ice",
    desc: "Fast interpolation cold cyan",
    settings: {
      gridSize: 60,
      trailSize: 0.1,
      maxAge: 700,
      interpolate: 7.0,
      color: "#06B6D4",
      gooey: true,
      gooStrength: 2
    }
  }
];

const COLORS = [
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#8B5CF6", // Purple
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#EAB308", // Yellow
  "#EF4444", // Red
  "#FFFFFF"  // White
];

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePreset, setActivePreset] = useState("Cyber Orange");
  
  // PixelTrail settings states
  const [gridSize, setGridSize] = useState(73);
  const [trailSize, setTrailSize] = useState(0.09);
  const [maxAge, setMaxAge] = useState(850);
  const [interpolate, setInterpolate] = useState(2.9);
  const [color, setColor] = useState("#F97316");
  const [gooeyEnabled, setGooeyEnabled] = useState(true);
  const [gooStrength, setGooStrength] = useState(2);

  // Telemetry states
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [fps, setFps] = useState(60);
  const [logs, setLogs] = useState([]);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const canvasRef = useRef(null);

  // Add system telemetry logs
  const addLog = useCallback((param, value) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs((prev) => [
      { id: Date.now() + Math.random(), time: timeStr, param, value },
      ...prev.slice(0, 24)
    ]);
  }, []);

  // Initialize terminal logs
  useEffect(() => {
    addLog("SYSTEM", "Dashboard initialized");
    addLog("PIXEL_TRAIL", "Canvas engine online");
  }, [addLog]);

  // FPS calculation loop
  useEffect(() => {
    let animationFrameId;
    
    const calculateFps = () => {
      frameCount.current += 1;
      const now = performance.now();
      const delta = now - lastTime.current;
      
      if (delta >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      animationFrameId = requestAnimationFrame(calculateFps);
    };
    
    animationFrameId = requestAnimationFrame(calculateFps);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Apply preset settings
  const applyPreset = (preset) => {
    setActivePreset(preset.name);
    const { settings } = preset;
    setGridSize(settings.gridSize);
    setTrailSize(settings.trailSize);
    setMaxAge(settings.maxAge);
    setInterpolate(settings.interpolate);
    setColor(settings.color);
    setGooeyEnabled(settings.gooey);
    setGooStrength(settings.gooStrength);
    
    addLog("PRESET_APPLIED", preset.name);
  };

  // Track mouse coordinates on canvas area
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    });
  };

  // Handle changes and log them
  const handleGridSizeChange = (val) => {
    setGridSize(val);
    addLog("GRID_SIZE", val);
  };

  const handleTrailSizeChange = (val) => {
    setTrailSize(val);
    addLog("TRAIL_SIZE", val.toFixed(3));
  };

  const handleMaxAgeChange = (val) => {
    setMaxAge(val);
    addLog("MAX_AGE", `${val}ms`);
  };

  const handleInterpolateChange = (val) => {
    setInterpolate(val);
    addLog("INTERPOLATE", val.toFixed(1));
  };

  const handleColorChange = (val) => {
    setColor(val);
    addLog("PIXEL_COLOR", val);
  };

  const handleGooeyToggle = (val) => {
    setGooeyEnabled(val);
    addLog("GOOEY_FILTER", val ? "ACTIVE" : "INACTIVE");
  };

  const handleGooStrengthChange = (val) => {
    setGooStrength(val);
    addLog("GOOEY_STRENGTH", val);
  };

  const handleReset = () => {
    const defaults = PRESETS[0].settings;
    setActivePreset("Cyber Orange");
    setGridSize(defaults.gridSize);
    setTrailSize(defaults.trailSize);
    setMaxAge(defaults.maxAge);
    setInterpolate(defaults.interpolate);
    setColor(defaults.color);
    setGooeyEnabled(defaults.gooey);
    setGooStrength(defaults.gooStrength);
    addLog("SYSTEM", "Restored default settings");
  };

  // Build gooey filter configuration object
  const gooeyFilter = gooeyEnabled ? {
    id: "custom-goo-filter",
    strength: gooStrength
  } : undefined;

  return (
    <div className="dashboard-container">
      {/* Sidebar Controls Panel */}
      <aside className={`sidebar-panel ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-header">
          <div className="logo-glow">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="logo-title">Pixel Trail</span>
            <span className="logo-sub">React Shader Sandbox</span>
          </div>
        </div>

        {/* Presets Card */}
        <div className="glass-card">
          <div className="card-title">
            <Layers size={14} style={{ color: 'var(--color-primary)' }} />
            <span>Preset Profiles</span>
          </div>
          <div className="presets-grid">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                className={`preset-btn ${activePreset === preset.name ? 'active' : ''}`}
                onClick={() => applyPreset(preset)}
              >
                <span>{preset.name}</span>
                <span className="preset-desc">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trail Parameters Control Card */}
        <div className="glass-card">
          <div className="card-title">
            <Sliders size={14} style={{ color: 'var(--color-secondary)' }} />
            <span>Sandbox Parameters</span>
          </div>
          
          {/* Grid Size */}
          <div className="control-group">
            <div className="control-label-wrapper">
              <label className="control-label">Grid Density</label>
              <span className="control-value">{gridSize} px</span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              step="1"
              value={gridSize}
              onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
              className="control-slider"
            />
          </div>

          {/* Trail Size */}
          <div className="control-group">
            <div className="control-label-wrapper">
              <label className="control-label">Radius (Size)</label>
              <span className="control-value">{trailSize.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.4"
              step="0.005"
              value={trailSize}
              onChange={(e) => handleTrailSizeChange(parseFloat(e.target.value))}
              className="control-slider"
              style={{ accentColor: 'var(--color-secondary)' }}
            />
          </div>

          {/* Max Age */}
          <div className="control-group">
            <div className="control-label-wrapper">
              <label className="control-label">Trail Duration</label>
              <span className="control-value">{maxAge} ms</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={maxAge}
              onChange={(e) => handleMaxAgeChange(parseInt(e.target.value))}
              className="control-slider"
              style={{ accentColor: 'var(--color-purple)' }}
            />
          </div>

          {/* Interpolation */}
          <div className="control-group">
            <div className="control-label-wrapper">
              <label className="control-label">Interpolate Speed</label>
              <span className="control-value">{interpolate.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10.0"
              step="0.1"
              value={interpolate}
              onChange={(e) => handleInterpolateChange(parseFloat(e.target.value))}
              className="control-slider"
            />
          </div>
        </div>

        {/* Aesthetics settings card */}
        <div className="glass-card">
          <div className="card-title">
            <Settings size={14} style={{ color: 'var(--color-purple)' }} />
            <span>Aesthetics & Filter</span>
          </div>

          {/* Color Select */}
          <div className="control-group">
            <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Pixel Shader Color</label>
            <div className="color-select-grid">
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-dot ${color.toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => handleColorChange(c)}
                />
              ))}
            </div>
            
            <div className="custom-color-input-wrapper">
              <input
                type="color"
                value={color.startsWith('#') ? color : "#ffffff"}
                onChange={(e) => handleColorChange(e.target.value)}
                className="custom-color-picker"
              />
              <span className="custom-color-picker-label">Custom Palette Spectrum</span>
            </div>
          </div>

          {/* Gooey Filter Switch */}
          <div className="control-group" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
            <div className="switch-label-wrapper">
              <label className="control-label">SVG Gooey Filter</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={gooeyEnabled}
                  onChange={(e) => handleGooeyToggle(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
          </div>

          {/* Gooey Strength slider */}
          {gooeyEnabled && (
            <div className="control-group">
              <div className="control-label-wrapper">
                <label className="control-label">Gooey StdDeviation</label>
                <span className="control-value">{gooStrength}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={gooStrength}
                onChange={(e) => handleGooStrengthChange(parseInt(e.target.value))}
                className="control-slider"
                style={{ accentColor: 'var(--color-purple)' }}
              />
            </div>
          )}
        </div>

        {/* Real-time terminal diagnostic card */}
        <div className="glass-card terminal-card">
          <div className="card-title">
            <Terminal size={14} style={{ color: 'var(--text-muted)' }} />
            <span>Diagnostics Feed</span>
          </div>
          <div className="terminal-log-content">
            {logs.map((log) => (
              <div key={log.id} className="log-entry">
                <span className="log-time">[{log.time}]</span> <span className="log-param">{log.param}</span>: {log.value}
              </div>
            ))}
          </div>
          <button 
            onClick={handleReset}
            className="preset-btn" 
            style={{ 
              marginTop: '0.75rem', 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              width: '100%',
              padding: '0.4rem',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <RefreshCw size={12} />
            <span>Realign System Defaults</span>
          </button>
        </div>
      </aside>

      {/* Sidebar panel expand/collapse button */}
      <button 
        className="sidebar-toggle-btn"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Interactive Canvas sandbox Area */}
      <main 
        ref={canvasRef}
        className="canvas-container"
        onMouseMove={handleMouseMove}
      >
        {/* Futuristic Background grid overlay */}
        <div className="grid-bg-overlay"></div>

        {/* Real-time Telemetry Overlay */}
        <div className="telemetry-hud">
          <div className="hud-item">
            <span>POINTER_COORD_X:</span>
            <span className="hud-val">{mousePos.x}px</span>
          </div>
          <div className="hud-item">
            <span>POINTER_COORD_Y:</span>
            <span className="hud-val">{mousePos.y}px</span>
          </div>
          <div className="hud-item">
            <span>RENDER_MATRIX_FPS:</span>
            <span className="hud-val" style={{ color: fps > 45 ? '#10B981' : '#F59E0B' }}>{fps} HZ</span>
          </div>
          <div className="hud-item">
            <span>TRAIL_COLOR_HEX:</span>
            <span className="hud-val" style={{ color: color }}>{color.toUpperCase()}</span>
          </div>
        </div>

        {/* Instructions Overlay */}
        <div className="instructions-overlay">
          <div className="glow-dot"></div>
          <span>Hover / Drag mouse across screen to draw trail</span>
        </div>

        {/* The Three.js Canvas and shader scene */}
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <PixelTrail
            gridSize={gridSize}
            trailSize={trailSize}
            maxAge={maxAge}
            interpolate={interpolate}
            color={color}
            gooeyFilter={gooeyFilter}
          />
        </div>
      </main>
    </div>
  );
}

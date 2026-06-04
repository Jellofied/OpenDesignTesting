import React, { useState, useRef } from 'react';
import { 
  Eye, 
  Code, 
  RotateCcw, 
  Heart, 
  Clipboard, 
  Check 
} from 'lucide-react';
import PixelTrail from './PixelTrail';
import './App.css';

export default function App() {
  // Tab control
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "code"
  const [isLiked, setIsLiked] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy Prompt");

  // Configuration settings (matching the mockup values exactly as default)
  const [gridSize, setGridSize] = useState(73);
  const [trailSize, setTrailSize] = useState(0.09);
  const [maxAge, setMaxAge] = useState(850);
  const [interpolate, setInterpolate] = useState(2.9);
  const [color, setColor] = useState("#f97316");
  const [gooeyEnabled, setGooeyEnabled] = useState(true);
  const [gooStrength, setGooStrength] = useState(1);

  // Key to force reset/re-render of PixelTrail canvas component
  const [canvasKey, setCanvasKey] = useState(0);

  const colorInputRef = useRef(null);

  const handleReset = () => {
    setGridSize(73);
    setTrailSize(0.09);
    setMaxAge(850);
    setInterpolate(2.9);
    setColor("#f97316");
    setGooeyEnabled(true);
    setGooStrength(1);
    setCanvasKey(prev => prev + 1);
  };

  const handleCanvasRefresh = () => {
    setCanvasKey(prev => prev + 1);
  };

  const handleCopyPrompt = () => {
    const gooeyConfig = gooeyEnabled ? `gooeyFilter={{ id: "custom-goo-filter", strength: ${gooStrength} }} gooStrength={${gooStrength}}` : "";
    const promptString = `<PixelTrail
    gridSize={${gridSize}}
    trailSize={${trailSize}}
    maxAge={${maxAge}}
    interpolate={${interpolate}}
    color="${color}"
    ${gooeyConfig}
/>`;
    navigator.clipboard.writeText(promptString);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus("Copy Prompt"), 1500);
  };

  const codeSnippet = `import PixelTrail from './PixelTrail';

export default function Example() {
  return (
    <div style={{ height: '500px', position: 'relative', overflow: 'hidden'}}>
      <PixelTrail
        gridSize={${gridSize}}
        trailSize={${trailSize}}
        maxAge={${maxAge}}
        interpolate={${interpolate}}
        color="${color}"
        ${gooeyEnabled ? `gooeyFilter={{ id: "custom-goo-filter", strength: ${gooStrength} }}` : '/* gooeyFilter disabled */'}
        gooStrength={${gooStrength}}
      />
    </div>
  );
}`;

  const gooeyFilter = gooeyEnabled ? {
    id: "custom-goo-filter",
    strength: gooStrength
  } : undefined;

  return (
    <div className="app-wrapper">
      {/* Title block */}
      <div className="header-row">
        <h1 className="header-title">Pixel Trail</h1>
        
        {/* Tabs & Buttons row */}
        <div className="actions-row">
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab("preview")}
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab("code")}
            >
              <Code size={14} />
              <span>Code</span>
            </button>
          </div>

          <div className="button-group">
            <button className="action-btn" onClick={handleReset} title="Reset Settings">
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
            <button 
              className={`action-btn heart-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => setIsLiked(!isLiked)}
              title={isLiked ? "Unlike Component" : "Like Component"}
            >
              <Heart size={14} fill={isLiked ? "#ef4444" : "none"} color={isLiked ? "#ef4444" : "currentColor"} />
            </button>
            <button className="action-btn" onClick={handleCopyPrompt}>
              {copyStatus === "Copied!" ? <Check size={14} style={{ color: '#10b981' }} /> : <Clipboard size={14} />}
              <span>{copyStatus}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Display Window */}
      <div className="preview-box">
        {activeTab === 'preview' ? (
          <>
            {/* Watermark instructions */}
            <div className="watermark-text">Move Cursor.</div>
            
            {/* Canvas Reload Button */}
            <button 
              className="canvas-refresh-btn" 
              onClick={handleCanvasRefresh} 
              title="Clear & Refresh Trail Scene"
            >
              <RotateCcw size={16} />
            </button>

            {/* PixelTrail Component Frame */}
            <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}>
              <PixelTrail
                key={canvasKey}
                gridSize={gridSize}
                trailSize={trailSize}
                maxAge={maxAge}
                interpolate={interpolate}
                color={color}
                gooeyFilter={gooeyFilter}
              />
            </div>
          </>
        ) : (
          <div className="code-container">
            <pre><code>{codeSnippet}</code></pre>
          </div>
        )}
      </div>

      {/* Customize Panels Header */}
      <h2 className="customize-header">Customize</h2>

      {/* Settings Grid */}
      <div className="customize-grid">
        {/* Grid Size */}
        <div className="customize-card">
          <span className="card-label">Grid Size</span>
          <input
            type="range"
            min="10"
            max="120"
            step="1"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            className="card-slider"
          />
          <span className="card-value">{gridSize}</span>
        </div>

        {/* Trail Size */}
        <div className="customize-card">
          <span className="card-label">Trail Size</span>
          <input
            type="range"
            min="0.01"
            max="0.4"
            step="0.005"
            value={trailSize}
            onChange={(e) => setTrailSize(parseFloat(e.target.value))}
            className="card-slider"
          />
          <span className="card-value">{trailSize.toFixed(2)}</span>
        </div>

        {/* Max Age */}
        <div className="customize-card">
          <span className="card-label">Max Age</span>
          <input
            type="range"
            min="100"
            max="2000"
            step="25"
            value={maxAge}
            onChange={(e) => setMaxAge(parseInt(e.target.value))}
            className="card-slider"
          />
          <span className="card-value">{maxAge}</span>
        </div>

        {/* Interpolate */}
        <div className="customize-card">
          <span className="card-label">Interpolate</span>
          <input
            type="range"
            min="0.1"
            max="10.0"
            step="0.1"
            value={interpolate}
            onChange={(e) => setInterpolate(parseFloat(e.target.value))}
            className="card-slider"
          />
          <span className="card-value">{interpolate.toFixed(1)}</span>
        </div>

        {/* Color Picker Card */}
        <div className="customize-card" onClick={() => colorInputRef.current?.click()}>
          <span className="card-label">Color</span>
          <button className="color-picker-trigger" type="button">
            <input 
              type="color"
              ref={colorInputRef}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ display: 'none' }}
            />
            <div className="color-indicator" style={{ backgroundColor: color }} />
            <span className="color-hex">{color}</span>
          </button>
        </div>

        {/* Gooey Filter Switch */}
        <div className="customize-card">
          <span className="card-label">Gooey Filter</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={gooeyEnabled}
              onChange={(e) => setGooeyEnabled(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Gooey Strength */}
        {gooeyEnabled && (
          <div className="customize-card">
            <span className="card-label">Gooey Strength</span>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={gooStrength}
              onChange={(e) => setGooStrength(parseInt(e.target.value))}
              className="card-slider"
            />
            <span className="card-value">{gooStrength}</span>
          </div>
        )}
      </div>
    </div>
  );
}

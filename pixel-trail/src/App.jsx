import { useState } from 'react';
import PixelTrail from './components/PixelTrail/PixelTrail';
import './App.css';

export default function App() {
  // Configured with exact requested default props from the URL
  const [gridSize, setGridSize] = useState(73);
  const [interpolate, setInterpolate] = useState(2.9);
  const [color, setColor] = useState('#F97316');
  const [trailSize, setTrailSize] = useState(0.09);
  const [maxAge, setMaxAge] = useState(850);
  const [gooStrength, setGooStrength] = useState(1);
  const [gooeyEnabled, setGooeyEnabled] = useState(true);

  // Preset configuration matching the exact requested URL parameters
  const resetToDefault = () => {
    setGridSize(73);
    setInterpolate(2.9);
    setColor('#F97316');
    setTrailSize(0.09);
    setMaxAge(850);
    setGooStrength(1);
    setGooeyEnabled(true);
  };

  return (
    <div className="app-container">
      {/* Interactive Pixel Trail Background */}
      <div className="background-trail">
        <PixelTrail
          gridSize={gridSize}
          trailSize={trailSize}
          maxAge={maxAge}
          interpolate={interpolate}
          color={color}
          gooeyFilter={gooeyEnabled ? { id: "custom-goo-filter", strength: gooStrength * 10 } : null}
        />
      </div>

      {/* Main UI Overlay */}
      <main className="content-overlay">
        <header className="app-header">
          <div className="brand">
            <span className="sparkle">✦</span>
            <h1>Pixel Trail</h1>
          </div>
          <div className="links">
            <a 
              href="https://github.com/Jellofied/OpenDesignTesting" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="github-badge"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              Jellofied/OpenDesignTesting
            </a>
          </div>
        </header>

        <section className="dashboard-grid">
          {/* Dashboard Control Panel */}
          <div className="glass-panel control-panel">
            <h2>Interactive Controls</h2>
            <p className="panel-desc">Move your cursor around the screen to see the trail. Tweak the configurations below to see them update in real-time.</p>

            <div className="control-group">
              <label>
                <span>Grid Size</span>
                <span className="value-badge">{gridSize}</span>
              </label>
              <input 
                type="range" 
                min="10" 
                max="150" 
                value={gridSize} 
                onChange={(e) => setGridSize(parseInt(e.target.value))} 
              />
              <span className="field-desc">Density of pixels in the grid</span>
            </div>

            <div className="control-group">
              <label>
                <span>Interpolate</span>
                <span className="value-badge">{interpolate.toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                min="0.1" 
                max="10.0" 
                step="0.1" 
                value={interpolate} 
                onChange={(e) => setInterpolate(parseFloat(e.target.value))} 
              />
              <span className="field-desc">Trail movement smoothing and connection</span>
            </div>

            <div className="control-group">
              <label>
                <span>Trail Size</span>
                <span className="value-badge">{trailSize.toFixed(2)}</span>
              </label>
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01" 
                value={trailSize} 
                onChange={(e) => setTrailSize(parseFloat(e.target.value))} 
              />
              <span className="field-desc">Radius of the mouse interaction zone</span>
            </div>

            <div className="control-group">
              <label>
                <span>Max Age</span>
                <span className="value-badge">{maxAge}ms</span>
              </label>
              <input 
                type="range" 
                min="100" 
                max="3000" 
                step="50" 
                value={maxAge} 
                onChange={(e) => setMaxAge(parseInt(e.target.value))} 
              />
              <span className="field-desc">How long the pixels stay active</span>
            </div>

            <div className="control-group">
              <label>
                <span>Trail Color</span>
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  className="color-picker-input"
                />
              </label>
              <span className="field-desc">Custom hex color for the glowing pixels</span>
            </div>

            <div className="control-group toggle-group">
              <label className="toggle-label">
                <span>Gooey Filter</span>
                <input 
                  type="checkbox" 
                  checked={gooeyEnabled} 
                  onChange={(e) => setGooeyEnabled(e.target.checked)} 
                />
              </label>
              {gooeyEnabled && (
                <div className="sub-control">
                  <label>
                    <span>Gooey Strength</span>
                    <span className="value-badge">{gooStrength.toFixed(1)}</span>
                  </label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="5.0" 
                    step="0.1" 
                    value={gooStrength} 
                    onChange={(e) => setGooStrength(parseFloat(e.target.value))} 
                  />
                </div>
              )}
            </div>

            <button className="reset-btn" onClick={resetToDefault}>
              Reset to URL Default (orange)
            </button>
          </div>

          {/* Code Showcase Panel */}
          <div className="glass-panel code-panel">
            <h2>Active Configuration</h2>
            <p className="panel-desc">Here are the active React props currently driving the rendering pipeline:</p>
            
            <div className="code-block-container">
              <pre>
                <code>{`// Pixel Trail Component Usage
<PixelTrail
  gridSize={${gridSize}}
  trailSize={${trailSize}}
  maxAge={${maxAge}}
  interpolate={${interpolate}}
  color="${color}"
  gooeyFilter={${gooeyEnabled ? `{ id: "custom-goo-filter", strength: ${gooStrength * 10} }` : 'null'}}
/>`}</code>
              </pre>
            </div>

            <div className="features-info">
              <h3>Creative UI Component</h3>
              <p>The Pixel Trail utilizes WebGL and custom fragment shaders through React Three Fiber. It maps mouse coordinate deltas onto a custom texture grid, which is subsequently interpolated and run through an SVG Gaussian Blur/Color Matrix filter to produce an organic, gooey, fluid pixel effect.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

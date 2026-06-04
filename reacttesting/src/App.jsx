import React, { useState, useEffect, useRef } from 'react';
import { 
  Orbit, 
  Rocket, 
  Moon, 
  Sparkles, 
  Activity, 
  RefreshCw, 
  Plus, 
  Cpu, 
  Gauge, 
  Compass, 
  Zap, 
  User, 
  Globe,
  Radio,
  Flame,
  Wrench,
  Dna
} from 'lucide-react';
import styles from './App.module.css';

// Initial items in the gravity chamber
const INITIAL_ITEMS = [
  {
    id: 'astronaut',
    name: 'Cmdr. Higgins',
    desc: 'Astronaut (EVA Unit)',
    type: 'astronaut',
    icon: User,
    x: 80,
    y: 350,
    vx: 1.5,
    vy: -1,
    rotation: 12,
    rotSpeed: 0.1,
    width: 170,
    height: 64,
    mass: 1.2
  },
  {
    id: 'satellite',
    name: 'AURA-9 Probe',
    desc: 'Comms Telemetry',
    type: 'satellite',
    icon: Orbit,
    x: 320,
    y: 320,
    vx: -2,
    vy: -2,
    rotation: -45,
    rotSpeed: -0.2,
    width: 180,
    height: 64,
    mass: 2.0
  },
  {
    id: 'core',
    name: 'Quantum Core',
    desc: 'Power System (Stable)',
    type: 'core',
    icon: Cpu,
    x: 580,
    y: 360,
    vx: 1,
    vy: -0.5,
    rotation: 0,
    rotSpeed: 0.3,
    width: 175,
    height: 64,
    mass: 3.5
  },
  {
    id: 'capsule',
    name: 'Supply Capsule',
    desc: 'Hydration & Rations',
    type: 'capsule',
    icon: Radio,
    x: 200,
    y: 380,
    vx: -0.5,
    vy: 0,
    rotation: 5,
    rotSpeed: 0.05,
    width: 175,
    height: 64,
    mass: 1.8
  }
];

const AVAILABLE_SPAWNS = [
  { name: 'Drifting Astronaut', desc: 'Slightly panicked', icon: User, type: 'astronaut', mass: 1.1, width: 170, height: 64 },
  { name: 'Sputnik Replica', desc: 'Beeping in Russian', icon: Orbit, type: 'satellite', mass: 1.5, width: 180, height: 64 },
  { name: 'Comet Fragment', desc: 'Icy debris', icon: Flame, type: 'meteor', mass: 0.8, width: 160, height: 64 },
  { name: 'Nanite Tank', desc: 'Warning: Pressurized', icon: Dna, type: 'core', mass: 2.5, width: 170, height: 64 },
  { name: 'Space Wrench', desc: 'Standard 12mm', icon: Wrench, type: 'tool', mass: 0.5, width: 150, height: 64 },
  { name: 'Alien Bio-Pod', desc: 'Glowing inside', icon: Sparkles, type: 'alien', mass: 1.3, width: 165, height: 64 }
];

export default function App() {
  // App Gravity States
  const [isAntigravity, setIsAntigravity] = useState(false);
  const [zeroGDuration, setZeroGDuration] = useState(0);
  
  // Customizable Physics Constants
  const [normalGravity, setNormalGravity] = useState(0.4);      // pixels/frame^2
  const [antigravityUpdraft, setAntigravityUpdraft] = useState(0.15); // pixels/frame^2 (upward acceleration)
  const [dampening, setDampening] = useState(0.985);             // Air resistance multiplier
  const [driftSpeed, setDriftSpeed] = useState(0.12);            // Random brownian motion in zero-g
  
  // Interactive Items State
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [logs, setLogs] = useState([
    { time: '00:00:00', text: 'SYSTEM: Gravity chamber initialized.' },
    { time: '00:00:00', text: 'STATUS: Standard Earth-G (9.8m/s²) simulated.' }
  ]);

  // Chamber Ref to handle bounds
  const chamberRef = useRef(null);
  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);
  
  // Dragging states
  const draggedItemId = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const prevMousePos = useRef({ x: 0, y: 0 });
  const dragVelocity = useRef({ x: 0, y: 0 });

  // Add system telemetry log helper
  const addLog = (text) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs((prev) => [{ time: timeStr, text }, ...prev.slice(0, 49)]);
  };

  // Zero-G timer tick
  useEffect(() => {
    let timerInterval;
    if (isAntigravity) {
      timerInterval = setInterval(() => {
        setZeroGDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isAntigravity]);

  // Toggle gravity field state
  const handleToggleAntigravity = () => {
    setIsAntigravity((prev) => {
      const nextState = !prev;
      if (nextState) {
        addLog('CRITICAL: Antigravity field active. Updraft generator online.');
      } else {
        addLog('SYSTEM: Gravity re-engaged. Containment field stabilized.');
      }
      return nextState;
    });
  };

  // Reset simulation items and timer
  const handleResetChamber = () => {
    setItems(INITIAL_ITEMS.map((item, idx) => ({
      ...item,
      x: 80 + idx * 150,
      y: 100 + (idx % 2) * 150,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.6
    })));
    setZeroGDuration(0);
    addLog('SYSTEM: Gravity chamber reset. Realigned all particles.');
  };

  // Spawn new physical object
  const handleSpawnItem = () => {
    if (!chamberRef.current) return;
    const rect = chamberRef.current.getBoundingClientRect();
    const blueprint = AVAILABLE_SPAWNS[Math.floor(Math.random() * AVAILABLE_SPAWNS.length)];
    
    const newItem = {
      id: `${blueprint.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: blueprint.name,
      desc: blueprint.desc,
      type: blueprint.type,
      icon: blueprint.icon,
      x: Math.random() * (rect.width - blueprint.width),
      y: isAntigravity ? rect.height - 100 : 50,
      vx: (Math.random() - 0.5) * 6,
      vy: isAntigravity ? -4 - Math.random() * 4 : Math.random() * 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5,
      width: blueprint.width,
      height: blueprint.height,
      mass: blueprint.mass
    };

    setItems((prev) => [...prev, newItem]);
    addLog(`SPAWN: "${newItem.name}" injected into containment chamber.`);
  };

  // Remove all spawned items
  const handleClearChamber = () => {
    setItems([]);
    addLog('SYSTEM: Chamber cleared. Zero gravity vacuum active.');
  };

  // Main physics loop
  const updatePhysics = (time) => {
    if (!chamberRef.current) {
      requestRef.current = requestAnimationFrame(updatePhysics);
      return;
    }

    const rect = chamberRef.current.getBoundingClientRect();
    const chamberW = rect.width;
    const chamberH = rect.height;

    // restitution: bounce coefficient
    const restitution = 0.55;

    setItems((prevItems) => {
      return prevItems.map((item) => {
        // If this item is currently dragged, handle it separately
        if (item.id === draggedItemId.current) {
          // Keep item pinned to mouse position (dragVelocity tracks client change)
          let targetX = mousePos.current.x - rect.left - dragOffset.current.x;
          let targetY = mousePos.current.y - rect.top - dragOffset.current.y;

          // Clamping within chamber boundaries
          targetX = Math.max(0, Math.min(chamberW - item.width, targetX));
          targetY = Math.max(0, Math.min(chamberH - item.height, targetY));

          // Calculate continuous velocities based on drag motion
          const computedVx = dragVelocity.current.x;
          const computedVy = dragVelocity.current.y;

          // Drag adds interactive rotation
          const newRot = item.rotation + computedVx * 0.4;

          return {
            ...item,
            x: targetX,
            y: targetY,
            vx: computedVx,
            vy: computedVy,
            rotation: newRot,
            rotSpeed: computedVx * 0.15
          };
        }

        // Apply physical laws: gravity and updraft
        let currentVy = item.vy;
        let currentVx = item.vx;
        let currentRotSpeed = item.rotSpeed;

        if (isAntigravity) {
          // Antigravity mode: items accelerate UPWARDS
          currentVy -= antigravityUpdraft / item.mass;
          // Apply a gentle lateral drift / brownian motion
          currentVx += (Math.random() - 0.5) * driftSpeed;
          // Slow down or speed up rotation slowly
          currentRotSpeed += (Math.random() - 0.5) * 0.02;
          // Cap rotation speed in zero-G
          currentRotSpeed = Math.max(-2.5, Math.min(2.5, currentRotSpeed));
        } else {
          // Normal mode: acceleration DOWNWARDS (gravity)
          currentVy += normalGravity * item.mass;
        }

        // Apply air resistance / drag
        currentVx *= dampening;
        currentVy *= dampening;

        // Position integration
        let newX = item.x + currentVx;
        let newY = item.y + currentVy;
        let newRotation = item.rotation + currentRotSpeed;

        // Wall Bouncing Logic (X-axis)
        if (newX <= 0) {
          newX = 0;
          currentVx = -currentVx * restitution;
          currentRotSpeed = -currentRotSpeed * 0.8;
        } else if (newX >= chamberW - item.width) {
          newX = chamberW - item.width;
          currentVx = -currentVx * restitution;
          currentRotSpeed = -currentRotSpeed * 0.8;
        }

        // Ceiling/Floor Bouncing Logic (Y-axis)
        if (newY <= 0) {
          newY = 0;
          currentVy = -currentVy * restitution;
          currentRotSpeed += currentVx * 0.2; // spin on impact
        } else if (newY >= chamberH - item.height) {
          newY = chamberH - item.height;
          // Bounce off floor
          currentVy = -currentVy * restitution;
          
          // Friction with floor slows down horizontal motion
          currentVx *= 0.8;
          currentRotSpeed *= 0.8;

          // If gravity is normal and moving extremely slowly, settle flat
          if (!isAntigravity && Math.abs(currentVy) < 0.8 && Math.abs(currentVx) < 0.2) {
            currentVy = 0;
            currentVx = 0;
            currentRotSpeed = 0;
            
            // Re-align rotation to 0 slowly when resting on the floor
            let diff = newRotation % 360;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            newRotation -= diff * 0.1;
          }
        }

        return {
          ...item,
          x: newX,
          y: newY,
          vx: currentVx,
          vy: currentVy,
          rotation: newRotation,
          rotSpeed: currentRotSpeed
        };
      });
    });

    // Update dragVelocity decay
    dragVelocity.current.x *= 0.85;
    dragVelocity.current.y *= 0.85;

    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isAntigravity, normalGravity, antigravityUpdraft, dampening, driftSpeed]);

  // Drag Event Handlers
  const handleMouseDown = (e, item) => {
    e.preventDefault();
    if (!chamberRef.current) return;
    const rect = chamberRef.current.getBoundingClientRect();
    
    draggedItemId.current = item.id;
    dragOffset.current = {
      x: e.clientX - rect.left - item.x,
      y: e.clientY - rect.top - item.y
    };

    mousePos.current = { x: e.clientX, y: e.clientY };
    prevMousePos.current = { x: e.clientX, y: e.clientY };
    dragVelocity.current = { x: 0, y: 0 };
    
    addLog(`INTERACT: Grabbed "${item.name}".`);
  };

  const handleMouseMove = (e) => {
    if (!draggedItemId.current) return;
    
    // Track mouse speed for flinging physics
    prevMousePos.current = { ...mousePos.current };
    mousePos.current = { x: e.clientX, y: e.clientY };

    // Calculate instantaneous velocity vectors
    const vx = mousePos.current.x - prevMousePos.current.x;
    const vy = mousePos.current.y - prevMousePos.current.y;
    
    // Accumulate velocity to avoid jitter drops
    dragVelocity.current = {
      x: vx * 0.8 + dragVelocity.current.x * 0.2,
      y: vy * 0.8 + dragVelocity.current.y * 0.2
    };
  };

  const handleMouseUp = () => {
    if (draggedItemId.current) {
      const activeObj = items.find(i => i.id === draggedItemId.current);
      const name = activeObj ? activeObj.name : 'object';
      addLog(`INTERACT: Flipped "${name}" with force vector (${Math.round(dragVelocity.current.x)}, ${Math.round(dragVelocity.current.y)}).`);
      draggedItemId.current = null;
    }
  };

  // Attach global mouse listeners for seamless drag outside the chamber
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [items]);

  // Calculate HUD live dashboard stats
  const averageAltitude = items.length
    ? Math.round(
        items.reduce((acc, curr) => {
          if (!chamberRef.current) return acc;
          const rect = chamberRef.current.getBoundingClientRect();
          // Height of chamber minus Y coordinate (Y = 0 is top, Y = H is bottom)
          const alt = rect.height - curr.y - curr.height;
          return acc + Math.max(0, alt);
        }, 0) / items.length
      )
    : 0;

  const maxVelocity = items.length
    ? Math.max(...items.map(item => Math.sqrt(item.vx * item.vx + item.vy * item.vy)))
    : 0;

  return (
    <div className={`${styles.appContainer}`}>
      {/* Background Starfield */}
      <div className={`cosmic-bg ${isAntigravity ? 'antigravity-active' : ''}`}>
        <div className="stars"></div>
      </div>

      {/* Top Header Navigation */}
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <Rocket className={styles.logoIcon} size={28} />
          <span className={styles.logoText}>ANTIGRAVITY.IO</span>
        </div>

        {/* Global Telemetry HUD */}
        <div className={styles.telemetryGrid}>
          <div className={styles.telemetryItem}>
            <span className={styles.telemetryLabel}>Zero-G Timer</span>
            <span className={`${styles.telemetryValue} ${isAntigravity ? 'glow-pink' : 'glow-cyan'}`}>
              {zeroGDuration}s
            </span>
          </div>
          <div className={styles.telemetryItem}>
            <span className={styles.telemetryLabel}>Gravity State</span>
            <span className={`${styles.telemetryValue} ${isAntigravity ? 'glow-pink' : 'glow-cyan'}`} style={{ color: isAntigravity ? 'var(--pink)' : 'var(--cyan)' }}>
              {isAntigravity ? '0.00 G (ZERO)' : '1.00 G (NORMAL)'}
            </span>
          </div>
          <div className={styles.telemetryItem}>
            <span className={styles.telemetryLabel}>Chamber Nodes</span>
            <span className={styles.telemetryValue}>{items.length} units</span>
          </div>
        </div>
      </header>

      {/* Main Sandbox Grid */}
      <main className={styles.dashboardGrid}>
        
        {/* Left Side: Parameters, Log Telemetry & Controls */}
        <aside className={styles.sidebar}>
          
          {/* Simulation Config Panel */}
          <div>
            <h3 className={styles.sectionTitle}>Chamber Settings</h3>
            <div className={styles.glassCard}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  <span>Normal Gravity</span>
                  <span>{normalGravity.toFixed(2)} G</span>
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.5" 
                  step="0.05"
                  value={normalGravity} 
                  onChange={(e) => setNormalGravity(parseFloat(e.target.value))}
                  className={styles.slider} 
                />
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  <span>Zero-G Updraft</span>
                  <span>{antigravityUpdraft.toFixed(2)} m/s²</span>
                </label>
                <input 
                  type="range" 
                  min="0.02" 
                  max="0.50" 
                  step="0.01"
                  value={antigravityUpdraft} 
                  onChange={(e) => setAntigravityUpdraft(parseFloat(e.target.value))}
                  className={styles.slider} 
                />
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  <span>Atmospheric Drag</span>
                  <span>{((1 - dampening) * 100).toFixed(1)}%</span>
                </label>
                <input 
                  type="range" 
                  min="0.950" 
                  max="0.999" 
                  step="0.001"
                  value={dampening} 
                  onChange={(e) => setDampening(parseFloat(e.target.value))}
                  className={styles.slider} 
                />
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  <span>Thermal Drift</span>
                  <span>{(driftSpeed * 10).toFixed(1)} km/h</span>
                </label>
                <input 
                  type="range" 
                  min="0.02" 
                  max="0.30" 
                  step="0.01"
                  value={driftSpeed} 
                  onChange={(e) => setDriftSpeed(parseFloat(e.target.value))}
                  className={styles.slider} 
                />
              </div>
            </div>
          </div>

          {/* Node Operations Card */}
          <div>
            <h3 className={styles.sectionTitle}>Containment Injections</h3>
            <div className={`${styles.glassCard} ${styles.spawnGrid}`}>
              <button onClick={handleSpawnItem} className={styles.btnSpawn}>
                <Plus size={14} /> Inject Node
              </button>
              <button onClick={handleClearChamber} className={styles.btnSpawn} style={{ color: 'var(--text-dim)' }}>
                Vacate Area
              </button>
            </div>
          </div>

          {/* HUD Diagnostics */}
          <div>
            <h3 className={styles.sectionTitle}>Active Telemetry</h3>
            <div className={`${styles.glassCard} ${styles.telemetryList}`}>
              <div className={styles.telemetryRow}>
                <span>Max Velocity</span>
                <span>{items.length ? (maxVelocity * 12.8).toFixed(1) : 0} km/s</span>
              </div>
              <div className={styles.telemetryRow}>
                <span>Avg Altitude</span>
                <span>{averageAltitude} m</span>
              </div>
              <div className={styles.telemetryRow}>
                <span>Chamber Status</span>
                <span style={{ color: isAntigravity ? 'var(--pink)' : 'var(--cyan)' }}>
                  {isAntigravity ? 'WARPING' : 'STABLE'}
                </span>
              </div>
              <button onClick={handleResetChamber} className={styles.btnAction} style={{ marginTop: '8px' }}>
                <RefreshCw size={14} /> Realign System
              </button>
            </div>
          </div>

          {/* Real-time System Logs */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
            <h3 className={styles.sectionTitle}>Mainframes Terminal</h3>
            <div className={styles.glassCard} style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-dim)', overflowY: 'auto', maxHeight: '180px' }}>
              {logs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: '4px', lineHeight: '1.2' }}>
                  <span style={{ color: 'var(--cyan)' }}>[{log.time}]</span>{' '}
                  <span style={{ color: log.text.startsWith('CRITICAL') ? 'var(--pink)' : log.text.startsWith('INTERACT') ? 'var(--text-primary)' : 'inherit' }}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </aside>

        {/* Right Side: The Interactive Physics sandbox */}
        <section className={styles.sandbox}>
          
          {/* The Glass Containment Chamber */}
          <div 
            ref={chamberRef} 
            className={`${styles.chamber} ${isAntigravity ? styles.antigravityActive : ''}`}
          >
            {/* Corner HUD Overlay */}
            <div className={styles.chamberHud}>
              <div className={styles.hudLine}>
                <span>Chamber Pressure:</span>
                <span style={{ color: 'var(--text-primary)' }}>101.3 kPa</span>
              </div>
              <div className={styles.hudLine}>
                <span>Shield Matrix:</span>
                <span style={{ color: 'var(--cyan)' }}>ACTIVE (100%)</span>
              </div>
              {isAntigravity && (
                <div className={styles.hudAlert}>
                  WARNING: ANTIGRAVITY FIELD INTERRUPT DETECTED
                </div>
              )}
            </div>

            {/* Render items */}
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`${styles.physicsItem} ${isAntigravity ? styles.floating : ''}`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    transform: `rotate(${item.rotation}deg)`,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item)}
                >
                  <div className={styles.itemIconWrapper}>
                    <Icon size={18} />
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemDesc}>{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Central Button Controller overlay */}
          <div className={styles.controllerWidget}>
            <button 
              className={`${styles.btnEngage} ${isAntigravity ? styles.active : ''}`}
              onClick={handleToggleAntigravity}
            >
              <span className={styles.btnEngageActiveGlow} />
              <Activity size={20} className={isAntigravity ? 'glow-pink' : ''} />
              {isAntigravity ? 'DISENGAGE GRAVITY' : 'ENGAGE ANTIGRAVITY'}
            </button>
            <span className={`${styles.indicatorLabel} ${isAntigravity ? styles.active : ''}`}>
              {isAntigravity ? 'Anti-G Generator Online' : 'Magnetic Containment Active'}
            </span>
          </div>

        </section>

      </main>
    </div>
  );
}

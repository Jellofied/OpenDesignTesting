/* eslint-disable react/no-unknown-property */
import { useMemo, useEffect, useRef, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

import './PixelTrail.css';

const GooeyFilter = ({ id = 'goo-filter', strength = 10 }) => {
  return (
    <svg className="goo-filter-container">
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
};

const DotMaterial = shaderMaterial(
  {
    resolution: new THREE.Vector2(),
    mouseTrail: null,
    gridSize: 100,
    pixelColor: new THREE.Color('#ffffff')
  },
  `
    varying vec2 vUv;
    void main() {
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  `
    uniform vec2 resolution;
    uniform sampler2D mouseTrail;
    uniform float gridSize;
    uniform vec3 pixelColor;

    vec2 coverUv(vec2 uv) {
      vec2 s = resolution.xy / max(resolution.x, resolution.y);
      vec2 newUv = (uv - 0.5) * s + 0.5;
      return clamp(newUv, 0.0, 1.0);
    }

    void main() {
      vec2 screenUv = gl_FragCoord.xy / resolution;
      vec2 uv = coverUv(screenUv);

      vec2 gridUvCenter = (floor(uv * gridSize) + 0.5) / gridSize;

      float trail = texture2D(mouseTrail, gridUvCenter).r;

      gl_FragColor = vec4(pixelColor, trail);
    }
  `
);

// Custom, robust trail texture hook that reactively updates and prevents exit-to-entry line glitches.
function useCustomTrailTexture({
  size = 512,
  radius = 0.1,
  maxAge = 500,
  interpolate = 0,
  ease = (x) => x
}) {
  // Create static canvas
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    return c;
  }, [size]);

  const ctx = useMemo(() => canvas.getContext('2d'), [canvas]);

  // Create CanvasTexture
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [canvas]);

  const points = useRef([]);
  const lastPoint = useRef(null);

  // Clean up texture
  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  // Register pointer move
  const onMove = useCallback((e) => {
    if (!e.uv) return;
    const x = e.uv.x;
    const y = e.uv.y;

    if (lastPoint.current && interpolate > 0) {
      const dx = x - lastPoint.current.x;
      const dy = y - lastPoint.current.y;
      const steps = Math.floor(interpolate);
      
      for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 1);
        const ix = lastPoint.current.x + dx * t;
        const iy = lastPoint.current.y + dy * t;
        points.current.push({ x: ix, y: iy, age: 0 });
      }
    }

    points.current.push({ x, y, age: 0 });
    lastPoint.current = { x, y };
  }, [interpolate]);

  // Reset tracking on leave to prevent long straight connector lines
  const onLeave = useCallback(() => {
    lastPoint.current = null;
  }, []);

  // Update canvas and texture per frame
  useFrame((state, delta) => {
    const ageStep = delta * 1000; // ms
    
    // 1. Age existing points and filter dead ones
    points.current.forEach((p) => (p.age += ageStep));
    points.current = points.current.filter((p) => p.age < maxAge);

    // 2. Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, size, size);

    // 3. Draw points
    points.current.forEach((p) => {
      const alpha = 1.0 - p.age / maxAge;
      const easedAlpha = ease ? ease(alpha) : alpha;

      const cx = p.x * size;
      const cy = (1 - p.y) * size;
      const r = radius * size;

      if (r <= 0) return;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(255, 255, 255, ${easedAlpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Update GPU texture
    texture.needsUpdate = true;
  });

  return [texture, onMove, onLeave];
}

function Scene({ gridSize, trailSize, maxAge, interpolate, easingFunction, pixelColor }) {
  const size = useThree(s => s.size);
  const viewport = useThree(s => s.viewport);

  const dotMaterial = useMemo(() => new DotMaterial(), []);
  dotMaterial.uniforms.pixelColor.value = new THREE.Color(pixelColor);

  const [trail, onMove, onLeave] = useCustomTrailTexture({
    size: 512,
    radius: trailSize,
    maxAge: maxAge,
    interpolate: interpolate,
    ease: easingFunction
  });

  const scale = Math.max(viewport.width, viewport.height) / 2;

  return (
    <mesh scale={[scale, scale, 1]} onPointerMove={onMove} onPointerLeave={onLeave}>
      <planeGeometry args={[2, 2]} />
      <primitive
        object={dotMaterial}
        gridSize={gridSize}
        resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
        mouseTrail={trail}
      />
    </mesh>
  );
}

export default function PixelTrail({
  gridSize = 40,
  trailSize = 0.1,
  maxAge = 250,
  interpolate = 5,
  easingFunction = x => x,
  canvasProps = {},
  glProps = {
    antialias: false,
    powerPreference: 'high-performance',
    alpha: true
  },
  gooeyFilter,
  color = '#ffffff',
  className = ''
}) {
  return (
    <>
      {gooeyFilter && <GooeyFilter id={gooeyFilter.id} strength={gooeyFilter.strength} />}
      <Canvas
        {...canvasProps}
        gl={glProps}
        className={`pixel-canvas ${className}`}
        style={gooeyFilter && { filter: `url(#${gooeyFilter.id})` }}
      >
        <Scene
          gridSize={gridSize}
          trailSize={trailSize}
          maxAge={maxAge}
          interpolate={interpolate}
          easingFunction={easingFunction}
          pixelColor={color}
        />
      </Canvas>
    </>
  );
}

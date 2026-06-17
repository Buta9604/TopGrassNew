/* =========================================================================
   TOP GRASS — Hero WebGL background
   Drifting gold-dust + emerald glow particle field (Three.js)
   ========================================================================= */
import * as THREE from 'three';

const canvas = document.getElementById('hero-canvas');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && !reduced) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 18;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  /* ---- Particle field ---- */
  const COUNT = innerWidth < 768 ? 900 : 2200;
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  const colors = new Float32Array(COUNT * 3);

  const gold = new THREE.Color(0xe8c87a);
  const emerald = new THREE.Color(0x2dd49a);

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 46;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 32;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
    speeds[i] = 0.005 + Math.random() * 0.02;
    const c = Math.random() > 0.78 ? emerald : gold;
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Soft round sprite
  const c2 = document.createElement('canvas'); c2.width = c2.height = 64;
  const ctx = c2.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  const sprite = new THREE.CanvasTexture(c2);

  const mat = new THREE.PointsMaterial({
    size: 0.16, map: sprite, vertexColors: true, transparent: true,
    opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  /* ---- Interaction ---- */
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => {
    tx = (e.clientX / innerWidth - 0.5);
    ty = (e.clientY / innerHeight - 0.5);
  });

  let scrollY = 0;
  addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const pos = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += speeds[i];                       // drift up
      pos[i * 3]     += Math.sin(clock.elapsedTime * 0.3 + i) * 0.002; // sway
      if (pos[i * 3 + 1] > 16) pos[i * 3 + 1] = -16;     // wrap
    }
    geo.attributes.position.needsUpdate = true;

    cx += (tx - cx) * 0.04; cy += (ty - cy) * 0.04;
    points.rotation.y = cx * 0.4 + clock.elapsedTime * 0.02;
    points.rotation.x = cy * 0.3;
    camera.position.y = -scrollY * 0.004;

    renderer.render(scene, camera);
  }
  animate();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const mount = document.getElementById('atom-globe');
const electronLabels = [...document.querySelectorAll('#electron-labels .electron-label')];
if (mount) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 100);
  camera.position.set(0, 0.2, 8.8);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    // Wait until a rendered frame exists before hiding the CSS fallback.
  } catch (e) {
    // Conserver le globe CSS de secours si WebGL est indisponible.
    console.warn('WebGL indisponible', e);
  }
  if (renderer) {
    const root = new THREE.Group(); scene.add(root);
    const world = new THREE.Group(); root.add(world);
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.62, 64, 48), new THREE.MeshPhongMaterial({ color: 0x084b91, emissive: 0x063e76, emissiveIntensity: 0.58, transparent: true, opacity: 0.68, shininess: 100, side: THREE.DoubleSide, depthWrite: false }));
    world.add(core);
    const grid = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1.645, 24, 16)), new THREE.LineBasicMaterial({ color: 0x32dfff, transparent: true, opacity: 0.24, depthWrite: false }));
    world.add(grid);
    // Latitude and longitude rings, each geometrically aligned to the sphere.
    for (let lat = -60; lat <= 60; lat += 30) {
      const r = 1.65 * Math.cos(lat * Math.PI / 180);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.004, 3, 160), new THREE.MeshBasicMaterial({ color: 0x3eeaff, transparent: true, opacity: 0.45 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 1.65 * Math.sin(lat * Math.PI / 180); world.add(ring);
    }
    for (let lon = 0; lon < 180; lon += 30) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.004, 3, 160), new THREE.MeshBasicMaterial({ color: 0x31c9fa, transparent: true, opacity: 0.24 }));
      ring.rotation.y = lon * Math.PI / 180; world.add(ring);
    }
    const pointCount = 1100, positions = new Float32Array(pointCount * 3), colors = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      const y = 1 - (i / (pointCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y), phi = i * Math.PI * (3 - Math.sqrt(5));
      const k = i * 3; positions[k] = 1.675 * Math.cos(phi) * radius; positions[k + 1] = 1.675 * y; positions[k + 2] = 1.675 * Math.sin(phi) * radius;
      const c = new THREE.Color(i % 9 === 0 ? 0xffb665 : (i % 4 === 0 ? 0x9b78ff : 0x46eaff)); colors[k] = c.r; colors[k + 1] = c.g; colors[k + 2] = c.b;
    }
    const cloudGeo = new THREE.BufferGeometry(); cloudGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3)); cloudGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    world.add(new THREE.Points(cloudGeo, new THREE.PointsMaterial({ size: 0.024, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false })));
    const orbitals = [];
    const orbitalColors = [0x2fe8ff, 0xb17aff, 0xffa657, 0x54a7ff];
    for (let i = 0; i < 4; i++) {
      const axis = new THREE.Group();
      axis.rotation.set((i + 1) * 0.62, (i + 1) * 0.78, i * 0.4);
      root.add(axis);
      const r = 2.15 + (i % 2) * 0.18;
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 240), new THREE.MeshBasicMaterial({ color: orbitalColors[i], transparent: true, opacity: 0.7, depthWrite: false }));
      axis.add(orbit);
      const electron = new THREE.Mesh(new THREE.SphereGeometry(0.067, 16, 12), new THREE.MeshBasicMaterial({ color: orbitalColors[i] }));
      axis.add(electron);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), new THREE.MeshBasicMaterial({ color: orbitalColors[i], transparent: true, opacity: 0.18, depthWrite: false }));
      electron.add(halo);
      orbitals.push({ axis, electron, r, speed: 0.22 + i * 0.08, phase: i * Math.PI / 2 });
    }
    scene.add(new THREE.AmbientLight(0x3d7bff, 1.3));
    const light = new THREE.PointLight(0x6cecff, 70); light.position.set(-3, 3, 5); scene.add(light);
    const amber = new THREE.PointLight(0xffa95c, 35); amber.position.set(3, -2, 2); scene.add(amber);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = false; controls.rotateSpeed = 0.55;
    const resize = () => { const rect = mount.getBoundingClientRect(); const w = Math.max(1, Math.round(rect.width)), h = Math.max(1, Math.round(rect.height)); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); };
    const observer = new ResizeObserver(resize); observer.observe(mount); resize();
    let visible = true; const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.01 }); visibility.observe(mount);
    const clock = new THREE.Clock(); let raf = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      if (!reduced.matches) {
        world.rotation.y += dt * 0.15;
        root.rotation.y += dt * 0.035;
        orbitals.forEach((o, i) => { o.phase += dt * o.speed; o.electron.position.set(Math.cos(o.phase) * o.r, Math.sin(o.phase) * o.r, 0); o.axis.rotation.z += dt * (i % 2 ? -0.035 : 0.035); });
      }
      controls.update(); renderer.render(scene, camera);
      // Projeter chaque électron sur la scène HTML pour conserver des titres lisibles.
      root.updateMatrixWorld(true);
      const rect = mount.getBoundingClientRect();
      orbitals.forEach((o, i) => {
        const label = electronLabels[i]; if (!label) return;
        const point = o.electron.getWorldPosition(new THREE.Vector3()).project(camera);
        const x = (point.x * .5 + .5) * rect.width;
        const y = (-point.y * .5 + .5) * rect.height;
        label.style.left = `${Math.max(60, Math.min(rect.width - 60, x))}px`;
        label.style.top = `${Math.max(20, Math.min(rect.height - 20, y - 22))}px`;
        label.style.opacity = point.z < 1 ? '1' : '0';
      });
    }
    // Static frame first, including when reduced motion is preferred.
    orbitals.forEach(o => o.electron.position.set(Math.cos(o.phase) * o.r, Math.sin(o.phase) * o.r, 0));
    renderer.render(scene, camera); mount.classList.add("webgl-ready"); animate();
    window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); observer.disconnect(); visibility.disconnect(); controls.dispose(); renderer.dispose(); scene.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { for (const m of [].concat(obj.material)) m.dispose(); } }); }, { once: true });
  }
}

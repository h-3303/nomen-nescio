/*
 * The statue field: four photogrammetry scans of marble figures (CC0 scans, decimated and
 * meshopt-compressed) rendered as chalk-white toner ghosts behind the sheet. Scroll drives a
 * per-figure parallax; dust clouds drift inside the same scene; page elements marked
 * data-plx drift at their own rates.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type Figure = { kind: string; x: number; z: number; height: number; ry: number; rz: number; anchor: number; speed: number };

const MODELS: Record<string, string> = {
  fa: '/models/fa.glb',
  muse: '/models/muse.glb',
  nymph: '/models/nymph.glb',
  diana: '/models/diana.glb',
};

// Each figure: which model, x (fraction of half-width at its depth), depth, world height, facing,
// the scroll position it is anchored to (fraction of page) and its drift speed.
// Anchors are spread so only one statue owns each stretch of the page; speeds differ per depth.
const FIGURES: Figure[] = [
  { kind: 'fa', x: 0.62, z: -8.5, height: 3.0, ry: -0.5, rz: 0.03, anchor: 0.05, speed: 0.5 },     // right of hero intro
  { kind: 'muse', x: -0.74, z: -14, height: 5.0, ry: 0.35, rz: -0.03, anchor: 0.34, speed: 0.55 },  // left, behind the ornament gap before the work list
  { kind: 'nymph', x: 0.7, z: -10, height: 4.0, ry: -0.4, rz: 0.02, anchor: 0.64, speed: 0.55 },    // right, between studio plate and notes
  { kind: 'diana', x: -0.66, z: -9, height: 3.6, ry: 0.5, rz: -0.02, anchor: 0.9, speed: 0.6 },     // left, beside the Elsewhere block
];

const lcg = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Procedural smoke sprite: clustered soft blobs with a radial falloff — no square edges anywhere.
function makeSmokeTexture() {
  const N = 512, c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d')!;
  const rnd = lcg(13);
  for (let i = 0; i < 110; i++) {
    const ang = rnd() * Math.PI * 2;
    const rad = Math.pow(rnd(), 0.6) * N * 0.33;
    const x = N / 2 + Math.cos(ang) * rad, y = N / 2 + Math.sin(ang) * rad;
    const r = 18 + rnd() * 95;
    const a = 0.025 + rnd() * 0.075;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,' + a.toFixed(3) + ')');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  const mask = g.createRadialGradient(N / 2, N / 2, N * 0.12, N / 2, N / 2, N * 0.5);
  mask.addColorStop(0, 'rgba(0,0,0,0)');
  mask.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = mask;
  g.fillRect(0, 0, N, N);
  g.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Procedural chalk: near-white, fully matte, a fine even grain and nothing else.
function makeChalk() {
  const N = 1024, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f7f5f0'; g.fillRect(0, 0, N, N);
  const rnd = lcg(7);
  const id = g.getImageData(0, 0, N, N), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(4, 4);
  // A subtle bump from the same grain gives the surface a powdery bite under the key light.
  const bump = new THREE.CanvasTexture(c); bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(6, 6);
  return new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 0.004, roughness: 1, metalness: 0, color: 0xffffff, envMapIntensity: 0.2 });
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createStatueField(host: HTMLElement, canvas: HTMLCanvasElement, front: HTMLElement): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearAlpha(0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  // Paper-colored fog: with the multiply blend, fogged figures dissolve into the page.
  scene.fog = new THREE.Fog(0xefece3, 15, 42);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;
  // Hard key from upper left so the carving throws real self-shadow; warm fill from below-right.
  const key = new THREE.DirectionalLight(0xfff6ea, 2.6);
  key.position.set(-6, 9, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.camera.near = 1; key.shadow.camera.far = 40;
  key.shadow.camera.left = key.shadow.camera.bottom = -14;
  key.shadow.camera.right = key.shadow.camera.top = 14;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe4e6ea, 1.1);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b3a6, 0.9));
  fill.position.set(5, -2, 4);
  scene.add(fill);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  let viewH = window.innerHeight;

  // Every figure gets one shared soapstone material; the scans' own textures were stripped at build time.
  const stone = makeChalk();
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  // Dust clouds: toner-grey smoke planes drifting in the statue scene — some in front, some behind.
  // Settings dialed in on the Dust Experiments sheet: count 7, opacity .3, speed 1.4, scale 1.2.
  const smoke = makeSmokeTexture();
  const clouds: THREE.Mesh[] = [];
  const crnd = lcg(41);
  const tanF = Math.tan((camera.fov * Math.PI) / 360);
  const addCloud = (z: number, opacity: number) => {
    const dist = Math.abs(z);
    const span = tanF * dist * 2;
    const size = span * (0.9 + crnd() * 0.8) * 1.2;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({ map: smoke, transparent: true, fog: true, opacity: opacity * (0.7 + crnd() * 0.6), color: 0x4a4740, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((crnd() * 2 - 1) * span * 1.1, (crnd() * 2 - 1) * span * 0.55, z);
    mesh.rotation.z = crnd() * Math.PI * 2;
    mesh.userData.speed = (0.0004 + crnd() * 0.0011) * 1.4;
    mesh.userData.dir = crnd() < 0.5 ? -1 : 1;
    scene.add(mesh);
    clouds.push(mesh);
  };
  for (let i = 0; i < 7; i++) addCloud(-4.5 - crnd() * 2.5, 0.3);   // in front of the statues
  for (let i = 0; i < 4; i++) addCloud(-17 - crnd() * 5, 0.18);    // behind them, fading into the fog

  let disposed = false;
  const figures = FIGURES.map((f) => {
    const pivot = new THREE.Group();
    pivot.rotation.y = f.ry;
    pivot.rotation.z = f.rz;
    pivot.position.z = f.z;
    scene.add(pivot);
    // Models are pre-centred on their bounding box and normalised to a height of 1 at build time.
    loader.load(MODELS[f.kind], (gltf) => {
      if (disposed) return;
      const statue = gltf.scene;
      statue.traverse((o) => {
        if (!(o as THREE.Mesh).isMesh) return;
        const m = o as THREE.Mesh;
        m.castShadow = m.receiveShadow = true;
        m.material = stone;
      });
      statue.scale.setScalar(f.height);
      pivot.add(statue);
      queue();
    }, undefined, (e) => console.warn('statue', f.kind, e));
    return { def: f, obj: pivot };
  });

  const scrollTop = () => {
    const se = document.scrollingElement || document.documentElement;
    return Math.max(window.scrollY || 0, se ? se.scrollTop : 0);
  };
  const scrollRange = () => {
    const se = document.scrollingElement || document.documentElement;
    return Math.max(1, (se ? se.scrollHeight : 0) - window.innerHeight);
  };

  const plx = new WeakMap<HTMLElement, number>();
  function draw() {
    const scroll = scrollTop();
    const range = scrollRange();
    const still = reduced();
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    for (const { def, obj } of figures) {
      const dist = Math.abs(def.z);
      const halfH = tan * dist;
      const halfW = halfH * camera.aspect;
      const perPx = (halfH * 2) / (viewH || 1);
      const delta = still ? 0 : (scroll - def.anchor * range) * perPx * def.speed;
      obj.position.x = def.x * halfW;
      obj.position.y = delta - 0.3;
      obj.rotation.y = def.ry + (still ? 0 : delta * 0.06);
    }
    renderer.render(scene, camera);
    // Texture strata: sparse flecks outrun the page; the dust clouds live inside the 3D scene.
    if (!still) front.style.backgroundPosition = '0 ' + (-scroll * 1.28).toFixed(1) + 'px';
    // Foreground parallax: any element with data-plx="rate" drifts relative to its resting position.
    const vh = viewH || innerHeight;
    document.querySelectorAll<HTMLElement>('[data-plx]').forEach((el) => {
      if (still) { el.style.transform = ''; return; }
      const rate = parseFloat(el.dataset.plx || '') || 0;
      const r = el.getBoundingClientRect();
      const cur = plx.get(el) || 0;
      const center = r.top + r.height / 2 - cur;
      const y = (center - vh / 2) * -rate;
      plx.set(el, y);
      el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      el.style.willChange = 'transform';
    });
  }

  let q = 0;
  const queue = () => {
    if (q) return;
    q = requestAnimationFrame(() => { q = 0; draw(); });
  };
  const resize = () => {
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    viewH = h;
    draw();
  };

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', queue, { passive: true, capture: true });
  resize();

  // Continuous slow turn for the dust; scroll still triggers full draws for parallax.
  let raf = 0;
  if (!reduced()) {
    const turn = () => {
      raf = requestAnimationFrame(turn);
      for (const p of clouds) p.rotation.z += p.userData.speed * p.userData.dir;
      renderer.render(scene, camera);
    };
    turn();
  }

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(q);
    window.removeEventListener('resize', resize);
    window.removeEventListener('scroll', queue, { capture: true });
    document.querySelectorAll<HTMLElement>('[data-plx]').forEach((el) => { el.style.transform = ''; });
    pmrem.dispose();
    renderer.dispose();
  };
}

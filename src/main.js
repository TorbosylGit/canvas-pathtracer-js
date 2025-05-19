import Vec3             from './vec3.js';
import Camera           from './camera.js';
import BVHNode          from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox       from './scenes/cornellBox.js';

// ─── RÉSOLUTIONS & PROFONDEUR ───
const nx       = 288;
const ny       = 162;
const maxDepth = 5;

// ─── FOND (dégradé ciel ou noir) ───
const useSkyBackground = false;
function backgroundColor(ray) {
  if (useSkyBackground) {
    const dir = ray.direction().normalize();
    const t   = 0.5 * (dir.y() + 1.0);
    const white = new Vec3(1, 1, 1);
    const blue  = new Vec3(0.5, 0.7, 1);
    return white.multiplyScalar(1 - t)
                .add(blue.multiplyScalar(t));
  }
  return new Vec3(0, 0, 0);
}

// ─── SCÈNE & ACCÉLÉRATION (BVH) ───
const world = new BVHNode(cornellBox().objects, 0.0, 1.0);

// ─── CAMÉRA ───
const lookfrom    = new Vec3(278, 278, -800);
const lookat      = new Vec3(278, 278,    0);
const vup         = new Vec3(0,   1,    0);
const distToFocus = 10.0;
const aperture    = 0.0;
const vfov        = 40.0;
const cam = new Camera(
  lookfrom, lookat, vup,
  vfov, nx/ny,
  aperture, distToFocus,
  0.0, 1.0
);

// ─── CANVAS & IMAGEBUFFER ───
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const pixels    = imageData.data;

// ─── ACCUMULATION DES ÉCHANTILLONS ───
const accum       = new Float32Array(nx * ny * 3);
let totalSamples  = 0;

// ─── CHRONO GLOBAL & PAUSE ONGLET ───
let isRendering       = true;
const globalStartTime = performance.now();
let totalPausedTime   = 0;
let pauseStartTime    = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // on met en pause
    isRendering    = false;
    pauseStartTime = performance.now();
  } else {
    // on reprend
    totalPausedTime += performance.now() - pauseStartTime;
    isRendering     = true;
    launchPass();
  }
});

// ─── POOL DE WORKERS (½ COEURS LOGIQUES) ───
const logicalCores = navigator.hardwareConcurrency || 4;
const numWorkers   = Math.max(1, Math.floor(logicalCores / 2));
console.log(`Using ${numWorkers}/${logicalCores} logical cores`);

const workers   = [];
let readyCount  = 0;

for (let i = 0; i < numWorkers; i++) {
  const w = new Worker(
    new URL('./fullPassWorker.js', import.meta.url),
    { type: 'module' }
  );

  // handshake : on attend le ready
  w.addEventListener('message', function onReady(e) {
    if (e.data.type === 'ready') {
      readyCount++;
      w.removeEventListener('message', onReady);
      if (readyCount === numWorkers) {
        console.log('All workers ready, starting rendering');
        launchPass();
      }
    }
  });

  // on init le worker
  w.postMessage({ type: 'init', nx, ny, maxDepth });
  workers.push(w);
}

// ─── LANCER UNE PASSE COMPLÈTE ───
function launchPass() {
  if (!isRendering) return;

  const sampleIndex = totalSamples++;
  const promises = workers.map(w =>
    new Promise(resolve => {
      const handler = e => {
        if (e.data.type === 'result' && e.data.sampleIndex === sampleIndex) {
          // accumulateur
          const buf = e.data.buffer;
          for (let k = 0; k < buf.length; k++) {
            accum[k] += buf[k];
          }
          resolve();
        }
      };
      w.addEventListener('message', handler, { once: true });
      w.postMessage({ type: 'renderPass', sampleIndex });
    })
  );

  Promise.all(promises).then(() => {
    // reconstruction de l'image entière
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const idx3 = (j * nx + i) * 3;
        // moyenne linéaire
        let lr = accum[idx3    ] / totalSamples;
        let lg = accum[idx3 + 1] / totalSamples;
        let lb = accum[idx3 + 2] / totalSamples;

        // tone-mapping de Reinhard : L/(1+L)
        lr = lr / (1 + lr);
        lg = lg / (1 + lg);
        lb = lb / (1 + lb);

        // correction gamma (γ=2)
        const r = Math.sqrt(lr);
        const g = Math.sqrt(lg);
        const b = Math.sqrt(lb);

        const off = (j * nx + i) * 4;
        pixels[off    ] = Math.floor(255.99 * r);
        pixels[off + 1] = Math.floor(255.99 * g);
        pixels[off + 2] = Math.floor(255.99 * b);
        pixels[off + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // mise à jour du chrono global hors pause
    const now     = performance.now();
    const elapsed = (now - globalStartTime - totalPausedTime) / 1000;
    document.getElementById('calcTime').textContent
      = elapsed.toFixed(2) + ' s';

    // prochaine passe
    requestAnimationFrame(launchPass);
  });
}

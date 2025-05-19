import Vec3             from './vec3.js';
import Camera           from './camera.js';
import BVHNode          from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox       from './scenes/cornellBox.js';

// ─── RÉSOLUTIONS & PROFONDEUR ───
const nx       = 480;
const ny       = 270;
const maxDepth = 5;

// ─── FOND (ciel ou noir) ───
const useSkyBackground = false;
function backgroundColor(ray) {
  if (useSkyBackground) {
    const d = ray.direction().normalize();
    const t = 0.5 * (d.y() + 1.0);
    return new Vec3(1,1,1).multiplyScalar(1-t)
         .add(new Vec3(0.5,0.7,1).multiplyScalar(t));
  }
  return new Vec3(0,0,0);
}

// ─── SCÈNE & ACCÉLÉRATION ───
const world = new BVHNode(cornellBox().objects, 0.0, 1.0);

// ─── CAMÉRA ───
const lookfrom    = new Vec3(278,278,-800);
const lookat      = new Vec3(278,278,   0);
const vup         = new Vec3(0,1,0);
const distToFocus = 10.0;
const aperture    = 0.0;
const vfov        = 40.0;
const cam = new Camera(
  lookfrom, lookat, vup,
  vfov, nx/ny,
  aperture, distToFocus,
  0.0, 1.0
);

// ─── CANVAS ───
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const pixels    = imageData.data;

// ─── ACCUMULATION DES COULEURS ───
const accum       = new Float32Array(nx * ny * 3);
let totalSamples  = 0;

// ─── GESTION DU RENDU PROGRESSIF ───
let isRendering       = true;
const globalStartTime = performance.now();
let totalPausedTime   = 0;
let pauseStartTime    = 0;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    isRendering    = false;
    pauseStartTime = performance.now();
  } else {
    totalPausedTime += performance.now() - pauseStartTime;
    isRendering     = true;
    launchPass();
  }
});

// ─── POOL DE WORKERS (½ COEURS LOGIQUES) ───
const logicalCores = navigator.hardwareConcurrency || 4;
const numWorkers   = Math.max(1, Math.floor(logicalCores / 2));
console.log(`Using ${numWorkers}/${logicalCores} logical cores`);

const workers    = [];
let readyCount   = 0;

for (let i = 0; i < numWorkers; i++) {
  const worker = new Worker(
    new URL('./fullPassWorker.js', import.meta.url),
    { type: 'module' }
  );

  // HANDSHAKE : on attend le "ready"
  worker.addEventListener('message', function onReady(evt) {
    if (evt.data.type === 'ready') {
      readyCount++;
      worker.removeEventListener('message', onReady);
      if (readyCount === numWorkers) {
        console.log('All workers ready, starting rendering');
        launchPass();
      }
    }
  });

  // init du worker
  worker.postMessage({ type: 'init', nx, ny, maxDepth });
  workers.push(worker);
}

// ─── LANCER UNE PASSE COMPLÈTE ───
function launchPass() {
  if (!isRendering) return;
  const sampleIndex = totalSamples++;
  const promises = workers.map(worker =>
    new Promise(resolve => {
      // handler unique pour ce sampleIndex
      const handler = e => {
        if (e.data.type === 'result' && e.data.sampleIndex === sampleIndex) {
          const buf = e.data.buffer;
          for (let j = 0; j < buf.length; j++) {
            accum[j] += buf[j];
          }
          resolve();
        }
      };
      worker.addEventListener('message', handler, { once: true });
      worker.postMessage({ type: 'renderPass', sampleIndex });
    })
  );

  Promise.all(promises).then(() => {
    // reconstruire l'image entière
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const idx3 = (j * nx + i) * 3;
        const r    = Math.sqrt(accum[idx3    ] / totalSamples);
        const g    = Math.sqrt(accum[idx3 + 1] / totalSamples);
        const b    = Math.sqrt(accum[idx3 + 2] / totalSamples);
        const off  = (j * nx + i) * 4;
        pixels[off    ] = Math.floor(255.99 * r);
        pixels[off + 1] = Math.floor(255.99 * g);
        pixels[off + 2] = Math.floor(255.99 * b);
        pixels[off + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // mettre à jour le chrono (hors pause)
    const now     = performance.now();
    const elapsed = (now - globalStartTime - totalPausedTime) / 1000;
    document.getElementById('calcTime').textContent
      = elapsed.toFixed(2) + ' s';

    requestAnimationFrame(launchPass);
  });
}









/*
// src/main.js

import Vec3             from './vec3.js';
import Camera           from './camera.js';
import BVHNode          from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox       from './scenes/cornellBox.js';

// ─── TOGGLE POUR LE FOND ───
// true  → ciel dégradé
// false → fond noir
const useSkyBackground = false;
function backgroundColor(ray) {
  if (useSkyBackground) {
    const dir   = ray.direction().normalize();
    const t     = 0.5 * (dir.y() + 1.0);
    const white = new Vec3(1, 1, 1);
    const blue  = new Vec3(0.5, 0.7, 1);
    return white.multiplyScalar(1 - t)
                .add(blue.multiplyScalar(t));
  }
  return new Vec3(0, 0, 0);
}

// ─── RÉSOLUTIONS & PARAMÈTRES ───
const nx       = 256;   // largeur interne
const ny       = 144;   // hauteur interne
const maxDepth = 20;    // profondeur max des rebonds

// ─── DÉCOUPAGE EN TUILES ───
const tileW  = 64;
const tileH  = 64;
const tilesX = Math.ceil(nx / tileW);
const tilesY = Math.ceil(ny / tileH);

// ─── SETUP CANVAS ───
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const pixels    = imageData.data;

// ─── MONDE & ACCÉLÉRATION ───
const sceneList = cornellBox();
const world     = new BVHNode(sceneList.objects, 0.0, 1.0);

// ─── CONFIGURATION CAMÉRA ───
const lookfrom    = new Vec3(278, 278, -800);
const lookat      = new Vec3(278, 278,    0);
const vup         = new Vec3(0,   1,    0);
const distToFocus = 10.0;
const aperture    = 0.0;
const vfov        = 40.0;
const aspect      = nx / ny;

const cam = new Camera(
  lookfrom, lookat, vup,
  vfov, aspect,
  aperture, distToFocus,
  0.0, 1.0
);

// ─── BUFFER D’ACCUMULATION ───
// Float32Array pour stocker RGB brutes par pixel
const accum = new Float32Array(nx * ny * 3);
let sampleCount = 0;

// ─── CHRONO GLOBAL + PAUSE ───
const globalStartTime = performance.now();
let totalPausedTime   = 0;
let pauseStartTime    = 0;
let isRendering       = true;

// suspendre/reprendre sur changement d’onglet
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // début de la pause
    isRendering    = false;
    pauseStartTime = performance.now();
  } else {
    // fin de la pause
    totalPausedTime += performance.now() - pauseStartTime;
    isRendering     = true;
    renderPass();
  }
});

// ─── POOL DE WORKERS ───
const numWorkers = navigator.hardwareConcurrency || 4;
const workers    = [];
for (let w = 0; w < numWorkers; w++) {
  const worker = new Worker(
    new URL('./tileWorker.js', import.meta.url),
    { type: 'module' }
  );
  // envoyer init au worker
  worker.postMessage({ type: 'init', nx, ny, maxDepth });
  workers.push(worker);
}

// ─── DESCRIPTORS DE TUILES ───
const tileDescriptors = [];
for (let ty = 0; ty < tilesY; ty++) {
  for (let tx = 0; tx < tilesX; tx++) {
    const x0 = tx * tileW;
    const y0 = ty * tileH;
    const w  = Math.min(tileW, nx - x0);
    const h  = Math.min(tileH, ny - y0);
    tileDescriptors.push({ x0, y0, w, h });
  }
}

// ─── FONCTION DE CALCUL COLOR ───
function color(ray, depth) {
  const rec = {};
  if (world.hit(ray, 0.001, Infinity, rec)) {
    const emitted    = rec.material.emitted(rec.u, rec.v, rec.p);
    const scatterRes = rec.material.scatter(ray, rec);
    if (depth < maxDepth && scatterRes) {
      const { scattered, attenuation } = scatterRes;
      const col = color(scattered, depth + 1);
      return emitted.add(attenuation.multiply(col));
    }
    return emitted;
  }
  return backgroundColor(ray);
}

// ─── RENDU PROGRESSIF PAR PASSES ───
function renderPass() {
  if (!isRendering) return;

  sampleCount++;
  const promises = [];

  // dispatcher chaque tuile à un worker
  tileDescriptors.forEach((tile, idx) => {
    const worker = workers[idx % numWorkers];
    promises.push(new Promise(resolve => {
      worker.onmessage = e => {
        const { x0, y0, w, h, buffer } = e.data;
        // accumuler dans le buffer global
        let ptr = 0;
        for (let j = 0; j < h; j++) {
          for (let i = 0; i < w; i++) {
            const gi = ((y0 + j) * nx + (x0 + i)) * 3;
            accum[gi    ] += buffer[ptr++];
            accum[gi + 1] += buffer[ptr++];
            accum[gi + 2] += buffer[ptr++];
          }
        }
        resolve();
      };
      worker.postMessage({ type: 'renderTile', sampleCount, ...tile });
    }));
  });

  // une fois toutes les tuiles traitées
  Promise.all(promises).then(() => {
    // construire full-frame et gamma-correct
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const idxF = (j * nx + i) * 3;
        const r = Math.sqrt(accum[idxF    ] / sampleCount);
        const g = Math.sqrt(accum[idxF + 1] / sampleCount);
        const b = Math.sqrt(accum[idxF + 2] / sampleCount);
        const off = (j * nx + i) * 4;
        pixels[off    ] = Math.floor(255.99 * r);
        pixels[off + 1] = Math.floor(255.99 * g);
        pixels[off + 2] = Math.floor(255.99 * b);
        pixels[off + 3] = 255;
      }
    }

    // afficher l’image complète
    ctx.putImageData(imageData, 0, 0);

    // mettre à jour le chrono global hors pause
    const now     = performance.now();
    const elapsed = (now - globalStartTime - totalPausedTime) / 1000;
    document.getElementById('calcTime').textContent
      = elapsed.toFixed(2) + ' s';

    // planifier la passe suivante
    requestAnimationFrame(renderPass);
  });
}

// ─── DÉMARRAGE DU RENDU ───
renderPass();
*/








/*
import Vec3             from './vec3.js';
import Camera           from './camera.js';
import BVHNode          from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox       from './scenes/cornellBox.js';

// toggle fond extérieur/interne
const useSkyBackground = false;

// calcul couleur de fond
function backgroundColor(ray) {
  if (useSkyBackground) {
    const dir   = ray.direction().normalize();
    const t     = 0.5 * (dir.y() + 1.0);
    const white = new Vec3(1, 1, 1);
    const blue  = new Vec3(0.5, 0.7, 1);
    return white.multiplyScalar(1 - t)
                .add(blue.multiplyScalar(t));
  }
  return new Vec3(0, 0, 0);
}

// résolution interne
const nx       = 256;
const ny       = 144;
const maxDepth = 5;

// découpage en tuiles
const tileW  = 64;
const tileH  = 64;
const tilesX = Math.ceil(nx / tileW);
const tilesY = Math.ceil(ny / tileH);

// préparer le canvas
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const pixels    = imageData.data;

// construire monde et BVH
const world = new BVHNode(
  cornellBox().objects,
  0.0, 1.0
);

// config caméra fixe
const lookfrom    = new Vec3(278, 278, -800);
const lookat      = new Vec3(278, 278,    0);
const vup         = new Vec3(0,   1,    0);
const distToFocus = 10.0;
const aperture    = 0.0;
const vfov        = 40.0;
const aspect      = nx / ny;
const cam = new Camera(
  lookfrom, lookat, vup,
  vfov, aspect,
  aperture, distToFocus,
  0.0, 1.0
);

// accumulation des couleurs
const accum = new Float32Array(nx * ny * 3);
let sampleCount = 0;

// lancement et pool de workers
const numWorkers = navigator.hardwareConcurrency || 4;
const workers = [];
for (let w = 0; w < numWorkers; w++) {
  const worker = new Worker(
    new URL('./tileWorker.js', import.meta.url),
    { type: 'module' }
  );
  // initialiser worker
  worker.postMessage({ type: 'init', nx, ny, maxDepth });
  workers.push(worker);
}

// décrire toutes les tuiles
const tileDescriptors = [];
for (let ty = 0; ty < tilesY; ty++) {
  for (let tx = 0; tx < tilesX; tx++) {
    const x0 = tx * tileW;
    const y0 = ty * tileH;
    const w  = Math.min(tileW, nx - x0);
    const h  = Math.min(tileH, ny - y0);
    tileDescriptors.push({ x0, y0, w, h });
  }
}

// mesure du temps global
const globalStartTime = performance.now();

// gestion visibilite onglet
let isRendering = true;
document.addEventListener('visibilitychange', () => {
  isRendering = !document.hidden;
  if (isRendering) renderPass();
});

// rend une passe complète
function renderPass() {
  if (!isRendering) return;  // pause onglet caché

  sampleCount++;
  const promises = [];

  // dispatch tuiles round-robin
  tileDescriptors.forEach((tile, idx) => {
    const worker = workers[idx % numWorkers];
    promises.push(new Promise(resolve => {
      worker.onmessage = e => {
        const { x0, y0, w, h, buffer } = e.data;
        // accumuler résultats
        let ptr = 0;
        for (let j = 0; j < h; j++) {
          for (let i = 0; i < w; i++) {
            const gi = ((y0 + j) * nx + (x0 + i)) * 3;
            accum[gi    ] += buffer[ptr++];
            accum[gi + 1] += buffer[ptr++];
            accum[gi + 2] += buffer[ptr++];
          }
        }
        resolve();
      };
      worker.postMessage({ type: 'renderTile', sampleCount, ...tile });
    }));
  });

  // après toutes les tuiles
  Promise.all(promises).then(() => {
    // assembler full-frame
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const idxF = (j * nx + i) * 3;
        const r = Math.sqrt(accum[idxF    ] / sampleCount);
        const g = Math.sqrt(accum[idxF + 1] / sampleCount);
        const b = Math.sqrt(accum[idxF + 2] / sampleCount);
        const off = (j * nx + i) * 4;
        pixels[off    ] = Math.floor(255.99 * r);
        pixels[off + 1] = Math.floor(255.99 * g);
        pixels[off + 2] = Math.floor(255.99 * b);
        pixels[off + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // mise à jour du temps global
    const elapsed = (performance.now() - globalStartTime) / 1000;
    document.getElementById('calcTime').textContent
      = elapsed.toFixed(2) + ' s';

    // passe suivante
    requestAnimationFrame(renderPass);
  });
}

// démarrage
renderPass();
*/
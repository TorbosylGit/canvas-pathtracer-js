// src/main.js

import Vec3             from './vec3.js';
import Ray              from './ray.js';
import Camera           from './camera.js';
import BVHNode          from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox       from './scenes/cornellBox.js';

// ─── TOGGLE FOND ───
// true  → ciel dégradé
// false → fond noir
const useSkyBackground = false;

// renvoie la couleur de fond
function backgroundColor(ray) {
  if (useSkyBackground) {
    const dir   = ray.direction().normalize();
    const t     = 0.5 * (dir.y() + 1.0);
    const white = new Vec3(1, 1, 1);
    const blue  = new Vec3(0.5, 0.7, 1);
    return white.multiplyScalar(1 - t)
                .add(blue.multiplyScalar(t));
  }
  // fond noir par défaut
  return new Vec3(0, 0, 0);
}

// ─── RÉSOLUTIONS & PARAMÈTRES ───
const nx       = 480;   // largeur interne
const ny       = 320;   // hauteur interne
const maxDepth = 20;    // profondeur max rebonds

// préparer le canvas
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const pixels    = imageData.data;

// ─── SCÈNE & ACCÉLÉRATION ───
const sceneList = cornellBox();                       // construire la scène
const world     = new BVHNode(sceneList.objects, 0.0, 1.0); // wrapper BVH

// ─── CONFIGURATION CAMÉRA ───
const lookfrom    = new Vec3(278, 278, -800);
const lookat      = new Vec3(278, 278,    0);
const vup         = new Vec3(0,   1,    0);
const distToFocus = 10.0;    // distance du plan net
const aperture    = 0.0;     // diaphragme fermé
const vfov        = 40.0;    // champ vertical (en degrés)
const aspect      = nx / ny; // ratio largeur/hauteur
const cam = new Camera(
  lookfrom, lookat, vup,
  vfov, aspect,
  aperture, distToFocus,
  0.0, 1.0                  // time0, time1
);

// ─── BUFFER D’ACCUMULATION ───
const accum       = Array(nx * ny).fill().map(() => new Vec3(0, 0, 0));
let sampleCount   = 0;

// enregistrer le début du rendu global
const globalStartTime = performance.now();

// calcule récursif de la couleur pour un rayon
function color(ray, depth) {
  const rec = {};
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // émission du matériau
    const emitted   = rec.material.emitted(rec.u, rec.v, rec.p);
    // scatter éventuel
    const scatterRes = rec.material.scatter(ray, rec);
    if (depth < maxDepth && scatterRes) {
      const { scattered, attenuation } = scatterRes;
      const col = color(scattered, depth + 1);
      // ajouter émission + réflection
      return emitted.add(attenuation.multiply(col));
    }
    // aucun scatter → émission seule
    return emitted;
  }
  // pas d’impact → couleur de fond
  return backgroundColor(ray);
}

// ─── PAUSE QUAND ONGLET CACHÉ ───
let isRendering = true;
document.addEventListener('visibilitychange', () => {
  isRendering = !document.hidden;
  if (isRendering) renderPass();
});

// ─── RENDU PROGRESSIF PAR PASSES ───
function renderPass() {
  if (!isRendering) return;  // suspendre si onglet caché

  // 1 sample par pixel
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const idx = j * nx + i;
      const u   = (i + randomDouble()) / nx;
      const v   = ((ny - 1 - j) + randomDouble()) / ny;
      const col = color(cam.getRay(u, v), 0);
      accum[idx] = accum[idx].add(col);
    }
  }
  sampleCount++;

  // affichage full-frame
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const idx = j * nx + i;
      // moyenne + correction gamma
      let c = accum[idx].divideScalar(sampleCount);
      c = new Vec3(Math.sqrt(c.x()), Math.sqrt(c.y()), Math.sqrt(c.z()));
      const ir = Math.floor(255.99 * c.r());
      const ig = Math.floor(255.99 * c.g());
      const ib = Math.floor(255.99 * c.b());
      const off = 4 * idx;
      pixels[off]   = ir;
      pixels[off+1] = ig;
      pixels[off+2] = ib;
      pixels[off+3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // mettre à jour temps global écoulé
  const elapsed = (performance.now() - globalStartTime) / 1000;
  document.getElementById('calcTime').textContent
    = elapsed.toFixed(2) + ' s';

  // planifier la passe suivante
  requestAnimationFrame(renderPass);
}

// démarrer le rendu progressif
renderPass();









/*
import Vec3             from './vec3.js';
import Ray              from './ray.js';
import Camera           from './camera.js';
import BVHNode          from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox       from './scenes/cornellBox.js';

// ─── TOGGLE FOND ───
const useSkyBackground = false;
function backgroundColor(ray) {
  if (useSkyBackground) {
    const dir = ray.direction().normalize();
    const t   = 0.5 * (dir.y() + 1.0);
    const w   = new Vec3(1, 1, 1);
    const b   = new Vec3(0.5, 0.7, 1);
    return w.multiplyScalar(1 - t)
            .add(b.multiplyScalar(t));
  }
  return new Vec3(0, 0, 0);
}

// ─── RÉSOLUTIONS & PARAMS ───
const nx       = 480;   // largeur interne
const ny       = 320;   // hauteur interne
const maxDepth = 20;    // rebonds max

// préparer le canvas
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const pixels    = imageData.data;

// construire scène + BVH
const sceneList = cornellBox();
const world     = new BVHNode(sceneList.objects, 0.0, 1.0);

// config caméra Cornell Box
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

// buffer d'accumulation couleurs
const accum = Array(nx * ny)
  .fill(null)
  .map(() => new Vec3(0, 0, 0));
let sampleCount = 0;

// calcul récursif couleur d’un rayon
function color(ray, depth) {
  const rec = {};
  if (world.hit(ray, 0.001, Infinity, rec)) {
    const emitted   = rec.material.emitted(rec.u, rec.v, rec.p);
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

// gestion visibilité onglet
let isRendering = true;
document.addEventListener('visibilitychange', () => {
  isRendering = !document.hidden;
  if (isRendering) renderPass();
});

// mesure temps de passe
let lastPassTime = 0;
function updateTiming(ms) {
  document.getElementById('calcTime').textContent
    = ms.toFixed(2);
}

// rendu progressif par passes complètes
function renderPass() {
  if (!isRendering) return;
  const t0 = performance.now();

  // une passe : un échantillon par pixel
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const idx = j * nx + i;
      const u   = (i + randomDouble()) / nx;
      const v   = ((ny - 1 - j) + randomDouble()) / ny;
      const col = color(cam.getRay(u, v), 0);
      accum[idx] = accum[idx].add(col);
    }
  }
  sampleCount++;

  // afficher moyenne + gamma
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const idx = j * nx + i;
      let c = accum[idx].divideScalar(sampleCount);
      c = new Vec3(
        Math.sqrt(c.x()),
        Math.sqrt(c.y()),
        Math.sqrt(c.z())
      );
      const ir = Math.floor(255.99 * c.r());
      const ig = Math.floor(255.99 * c.g());
      const ib = Math.floor(255.99 * c.b());
      const off = 4 * idx;
      pixels[off]   = ir;
      pixels[off+1] = ig;
      pixels[off+2] = ib;
      pixels[off+3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const t1 = performance.now();
  updateTiming(t1 - t0);

  requestAnimationFrame(renderPass);
}

// démarrage du rendu
renderPass();
*/








/*
import Vec3            from './vec3.js';
import Ray             from './ray.js';
import Camera          from './camera.js';
import BVHNode         from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox      from './scenes/cornellBox.js';

// ─── CONFIGURATION DU FOND ───
const useSkyBackground = false;
// renvoie couleur de fond
function backgroundColor(ray) {
  if (useSkyBackground) {
    // gradient ciel bleu→blanc
    const dir = ray.direction().normalize();
    const t   = 0.5 * (dir.y() + 1.0);
    const w   = new Vec3(1,1,1);
    const b   = new Vec3(0.5,0.7,1);
    return w.multiplyScalar(1 - t)
            .add(b.multiplyScalar(t));
  }
  // fond noir
  return new Vec3(0,0,0);
}

// ─── PARAMÈTRES DE RENDU ───
const nx        = 480;   // nombre de colonnes 256
const ny        = 320;   // nombre de lignes 144
const maxDepth  = 5;    // profondeur récursion

// préparer canvas et buffer
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const pixels    = imageData.data;

// ─── SCÈNE ET ACCÉLÉRATION ───
const sceneList = cornellBox();                   // choisir scène
const world     = new BVHNode(                     // construire BVH
  sceneList.objects, 0.0, 1.0
);

// ─── CONFIGURATION CAMÉRA ───
const lookfrom    = new Vec3(278,278,-800);
const lookat      = new Vec3(278,278,   0);
const vup         = new Vec3(0,1,0);
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
const accum = new Array(nx * ny)
  .fill(null)
  .map(() => new Vec3(0,0,0));
let sampleCount = 0;

// calcule couleur d’un rayon (récursif)
function color(ray, depth) {
  const rec = {};
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // emission matériau
    const emitted = rec.material.emitted(
      rec.u, rec.v, rec.p
    );
    const scatterRes = rec.material.scatter(
      ray, rec
    );
    if (depth < maxDepth && scatterRes) {
      const { scattered, attenuation } = scatterRes;
      const col = color(scattered, depth + 1);
      // addition emission + reflection
      return emitted.add(
        attenuation.multiply(col)
      );
    }
    // pas de scatter
    return emitted;
  }
  // pas d’impact
  return backgroundColor(ray);
}

// ─── RENDU PROGRESSIF PAR PASSES ───
let isRendering = true;

// suspendre/reprendre selon onglet
document.addEventListener('visibilitychange', () => {
  isRendering = !document.hidden;
  if (isRendering) renderPass();
});

function renderPass() {
  if (!isRendering) return;   // suspendre si caché

  // 1 échantillon par pixel
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const idx = j*nx + i;
      const u = (i + randomDouble()) / nx;
      const v = ((ny-1-j) + randomDouble()) / ny;
      const col = color(cam.getRay(u, v), 0);
      accum[idx] = accum[idx].add(col);
    }
  }

  sampleCount++;
  // afficher toute l’image
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const idx = j*nx + i;
      // moyenne + gamma
      let c = accum[idx].divideScalar(sampleCount);
      c = new Vec3(
        Math.sqrt(c.x()), 
        Math.sqrt(c.y()), 
        Math.sqrt(c.z())
      );
      const ir = Math.floor(255.99 * c.r());
      const ig = Math.floor(255.99 * c.g());
      const ib = Math.floor(255.99 * c.b());
      const off = 4 * idx;
      pixels[off]   = ir;
      pixels[off+1] = ig;
      pixels[off+2] = ib;
      pixels[off+3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // planifier passe suivante
  requestAnimationFrame(renderPass);
}

// démarrer rendu
renderPass();
*/
import Vec3            from './vec3.js';
import Ray             from './ray.js';
import Camera          from './camera.js';
import BVHNode         from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox      from './scenes/cornellBox.js';

// ─── CONFIGURATION DU FOND ───
const useSkyBackground = false;
// fonction de fond
function backgroundColor(ray) {
  if (useSkyBackground) {
    const dir = ray.direction().normalize();
    const t   = 0.5 * (dir.y() + 1.0);
    const w   = new Vec3(1,1,1);
    const b   = new Vec3(0.5,0.7,1);
    return w.multiplyScalar(1 - t).add(b.multiplyScalar(t));
  }
  return new Vec3(0,0,0);
}

// ─── PARAMÈTRES DE RENDU ───
const nx       = 256;
const ny       = 144;
const maxSamples = 100;  // nombre total de passes
const maxDepth   = 50;

// préparer canvas et buffer
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const pixels    = imageData.data;

// scène et BVH
const sceneList = cornellBox();
const world     = new BVHNode(sceneList.objects, 0.0, 1.0);

// caméra Cornell Box
const lookfrom    = new Vec3(278,278,-800);
const lookat      = new Vec3(278,278,   0);
const vup         = new Vec3(0,1,0);
const distToFocus = 10.0;
const aperture    = 0.0;
const vfov        = 40.0;
const aspect      = nx/ny;
const cam = new Camera(
  lookfrom, lookat, vup,
  vfov, aspect,
  aperture, distToFocus,
  0.0, 1.0
);

// record d'accumulation couleur
const accum = Array(nx * ny).fill().map(() => new Vec3(0,0,0));
let sampleCount = 0;

// calcule couleur d’un rayon
function color(ray, depth) {
  const rec = {};
  if (world.hit(ray, 0.001, Infinity, rec)) {
    const emitted = rec.material.emitted(rec.u, rec.v, rec.p);
    const scatterRes = rec.material.scatter(ray, rec);
    if (depth < maxDepth && scatterRes) {
      const { scattered, attenuation } = scatterRes;
      return emitted.add(
        attenuation.multiply(color(scattered, depth + 1))
      );
    }
    return emitted;
  }
  return backgroundColor(ray);
}

// une passe : un échantillon par pixel
function renderPass() {
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const idx = j*nx + i;
      // lancer UN rayon aléatoire
      const u = (i + randomDouble()) / nx;
      const v = ((ny-1-j) + randomDouble()) / ny;
      const col = color(cam.getRay(u, v), 0);
      // accumuler
      accum[idx] = accum[idx].add(col);
    }
  }

  sampleCount++;
  // réafficher toute l’image
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const idx = j*nx + i;
      // moyenne des passes
      let c = accum[idx].divideScalar(sampleCount);
      // gamma = 2
      c = new Vec3(Math.sqrt(c.x()), Math.sqrt(c.y()), Math.sqrt(c.z()));
      // convertir en 0–255
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
  /*
  if (sampleCount < maxSamples) {
    requestAnimationFrame(renderPass);
  }
  */
 requestAnimationFrame(renderPass);
}

// démarrer rendu progressif par passes
renderPass();









/*
import Vec3            from './vec3.js';
import Ray             from './ray.js';
import Camera          from './camera.js';
import BVHNode         from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox      from './scenes/cornellBox.js';

// ─── CONFIGURATION DU FOND ───
// true  → ciel dégradé
// false → fond noir
const useSkyBackground = false;

// renvoie couleur de fond
function backgroundColor(ray) {
  if (useSkyBackground) {
    // gradient ciel bleu→blanc
    const unitDir = ray.direction().normalize();
    const t       = 0.5 * (unitDir.y() + 1.0);
    const white   = new Vec3(1, 1, 1);
    const blue    = new Vec3(0.5, 0.7, 1);
    return white.multiplyScalar(1 - t)
                .add(blue.multiplyScalar(t));
  }
  // fond noir pour intérieur
  return new Vec3(0, 0, 0);
}

// ─── RÉSOLUTIONS ET PARAMÈTRES ───
const nx       = 256;   // colonnes internes
const ny       = 144;   // lignes internes
const ns       = 10;    // échantillons par pixel
const maxDepth = 20;    // profondeur récursion

// préparer canvas HTML
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const data      = imageData.data;

// ─── SCÈNE ET BVH ───
// construire Cornell Box
const sceneList = cornellBox();
// extraire Array natif
const objects   = sceneList.objects;
// accélérer intersections
const world     = new BVHNode(objects, 0.0, 1.0);

// ─── CONFIGURATION CAMÉRA ───
const lookfrom    = new Vec3(278, 278, -800);
const lookat      = new Vec3(278, 278,    0);
const vup         = new Vec3(0,   1,    0);
const distToFocus = 10.0;   // plan de netteté
const aperture    = 0.0;    // pas de flou de DOF
const vfov        = 40.0;   // champ vertical (°)
const aspect      = nx / ny;

const cam = new Camera(
  lookfrom,
  lookat,
  vup,
  vfov,
  aspect,
  aperture,
  distToFocus,
  0.0,   // ouverture obturateur
  1.0    // fermeture obturateur
);

// calcule couleur d’un rayon
function color(ray, world, depth) {
  const rec = {};              // record d’intersection
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // couleur émise par matériau
    const emitted = rec.material.emitted(rec.u, rec.v, rec.p);
    // scatter si possible
    const scatterRes = rec.material.scatter(ray, rec);
    if (depth < maxDepth && scatterRes) {
      const { scattered, attenuation } = scatterRes;
      // récursion pour couleur rebond
      const col = color(scattered, world, depth + 1);
      return emitted.add(attenuation.multiply(col));
    }
    // pas de scatter → émis seul
    return emitted;
  }
  // pas d’impact → fond
  return backgroundColor(ray);
}

// ─── RENDU PROGRESSIF ───
let currentRow = 0;             // ligne en cours

function renderNextRow() {
  if (currentRow >= ny) return;  // toutes lignes faites

  // traiter chaque pixel de la ligne
  for (let i = 0; i < nx; i++) {
    let col = new Vec3(0, 0, 0); // couleur accumulée

    // lancer ns échantillons
    for (let s = 0; s < ns; s++) {
      const u = (i + randomDouble()) / nx;
      const v = ((ny - 1 - currentRow) + randomDouble()) / ny;
      const r = cam.getRay(u, v);
      col = col.add(color(r, world, 0));
    }

    // moyenne + gamma-correction
    col = col.divideScalar(ns);
    col = new Vec3(
      Math.sqrt(col.x()),
      Math.sqrt(col.y()),
      Math.sqrt(col.z())
    );

    // écrire RGBA dans buffer
    const ir  = Math.floor(255.99 * col.r());
    const ig  = Math.floor(255.99 * col.g());
    const ib  = Math.floor(255.99 * col.b());
    const idx = 4 * (currentRow * nx + i);

    data[idx + 0] = ir;   // rouge
    data[idx + 1] = ig;   // vert
    data[idx + 2] = ib;   // bleu
    data[idx + 3] = 255;  // alpha opaque
  }

  // mise à jour du canvas
  ctx.putImageData(imageData, 0, 0);

  currentRow++;               // passer à la ligne suivante
  setTimeout(renderNextRow, 0); // planifier prochain appel
}

// démarrer rendu progressif
renderNextRow();
*/








/*
import Vec3            from './vec3.js';
import Ray             from './ray.js';
import Camera          from './camera.js';
import BVHNode         from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox      from './scenes/cornellBox.js';

// ─── CONFIGURATION DU FOND ───
// true  → ciel dégradé
// false → fond noir
const useSkyBackground = false;

// renvoie couleur de fond
function backgroundColor(ray) {
  if (useSkyBackground) {
    // calcul gradient ciel
    const unitDir = ray.direction().normalize();
    const t       = 0.5 * (unitDir.y() + 1.0);
    const white   = new Vec3(1.0, 1.0, 1.0);
    const blue    = new Vec3(0.5, 0.7, 1.0);
    return white.multiplyScalar(1.0 - t)
                .add(blue.multiplyScalar(t));
  }
  // fond noir
  return new Vec3(0, 0, 0);
}

// dimensions internes rendu
const nx       = 256; // nombre de colonnes
const ny       = 144; // nombre de lignes
const ns       = 100;   // échantillons par pixel
const maxDepth = 100;   // profondeur récursion

// préparer canvas HTML
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const data      = imageData.data;

// construire scène Cornell Box
const sceneList = cornellBox();
// extraire tableau natif
const objects   = sceneList.objects;
// accélérer avec BVH
const world     = new BVHNode(objects, 0.0, 1.0);

// ─── CONFIGURATION CAMÉRA ───
const lookfrom    = new Vec3(278, 278, -800);
const lookat      = new Vec3(278, 278,    0);
const vup         = new Vec3(0,   1,    0);
const distToFocus = 10.0;   // plan de netteté
const aperture    = 0.0;    // diaphragme fermé
const vfov        = 40.0;   // champ vertical (°)
const aspect      = nx / ny;

const cam = new Camera(
  lookfrom,
  lookat,
  vup,
  vfov,
  aspect,
  aperture,
  distToFocus,
  0.0,  // début obturateur
  1.0   // fin obturateur
);

// calcule couleur d’un rayon
function color(ray, world, depth) {
  const rec = {};  // record intersection
  // tester intersection scène
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // couleur émise par matériau
    const emitted = rec.material.emitted(rec.u, rec.v, rec.p);
    // tenter scatter
    const scatterRes = rec.material.scatter(ray, rec);
    if (depth < maxDepth && scatterRes) {
      const { scattered, attenuation } = scatterRes;
      // récursion pour couleur finale
      const col = color(scattered, world, depth + 1);
      return emitted.add(attenuation.multiply(col));
    }
    // pas de scatter → émis seul
    return emitted;
  }
  // pas d’impact → fond
  return backgroundColor(ray);
}

// boucle de rendu
for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
    let col = new Vec3(0, 0, 0);  // accum couleur pixel
    // lancer ns rayons
    for (let s = 0; s < ns; s++) {
      const u = (i + randomDouble()) / nx;
      const v = ((ny - 1 - j) + randomDouble()) / ny;
      const r = cam.getRay(u, v);
      col = col.add(color(r, world, 0));
    }
    // moyenne échantillons
    col = col.divideScalar(ns);
    // correction gamma
    col = new Vec3(
      Math.sqrt(col.x()),
      Math.sqrt(col.y()),
      Math.sqrt(col.z())
    );
    // écrire dans buffer RGBA
    const ir  = Math.floor(255.99 * col.r());
    const ig  = Math.floor(255.99 * col.g());
    const ib  = Math.floor(255.99 * col.b());
    const idx = 4 * (j * nx + i);
    data[idx + 0] = ir;
    data[idx + 1] = ig;
    data[idx + 2] = ib;
    data[idx + 3] = 255;
  }
}

// afficher image sur canvas
ctx.putImageData(imageData, 0, 0);
*/
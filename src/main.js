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
const nx       = 240;
const ny       = 135;
const ns       = 10;   // échantillons par pixel
const maxDepth = 20;   // profondeur récursion

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

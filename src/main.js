import Vec3            from './vec3.js';
import Ray             from './ray.js';
import Camera          from './camera.js';
import BVHNode         from './bvhNode.js';
import { randomDouble } from './utils.js';
import { twoSpheres }   from './scenes.js';

// résolution interne du rendu
// nx colonnes, ny lignes
const nx       = 240;
const ny       = 135;
// échantillons par pixel
const ns       = 10;
// profondeur récursion max
const maxDepth = 20;

// récupérer canvas html
// et contexte 2D
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
// créer tampon imageData
const imageData = ctx.createImageData(nx, ny);
const data      = imageData.data;

// construire scène texturée
// deux spheres damier
const sceneList = twoSpheres();
// extraire tableau natif
const objects   = sceneList.objects;
// construire BVH pour accélérer
const world     = new BVHNode(objects, 0.0, 1.0);

// config caméra complète
// position, orientation, FOV
const lookfrom   = new Vec3(13, 2, 3);
const lookat     = new Vec3(0,  0, 0);
const vup        = new Vec3(0,  1, 0);
// distance plan net
const distToFocus= lookfrom.subtract(lookat).length();
// ouverture diaphragme
const aperture   = 0.1;
// intervalle temps obturateur
const time0      = 0.0;
const time1      = 1.0;
// ratio écran
const aspect     = nx / ny;

// instancier caméra DOF + mouvement
const cam = new Camera(
  lookfrom,
  lookat,
  vup,
  20,          // vfov degrés
  aspect,      // rapport largeur/hauteur
  aperture,    // diamètre diaphragme
  distToFocus, // plan de netteté
  time0,       // début obturateur
  time1        // fin obturateur
);

// fonction récursive calcul couleur
function color(ray, world, depth) {
  const rec = {};                  // record impact
  // tester intersection BVH
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // stopper si trop de rebonds
    if (depth >= maxDepth) {
      return new Vec3(0, 0, 0);
    }
    // scatter selon matériau
    const scatterRes = rec.material.scatter(ray, rec);
    if (scatterRes) {
      const { scattered, attenuation } = scatterRes;
      // récursion sur rayon scatter
      return attenuation.multiply(
        color(scattered, world, depth + 1)
      );
    }
    // rayon absorbé → noir
    return new Vec3(0, 0, 0);
  }
  // arrière-plan gradient ciel
  const unitDir = ray.direction().normalize();
  const t       = 0.5 * (unitDir.y() + 1.0);
  const white   = new Vec3(1.0, 1.0, 1.0);
  const blue    = new Vec3(0.5, 0.7, 1.0);
  // interpolation blanc→bleu
  return white.multiplyScalar(1.0 - t)
              .add(blue.multiplyScalar(t));
}

// boucle rendu final
// parcourir chaque pixel
for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
    let col = new Vec3(0, 0, 0);    // accum couleur
    // lancer ns rayons pixel
    for (let s = 0; s < ns; s++) {
      const u = (i + randomDouble()) / nx;
      const v = ((ny - 1 - j) + randomDouble()) / ny;
      // rayon timé + DOF
      const r = cam.getRay(u, v);
      col = col.add(color(r, world, 0));
    }
    // moyenne échantillons
    col = col.divideScalar(ns);
    // correction gamma via sqrt
    col = new Vec3(
      Math.sqrt(col.x()),
      Math.sqrt(col.y()),
      Math.sqrt(col.z())
    );
    // écriture composantes RGBA
    const ir  = Math.floor(255.99 * col.r());
    const ig  = Math.floor(255.99 * col.g());
    const ib  = Math.floor(255.99 * col.b());
    const idx = 4 * (j * nx + i);
    data[idx + 0] = ir;            // rouge pixel
    data[idx + 1] = ig;            // vert pixel
    data[idx + 2] = ib;            // bleu pixel
    data[idx + 3] = 255;           // alpha opaque
  }
}

// dessiner tampon sur canvas
ctx.putImageData(imageData, 0, 0);

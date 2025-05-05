import Vec3           from './vec3.js';
import Ray            from './ray.js';
import Sphere         from './sphere.js';
import MovingSphere   from './movingSphere.js';
import HittableList   from './hittableList.js';
import BVHNode        from './bvhNode.js';
import Camera         from './camera.js';
import Lambertian     from './lambertian.js';
import Metal          from './metal.js';
import Dielectric     from './dielectric.js';
import { randomDouble } from './utils.js';
import { randomScene }  from './randomScene.js';

// résolution interne du rendu
const nx       = 240;
const ny       = 135;
// nombre de rayons par pixel
const ns       = 10;
// profondeur récursion max
const maxDepth = 20;

// préparer canvas et tampon pixels
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const imageData = ctx.createImageData(nx, ny);
const data      = imageData.data;

// créer scène (statique + mouvante)
const sceneList = randomScene();           // HittableList instancié
// extraire le tableau d’objets JS natif
const objects   = sceneList.objects;       // Array de hitables
// construire le BVH à partir de cet Array
const world     = new BVHNode(objects, 0.0, 1.0);

// config caméra DOF + mouvement
const lookfrom   = new Vec3(13, 2, 3);
const lookat     = new Vec3(0,  0, 0);
const vup        = new Vec3(0,  1, 0);
const distToFocus= lookfrom.subtract(lookat).length();
const aperture   = 0.1;
const time0      = 0.0;  // début obturateur
const time1      = 1.0;  // fin obturateur
const aspect     = nx / ny;

// instancier caméra complète
const cam = new Camera(
  lookfrom,
  lookat,
  vup,
  20,          // champ vertical (vfov)
  aspect,      // ratio largeur/hauteur
  aperture,    // ouverture diaphragm
  distToFocus, // distance plan net
  time0,       // ouverture obturateur
  time1        // fermeture obturateur
);

// fonction recusive de calcul couleur
function color(ray, world, depth) {
  const rec = {};    // record d’intersection
  // intersection scene/BVH ?
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // stopper récursion si profondeur max
    if (depth >= maxDepth) return new Vec3(0, 0, 0);
    // scatter via matériau
    const scatterRes = rec.material.scatter(ray, rec);
    if (scatterRes) {
      const { scattered, attenuation } = scatterRes;
      // récursion sur rayon scatter
      return attenuation.multiply(
        color(scattered, world, depth + 1)
      );
    }
    return new Vec3(0, 0, 0); // absorbé → noir
  }
  // pas d’impact → arrière-plan
  const unitDir = ray.direction().normalize();
  const t       = 0.5 * (unitDir.y() + 1.0);
  const white   = new Vec3(1.0, 1.0, 1.0);
  const blue    = new Vec3(0.5, 0.7, 1.0);
  // interpolation linéaire blanc→bleu
  return white.multiplyScalar(1.0 - t)
              .add(blue.multiplyScalar(t));
}

// boucle de rendu final
for (let j = 0; j < ny; j++) {       // pour chaque ligne
  for (let i = 0; i < nx; i++) {     // pour chaque colonne
    let col = new Vec3(0, 0, 0);     // init couleur pixel

    // supersampling ns rayons
    for (let s = 0; s < ns; s++) {
      const u = (i + randomDouble()) / nx;
      const v = ((ny - 1 - j) + randomDouble()) / ny;
      const r = cam.getRay(u, v);    // rayon timing+DOF
      col = col.add(color(r, world, 0));
    }

    // moyenne échantillons
    col = col.divideScalar(ns);
    // gamma correction sqrt
    col = new Vec3(
      Math.sqrt(col.x()),
      Math.sqrt(col.y()),
      Math.sqrt(col.z())
    );

    // conversion 0–255 et écriture RGBA
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

// dessiner tampon sur canvas
ctx.putImageData(imageData, 0, 0);

import Vec3           from './vec3.js';
import Ray            from './ray.js';
import Sphere         from './sphere.js';
import HittableList   from './hittableList.js';
import Camera         from './camera.js';
import Lambertian     from './lambertian.js';
import Metal          from './metal.js';
import Dielectric     from './dielectric.js';
import {
  randomDouble,
  randomInUnitSphere,
  randomInUnitDisk,
  reflect,
  refract,
  schlick
}                    from './utils.js';

// récupérer canvas html
const canvas = document.getElementById('canvas');
// obtenir contexte 2d
const ctx    = canvas.getContext('2d');

// dimensions image
const nx = 200, ny = 100;
// échantillons par pixel
const ns = 100;
// profondeur recursion max
const maxDepth = 50;

// préparer imageData brut
const imageData = ctx.createImageData(nx, ny);
const data      = imageData.data;

// construire monde objets
const world = new HittableList([
  new Sphere(
    new Vec3( 0,  0, -1), 0.5,
    new Lambertian(new Vec3(0.8, 0.3, 0.3))   // sphère diffuse rouge
  ),
  new Sphere(
    new Vec3( 1,  0, -1), 0.5,
    new Metal(new Vec3(0.8, 0.6, 0.2), 0.0)    // sphère métal parfait
  ),
  new Sphere(
    new Vec3(-1,  0, -1), 0.5,
    new Dielectric(1.5)                       // bulle verre extérieure
  ),
  new Sphere(
    new Vec3(-1,  0, -1), -0.45,
    new Dielectric(1.5)                       // bulle verre intérieure
  ),
  new Sphere(
    new Vec3( 0,-100.5,-1),100,
    new Lambertian(new Vec3(0.8, 0.8, 0.0))   // sol jaune vaste
  )
]);

// calculer focus_dist et aperture
const lookfrom  = new Vec3(3, 3, 2);                     // position cam
const lookat    = new Vec3(0, 0, -1);                    // point visé
const focusDist = lookfrom.subtract(lookat).length();    // plan net
const aperture  = 2.0;                                   // diamètre trou

// instancier caméra DOF
const aspect = nx / ny;
const cam    = new Camera(
  new Vec3(-3,0,2),
  new Vec3(0,0,-1),
  new Vec3(0,1,0),
  15,     // vfov°
  aspect, // ratio
  0,      // aperture (ouverture diaphragme)
  1.0     // focusDist (focus_dist)
);

// calculer couleur d’un rayon
function color(ray, world, depth) {
  const rec = {};
  // intersection la plus proche ?
  if (world.hit(ray, 0.001, Infinity, rec)) {
    if (depth >= maxDepth) {
      return new Vec3(0, 0, 0);       // fin recursion
    }
    // scatter via matériau
    const scatterRes = rec.material.scatter(ray, rec);
    if (scatterRes) {
      const { scattered, attenuation } = scatterRes;
      return attenuation.multiply(
        color(scattered, world, depth + 1)
      );
    }
    return new Vec3(0, 0, 0);         // rayon absorbé
  }
  // background gradient
  const unitDir = ray.direction().normalize();
  const t       = 0.5 * (unitDir.y() + 1.0);
  const white   = new Vec3(1.0, 1.0, 1.0);
  const blue    = new Vec3(0.5, 0.7, 1.0);
  return white.multiplyScalar(1.0 - t)
              .add(blue.multiplyScalar(t));
}

// boucle de rendu pixels
for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
    let col = new Vec3(0, 0, 0);         // accum couleur
    for (let s = 0; s < ns; s++) {       // supersampling
      const u = (i + randomDouble()) / nx;
      const v = ((ny - 1 - j) + randomDouble()) / ny;
      const r = cam.getRay(u, v);
      col = col.add(color(r, world, 0));
    }
    col = col.divideScalar(ns);          // moyenne samples
    col = new Vec3(                       // gamma correction
      Math.sqrt(col.x()),
      Math.sqrt(col.y()),
      Math.sqrt(col.z())
    );
    // conversion 0–255 et écriture
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

// dessiner imageData sur canvas
ctx.putImageData(imageData, 0, 0);









/*
import Vec3          from './vec3.js';
import Ray           from './ray.js';
import Sphere        from './sphere.js';
import HittableList  from './hittableList.js';
import Camera        from './camera.js';
import Lambertian    from './lambertian.js';
import Metal         from './metal.js';
import Dielectric   from './dielectric.js';
import { randomDouble } from './utils.js';

// récupérer canvas html
const canvas = document.getElementById('canvas');
// obtenir contexte 2d
const ctx    = canvas.getContext('2d');

// dimensions image
const nx = 200, ny = 100;
// échantillons par pixel
const ns = 100; //100
// max rebonds récursifs
const maxDepth = 50; //50
// préparer imageData brut
const imageData = ctx.createImageData(nx, ny);
const data      = imageData.data;

// construire monde matériaux variés
const world = new HittableList([
  new Sphere(new Vec3( 0, 0, -1), 0.5,
             new Lambertian(new Vec3(0.8, 0.3, 0.3))),
  new Sphere(new Vec3( 1,    0,  -1),  0.5,
             new Metal(new Vec3(0.8, 0.6, 0.2), 0.0)),
  new Sphere(new Vec3(-1,    0,  -1),  0.5,
             new Dielectric(1.5)),                   // paroi extérieure
  new Sphere(new Vec3(-1,    0,  -1), -0.45,
             new Dielectric(1.5)),                   // intérieur creux
  new Sphere(new Vec3( 0, -100.5, -1),100,
             new Lambertian(new Vec3(0.8, 0.8, 0.0)))
]);

// caméra
const aspect = nx / ny;
// positionner caméra :) !
const cam = new Camera(
  new Vec3(2, 3, 3),  // lookfrom
  new Vec3( 0, 0, -1), // lookat
  new Vec3( 0, 1,  0), // vup
  15,                  // vfov en degrés
  aspect               // ratio largeur/hauteur
);

// calculer couleur avec matériaux
function color(ray, world, depth) {
  const rec = {};
  // hit plus proche surface
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // limiter profondeur récursion
    if (depth >= maxDepth) {
      return new Vec3(0, 0, 0);
    }
    // scatter via matériau
    const scatterResult = rec.material.scatter(ray, rec);
    if (scatterResult) {
      const { scattered, attenuation } = scatterResult;
      // calcul couleur récursive
      return attenuation.multiply(
        color(scattered, world, depth + 1)
      );
    }
    // rayon absorbé => noir
    return new Vec3(0, 0, 0);
  }
  // arrière-plan dégradé fond
  const unitDir = ray.direction().normalize();
  const t       = 0.5 * (unitDir.y() + 1.0);
  const white   = new Vec3(1.0, 1.0, 1.0);
  const blue    = new Vec3(0.5, 0.7, 1.0);
  return white.multiplyScalar(1.0 - t)
              .add(blue.multiplyScalar(t));
}

// boucle de rendu pixels
for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
    // couleur accumulée
    let col = new Vec3(0, 0, 0);
    // supersampling ns rayons
    for (let s = 0; s < ns; s++) {
      const u = (i + randomDouble()) / nx;
      const v = ((ny - 1 - j) + randomDouble()) / ny;
      const r = cam.getRay(u, v);
      col    = col.add(color(r, world, 0));
    }
    // moyenne des ns échantillons
    col = col.divideScalar(ns);
    // gamma correction (sqrt)
    col = new Vec3(
      Math.sqrt(col.x()),
      Math.sqrt(col.y()),
      Math.sqrt(col.z())
    );
    // conversion en 0–255
    const ir = Math.floor(255.99 * col.r());
    const ig = Math.floor(255.99 * col.g());
    const ib = Math.floor(255.99 * col.b());
    // écrire dans imageData
    const idx     = 4 * (j * nx + i);
    data[idx + 0] = ir;
    data[idx + 1] = ig;
    data[idx + 2] = ib;
    data[idx + 3] = 255;
  }
}

// dessiner imageData sur canvas
ctx.putImageData(imageData, 0, 0);
*/








/*
import Vec3         from './vec3.js';
import Ray          from './ray.js';
import Sphere       from './sphere.js';
import HittableList from './hittableList.js';
import Camera       from './camera.js';

// récupérer canvas html
const canvas = document.getElementById('canvas');
// obtenir contexte 2d
const ctx    = canvas.getContext('2d');

// dimensions image
const nx = 200, ny = 100;
// échantillons par pixel
const ns = 100;
// max rebonds récursifs
const maxDepth = 50;
// préparer imageData brut
const imageData = ctx.createImageData(nx, ny);
const data      = imageData.data;

// générateur aléatoire [0,1)
function randomDouble() {
  return Math.random();
}

// point aléatoire dans sphère unité
function randomInUnitSphere() {
  let p;
  do {
    // p.x,y,z ∈ [-1,1]
    p = new Vec3(
      2 * randomDouble() - 1,
      2 * randomDouble() - 1,
      2 * randomDouble() - 1
    );
  } while (p.squaredLength() >= 1.0);
  return p;
}

// construire monde (deux sphères)
const world = new HittableList([
  new Sphere(new Vec3( 0,    0,  -1),   0.5),
  new Sphere(new Vec3( 0, -100.5, -1), 100.0)
]);

// instancier caméra
const cam = new Camera();

// calculer couleur d’un rayon avec diffuse
function color(ray, world, depth) {
  const rec = {};
  // hit plus proche ?
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // si trop de rebonds
    if (depth >= maxDepth) {
      // pas plus d’énergie
      return new Vec3(0, 0, 0);
    }
    // point rebond
    const target = rec.p
      .add(rec.normal)
      .add(randomInUnitSphere());
    // rayon rebond diffus
    return color(
      new Ray(rec.p, target.subtract(rec.p)),
      world,
      depth + 1
    ).multiplyScalar(0.5);
  }
  // fond dégradé
  const unitDir = ray.direction().normalize();
  const t       = 0.5 * (unitDir.y() + 1.0);
  const white   = new Vec3(1.0, 1.0, 1.0);
  const blue    = new Vec3(0.5, 0.7, 1.0);
  return white.multiplyScalar(1.0 - t)
              .add(blue.multiplyScalar(t));
}

// boucle de rendu pixels
for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
    // couleur accumulée
    let col = new Vec3(0, 0, 0);
    // supersampling ns rayons
    for (let s = 0; s < ns; s++) {
      const u = (i + randomDouble()) / nx;
      const v = ((ny - 1 - j) + randomDouble()) / ny;
      const r = cam.getRay(u, v);
      col    = col.add(color(r, world, 0));
    }
    // moyenne des ns échantillons
    col = col.divideScalar(ns);
    // gamma correction (sqrt)
    col = new Vec3(
      Math.sqrt(col.x()),
      Math.sqrt(col.y()),
      Math.sqrt(col.z())
    );
    // conversion en 0–255
    const ir = Math.floor(255.99 * col.r());
    const ig = Math.floor(255.99 * col.g());
    const ib = Math.floor(255.99 * col.b());
    // écrire dans imageData
    const idx     = 4 * (j * nx + i);
    data[idx + 0] = ir;
    data[idx + 1] = ig;
    data[idx + 2] = ib;
    data[idx + 3] = 255;
  }
}

// dessiner imageData sur canvas
ctx.putImageData(imageData, 0, 0);
*/
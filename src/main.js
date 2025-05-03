import Vec3         from './vec3.js';
import Ray          from './ray.js';
import Sphere       from './sphere.js';
import HittableList from './hittableList.js';
import Camera       from './camera.js';

// récupérer canvas html
const canvas = document.getElementById('canvas');
// obtenir contexte 2d
const ctx = canvas.getContext('2d');

// dimensions image
const nx = 200, ny = 100;
// nombre d’échantillons par pixel
const ns = 100;
// préparer imageData brut
const imageData = ctx.createImageData(nx, ny);
const data      = imageData.data;

// générateur aléatoire [0,1)
function randomDouble() {
  return Math.random();
}

// construire monde avec deux sphères
const world = new HittableList([
  new Sphere(new Vec3( 0,    0,  -1),   0.5),
  new Sphere(new Vec3( 0, -100.5, -1), 100.0)
]);

// instancier caméra
const cam = new Camera();

// fonction couleur d’un rayon
function color(ray) {
  const rec = {};
  // hit le plus proche ?
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // normale unitaire
    const N = rec.normal;
    // mapper [-1,1]→[0,1]
    return new Vec3(N.x()+1, N.y()+1, N.z()+1)
             .multiplyScalar(0.5);
  }
  // sinon même dégradé fond
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
      col = col.add(color(r));
    }
    // moyenne des ns échantillons
    col = col.divideScalar(ns);
    // conversion en 0–255
    const ir = Math.floor(255.99 * col.r());
    const ig = Math.floor(255.99 * col.g());
    const ib = Math.floor(255.99 * col.b());
    // écriture dans imageData
    const idx = 4 * (j * nx + i);
    data[idx + 0] = ir;
    data[idx + 1] = ig;
    data[idx + 2] = ib;
    data[idx + 3] = 255;
  }
}

// dessiner sur le canvas
ctx.putImageData(imageData, 0, 0);

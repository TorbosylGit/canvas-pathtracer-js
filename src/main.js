import Vec3         from './vec3.js';
import Ray          from './ray.js';
import Sphere       from './sphere.js';
import HittableList from './hittableList.js';

// récupérer canvas html
const canvas = document.getElementById('canvas');
// obtenir contexte 2d
const ctx    = canvas.getContext('2d');

// dimensions image
const nx = 200, ny = 100;
// préparer imageData brut
const imageData = ctx.createImageData(nx, ny);
const data      = imageData.data;

// construire monde (liste objets)
const world = new HittableList([
  new Sphere(new Vec3(0,    0,   -1),   0.5),    // sphère flottante
  new Sphere(new Vec3(0,   -100.5, -1), 100)     // plan sol
]);

// calculer couleur d’un rayon
function color(ray) {
  const rec = {};  // hit record
  // si ray touche objet
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // normale de surface
    const N = rec.normal;
    // mapper [-1,1]→[0,1]
    return new Vec3(N.x()+1, N.y()+1, N.z()+1)
             .multiplyScalar(0.5);
  }
  // sinon dégradé de fond
  const unitDir = ray.direction().normalize();
  const t       = 0.5 * (unitDir.y() + 1.0);
  const white   = new Vec3(1.0, 1.0, 1.0);
  const blue    = new Vec3(0.5, 0.7, 1.0);
  return white.multiplyScalar(1.0 - t)
              .add(blue.multiplyScalar(t));
}

// définir caméra simple
const lowerLeftCorner = new Vec3(-2.0, -1.0, -1.0);
const horizontal      = new Vec3(4.0,   0.0,   0.0);
const vertical        = new Vec3(0.0,   2.0,   0.0);
const origin          = new Vec3(0.0,   0.0,   0.0);

// boucle de rendu pixels
for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
    // u croissant gauche→droite
    const u = i / nx;
    // v croissant bas→haut
    const v = (ny - 1 - j) / ny;
    // générer rayon pixel
    const r = new Ray(
      origin,
      lowerLeftCorner
        .add(horizontal.multiplyScalar(u))
        .add(vertical.multiplyScalar(v))
    );
    // récupérer couleur pixel
    const col = color(r);
    // conversion composantes
    const ir = Math.floor(255.99 * col.r());
    const ig = Math.floor(255.99 * col.g());
    const ib = Math.floor(255.99 * col.b());

    // écrire valeurs RGBA
    const idx     = 4 * (j * nx + i);
    data[idx + 0] = ir;
    data[idx + 1] = ig;
    data[idx + 2] = ib;
    data[idx + 3] = 255;
  }
}

// dessiner imageData sur canvas
ctx.putImageData(imageData, 0, 0);









/*
// importer classes Vec3 et Ray
import Vec3 from './vec3.js';
import Ray  from './ray.js';

// récupérer canvas html
const canvas = document.getElementById('canvas');
// obtenir contexte 2d
const ctx    = canvas.getContext('2d');

// dimensions image
const nx = 200;
const ny = 100;
// préparer imageData brut
const imageData = ctx.createImageData(nx, ny);
const data      = imageData.data;

// test intersection sphère
function hitSphere(center, radius, ray) {
  // vecteur origine→centre
  const oc = ray.origin().subtract(center);
  // coefficient a = B·B
  const a = ray.direction().dot(ray.direction());
  // coefficient b = 2·oc·B
  const b = 2.0 * oc.dot(ray.direction());
  // coeff c = oc·oc − R²
  const c = oc.dot(oc) - radius * radius;
  // discriminant b²−4ac
  const disc = b * b - 4 * a * c;
  // intersection si > 0
  return disc > 0;
}

// calculer couleur d’un rayon
function color(r) {
  // si touche sphère centree
  if (hitSphere(new Vec3(0, 0, -1), 0.5, r)) {
    // renvoyer couleur rouge
    return new Vec3(1.0, 0.0, 0.0);
  }
  // direction unitaire du rayon
  const unitDir = r.direction().normalize();
  // t = lerp blanc→bleu
  const t = 0.5 * (unitDir.y() + 1.0);
  // couleurs extrêmes
  const white = new Vec3(1.0, 1.0, 1.0);
  const blue  = new Vec3(0.5, 0.7, 1.0);
  // interpolation linéaire
  return white.multiplyScalar(1.0 - t)
              .add(blue.multiplyScalar(t));
}

// définir caméra simple
const lowerLeftCorner = new Vec3(-2.0, -1.0, -1.0);
const horizontal      = new Vec3( 4.0,  0.0,  0.0);
const vertical        = new Vec3( 0.0,  2.0,  0.0);
const origin          = new Vec3( 0.0,  0.0,  0.0);

// boucle de rendu pixels
for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
    // u croissant gauche→droite
    const u = i / nx;
    // v croissant bas→haut
    const v = (ny - 1 - j) / ny;
    // créer rayon pour pixel
    const r = new Ray(
      origin,
      lowerLeftCorner
        .add(horizontal.multiplyScalar(u))
        .add(vertical.multiplyScalar(v))
    );
    // obtenir couleur pixel
    const col = color(r);
    // conversion composantes
    const ir = Math.floor(255.99 * col.r());
    const ig = Math.floor(255.99 * col.g());
    const ib = Math.floor(255.99 * col.b());

    // écrire données RGBA
    const idx = 4 * (j * nx + i);
    data[idx + 0] = ir;
    data[idx + 1] = ig;
    data[idx + 2] = ib;
    data[idx + 3] = 255;
  }
}

// dessiner sur le canvas
ctx.putImageData(imageData, 0, 0);
*/
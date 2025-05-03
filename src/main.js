// importer classes Vec3 et Ray
import Vec3 from './vec3.js';
import Ray from './ray.js';

// récupérer canvas html
const canvas = document.getElementById('canvas');
// obtenir contexte 2d
const ctx = canvas.getContext('2d');

// dimensions image
const nx = 200;
const ny = 100;
// préparer imageData
const imageData = ctx.createImageData(nx, ny);
const data = imageData.data;

// calculer couleur d'un rayon
function color(r) {
  // direction unitaire
  const unitDir = r.direction().normalize();
  // paramètre t dans [0,1]
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
const horizontal      = new Vec3(4.0, 0.0, 0.0);
const vertical        = new Vec3(0.0, 2.0, 0.0);
const origin          = new Vec3(0.0, 0.0, 0.0);

// parcours pixels image
for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
    // u toujours croissant de gauche à droite
    const u = i / nx;
    // v croissant du bas vers le haut
    const v = (ny - 1 - j) / ny;

    // construire rayon
    const r = new Ray(
      origin,
      lowerLeftCorner
        .add(horizontal.multiplyScalar(u))
        .add(vertical.multiplyScalar(v))
    );

    // calcul couleur via gradient blanc→bleu
    const col = color(r);

    // conversion en 0–255
    const ir = Math.floor(255.99 * col.r());
    const ig = Math.floor(255.99 * col.g());
    const ib = Math.floor(255.99 * col.b());

    // écriture dans l'imageData
    const idx = 4 * (j * nx + i);
    data[idx + 0] = ir;
    data[idx + 1] = ig;
    data[idx + 2] = ib;
    data[idx + 3] = 255;
  }
}
ctx.putImageData(imageData, 0, 0);

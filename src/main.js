// importer classe vecteur
import Vec3 from './vec3.js';

// récupérer élément canvas html
const canvas = document.getElementById('canvas');
// obtenir contexte 2d
const ctx = canvas.getContext('2d');

const nx = 200;
const ny = 100;
// préparer tampon données pixels
const imageData = ctx.createImageData(nx, ny);
// accéder au tableau pixels
const data = imageData.data;

// boucler lignes pixels
for (let j = 0; j < ny; j++) {
  // boucler colonnes pixels
  for (let i = 0; i < nx; i++) {
    // créer vecteur couleur rgb
    const col = new Vec3(
      i / nx,
      (ny - 1 - j) / ny,
      0.2
    );
    // convertir composantes en entier
    const ir = Math.floor(255.99 * col.r());
    const ig = Math.floor(255.99 * col.g());
    const ib = Math.floor(255.99 * col.b());

    // calcul index pixel base
    const index = 4 * (j * nx + i);
    // stocker rouge vert bleu alpha
    data[index + 0] = ir;
    data[index + 1] = ig;
    data[index + 2] = ib;
    data[index + 3] = 255;
  }
}

// dessiner imageData sur canvas
ctx.putImageData(imageData, 0, 0);

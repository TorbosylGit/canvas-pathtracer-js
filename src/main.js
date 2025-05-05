import Vec3          from './vec3.js';
import Ray           from './ray.js';
import Sphere        from './sphere.js';
import HittableList  from './hittableList.js';
import Camera        from './camera.js';
import Lambertian    from './lambertian.js';
import Metal         from './metal.js';
import Dielectric    from './dielectric.js';
import MovingSphere  from './movingSphere.js';
import { randomDouble } from './utils.js';
import { randomScene }  from './randomScene.js';

// paramètres résolution et échantillonnage
const nx       = 240; // nombre colonnes internes axe x
const ny       = 135; // nombre lignes internes axe y
const ns       = 10; // échantillons par pixel total (100)
const maxDepth = 20;  // profondeur récursion max rayons (50)

// créer scène (fixe et mouvante)
const world = randomScene(); // scène aléatoire variée

// config caméra DOF + flou mouv
const lookfrom   = new Vec3(13, 2, 3);                // position initiale cam
const lookat     = new Vec3(0,  0, 0);                // point visé scène
const vup        = new Vec3(0,  1, 0);                // vecteur « up » monde
const focusDist  = lookfrom.subtract(lookat).length(); // distance plan net
const aperture   = 0.1;                              // ouverture diaphragme
const time0      = 0.0;                              // début obturateur ouvert
const time1      = 1.0;                              // fin obturateur fermé
const aspect     = nx / ny;                          // ratio largeur/hauteur

const cam = new Camera(
  lookfrom, lookat, vup,
  20, aspect,
  aperture, focusDist,
  time0, time1
); // instancier caméra DOF mouv

// préparer canvas et imageData brut
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');               // obtenir contexte 2d
const imageData = ctx.createImageData(nx, ny);        // allouer tampon image
const data      = imageData.data;

// boucle rendu final
for (let j = 0; j < ny; j++) {                         // boucle lignes image
  for (let i = 0; i < nx; i++) {                       // boucle colonnes image
    // initialiser couleur accumulée pixel
    let col = new Vec3(0, 0, 0);

    // lancer ns rayons par pixel
    for (let s = 0; s < ns; s++) {
      const u = (i + randomDouble()) / nx;             // coord u pixel aléa
      const v = ((ny - 1 - j) + randomDouble()) / ny;  // coord v pixel aléa
      const r = cam.getRay(u, v);                      // rayon timé + DOF
      col = col.add(color(r, world, 0));               // accumuler couleur récursive
    }

    // moyenne couleurs échantillons
    col = col.divideScalar(ns);
    // appliquer correction gamma sqrt
    col = new Vec3(
      Math.sqrt(col.x()),
      Math.sqrt(col.y()),
      Math.sqrt(col.z())
    );

    // conversion composantes en 0–255
    const ir  = Math.floor(255.99 * col.r());         // conversion canal rouge
    const ig  = Math.floor(255.99 * col.g());         // conversion canal vert
    const ib  = Math.floor(255.99 * col.b());         // conversion canal bleu
    const idx = 4 * (j * nx + i);                     // calcul index pixel RGBA
    data[idx + 0] = ir;                               // écrire composante rouge pixel
    data[idx + 1] = ig;                               // écrire composante vert pixel
    data[idx + 2] = ib;                               // écrire composante bleu pixel
    data[idx + 3] = 255;                              // écrire composante alpha opaque
  }
}

// dessiner imageData sur canvas
ctx.putImageData(imageData, 0, 0);

// fonction récursive couleur ray
function color(ray, world, depth) {
  // init record impact variable
  const rec = {};
  // si intersection trouvée proche
  if (world.hit(ray, 0.001, Infinity, rec)) {
    // stopper récursion profondeur max
    if (depth >= maxDepth) {
      return new Vec3(0, 0, 0);                      // retour noir arrêt récursion
    }
    // scatter via material associé
    const scatterRes = rec.material.scatter(ray, rec);
    if (scatterRes) {
      const { scattered, attenuation } = scatterRes;
      // générer rayon scatter et atténuation
      const colRec = color(scattered, world, depth + 1);
      // multiplier attenuation et couleur
      return attenuation.multiply(colRec);
    }
    return new Vec3(0, 0, 0);                        // rayon absorbé retourne noir
  }
  // sinon fond ciel gradient
  const unitDir = ray.direction().normalize();      // direction unitaire du rayon
  const t       = 0.5 * (unitDir.y() + 1.0);        // param t pour gradient
  const white   = new Vec3(1.0, 1.0, 1.0);         // couleur blanc pour fond
  const blue    = new Vec3(0.5, 0.7, 1.0);         // couleur bleu pour fond
  // interpolation blanc vers bleu
  return white.multiplyScalar(1.0 - t)
              .add(blue.multiplyScalar(t));
}

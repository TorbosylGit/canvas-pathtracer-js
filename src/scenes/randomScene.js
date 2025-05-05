import Vec3            from '../vec3.js';
import Sphere          from '../sphere.js';
import Lambertian      from '../lambertian.js';
import Metal           from '../metal.js';
import Dielectric      from '../dielectric.js';
import HittableList    from '../hittableList.js';
import { randomDouble } from '../utils.js';

// génère scène aléatoire complète
export default function randomScene() {
  const objects = [];           // tableau hitables

  // créer sol diffus large
  objects.push(
    new Sphere(
      new Vec3(0, -1000, 0),    // centre sol
      1000,                     // rayon sol
      new Lambertian(
        new Vec3(0.5, 0.5, 0.5) // couleur sol
      )
    )
  );

  // boucle grille petits objets
  for (let a = -11; a < 11; a++) {
    for (let b = -11; b < 11; b++) {
      const choose = randomDouble();   
      const center = new Vec3(
        a + 0.9 * randomDouble(), // position x
        0.2,                      // position y
        b + 0.9 * randomDouble()  // position z
      );

      // éviter zone centre
      if (center.subtract(new Vec3(4, 0.2, 0))
                   .length() > 0.9) {
        if (choose < 0.8) {
          // sphère diffuse aléatoire
          objects.push(
            new Sphere(
              center, 0.2,
              new Lambertian(
                new Vec3(
                  randomDouble() * randomDouble(),
                  randomDouble() * randomDouble(),
                  randomDouble() * randomDouble()
                )
              )
            )
          );
        } else if (choose < 0.95) {
          // sphère métal aléatoire
          objects.push(
            new Sphere(
              center, 0.2,
              new Metal(
                new Vec3(
                  0.5 * (1 + randomDouble()),
                  0.5 * (1 + randomDouble()),
                  0.5 * (1 + randomDouble())
                ),
                0.5 * randomDouble()
              )
            )
          );
        } else {
          // sphère verre aléatoire
          objects.push(
            new Sphere(
              center, 0.2,
              new Dielectric(1.5)
            )
          );
        }
      }
    }
  }

  // ajouter sphères principales
  objects.push(
    new Sphere(
      new Vec3(0, 1, 0),        // centre sphère
      1.0,                      // rayon sphère
      new Dielectric(1.5)       // matériau verre
    )
  );
  objects.push(
    new Sphere(
      new Vec3(-4, 1, 0),       // centre sphère
      1.0,                      // rayon sphère
      new Lambertian(
        new Vec3(0.4, 0.2, 0.1) // couleur brune
      )
    )
  );
  objects.push(
    new Sphere(
      new Vec3(4, 1, 0),        // centre sphère
      1.0,                      // rayon sphère
      new Metal(
        new Vec3(0.7, 0.6, 0.5),// couleur métal
        0.0                     // pas de flou
      )
    )
  );

  // retourner conteneur hitable
  return new HittableList(objects);
}

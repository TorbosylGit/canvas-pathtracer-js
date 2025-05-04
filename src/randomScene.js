import Vec3        from './vec3.js';
import Sphere      from './sphere.js';
import Lambertian  from './lambertian.js';
import Metal       from './metal.js';
import Dielectric  from './dielectric.js';
import HittableList from './hittableList.js';
import { randomDouble } from './utils.js';

// génère scène aléatoire
export function randomScene() {
  const list = [];
  
  // sol diffus
  list.push(
    new Sphere(
      new Vec3(0, -1000, 0),
      1000,
      new Lambertian(new Vec3(0.5, 0.5, 0.5))
    )
  );

  // petites sphères aléatoires
  for (let a = -11; a < 11; a++) {
    for (let b = -11; b < 11; b++) {
      const chooseMat = randomDouble();
      const center = new Vec3(
        a + 0.9 * randomDouble(),
        0.2,
        b + 0.9 * randomDouble()
      );

      // éviter collision avec gros groupe
      if (center.subtract(new Vec3(4, 0.2, 0)).length() > 0.9) {
        if (chooseMat < 0.8) {
          // matériau diffus
          list.push(
            new Sphere(
              center,
              0.2,
              new Lambertian(
                new Vec3(
                  randomDouble() * randomDouble(),
                  randomDouble() * randomDouble(),
                  randomDouble() * randomDouble()
                )
              )
            )
          );
        } else if (chooseMat < 0.95) {
          // matériau métal
          list.push(
            new Sphere(
              center,
              0.2,
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
          // matériau verre
          list.push(
            new Sphere(
              center,
              0.2,
              new Dielectric(1.5)
            )
          );
        }
      }
    }
  }

  // trois grosses sphères centrales
  list.push(
    new Sphere(new Vec3(0, 1, 0), 1.0, new Dielectric(1.5))
  );
  list.push(
    new Sphere(new Vec3(-4, 1, 0), 1.0,
               new Lambertian(new Vec3(0.4, 0.2, 0.1)))
  );
  list.push(
    new Sphere(new Vec3(4, 1, 0), 1.0,
               new Metal(new Vec3(0.7, 0.6, 0.5), 0.0))
  );

  return new HittableList(list);
}

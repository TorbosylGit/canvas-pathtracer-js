import Vec3            from './vec3.js';
import Sphere          from './sphere.js';
import Lambertian      from './lambertian.js';
import ConstantTexture from './constantTexture.js';
import CheckerTexture  from './checkerTexture.js';
import HittableList    from './hittableList.js';

// scène de deux sphères damier
export function twoSpheres() {
  // créer texture damier
  const checker = new CheckerTexture(
    new ConstantTexture(new Vec3(0.2, 0.3, 0.1)), // sombre
    new ConstantTexture(new Vec3(0.9, 0.9, 0.9))  // clair
  );

  // sphère basse, rayon 10
  const sphere1 = new Sphere(
    new Vec3(0, -10, 0),
    10,
    new Lambertian(checker)  // appliquer damier
  );

  // sphère haute, rayon 10
  const sphere2 = new Sphere(
    new Vec3(0, 10, 0),
    10,
    new Lambertian(checker)  // même damier
  );

  // renvoyer liste hitables
  return new HittableList([sphere1, sphere2]);
}

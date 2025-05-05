import Vec3            from '../vec3.js';
import Sphere          from '../sphere.js';
import Lambertian      from '../lambertian.js';
import MarbleTexture   from '../marbleTexture.js';
import HittableList    from '../hittableList.js';

// sphères effet marbre procédural
export default function marbleSphere() {
  // créer texture marbrée
  const marbleTex = new MarbleTexture(4); // fréquence x4

  // sol et sphère marbrée
  const objects = [
    new Sphere(
      new Vec3(0, -1000, 0),      // centre sol
      1000,                       // rayon sol
      new Lambertian(marbleTex)   // matériau marbré
    ),
    new Sphere(
      new Vec3(0, 2, 0),          // centre sphère
      2,                          // rayon sphère
      new Lambertian(marbleTex)   // même matériau
    )
  ];

  // retourner liste hitables
  return new HittableList(objects);
}

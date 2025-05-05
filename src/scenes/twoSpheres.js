import Vec3            from '../vec3.js';
import Sphere          from '../sphere.js';
import Lambertian      from '../lambertian.js';
import ConstantTexture from '../constantTexture.js';
import CheckerTexture  from '../checkerTexture.js';
import HittableList    from '../hittableList.js';

// deux sphères damier procédural
export default function twoSpheres() {
  // construire texture damier
  const checker = new CheckerTexture(
    new ConstantTexture(
      new Vec3(0.2, 0.3, 0.1)   // couleur sombre
    ),
    new ConstantTexture(
      new Vec3(0.9, 0.9, 0.9)   // couleur claire
    )
  );

  // liste de deux sphères
  const objects = [
    new Sphere(
      new Vec3(0, -10, 0),      // centre basse sphère
      10,                       // rayon sphère
      new Lambertian(checker)   // matériau damier
    ),
    new Sphere(
      new Vec3(0, 10, 0),       // centre haute sphère
      10,                       // rayon sphère
      new Lambertian(checker)   // même matériau
    )
  ];

  // retourne hitable list
  return new HittableList(objects);
}

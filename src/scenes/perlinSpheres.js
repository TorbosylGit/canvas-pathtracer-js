import Vec3           from '../vec3.js';
import Sphere         from '../sphere.js';
import Lambertian     from '../lambertian.js';
import NoiseTexture   from '../noiseTexture.js';
import HittableList   from '../hittableList.js';

// sphères texturées bruit Perlin
export default function perlinSpheres() {
  // créer texture bruit perlin
  const noiseTex = new NoiseTexture(4); // fréquence x4

  // sol et petite sphère
  const objects = [
    new Sphere(
      new Vec3(0, -1000, 0),     // centre sol
      1000,                      // rayon sol
      new Lambertian(noiseTex)   // matériau bruit
    ),
    new Sphere(
      new Vec3(0, 2, 0),         // centre sphère
      2,                         // rayon sphère
      new Lambertian(noiseTex)   // même matériau
    )
  ];

  // renvoyer conteneur hitable
  return new HittableList(objects);
}

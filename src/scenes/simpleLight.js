import Vec3           from '../vec3.js';
import Sphere         from '../sphere.js';
import Lambertian     from '../lambertian.js';
import DiffuseLight   from '../diffuseLight.js';
import ConstantTexture from '../constantTexture.js';
import XYRect         from '../xyRect.js';
import HittableList   from '../hittableList.js';

// scène simple avec source plane
export default function simpleLight() {
  // texture bruit
  const noiseTex = new NoiseTexture(4);
  // texture lumière blanche
  const lightTex = new ConstantTexture(new Vec3(4, 4, 4));

  const objects = [
    // grand sol diffus
    new Sphere(
      new Vec3(0, -1000, 0),
      1000,
      new Lambertian(noiseTex)
    ),
    // petite sphère diffuse
    new Sphere(
      new Vec3(0,    2, 0),
      2,
      new Lambertian(noiseTex)
    ),
    // sphère lumineuse suspendue
    new Sphere(
      new Vec3(0,    7, 0),
      2,
      new DiffuseLight(lightTex)
    ),
    // rectangle émetteur plat
    new XYRect(
      3, 5,     // x0,x1
      1, 3,     // y0,y1
      -2,       // z = -2
      new DiffuseLight(lightTex)
    )
  ];

  return new HittableList(objects);
}

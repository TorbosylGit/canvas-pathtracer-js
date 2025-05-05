import Material            from './material.js';
import Vec3                from './vec3.js';
import Ray                 from './ray.js';
import { randomInUnitSphere } from './utils.js';

// matériau lambertien texturé
export default class Lambertian extends Material {
  constructor(albedoTex) {
    super();
    this.albedo = albedoTex;    // texture albédo
  }

  scatter(rayIn, rec) {
    // point de rebond aléatoire
    const target = rec.p
      .add(rec.normal)
      .add(randomInUnitSphere());

    // créer rayon diffus
    const scattered = new Ray(
      rec.p,                        // origine impact
      target.subtract(rec.p),       // direction rebond
      rayIn.time()                  // même timestamp
    );

    // couleur via texture
    const attenuation = this.albedo.value(
      0, 0, rec.p                   // u,v, position p
    );
    return { scattered, attenuation };
  }
}

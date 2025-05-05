import Material            from './material.js';
import Vec3                from './vec3.js';
import Ray                 from './ray.js';
import { randomInUnitSphere } from './utils.js';

// matériau diffus lambertien modèle
export default class Lambertian extends Material {
  constructor(albedo) {
    super();
    this.albedo = albedo; // albédo couleur matériau diffuse
  }

  scatter(rayIn, rec) {
    // générer direction aléatoire diffus
    const target = rec.p
      .add(rec.normal)
      .add(randomInUnitSphere());

    // rayon scatter conserve temps
    const scattered = new Ray(
      rec.p,                         // origine point impact
      target.subtract(rec.p),        // direction vers cible
      rayIn.time()                   // conserve temps initial
    );
    const attenuation = this.albedo; // couleur albédo sphère diffuse
    return { scattered, attenuation };
  }
}

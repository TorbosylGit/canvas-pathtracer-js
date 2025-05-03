import Material            from './material.js';
import Vec3                from './vec3.js';
import Ray                 from './ray.js';
import { randomInUnitSphere } from './utils.js';

// matériau diffus lambertien
export default class Lambertian extends Material {
  constructor(albedo) {
    super();
    this.albedo = albedo; // couleur intrinsèque
  }

  scatter(rayIn, rec) {
    // point aléatoire sphère unité
    const target = rec.p
      .add(rec.normal)
      .add(randomInUnitSphere());
    // rayon diffus à partir cible
    const scattered = new Ray(
      rec.p,
      target.subtract(rec.p)
    );
    // attenuation couleur intrinsèque
    const attenuation = this.albedo;
    return { scattered, attenuation };
  }
}

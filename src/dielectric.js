import Material           from './material.js';
import Ray                from './ray.js';
import { reflect, refract, schlick, randomDouble } from './utils.js';

// matériau diélectrique (verre)
export default class Dielectric extends Material {
  constructor(refIdx) {
    super();
    this.refIdx = refIdx;   // indice de réfraction
  }

  scatter(rayIn, rec) {
    // attenuation toujours blanche
    const attenuation = new Vec3(1.0, 1.0, 1.0);

    // déterminer normale externe
    const outwardNormal = rayIn.direction().dot(rec.normal) > 0
      ? rec.normal.multiplyScalar(-1)
      : rec.normal;

    // rapport indices et cosine
    const niOverNt = rayIn.direction().dot(rec.normal) > 0
      ? this.refIdx
      : 1.0 / this.refIdx;

    const cosine = rayIn.direction().dot(rec.normal) > 0
      ? this.refIdx * rayIn.direction().dot(rec.normal) / rayIn.direction().length()
      : -rayIn.direction().dot(rec.normal) / rayIn.direction().length();

    // tentative réfraction
    const refracted = refract(rayIn.direction(), outwardNormal, niOverNt);
    // probabilité réflexion
    const reflectProb = refracted
      ? schlick(cosine, this.refIdx)
      : 1.0;

    // choix aléatoire
    const scatteredDir = (randomDouble() < reflectProb)
      ? reflect(rayIn.direction(), rec.normal)
      : refracted;

    const scattered = new Ray(rec.p, scatteredDir);
    return { scattered, attenuation };
  }
}

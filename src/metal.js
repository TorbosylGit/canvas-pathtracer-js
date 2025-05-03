import Material            from './material.js';
import Vec3                from './vec3.js';
import Ray                 from './ray.js';
import { reflect, randomInUnitSphere } from './utils.js';

// matériau métal spéculaire lisse/fuzzy
export default class Metal extends Material {
  constructor(albedo, fuzz) {
    super();
    this.albedo = albedo;               // couleur spéculaire
    this.fuzz   = fuzz < 1 ? fuzz : 1;  // degré flou
  }

  scatter(rayIn, rec) {
    // direction réflexion miroir
    const reflected = reflect(
      rayIn.direction().normalize(),
      rec.normal
    );
    // ajout bruit pour fuzzy
    const scattered = new Ray(
      rec.p,
      reflected.add(randomInUnitSphere().multiplyScalar(this.fuzz))
    );
    // attenuation couleur métal
    const attenuation = this.albedo;
    // réfléchi vers l’extérieur ?
    if (scattered.direction().dot(rec.normal) > 0) {
      return { scattered, attenuation };
    }
    // rayon absorbé
    return null;
  }
}

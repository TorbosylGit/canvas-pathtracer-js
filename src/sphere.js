import Hittable from './hittable.js';
import AABB      from './aabb.js';
import Vec3      from './vec3.js';

// sphère statique classique
export default class Sphere extends Hittable {
  constructor(center, radius, material) {
    super();
    this.center   = center;    // position centre sphère
    this.radius   = radius;    // rayon sphère
    this.material = material;  // matériau associé
  }

  // intersection rayon–sphère
  hit(ray, tMin, tMax, rec) {
    // vecteur origine→centre
    const oc = ray.origin().subtract(this.center);
    // coefficients quadratiques
    const a    = ray.direction().dot(ray.direction());
    const b    = oc.dot(ray.direction());
    const c    = oc.dot(oc) - this.radius * this.radius;
    const disc = b * b - a * c; // discriminant

    if (disc > 0) {
      // tester racine plus proche
      let temp = (-b - Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        // remplir rec d’impact
        rec.t        = temp;
        rec.p        = ray.pointAt(temp);
        rec.normal   = rec.p.subtract(this.center)
                             .divideScalar(this.radius);
        rec.material = this.material;
        return true;
      }
      // tester racine plus lointaine
      temp = (-b + Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t        = temp;
        rec.p        = ray.pointAt(temp);
        rec.normal   = rec.p.subtract(this.center)
                             .divideScalar(this.radius);
        rec.material = this.material;
        return true;
      }
    }
    return false; // pas d’impact
  }

  // calculer boîte englobante sphère
  boundingBox(t0, t1) {
    const r = this.radius; // rayon local
    const min = this.center.subtract(new Vec3(r, r, r));
    const max = this.center.add   (new Vec3(r, r, r));
    return new AABB(min, max); // renvoyer AABB
  }
}

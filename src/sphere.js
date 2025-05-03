import Hittable from './hittable.js';

// sphère + matériau
export default class Sphere extends Hittable {
  constructor(center, radius, material) {
    super();
    this.center   = center;    // centre sphère
    this.radius   = radius;    // rayon sphère
    this.material = material;  // pointeur matériau
  }

  hit(ray, tMin, tMax, rec) {
    // vecteur origine→centre
    const oc = ray.origin().subtract(this.center);
    // coefficients quadratique
    const a    = ray.direction().dot(ray.direction());
    const b    = oc.dot(ray.direction());
    const c    = oc.dot(oc) - this.radius * this.radius;
    const disc = b*b - a*c;   // discriminant

    if (disc > 0) {
      let temp = (-b - Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t        = temp;
        rec.p        = ray.pointAtParameter(temp);
        rec.normal   = rec.p
                         .subtract(this.center)
                         .divideScalar(this.radius);
        rec.material = this.material;  // stocker matériau
        return true;
      }
      temp = (-b + Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t        = temp;
        rec.p        = ray.pointAtParameter(temp);
        rec.normal   = rec.p
                         .subtract(this.center)
                         .divideScalar(this.radius);
        rec.material = this.material;  // stocker matériau
        return true;
      }
    }
    return false;  // pas d’intersection
  }
}









/*
import Hittable from './hittable.js';
import Vec3     from './vec3.js';

export default class Sphere extends Hittable {
  constructor(center, radius) {
    super();
    this.center = center;  // centre sphère
    this.radius = radius;  // rayon sphère
  }

  hit(ray, tMin, tMax, rec) {
    // vecteur origine→centre
    const oc = ray.origin().subtract(this.center);
    // coeffs quadratique
    const a = ray.direction().dot(ray.direction());
    const b = oc.dot(ray.direction());
    const c = oc.dot(oc) - this.radius * this.radius;
    const disc = b*b - a*c;  // discriminant

    if (disc > 0) {
      // solution proche
      let temp = (-b - Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t      = temp;
        rec.p      = ray.pointAtParameter(temp);
        rec.normal = rec.p.subtract(this.center)
                          .divideScalar(this.radius);
        return true;
      }
      // solution éloignée
      temp = (-b + Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t      = temp;
        rec.p      = ray.pointAtParameter(temp);
        rec.normal = rec.p.subtract(this.center)
                          .divideScalar(this.radius);
        return true;
      }
    }
    return false;  // pas d’intersection
  }
}
*/
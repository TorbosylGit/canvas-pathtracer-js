import Hittable from './hittable.js';

// sphère stationnaire
export default class Sphere extends Hittable {
  constructor(center, radius, material) {
    super();
    this.center   = center;    // centre sphère
    this.radius   = radius;    // rayon sphère
    this.material = material;  // matériau associé
  }

  hit(ray, tMin, tMax, rec) {
    // vecteur origine→centre
    const oc  = ray.origin().subtract(this.center);
    // coefficients quadratique
    const a   = ray.direction().dot(ray.direction());
    const b   = oc.dot(ray.direction());
    const c   = oc.dot(oc) - this.radius * this.radius;
    const disc = b*b - a*c;    // discriminant

    if (disc > 0) {
      // première solution (plus proche)
      let temp = (-b - Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t        = temp;                   // paramètre t du hit
        rec.p        = ray.pointAt(temp);      // point intersection
        rec.normal   = rec.p
                         .subtract(this.center)
                         .divideScalar(this.radius); // normale unité
        rec.material = this.material;          // propager matériau
        return true;
      }
      // seconde solution (plus éloignée)
      temp = (-b + Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t        = temp;                   
        rec.p        = ray.pointAt(temp);     
        rec.normal   = rec.p
                         .subtract(this.center)
                         .divideScalar(this.radius);
        rec.material = this.material;
        return true;
      }
    }
    return false;  // pas d’intersection
  }
}

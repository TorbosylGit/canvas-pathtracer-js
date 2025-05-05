import Vec3     from './vec3.js';
import Hittable from './hittable.js';

// sphère mouvante t0 vers t1
export default class MovingSphere extends Hittable {
  constructor(c0, c1, t0, t1, r, mat) {
    super();
    this.center0  = c0;  // centre à t0
    this.center1  = c1;  // centre à t1
    this.time0    = t0;  // start temps mouvement
    this.time1    = t1;  // end temps mouvement
    this.radius   = r;   // rayon sphère
    this.material = mat; // matériau sphère
  }

  // calc centre selon temps
  center(time) {
    const dt = (time - this.time0) /
               (this.time1 - this.time0);
    // interpolation linéaire centre
    return this.center0
      .add(this.center1
           .subtract(this.center0)
           .multiplyScalar(dt));
  }

  hit(ray, tMin, tMax, rec) {
    // centre mouvant selon temps rayon
    const ctr  = this.center(ray.time());
    // vecteur origine vers centre mouvant
    const oc   = ray.origin().subtract(ctr);

    const a    = ray.direction().dot(ray.direction());
    const b    = oc.dot(ray.direction());
    const c    = oc.dot(oc) - this.radius * this.radius;
    // calcul du discriminant quadratique
    const disc = b*b - a*c;

    if (disc > 0) {
      let temp = (-b - Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t        = temp;                     // stock paramètre t hit
        rec.p        = ray.pointAt(rec.t);       // point intersection
        rec.normal   = rec.p
                         .subtract(ctr)
                         .divideScalar(this.radius); // normale unité
        rec.material = this.material;            // attribuer matériau
        return true;
      }
      temp = (-b + Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t        = temp;                     // stock paramètre t hit
        rec.p        = ray.pointAt(rec.t);       // point intersection
        rec.normal   = rec.p
                         .subtract(ctr)
                         .divideScalar(this.radius); // normale unité
        rec.material = this.material;            // attribuer matériau
        return true;
      }
    }
    return false; // aucune intersection sphère
  }
}

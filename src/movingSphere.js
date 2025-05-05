import Hittable from './hittable.js';
import AABB      from './aabb.js';
import Vec3      from './vec3.js';

// sphère en translation linéaire
export default class MovingSphere extends Hittable {
  constructor(c0, c1, t0, t1, radius, material) {
    super();
    this.center0  = c0;        // centre initial
    this.center1  = c1;        // centre final
    this.time0    = t0;        // début intervalle
    this.time1    = t1;        // fin intervalle
    this.radius   = radius;    // rayon sphère
    this.material = material;  // matériau sphère
  }

  // calcul centre selon temps
  center(time) {
    const dt = (time - this.time0) /
               (this.time1 - this.time0);
    // interpolation linéaire centres
    return this.center0.add(
      this.center1.subtract(this.center0)
                  .multiplyScalar(dt)
    );
  }

  // intersection rayon–sphère mouvante
  hit(ray, tMin, tMax, rec) {
    const ctr = this.center(ray.time());    // centre au temps du rayon
    const oc  = ray.origin().subtract(ctr); // vecteur origine→centre

    const a    = ray.direction().dot(ray.direction());
    const b    = oc.dot(ray.direction());
    const c    = oc.dot(oc) - this.radius * this.radius;
    const disc = b * b - a * c;             // discriminant

    if (disc > 0) {
      // tester première racine
      let temp = (-b - Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t        = temp;
        rec.p        = ray.pointAt(temp);
        rec.normal   = rec.p.subtract(ctr)
                             .divideScalar(this.radius);
        rec.material = this.material;
        return true;
      }
      // tester seconde racine
      temp = (-b + Math.sqrt(disc)) / a;
      if (temp < tMax && temp > tMin) {
        rec.t        = temp;
        rec.p        = ray.pointAt(temp);
        rec.normal   = rec.p.subtract(ctr)
                             .divideScalar(this.radius);
        rec.material = this.material;
        return true;
      }
    }
    return false; // pas d’impact
  }

  // boîte englobante pour intervalle temps
  boundingBox(t0, t1) {
    const r = this.radius;
    // AABB à t0
    const box0 = new AABB(
      this.center(t0).subtract(new Vec3(r,r,r)),
      this.center(t0).add   (new Vec3(r,r,r))
    );
    // AABB à t1
    const box1 = new AABB(
      this.center(t1).subtract(new Vec3(r,r,r)),
      this.center(t1).add   (new Vec3(r,r,r))
    );
    // envelopper les deux
    return surroundingBox(box0, box1);
  }
}

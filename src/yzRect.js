import Hittable from './hittable.js';
import AABB     from './aabb.js';
import Vec3     from './vec3.js';

// rectangle aligné sur YZ
export default class YZRect extends Hittable {
  constructor(y0, y1, z0, z1, k, mat) {
    super();
    this.y0 = y0; this.y1 = y1;   // bornes Y
    this.z0 = z0; this.z1 = z1;   // bornes Z
    this.k  = k;                  // plan X=k
    this.mat = mat;               // matériau
  }

  hit(ray, tMin, tMax, rec) {
    // résoudre t pour x=k
    const t = (this.k - ray.origin().x())
            / ray.direction().x();
    if (t < tMin || t > tMax) return false;

    // calcul y,z à t
    const y = ray.origin().y()
            + t * ray.direction().y();
    const z = ray.origin().z()
            + t * ray.direction().z();
    if (y < this.y0 || y > this.y1 ||
        z < this.z0 || z > this.z1)
      return false;

    rec.u       = (y - this.y0) / (this.y1 - this.y0);
    rec.v       = (z - this.z0) / (this.z1 - this.z0);
    rec.t       = t;
    rec.material = this.mat;
    rec.p       = ray.pointAt(t);
    // normale vers +X
    rec.normal  = new Vec3(1, 0, 0);
    return true;
  }

  boundingBox(t0, t1) {
    const eps = 0.0001;
    const min = new Vec3(this.k - eps, this.y0, this.z0);
    const max = new Vec3(this.k + eps, this.y1, this.z1);
    return new AABB(min, max);
  }
}

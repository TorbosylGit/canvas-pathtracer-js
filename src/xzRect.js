import Hittable from './hittable.js';
import AABB     from './aabb.js';
import Vec3     from './vec3.js';

// rectangle aligné sur XZ
export default class XZRect extends Hittable {
  constructor(x0, x1, z0, z1, k, mat) {
    super();
    this.x0 = x0; this.x1 = x1;   // bornes X
    this.z0 = z0; this.z1 = z1;   // bornes Z
    this.k  = k;                  // plan Y=k
    this.mat = mat;               // matériau
  }

  hit(ray, tMin, tMax, rec) {
    // résoudre t pour y=k
    const t = (this.k - ray.origin().y())
            / ray.direction().y();
    if (t < tMin || t > tMax) return false;

    // calcul x,z à t
    const x = ray.origin().x()
            + t * ray.direction().x();
    const z = ray.origin().z()
            + t * ray.direction().z();
    if (x < this.x0 || x > this.x1 ||
        z < this.z0 || z > this.z1)
      return false;

    rec.u       = (x - this.x0) / (this.x1 - this.x0);
    rec.v       = (z - this.z0) / (this.z1 - this.z0);
    rec.t       = t;
    rec.material = this.mat;
    rec.p       = ray.pointAt(t);
    // normale vers +Y
    rec.normal  = new Vec3(0, 1, 0);
    return true;
  }

  boundingBox(t0, t1) {
    const eps = 0.0001;
    const min = new Vec3(this.x0, this.k - eps, this.z0);
    const max = new Vec3(this.x1, this.k + eps, this.z1);
    return new AABB(min, max);
  }
}

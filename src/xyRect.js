import Hittable from './hittable.js';
import AABB     from './aabb.js';
import Vec3     from './vec3.js';

// rectangle aligné sur XY
export default class XYRect extends Hittable {
  constructor(x0, x1, y0, y1, k, mat) {
    super();
    this.x0 = x0; this.x1 = x1;   // bornes X
    this.y0 = y0; this.y1 = y1;   // bornes Y
    this.k  = k;                  // plan Z=k
    this.mat = mat;               // matériau
  }

  hit(ray, tMin, tMax, rec) {
    // résoudre t pour z=k
    const t = (this.k - ray.origin().z())
            / ray.direction().z();
    // hors intervalle t
    if (t < tMin || t > tMax) return false;

    // calcul x,y à t
    const x = ray.origin().x() + t * ray.direction().x();
    const y = ray.origin().y() + t * ray.direction().y();
    // vérifier limites du rectangle
    // hors rectangle
    if (x < this.x0 || x > this.x1 || y < this.y0 || y > this.y1)
      return false;

    // remplir record
    // u,v ∈ [0,1] pour mapping UV textures
    rec.u       = (x - this.x0) / (this.x1 - this.x0);
    rec.v       = (y - this.y0) / (this.y1 - this.y0);
    rec.t       = t;
    rec.material = this.mat;
    rec.p       = ray.pointAt(t);
    // normale fixe vers +Z
    rec.normal  = new Vec3(0, 0, 1);
    return true;
  }

  boundingBox(t0, t1) {
    // petite épaisseur en z
    const eps = 0.0001;
    const min = new Vec3(this.x0, this.y0, this.k - eps);
    const max = new Vec3(this.x1, this.y1, this.k + eps);
    // on ajoute eps pour éviter box nulle
    return new AABB(min, max);
  }
}

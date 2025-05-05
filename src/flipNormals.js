import Hittable from './hittable.js';

// wrapper qui inverse normales
export default class FlipNormals extends Hittable {
  constructor(ptr) {
    super();
    this.ptr = ptr;  // hitable à inverser
  }

  hit(ray, tMin, tMax, rec) {
    // si intersection réussie
    if (this.ptr.hit(ray, tMin, tMax, rec)) {
        // inverser normale pour faces intérieures
      rec.normal = rec.normal.multiplyScalar(-1);
      return true;
    }
    return false;
  }

  boundingBox(t0, t1) {
    // box inchangée
    return this.ptr.boundingBox(t0, t1);
  }
}

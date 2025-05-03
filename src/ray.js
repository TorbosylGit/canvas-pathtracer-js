// classe rayon 3D
import Vec3 from './vec3.js';

// rayon p(t) = A + t*B
export default class Ray {
  constructor(A = new Vec3(), B = new Vec3()) {
    this.A = A;       // origine du rayon
    this.B = B;       // direction du rayon
  }

  // origine du rayon
  origin() {
    return this.A;
  }

  // direction du rayon
  direction() {
    return this.B;
  }

  // point sur le rayon en t
  pointAtParameter(t) {
    return this.A.add(this.B.multiplyScalar(t));
  }
}

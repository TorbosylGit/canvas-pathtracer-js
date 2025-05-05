import Vec3 from './vec3.js';

// classe ray 3d avec temps
export default class Ray {
  constructor(A = new Vec3(), B = new Vec3(), t = 0.0) {
    // initialise origine direction et temps
    this.A     = A;      // origine du rayon 3d
    this.B     = B;      // direction du rayon 3d
    this._time = t;      // instant du rayon courant
  }

  origin()    { return this.A; }            // récupérer origine du rayon
  direction() { return this.B; }            // récupérer direction du rayon
  time()      { return this._time; }        // récupérer instant du rayon
  pointAt(t)  {                             // point p = A + tB
    return this.A.add(this.B.multiplyScalar(t));
  }
}

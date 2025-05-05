import Vec3 from './vec3.js';

// base class for materials
export default class Material {
  // scatter returns true if scattering occurs
  scatter(rayIn, rec) {
    throw new Error('scatter() not implemented');
  }
  // default emission → black
  emitted(u, v, p) {
    return new Vec3(0, 0, 0);
  }
}

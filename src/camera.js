import Vec3 from './vec3.js';
import Ray  from './ray.js';

// caméra simple pour tracer
export default class Camera {
  constructor() {
    // origine caméra
    this.origin = new Vec3(0, 0, 0);
    // coin inférieur gauche
    this.lowerLeft = new Vec3(-2.0, -1.0, -1.0);
    // largeur écran
    this.horizontal = new Vec3(4.0, 0.0, 0.0);
    // hauteur écran
    this.vertical = new Vec3(0.0, 2.0, 0.0);
  }

  // renvoyer rayon pour u,v
  getRay(u, v) {
    // direction pixel
    const dir = this.lowerLeft
      .add(this.horizontal.multiplyScalar(u))
      .add(this.vertical.multiplyScalar(v))
      .subtract(this.origin);
    return new Ray(this.origin, dir);
  }
}

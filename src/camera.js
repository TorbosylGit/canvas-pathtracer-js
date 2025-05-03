import Vec3 from './vec3.js';
import Ray  from './ray.js';

// caméra positionnable avec fov
export default class Camera {
  constructor(lookfrom, lookat, vup, vfov, aspect) {
    // convertir degrés→radians
    const theta = vfov * Math.PI / 180;
    // demi-hauteur écran
    const halfHeight = Math.tan(theta / 2);
    // demi-largeur écran
    const halfWidth = aspect * halfHeight;

    this.origin = lookfrom;            // position caméra

    // vecteurs axes caméra
    const w = lookfrom.subtract(lookat).normalize();          // vers arrière
    const u = vup.cross(w).normalize();                       // vers droite
    const v = w.cross(u);                                     // vers haut

    // coin bas-gauche écran
    this.lowerLeft = this.origin
      .subtract(u.multiplyScalar(halfWidth))
      .subtract(v.multiplyScalar(halfHeight))
      .subtract(w);

    this.horizontal = u.multiplyScalar(2 * halfWidth);       // largeur écran
    this.vertical   = v.multiplyScalar(2 * halfHeight);      // hauteur écran
  }

  // renvoyer rayon pour s,t
  getRay(s, t) {
    // point sur plan image
    const dir = this.lowerLeft
      .add(this.horizontal.multiplyScalar(s))
      .add(this.vertical.multiplyScalar(t))
      .subtract(this.origin);
    return new Ray(this.origin, dir);
  }
}









/*
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
*/
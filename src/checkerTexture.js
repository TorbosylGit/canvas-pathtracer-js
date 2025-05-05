import Texture from './texture.js';
import Vec3    from './vec3.js';

// texture damier 3D procédurale
export default class CheckerTexture extends Texture {
  constructor(even, odd) {
    super();
    this.even = even;  // texture cases claires
    this.odd  = odd;   // texture cases sombres
  }

  // u,v ignorés ici
  // p (x,y,z) pour motifs
  value(u, v, p) {
    // sin(px)*sin(py)*sin(pz)
    const sines = Math.sin(10 * p.x())
                 * Math.sin(10 * p.y())
                 * Math.sin(10 * p.z());
    // choisir texture paire/impaire
    if (sines < 0) return this.odd.value(u, v, p);
    else           return this.even.value(u, v, p);
  }
}

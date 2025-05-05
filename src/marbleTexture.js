import Texture from './texture.js';
import Perlin  from './perlin.js';
import Vec3    from './vec3.js';

// texture effet marbre
export default class MarbleTexture extends Texture {
  constructor(scale = 1) {
    super();
    this.noise = new Perlin();   // générateur Perlin
    this.scale = scale;          // échelle spatiale
  }

  value(u, v, p) {
    // position échelonnée
    const pp = p.multiplyScalar(this.scale);
    // turbulence déformée
    const t  = this.noise.turbulence(pp);
    // sinusoïde déformée
    const s  = 0.5 * (1 + Math.sin(pp.z() + 10 * t));
    // renvoyer nuance gris
    return new Vec3(s, s, s);
  }
}

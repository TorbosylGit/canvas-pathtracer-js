import Texture from './texture.js';
import Perlin  from './perlin.js';
import Vec3    from './vec3.js';

// texture générée par Perlin
export default class NoiseTexture extends Texture {
  constructor(scale = 1) {
    super();
    this.noise = new Perlin();  // générateur Perlin
    this.scale = scale;         // fréquence spatiale
  }

  // u,v non utilisés
  // p : position 3D
  value(u, v, p) {
    // appliquer échelle
    const pp = p.multiplyScalar(this.scale);
    // renvoyer nuance gris
    const n = this.noise.noise(pp);
    return new Vec3(n, n, n);
  }
}

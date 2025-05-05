import Texture from './texture.js';
import Vec3    from './vec3.js';

// texture qui renvoie
// toujours une couleur fixe
export default class ConstantTexture extends Texture {
  constructor(color = new Vec3()) {
    super();
    this.color = color;      // couleur RGB constante
  }

  // ignorer u,v,p
  // renvoyer this.color
  value(u, v, p) {
    return this.color;
  }
}

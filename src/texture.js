// interface texture de base
export default class Texture {
    // u,v : coordonnées de texture
    // p    : point 3D intersecté
    value(u, v, p) {
      throw new Error('Texture.value() non implémentée');
    }
  }
  
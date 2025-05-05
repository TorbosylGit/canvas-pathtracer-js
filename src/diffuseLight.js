import Material from './material.js';
import Vec3     from './vec3.js';

// matériau source lumineuse diffus
export default class DiffuseLight extends Material {
  constructor(emitTex) {
    super();
    this.emit = emitTex;    // texture émission
  }

    // jamais de rebond pour lumière
  scatter(rayIn, rec) {
    // aucun scatter
    return false;
  }

    // émission non nulle
  // u,v pour coords (si nécessaire)
  // p point d’impact (pour textures procédurales)
  emitted(u, v, p) {
    // renvoyer couleur émission
    return this.emit.value(u, v, p);
  }
}
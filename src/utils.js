import Vec3 from './vec3.js';

// fonctions utilitaires aléatoires
export function randomDouble() {
  return Math.random();
}

// renvoie point dans sphère
export function randomInUnitSphere() {
  let p;
  do {
    p = new Vec3(
      2 * randomDouble() - 1,
      2 * randomDouble() - 1,
      2 * randomDouble() - 1
    );
  } while (p.squaredLength() >= 1.0);
  return p;
}

// calcule réflexion miroir
export function reflect(v, n) {
  return v.subtract(n.multiplyScalar(2 * v.dot(n)));
}

import Vec3 from './vec3.js';

// nombre aléatoire 0 à 1
export function randomDouble() {
  return Math.random();
}

// point aléatoire dans sphère
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

// point aléatoire dans disque
export function randomInUnitDisk() {
  let p;
  do {
    p = new Vec3(
      2 * randomDouble() - 1,
      2 * randomDouble() - 1,
      0
    );
  } while (p.dot(p) >= 1.0);
  return p;
}

// calcul vecteur réflexion miroir
export function reflect(v, n) {
  return v.subtract(n.multiplyScalar(2 * v.dot(n)));
}

// calcul vecteur réfracté si possible
export function refract(v, n, niOverNt) {
  const uv = v.normalize();
  const dt = uv.dot(n);
  const discriminant = 1.0 - niOverNt * niOverNt * (1 - dt * dt);
  if (discriminant > 0) {
    return uv
      .subtract(n.multiplyScalar(dt))
      .multiplyScalar(niOverNt)
      .subtract(n.multiplyScalar(Math.sqrt(discriminant)));
  }
  return null;
}

// probabilité réflexion selon schlick
export function schlick(cosine, refIdx) {
  let r0 = (1 - refIdx) / (1 + refIdx);
  r0 = r0 * r0;
  return r0 + (1 - r0) * Math.pow(1 - cosine, 5);
}









/*
import Vec3 from './vec3.js';

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

// refraction si possible
export function refract(v, n, niOverNt) {
  const uv = v.normalize();
  const dt = uv.dot(n);
  const discriminant = 1.0 - niOverNt * niOverNt * (1 - dt * dt);
  if (discriminant > 0) {
    // calcul vecteur réfracté
    return uv
      .subtract(n.multiplyScalar(dt))
      .multiplyScalar(niOverNt)
      .subtract(
        n.multiplyScalar(Math.sqrt(discriminant))
      );
  }
  // pas de réfraction totale
  return null;
}

// probabilité réflexion schlick
export function schlick(cosine, refIdx) {
  let r0 = (1 - refIdx) / (1 + refIdx);
  r0 = r0 * r0;
  return r0 + (1 - r0) * Math.pow(1 - cosine, 5);
}

// fonctions utilitaires aléatoires
// aléa [0,1)
export function randomDouble() {
  return Math.random();
}
*/
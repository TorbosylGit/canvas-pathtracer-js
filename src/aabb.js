import Vec3 from './vec3.js';

// boîte englobante axe-aligné
export default class AABB {
  constructor(min, max) {
    this._min = min;   // coin minimal box
    this._max = max;   // coin maximal box
  }
  min() { return this._min; }  // récupérer coin min
  max() { return this._max; }  // récupérer coin max

  hit(ray, tMin, tMax) {
    // tester intersection axes x,y,z
    for (let a = 0; a < 3; a++) {
      // inverse direction du rayon
      const invD = 1.0 / ray.direction().e[a];
      // t pour atteindre min[a]
      let t0 = (this._min.e[a] - ray.origin().e[a]) * invD;
      // t pour atteindre max[a]
      let t1 = (this._max.e[a] - ray.origin().e[a]) * invD;
      // si dir négative, échanger
      if (invD < 0.0) [t0, t1] = [t1, t0];
      // mettre à jour intervalle global
      tMin = t0 > tMin ? t0 : tMin;
      tMax = t1 < tMax ? t1 : tMax;
      // si intervalle vide
      if (tMax <= tMin) return false;
    }
    return true; // intersection détectée
  }
}

// envelopper deux boîtes
export function surroundingBox(box0, box1) {
  // coordonnées min globales
  const small = new Vec3(
    Math.min(box0.min().x(), box1.min().x()),
    Math.min(box0.min().y(), box1.min().y()),
    Math.min(box0.min().z(), box1.min().z())
  );
  // coordonnées max globales
  const big   = new Vec3(
    Math.max(box0.max().x(), box1.max().x()),
    Math.max(box0.max().y(), box1.max().y()),
    Math.max(box0.max().z(), box1.max().z())
  );
  return new AABB(small, big); // boîte englobante
}

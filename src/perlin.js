import Vec3 from './vec3.js';
import { randomDouble } from './utils.js';

// générateur bruit de Perlin
export default class Perlin {
  constructor() {
    this.pointCount = 256;            // taille tables bruit
    // vecteurs unitaires aléatoires
    this.ranVec = Array(this.pointCount);
    for (let i = 0; i < this.pointCount; i++) {
      // créer vecteur aléatoire
      const v = new Vec3(
        2 * randomDouble() - 1,
        2 * randomDouble() - 1,
        2 * randomDouble() - 1
      );
      // normaliser vecteur
      this.ranVec[i] = v.normalize();
    }
    // tables de permutation
    this.permX = this.generatePerm();
    this.permY = this.generatePerm();
    this.permZ = this.generatePerm();
  }

  // créer array [0..255] mélangé
  generatePerm() {
    const p = Array.from({ length: this.pointCount }, (_, i) => i);
    for (let i = this.pointCount - 1; i > 0; i--) {
      // choisir index aléatoire
      const target = Math.floor(randomDouble() * (i + 1));
      // échanger p[i] ↔ p[target]
      [p[i], p[target]] = [p[target], p[i]];
    }
    return p;
  }

  // fonction de lissage Hermite
  fade(t) {
    // t^3 (t(6t-15)+10)
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  // interpolation valeur a→b
  lerp(t, a, b) {
    return a * (1 - t) + b * t;
  }

  // bruit Perlin en p
  noise(p) {
    // partie fractionnaire
    const u = p.x() - Math.floor(p.x());
    const v = p.y() - Math.floor(p.y());
    const w = p.z() - Math.floor(p.z());
    // indice cube
    const i = Math.floor(p.x());
    const j = Math.floor(p.y());
    const k = Math.floor(p.z());

    // récupérer gradients coins
    const c = [[], []];
    for (let di = 0; di < 2; di++) {
      c[di] = [[], []];
      for (let dj = 0; dj < 2; dj++) {
        c[di][dj] = [];
        for (let dk = 0; dk < 2; dk++) {
          // index haché
          const idx = this.permX[(i + di) & 255] ^
                      this.permY[(j + dj) & 255] ^
                      this.permZ[(k + dk) & 255];
          // gradient unitaire
          c[di][dj][dk] = this.ranVec[idx];
        }
      }
    }

    // interpolation tri-linéaire
    return this.perlinInterp(c, u, v, w);
  }

  // interpolation gradients par dot
  perlinInterp(c, u, v, w) {
    // appliquer fade (Hermite)
    const uu = this.fade(u);
    const vv = this.fade(v);
    const ww = this.fade(w);
    let accum = 0;

    // sommation contributions coins
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          // vecteur distance coin→p
          const weightV = new Vec3(u - i, v - j, w - k);
          // produit scalaire gradient·distance
          const dot = c[i][j][k].dot(weightV);
          // pondération trilinear
          const fi = i * uu + (1 - i) * (1 - uu);
          const fj = j * vv + (1 - j) * (1 - vv);
          const fk = k * ww + (1 - k) * (1 - ww);
          accum += fi * fj * fk * dot;
        }
      }
    }
    return accum;
  }

  // turbulence: sommation multi-fréquences
  turbulence(p, depth = 7) {
    let accum = 0;
    let tempP = p;
    let weight = 1;
    for (let i = 0; i < depth; i++) {
      accum += weight * this.noise(tempP);
      weight *= 0.5;
      // augmenter fréquence
      tempP = tempP.multiplyScalar(2);
    }
    return Math.abs(accum);
  }
}

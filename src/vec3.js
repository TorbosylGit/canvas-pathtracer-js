// classe vecteur 3 composants
class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
      this.e = [x, y, z];
    }
  
    // accès composante x
    x() { return this.e[0]; }
    // accès composante y
    y() { return this.e[1]; }
    // accès composante z
    z() { return this.e[2]; }
    // alias composante r
    r() { return this.e[0]; }
    // alias composante g
    g() { return this.e[1]; }
    // alias composante b
    b() { return this.e[2]; }
  
    // addition vecteurs
    add(v) {
      return new Vec3(this.e[0] + v.e[0], this.e[1] + v.e[1], this.e[2] + v.e[2]);
    }
  
    // soustraction vecteurs
    subtract(v) {
      return new Vec3(this.e[0] - v.e[0], this.e[1] - v.e[1], this.e[2] - v.e[2]);
    }
  
    // multiplication composante à composante
    multiply(v) {
      return new Vec3(this.e[0] * v.e[0], this.e[1] * v.e[1], this.e[2] * v.e[2]);
    }
  
    // division composante à composante
    divide(v) {
      return new Vec3(this.e[0] / v.e[0], this.e[1] / v.e[1], this.e[2] / v.e[2]);
    }
  
    // multiplication par scalaire
    multiplyScalar(t) {
      return new Vec3(this.e[0] * t, this.e[1] * t, this.e[2] * t);
    }
  
    // division par scalaire
    divideScalar(t) {
      return this.multiplyScalar(1 / t);
    }
  
    // produit scalaire
    dot(v) {
      return this.e[0] * v.e[0] + this.e[1] * v.e[1] + this.e[2] * v.e[2];
    }
  
    // produit vectoriel
    cross(v) {
      return new Vec3(
        this.e[1] * v.e[2] - this.e[2] * v.e[1],
        this.e[2] * v.e[0] - this.e[0] * v.e[2],
        this.e[0] * v.e[1] - this.e[1] * v.e[0]
      );
    }
  
    // norme
    length() {
      return Math.sqrt(this.squaredLength());
    }
  
    // norme au carré
    squaredLength() {
      return this.e[0] * this.e[0] + this.e[1] * this.e[1] + this.e[2] * this.e[2];
    }
  
    // vecteur unitaire
    normalize() {
      const len = this.length();
      return this.divideScalar(len);
    }
  
    // affichage texte
    toString() {
      return `${this.e[0]} ${this.e[1]} ${this.e[2]}`;
    }
  }
  
  // exporter classe Vec3
  export default Vec3;
  
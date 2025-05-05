// interface pour surfaces hitables
export default class Hittable {
  // vérifier intersection rayon
  hit(ray, tMin, tMax, rec) {
    throw new Error('hit() not implemented');
  }
  // récupérer boîte englobante
  boundingBox(t0, t1) {
    throw new Error('boundingBox() not implemented');
  }
}









/*
// interface objets hitables
export default class Hittable {
    // à surcharger en sous-classe
    hit(ray, tMin, tMax, rec) {
      return false;
    }
  }
  */
// interface objets hitables
export default class Hittable {
    // à surcharger en sous-classe
    hit(ray, tMin, tMax, rec) {
      return false;
    }
  }
  
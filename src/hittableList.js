import Hittable from './hittable.js';

export default class HittableList extends Hittable {
  constructor(list = []) {
    super();
    this.list = list;  // tableau d’objets
  }

  hit(ray, tMin, tMax, rec) {
    let tempRec, hitAnything = false;
    let closestSoFar = tMax;

    for (const obj of this.list) {
      tempRec = {};
      // tester chaque objet
      if (obj.hit(ray, tMin, closestSoFar, tempRec)) {
        hitAnything  = true;
        closestSoFar = tempRec.t;
        // copier données du hit
        rec.t      = tempRec.t;
        rec.p      = tempRec.p;
        rec.normal = tempRec.normal;
      }
    }
    return hitAnything;
  }
}

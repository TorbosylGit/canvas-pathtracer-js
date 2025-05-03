import Hittable from './hittable.js';

export default class HittableList extends Hittable {
  constructor(list = []) {
    super();
    this.list = list;  // tableau d’objets hittables
  }

  hit(ray, tMin, tMax, rec) {
    let tempRec; // initialiser le rec temporaire
    let hitAnything = false; // aucun hit pour l'instant
    let closestSoFar = tMax; // distance la plus proche

    for (const obj of this.list) {
      tempRec = {};
      // tester chaque objet du monde
      if (obj.hit(ray, tMin, closestSoFar, tempRec)) {
        hitAnything   = true; // intersection trouvée pour objet
        closestSoFar  = tempRec.t;
        // recopier tous les champs du hit
        rec.t         = tempRec.t;
        rec.p         = tempRec.p;
        rec.normal    = tempRec.normal;
        rec.material  = tempRec.material; // propager material dans rec
      }
    }
    return hitAnything;
  }
}
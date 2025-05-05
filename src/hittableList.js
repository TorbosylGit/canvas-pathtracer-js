import Hittable       from './hittable.js';
import { surroundingBox } from './aabb.js';

// conteneur d’objets hittables
export default class HittableList extends Hittable {
  constructor(objects = []) {
    super();
    this.objects = objects; // tableau objets
  }

  // intersection rayon–liste
  hit(ray, tMin, tMax, rec) {
    let tempRec;                       // record provisoire
    let hitAny = false;               // flag hit
    let closest = tMax;               // t du hit le plus proche

    for (const obj of this.objects) { // parcourir tous objets
      tempRec = {};
      // tester intersection objet
      if (obj.hit(ray, tMin, closest, tempRec)) {
        hitAny  = true;                // mémoriser hit
        closest = tempRec.t;           // mettre à jour closeness
        Object.assign(rec, tempRec);   // copier données rec
      }
    }
    return hitAny;                     // true si au moins un hit
  }

  // calcul boîte englobante globale
  boundingBox(t0, t1) {
    if (this.objects.length === 0) return null;
    // démarrer avec première box
    let box = this.objects[0].boundingBox(t0, t1);
    for (let i = 1; i < this.objects.length; i++) {
      // envelopper avec box suivante
      const b = this.objects[i].boundingBox(t0, t1);
      box = surroundingBox(box, b);
    }
    return box;                       // renvoyer box englobante
  }
}

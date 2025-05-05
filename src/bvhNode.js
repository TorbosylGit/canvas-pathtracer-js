import Hittable       from './hittable.js';
import AABB, { surroundingBox } from './aabb.js';
import { randomDouble } from './utils.js';

// nœud BVH binaire
export default class BVHNode extends Hittable {
  constructor(objects, t0, t1) {
    super();
    // axe de tri aléatoire (0=x,1=y,2=z)
    const axis = Math.floor(3 * randomDouble());
    // trier primitives selon axe choisi
    objects.sort((a, b) => {
      const boxA = a.boundingBox(t0, t1);
      const boxB = b.boundingBox(t0, t1);
      return boxA.min().e[axis] - boxB.min().e[axis];
    });

    // cas 1 primitive
    if (objects.length === 1) {
      this.left = this.right = objects[0];
    }
    // cas 2 primitives
    else if (objects.length === 2) {
      [this.left, this.right] = objects;
    }
    // cas > 2 primitives
    else {
      const mid = Math.floor(objects.length / 2);
      this.left  = new BVHNode(objects.slice(0, mid),  t0, t1);
      this.right = new BVHNode(objects.slice(mid),     t0, t1);
    }

    // calcul AABB du nœud
    const boxLeft  = this.left.boundingBox(t0, t1);
    const boxRight = this.right.boundingBox(t0, t1);
    this.box = surroundingBox(boxLeft, boxRight);
  }

  // intersection rayon–BVH
  hit(ray, tMin, tMax, rec) {
    // test rapide sur box englobante
    if (!this.box.hit(ray, tMin, tMax)) return false;

    // tester enfants
    const leftRec  = {}, rightRec = {};
    const hitLeft  = this.left.hit(ray,  tMin, tMax, leftRec);
    const hitRight = this.right.hit(ray, tMin, tMax, rightRec);

    // deux hits → choisir le plus proche
    if (hitLeft && hitRight) {
      if (leftRec.t < rightRec.t) Object.assign(rec, leftRec);
      else                        Object.assign(rec, rightRec);
      return true;
    }
    // un seul des deux
    if (hitLeft)  { Object.assign(rec, leftRec);  return true; }
    if (hitRight) { Object.assign(rec, rightRec); return true; }
    return false;  // aucun hit
  }

  // renvoyer boîte englobante stockée
  boundingBox(t0, t1) {
    return this.box;
  }
}

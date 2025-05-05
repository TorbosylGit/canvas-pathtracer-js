import Vec3               from './vec3.js';
import Ray                from './ray.js';
import { randomInUnitDisk,
         randomDouble }   from './utils.js';

// caméra DOF et flou mouvement
export default class Camera {
  constructor(lookfrom, lookat, vup,
              vfov, aspect,
              aperture, focusDist,
              time0, time1) {
    // début ouverture de l’obturateur
    this.time0      = time0;
    // fin fermeture de l’obturateur
    this.time1      = time1;
    // demi-diamètre diaphragme caméra
    this.lensRadius = aperture / 2;

    // calc champ de vision radian
    const theta = vfov * Math.PI / 180;
    // calc demi-hauteur plan image
    const halfH = Math.tan(theta / 2);
    // calc demi-largeur plan image
    const halfW = aspect * halfH;

    this.origin = lookfrom;            // position initiale de caméra

    // calcul base orthonormée caméra
    this.w = lookfrom.subtract(lookat).normalize();
    this.u = vup.cross(this.w).normalize();
    this.v = this.w.cross(this.u);

    // coin bas-gauche plan image
    this.lowerLeft = this.origin
      .subtract(this.u.multiplyScalar(halfW  * focusDist))
      .subtract(this.v.multiplyScalar(halfH  * focusDist))
      .subtract(this.w.multiplyScalar(focusDist));

    // vecteur largeur plan image
    this.horizontal = this.u.multiplyScalar(2 * halfW  * focusDist);
    // vecteur hauteur plan image
    this.vertical   = this.v.multiplyScalar(2 * halfH  * focusDist);
  }

  getRay(s, t) {
    // échantillon disque unité diaphragme
    const rd     = randomInUnitDisk().multiplyScalar(this.lensRadius);
    // offset origine selon diaphragme
    const offset = this.u.multiplyScalar(rd.x())
                     .add(this.v.multiplyScalar(rd.y()));

    // temps aléatoire ouverture obturateur
    const time = this.time0
               + randomDouble()
               * (this.time1 - this.time0);

    // direction vers pixel donné s,t
    const dir = this.lowerLeft
      .add(this.horizontal.multiplyScalar(s))
      .add(this.vertical.multiplyScalar(t))
      .subtract(this.origin)
      .subtract(offset);

    return new Ray(
      this.origin.add(offset), // origine ajustée selon offset
      dir,                     // direction ajustée ray
      time                     // instant de vie rayon
    );
  }
}

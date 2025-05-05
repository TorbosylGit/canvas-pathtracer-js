import Vec3            from '../vec3.js';
import Sphere          from '../sphere.js';
import Lambertian      from '../lambertian.js';
import ConstantTexture from '../constantTexture.js';
import DiffuseLight    from '../diffuseLight.js';
import XYRect          from '../xyRect.js';
import XZRect          from '../xzRect.js';
import YZRect          from '../yzRect.js';
import FlipNormals     from '../flipNormals.js';
import HittableList    from '../hittableList.js';

// scène Cornell Box
export default function cornellBox() {
  // matériaux couleurs
  const red   = new Lambertian(
    new ConstantTexture(new Vec3(0.65, 0.05, 0.05))
  );
  const green = new Lambertian(
    new ConstantTexture(new Vec3(0.12, 0.45, 0.15))
  );
  const white = new Lambertian(
    new ConstantTexture(new Vec3(0.73, 0.73, 0.73))
  );
  // lumière plafond
  const light = new DiffuseLight(
    new ConstantTexture(new Vec3(15, 15, 15))
  );

  const objects = [];
  // paroi gauche (inversée)
  objects.push(
    new FlipNormals(
      new YZRect(0, 555, 0, 555, 555, green)
    )
  );
  // paroi droite
  objects.push(
    new YZRect(0, 555, 0, 555, 0, red)
  );
  // plafond lumineux
  objects.push(
    new XZRect(213, 343, 227, 332, 554, light)
  );
  // sol
  objects.push(
    new FlipNormals(
      new XZRect(0, 555, 0, 555, 555, white)
    )
  );
  // plafond
  objects.push(
    new XZRect(0, 555, 0, 555, 0, white)
  );
  // paroi arrière
  objects.push(
    new FlipNormals(
      new XYRect(0, 555, 0, 555, 555, white)
    )
  );

  return new HittableList(objects);
}

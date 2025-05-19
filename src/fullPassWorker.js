import Vec3            from './vec3.js';
import Ray             from './ray.js';
import Camera          from './camera.js';
import BVHNode         from './bvhNode.js';
import { randomDouble } from './utils.js';
import cornellBox      from './scenes/cornellBox.js';

let nx, ny, maxDepth, cam;

// reconstruire la scène (BVH) dans le worker
const world = new BVHNode(cornellBox().objects, 0.0, 1.0);

// paramètres caméra constants
const lookfrom    = new Vec3(278,278,-800);
const lookat      = new Vec3(278,278,   0);
const vup         = new Vec3(0,1,0);
const distToFocus = 10.0;
const aperture    = 0.0;
const vfov        = 40.0;

// fonction récursive Monte-Carlo
function color(ray, depth) {
  const rec = {};
  if (world.hit(ray, 0.001, Infinity, rec)) {
    const emitted    = rec.material.emitted(rec.u, rec.v, rec.p);
    const scatterRes = rec.material.scatter(ray, rec);
    if (depth < maxDepth && scatterRes) {
      const { scattered, attenuation } = scatterRes;
      return emitted.add(attenuation.multiply(color(scattered, depth + 1)));
    }
    return emitted;
  }
  return new Vec3(0,0,0);
}

onmessage = e => {
  const msg = e.data;

  // 1) initialisation
  if (msg.type === 'init') {
    ({ nx, ny, maxDepth } = msg);
    cam = new Camera(
      lookfrom, lookat, vup,
      vfov, nx/ny,
      aperture, distToFocus,
      0.0, 1.0
    );
    // signal ready
    postMessage({ type: 'ready' });
    return;
  }

  // 2) calcul d’une passe complète (1 échantillon/pixel)
  if (msg.type === 'renderPass') {
    const sampleIndex = msg.sampleIndex;
    const buffer = new Float32Array(nx * ny * 3);
    let ptr = 0;

    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const u   = (i + randomDouble()) / nx;
        const v   = ((ny - 1 - j) + randomDouble()) / ny;
        const col = color(cam.getRay(u, v), 0);
        buffer[ptr++] = col.x();
        buffer[ptr++] = col.y();
        buffer[ptr++] = col.z();
      }
    }

    // renvoyer résultat avec transfert de buffer
    postMessage(
      { type: 'result', sampleIndex, buffer },
      [buffer.buffer]
    );
  }
};

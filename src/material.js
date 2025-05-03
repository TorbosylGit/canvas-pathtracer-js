// abstraction matériaux
export default class Material {
    // scatter à surcharger
    scatter(rayIn, rec) {
      throw new Error('scatter() not implemented');
    }
  }
  
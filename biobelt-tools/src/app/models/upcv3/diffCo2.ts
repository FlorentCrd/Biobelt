export class DiffCo2 {
    delay: number = 0;
      duration: number = 0;
    intensity: number = 0;
  
    static loadFromJSON(json): DiffCo2 {
      return Object.assign(new DiffCo2, json);
    }
  }
export class BottleType {
    id:           string  = '';
      designation:  number  = 0;
      brand:        string  = '';
    isRembo:      boolean = false;
  
    get designationString(): string {
      return this.designation + ' kg' + (this.isRembo ? ' (Rembo) - ' : ' - ') + this.brand;
    }
  
    static loadFromJSON(json): BottleType {
      return Object.assign(new BottleType, json)
    }
  }
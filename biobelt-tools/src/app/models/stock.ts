import { BottleType } from "./bottleType";

export class Stock {
  id: string = '';
  name: string = '';
  
  bottleTypes: BottleType[] = [];

  fullBottlesNumber: number = 0;
  emptyBottlesNumber: number = 0;

  get bottleTypesString(): string {
    var names = [];
    this.bottleTypes.forEach(bottleType => names.push(bottleType.designationString));
    return names.join(' | ');
  }

  static loadFromJSON(json): Stock {
    var stock = Object.assign(new Stock, json);

    if (json.bottleTypes) {
      stock.bottleTypes = [];
      json.bottleTypes.forEach(jsonBottleType => { stock.bottleTypes.push(BottleType.loadFromJSON(jsonBottleType)) });
    }

    return stock;
  }
}
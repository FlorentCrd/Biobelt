import { ElectricalBranch } from "./electricalBranch";

export class Transformer {
	id:           string = '';
	angle:        number = 0;
	electricCase: boolean = false;
	
  powerConsumed: number = 0;
  
  electricalBranches: ElectricalBranch[] = [];

  constructor(id: string = '', angle: number = 0, electricCase: boolean = false, powerConsumed: number = 0) {
    this.id = id;
    this.angle = angle;
    this.electricCase = electricCase;
    this.powerConsumed = powerConsumed;
  }

  static loadFromJSON(json): Transformer {
    var transformer = Object.assign(new Transformer, json);

    if (json.electricalBranches) {
      transformer.electricalBranches = [];
      json.electricalBranches.forEach(jsonElectricalBranch => { transformer.electricalBranches.push(ElectricalBranch.loadFromJSON(jsonElectricalBranch)) });
    }

    return transformer;
  }
}
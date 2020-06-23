import { Branch } from "./branch";
import { ProtectedArea } from "./protectedArea";
import { ElectricalOutlet } from "./electricalOutlet";

export class Belt {
  id:           string = '';
  name:         string = '';
  trapsNumber:  number = 0;

  pressureCalculated: number = 0;
	pressureInt1:       number = 0;
	pressureInt2:       number = 0;
	pressureInt3:       number = 0;
	pressureInt4:       number = 0;
	pressureInt5:       number = 0;
	pressureInt6:       number = 0;
	pressureInt7:       number = 0;
	pressureInt8:       number = 0;
	pressureInt9:       number = 0;
	flowTheoretical:    number = 0;
  flowCumulated:      number = 0;
  
  controlSheltered:   boolean = false;
	trapsColor:         TrapsColor = TrapsColor.WOOD;
	bottleType:         BottleType = BottleType.B10;
	bottleNumberB1:     number = 0;
	bottleNumberB2:     number = 0;
	co2KgPrice:         number = 0;
  co2MonthRentPrice:  number = 0;
  
  electricalOutlets:  ElectricalOutlet[]  = [];
  branches:           Branch[]            = [];
  protectedAreas:     ProtectedArea[]     = [];

  constructor(id: string = '', name: string = '') {
    this.id = id;
    this.name = name;
  }

  static loadFromJSON(json): Belt {
    var belt = Object.assign(new Belt, json);

    if (json.branches) {
      belt.branches = [];
      json.branches.forEach(jsonBranch => { belt.branches.push(Branch.loadFromJSON(jsonBranch)) });
    }

    if (json.electricalOutlets) {
      belt.electricalOutlets = [];
      json.electricalOutlets.forEach(jsonElectricalOutlet => { belt.electricalOutlets.push(ElectricalOutlet.loadFromJSON(jsonElectricalOutlet)) });
    }

    if (json.protectedAreas) {
      belt.protectedAreas = [];
      json.protectedAreas.forEach(jsonProtectedArea => { belt.protectedAreas.push(ProtectedArea.loadFromJSON(jsonProtectedArea)) });
    }

    return belt;
  }

  resetCalculationValues() {
		this.flowCumulated = 0;
    this.flowTheoretical = 0;
    this.pressureCalculated = 0;
    this.pressureInt1 = 0;
    this.pressureInt2 = 0;
    this.pressureInt3 = 0;
    this.pressureInt4 = 0;
    this.pressureInt5 = 0;
    this.pressureInt6 = 0;
    this.pressureInt7 = 0;
    this.pressureInt8 = 0;
    this.pressureInt9 = 0;
	}
}

export enum TrapsColor {
  WOOD = 'WOOD',
  GREEN = 'GREEN',
  BROWN = 'BROWN'
}

export enum BottleType {
  B10 = 'B10',
  B20 = 'B20',
  B34 = 'B34',
  B37 = 'B37',
  B50LB = 'B50LB',
  R100 = 'R100',
  R180 = 'R180'
}
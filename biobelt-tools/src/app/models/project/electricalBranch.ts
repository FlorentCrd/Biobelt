import { ElectricalNode } from "./electricalNode";

export class ElectricalBranch {
  id:                     string = '';
	parentElectricalBranch: string;
  parentElectricalNode:   string;

  electricalNodes: ElectricalNode[] = [];
  
  static loadFromJSON(json): ElectricalBranch {
    var electricalBranch = Object.assign(new ElectricalBranch, json);

    if (json.electricalNodes) {
      electricalBranch.electricalNodes = [];
      json.electricalNodes.forEach(jsonElectricalNode => { electricalBranch.electricalNodes.push(ElectricalNode.loadFromJSON(jsonElectricalNode)) })
    }

    return electricalBranch;
  }
}
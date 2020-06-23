export class ElectricalNode {
    id:     string = '';
    nodeId: string = '';
    
    static loadFromJSON(json): ElectricalNode {
          return Object.assign(new ElectricalNode, json);
    }
  }
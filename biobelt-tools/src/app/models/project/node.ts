export class Node {
    id: string = '';
      nodeType = NodeType.HEXAGONAL_TRAP;
      
      textAngle: number = 0;
      textDistance: number = 5;
      prevLinkBuried: boolean = false;
      prevDistance: number = 0;
      lat: number = 0;
    lng: number = 0;
    
    flowIn: number = 0;
      flowOut: number = 0;
      flowCumulated: number = 0;
      flowPercent: number = 0;
      pressure: number = 0;
      lossPressureCumulated: number = 0;
  
      voltage: number = 0;
      powerLoss: number = 0;
  
      // Calculations only
      speedInputModule: number = 0;
      reynoldsNumber: number = 0;
      deltaPLaminaire: number = 0;
      junctionLoss: number = 0;
      differenceFlowAverage: number = 0;
      flowTotalReference: number = 0;
      I: number = 0;
      i: number = 0;
      R: number = 0;
      U: number = 0;
      U2: number = 0;
    
    static loadFromJSON(json): Node {
          return Object.assign(new Node, json)
      }
      
      resetCalculationValues() {
          this.flowIn = 0;
          this.flowOut = 0;
          this.flowCumulated = 0;
          this.flowPercent = 0;
          this.pressure = 0;
          this.lossPressureCumulated = 0;
          this.speedInputModule = 0;
          this.reynoldsNumber = 0;
          this.deltaPLaminaire = 0;
          this.junctionLoss = 0;
          this.differenceFlowAverage = 0;
          this.flowTotalReference = 0;
      }
  }
  
  export enum NodeType {
    CONTROL           = 'CONTROL',
    RECTANGULAR_TRAP  = 'RECTANGULAR_TRAP',
    HEXAGONAL_TRAP    = 'HEXAGONAL_TRAP',
    INTERMEDIATE      = 'INTERMEDIATE'
  }
import { Node } from './node';

export class Branch {
  id: string = '';
  width: number = 3;
	color: string = '#0A4A14';
	numbersColor: string = '#0A4A14';
	suffix: string = '';
	tubeDiameter: number = 6;
  
  parentBranch: string;
  parentNode: string;
  
  nodes: Node[] = [];
  
  // Calculations only
  flowCumulated: number = 0;
	trapsNumber: number = 0;
	nodesNumber: number = 0;

  static loadFromJSON(json): Branch {
		var branch = Object.assign(new Branch, json);
		
		if (json.nodes) {
			branch.nodes = [];
			json.nodes.forEach(jsonNode => { branch.nodes.push(Node.loadFromJSON(jsonNode)) });
		}
		
    return branch;
  }
}
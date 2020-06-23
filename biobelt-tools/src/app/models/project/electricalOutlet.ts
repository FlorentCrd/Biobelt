import { Transformer } from "./transformer";

export class ElectricalOutlet {
  id:   string = '';
  lat:  number = 0;
  lng:  number = 0;
  
  transformers: Transformer[] = [];

  constructor(id: string = '', lat: number = 0, lng: number = 0) {
    this.id = id;
    this.lat = lat;
    this.lng = lng;
  }

  static loadFromJSON(json): ElectricalOutlet {
		var electricalOutlet = Object.assign(new ElectricalOutlet, json);
		
		if (json.transformers) {
      electricalOutlet.transformers = [];
      json.transformers.forEach(jsonTransformer => { electricalOutlet.transformers.push(Transformer.loadFromJSON(jsonTransformer)) });
    }
		
    return electricalOutlet;
  }
}
import { Stock } from "./stock";

import { UPCV3 } from "./upcv3/upcv3";

export class Site {
  id: string = '';
	clientNumber: string = '';
	name: string = '';
	infos: string = '';
	address: string = '';
	lat: number = 0;
  lng: number = 0;
  stock: Stock;
  stockClient:string = '';

 
  upcv3: UPCV3[] = [];

  get state(): State {
    var state: State = State.RESERVE_1;

    // If all belts hibernating
    var hibernating = true;
    
    this.upcv3.forEach(upcv3 => { if (!upcv3.hibernated) hibernating = false });

    // If a belt is in B2
    var b2 = false;
    
    this.upcv3.forEach(upcv3 => { if (!upcv3.hibernated && (upcv3.reservesParameters.co2Res1Status == 0 || upcv3.reservesParameters.co2Res2Status == 0)) b2 = true });

    // If a belt is in B3 OR DISABLE OR EMPTY
    var disable = false;
    
    this.upcv3.forEach(upcv3 => { if (!upcv3.hibernated && (upcv3.reservesParameters.co2Res1Status == 0 && upcv3.reservesParameters.co2Res2Status == 0)) disable = true });

    if (hibernating)
      state = State.HIBERNATING;
    
    if (b2)
      state = State.RESERVE_2;

    if (disable)
      state = State.DISABLE;

    return state;
  }

  get communicationState(): boolean {
    var state = true;

    // UPC-V3
    this.upcv3.forEach(upcv3 => {
      if (!upcv3.hibernated && upcv3.lastPollResult != 0)
        state = false
    });

    

    return state;
  }

  get hasBelts(): boolean {
    return this.upcv3.length > 0 ;
  }
  
  static loadFromJSON(json): Site {
    var site = Object.assign(new Site, json);

    if (json.stock) site.stock = Stock.loadFromJSON(json.stock);

    

    if (json.upcv3) {
      site.upcv3 = [];
      json.upcv3.forEach(jsonUpcv3 => { site.upcv3.push(UPCV3.loadFromJSON(jsonUpcv3)) });
    }
    
    return site;
  }
}

export enum State {
  HIBERNATING,
  RESERVE_1,
  RESERVE_2,
  DISABLE
}
import { LocalDateTime } from "../upcv3/LocalDateTime";

export class InterventionV3 {
  id: number = 0;

	datetime: LocalDateTime = new LocalDateTime();
  
	objet: string = '';

	operateur: string = '';

	bouteillesB1:         string = '';
  bouteillesB1Dates:    string = '';
  bouteillesB1Barcode:  string = '';
	bouteillesB2:         string = '';
  bouteillesB2Dates:    string = '';
  bouteillesB2Barcode:  string = '';
    
  static loadFromJSON(json): InterventionV3 {
    var intervention = Object.assign(new InterventionV3, json);

    if (json.datetime) intervention.datetime = LocalDateTime.loadFromJSON(json.datetime);

    return intervention;
  }

  get b1(): any[] {
    var bottles: any[] = [];

    if (this.bouteillesB1.length > 0) {
      var b1 = this.bouteillesB1.split(',');
      var b1Dates = this.bouteillesB1Dates.split(',');
      var b1Barcodes = this.bouteillesB1Barcode.split(',');

      for (var i = 0; i < b1.length; i++) {
        bottles.push({
          designation: parseFloat(b1[i]),
          barcode: b1Barcodes[i],
          principalReserve: true,
          previousIntervention: parseInt(b1Dates[i]) == 1 ? true : false
        })
      }
    }

    return bottles;
  }

  get b2(): any[] {
    var bottles: any[] = [];

    if (this.bouteillesB2.length > 0) {
      var b2 = this.bouteillesB2.split(',');
      var b2Dates = this.bouteillesB2Dates.split(',');
      var b2Barcodes = this.bouteillesB2Barcode.split(',');

      for (var i = 0; i < b2.length; i++) {
        bottles.push({
          designation: parseFloat(b2[i]),
          barcode: b2Barcodes[i],
          principalReserve: false,
          previousIntervention: parseInt(b2Dates[i]) == 1 ? true : false
        })
      }
    }

    return bottles;
  }
}
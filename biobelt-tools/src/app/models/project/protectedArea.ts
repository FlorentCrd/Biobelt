export class ProtectedArea {
    id:     string  = '';
    width:  number  = 100;
    color:  string  = '#0A4A14';
    points: any[]   = [];
  
    constructor(id: string = '') {
      this.id = id;
    }
  
    static loadFromJSON(json): ProtectedArea {
      var protectedArea = Object.assign(new ProtectedArea, json);
      
      if (json.points) try { protectedArea.points = JSON.parse(json.points) } catch { protectedArea.points = json.points }
      
      return protectedArea;
    }
  }
export class Project {
    id: string = '';
      name: string = '';
      client: string = '';
      address: string = '';
    lat: number = 0;
      lng: number = 0;
      zoom: number = 0;
      hbmDistance: number = 0;
      additionalDistanceSheath: number = 0.5;
      
      customPicture: boolean = false;
      customPictureFilename: string = "";
      customPictureRatio: number = 0;
  
    static loadFromJSON(json): Project {
          return Object.assign(new Project, json)
    }
  }
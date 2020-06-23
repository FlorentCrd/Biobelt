import { User } from "./user";
import { Site } from "./site";

export class Operator extends User {
  lastName:   string = '';
	firstName:  string = '';
  phone:      string = '';
  
  sites: Site[] = [];

  static loadFromJSON(json): Operator {
    var operator = Object.assign(new Operator, json);

    if (json.sites) {
      operator.sites = [];
      json.sites.forEach(jsonSite => { operator.sites.push(Site.loadFromJSON(jsonSite)) });
    }
    
    return operator;
  }
}
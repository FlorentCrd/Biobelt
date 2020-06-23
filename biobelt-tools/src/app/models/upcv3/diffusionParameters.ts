import { DiffCo2Program } from "./diffCo2Program";
import { DiffCo2 } from "./diffCo2";

export class DiffusionParameters {
	diffHourSunrise: number = 0;
	diffHourSunset: number = 0;

  diffCo2Program1: DiffCo2Program = new DiffCo2Program();
  diffCo2Program2: DiffCo2Program = new DiffCo2Program();
  diffCo2Program3: DiffCo2Program = new DiffCo2Program();
  diffCo2Program4: DiffCo2Program = new DiffCo2Program();
  diffCo2Program5: DiffCo2Program = new DiffCo2Program();
  diffCo2Program6: DiffCo2Program = new DiffCo2Program();
  diffCo2Program7: DiffCo2Program = new DiffCo2Program();
  diffCo2Program8: DiffCo2Program = new DiffCo2Program();
  diffCo2Program9: DiffCo2Program = new DiffCo2Program();
  diffCo2Program10: DiffCo2Program = new DiffCo2Program();

	diffCo2Sunrise: DiffCo2 = new DiffCo2();
	diffCo2Sunset: DiffCo2 = new DiffCo2();
	diffCo2Instant: DiffCo2 = new DiffCo2();

	co2PresInpMeas1: number = 0;
	co2PresInpMeas2: number = 0;
	co2PresOutMeas: number = 0;

	co2FlowMeas: number = 0;

	co2PresInpAvg: number = 0;
	co2PressInpOffs: number = 0;

	co2PresOutAvg: number = 0;
	co2PressOutOffs: number = 0;
	co2PressOutComp: number = 0;

	co2FlowAvg: number = 0;
	co2FlowOffs: number = 0;

	upcCo2DiffLvl: number = 0;
  upcDiffLvlAdj: number = 0;
  
	co2TempAvg: number = 0;
	
	static loadFromJSON(json): DiffusionParameters {
		var diffusionParameters = Object.assign(new DiffusionParameters, json);
		
		if (json.diffCo2Program1) diffusionParameters.diffCo2Program1 = DiffCo2Program.loadFromJSON(json.diffCo2Program1);
		if (json.diffCo2Program2) diffusionParameters.diffCo2Program2 = DiffCo2Program.loadFromJSON(json.diffCo2Program2);
		if (json.diffCo2Program3) diffusionParameters.diffCo2Program3 = DiffCo2Program.loadFromJSON(json.diffCo2Program3);
		if (json.diffCo2Program4) diffusionParameters.diffCo2Program4 = DiffCo2Program.loadFromJSON(json.diffCo2Program4);
		if (json.diffCo2Program5) diffusionParameters.diffCo2Program5 = DiffCo2Program.loadFromJSON(json.diffCo2Program5);
		if (json.diffCo2Program6) diffusionParameters.diffCo2Program6 = DiffCo2Program.loadFromJSON(json.diffCo2Program6);
		if (json.diffCo2Program7) diffusionParameters.diffCo2Program7 = DiffCo2Program.loadFromJSON(json.diffCo2Program7);
		if (json.diffCo2Program8) diffusionParameters.diffCo2Program8 = DiffCo2Program.loadFromJSON(json.diffCo2Program8);
		if (json.diffCo2Program9) diffusionParameters.diffCo2Program9 = DiffCo2Program.loadFromJSON(json.diffCo2Program9);
		if (json.diffCo2Program10) diffusionParameters.diffCo2Program10 = DiffCo2Program.loadFromJSON(json.diffCo2Program10);

		if (json.diffCo2Sunrise) diffusionParameters.diffCo2Sunrise = DiffCo2.loadFromJSON(json.diffCo2Sunrise);
		if (json.diffCo2Sunset) diffusionParameters.diffCo2Sunset = DiffCo2.loadFromJSON(json.diffCo2Sunset);
		if (json.diffCo2Instant) diffusionParameters.diffCo2Instant = DiffCo2.loadFromJSON(json.diffCo2Instant);

		return diffusionParameters;
  }
}
import { LocalDateTime } from "./LocalDateTime";

export class ReservesParameters {
  co2ResActive: number = 0;
	co2ResActAdj: number = 0;

	co2ResActPrev: LocalDateTime = new LocalDateTime();
	co2ResInactPrev: LocalDateTime = new LocalDateTime();

	co2ResType: number = 0;

	co2Res1Status: number = 0;
	co2Res1FillVol: number = 0;
	co2Res1FillTime: LocalDateTime = new LocalDateTime();
	co2Res1ActVol: number = 0;
	co2Res1ActDur: number = 0;
	co2Res1StartVol: number = 0;
	co2Res1AuxVol: number = 0;

	co2Res2Status: number = 0;
	co2Res2FillVol: number = 0;
	co2Res2FillTime: LocalDateTime = new LocalDateTime();
	co2Res2ActVol: number = 0;
	co2Res2ActDur: number = 0;
	co2Res2StartVol: number = 0;
	co2Res2AuxVol: number = 0;

	co2ResLow: number = 0;

	static loadFromJSON(json): ReservesParameters {
		var reservesParameters = Object.assign(new ReservesParameters, json);
		
		if (json.co2ResActPrev) reservesParameters.co2ResActPrev = LocalDateTime.loadFromJSON(json.co2ResActPrev);
		if (json.co2ResInactPrev) reservesParameters.co2ResInactPrev = LocalDateTime.loadFromJSON(json.co2ResInactPrev);
		if (json.co2Res1FillTime) reservesParameters.co2Res1FillTime = LocalDateTime.loadFromJSON(json.co2Res1FillTime);
		if (json.co2Res2FillTime) reservesParameters.co2Res2FillTime = LocalDateTime.loadFromJSON(json.co2Res2FillTime);

		return reservesParameters;
  }
}
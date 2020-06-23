export class GeneralParameters {
	upcMcuUid: string = "";
	upcFwVer: number = 0;

	upcMode: number = 0;
	upcStatus: number = 0;

	upcClock: number = 0;
	upcTimeZone: number = 0;

	upcLanguage: number = 0;

	upcTrapNum: number = 0;

	co2FlowRefTrap: number = 0;
	refFlowRateGperhour: number = 0;
	co2FlowRefNom: number = 0;
	co2FlowRefAdj: number = 0;

	co2PresOutRef1: number = 0;
	co2PresOutRef2: number = 0;
	co2PresOutRef3: number = 0;
	co2PresOutRef4: number = 0;
	co2PresOutRef5: number = 0;
	co2PresOutRef6: number = 0;
	co2PresOutRef7: number = 0;
	co2PresOutRef8: number = 0;
	co2PresOutRef9: number = 0;
	co2PresOutRef10: number = 0;
	co2PressOutTemp: number = 0;

	upcBattChrg: number = 0;
	upcBattTemp: number = 0;

	upcCo2PidInteg: number = 0;
	upcCo2PidDiff: number = 0;
	upcCo2PidProp: number = 300;
	
	static loadFromJSON(json): GeneralParameters {
		return Object.assign(new GeneralParameters, json);
	}
}
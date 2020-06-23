export class AlarmsParameters {
	alrResLowEn: boolean = false;
	alrResEmptyEn: boolean = false;
	alrPresInpEn: boolean = false;
	alrPresOutEn: boolean = false;
	alrFlowAvgEn: boolean = false;
	alrPowBackEn: boolean = false;
	alrPowDownEn: boolean = false;

	alrEmptyPress: number = 0;
	alrEmptyVol: number = 0;
	alrPresInpTol: number = 0;
	alrPresOutTol: number = 0;
	alrFlowSetTol: number = 0;
	alrResLowLevel: number = 0;
	alrResEmptyFlow: number = 0;

	alrResEmptyTest: number = 3600;

	alrSmsNum1: string = "";
	alrSmsNum2: string = "";
	alrSmsNum3: string = "";
	alrSmsNum4: string = "";
	alrSmsNum5: string = "";

	alrPressInpSet1_1: number = 0;
	alrPressInpSet1_2: number = 0;
	alrPressInpSet1_3: number = 0;
	alrPressInpSet1_4: number = 0;
	alrPressInpSet1_5: number = 0;
	alrPressInpSet1_6: number = 0;
	alrPressInpSet1_7: number = 0;
	alrPressInpSet1_8: number = 0;
	alrPressInpSet1_9: number = 0;
	alrPressInpSet1_10: number = 0;

	alrPressInpSet2_1: number = 0;
	alrPressInpSet2_2: number = 0;
	alrPressInpSet2_3: number = 0;
	alrPressInpSet2_4: number = 0;
	alrPressInpSet2_5: number = 0;
	alrPressInpSet2_6: number = 0;
	alrPressInpSet2_7: number = 0;
	alrPressInpSet2_8: number = 0;
	alrPressInpSet2_9: number = 0;
	alrPressInpSet2_10: number = 0;

	alrPressOutSet_1: number = 0;
	alrPressOutSet_2: number = 0;
	alrPressOutSet_3: number = 0;
	alrPressOutSet_4: number = 0;
	alrPressOutSet_5: number = 0;
	alrPressOutSet_6: number = 0;
	alrPressOutSet_7: number = 0;
	alrPressOutSet_8: number = 0;
	alrPressOutSet_9: number = 0;
	alrPressOutSet_10: number = 0;

	alrPressSetTemp: number = 0;
	
	static loadFromJSON(json): AlarmsParameters {
		return Object.assign(new AlarmsParameters, json)
	}
}
export class DefaultUPCV3Params {
    id: string;
  
      co2FlowRefTrap: number;
      refFlowRateGperhour: number;
  
      daysCode1: string;
      startTime1: string;
      endTime1: string;
      intensity1: number;
  
      daysCode2: string;
      startTime2: string;
      endTime2: string;
      intensity2: number;
  
      sunriseDelay: number;
      sunriseDuration: number;
      sunriseIntensity: number;
  
      sunsetDelay: number;
      sunsetDuration: number;
      sunsetIntensity: number;
  
      alrResLowEn: boolean;
      alrResEmptyEn: boolean;
      alrPresInpEn: boolean;
      alrPresOutEn: boolean;
      alrFlowAvgEn: boolean;
      alrPowBackEn: boolean;
      alrPowDownEn: boolean;
  
      alrEmptyPress: number;
      alrEmptyVol: number;
      alrPresInpTol: number;
      alrPresOutTol: number;
      alrFlowSetTol: number;
      alrResLowLevel: number;
      alrResEmptyFlow: number;
  
      alrSmsNum0: string;
  
      comWiFiName: string;
      comWiFiPass: string;
      upcLanguage: number;
      comGsmName: string;
      comGsmPass: string;
    comWebSrvUrl: string;
    
    static loadFromJSON(json): DefaultUPCV3Params {
      return Object.assign(new DefaultUPCV3Params, json)
    }
  }
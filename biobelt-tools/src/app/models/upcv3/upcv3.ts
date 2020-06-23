import { GeneralParameters } from "./generalParameters";
import { CommunicationParameters } from "./communicationParameters";
import { DiffusionParameters } from "./diffusionParameters";
import { ReservesParameters } from "./reservesParameters";
import { AlarmsParameters } from "./alarmsParameters";
import { LocalDateTime } from "./LocalDateTime";
import { DefaultUPCV3Params } from "./defaultUPCV3Params";
import { DaysCode } from "./diffCo2Program";

export class UPCV3 {
	id: number = 0;
	upcNameId: string = '';
	lat: number = 0;
	lng: number = 0;
	upcError: number = 0;
	hibernated: boolean = false;

	generalParameters: GeneralParameters = new GeneralParameters();

	communicationParameters: CommunicationParameters = new CommunicationParameters();

	diffusionParameters: DiffusionParameters = new DiffusionParameters();

	reservesParameters: ReservesParameters = new ReservesParameters();

	alarmsParameters: AlarmsParameters = new AlarmsParameters();

	upcLastPollDatetime:  LocalDateTime = new LocalDateTime();
	lastPollResult:       number = 0;
	upcPollEnable:        boolean = false;
  upcPollTasks:         number = 0;
  
  upcLastSyncDatetime: LocalDateTime = new LocalDateTime();

	logLastVisit: LocalDateTime = new LocalDateTime();
  
  belt: string = '';

  co2LettersToKg(letters: number): number {
    return letters * 0.001974;
  }
  
  get upcStatusString(): string {
    switch (this.generalParameters.upcStatus) {
      case 0: return 'DIS';
      case 1: return 'ENA';
      case 2: return 'ADJ';
      case 3: return 'CHK';
      case 4: return 'CAL';
      case 100: return 'EMPTY';
      default: return '';
    }
  }
  get co2ResActiveString(): string {
    if (this.generalParameters.upcMode == 0) return '/';

    switch (this.reservesParameters.co2ResActive) {
      case 1:
      var co2ResActive = 'B' + this.reservesParameters.co2ResActive;
      if (this.reservesParameters.co2ResType == 1) co2ResActive += 'P'
      if (this.reservesParameters.co2ResType == 2) co2ResActive += 'S'
      return co2ResActive;

      case 2:
      var co2ResActive = 'B' + this.reservesParameters.co2ResActive;
      if (this.reservesParameters.co2ResType == 1) co2ResActive += 'S'
      if (this.reservesParameters.co2ResType == 2) co2ResActive += 'P'
      return co2ResActive;

      default:
      return '-'
    }
  }
  get upcLastPollDatetimeString(): string {
    if (this.upcLastPollDatetime) {
      
      // Day
      if (this.upcLastPollDatetime.daysFromNow > 0) {
        if (this.upcLastPollDatetime.daysFromNow > 1) return this.upcLastPollDatetime.daysFromNow + ' jours';
        else return this.upcLastPollDatetime.daysFromNow + ' jour';
      }

      // Hour
      if (this.upcLastPollDatetime.hoursFromNow > 0) {
        if (this.upcLastPollDatetime.hoursFromNow > 1) return this.upcLastPollDatetime.hoursFromNow + ' heures';
        else return this.upcLastPollDatetime.hoursFromNow + ' heure';
      }

      // Minute
      if (this.upcLastPollDatetime.minutesFromNow > 0) {
        if (this.upcLastPollDatetime.minutesFromNow > 1) return this.upcLastPollDatetime.minutesFromNow + ' minutes';
        else return this.upcLastPollDatetime.minutesFromNow + ' minute';
      }

    } else return '-';
  }

  get upcNameIdIndex(): number {
    // 0: hibernating   1: OK   2: Alert    3: Comm error   4: Empty
    if (!this.hibernated) {
      if (this.reservesParameters.co2Res1Status == 0 && this.reservesParameters.co2Res2Status == 0) return 4;
      else if (this.upcPollEnable && this.lastPollResult != 0) return 3;
      else if (this.reservesParameters.co2Res1Status == 0 || this.reservesParameters.co2Res2Status == 0) return 2;
      else return 1;
    } else return 0;
  }
  get upcNameIdClass(): string {
    if (!this.hibernated && ((this.reservesParameters.co2Res1Status == 0 && this.reservesParameters.co2Res2Status == 0) || (this.upcPollEnable && this.lastPollResult != 0))) return 'text-danger';
    else if (!this.hibernated && (this.reservesParameters.co2Res1Status == 0 || this.reservesParameters.co2Res2Status == 0)) return 'text-warning';
    else if (this.hibernated) return 'text-primary';
    else return 'text-success';
  }
  get upcStatusClass(): string {
    if (!this.hibernated && (this.generalParameters.upcStatus == 0 || this.generalParameters.upcStatus == 2 || this.generalParameters.upcStatus > 7)) return 'text-danger font-weight-bold';
    else if (!this.hibernated && this.generalParameters.upcStatus == 3) return 'text-warning font-weight-bold';
    else return '';
  }
  get co2Res1ActVolClass(): string {
    if (!this.hibernated && this.reservesParameters.co2Res1Status == 0) return 'text-danger font-weight-bold';
    else if (!this.hibernated && this.reservesParameters.co2Res1Status == 1) return 'text-warning font-weight-bold';
    else return '';
  }
  get co2Res2ActVolClass(): string {
    if (!this.hibernated && this.reservesParameters.co2Res2Status == 0) return 'text-danger font-weight-bold';
    else if (!this.hibernated && this.reservesParameters.co2Res2Status == 1) return 'text-warning font-weight-bold';
    else return '';
  }
  get upcLastPollDatetimeClass(): string {
    if (!this.hibernated && this.lastPollResult != 0) return 'text-danger font-weight-bold';
    else return '';
	}
	get upcPollEnableClass(): string {
		if (!this.hibernated && !this.upcPollEnable) return 'text-danger font-weight-bold';
    else return '';
	}
  
  constructor(defaultParams: DefaultUPCV3Params = null) {
    if (defaultParams) {
      this.generalParameters.co2FlowRefTrap = defaultParams.co2FlowRefTrap;
      this.generalParameters.refFlowRateGperhour = defaultParams.refFlowRateGperhour;

      this.diffusionParameters.diffCo2Program1.daysCode = DaysCode[defaultParams.daysCode1];
      this.diffusionParameters.diffCo2Program1.start = defaultParams.startTime1;
      this.diffusionParameters.diffCo2Program1.end = defaultParams.endTime1;
      this.diffusionParameters.diffCo2Program1.intensity = defaultParams.intensity1;

      this.diffusionParameters.diffCo2Program2.daysCode = DaysCode[defaultParams.daysCode2];
      this.diffusionParameters.diffCo2Program2.start = defaultParams.startTime2;
      this.diffusionParameters.diffCo2Program2.end = defaultParams.endTime2;
      this.diffusionParameters.diffCo2Program2.intensity = defaultParams.intensity2;

      this.diffusionParameters.diffCo2Sunrise.delay = defaultParams.sunriseDelay;
      this.diffusionParameters.diffCo2Sunrise.duration = defaultParams.sunriseDuration;
      this.diffusionParameters.diffCo2Sunrise.intensity = defaultParams.sunriseIntensity;
      
      this.diffusionParameters.diffCo2Sunset.delay = defaultParams.sunsetDelay;
      this.diffusionParameters.diffCo2Sunset.duration = defaultParams.sunsetDuration;
      this.diffusionParameters.diffCo2Sunset.intensity = defaultParams.sunsetIntensity;

      this.alarmsParameters.alrResLowEn = defaultParams.alrResLowEn;
      this.alarmsParameters.alrResEmptyEn = defaultParams.alrResEmptyEn;
      this.alarmsParameters.alrPresInpEn = defaultParams.alrPresInpEn;
      this.alarmsParameters.alrPresOutEn = defaultParams.alrPresOutEn;
      this.alarmsParameters.alrFlowAvgEn = defaultParams.alrFlowAvgEn;
      this.alarmsParameters.alrPowBackEn = defaultParams.alrPowBackEn;
      this.alarmsParameters.alrPowDownEn = defaultParams.alrPowDownEn;

      this.alarmsParameters.alrEmptyPress = defaultParams.alrEmptyPress;
      this.alarmsParameters.alrEmptyVol = defaultParams.alrEmptyVol;
      this.alarmsParameters.alrPresInpTol = defaultParams.alrPresInpTol;
      this.alarmsParameters.alrPresOutTol = defaultParams.alrPresOutTol;
      this.alarmsParameters.alrFlowSetTol = defaultParams.alrFlowSetTol;
      this.alarmsParameters.alrResLowLevel = defaultParams.alrResLowLevel;
      this.alarmsParameters.alrResEmptyFlow = defaultParams.alrResEmptyFlow;

      this.alarmsParameters.alrSmsNum1 = defaultParams.alrSmsNum0;

      this.communicationParameters.comWiFiName = defaultParams.comWiFiName;
      this.communicationParameters.comWiFiPass = defaultParams.comWiFiPass;
      this.generalParameters.upcLanguage = defaultParams.upcLanguage;
      this.communicationParameters.comGsmName = defaultParams.comGsmName;
      this.communicationParameters.comGsmPass = defaultParams.comGsmPass;
      this.communicationParameters.comWebSrvUrl = defaultParams.comWebSrvUrl;
    }
  }
  
  static loadFromJSON(json): UPCV3 {
    var upcv3 = Object.assign(new UPCV3, json);

    if (json.generalParameters) upcv3.generalParameters = GeneralParameters.loadFromJSON(json.generalParameters);
    if (json.communicationParameters) upcv3.communicationParameters = CommunicationParameters.loadFromJSON(json.communicationParameters);
    if (json.diffusionParameters) upcv3.diffusionParameters = DiffusionParameters.loadFromJSON(json.diffusionParameters);
    if (json.reservesParameters) upcv3.reservesParameters = ReservesParameters.loadFromJSON(json.reservesParameters);
    if (json.alarmsParameters) upcv3.alarmsParameters = AlarmsParameters.loadFromJSON(json.alarmsParameters);

    if (json.upcLastPollDatetime)   upcv3.upcLastPollDatetime = LocalDateTime.loadFromJSON(json.upcLastPollDatetime);
    if (json.logLastVisit) upcv3.logLastVisit = LocalDateTime.loadFromJSON(json.logLastVisit);
    
    if (json.upcLastSyncDatetime) upcv3.upcLastSyncDatetime = LocalDateTime.loadFromJSON(json.upcLastSyncDatetime);

    return upcv3;
  }
}
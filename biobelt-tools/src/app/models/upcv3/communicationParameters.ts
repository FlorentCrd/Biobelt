export class CommunicationParameters {
	comWiFiName: string = "";
	comWiFiPass: string = "";
	comWiFiIpAdr: string = "";

	comGsmName: string = "";
	comGsmPass: string = "";
	comGsmIpAdr: string = "0.0.0.0";
	comGsmMode: number = 0;
	comGsmLevel: number = 0;

	comWebSrvUrl: string = "";

	comMdmApnId: string = "";
	comMdmApnId2: string = "orange.m2m";
	comMdmApnUser: string = "orange";
	comMdmApnPass: string = "orange";
	comWifiApCh: number = 11;

	get comGsmModeString(): string {
		switch (this.comGsmMode) {
			case 0: return 'Non enregistré';
			case 1: return '2G GPRS';
			case 2: return '2G EDGE';
			case 3: return '3G WCDMA';
			case 4: return '3G HSDPA';
			case 5: return '3G HSUPA';
			case 6: return '3G HSDPA/HSUPA';
			case 7: return '4G';
		}
	}
	
	static loadFromJSON(json): CommunicationParameters {
		return Object.assign(new CommunicationParameters, json);
	}
}
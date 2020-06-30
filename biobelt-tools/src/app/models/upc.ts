import { ModbusClient, UPCDiffCo2Program, UPCDiffCo2Sun } from './modbus';

export class UPC {
  // Attributes
  host:                     string    = '10.1.1.1';
  port:                     number    = 502;
  stateChangeCallback:      any       = null;
  state:                    UPCState  = UPCState.NULL;
  static litterToKilograms: number    = 0.001974;

  client: ModbusClient = null;

  nameId:         string = '';
  mode:           number = 0;
  status:         number = 0;
  trapNum:        number = 0;
  co2FlowRefTrap: number = 0;
  co2Res1ActVol:    number = 0;
  co2Res2ActVol:    number = 0;
  diffHourSunrise:    number = 0;
  diffHourSunset:     number = 0;
  diffCo2Program:     UPCDiffCo2Program[] = [
    new UPCDiffCo2Program(),
    new UPCDiffCo2Program(),
    new UPCDiffCo2Program(),
    new UPCDiffCo2Program(),
    new UPCDiffCo2Program(),
    new UPCDiffCo2Program(),
    new UPCDiffCo2Program(),
    new UPCDiffCo2Program(),
    new UPCDiffCo2Program(),
    new UPCDiffCo2Program()
  ];
  diffCo2Sunrise: UPCDiffCo2Sun = new UPCDiffCo2Sun();
  diffCo2Sunset:  UPCDiffCo2Sun = new UPCDiffCo2Sun();

  /**
   * Constructor
   */
  constructor(stateChangeCallback) {
    this.stateChangeCallback = stateChangeCallback;
    this.init();
  }

  init() {
    // Init Client
    this.client = new ModbusClient(15000, false);
    this.client.on('reconnecting', function () {
      this.state = UPCState.RECONNECTING;
      this.stateChangeCallback(this.state);
    }.bind(this));
    this.client.on('offline', function () {
      this.state = UPCState.OFFLINE;
      this.stateChangeCallback(this.state);
    }.bind(this));
    this.client.on('online', function () {
      this.state = UPCState.ONLINE;
      this.stateChangeCallback(this.state);
    }.bind(this));
    this.client.on('error', function () {
      this.state = UPCState.ERROR;
      this.stateChangeCallback(this.state);
    }.bind(this));
    this.client.setHost(this.host);
    this.client.setPort(this.port);
    this.client.connect();
    this.client.reconnect();
  }
  
  disconnect() {
    // Modbus client
    this.client.disconnect();
  }
  
  reconnect() {
    // Modbus client
    this.client.disconnect();
    this.init();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }



  /**
   * Methods
   */
  async flashFW(file: string, loading: HTMLIonLoadingElement) {
    var lines: string[] = file.split('\n');
    for (var i = 0; i < lines.length; i++) {

      // Write line
      var l = lines[i].trim() + '\0';
      var length = l.length;
      if (length % 2 != 0) {
        l = l + '\0';
        length++;
      }
      await this.client.setStringInHoldingRegister(41000, l);

      loading.message = 'Updating firmware : ' + (i / lines.length * 100).toFixed(1) + ' %'

    }
  }
  getAllVars(): any {
    // TODO
    return Promise.all(
      [

        // General parameters
        this.client.getStringFromHoldingRegister(40441, 8),   // TODO: upcMcuUid
        this.client.getIntFromHoldingRegister(40168, 1),      // upcFwVer
        this.client.getStringFromHoldingRegister(40001, 10),  // upcNameId
        this.client.getIntFromHoldingRegister(40011, 1),      // upcMode
        this.client.getIntFromHoldingRegister(40376, 1),      // upcStatus
        this.client.getIntFromHoldingRegister(40012, 2),      // upcClock
        this.client.getIntFromHoldingRegister(40401, 2),      // upcTimeZone
        this.client.getIntFromHoldingRegister(40014, 1),      // upcLanguage
        this.client.getIntFromHoldingRegister(40044, 1),      // upcEventNum
        this.client.getIntFromHoldingRegister(40015, 1),      // upcTrapNum
        this.client.getFloatFromHoldingRegister(40016),       // co2FlowRefTrap
        this.client.getFloatFromHoldingRegister(40020),       // co2FlowRefNom
        this.client.getFloatFromHoldingRegister(40018),       // co2FlowRefAdj
        this.client.getFloatFromHoldingRegister(40271),       // co2PressOutRef_1
        this.client.getFloatFromHoldingRegister(40273),       // co2PressOutRef_2
        this.client.getFloatFromHoldingRegister(40275),       // co2PressOutRef_3
        this.client.getFloatFromHoldingRegister(40277),       // co2PressOutRef_4
        this.client.getFloatFromHoldingRegister(40279),       // co2PressOutRef_5
        this.client.getFloatFromHoldingRegister(40281),       // co2PressOutRef_6
        this.client.getFloatFromHoldingRegister(40283),       // co2PressOutRef_7
        this.client.getFloatFromHoldingRegister(40285),       // co2PressOutRef_8
        this.client.getFloatFromHoldingRegister(40287),       // co2PressOutRef_9
        this.client.getFloatFromHoldingRegister(40289),       // co2PressOutRef_10
        this.client.getFloatFromHoldingRegister(40461),       // co2PressOutTemp

        // Comunication
        this.client.getStringFromHoldingRegister(40024, 10),  // comMdmName
        this.client.getStringFromHoldingRegister(40034, 10),  // comMdmPass
        this.client.getIntFromHoldingRegister(40022, 2),      // comMdmIpAdr
        this.client.getIntFromHoldingRegister(40414, 1),      // comMdmMode
        this.client.getIntFromHoldingRegister(40415, 1),      // comMdmLevel
        this.client.getStringFromHoldingRegister(40045, 10),  // comWifiSsid
        this.client.getStringFromHoldingRegister(40055, 10),  // comWifiPass
        this.client.getIntFromHoldingRegister(40340, 1),      // comWifiApCh

        // CO2 diffusion
        this.client.getIntFromHoldingRegister(40068, 2),            // diffHourSunRise
        this.client.getIntFromHoldingRegister(40070, 2),            // diffHourSunSet
        this.client.getDiffusionProgramFromHoldingRegister(40072),  // diffCo2Program_1
        this.client.getDiffusionProgramFromHoldingRegister(40078),  // diffCo2Program_2
        this.client.getDiffusionProgramFromHoldingRegister(40084),  // diffCo2Program_3
        this.client.getDiffusionProgramFromHoldingRegister(40090),  // diffCo2Program_4
        this.client.getDiffusionProgramFromHoldingRegister(40096),  // diffCo2Program_5
        this.client.getDiffusionProgramFromHoldingRegister(40102),  // diffCo2Program_6
        this.client.getDiffusionProgramFromHoldingRegister(40108),  // diffCo2Program_7
        this.client.getDiffusionProgramFromHoldingRegister(40114),  // diffCo2Program_8
        this.client.getDiffusionProgramFromHoldingRegister(40120),  // diffCo2Program_9
        this.client.getDiffusionProgramFromHoldingRegister(40126),  // diffCo2Program_10
        this.client.getDiffusionSunFromHoldingRegister(40132),      // diffCo2Sunrise
        this.client.getDiffusionSunFromHoldingRegister(40138),      // diffCo2Sunset
        this.client.getFloatFromHoldingRegister(40427),             // co2PressInpMeas1
        this.client.getFloatFromHoldingRegister(40429),             // co2PressInpMeas2
        this.client.getFloatFromHoldingRegister(40431),             // co2PressOutMeas
        this.client.getFloatFromHoldingRegister(40433),             // co2FlowMeas
        this.client.getFloatFromHoldingRegister(40435),             // co2PressInpAvg
        this.client.getFloatFromHoldingRegister(40455),             // co2PressInpOffs
        this.client.getFloatFromHoldingRegister(40437),             // co2PressOutAvg
        this.client.getFloatFromHoldingRegister(40457),             // co2PressoutOffs
        this.client.getFloatFromHoldingRegister(40463),             // co2PressOutComp
        this.client.getFloatFromHoldingRegister(40439),             // co2FlowAvg
        this.client.getFloatFromHoldingRegister(40459),             // co2FlowOffs
        this.client.getFloatFromHoldingRegister(40390),             // co2FlowGain
        this.client.getIntFromHoldingRegister(40416, 1),            // upcCo2DiffLvl
        this.client.getIntFromHoldingRegister(40065, 1),            // upcDiffLvlAdj
        this.client.getFloatFromHoldingRegister(40451),             // co2TempAvg

        // CO2 reserves
        this.client.getIntFromHoldingRegister(40151, 1),  // co2ResActive
        this.client.getIntFromHoldingRegister(40150, 1),  // co2ResActAdj
        this.client.getIntFromHoldingRegister(40417, 2),  // co2ResActPrev
        this.client.getIntFromHoldingRegister(40419, 2),  // co2ResInactPrev
        this.client.getIntFromHoldingRegister(40382, 1),  // co2ResType
        this.client.getIntFromHoldingRegister(40381, 1),  // co2Res1Status
        this.client.getFloatFromHoldingRegister(40384),   // co2Res1FillNew
        this.client.getFloatFromHoldingRegister(40153),   // co2Res1FillVol
        this.client.getIntFromHoldingRegister(40155, 2),  // co2Res1FillTime
        this.client.getFloatFromHoldingRegister(40157),   // co2Res1ActVol
        this.client.getIntFromHoldingRegister(40159, 1),  // co2Res1ActDur
        this.client.getFloatFromHoldingRegister(40421),   // co2Res1StartVol
        this.client.getFloatFromHoldingRegister(40347),   // co2Res1AuxVol
        this.client.getIntFromHoldingRegister(40383, 1),  // co2Res2Status
        this.client.getFloatFromHoldingRegister(40386),   // co2Res2FillNew
        this.client.getFloatFromHoldingRegister(40161),   // co2Res2FillVol
        this.client.getIntFromHoldingRegister(40163, 2),  // co2Res2FillTime
        this.client.getFloatFromHoldingRegister(40165),   // co2Res2ActVol
        this.client.getIntFromHoldingRegister(40167, 1),  // co2Res2ActDur
        this.client.getFloatFromHoldingRegister(40449),   // co2Res2StartVol
        this.client.getFloatFromHoldingRegister(41119),   // co2Res1AuxVol[0]
        this.client.getFloatFromHoldingRegister(41129),   // co2Res1AuxVol[2]
        this.client.getFloatFromHoldingRegister(41139),   // co2Res1AuxVol[4]
        this.client.getFloatFromHoldingRegister(41149),   // co2Res1AuxVol[6]
        this.client.getFloatFromHoldingRegister(41159),   // co2Res1AuxVol[8]
        this.client.getFloatFromHoldingRegister(41169),   // co2Res2AuxVol[0]
        this.client.getFloatFromHoldingRegister(41179),   // co2Res2AuxVol[2]
        this.client.getFloatFromHoldingRegister(41189),   // co2Res2AuxVol[4]
        this.client.getFloatFromHoldingRegister(41199),   // co2Res2AuxVol[6]
        this.client.getFloatFromHoldingRegister(41208),   // co2Res2AuxVol[8]
        this.client.getIntFromHoldingRegister(40342,5),   //R1 bottles number




        // Alarms setup
        this.client.getIntFromHoldingRegister(40388, 2),      // alrResEmptyTest
        this.client.getIntFromHoldingRegister(40066, 1),      // alrResLowEn
        this.client.getIntFromHoldingRegister(40169, 1),      // alrResEmptyEn
        this.client.getIntFromHoldingRegister(40170, 1),      // alrPressInpEn
        this.client.getIntFromHoldingRegister(40171, 1),      // alrPressOutEn
        this.client.getIntFromHoldingRegister(40172, 1),      // alrFlowAvgEn
        this.client.getIntFromHoldingRegister(40173, 1),      // alrPowDownEn
        this.client.getIntFromHoldingRegister(40174, 1),      // alrPowBackEn
        this.client.getStringFromHoldingRegister(40175, 10),  // alrSmsNum_1
        this.client.getStringFromHoldingRegister(40185, 10),  // alrSmsNum_2
        this.client.getStringFromHoldingRegister(40195, 10),  // alrSmsNum_3
        this.client.getStringFromHoldingRegister(40205, 10),  // alrSmsNum_4
        this.client.getStringFromHoldingRegister(40215, 10),  // alrSmsNum_5
        this.client.getFloatFromHoldingRegister(40227),       // alrResLowLevel
        this.client.getFloatFromHoldingRegister(40225),       // alrResEmptyFlow
        this.client.getFloatFromHoldingRegister(40269),       // alrPressInpTol
        this.client.getFloatFromHoldingRegister(40291),       // alrPressOutTol
        this.client.getFloatFromHoldingRegister(40293),       // alrFlowSetTol
        this.client.getFloatFromHoldingRegister(40229),       // alrPressInpSet1_1
        this.client.getFloatFromHoldingRegister(40231),       // alrPressInpSet1_2
        this.client.getFloatFromHoldingRegister(40233),       // alrPressInpSet1_3
        this.client.getFloatFromHoldingRegister(40235),       // alrPressInpSet1_4
        this.client.getFloatFromHoldingRegister(40237),       // alrPressInpSet1_5
        this.client.getFloatFromHoldingRegister(40239),       // alrPressInpSet1_6
        this.client.getFloatFromHoldingRegister(40241),       // alrPressInpSet1_7
        this.client.getFloatFromHoldingRegister(40243),       // alrPressInpSet1_8
        this.client.getFloatFromHoldingRegister(40245),       // alrPressInpSet1_9
        this.client.getFloatFromHoldingRegister(40247),       // alrPressInpSet1_10
        this.client.getFloatFromHoldingRegister(40249),       // alrPressInpSet2_1
        this.client.getFloatFromHoldingRegister(40251),       // alrPressInpSet2_2
        this.client.getFloatFromHoldingRegister(40253),       // alrPressInpSet2_3
        this.client.getFloatFromHoldingRegister(40255),       // alrPressInpSet2_4
        this.client.getFloatFromHoldingRegister(40257),       // alrPressInpSet2_5
        this.client.getFloatFromHoldingRegister(40259),       // alrPressInpSet2_6
        this.client.getFloatFromHoldingRegister(40261),       // alrPressInpSet2_7
        this.client.getFloatFromHoldingRegister(40263),       // alrPressInpSet2_8
        this.client.getFloatFromHoldingRegister(40265),       // alrPressInpSet2_9
        this.client.getFloatFromHoldingRegister(40267),       // alrPressInpSet2_10
        this.client.getFloatFromHoldingRegister(40356),       // alrPressOutSet_1
        this.client.getFloatFromHoldingRegister(40358),       // alrPressOutSet_2
        this.client.getFloatFromHoldingRegister(40360),       // alrPressOutSet_3
        this.client.getFloatFromHoldingRegister(40362),       // alrPressOutSet_4
        this.client.getFloatFromHoldingRegister(40364),       // alrPressOutSet_5
        this.client.getFloatFromHoldingRegister(40366),       // alrPressOutSet_6
        this.client.getFloatFromHoldingRegister(40368),       // alrPressOutSet_7
        this.client.getFloatFromHoldingRegister(40370),       // alrPressOutSet_8
        this.client.getFloatFromHoldingRegister(40372),       // alrPressOutSet_9
        this.client.getFloatFromHoldingRegister(40374),       // alrPressOutSet_10
        this.client.getFloatFromHoldingRegister(40465),       // alrPressSetTemp

        // Auxiliary parameters
        this.client.getStringFromHoldingRegister(40295, 15),  // comWebSrvUrl
        this.client.getStringFromHoldingRegister(40310, 10),  // comMdmApnId
        this.client.getStringFromHoldingRegister(40320, 10),  // comMdmApnUser
        this.client.getStringFromHoldingRegister(40330, 10),  // comMdmApnPass
        this.client.getFloatFromHoldingRegister(40453),       // upcCo2PidProp
        this.client.getFloatFromHoldingRegister(40377),       // upcCo2PidInteg
        this.client.getFloatFromHoldingRegister(40379),       // upcCo2PidDiff
        this.client.getFloatFromHoldingRegister(40423),       // upcBattChrg
        this.client.getFloatFromHoldingRegister(40425)        // upcBattTemp

      ]
    ).then(results => {
      return {

        // General parameters
        general: {
          upcMcuUid: results[0], upcFwVer: results[1], upcNameId: results[2], upcMode: results[3], upcStatus: results[4], upcClock: results[5], upcTimeZone: results[6],
          upcLanguage: results[7], upcEventNum: results[8], upcTrapNum: results[9], co2FlowRefTrap: results[10], co2FlowRefNom: results[11], co2FlowRefAdj: results[12],
          co2PressOutRef: [ results[13], results[14], results[15], results[16], results[17], results[18], results[19], results[20], results[21], results[22] ],
          co2PressOutTemp: results[23]
        },

        // Comunication
        comunication: {
          comMdmName: results[24], comMdmPass: results[25], comMdmIpAdr: results[26], comMdmMode: results[27],
          comMdmLevel: results[28], comWifiSsid: results[29], comWifiPass: results[30], comWifiApCh: results[31]
        },

        // CO2 diffusion
        co2Diffusion: {
          diffHourSunRise: results[32], diffHourSunSet: results[33],
          diffCo2Program: [ results[34], results[35], results[36], results[37], results[38], results[39], results[40], results[41], results[42], results[43] ],
          diffCo2Sunrise: results[44], diffCo2Sunset: results[45], co2PressInpMeas1: results[46], co2PressInpMeas2: results[47], co2PressOutMeas: results[48],
          co2FlowMeas: results[49], co2PressInpAvg: results[50], co2PressInpOffs: results[51], co2PressOutAvg: results[52], co2PressoutOffs: results[53],
          co2PressOutComp: results[54], co2FlowAvg: results[55], co2FlowOffs: results[56], co2FlowGain: results[57], upcCo2DiffLvl: results[58],
          upcDiffLvlAdj: results[59], co2TempAvg: results[60]
        },

        // CO2 reserves
        co2Reserves: {
          co2ResActive: results[61], co2ResActAdj: results[62], co2ResActPrev: results[63], co2ResInactPrev: results[64], co2ResType: results[65],
          co2Res1Status: results[66], co2Res1FillNew: results[67], co2Res1FillVol: results[68], co2Res1FillTime: results[69], co2Res1ActVol: results[70],
          co2Res1ActDur: results[71], co2Res1StartVol: results[72], co2Res1AuxVol: results[73], co2Res2Status: results[74], co2Res2FillNew: results[75],
          co2Res2FillVol: results[76], co2Res2FillTime: results[77], co2Res2ActVol: results[78], co2Res2ActDur: results[79], co2Res2StartVol: results[80],
          co2Res2AuxVol: results[81]
        },

        // Alarms setup
        alarms: {
          alrResEmptyTest: results[82], alrResLowEn: results[83], alrResEmptyEn: results[84], alrPressInpEn: results[85], alrPressOutEn: results[86], alrFlowAvgEn: results[87],
          alrPowDownEn: results[88], alrPowBackEn: results[89], alrSmsNum: [ results[90], results[91], results[92], results[93], results[94] ], alrResLowLevel: results[95],
          alrResEmptyFlow: results[96], alrPressInpTol: results[97], alrPressOutTol: results[98], alrFlowSetTol: results[99],
          alrPressInpSet1: [ results[100], results[101], results[102], results[103], results[104], results[105], results[106], results[107], results[108], results[109] ],
          alrPressInpSet2: [ results[110], results[111], results[112], results[113], results[114], results[115], results[116], results[117], results[118], results[119] ],
          alrPressOutSet: [ results[120], results[121], results[122], results[123], results[124], results[125], results[126], results[127], results[128], results[129] ],
          alrPressSetTemp: results[130]
        },

        // Auxiliary parameters
        auxiliary: {
          comWebSrvUrl: results[131], comMdmApnId: results[132], comMdmApnUser: results[133], comMdmApnPass: results[134], upcCo2PidProp: results[135],
          upcCo2PidInteg: results[136],upcCo2PidDiff: results[137],upcBattChrg: results[138], upcBattTemp: results[139]
        }

      };
    });
  }
  reset() {
    return Promise.all([ this.client.setIntInHoldingRegister(40011, 1, 0xffff) ]);
  }
  wipe() {
    return Promise.all([ this.client.setIntInHoldingRegister(40011, 1, 0xeeee) ]);
  }
}

export enum UPCState {
  RECONNECTING  = 0,
  ONLINE        = 1,
  OFFLINE       = 2,
  ERROR         = 3,
  NULL          = 4
}

import * as $ from 'jquery';

export class Events {
  cbList = { };

  fire(name, args) {
    if (!this.cbList[name]) return;
    for (var i in this.cbList[name]) this.cbList[name][i].apply(this, args);
    return this;
  }

  fireLater(name, args) {
    if (args === undefined) args = [];
    return function() {
        var aA  = Array.prototype.slice.call(arguments, 0),
            a   = args.concat(aA);
        this.fire(name, a.length > 0 ? a : undefined);
    }.bind(this);
  }

  on(name, func) {
    if (!this.cbList.hasOwnProperty(name)) this.cbList[name] = [];
    this.cbList[name].push(func);
    return { 
      name  : name, 
      index : this.cbList[name].length - 1 
    };
  }

  off(id) {
    this.cbList[id.name].splice(id.index);
    return this;
  }
}

export class StateMachine extends Events {
  state = null;
  
  constructor(initState) {
    super();
    this.state = initState;
  }

  inState(newState) {
    return this.state === newState;
  }

  setState(newState) {
    var oldState = this.state;
    this.state = newState;
    this.fire('state_changed', [oldState, newState]);
    return this;
  }
}

export const MODBUS_CONSTS = {
  MBAP_TID:                 0,
  MBAP_PID:                 2,
  MBAP_LEN:                 4,
  MBAP_UID:                 6,
  BODY_FC:                  0,
  BODY_START:               1,
  BODY_COUNT:               3,
  READ_COILS:               1,
  READ_HOLDING_REGISTERS:   3,
  READ_INPUT_REGISTERS:     4,
  WRITE_SINGLE_COIL:        5,
  WRITE_SINGLE_REGISTER:    6,
  WRITE_MULTIPLE_REGISTERS: 16
};

export class ModbusRequest {
  id;
  length;

  deferred;
  packet: ArrayBuffer;
  header: DataView;
  timeout = null;
  
  constructor(id, length) {
    this.id = id;
    this.length = length;

    this.deferred = $.Deferred();
    this.packet = new ArrayBuffer(length);
    this.header = new DataView(this.packet, 0, 7);
    
    // Init
    this.header.setUint16(MODBUS_CONSTS.MBAP_TID, this.id);
    this.header.setUint16(MODBUS_CONSTS.MBAP_PID, 0);
    this.header.setUint16(MODBUS_CONSTS.MBAP_LEN, this.length - 6);
    this.header.setUint8(MODBUS_CONSTS.MBAP_UID, 1);
  }

  getPromise() {
    return this.deferred.promise();
  }

  reject(...args) {
    this.deferred.reject.apply(null, args);
    return this;
  }

  resolve(...args) {
    this.deferred.resolve.apply(null, args);
    return this;
  }

  setTimeout(to) {
    this.timeout = to;
    return this;
  }
}

export class ReadCoilsRequest extends ModbusRequest {
  body: DataView;
  start: number;
  count: number;

  constructor(id, start, count) {
    super(id, 12);
    this.start = start;
    this.count = count;

    // Init
    this.body = new DataView(this.packet, 7, 5);
    this.body.setUint8(MODBUS_CONSTS.BODY_FC, MODBUS_CONSTS.READ_COILS); 
    this.body.setUint16(MODBUS_CONSTS.BODY_START, this.start);
    this.body.setUint16(MODBUS_CONSTS.BODY_COUNT, this.count);
  }

  handleResponse(data, offset) {
    var mbap        = new DataView(data, offset, 7),
        pdu         = new DataView(data, offset + 7, 2),
        fc          = pdu.getUint8(0),
        byte_count  = pdu.getUint8(1);
        
    if (fc > 0x80) {
      this.reject({ errCode: 'serverError' });
      return 2;
    }
    
    var dv      = new DataView(data, offset + 9, byte_count),
        fc_data = [], i, t, j, mask,
        c       = this.count;

    for (i = 0; i < this.count; i += 1) {
      t = dv.getUint8(i);
      for (j = 0; j < 7; j += 1) {
        mask = 1 << j;
        if (mask !== 0) fc_data.push(t & mask);
        c -= 1;
        if (c === 0) break;
      }
    }
    
    this.resolve(fc_data, this);
    
    return byte_count + 2;
  }
}

export class ReadHoldingRegistersRequest extends ModbusRequest {
  body: DataView;
  start: number;
  count: number;

  constructor(id, start, count) {
    super(id, 12);
    this.start = start;
    this.count = count;

    // Init
    this.body = new DataView(this.packet, 7, 5);
    this.body.setUint8(MODBUS_CONSTS.BODY_FC, MODBUS_CONSTS.READ_HOLDING_REGISTERS);
    this.body.setUint16(MODBUS_CONSTS.BODY_START, this.start);
    this.body.setUint16(MODBUS_CONSTS.BODY_COUNT, this.count);
  }

  handleResponse(data, offset) {
    var mbap        = new DataView(data, offset, 7),
        pdu         = new DataView(data, offset + 7, 2),
        fc          = pdu.getUint8(0),
        byte_count  = pdu.getUint8(1);

    if (fc > 0x80) {
      this.reject({ errCode: 'serverError' });
      return 2;
    }

    var dv      = new DataView(data, offset + 7 + 2, byte_count),
        fc_data = [];

    for (var i = 0; i < byte_count / 2; i += 1) {
      fc_data.push(dv.getUint16(i * 2));
    }

    this.resolve(fc_data, this);
    return byte_count + 2;
  }
}

export class ReadInputRegistersRequest extends ModbusRequest {
  body: DataView;
  start: number;
  count: number;

  constructor(id, start, count) {
    super(id, 12);
    this.start = start;
    this.count = count;

    // Init
    this.body = new DataView(this.packet, 7, 5);
    this.body.setUint8(MODBUS_CONSTS.BODY_FC, MODBUS_CONSTS.READ_INPUT_REGISTERS); 
    this.body.setUint16(MODBUS_CONSTS.BODY_START, this.start);
    this.body.setUint16(MODBUS_CONSTS.BODY_COUNT, this.count);
  }

  handleResponse(data, offset) {
    var mbap        = new DataView(data, offset, 7),
        pdu         = new DataView(data, offset + 7, 2),
        fc          = pdu.getUint8(0),
        byte_count  = pdu.getUint8(1);

    if (fc > 0x80) {
      this.reject({ errCode: 'serverError' });
      return 2;
    }

    var dv      = new DataView(data, offset + 7 + 2, byte_count),
        fc_data = [];

    for (var i = 0; i < byte_count / 2; i += 1) {
      fc_data.push(dv.getUint16(i * 2));
    }

    this.resolve(fc_data, this);
    return byte_count + 2;
  }
}

export class WriteSingleCoilRequest extends ModbusRequest {
  body: DataView;
  address: number;
  value: number;

  constructor(id, address, value) {
    super(id, 12);
    this.address = address;
    this.value = value;

    // Init
    this.body = new DataView(this.packet, 7, 5);
    this.body.setUint8(MODBUS_CONSTS.BODY_FC, MODBUS_CONSTS.WRITE_SINGLE_COIL);
    this.body.setUint16(MODBUS_CONSTS.BODY_START, this.address);
    this.body.setUint16(MODBUS_CONSTS.BODY_COUNT, this.value ? 65280 : 0);
  }

  handleResponse(data, offset) {
    var mbap  = new DataView(data, offset, 7),
        pdu   = new DataView(data, offset + 7, 5),
        fc    = pdu.getUint8(0),
        start = pdu.getUint8(1),
        value = pdu.getUint16(3);

    if (fc > 0x80) {
      this.reject({ errCode: 'serverError' });
      return 2;
    }

    this.resolve(this);
    return 5;
  }
}

export class WriteSingleRegisterRequest extends ModbusRequest {
  body: DataView;
  address: number;
  value: number;
  
  constructor(id, address, value) {
    super(id, 12);
    this.address = address;
    this.value = value;

    // Init
    this.body = new DataView(this.packet, 7, 5);
    this.body.setUint8(MODBUS_CONSTS.BODY_FC, MODBUS_CONSTS.WRITE_SINGLE_REGISTER);
    this.body.setUint16(MODBUS_CONSTS.BODY_START, this.address);
    this.body.setUint16(MODBUS_CONSTS.BODY_COUNT, this.value);
  }

  handleResponse(data, offset) {
    var mbap  = new DataView(data, offset, 7),
        pdu   = new DataView(data, offset + 7, 5),
        fc    = pdu.getUint8(0),
        start = pdu.getUint16(1),
        value = pdu.getUint16(3);

    if (fc > 0x80) {
      this.reject({ errCode: 'serverError' });
      return 2;
    }

    this.resolve(this);
    return 5;
  }
}

export class WriteMultipleRegistersRequest extends ModbusRequest {
  body: DataView;
  address: number;
  values: number[];
  
  constructor(id, address, values) {
    super(id, 7 + 6 + (values.length * 2));
    this.address = address;
    this.values = values;

    // Init
    this.body = new DataView(this.packet, 7, 6 + (this.values.length * 2));
    this.body.setUint8(MODBUS_CONSTS.BODY_FC, MODBUS_CONSTS.WRITE_MULTIPLE_REGISTERS);
    this.body.setUint16(1, this.address);
    this.body.setUint16(3, this.values.length);
    this.body.setUint8(5, 2 * this.values.length);
    this.values.forEach(function (v, i) {
      this.body.setUint16(6 + (i * 2), v);
    }.bind(this));
  }

  handleResponse(data, offset) {
    var mbap  = new DataView(data, offset, 7),
        pdu   = new DataView(data, offset + 7, 5),
        fc    = pdu.getUint8(0),
        start = pdu.getUint16(1),
        quant = pdu.getUint16(3);

    if (fc > 0x80) {
      this.reject({ errCode: 'serverError' });
      return 2;
    }

    this.resolve(this);
    return 5;
  }
}

export class ModbusRequestManager extends StateMachine {
  queue = [];
  currentRequest;
  socketId;
  receiveBuffer = [];

  verbose: boolean = false;

  constructor(verbose: boolean = false) {
    super('ready');
    this.currentRequest = null;
    this.socketId = null;

    this.verbose = verbose;

    // Init
    window['chrome'].sockets.tcp.onReceive.addListener(this.receiveListener.bind(this));
    
    this.on('state_changed', function onStateChanged (oldState, newState) {
      if (newState === 'ready')
        this.send();
    }.bind(this));
  }

  receiveListener(info) {
    if (info.socketId !== this.socketId) return;
    if (this.inState('waiting')) {
      this.receiveBuffer.push(info);
      this.handleResponse();
    } else throw new Error('ModbusRequestManager - Received Packet while in state "waiting".');
  }

  handleResponse() {
    if (this.verbose) console.log('ModbusRequestManager', 'Trying to handle response.');
    if (this.receiveBuffer.length === null) return;

    var response  = this.receiveBuffer.shift(),
        data      = response.data;

    if (data.byteLength < 7) {
      if (this.verbose) console.log('ModbusRequestManager', 'Wrong packet size.', (data.byteLength));
      return;
    }

    // read the header
    var mbap = new DataView(data, 0, 7),
        tid  = mbap.getUint16(0);

    if (!this.currentRequest) {
      if (this.verbose) console.error('ModbusRequestManager', 'No current request, strange!!', this.currentRequest);
      return;
    }

    if (this.currentRequest.id !== tid) {
      if (this.verbose) console.error('ModbusRequestManager', 'CurrentRequest tid !== received tid', this.currentRequest.id, tid);
      return;
    }

    if (this.verbose) console.log('ModbusRequestManager', 'Request handled fine.');

    // cleartimeout
    clearTimeout(this.currentRequest.timeout); 

    // handle fc response
    this.currentRequest.handleResponse(data, 0);

    this.setState('ready');
  }

  send() {
    if (this.queue.length === 0) {
      if (this.verbose) console.log('ModbusRequestManager', 'Nothing in Queue.');
      return;
    }
    this.setState('sending');
    if (this.verbose) console.log('ModbusRequestManager', 'Trying to send packet.');
    this.currentRequest = this.queue.shift();

    // Before sending set the timeout for this request
    var timeout_no = setTimeout(function () {
        if (this.verbose) console.log('ModbusRequestManager', 'Timeout occured.');
        this.currentRequest.reject({ errCode: 'timeout' });
        this.fire('error', [{ errCode: 'timeout' }]);
    }.bind(this), 5000);
    this.currentRequest.setTimeout(timeout_no);
    if (this.verbose) console.log('ModbusRequestManager', 'Sending packet...');
    window['chrome'].sockets.tcp.send(this.socketId, this.currentRequest.packet, function (sendInfo) {
        if (sendInfo.resultCode < 0) {
            if (this.verbose) console.log('ModbusRequestManager', 'A error occured while sending packet.', sendInfo.resultCode);
            this.currentRequest.reject({ errCode: 'sendError' });
            this.setState('ready');
            return;
        }
        if (this.verbose) console.log('ModbusRequestManager', 'Packet send! Waiting for response.');
        this.setState('waiting');
    }.bind(this));
  }

  setSocketId(id) {
    this.socketId = id;
    return this;
  }

  sendPacket(packet) {
    if (this.verbose) console.log('ModbusRequestManager', 'Queing a new packet.');
    this.queue.push(packet);

    if (this.socketId === null) {
      throw new Error('ModbusRequestManager - No socketId provided.');
    }

    if (!this.inState('ready')) {
      return;
    }

    this.send();  

    return this;
  }

  clear() { 
    while (this.queue.length > 0) {
      this.queue.pop().reject({ 'errCode' : 'clientOffline' });
    }
    this.setState('ready');
  }

  flush() {
    if (this.verbose) console.log('ModbusRequestManager', 'Flush');
    if (this.socketId === null) return;
    this.send();
    return this;
  }
}

export class ModbusClient extends StateMachine {
  host: string = 'localhost';
  port: number = 502;
  id: number = 0;
  requestManager: ModbusRequestManager;
  isWaiting: boolean = false;
  isReconnecting: boolean = false;
  socketId: number;

  timeout: number = 5000;
  autoreconnect: boolean = false;
  verbose: boolean = false;
  
  constructor(timeout: number = 5000, autoreconnect: boolean = false, verbose: boolean = false) {
    super('init');
    this.timeout = timeout;
    this.autoreconnect = autoreconnect;
    this.verbose = verbose;
    this.requestManager = new ModbusRequestManager(verbose);

    // Init
    this.requestManager.on('error', function (err) {
      if (this.inState('offline')) return;

      this.fire('error', [err]);
      
      if (this.autoreconnect) this.reconnect();
      else this.disconnect();
    }.bind(this));

    // flush everything when going from error to online again
    this.on('state_changed', function (oldState, newState) {
      if (this.verbose) console.log('state changed', oldState, newState);
      this.fire(newState);
      if (oldState === 'error' && newState === 'online') this.requestManager.flush();
    }.bind(this));
    
    this.on('offline', function () {
      this.requestManager.clear();        
    }.bind(this));

    this.on('online', function () {
      this.isReconnecting = false;
    }.bind(this));

    this.on('error', function () {
      this.isReconnecting = false;
    }.bind(this));

    this.createSocket();
  }

  onReceiveError(info) {
    if (this.verbose) console.log('ModbusClient', 'Receive Error occured.', info, this.socketId);

    if (info.socketId !== this.socketId) return;

    this.setState('offline');
    this.fire('error', [{ errCode: 'ServerError', args: arguments }]);

    if (this.autoreconnect) {
      if (this.verbose) console.log('ModbusClient', 'AutoReconnect enabled, reconnecting.');
      this.reconnect();
      return;
    }

    if (this.verbose) console.log('ModbusClient', 'Disconnecting client.');

    this.close();
  }

  createSocket() {
    if (this.verbose) console.log('ModbusClient', 'Creating socket.');

    window['chrome'].sockets.tcp.onReceiveError.addListener(this.onReceiveError.bind(this));

    window['chrome'].sockets.tcp.create({}, function (createInfo) {
        if (this.verbose) console.log('ModbusClient', 'Socket created.', createInfo);
        this.socketId = createInfo.socketId;    
        this.requestManager.setSocketId(this.socketId);
        this.setState('offline');
        this.fire('ready');
    }.bind(this));
  }

  createNewId() {
    this.id = (this.id + 1) % 10000;
    return this.id;
  }

  sendPacket(req) {
    // invalid states for sending packages
    if (!this.inState('online')) return;
    this.requestManager.sendPacket(req);
  }

  isOnline() {
    return this.inState('online');
  }

  readCoils(start, count) {
    var request = new ReadCoilsRequest(this.createNewId(), start, count);

    if (!this.inState('online')) {
      request.reject({ errCode: 'offline' });
      return request.getPromise();
    }

    this.sendPacket(request);

    return request.getPromise();
  }

  readHoldingRegisters(start, count) {
    var request = new ReadHoldingRegistersRequest(this.createNewId(), start, count);

    if (!this.inState('online')) {
      request.reject({ errCode: 'offline' });
      return request.getPromise();
    }

    this.sendPacket(request);

    return request.getPromise();
  }

  readInputRegisters(start, count) {
    var request = new ReadInputRegistersRequest(this.createNewId(), start, count);

    if (!this.inState('online')) {
      request.reject({ errCode: 'offline' });
      return request.getPromise();
    }

    this.sendPacket(request);

    return request.getPromise();
  }

  writeSingleCoil(address, value) {
    var request = new WriteSingleCoilRequest(this.createNewId(), address, value);

    if (!this.inState('online')) {
      request.reject({ errCode: 'offline' });
      return request.getPromise();
    }

    this.sendPacket(request);

    return request.getPromise();
  }

  writeSingleRegister(address, value) {
    var request = new WriteSingleRegisterRequest(this.createNewId(), address, value);

    if (!this.inState('online')) {
      request.reject({ errCode: 'offline' });
      return request.getPromise();
    }

    this.sendPacket(request);

    return request.getPromise();
  }

  writeMultipleRegisters(address, values) {
    var request = new WriteMultipleRegistersRequest(this.createNewId(), address, values);

    if (!this.inState('online')) {
      request.reject({ errCode: 'offline' });
      return request.getPromise();
    }

    this.sendPacket(request);

    return request.getPromise();
  }

  connect() {
    if (this.inState('connecting') || this.inState('online')) return;

    this.setState('connecting');
    this.fire('busy', null);

    if (this.verbose) console.log('ModbusClient', 'Establishing connection.', this.socketId, this.host, this.port);

    window['chrome'].sockets.tcp.connect(this.socketId, this.host, this.port, function (result) {
      if (this.verbose) console.log('ModbusClient', 'Connect returned', arguments);

      if (result !== 0) {
        if (this.verbose) console.log('ModbusClient', 'Connection failed.', result);

        this.fire('error', [{
          errCode: 'connectionError',
          result: result
        }]);

        if (this.autoreconnect) {
          if (this.verbose) console.log('ModbusClient', 'Auto Reconnect enabled, trying to reconnect.');
          this.reconnect(5000);
        }

        return;
      }

      if (this.verbose) console.log('ModbusClient', 'Connection successfull.');

      this.setState('online');
    }.bind(this));

    return this;
  }

  setHost(h) {
    this.host = h;
    return this;
  }

  setPort(p) {
    this.port = p;
    return this;
  }

  getHost() {
    return this.host;
  }

  getPort() {
    return this.port;
  }

  disconnect(cb = null) {  
    if (this.inState('disconnecting')) return;

    this.setState('disconnecting');
    this.fire('busy', null);

    if (this.verbose) console.log('ModbusClient', 'Disconnecting client.');

    window['chrome'].sockets.tcp.disconnect(this.socketId, function () {
        if (this.verbose) console.log('ModbusClient', 'Client disconnected.');
        this.setState('offline');
        if (!cb) return;
        cb();
    }.bind(this));

    return this;
  }

  close(cb = null) {
    this.disconnect(function () {
        if (this.verbose) console.log('ModbusClient', 'Close socket.');
        window['chrome'].sockets.tcp.close(this.socketId, function () {
            if (this.verbose) console.log('ModbusClient', 'Client closed.');
            this.setState('init');
            this.socketId = null;
            if (!cb) return;
        }.bind(this));
    }.bind(this));
  }

  reconnect(wait = null) {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    this.fire('reconnecting', null);
    
    setTimeout(function () {
      if (this.inState('offline')) {
        if (this.verbose) console.log('ModbusClient', 'Client already disconnected.');
        this.connect();
        return;
      }
  
      window['chrome'].sockets.tcp.disconnect(this.socketId, function () {
          if (this.verbose) console.log('ModbusClient', 'Client disconnected.', arguments);
          this.setState('offline');
          this.connect();
      }.bind(this));
    }.bind(this), wait ? wait : 0);
  }


  /**
   * Extras
   */
  
  /* Float */
  getFloatFromHoldingRegister(start) {
    return this.readHoldingRegisters(start, 2).then(function (data) {
        return this.registerToFloat(data);
    }.bind(this));
  }
  setFloatInHoldingRegister(start, value) {
    var data : any[] = this.floatToRegister(value);
    alert(data);
    return this.writeMultipleRegisters(start, data);
  }
  registerToFloat(registers) {
    var highRegister = registers[1],
        lowRegister = registers[0],

        highRegisterBytes,
        lowRegisterBytes,
        
        floatBytes,
        
        buffer,
        view;
    
    // Get bytes from high register
    buffer = new ArrayBuffer(2);
    view = new DataView(buffer);
    view.setUint16(0, highRegister);
    highRegisterBytes = [view.getUint8(1), view.getUint8(0)];

    // Get bytes from low register
    buffer = new ArrayBuffer(2);
    view = new DataView(buffer);
    view.setUint16(0, lowRegister);
    lowRegisterBytes = [view.getUint8(1), view.getUint8(0)];

    // Get bytes from float
    floatBytes = [highRegisterBytes[1], highRegisterBytes[0], lowRegisterBytes[1], lowRegisterBytes[0]];
    buffer = new ArrayBuffer(4);
    view = new DataView(buffer);
    for (var i = 0; i < floatBytes.length; i++) {
        view.setUint8(i, floatBytes[i]);
    }
    
    return view.getFloat32(0);
  }
  floatToRegister(value) {
    var buffer  = new ArrayBuffer(4),
        view    = new DataView(buffer),
        
        highRegisterBytes,
        lowRegisterBytes,
        
        highRegister,
        lowRegister;

    // Get data from float
    view.setFloat32(0, value);
    highRegisterBytes   = [view.getUint8(0), view.getUint8(1)];
    lowRegisterBytes    = [view.getUint8(2), view.getUint8(3)];
    
    // Get data from high register
    buffer  = new ArrayBuffer(2);
    view    = new DataView(buffer);
    view.setUint8(0, highRegisterBytes[0]);
    view.setUint8(1, highRegisterBytes[1]);
    highRegister = view.getUint16(0);

    // Get data from low register
    buffer  = new ArrayBuffer(2);
    view    = new DataView(buffer);
    view.setUint8(0, lowRegisterBytes[0]);
    view.setUint8(1, lowRegisterBytes[1]);
    lowRegister = view.getUint16(0);
    
    return new Array(lowRegister, highRegister);
  }

  /* Integer */
  getIntFromHoldingRegister(start, count) {
    switch (count) {
        case 2:
            return this.readHoldingRegisters(start, 2).then(function (data) {
                return this.registerToUint32(data);
            }.bind(this));
            
        case 1:
            return this.readHoldingRegisters(start, 1).then(function (data) {
                return data[0];
            }.bind(this));
    }
  }
  setIntInHoldingRegister(start, count, value) {
    switch (count) {
        case 2:
            var data = this.uint32ToRegister(value);
            return this.writeMultipleRegisters(start, data);
            
        case 1:
            return this.writeMultipleRegisters(start, [ value ]);
    }
  }
  registerToUint32(registers) {
    var highRegister = registers[1],
        lowRegister = registers[0],

        highRegisterBytes,
        lowRegisterBytes,
        
        intBytes,
        
        buffer,
        view;

    // Get bytes from high register
    buffer = new ArrayBuffer(2);
    view = new DataView(buffer);
    view.setUint16(0, highRegister);
    highRegisterBytes = [view.getUint8(1), view.getUint8(0)];

    // Get bytes from low register
    buffer = new ArrayBuffer(2);
    view = new DataView(buffer);
    view.setUint16(0, lowRegister);
    lowRegisterBytes = [view.getUint8(1), view.getUint8(0)];

    // Get bytes from int
    intBytes = [highRegisterBytes[1], highRegisterBytes[0], lowRegisterBytes[1], lowRegisterBytes[0]];
    buffer = new ArrayBuffer(4);
    view = new DataView(buffer);
    for (var i = 0; i < intBytes.length; i++) {
        view.setUint8(i, intBytes[i]);
    }
    
    return view.getInt32(0);
  }
  uint32ToRegister(value) {
    var buffer  = new ArrayBuffer(4),
        view    = new DataView(buffer),
        
        highRegisterBytes,
        lowRegisterBytes,
        
        highRegister,
        lowRegister;

    // Get data from int
    view.setInt32(0, value);
    highRegisterBytes = [view.getUint8(0), view.getUint8(1)];
    lowRegisterBytes = [view.getUint8(2), view.getUint8(3)];
    
    // Get data from high register
    buffer  = new ArrayBuffer(2);
    view    = new DataView(buffer);
    view.setUint8(0, highRegisterBytes[0]);
    view.setUint8(1, highRegisterBytes[1]);
    highRegister = view.getUint16(0);

    // Get data from low register
    buffer  = new ArrayBuffer(2);
    view    = new DataView(buffer);
    view.setUint8(0, lowRegisterBytes[0]);
    view.setUint8(1, lowRegisterBytes[1]);
    lowRegister = view.getUint16(0);
    
    return [lowRegister, highRegister];
  }

  /* String */
  getStringFromHoldingRegister(start, count) {
    return this.readHoldingRegisters(start, count).then(function (data) {
        var string = this.registerToString(data);
        
        if (string.indexOf('\u0004') != -1) string = string.substr(0, string.indexOf('\u0004'));
        if (string.indexOf('\0') != -1) string = string.substr(0, string.indexOf('\0'));
        
        return string;
    }.bind(this));
  }

  setStringInHoldingRegister(start, value) {
    return this.writeMultipleRegisters(start, this.stringToRegister(value));
  }
  registerToString(registers) {
    var hexValue = '';
    
    for (var i = 0; i < registers.length; i++) {
        if (i > 0 && registers[i - 1] == 101) break;
        if (registers[i].toString(16).length == 4) hexValue += registers[i].toString(16).substr(2, 2) + registers[i].toString(16).substr(0, 2);
        else hexValue += registers[i].toString(16);
    }
    
    var s = this.hex2a(hexValue);
    
    return s;
  }
  stringToRegister(string: string) {
    var array: number[] = string.split('').map((s) => { return s.charCodeAt(0); });
    var returnarray: number[] = [];
    for (var i = 0; i < string.length / 2 + string.length % 2; i++) returnarray.push(0);
    
    for (var i = 0; i < returnarray.length; i++) {
      returnarray[i] = array[i * 2];
      if (i * 2 + 1 < array.length) {
        returnarray[i] = (returnarray[i] | (array[i * 2 + 1] << 8));
      }
    }
    return returnarray;
  }

  /* Date */
  getDateFromHoldingRegister(start) {
    return this.readHoldingRegisters(start, 2).then(function (data) {
        var startDate = new Date(1970, 0, 1, 0, 0, 0),
            highRegister = data[1],
            lowRegister = data[0],
            highRegisterBytes = this.toByteArray(highRegister),
            lowRegisterBytes = this.toByteArray(lowRegister),
            intBytes = [highRegisterBytes[1], highRegisterBytes[0], lowRegisterBytes[1], lowRegisterBytes[0]],
            buf = new ArrayBuffer(4),
            view = new DataView(buf);
        
        for (var i = 0; i < intBytes.length; i++) {
            view.setUint8(i, intBytes[i]);
        }
        
        return new Date(startDate.getTime() + (view.getInt32(0) * 1000));
    });
  }

  /* Diffusion program */
  getDiffusionProgramFromHoldingRegister(start): UPCDiffCo2Program {
    return this.readHoldingRegisters(start, 6).then(function (data) {
      return new UPCDiffCo2Program(
        this.registerToUint32([data[0], data[1]]),  // Start
        this.registerToUint32([data[2], data[3]]),  // Stop
        data[4],                                    // Mode
        data[5]                                     // Intensity
      );
    }.bind(this));
  }
  setDiffusionProgramInHoldingRegister(start, value: UPCDiffCo2Program) {
    var startTimeData = this.uint32ToRegister(value.start),
        endTimeData = this.uint32ToRegister(value.stop),
        data = [
            startTimeData[0], startTimeData[1],
            endTimeData[0], endTimeData[1],
            value.mode,
            value.intensity
        ];
    
    return this.writeMultipleRegisters(start, data);
  }
  getDiffusionSunFromHoldingRegister(start): UPCDiffCo2Sun {
    return this.readHoldingRegisters(start, 6).then(function (data) {
      return new UPCDiffCo2Sun(
        this.registerToUint32([data[0], data[1]]),  // Offset
        this.registerToUint32([data[2], data[3]]),  // Duration
        data[5],                                    // Intensity
        data[4]                                     // Mode
      );
    }.bind(this));
  }
  setDiffusionSunInHoldingRegister(start, value: UPCDiffCo2Sun) {
    var startTimeData = this.uint32ToRegister(value.offset),
        endTimeData = this.uint32ToRegister(value.duration),
        data = [
            startTimeData[0], startTimeData[1],
            endTimeData[0], endTimeData[1],
            value.mode,
            value.intensity
        ];
    
    return this.writeMultipleRegisters(start, data);
  }


  private hex2a(hexx) {
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }
}

export class UPCDiffCo2Program {
  start:      number = 0;
  stop:       number = 0;
  mode:       number = 0;
  intensity:  number = 0;

  constructor(start: number = 0, stop: number = 0, mode: number = 0, intensity: number = 0) {
    this.start = start;
    this.stop = stop;
    this.mode = mode;
    this.intensity = intensity;
  }

  getDailyConsumption(beltRefConsumption) {
    return Math.round((beltRefConsumption * ((this.stop - this.start) / 3600) * this.intensity / 10) * 100) / 100;
  }

  getMonthlyConsumption(beltRefConsumption) {
    if (this.mode >= 0 && this.mode <= 6) return this.getDailyConsumption(beltRefConsumption) * 4;
    else if (this.mode == 7) return this.getDailyConsumption(beltRefConsumption) * 7 * 4;
    else if (this.mode == 8) return this.getDailyConsumption(beltRefConsumption) * 2 * 4;
    else if (this.mode == 8) return this.getDailyConsumption(beltRefConsumption) * 5 * 4;
  }
}

export class UPCDiffCo2Sun {
  offset:     number = 0;
  duration:   number = 0;
  intensity:  number = 0;

  mode: number = 0;

  constructor(offset: number = 0, duration: number = 0, intensity: number = 0, mode: number = 0) {
    this.offset = offset;
    this.duration = duration;
    this.intensity = intensity;
    this.mode = mode;
  }

  getDailyConsumption(beltRefConsumption) {
    return Math.round((beltRefConsumption * (this.duration / 3600) * this.intensity / 10) * 100) / 100;
  }

  getMonthlyConsumption(beltRefConsumption) {
    return this.getDailyConsumption(beltRefConsumption) * 7 * 4;
  }
}
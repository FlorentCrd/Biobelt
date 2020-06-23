import { Component,NgZone ,OnInit } from '@angular/core';
import { AlertController, Platform, LoadingController } from '@ionic/angular';
import { Network } from '@ionic-native/network';
import { Http } from '@angular/http';
import { UPC } from '../models/upc';
import {ModbusClient} from '../models/modbus';
@Component({
  selector: 'app-remplissage',
  templateUrl: './remplissage.page.html',
  styleUrls: ['./remplissage.page.scss'],
})
export class RemplissagePage implements OnInit {
  refillInterventionDatetime:string;
  refillReserve:string;
  refillTotalConsumed:number;
  refillTotalAdded:number;
  refillReplaceAll: boolean;
  refillRealAdded:number;
  private upc: UPC;

  constructor(private platform: Platform, private ngZone: NgZone,private modbus:ModbusClient) { }

  ngOnInit() {
    // Init UPC
    this.platform.ready().then(
      readySource => {
        if (readySource == 'cordova') {
          this.upc = new UPC(state => {
            this.ngZone.run(() => {
              // Force refresh UI
            });
          });

          Network.onConnect().subscribe(() => {
            if (Network.type === Network.Connection.WIFI) {
              this.upc.reconnect();
            }
          });
        }
      }
    );
  }

  refill() {
    this.upc.client.setFloatInHoldingRegister(40384,this.modbus.floatToRegister(this.refillRealAdded/0.001974));
  }

}

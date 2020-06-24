import { Component,NgZone ,OnInit } from '@angular/core';
import { AlertController, Platform, LoadingController } from '@ionic/angular';
import { Network } from '@ionic-native/network';
import { Http } from '@angular/http';
import { UPC } from '../models/upc';

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
  start9:string;
  private upc: UPC;

  constructor(private platform: Platform, private ngZone: NgZone) { }

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
    //alert(this.upc.client.floatToRegister(this.refillRealAdded/0.001974));
   
    if (this.refillReserve === "1"){
      this.upc.client.setFloatInHoldingRegister(40157,this.refillRealAdded/0.001974);
      alert("Remplissage sur B1 effectué !")
    }
    if(this.refillReserve === "2"){
      this.upc.client.setFloatInHoldingRegister(40165,this.refillRealAdded/0.001974); 
      alert("Remplissage sur B2 effectué !");
    }
    //this.upc.client.setIntInHoldingRegister(40120,2,(new Date(this.start9).getHours()*3600)+(new Date(this.start9).getMinutes()*60)); 
  }

}

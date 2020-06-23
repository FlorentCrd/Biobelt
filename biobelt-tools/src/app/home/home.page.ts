import { Component, NgZone } from '@angular/core';
import { AlertController, Platform, LoadingController } from '@ionic/angular';
import { Http } from '@angular/http';
import { Network } from '@ionic-native/network';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

import { UPC } from '../models/upc';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private upc: UPC;

  get connected(): boolean {
    return this.upc && this.upc.state === 1;
  }

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    public http: Http,
    private platform: Platform,
    private ngZone: NgZone,
    private emailComposer: EmailComposer
  ) {

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

  public async flash() {
    const alert = await this.alertController.create({
      header: 'Flash Firmware',
      message: 'Are you sure?',
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'secondary' },
        {
          text: 'Okay',
          handler: () => {

            // Load file
            this.http.request('/assets/firmwares/UPCapp2_v0255.srec').subscribe(
              async res => {
              
                // Show loading
                const loading = await this.loadingController.create({ message: 'Updating firmware' });
                await loading.present();

                // Flash UPC
                try {
                  await this.upc.flashFW(res.text(), loading);
                } catch {

                  // Show error
                  const alert = await this.alertController.create({
                    header: 'Error',
                    message: 'Firmware update failed',
                    buttons: ['OK']
                  });
                  await alert.present();

                } finally {
                  await loading.dismiss();
                }

              },
              err => console.log (err)
            );

          }
        }
      ]
    });
    await alert.present();
  }

  public async download() {
    const alert = await this.alertController.create({
      header: 'Download data',
      message: 'Are you sure?',
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'secondary' },
        {
          text: 'Okay',
          handler: async () => {

            // Show loading
            const loading = await this.loadingController.create({ message: 'Downloading data' });
            await loading.present();

            // Get all vars
            try {
              var vars: any = await this.upc.getAllVars();

              // Send email
              this.emailComposer.open({
                to: 'gerard.benbassat@hbmdistribution.com',
                cc: 'simon.wolkiewiez@hbmdistribution.com',
                bcc: null,
                attachments: null,
                subject: 'UPC Vars',
                body: JSON.stringify(vars, null, 2),
                isHtml: false
              });
            } catch {

              // Show error
              const alert = await this.alertController.create({
                header: 'Error',
                message: 'Data download failed',
                buttons: ['OK']
              });
              await alert.present();

            } finally {
              await loading.dismiss();
            }

          }
        }
      ]
    });
    await alert.present();
  }

  public async reset() {
    const alert = await this.alertController.create({
      header: 'Reset UPC',
      message: 'Are you sure?',
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'secondary' },
        {
          text: 'Okay',
          handler: async () => {
            
            // Show loading
            const loading = await this.loadingController.create({ message: 'UPC reset' });
            await loading.present();

            // Reset
            try {
              await this.upc.reset();
            } catch {

              // Show error
              const alert = await this.alertController.create({
                header: 'Error',
                message: 'UPC reset failed',
                buttons: ['OK']
              });
              await alert.present();
              
            } finally {
              await loading.dismiss();
            }

          }
        }
      ]
    });
    await alert.present();
  }

  public async wipe() {
    const alert = await this.alertController.create({
      header: 'Wipe UPC',
      message: 'Are you sure?',
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'secondary' },
        {
          text: 'Okay',
          handler: async () => {
            
            // Show loading
            const loading = await this.loadingController.create({ message: 'UPC wipe' });
            await loading.present();

            // Wipe
            try {
              await this.upc.wipe();
            } catch {

              // Show error
              const alert = await this.alertController.create({
                header: 'Error',
                message: 'UPC wipe failed',
                buttons: ['OK']
              });
              await alert.present();
              
            } finally {
              await loading.dismiss();
            }

          }
        }
      ]
    });
    await alert.present();
  }

}

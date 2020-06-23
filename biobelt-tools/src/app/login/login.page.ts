import { Component, OnInit, ViewChild } from '@angular/core';
import {Upcv3serviceService} from '../api/upcv3service.service';
import { ToastController, NavController, LoadingController } from '@ionic/angular';
import {User} from '../models/user';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('email') email: any;
  private username: string;
  private password: string;
  private isLog = false;

  constructor(
    private upc3serv:Upcv3serviceService,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private storage : Storage

  ) { }
  async ngOnInit() {
    setTimeout(() => {
      this.email.setFocus();
    }, 500);
    await this.storage.get('user').then(val => this.username = val);
    await this.storage.get('pass').then(val => this.password = val);
    await this.storage.get('remember').then(async res=>{
      if (res === 1){
        const loading = await this.loadingCtrl.create({
          message: 'Connexion en cours...'
        });
        loading.present();
        let user = new User();
        user.username = this.username;
        user.password = this.password;
        this.upc3serv.login(user).subscribe(async res=>{
          loading.dismiss();
          if(res.result){this.navCtrl.navigateRoot('home')}
          else {
            // Check code
            switch (res.code) {
              case 'TOKEN_WRONG_IDENTIFIERS':
                let toast = await this.toastCtrl.create({
                  message: 'Identifiants incorrects !',
                  duration: 3000,
                  position: 'top'
                });
                toast.present();
                break;
            }
          }
        },
        async err => {
          // Hide loading
          loading.dismiss();

          let toast = await this.toastCtrl.create({
            message: 'Impossible de se connecter à internet !',
            duration: 3000,
            position: 'top'
          });
          toast.present()
        })
      }
      else {
        this.isLog = true;
      }
    });
  }
  
  
  async login() {
    // Show loading
    const loading = await this.loadingCtrl.create({
      message: 'Connexion en cours...'
    });
    loading.present();
   
    // Request
    let user :User = new User();
    user.username = this.username;
    user.password = this.password;
    this.upc3serv.login(user).subscribe(
        async data => {
          // Hide loading
          loading.dismiss();

          // Check state
          if (data.result) {
            this.storage.set('token',data.result);
            this.storage.set('user',user.username);
            this.storage.set('pass',user.password);
            this.storage.set('remember',1);
            this.navCtrl.navigateRoot('home'); 
          
          } else {
            // Check code
            switch (data.code) {
              case 'TOKEN_WRONG_IDENTIFIERS':
                let toast = await this.toastCtrl.create({
                  message: 'Identifiants incorrects !',
                  duration: 3000,
                  position: 'top'
                });
                toast.present();
                break;
            }
          }
        },
        async err => {
          // Hide loading
          loading.dismiss();

          let toast = await this.toastCtrl.create({
            message: 'Impossible de se connecter à internet !',
            duration: 3000,
            position: 'top'
          });
          toast.present()
        }
    );
  }

}

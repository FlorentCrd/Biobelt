import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'firmware',
      url: '/home',
      icon: 'cloud-download'
    },
    {
      title: 'remplissage ',
      url: '/remplissage',
      icon: 'list'
    },
    
    {
      title: 'Accueil',
      url: '/Accueil',
      icon: 'home'
    },
    {
      title:'programmes',
      url: '/programmes',
      icon : 'clock'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}

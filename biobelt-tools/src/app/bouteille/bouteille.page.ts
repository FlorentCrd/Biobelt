import { Component, OnInit, NgZone} from '@angular/core';
import {Upcv3serviceService} from '../api/upcv3service.service';
import { Storage } from '@ionic/storage';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ToastController, NavController, LoadingController, Platform } from '@ionic/angular';
import {GlobalService} from '../api/global.service';
import { Site } from '../models/site';
import { Code } from '../api/ApiResponse';
import { Router } from '@angular/router';
import { UPC } from '../models/upc';
import { Network } from '@ionic-native/network';



@Component({
  selector: 'app-bouteille',
  templateUrl: './bouteille.page.html',
  styleUrls: ['./bouteille.page.scss'],
})
export class BouteillePage implements OnInit {
  token:string;
  refillTotalAdded:number;
  refillTotalAdded2:number;
  listBottles:any;
  sites:Site;
  refillReserve:string;
  refillRealAdded:number;
  refillRealAdded2:number;
  private upc: UPC;
  isNotScanned=true;
  booleanB1=false;
  booleanB2=false;
  bottle = {
    name : '',
    designation : [],
    brand : [],
    barcodes: [],
    bottleType: [],
    stock: '',
    date: new Date().toISOString().substring(0, 10)
  }
  constructor(private upc3service:Upcv3serviceService,
              private storage:Storage,
              private global:GlobalService,
              private barcode:BarcodeScanner,
              private router:Router,
              private loadingctrl:LoadingController,
              private platform: Platform, 
              private ngZone: NgZone) {

                
               }

  async ngOnInit() {
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
    await this.storage.get("bottleType").then(val=>{
        if (val !== null){
          this.listBottles = JSON.parse(val);
        }
    });
    await this.storage.get('token').then(val => this.token = val);
    await this.upc3service.getAllBottles(this.token).subscribe(res=>{
        this.listBottles = res.result;
        this.storage.set("bottleType",JSON.stringify(res.result));
    },
    async err =>{
      await this.storage.get("bottleType").then(val=>{
        if (val !== null){
          this.listBottles = JSON.parse(val);
        }
    });
    });
    this.sites = this.global.site;
    if(this.global.site.stockClient !== null){
      this.bottle.stock = this.global.site.stockClient;
      
    }
    this.bottle.name = this.global.site.name;
    
    /*await this.upc3service.getSites(this.token).subscribe(res =>{
      switch(res.code){
        case Code.SITE_RECOVERED :
         
          res.result.forEach(json=> {
            if (json.id === this.global.upc3.upcNameId){
              this.sites = json;
              alert(JSON.stringify(json));
              this.bottle.name = json.name;
              if (json.stockClient !== null){
                this.bottle.stock = json.stockClient;
                alert(json.stockClient);
              }
            }
          })
          break;
        case Code.UNAUTHORIZED :
          alert("Erreur, vous n'êtes pas autorisé à utiliser l'application mobile !")
          break;
      }
    })*/
    
  }
  onScanBarCodeB1(){
    this.barcode.scan().then(res =>{
      var marque:string;
      var designationMesser = 0;
      if (/^\d+$/.test(res["text"])){
        marque = "Messer";
        designationMesser = 37.5;
      }
      else {
        marque = "Air liquide";
        
      }
      if(this.global.B1.length > 0){
        this.global.B1.forEach(item=>{
          if (item['barcode'] === res['text']){
            this.isNotScanned = false;
          }
        });
      }
      if(this.global.B2.length > 0){
        this.global.B2.forEach(item=>{
          if (item['barcode'] === res["text"]){
            this.isNotScanned = false;
          }
        });
      }
      
      if (res['text'] !== "" && this.isNotScanned){
        if (designationMesser === 37.5){
          this.global.B1.push({'barcode':res['text'],'marque':marque,'designation':designationMesser});
          this.global.designationB1.push(designationMesser);
        }
        else {
          this.global.B1.push({'barcode':res['text'],'marque':marque,'designation':0});
          this.global.designationB1.push(0);
        }
        
      }
      else if (!this.isNotScanned){
        alert("La bouteille a déjà été scanner !");
      }
      this.isNotScanned = true;
    })
    .catch(err=>{
      alert(JSON.stringify(err));
    });
    
  }
  onScanBarCodeB2(){
    this.barcode.scan().then(res =>{
      var marque:string;
      var designationMesser:number=0;
      if (/^\d+$/.test(res["text"])){
        marque = "Messer";
        designationMesser = 37.5;
      }
      else {
        marque = "Air liquide";
      }
      if(this.global.B1.length > 0){
        this.global.B1.forEach(item=>{
          if (item['barcode'] === res['text']){
            this.isNotScanned = false;
          }
        });
      }
      if(this.global.B2.length > 0){
        this.global.B2.forEach(item=>{
          if (item['barcode'] === res["text"]){
            this.isNotScanned = false;
          }
        });
      }
      
      if (res['text'] !== "" && this.isNotScanned){
          if (designationMesser === 37.5){
            this.global.B2.push({'barcode':res['text'],'marque':marque,'designation':designationMesser});
            this.global.designationB2.push(designationMesser);
          }
          else {
            this.global.B2.push({'barcode':res['text'],'marque':marque,'designation':0});
            this.global.designationB2.push(0);
          }
          
          
      }
      else if(!this.isNotScanned){
        alert("La bouteille a déjà été scanner !");
      }
      this.isNotScanned = true;
    })
    .catch(err=>{
      alert(JSON.stringify(err));
    });
  }
  setDesignationB1(i,$event){
    
    this.global.designationB1[i] = $event.target.value;
    
    //this.global.B1[i].designation = this.global.B1[i].designation;
     
  }
  setDesignationB2(i,$event){
    this.global.designationB2[i] = $event.target.value;
    
    //this.global.B2[i].designation = this.global.B2[i].designation;
  }
  deleteB1() {
    this.global.B1 = [];
    this.global.designationB1 = [];
  }
  deleteB2(){
    this.global.B2 = [];
    this.global.designationB2 = [];
  }
  addBottleId(){
    for(var i =0;i<Object.keys(this.global.B1).length;i++){
      for(var j =0;j<Object.keys(this.listBottles).length;j++){
        
        if(this.listBottles[j].brand === this.global.B1[i].marque && this.listBottles[j].designation == this.global.designationB1[i]){
          this.bottle.bottleType.push(this.listBottles[j].id);
          
          break;
        } 
      }
    }
    for(var i =0;i<Object.keys(this.global.B2).length;i++){
      for(var j =0;j<Object.keys(this.listBottles).length;j++){
        
        if(this.listBottles[j].brand === this.global.B2[i].marque && this.listBottles[j].designation == this.global.designationB2[i]){
          this.bottle.bottleType.push(this.listBottles[j].id);
          break;
        }
      }
    }
    
  }
  async addToBelt(){
    if(this.global.B1.length > 0 || this.global.B2.length > 0){
        var loading = await this.loadingctrl.create({
          message : "Ajout des bouteilles en cours..."
        })
        loading.present();
        this.global.B1.forEach(item=>{
          this.bottle.brand.push(item.marque);
          this.bottle.barcodes.push(item.barcode);
          this.global.InterventionV3.bouteillesB1Barcode += ","+item.barcode;
          this.global.InterventionV3.bouteillesB1Dates += ",1";
        });
        this.global.InterventionV3.bouteillesB1Barcode = this.global.InterventionV3.bouteillesB1Barcode.substr(1);
        this.global.InterventionV3.bouteillesB1Dates = this.global.InterventionV3.bouteillesB1Dates.substr(1);
        this.global.designationB1.forEach(item=>{
          this.bottle.designation.push(item);
          this.global.InterventionV3.bouteillesB1 += ','+item;
        });
        this.global.InterventionV3.bouteillesB1 = this.global.InterventionV3.bouteillesB1.substr(1);
        this.global.B2.forEach(item=>{
          this.bottle.brand.push(item.marque);
          this.bottle.barcodes.push(item.barcode);
          this.global.InterventionV3.bouteillesB2Barcode += ","+item.barcode;
          this.global.InterventionV3.bouteillesB2Dates += ",1";
        });
        this.global.InterventionV3.bouteillesB2Barcode = this.global.InterventionV3.bouteillesB2Barcode.substr(1);
        this.global.InterventionV3.bouteillesB2Dates = this.global.InterventionV3.bouteillesB2Dates.substr(1);
        this.global.designationB2.forEach(item=>{
          this.bottle.designation.push(item);
          this.global.InterventionV3.bouteillesB2 += ","+item;
        })
        this.global.InterventionV3.bouteillesB2 = this.global.InterventionV3.bouteillesB2.substr(1);
        this.addBottleId();
        
        this.upc3service.addToStock(this.bottle,this.token).subscribe(res=>{
          if (res.code === Code.BOTTLE_CREATED){
            
            loading.dismiss();
            this.global.B1 = [];
            this.global.B2 = [];
            this.global.designationB1 = [];
            this.global.designationB2 = [];
            this.global.InterventionV3.datetime = (new Date()).toISOString().substr(0,19);
            this.global.InterventionV3.operateur = this.global.op;
            this.global.InterventionV3.ceinture = this.global.upc3.id;
            this.global.InterventionV3.objet = "Remise en service de la ceinture "+this.global.upc3.upcNameId;
            this.upc3service.createInter(this.global.InterventionV3,this.token).subscribe(res=>{
      
              switch(res.code){
                case Code.INTERVENTIONV3_CREATED :
                  this.global.inter = res.result;
                  this.router.navigate(["removebottle"]);
                   
                  break;
                case Code.UNAUTHORIZED :
                  alert("Vous ne pouvez pas utiliser l'application mobile !")  
              }
            })
            
          }
          else {
            loading.dismiss();
            alert('Erreur lors du rajout de la bouteille chez le client !');
          }
        },
        err =>{
          this.storage.set("addBottles",JSON.stringify(this.bottle));
          loading.dismiss();
          this.global.B1 = [];
          this.global.B2 = [];
          this.global.designationB1 = [];
          this.global.designationB2 = [];
          this.global.InterventionV3.datetime = (new Date()).toISOString().substr(0,19);
          this.global.InterventionV3.operateur = this.global.op;
          this.global.InterventionV3.ceinture = this.global.upc3.id;
          this.global.InterventionV3.objet = "Remise en service de la ceinture "+this.global.upc3.upcNameId;
          this.router.navigate(["home"]);
        })
    }
    else {
      alert("Veuillez scanner des bouteilles pour en ajouter !");
    }
    

  }
  async refill() {
    //alert(this.upc.client.floatToRegister(this.refillRealAdded/0.001974));
    const loading = await this.loadingctrl.create({ message: 'Remplissage en cours' });
    await loading.present();
    if (this.refillTotalAdded > 0){
      this.upc.client.setFloatInHoldingRegister(40157,this.refillRealAdded/0.001974);
      //alert("Remplissage sur B1 effectué !")
    }
    if(this.refillTotalAdded2 > 0){
      this.upc.client.setFloatInHoldingRegister(40165,this.refillRealAdded2/0.001974); 
      //alert("Remplissage sur B2 effectué !");
    }
   

    var addressage = 41120;
    
    for( var i =0 ; i<this.global.B1.length;i++){
      
      
      this.upc.client.setStringInHoldingRegister(addressage,this.global.B1[i]['barcode'].substr(0,8)).then(
        res=>{
          this.booleanB1 = true;
        }
      ).catch(error=>{
        alert(JSON.stringify(error));
      });
      addressage += 10;
    }

    var addressage = 41170;
    for( var i =0 ; i<this.global.B2.length;i++){
      if(this.global.B2['barcode'].length === 7){
        this.global.B2['barcode'] += "   ";
      }
      this.upc.client.setStringInHoldingRegister(addressage,this.global.B2['barcode']).then(
        res=>{
          this.booleanB2 = true;
        }
      );
      addressage += 10;
    }
    setInterval(()=> {
      if(this.booleanB1 && this.booleanB2){
        loading.dismiss();
      }
    },500);
    
    
    
    //this.upc.client.setIntInHoldingRegister(40120,2,(new Date(this.start9).getHours()*3600)+(new Date(this.start9).getMinutes()*60));
    //this.router.navigate(["move-bouteille"]); 

    

  }

  readRegisterBottles (){
    this.upc.client.readHoldingRegisters(41120,98).then(res=>{
      alert(this.upc.client.registerToString(res));
    })
  }
  
  onContinue(){
    this.global.B1 = [];
        this.global.B2 = [];
        this.global.designationB1 = [];
        this.global.designationB2 = [];
        this.router.navigate(["removebottle"]);
  }
}

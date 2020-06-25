import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {User} from '../models/user';
import {UPCV3} from '../models/upcv3/upcv3';
import {ApiResponse, Code} from './ApiResponse';
import { Storage } from '@ionic/storage';
import {AuthResponse} from './AuthResponse';
import { Operator } from '../models/operator';
import { environment } from 'src/environments/environment';
import {Router} from '@angular/router';
import {BottleType} from '../models/bottleType';
import { Site } from '../models/site';
import {Project} from '../models/project/project';
import { Version } from '../models/project/version';

@Injectable({
  providedIn: 'root'
})
export class Upcv3serviceService {
  private apiUrl = 'http://api.biobelt.com/';
  
  constructor(private http:HttpClient,
              private storage:Storage) { }

  public getUPC3(token): Observable<ApiResponse<UPCV3[]>>{
    
    
    
    let headers = new HttpHeaders().set('Content-Type','application/json')
                                   .set('authorization','Bearer '+token) 
    return this.http.get<ApiResponse<UPCV3[]>>(this.apiUrl+'upcv3/all',{headers : headers}).pipe(map(
      res=>{
        switch (res.code) {

          case Code.UPCV3_RECOVERED:
          var upcv3: UPCV3[] = [];
          var i = 0;
          res.result.forEach(jsonUPCV3 =>{if(UPCV3.loadFromJSON(jsonUPCV3).upcStatusString === 'DIS'){ upcv3.push(UPCV3.loadFromJSON(jsonUPCV3)); } });
          //res.result = upcv3;
          break;

          case Code.UNAUTHORIZED:
          alert("Vous n'êtes pas autorisé à utiliser l'application mobile !");
          break;

        }

      return res;
      }
    ))
  }
 
  public login(user:User) : Observable<AuthResponse>{
    //this.apiUrl = "http://localhost:8080/";
    return this.http.post<AuthResponse>(this.apiUrl+'user/login',user).pipe(map(
      res =>{
        switch (res.code){
          case Code.TOKEN_LOGGED_IN :
            this.storage.set('token',res.result.toString());
            this.storage.set('refreshToken',res.refreshToken.toString());
            break;
          case Code.TOKEN_WRONG_IDENTIFIERS:
            alert('Identifiants invalides !');
            break;
          case Code. WRONG_PARAMS:
            alert("Fatal Error !");   
        }
        return res;
      }
    ))
  }
  public getOperators(token):Observable<ApiResponse<Operator[]>>{
    let headers = new HttpHeaders().set('Content-Type','application/json')
                                   .set('authorization','Bearer '+token)
    return this.http.get<ApiResponse<Operator[]>>(this.apiUrl+'operator/all',{headers:headers}).pipe(map(
      res =>{
        switch (res.code) {
          
          case Code.OPERATOR_RECOVERED:
          var operators: Operator[] = [];
          res.result.forEach(jsonOperator => operators.push(Operator.loadFromJSON(jsonOperator)));
          res.result = operators;
          break;

          case Code.UNAUTHORIZED:
          alert("Opération non autorisée !");
          break;

        }

        return res;
      }
    ))
  }

  public editTrap(id,nbpieges,token){
    let headers = new HttpHeaders().set('Content-Type','application/json')
                                   .set('authorization','Bearer '+token)
    return this.http.post(this.apiUrl+'upcv3/'+id+'/editTrapNumber?nbpieges='+nbpieges,{},{headers:headers}).pipe(map(
      res =>{
        return res;
      }
    ))
  }
  public getAllBottles(token) : Observable<ApiResponse<BottleType[]>>{
    let headers = new HttpHeaders().set('Content-Type','application/json')
    .set('authorization','Bearer '+token)
    return this.http.get<ApiResponse<BottleType[]>>(this.apiUrl+'bottleType/all',{headers:headers}).pipe(map(
      res =>{
        return res;
      }
    ))
  }
  public getSites(token) : Observable<ApiResponse<Site[]>>{
    let headers = new HttpHeaders().set('Content-Type','application/json')
    .set('authorization','Bearer '+token)
    return this.http.get<ApiResponse<Site[]>>(this.apiUrl+'site/all',{headers:headers}).pipe(map(
      res =>{
        switch(res.code){
          case Code.SITE_RECOVERED :
            var sites = [];
            res.result.forEach(json=>sites.push(Site.loadFromJSON(json)));
            
            break;
          case Code.SITE_DOESNT_EXSIST :
            alert("Le Site n'existe pas");
            break;
          case Code.UNAUTHORIZED :
            alert("Vous n'êtes pas autorisé à accèder à ce service");
            break;
        }
        return res;
      }
    ))
  }
  public addToStock(form,token) : Observable<ApiResponse<any>>{
    let headers = new HttpHeaders().set('Content-Type','application/json')
    .set('authorization','Bearer '+token)
    return this.http.post<ApiResponse<any>>(this.apiUrl+ 'bottle/addBottlesToBelt',form,{headers:headers}).pipe(map(res =>{
      switch (res.code) {

        case Code.BOTTLE_CREATED:
        alert('Bouteilles ajoutés au stocks client !');  
        break;

        case Code.INTERNAL_ERROR:
        case Code.WRONG_PARAMS:
        alert('Erreur Mauvais Paramètres !');
        break;

        case Code.BOTTLE_TYPE_DOESNT_EXSIST:
        alert("La bouteille n'existe pas dans la base de données"); 
        break;

        case Code.STOCK_DOESNT_EXSIST:
        alert('Le stock est inexistant !');
        break;

        case Code.UNAUTHORIZED:
        alert("Vous n'êtes pas autorisé à utiliser l'application mobile !");
        break;
      
      }

      return res;
    }))
  }
  public downloadCustomPicture(id: string,token:string): Observable<any> {
    let headers = new HttpHeaders().set('accept','*').set('authorization','Bearer '+token);
    
    return this.http.get(this.apiUrl + 'project/'+id+'/download', { headers: headers, responseType: 'arraybuffer' })
  }
  public getProject(token){
    let headers = new HttpHeaders().set('Content-Type','application/json')
    .set('authorization','Bearer '+token);
    
    return this.http.get<ApiResponse<Project[]>>(this.apiUrl+'project/all',{headers:headers}).pipe(map(res=>{
      switch (res.code){
        case Code.PROJECT_RECOVERED :
            
            break;
        case Code.PROJECT_DOESNT_EXSIST :
          alert("Projet Inexistant !");
          break;
        case Code.UNAUTHORIZED :
          alert("Vous n'êtes pas autorisé à utiliser l'appli mobile !");
          break;      
      }
      return res;
    }))
  }
  public getVersion(id,token){
    let headers = new HttpHeaders().set('Content-Type','application/json')
    .set('authorization','Bearer '+token);

    return this.http.get<ApiResponse<Version>>(this.apiUrl+'project/install/'+id,{headers:headers}).pipe(map(res=>{
      switch(res.code){
        case Code.VERSION_RECOVERED :
          break;
        case Code.VERSION_DOESNT_EXSIST :
          alert("La ceinture n'existe pas !");
          break;
        case Code.UNAUTHORIZED :
          alert("Vous n'êtes pas autorisé à utiliser l'application !");
          break;
          
          
      }
      return res;
    }))
  }

  public addToDeStock(json,token): Observable<ApiResponse<any>>{
    let headers = new HttpHeaders().set('Content-Type','application/json')
    .set('authorization','Bearer '+token);

    return this.http.post<ApiResponse<any>>(this.apiUrl+"bottle/deleteFromStockClient",json,{headers:headers}).pipe(map(res=>{
      switch(res.code){
        case Code.BOTTLE_DELETED :
          alert("Bouteilles ajoutés au stock !");
          break;
        case Code.BOTTLE_ALREADY_EXSIST :
          alert("Bouteilles déjà enregistrés sur le stock !");
          break;
        case Code.INTERNAL_ERROR :
        case Code.WRONG_PARAMS :
          alert("Erreur Mauvais Paramètres !");
          break;
        case Code.BOTTLE_TYPE_DOESNT_EXSIST :
          alert("La bouteille scanner n'existe pas dans la base de données");
          break;
        case Code.STOCK_DOESNT_EXSIST :
          alert("Le stock n'existe pas !");
          break;
        case Code.UNAUTHORIZED :
          alert("Vous n'êtes pas autorisé à utiliser l'application mobile !")          
      }
      return res;
    }))
  }

  public syncBelts(version,token){
    let headers = new HttpHeaders().set('Content-Type','application/json')
    .set('authorization','Bearer '+token);

    return this.http.post<ApiResponse<Version>>(this.apiUrl + 'version/' + version.id + '/sync', version,{headers:headers}).pipe(map(
      res => {
        switch (res.code) {

          case Code.VERSION_SYNCHRONIZED:
          res.result = Version.loadFromJSON(res.result);
          alert("Synchronisation réussi !")
          break;

          case Code.VERSION_DOESNT_EXSIST:
          alert("Problème Version déjà existante !");
          break;

          case Code.UNAUTHORIZED:
          alert("Vous n'êtes pas autorisé à utiliser l'application mobile !") 
          break;

        }

        return res;
      }
    ))
  }
 
  
  public getSiteByUuid(id,token){
    let headers = new HttpHeaders().set('Content-Type','application/json')
    .set('authorization','Bearer '+token);

    return this.http.get<ApiResponse<Site>>(this.apiUrl+"upcv3/getSiteByUpcID/"+id,{headers:headers}).pipe(map(
      res=>{
        switch (res.code){
          case Code.SITE_RECOVERED :
            res.result = Site.loadFromJSON(res.result);
            break;
          case Code.UPCV3_DOESNT_EXSIST :
            alert("Le Site n'existe pas dans la base de données");
            break;
          case Code.UNAUTHORIZED :
            alert("Vous n'êtes pas autorisé à utiliser l'application mobile !");
            break;    
        }
        return res;
      }
    ))
  }
  public getExcelSheet(id,token){
    let headers = new HttpHeaders()
    .set('authorization','Bearer '+token)
    .set('accept', 'application/pdf');
    
    return this.http.get(this.apiUrl+"upcv3/intervention/"+id+"/interventionSheet",{headers:headers,responseType : 'arraybuffer'});
  }
  public signInterSheets(id,sign,token) :any {
    let headers = new HttpHeaders()
    .set('authorization','Bearer '+token)
    .set('accept', 'application/pdf');
    //this.apiUrl = "http://localhost:8080/";
    sign = sign.replace("data:image/png;base64,","");
    sign = encodeURI(sign);
    alert(sign);
    console.log(sign);
    return this.http.post(this.apiUrl+"upcv3/intervention/"+id+"/signedInterventionSheet?signature="+sign,{},{headers:headers,responseType : 'arraybuffer'});
  }

}

import { Injectable } from '@angular/core';
import { UPCV3 } from '../models/upcv3/upcv3';
import { Site } from '../models/site';


@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  public upc3:UPCV3;
  public site:Site;
  public op :string;
  public B1 = [];
  public B2 = [];
  public designationB1=[];
  public designationB2 = [];
  constructor() { }
}

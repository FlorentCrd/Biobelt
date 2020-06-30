import { Injectable } from '@angular/core';
import { UPCV3 } from '../models/upcv3/upcv3';
import { Site } from '../models/site';
import { InterventionV3 } from '../models/upcv3/interventionv3';
import { LocalDateTime } from '../models/upcv3/LocalDateTime';


@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  public upc3:UPCV3;
  public site:Site;
  public inter :InterventionV3;
  public op :string;
  public B1 = [];
  public B2 = [];
  public designationB1=[];
  public designationB2 = [];
  public InterventionV3 ={
    datetime : '',
    ceinture : 0,
    objet : '',

    operateur: '',

    bouteillesB1:  '',
    bouteillesB1Dates: '',
    bouteillesB1Barcode:  '',
    bouteillesB2:       '',
    bouteillesB2Dates:   '',
    bouteillesB2Barcode: ''
};

  constructor() { }
}

/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { Component } from '@angular/core';
import { ApiConnService } from '../services/api-conn.service';
import { Dispositivo } from '../model/Dispositivo';
import { HomePageModule } from './home.module';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  listadoDispositivo: Array<Dispositivo>;
  estado: any;
  dbStatus: boolean;
  dMode: boolean;
  constructor(public conndb: ApiConnService) {
                                              this.dbStatus=true;
                                              this.callApi();
                                              }


 // eslint-disable-next-line no-trailing-spaces

  async callApi(){
    try{
      this.listadoDispositivo = await this.conndb.getDispositivos();
      this.estado="warning";  //Prueba para ver el color de la card
      console.log('DEBUG-home.page.ts  this.conndb.getDispositivos()');
      console.log(this.listadoDispositivo);
    }
     catch(error){
      this.dbStatus=false;
     }
    }
   ngOnInit(){

    }
}


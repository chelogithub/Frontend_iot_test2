
import { Component, OnInit } from '@angular/core';
import { ApiConnService } from '../services/api-conn.service';
import { TimestampService } from '../services/timestamp.service';
import { Dispositivo } from '../model/Dispositivo';
import { ActivatedRoute } from '@angular/router';
import { Log } from '../model/Log';
import { json } from 'express';
import { interval} from 'rxjs';
//import { time } from 'console';
//import { threadId } from 'worker_threads';
//import { Observable} from 'rxjs';
//import * as Highcharts from 'highcharts';
//import { Medida } from '../model/Medida';



@Component({
  selector: 'app-dispositivo',
  templateUrl: './dispositivo.page.html',
  styleUrls: ['./dispositivo.page.scss'],
})
export class DispositivoPage  {

  data: string;
  med: Log; // Medida = new Medida('0','0','0','0');
  temperatura: any;
  humedad: any;
  presion: any;
  canal1: any;
  canal2: any;
  timestamp:any;
  dispositivo: Dispositivo = new Dispositivo(0,0,"","","",0,0,0,0,0,0,"","");
  fecha: string;
  nombre: string;
  ubicacion: string;
  servicio: string;
  topico: string;
  sampling: number;
  dbStatus: boolean;
  dataReady: boolean;
  dbPostStatus: boolean;
  logs:any;
  subscription: any;
  datagraf: number;
  act: number;
  ts: any;
  UTC_ultima_medicion: number;
  UTC_hora_actua: number;
  UTC_dif_medicion: number;
  estado_dispositivo: number;
  hora_mod: number;
  hora: number;
  

  // eslint-disable-next-line @typescript-eslint/member-ordering

  constructor(public conndb: ApiConnService,private activatedRoute: ActivatedRoute, public now: TimestampService) {
    this.dbStatus=true;
    this.dataReady=false;       //No dibuja página
    this.dbPostStatus=true;
    this.obtenerDatos();
   }
   // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
   ngOnInit() {
  }

  ionViewDidEnter() {
    this.subscription = interval(2000).subscribe(x => {  this.obtenerDatos();});

  }
  ionViewDidLoad()
  {

  }
  ionViewWillEnter() {
  }

  ionViewWillLeave(){
    this.subscription.unsubscribe();
  }

   async obtenerDatos()
   {
    
    this.data=this.activatedRoute.snapshot.paramMap.get('id');
    console.log('this.data is = ' + this.data);

    try{

           this.med =await this.conndb.getLastLog(this.data);
           console.log(this.med);
           this.temperatura=this.med.temperatura;
           this.humedad=this.med.humedad;
           this.presion=this.med.presion;
           this.canal1=this.med.canal1;
           this.canal2=this.med.canal2;
           this.timestamp=this.med.timestamp;
           this.dispositivo = await this.conndb.getDispositivo(this.data);
           this.nombre=this.dispositivo.nombre;
           this.ubicacion=this.dispositivo.ubicacion;
           this.servicio=this.dispositivo.servicio;
           this.sampling=this.dispositivo.sampling;
           this.topico=this.dispositivo.topicoServ;
           this.convertirDatos();
           this.dataReady=true;    //Dibujo página

    
           
      }
      catch (error)
      {
        this.dataReady=true;    //Dibujo página
        this.dbStatus=false;
      }
   }

  async mostrarLogs()
  {
      this.logs=await this.conndb.getLogs(this.data);
      console.log(this.logs);
      this.convertirDatos();
  }

convertirDatos(){
  let now = new Date();
  this.datagraf=Date.UTC(Number(this.timestamp.substring(0,4)),
                        Number(this.timestamp.substring(5,7))-1,
                        Number(this.timestamp.substring(8,10)),
                        Number(this.timestamp.substring(11,13)),
                        Number(this.timestamp.substring(14,16)),
                        Number(this.timestamp.substring(17,19)))-10800000;
  this.UTC_ultima_medicion=this.datagraf;
  this.UTC_hora_actua=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),now.getMinutes(),now.getSeconds());
  this.UTC_dif_medicion = this.UTC_hora_actua-this.UTC_ultima_medicion;
  this.hora=Number(this.timestamp.substring(11,13))
  console.log("this.hora =" + this.hora);
  switch(this.hora)
  {
    case 0:
      this.hora=21;
      break
    case 1:
      this.hora=22;
      break
    case 2:
      this.hora=23;
      break
    case 3:
      this.hora=0;
      break
    default:
      this.hora=this.hora-3;
      break
  }
  this.ts = this.timestamp.substring(8,10)+'-'+this.timestamp.substring(5,7)+'-'+this.timestamp.substring(0,4)+' '+this.hora+':'+this.timestamp.substring(14,16)+':'+this.timestamp.substring(17,19);
  if(this.UTC_dif_medicion > 45000)
      {this.estado_dispositivo=0}
  else if (this.UTC_dif_medicion < 30000)
          {this.estado_dispositivo=1}
}

controlCanal(act){
let data='';
  switch(act)
  {
    case 1:
          data='{"canal1":1}';
      break
    case 2:
          data='{"canal1":0}';
      break
    case 3:
          data='{"canal2":1}';
      break
    case 4:
          data='{"canal2":0}';
      break
  }
 console.log('Envío a %s con valor =%s',this.topico, data); 
 this.conndb.postCanal(this.topico,data);
}

}



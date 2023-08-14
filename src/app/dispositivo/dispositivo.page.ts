
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
import * as Highcharts from 'highcharts';
//import { Medida } from '../model/Medida';
import { HomePage } from '../home/home.page';
import { VisualStyleService } from '../services/visual-style.service';

require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/export-data')(Highcharts);
require('highcharts/modules/accessibility')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);

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
  flag: number;
  graphOrNum: Boolean;
  dark: boolean;
  newOpt: any;  
  newOpt2: any;

  maxHumidity= 100;
 
  

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public mygraph;
  public mygraph2;
  public graphOptions;
  public graphOptions2;

  constructor(public conndb: ApiConnService,private activatedRoute: ActivatedRoute, public now: TimestampService, public darkm:VisualStyleService) {
    
    // if(Home.dMode==true)
    // {
    //   console.log("DMODE ON");
    // }else{
    //   console.log("DMODE OFF");
    // }
    
    this.dbStatus=true;
    this.dataReady=false;       //No dibuja página
    this.dbPostStatus=true;
    this.graphOrNum=true;       //Gestion de presentacion de grafico
    this.obtenerDatos();

   }
   // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit() {
    console.log("ngOnInit");
  

    this.obtenerDatos();

  }

  ionViewDidEnter() {
    console.log("ionViewDidEnter");
    // setTimeout(this.generarGrafico, 500);
    
    // this.subscription = interval(2000).subscribe(x => {  this.obtenerDatos(); 
    //                                                       //try{
    //                                                        console.log("update");
    //                                                        this.updateChart()//}
    //                                                       //atch{}
    //                                                     });
    this.obtenerDatos();
    console.log("Humedad 1 =" + this.dispositivo.humedad);
    // setTimeout("",700);
     console.log("Humedad 2 =" + this.dispositivo.humedad);
   // if(this.graphOrNum) setTimeout( this.generarGrafico, 1700);


     this.subscription = interval(2000).subscribe(() => { 
                                                          if(this.dbStatus)
                                                          {
                                                                this.obtenerDatos();
                                                                if(this.graphOrNum){
                                                                if(this.flag != 1) 
                                                                {
                                                                  console.log("paso de prima")
                                                                
                                                                //Dark mode read and setings
                                                                  this.newOpt=[];
                                                                  this.newOpt2=[];
                                                                if(this.darkm.checkDarkMode())
                                                                {
                                                                    this.newOpt={height: '100%',
                                                                    type: 'gauge', 
                                                                    backgroundColor: '#1e1e1e',
                                                                    plotBackgroundImage: null,
                                                                    plotBorderWidth: 0,
                                                                    plotShadow: false,                                                        
                                                                  },
                                                                this.newOpt2={height: '100%',
                                                                              type: 'solidgauge', 
                                                                              backgroundColor: '#1e1e1e'};

                                                                console.log("LEO DARK MODE");
                                                                  }else
                                                                  {
                                                                    this.newOpt={height: '100%',type: 'gauge'},
                                                                    this.newOpt2={height: '100%',type: 'solidgauge'};
                                                                    console.log("LEO LIGHT MODE");                                                           
                                                                  }
                                                                  console.log(this.newOpt);
                                                     
                                                                  this.generarGrafico(); 
                                                                if (this.dispositivo.humedad)this.generarGrafico2(); 
                                                                    }
                                                                    this.flag=1;
                                                                    console.log("paso subscription")
                                                                    this.updateChart();}
                                                            }
                                                            
                                                        });
                                                       
  }
  ionViewDidLoad()
  {

    console.log("ionViewDidLoad");
  }
  ionViewWillEnter() {
    console.log("ionViewWillEnter");
  }

  ionViewWillLeave(){
    console.log("ionViewWillLeave");
    this.subscription.unsubscribe();
    this.flag=0;
  }

   async obtenerDatos()
   {
    
    this.data=this.activatedRoute.snapshot.paramMap.get('id');
    console.log('this.data is = ' + this.data);

    try{
           this.dispositivo = await this.conndb.getDispositivo(this.data);
           console.log("Humedad in  =" + this.dispositivo.humedad);
           this.med =await this.conndb.getLastLog(this.data);
           console.log(this.med);
           this.temperatura=(this.med.temperatura );
           this.humedad=this.med.humedad;
           this.presion=this.med.presion;
           this.canal1=this.med.canal1;
           this.canal2=this.med.canal2;
           this.timestamp=this.med.timestamp;
           this.nombre=this.dispositivo.nombre;
           this.ubicacion=this.dispositivo.ubicacion;
           this.servicio=this.dispositivo.servicio;
           this.sampling=this.dispositivo.sampling;
           this.topico=this.dispositivo.topicoServ;
           this.convertirDatos();
         
     }
     catch (error)
      {
        this.dbStatus=false;
      }

      this.dataReady=true;    //Dibujo página luego de consultar los datos
  
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
return;
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
updateChart(){
  //try{
    this.mygraph.update({
      series:[{data:[this.temperatura]}]});

  if(this.dispositivo.humedad){
     this.mygraph2.update({
       series:[{data:[this.humedad]}]
      //  ,
      //  chart:{backgroundColor:'#f00'}
      });}

  //}
 // catch{}
}

generarGrafico(){

  Highcharts.setOptions({
      lang: {
          months: [
              'Enero', 'Febrero', 'Marzo', 'Abril',
              'Mayo', 'Junio', 'Julio', 'Agosto',
              'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ],
          weekdays: [
              'Domingo', 'Lunes', 'Martes', 'Miercoles',
              'Jueves', 'Viernes', 'Sabado'
          ]
      }
      ,
      exporting:{
            enabled:false   //Elimina ek botón de exportar
          }
    });

  this.graphOptions={               //Highcharts.chart('container', {

    chart: this.newOpt,             //Agregadas nuevas propiedades para el manejo del modo oscuro en 
    //  {
    //   type: 'gauge',
    //   backgroundColor:'#1e1e1e',
    //  // plotBackgroundColor: '#1e1e1e',
    //   plotBackgroundImage: null,
    //   plotBorderWidth: 0,
    //   plotShadow: false,
    //   height: '100%'
    // },
  
    title: {
      text: 'Temperatura'
    },
  
    pane: {
      startAngle: -90,
      endAngle: 89.9,
      background: null,
      center: ['50%', '60%'],
      size: '100%'
    },
  
    // the value axis
    yAxis: {
      min: 0,
      max: 60,
      tickPixelInterval: 60,
      tickPosition: 'inside',
      tickColor: Highcharts.defaultOptions.chart.backgroundColor || '#FFFFFF',
      tickLength: 20,
      tickWidth: 1,
      minorTickInterval: null,
      labels: {
        distance: 20,
        style: {
          fontSize: '14px'
        }
      },
      lineWidth: 0,
      plotBands: [{
        from: 0,
        to: 30,
        color: '#55BF3B', // green
        thickness: 20
      }, {
        from: 30,
        to: 45,
        color: '#DDDF0D', // yellow
        thickness: 20
      }, {
        from: 45,
        to: 60,
        color: '#DF5353', // red
        thickness: 20
      }]
    },
    credits:{
      enabled: false      //Elimina la marca de agua de Highcharts
    },
    series: [{
      name: 'Temperatura',
      data: [this.temperatura],//[0],//[this.temperatura]
      tooltip: {
        valueSuffix: ' ºC'
      },
      dataLabels: {
        format: '{y} ºC',
        borderWidth: 0,
        color: (
          Highcharts.defaultOptions.title &&
          Highcharts.defaultOptions.title.style &&
          Highcharts.defaultOptions.title.style.color
        ) || '#333333',
        style: {
          fontSize: '16px'
        }
      },
      dial: {
        radius: '80%',
        backgroundColor: 'gray',
        baseWidth: 12,
        baseLength: '0%',
        rearLength: '0%'
      },
      pivot: {
        backgroundColor: 'gray',
        radius: 6
      }
  
    }]
  
  }
  this.mygraph = Highcharts.chart('container', this.graphOptions );

  ////
console.log("generar grafico this.dispositivo.humedad = " + this.dispositivo.humedad);


}
generarGrafico2()
{  
    this.graphOptions2={ 
      chart: this.newOpt2,
      //  {
      //   height: '100%',
      //   type: 'solidgauge'//,
      //   //backgroundColor: '#f00'
 
      // }
      
    
      title: null,
    
      pane: {
        center: ['50%', '70%'],
        size: '100%',
        startAngle: -90,
        endAngle: 90,
        background: {
          
          //backgroundColor: '#e00',
          backgroundColor:
          Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
          innerRadius: '60%',
          outerRadius: '100%',
          shape: 'arc'
        }
      },
    
      exporting: {
        enabled: false
      },
    
      tooltip: {
        enabled: false
      },
    
      // the value axis
      yAxis: {
        stops: [
          [0.1, '#55BF3B'], // green
          [0.5, '#DDDF0D'], // yellow
          [0.9, '#DF5353'] // red
        ],
        lineWidth: 0,
        tickWidth: 0,
        minorTickInterval: null,
        tickAmount: 2,
        title: {
          y: -70
        },
        labels: {
          y: 16
        }
      },
    
      plotOptions: {
        solidgauge: {
          dataLabels: {
            y: 5,
            borderWidth: 0,
            useHTML: true
          }
        }
      }
    };

   // var chartSpeed 
   this.mygraph2 =Highcharts.chart('gauge2', Highcharts.merge(this.graphOptions2, {
      yAxis: {
        min: 0,
        max: this.maxHumidity,   // SOlo para verificar que lo podemos traer de otra variable
        title: {
          text: 'Humedad'
        }
      },
    
      credits: {
        enabled: false
      },
    
      series: [{
        //name: 'Speed',
        data: [80],
        dataLabels: {
          format:
            '<div style="text-align:center">' +
            '<span style="font-size:25px">{y}</span><br/>' +
            '<span style="font-size:12px;opacity:0.4">%H.R</span>' +
            '</div>'
        },
        tooltip: {
          valueSuffix: ' %H.R'
        }
      }]
    
    }));
  
}


}

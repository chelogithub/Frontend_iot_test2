import { Component, OnInit, ElementRef, NgModule } from '@angular/core';
import { ApiConnService } from '../services/api-conn.service';
import { ActivatedRoute } from '@angular/router';
import { Dispositivo } from '../model/Dispositivo';
import * as Highcharts from 'highcharts';

import { DatetimeCustomEvent, IonDatetime, IonicModule } from '@ionic/angular';
import { element } from 'protractor';


require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/data')(Highcharts);
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/boost')(Highcharts);
require('highcharts/modules/export-data')(Highcharts);
require('highcharts/modules/accessibility')(Highcharts);
require('highcharts/modules/series-label')(Highcharts);


@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.page.html',
  styleUrls: ['./grafico.page.scss'],
})
export class GraficoPage implements OnInit {
  logs: any;
  data: any;
  datagraf:  Array<Array<number>> = new Array<Array<number>>();
  datagraf2: Array<Array<number>> = new Array<Array<number>>();
  datagraf3: Array<Array<number>> = new Array<Array<number>>();
  datagraf4: Array<Array<number>> = new Array<Array<number>>();
  datagraf5: Array<Array<number>> = new Array<Array<number>>();
  btnGraficoDis: boolean;
  dbStatus: boolean;
  dispositivo: Dispositivo = new Dispositivo(0,0,"","","",0,0,0,0,0,0,"","");
  graphSeries: Array<any>;
  seriesVect: Array<any>= new Array<any>();

  data1: any;
  data2: any;
  fecha: string;

  public mygraph;
  public graphOptions;
  constructor(public conndb: ApiConnService,private activatedRoute: ActivatedRoute
    ) {

  this.btnGraficoDis=false;                                        //Arranco mostrando los botones
  this.data=this.activatedRoute.snapshot.paramMap.get('id');       //Obtengo el sensor con el id
  this.datosDispositivo();                                         //Traigo de la base los datos del sensor
  console.log('constructor this.data is = ' + this.data);
}

  ngOnInit() {
  }

  ionViewDidEnter() {
    //Genero las serien con los datos obtenidos de datosDispositivo ejecutado en el constructor
    this.pass2Series();
    this.generarGrafico();

  }
  ionViewWillEnter() {
  }

  async datosDispositivo()
  {
   
   try{

          this.dispositivo = await this.conndb.getDispositivo(this.data);
          console.log('this.data is dD= ' + this.data);
          console.log('this.dispositivo.humedad = ' + this.dispositivo.humedad);
        
     }
     catch (error)
     {
       this.dbStatus=false;
     }
  }


  async mostrarLogs()
  {
    try{
      this.regenerarGrafico();
      this.logs=await this.conndb.getLogs(this.data);
      this.convertirDatos();
      }
      catch(error)
      {
        this.dbStatus=false;
      }
  }
  async mostrarLogsSemana()
  {
    try{
      this.regenerarGrafico();
      this.logs=await this.conndb.getLogsSemana(this.data);
      this.convertirDatos();
      }
      catch(error)
      {
        this.dbStatus=false;
      }
  }
    async mostrarLogsDia()
  {
    try{
      this.regenerarGrafico();
      this.logs=await this.conndb.getLogsDia(this.data);
      this.convertirDatos();
      }
      catch(error)
      {
        this.dbStatus=false;
      }
  }
  async mostrarIntervalo()
  {
    try{
      this.regenerarGrafico();
      this.logs=await this.conndb.getIntervalo(this.data,this.data1,this.data2);
      this.convertirDatos();
      }
      catch(error)
      {
        this.dbStatus=false;
      }
  }

  clearLogs()
  {
      this.regenerarGrafico();
      this.updateChart();
  }

convertirDatos(){

  const a = this.logs.length;
  console.log(this.logs);
  for( let i = 0; i < a; i ++)
  {
      this.datagraf[i]=[Date.UTC(Number(this.logs[i].timestamp.substring(0,4)),
      Number(this.logs[i].timestamp.substring(5,7))-1,
      Number(this.logs[i].timestamp.substring(8,10)),
      Number(this.logs[i].timestamp.substring(11,13)),
      Number(this.logs[i].timestamp.substring(14,16)),
      Number(this.logs[i].timestamp.substring(17,19)))-10800000,
      Number(this.logs[i].temperatura)];
      this.datagraf2[i]=[this.datagraf[i][0],Number(this.logs[i].presion)];
      this.datagraf3[i]=[this.datagraf[i][0],Number(this.logs[i].humedad)];
      this.datagraf4[i]=[this.datagraf[i][0],Number(this.logs[i].canal1)];
      this.datagraf5[i]=[this.datagraf[i][0],Number(this.logs[i].canal2)];
      

   }
   console.log(this.datagraf);
   console.log(this.datagraf2);
   console.log(this.datagraf3);
   console.log(this.datagraf4);
   console.log(this.datagraf5);
   this.pass2Series();
   this.updateChart();
   console.log("this.graphOptions.series = " + this.graphOptions.series);
   }

updateChart(){

  console.log("Prueba");

  this.mygraph.update({
    series: this.graphSeries
});

this.btnGraficoDis=false;
}

regenerarGrafico(){
  this.btnGraficoDis=true;
  this.mygraph.destroy();
  //this.generarGrafico();
  this.datagraf=[[0,0]];
  this.datagraf2=[[0,0]];
  this.datagraf3=[[0,0]];
  this.datagraf4=[[0,0]];
  this.datagraf5=[[0,0]];
  this.logs=[[0,0]];
  this.generarGrafico();  //Genera data de gráfico
  this.pass2Series();     //Genera vector de series
}

pass2Series(){
// función : Generar el Array de series del gráfico en función de los recursos del nodo.

    this.graphSeries=[];
    if(this.dispositivo.temperatura)
    {
      this.graphSeries.push({name: 'Temperatura',data: this.datagraf});  
    }
    if(this.dispositivo.presion)
    {
      this.graphSeries.push({name: 'Presión',data: this.datagraf2});  
    }
    if(this.dispositivo.humedad)
    {
      this.graphSeries.push({name: 'Humedad',data: this.datagraf3});  
    }
    if(this.dispositivo.canal1)
    {
      this.graphSeries.push({name: 'Canal1',data: this.datagraf4});  
    }
    if(this.dispositivo.canal2)
    {
      this.graphSeries.push({name: 'Canal2',data: this.datagraf5});  
    }
 
    console.log("this.graphSeries = " + this.graphSeries);
}

generarGrafico(){
  this.graphOptions={
    chart: {
      zoomType: 'xy'
    },
    title: {
      text: 'Variables'
    },
    xAxis: {
      type: 'datetime',
      gridLineWidth: 1,
      crosshair: true,
      title: {
        text: 'Escala temporal'
      }
    },
    yAxis: {
      crosshair: true,
      title: {
        text: 'Valor de magnitudes'
      }
    },
    legend: {
      enabled: true
    },
    accessibility: {
      screenReaderSection: {
        // eslint-disable-next-line max-len
        beforeChartFormat: '<{headingTagName}>{chartTitle}</{headingTagName}><div>{chartSubtitle}</div><div>{chartLongdesc}</div><div>{xAxisDescription}</div><div>{yAxisDescription}</div>'
      }
    },
    tooltip: {
      valueDecimals: 2
    },
    series: this.graphSeries  //Se utiliza array graphSeries para el ingreso de las series.
 
  };
  this.mygraph = Highcharts.chart('container3', this.graphOptions );
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
  });
}

test()
  {
    this.fecha=this.data1;
    console.log("hola");
  }

  onIonChange(ev: Event) {

    console.log(ev.target);
    console.log((ev.target as Element).id);
    
    if((ev.target as Element).id=="datetime")
    {
      console.log("Fecha desde");
      this.data1 = (ev as DatetimeCustomEvent).detail.value;
    }
    if((ev.target as Element).id=="datetime2")
    {
      console.log("Fecha hasta");
      this.data2 = (ev as DatetimeCustomEvent).detail.value;
    }
     
  }
}

   // series: [{
    //   //type: 'area',
    //   name: 'Temperatura',
    //   data: this.datagraf
    //   },
    //   {
    //     //type: 'area',
    //     name: 'Presión',
    //     data: this.datagraf2
    //   },
    //   {
    //     //type: 'area',
    //     name: 'Humedad',
    //     data: this.datagraf3
    //   },
    //   {
    //     //type: 'area',
    //     name: 'Canal1',
    //     data: this.datagraf4
    //   },
    //   {
    //     //type: 'area',
    //     name: 'Canal2',
    //     data: this.datagraf5
    //   }
    //         ]


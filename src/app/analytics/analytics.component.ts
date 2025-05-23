import { Component, OnInit } from '@angular/core';
import {
  ApexNonAxisChartSeries, ApexChart, ApexPlotOptions, ApexAxisChartSeries,
  ApexXAxis, ApexDataLabels, ApexStroke, ApexMarkers, ChartComponent, ChartType
} from 'ng-apexcharts';
import {BarchartComponent} from '../barchart/barchart.component';
import {LinechartComponent } from '../linechart/linechart.component';
import {EfficiencygaugeComponent} from '../efficiencygauge/efficiencygauge.component';
import {LoadgaugeComponent} from '../loadgauge/loadgauge.component';
import {ConsumptionmapComponent} from '../consumptionmap/consumptionmap.component';
import {CategoryradarComponent} from '../categoryradar/categoryradar.component';
import {TimeanalysisComponent} from '../timeanalysis/timeanalysis.component';
import {LosschartComponent} from '../losschart/losschart.component';
import {EfficiencypieComponent} from '../efficiencypie/efficiencypie.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
  imports: [
    ChartComponent,
    BarchartComponent,
    LinechartComponent,
    EfficiencygaugeComponent,
    LoadgaugeComponent,
    ConsumptionmapComponent,
    CategoryradarComponent,
    TimeanalysisComponent,
    LosschartComponent,
    EfficiencypieComponent
  ]

})
export class AnalyticsComponent implements OnInit {

  energyConsumptionChart: ApexAxisChartSeries = [{
    name: 'Потребление (кВт)',
    data: [120, 200, 150, 300, 180, 250, 210]
  }];

  chart: ApexChart = {
    type: 'line',
    height: 200
  };

  xaxis: ApexXAxis = {
    categories: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль']
  };

  stroke: ApexStroke = {
    curve: 'smooth' // просто строка
  };

  markers: ApexMarkers = {
    size: 4
  };

  dataLabels: ApexDataLabels = {
    enabled: false
  };

  gaugeSeries: ApexNonAxisChartSeries = [67];
  gaugeChart: ApexChart = { type: 'radialBar', height: 250 };
  gaugePlotOptions: ApexPlotOptions = {
    radialBar: {
      hollow: { size: '60%' },
      dataLabels: {
        name: { show: true, fontSize: '16px' },
        value: { show: true, fontSize: '22px' }
      }
    }
  };
  public value = 74; // пример: текущее значение от 0 до 100

  public chartOptions: Partial<any> = {
    series: [this.value],
    chart: {
      type: "radialBar",
      height: 300
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '70%',
        },
        dataLabels: {
          name: {
            show: true,
            offsetY: -10,
            color: '#00C851',
            fontSize: '16px'
          },
          value: {
            show: true,
            fontSize: '22px',
            offsetY: 8
          }
        }
      }
    },
    labels: ["Средняя нагрузка"],
    fill: {
      type: "solid"
    },
    colors: [this.getColor(this.value)]
  };

  getColor(value: number): string {
    if (value < 50) return '#00C851';     // зелёный
    if (value < 80) return '#FFEB3B';     // жёлтый
    return '#FF0000';                     // красный
  }

  constructor() {}

  ngOnInit(): void {}
}

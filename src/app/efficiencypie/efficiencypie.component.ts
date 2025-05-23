import { Component } from '@angular/core';
import {
  ApexNonAxisChartSeries, ApexChart, ApexPlotOptions, ChartComponent
} from 'ng-apexcharts';

@Component({
  selector: 'app-efficiencypie',
  standalone: true,
  imports: [
    ChartComponent
  ],
  templateUrl: './efficiencypie.component.html'
})
export class EfficiencypieComponent {
  public chartSeries: ApexNonAxisChartSeries = [78];

  public chartDetails: ApexChart = {
    type: 'radialBar',
    height: 250
  };

  public plotOptions: ApexPlotOptions = {
    radialBar: {
      hollow: {
        size: '60%'
      },
      dataLabels: {
        name: {
          show: true,
          fontSize: '16px'
        },
        value: {
          show: true,
          fontSize: '22px'
        }
      }
    }
  };
}

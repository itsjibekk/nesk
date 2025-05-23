import { Component } from '@angular/core';
import {
  ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexLegend, ChartComponent
} from 'ng-apexcharts';

@Component({
  selector: 'app-losschart',
  standalone: true,
  imports: [
    ChartComponent
  ],
  templateUrl: './losschart.component.html'
})
export class LosschartComponent {
  public chartSeries: ApexNonAxisChartSeries = [55, 30, 15];
  public chartLabels = ['Технические потери', 'Коммерческие потери', 'Прочие'];
  public chartDetails: ApexChart = {
    type: 'pie',
    height: 250
  };
  public responsive: ApexResponsive[] = [
    {
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' }
      }
    }
  ];
  public legend: ApexLegend = {
    position: 'right'
  };
}

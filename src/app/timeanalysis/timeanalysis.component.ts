import { Component } from '@angular/core';
import {
  ApexChart, ApexAxisChartSeries, ApexXAxis, ChartComponent
} from 'ng-apexcharts';

@Component({
  selector: 'app-timeanalysis',
  standalone: true,
  imports: [
    ChartComponent
  ],
  templateUrl: './timeanalysis.component.html'
})
export class TimeanalysisComponent {
  public chartSeries: ApexAxisChartSeries = [
    {
      name: 'Нагрузка (кВт)',
      data: [50, 70, 80, 65, 90, 120, 130, 100, 80, 75, 60, 50]
    }
  ];

  public chartDetails: ApexChart = {
    type: 'bar',
    height: 250
  };

  public xaxis: ApexXAxis = {
    categories: ['1ч', '2ч', '3ч', '4ч', '5ч', '6ч', '7ч', '8ч', '9ч', '10ч', '11ч', '12ч']
  };
}

import { Component, Input, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Chart } from 'chart.js';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import 'chart.piecelabel.js'; 
import { IChart, IChartData, IChartOptions, IChartLegend } from '../chart.interface';
@Component({
  selector: 'bp-chart',
  templateUrl: 'bp-chart.html'
})
export class ChartComponent implements OnInit, OnChanges{
  @Input() type: string = 'doughnut';// default
  @Input() height: number = 400;
  @Input() width: number;
  @Input() data: IChartData;
  @Input() options: IChartOptions;
  @ViewChild('bpChartCanvas') bpChartCanvas;

  bpChart: any;
  chartObj: IChart;

  constructor() {
    this.setChartDefaults();
    
  }

  ngOnInit(){
    this.updateData();
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges){
      // this.data = changes.data ? changes.data.currentValue : <IChartData>{};
      // this.options = changes.options ? changes.options.currentValue: <IChartOptions>{};
      // this.height = changes.height ? changes.height.currentValue: 400; // default 400
      // this.width = changes.width ? changes.width.currentValue : undefined;
      // this.createChart();
      // this.updateData();
      // if(changes.type.currentValue !== changes.type.previousValue) {
      //   this.bpChart.destroy();
      //   this.createChart();
      // }
      // if(!changes.type.isFirstChange()){
      this.updateData();
      // if(changes.type.currentValue !== changes.type.previousValue) {
          // this.bpChart.destroy();
      // this.createChart();
      // }
      this.updateChart();        
      // }
      
      
  }

  updateData = () => {
    this.chartObj.type = this.type;
    if(this.data) {
      Object.assign(this.chartObj.data, this.data);
    }
    if(this.options){
      Object.assign(this.chartObj.options, this.options);
    }
  }

  updateChart = () => {
    if(this.bpChart){
      if(this.options.legendCallback){
        this.bpChart.generateLegend();
      }
      this.bpChart.update();
    }
  }
  createChart = () => {
    this.bpChart = null;
    this.bpChart = new Chart(this.bpChartCanvas.nativeElement, this.chartObj);
  }

  setChartDefaults = () => {
    this.chartObj = <IChart>{
      type: 'doughnut', 
      data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              '#00998d',
              '#06467c',
              '#994f9c',
              '#b5bd32',
              '#137ca8',
              '#f26130'
                // 'rgba(255, 99, 132, 0.2)',
                // 'rgba(54, 162, 235, 0.2)',
                // 'rgba(255, 206, 86, 0.2)',
                // 'rgba(75, 192, 192, 0.2)',
                // 'rgba(153, 102, 255, 0.2)',
                // 'rgba(255, 159, 64, 0.2)'
            ],
            hoverBackgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        pieceLabel: {
          render: 'label',
          fontColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ],
          precision: 5
        },
        legend: <IChartLegend>{
          display: true
        }
      },
      plugins: [pluginAnnotations]
    }
  }

}

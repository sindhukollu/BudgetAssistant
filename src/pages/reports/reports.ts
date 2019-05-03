import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, Slides } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Chart } from 'chart.js';

import * as moment from 'moment';
import { chain, cloneDeep, sumBy, sum } from 'lodash';

// components
// import { CategoryItemsModalPage } from '../category-items-modal/category-items-modal';
import { DatepickerComponent } from '../../components/datepicker/datepicker';
// interfaces
import { IChartOptions, IChartLegend, IChartData, IChartTitle, IChartLegendLabel, IChartLegendItem } from '../../components/charts/chart.interface';
import { IDateRange, IBudgetSettings } from '../../app/interfaces';
// enums
import { ITEM_TYPE } from '../../app/enums';
import { CategoryItemsModal } from '../../components/category-items-modal/category-items-modal';

@Component({
  selector: 'page-reports',
  templateUrl: 'reports.html'
})
export class ReportsPage {
  @ViewChild('datepicker') datepicker: DatepickerComponent;
  @ViewChild('slides') slides: Slides;

  selectedDateRange = <IDateRange>{};
  noOfMonthsSelected: number = 0;

  categoryChart: any;

  itemCategoryChartTypes = ['doughnut', 'bar'];
  itemCategoryChartTypeIndex = 0;
  itemCatgeoryChartType: string = 'doughnut';
  itemCategoryChartOptions: IChartOptions;
  itemCategoryChartData = <IChartData>{};
  showCategoryTrends: boolean = false;
  monthlyChartTypes = [ 'bar', 'horizontalBar', 'line'];
  monthlyChartTypeIndex = 0;
  monthlyChartType: string = 'bar';
  monthlyChartOptions: IChartOptions;
  monthlyChartData = <IChartData>{};
  showMonthlyChart: boolean = true;

  incomeVsExpenseChartData = <IChartData>{};
  incomeVsExpenseChartOptions: IChartOptions;
  showIncomeVsExpenseChart: boolean = true;

  incomeVsExpenseMonthlyChartData = <IChartData>{};
  incomeVsExpenseMonthlyChartOptions: IChartOptions;
  showIncomeVsExpenseMonthlyChart: boolean = true;

  incomeVsExpenseWeeklyChartData = <IChartData>{};
  incomeVsExpenseWeeklyChartOptions: IChartOptions;
  showIncomeVsExpenseWeeklyChart: boolean = true;

  showWeeklyExpenseChart: boolean = true;
  weeklyExpenseChartData = <IChartData>{};
  weeklyExpenseChartOptions: IChartOptions;

  showItemCategoryMonthlyChartData: boolean = true;
  itemCategoryMonthlyChartData = <IChartData>{};
  itemCategoryMonthlyChartOptions: IChartOptions;

  showYearlyExpenseChart: boolean = true;
  yearlyExpenseChartData= <IChartData>{};
  yearlyExpenseChartOptions: IChartOptions;

  items: any = [];
  itemsGroupedByCategory: any = [];
  itemsGroupedByType: any = [];
  categories = [];
  amounts = [];
  totalAmount: number = 0;
  isPositive: boolean = true;
  selectedItemType: number = ITEM_TYPE.expense;
  currentSlideIndex = 0;
  budgetSettings: IBudgetSettings = <IBudgetSettings>{};
  constructor(
    public navCtrl: NavController,
    private storage: Storage,
    public modalCtrl: ModalController,
  ) {

  }
  ionViewDidEnter(){

    this.storage.get('bp-daterange').then((val) => {
      if(val){
        let dateRange: IDateRange = JSON.parse(val);
        this.selectedDateRange = <IDateRange>{
          startDate: moment(dateRange.startDate).startOf('day'),
          endDate: moment(dateRange.endDate).endOf('day'),
          timeFrameIndex: dateRange.timeFrameIndex
        }
        this.noOfMonthsSelected = this.selectedDateRange.endDate.diff(this.selectedDateRange.startDate, 'months') + 1;
        console.log('0',this.noOfMonthsSelected );
        // remove this to not sync datepicker for reports view
        if(this.datepicker){
          this.datepicker.selectedDay = this.selectedDateRange.startDate;
          this.datepicker.selectedTimeFrameIndex = this.selectedDateRange.timeFrameIndex;
          this.datepicker.setTimeFrame(this.selectedDateRange.timeFrameIndex);
        }
      } else {
        this.selectedDateRange = <IDateRange>{
          startDate: moment().startOf('day'),
          endDate: moment().endOf('day'),
          timeFrameIndex: 0
        }
      }
      this.getBudgetSettings();
      
    })

  }

  getBudgetSettings = () => {
    const lsBudgetSettings = 'bp-budget-settings';

    this.storage.get(lsBudgetSettings).then((val) => {
      if(val){
        this.budgetSettings = JSON.parse(val);
      }
      this.getData();
    })
  }

  onSlideChanged() {
    this.currentSlideIndex = this.slides.getActiveIndex();
  }
  changeItemType = (type: number) => {
    this.selectedItemType = type;
    this.setItemsGroupedByCategoryBySelectedType();
    this.buildMonthlyChart(5);
  }

  onDateChange = (dateRange: IDateRange) => {
    this.selectedDateRange = dateRange;
    this.noOfMonthsSelected = this.selectedDateRange.endDate.diff(this.selectedDateRange.startDate, 'months') + 1;
    console.log('1', this.noOfMonthsSelected );
    if(this.items.length){
      this.filterItems();
    }
  }

  getData = () => {
    this.storage.get('receipts').then((data) => {
      if(data){
        data = JSON.parse(data);
        this.items =  data && data.length ? data : [];
        this.filterItems();
      } else {
        this.items = mockData;
      }
    });
  }

  filterItems = () => {
    var items = cloneDeep(this.items);
    items = items.filter((item) => {
      return moment.unix(item.date).isSameOrAfter(this.selectedDateRange.startDate) && moment.unix(item.date).isSameOrBefore(this.selectedDateRange.endDate);
    });
    this.groupItemsByCategory(items);
    this.buildMonthlyChart(5);
    this.buildWeeklyChart();
    this.buildYearlyChart();
    this.expenseVsIncomeChart();
    this.expenseVsIncomeMonthlyChart();
    this.expenseVsIncomeWeeklyChart();
    this.categoryMonthlyChart();
  }

  groupItemsByCategory = (items) => {
    this.itemsGroupedByType = chain(items)
      .groupBy('type')
      .map((val, k) => {
        var totalAmountByType = 0;
        var categories = [];
        var amounts = [];
        var itemBycategory = chain(val)
            .groupBy('category'||'merchantName')
            .map((value, key) => {
              var totalAmtByCategory = sumBy(value, (v) => parseFloat(v.totalAmount || v.amount));
              totalAmountByType += totalAmtByCategory;

              categories.push(key);
              amounts.push(totalAmtByCategory);
              return {
                categoryName: key,
                totalAmount: totalAmtByCategory,
                items: value
              };
            }).value();
        return {
          type: k,
          totalAmount: totalAmountByType,
          categories: categories,
          amounts: amounts,
          items: itemBycategory
        };
      }).value();

      const expense = this.itemsGroupedByType[0] ? this.itemsGroupedByType[0].totalAmount : 0;
      var income = this.itemsGroupedByType[1] ? this.itemsGroupedByType[1].totalAmount : 0;
      this.totalAmount =  income - expense;
      this.isPositive = this.totalAmount >= 0;
      this.setItemsGroupedByCategoryBySelectedType();
  }

  setItemsGroupedByCategoryBySelectedType = () => {
    var groupedItems = this.itemsGroupedByType[this.selectedItemType];
    console.log(groupedItems);
    if(groupedItems){
      this.itemsGroupedByCategory = groupedItems.items;
      this.categories = groupedItems.categories;
      this.amounts = groupedItems.amounts;
    } else {
      this.itemsGroupedByCategory = [];
      this.categories = [];
      this.amounts = [];
    }
    this.buildChart();
  }

  buildChart = () => {
    this.showCategoryTrends = this.categories.length > 0;

    const chartData = <any>{
      type: 'doughnut',
      data: {
        labels: this.categories,
        datasets: [
          {
            backgroundColor: ['#00998d','#06467c',"#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: this.amounts,
          }
        ]
      },
      options: {
        cutoutPercentage: 50,
        title: {
          display: false
        },
        pieceLabel: {
          render: 'percentage',
          fontColor: '#06467C',
          precision: 2,
          position: 'outside',
          segment: false
        },
        legend: <IChartLegend>{
          display: true,
          position: 'bottom',
          fullWidth: true
        }
      }
  }
  if(!this.categoryChart){
    this.categoryChart = new Chart(document.getElementById("category-chart"), chartData);
  } else {
    this.categoryChart.data = chartData.data;
    this.categoryChart.update();
  }
    

    // this.itemCategoryChartData = <any>{
    //   type: 'pie',
    //   labels: this.categories,
    //   datasets: [
    //     {
    //       data: this.amounts,
    //       backgroundColor: [
    //         '#00998d','#06467c',"#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"
    //       ]
    //     }
    //   ],
      
    // }

    // this.itemCategoryChartOptions = <IChartOptions>{
    //   title: <IChartTitle>{
    //     display: false,
    //     text: ''
    //   },
    //   pieceLabel: {
    //     render: 'percentage',
    //     fontColor: '#06467C',
    //     precision: 2
    //   },
    //   legend: <IChartLegend>{
    //     display: true,
    //     position: 'bottom',
    //     fullWidth: true
    //   },
    //   legendCallback: function(chart) {
    //     var text = []; 
    //     text.push('<ul class="' + chart.id + '-legend">'); 
    //     for (var i = 0; i < chart.data.datasets.length; i++) { 
    //         text.push('<li><span style="background-color:' + 
    //                   chart.data.datasets[i].backgroundColor + 
    //                   '"></span>'); 
    //         if (chart.data.datasets[i].label) { 
    //             text.push(chart.data.datasets[i].label); 
    //         } 
    //         text.push('</li>'); 
    //     } 
    //     text.push('</ul>'); 
    //     return text.join(''); 
    //   }
    // }
    // this.itemCategoryChartData = <any>{
    //   // type: 'doughnut',
    //   labels: this.categories,
    //   // centerText: {
    //   //   display: true,
    //   //   text: "280"
    //   // },
      
    //   datasets: [
    //     {
    //       data: this.amounts,
    //       backgroundColor: [
    //         '#00998d',
    //         '#06467c',
    //         '#994f9c',
    //         '#b5bd32',
    //         '#137ca8',
    //         '#E93D42',
    //         '#06467c',
    //         '#994f9c',
    //         '#b5bd32',
    //         '#00998d',
    //         '#137ca8',
    //         '#E93D42',
    //         '#00998d',
    //         '#06467c',
    //         '#994f9c',
    //         '#b5bd32',
    //         '#137ca8',
    //         '#E93D42'
    //         // 'rgba(255, 99, 132, 0.2)',
    //         // 'rgba(54, 162, 235, 0.2)',
    //         // 'rgba(255, 206, 86, 0.2)',
    //         // 'rgba(75, 192, 192, 0.2)',
    //         // 'rgba(153, 102, 255, 0.2)',
    //         // 'rgba(255, 159, 64, 0.2)'
    //       ],
    //       borderColor: []
    //     }
    //   ],
    //   // plugins: [{
    //   //   // beforeDraw: function(chart, options) {
    //   //   //   // if (chart.config.centerText.display !== null &&
    //   //   //   //     typeof chart.config.centerText.display !== 'undefined' &&
    //   //   //   //     chart.config.centerText.display) {
    //   //   //     var width = chart.chart.width,
    //   //   //     height = chart.chart.height,
    //   //   //     ctx = chart.chart.ctx;
         
    //   //   //     ctx.restore();
    //   //   //     var fontSize = (height / 114).toFixed(2);
    //   //   //     ctx.font = fontSize + "em sans-serif";
    //   //   //     ctx.textBaseline = "middle";
         
    //   //   //     var text = chart.config.centerText.text,
    //   //   //     textX = Math.round((width - ctx.measureText(text).width) / 2),
    //   //   //     textY = height / 2;
         
    //   //   //     ctx.fillText(text, textX, textY);
    //   //   //     ctx.save();
    //   //   //   // }
    //   //   // }
    //   // }]
    // }

    // this.itemCategoryChartOptions = <any>{
    //   cutoutPercentage: 60,
    //   // scaleShowLabels : false,
    //   title: <IChartTitle>{
    //     display: false,
    //     text: ''
    //   },
    //   pieceLabel: {
    //     render: 'percentage',
    //     fontColor: '#fff',
    //     precision: 2
    //   },
    //   legend: <IChartLegend>{
    //     display: true,
    //     position: 'bottom',
    //     fullWidth: true
    //   },
    //   scales: {
    //     yAxes: [{
    //         ticks: {
    //             beginAtZero: true,
    //             callback: function(value, index, values) {
    //                 return '';
    //             },
    //         },
    //         gridLines: {
    //             display: false,
    //             drawBorder: false,
    //         },
    //     }],
    //     xAxes: [{
    //         ticks: {
    //             beginAtZero: true,
    //             callback: function(value, index, values) {
    //                 return '';
    //             },
    //         },
    //         gridLines: {
    //             display: false,
    //             drawBorder: false,
    //         },
    //     }],
    // },
    //   // scales: {
    //   //   xAxes: [{
    //   //       display: false,
    //   //       ticks: {
    //   //         display: false
    //   //       }
    //   //   }],
    //   //   yAxes: [{
    //   //     display: false,
    //   //     ticks: {
    //   //       display: false
    //   //     }
    //   //   }]
    //   // },

    //   legendCallback: function(chart) {
    //     var text = [];
    //     text.push('<ul class="' + chart.id + '-legend">');
    //     for (var i = 0; i < chart.data.datasets.length; i++) {
    //         text.push('<li><span style="background-color:' +
    //                   chart.data.datasets[i].backgroundColor +
    //                   '"></span>');
    //         if (chart.data.datasets[i].label) {
    //             text.push(chart.data.datasets[i].label);
    //         }
    //         text.push('</li>');
    //     }
    //     text.push('</ul>');
    //     return text.join('');
    //   }
    // }



  }

  drawTotals(chart) {
 
    var width = chart.chart.width,
    height = chart.chart.height,
    ctx = chart.chart.ctx;
 
    ctx.restore();
    var fontSize = (height / 114).toFixed(2);
    ctx.font = fontSize + "em sans-serif";
    ctx.textBaseline = "middle";
 
    var text = chart.config.centerText.text,
    textX = Math.round((width - ctx.measureText(text).width) / 2),
    textY = height / 2;
 
    ctx.fillText(text, textX, textY);
    ctx.save();
}
 
  // chart to show expense/income by month
  buildMonthlyChart = (timespan: number) => {
    let items = cloneDeep(this.items);
    let monthlyCashFlowTotals = [];
    let months = [];

    let i = timespan;
    while(i >= 0){
      monthlyCashFlowTotals[timespan - i] = 0;
      // monthlyCashFlowTotals[i] = {
      //   x: moment().subtract(i, 'month').startOf('month').format('MMM YY'),
      //   y: 0
      // };
      months[timespan - i] = moment().subtract(i, 'month').startOf('month').format('MMM YY');
      i--;
    }
    items.forEach(item => {
      let j= timespan;
      while(j >= 0){
        if((item.type ===  this.selectedItemType || item.type === 'expense' )&& (item.date >= moment().subtract(j, 'month').startOf('month').unix() && item.date < moment().subtract(j, 'month').endOf('month').unix())){
          monthlyCashFlowTotals[timespan - j] += parseFloat(item.totalAmount || item.amount);
        }
        j--;
      }
    });

    this.showMonthlyChart = sum(monthlyCashFlowTotals) > 0;

    this.monthlyChartData = <IChartData>{
      labels: months,
      datasets: [
        {
          label: 'Total ' + (this.selectedItemType > 0 ? 'Income' : 'Expenses'),
          data: monthlyCashFlowTotals,
          backgroundColor: [
            '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c'
            // '#551A8B',
            // '#551A8B',
            // '#551A8B',
            // '#551A8B',
            // '#551A8B',
            // '#551A8B'
            // '#06467c',
            //   '#06467c',
            //   '#994f9c',
            //   '#b5bd32',
            //   '#137ca8',
            //   '#00447e'
            // 'rgba(255, 99, 132, 0.2)',
            // 'rgba(54, 162, 235, 0.2)',
            // 'rgba(255, 206, 86, 0.2)',
            // 'rgba(75, 192, 192, 0.2)',
            // 'rgba(153, 102, 255, 0.2)',
            // 'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: []
        }
      ],

    }

    this.monthlyChartOptions = <IChartOptions>{
      title: <IChartTitle>{
        display: false,
        text: ''
      },
      legend: <IChartLegend>{
        display: false,
        position: 'bottom',
        fullWidth: true
      },
      scales: {
        xAxes: [{
            display: true,
            stacked: true,
            barThickness: 25,
            
            gridLines: {
              color: '#fff',
              offsetGridLines: false,
              zeroLineColor: '#fff',
              zeroLineWidth: 1,
              lineWidth: 0
            }
            
        }],
        yAxes: [{
          display: true,
          stacked: true,
          barThickness: 25,
          gridLines: {
            // display: false,
            color: '#fff',
            offsetGridLines: false,
            zeroLineColor: '#f5f5f5',
            zeroLineWidth: 1,
          },
          plotLines: [{
            color: '#FF0000',
            width: 2,
            value: 600 
          }]
        }]
      },
      annotation: {
        annotations: [{
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y-axis-0',
            value: this.budgetSettings.monthly,
            borderColor: 'red',
            borderWidth: 1,
            // label: {
            //   fontColor: "#999c9e",
            //   backgroundColor: "white",
            //   content: "Budget Limit",
            //   enabled: true,
            // },
        }]
      }
    }
  }

  buildWeeklyChart = (chartType = 'weekly') => {
    let timespan = 0;
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    let items = cloneDeep(this.items);

    if(chartType == 'weekly'){
      let m = moment();
      var lastOfMonth     = m.clone().endOf('month'),
      firstOfMonth    = m.clone().startOf('month'),
      currentWeek     = firstOfMonth.clone().day(0),
      weeks = [];
      while (currentWeek < lastOfMonth) {
        let startOfWeek = this.sameMonth(currentWeek.clone().day(0), firstOfMonth, firstOfMonth);
        let endOfWeek = this.sameMonth(currentWeek.clone().day(6), firstOfMonth, lastOfMonth);
        var week = {start: startOfWeek.format(), end: endOfWeek.format()};
        weeks.push(week);
        labels.push(startOfWeek.date() + '-' + endOfWeek.date());
        currentWeek.add('d', 7);

        incomeData.push(0);
        expenseData.push(0);
      }
      timespan = labels.length;
      items.forEach(item => {
        let j= 0;
        while(j < timespan){
          if(item.date >= moment(weeks[j].start).unix() && item.date < moment(weeks[j].end).unix()){
            if((item.type === ITEM_TYPE.expense )){
              expenseData[j] += parseFloat(item.totalAmount || item.amount);
            } else {
              incomeData[j] += parseFloat(item.totalAmount || item.amount);
            }
          }
          j++;
        }
      });
    }

    this.showWeeklyExpenseChart =  sum(expenseData) > 0;

    this.weeklyExpenseChartData = <IChartData>{
      labels: labels,
      datasets: [
        {
          label: 'Expense',
          data: expenseData,
          backgroundColor: [
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c'
              
          ],
          borderColor: []
        }
      ],

    }

    this.weeklyExpenseChartOptions = <IChartOptions>{
      title: <IChartTitle>{
        display: false,
        text: ''
      },
      legend: <IChartLegend>{
        display: false,
        position: 'bottom',
        fullWidth: true
      },
      scales: {
        xAxes: [{
            display: true,
            stacked: true,
            barThickness: 25,
            
            gridLines: {
              color: '#fff',
              offsetGridLines: false,
              zeroLineColor: '#fff',
              zeroLineWidth: 1,
              lineWidth: 0
            }
            
        }],
        yAxes: [{
          display: true,
          stacked: true,
          gridLines: {
            // display: false,
            color: '#fff',
            offsetGridLines: false,
            zeroLineColor: '#f5f5f5',
            zeroLineWidth: 1,
          }
        }]
      },
      annotation: {
        annotations: [{
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y-axis-0',
            value: this.budgetSettings.weekly,
            borderColor: 'red',
            borderWidth: 1,
            // label: {
            //   fontColor: "#999c9e",
            //   backgroundColor: "white",
            //   content: "Budget Limit",
            //   enabled: true,
            // },
        }]
      }
    }

  }

  buildYearlyChart(){
    let timespan = 0;
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    let items = cloneDeep(this.items);

    if(true){
      timespan = 5;
      let i = timespan;
      while(i >= 0){
        incomeData[timespan - i] = 0;
        expenseData[timespan - i] = 0;
        // monthlyCashFlowTotals[i] = {
        //   x: moment().subtract(i, 'month').startOf('month').format('MMM YY'),
        //   y: 0
        // };
        labels[timespan - i] = moment().subtract(i, 'year').startOf('year').format('YYYY');
        i--;
      }

      items.forEach(item => {
        let j= timespan;
        while(j >= 0){
          if(item.date >= moment().subtract(j, 'year').startOf('year').unix() && item.date < moment().subtract(j, 'year').endOf('year').unix()){
            if((item.type === ITEM_TYPE.expense )){
              expenseData[timespan - j] += parseFloat(item.totalAmount || item.amount);
            } else {
              incomeData[timespan - j] += parseFloat(item.totalAmount || item.amount);
            }
          }
          j--;
        }
      });
    }

    this.showYearlyExpenseChart = sum(expenseData) > 0;

    this.yearlyExpenseChartData = <IChartData>{
      labels: labels,
      datasets: [
        {
          label: 'Expense',
          data: expenseData,
          backgroundColor: [
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c'
              
          ],
          borderColor: []
        }
      ],

    }

    this.yearlyExpenseChartOptions = <IChartOptions>{
      title: <IChartTitle>{
        display: false,
        text: ''
      },
      legend: <IChartLegend>{
        display: false,
        position: 'bottom',
        fullWidth: true
      },
      scales: {
        xAxes: [{
            display: true,
            stacked: true,
            barThickness: 25,
            
            gridLines: {
              color: '#fff',
              offsetGridLines: false,
              zeroLineColor: '#fff',
              zeroLineWidth: 1,
              lineWidth: 0
            }
            
        }],
        yAxes: [{
          display: true,
          stacked: true,
          gridLines: {
            // display: false,
            color: '#fff',
            offsetGridLines: false,
            zeroLineColor: '#f5f5f5',
            zeroLineWidth: 1,
          }
        }]
      },
      annotation: {
        annotations: [{
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y-axis-0',
            value: this.budgetSettings.yearly,
            borderColor: 'red',
            borderWidth: 1,
            // label: {
            //   fontColor: "#999c9e",
            //   backgroundColor: "white",
            //   content: "Budget Limit",
            //   enabled: true,
            // },
        }]
      }
      
    }
  }

  toggleCategoryChartType = (type: string) => {
    // this.itemCategoryChartTypeIndex = this.itemCategoryChartTypeIndex + 1 < this.itemCategoryChartTypes.length ? this.itemCategoryChartTypeIndex + 1 : 0;
    // this.itemCatgeoryChartType = this.itemCategoryChartTypes[this.itemCategoryChartTypeIndex];
  }

  toggleMonthlyChartType = () => {
    this.monthlyChartTypeIndex = this.monthlyChartTypeIndex + 1 < this.monthlyChartTypes.length ? this.monthlyChartTypeIndex + 1 : 0;
    this.monthlyChartType = this.monthlyChartTypes[this.monthlyChartTypeIndex];
  }

  showCategoryItems = (items) => {
    console.log(items);
    let modal = this.modalCtrl.create(CategoryItemsModal, { categoryItems: items });
      modal.present();
  }

  expenseVsIncomeChart(){
    let timespan = 0;
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    let items = cloneDeep(this.items);

      timespan = 5;
      let i = timespan;
      while(i >= 0){
        incomeData[timespan - i] = 0;
        expenseData[timespan - i] = 0;
        // monthlyCashFlowTotals[i] = {
        //   x: moment().subtract(i, 'month').startOf('month').format('MMM YY'),
        //   y: 0
        // };
        labels[timespan - i] = moment().subtract(i, 'year').startOf('year').format('YYYY');
        i--;
      }

      items.forEach(item => {
        let j= timespan;
        while(j >= 0){
          if(item.date >= moment().subtract(j, 'year').startOf('year').unix() && item.date < moment().subtract(j, 'year').endOf('year').unix()){
            if((item.type === ITEM_TYPE.expense )){
              expenseData[timespan - j] -= parseFloat(item.totalAmount || item.amount);
            } else {
              incomeData[timespan - j] += parseFloat(item.totalAmount || item.amount);
            }
          }
          j--;
        }
      });
    

    this.showIncomeVsExpenseChart = sum(incomeData) > 0 || sum(expenseData) < 0;

    this.incomeVsExpenseChartData = <IChartData>{
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: [
            '#00998d',
            '#00998d',
            '#00998d',
            '#00998d',
            '#00998d',
            '#00998d'
          ],
          borderColor: []
        },
        {
          label: 'Expense',
          data: expenseData,
          backgroundColor: [
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c'
              
          ],
          borderColor: []
        }
      ],

    }

    this.incomeVsExpenseChartOptions = <IChartOptions>{
      title: <IChartTitle>{
        display: false,
        text: ''
      },
      legend: <IChartLegend>{
        display: true,
        position: 'bottom',
        fullWidth: true,
        lables: <IChartLegendLabel>{
          boxWidth: 50,
          generateLabels: () => <IChartLegendItem>{
            fillStyle: '#fff'
          }
        }
      },
      scales: {
        xAxes: [{
            display: true,
            stacked: true,
            barThickness: 25,
            
            gridLines: {
              color: '#fff',
              offsetGridLines: false,
              zeroLineColor: '#fff',
              zeroLineWidth: 1,
              lineWidth: 0
            }
            
        }],
        yAxes: [{
          display: true,
          stacked: true,
          gridLines: {
            // display: false,
            color: '#fff',
            offsetGridLines: false,
            zeroLineColor: '#f5f5f5',
            zeroLineWidth: 1,
          }
        }]
      }
      // legendCallback: function(chart) {
      //   var text = [];
      //   text.push('<ul class="' + chart.id + '-legend">');
      //   for (var i = 0; i < chart.data.datasets.length; i++) {
      //       text.push('<li><span style="background-color:' +
      //                 chart.data.datasets[i].backgroundColor +
      //                 '"></span>');
      //       if (chart.data.datasets[i].label) {
      //           text.push(chart.data.datasets[i].label);
      //       }
      //       text.push('</li>');
      //   }
      //   text.push('</ul>');
      //   return text.join('');
      // }
    }

  }

  expenseVsIncomeMonthlyChart(){
    let timespan = 0;
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    let items = cloneDeep(this.items);

      timespan = 5;
      let i = timespan;
      while(i >= 0){
        incomeData[timespan - i] = 0;
        expenseData[timespan - i] = 0;
        // monthlyCashFlowTotals[i] = {
        //   x: moment().subtract(i, 'month').startOf('month').format('MMM YY'),
        //   y: 0
        // };
        labels[timespan - i] = moment().subtract(i, 'month').startOf('month').format('MMM YY');
        i--;
      }

      items.forEach(item => {
        let j= timespan;
        while(j >= 0){
          if(item.date >= moment().subtract(j, 'month').startOf('month').unix() && item.date < moment().subtract(j, 'month').endOf('month').unix()){
            if((item.type === ITEM_TYPE.expense )){
              expenseData[timespan - j] -= parseFloat(item.totalAmount || item.amount);
            } else {
              incomeData[timespan - j] += parseFloat(item.totalAmount || item.amount);
            }
          }
          j--;
        }
      });
    

    this.showIncomeVsExpenseMonthlyChart = sum(incomeData) > 0 || sum(expenseData) < 0;

    this.incomeVsExpenseMonthlyChartData = <any>{
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          fill: false,
          borderColor: '#00998d',
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          backgroundColor: [
            '#00998d',
            '#00998d',
            '#00998d',
            '#00998d',
            '#00998d',
            '#00998d'
          ],
        },
        {
          label: 'Expense',
          fill: false,
          data: expenseData,
          fillColor: "rgba(151,187,205,0.2)",
          strokeColor: "rgba(151,187,205,1)",
          pointColor: "rgba(151,187,205,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(151,187,205,1)",
          backgroundColor: [
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c'
              
          ],
          borderColor: '#06467c'
        }
      ]

    }

    this.incomeVsExpenseMonthlyChartOptions = <IChartOptions>{
      title: <IChartTitle>{
        display: false,
        text: ''
      },
      legend: <IChartLegend>{
        display: true,
        position: 'bottom',
        fullWidth: true
      },
      scales: {
        xAxes: [{
            display: true,
            barThickness: 25,
            stacked: true,
            gridLines: {
              color: '#fff',
              offsetGridLines: false,
              zeroLineColor: '#fff',
              zeroLineWidth: 1,
              lineWidth: 0
            }
            
        }],
        yAxes: [{
          display: true,
          stacked: true,
          barThickness: 25,
          gridLines: {
            // display: false,
            color: '#fff',
            offsetGridLines: false,
            zeroLineColor: '#f5f5f5',
            zeroLineWidth: 1,
          }
        }]
      }
    }

  }

  expenseVsIncomeWeeklyChart(){
    let timespan = 0;
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    let items = cloneDeep(this.items);

      let m = this.selectedDateRange.endDate.clone();
      var lastOfMonth     = m.clone().endOf('month'),
      firstOfMonth    = m.clone().startOf('month'),
      currentWeek     = firstOfMonth.clone().day(0),
      weeks = [];
      while (currentWeek < lastOfMonth) {
        let startOfWeek = this.sameMonth(currentWeek.clone().day(0), firstOfMonth, firstOfMonth);
        let endOfWeek = this.sameMonth(currentWeek.clone().day(6), firstOfMonth, lastOfMonth);
        var week = {start: startOfWeek.format(), end: endOfWeek.format()};
        weeks.push(week);
        labels.push(startOfWeek.date() + '-' + endOfWeek.date());
        currentWeek.add('d', 7);

        incomeData.push(0);
        expenseData.push(0);
      }
      timespan = labels.length;
      items.forEach(item => {
        let j= 0;
        while(j < timespan){
          if(item.date >= moment(weeks[j].start).unix() && item.date < moment(weeks[j].end).unix()){
            if((item.type === ITEM_TYPE.expense )){
              expenseData[j] += parseFloat(item.totalAmount || item.amount);
            } else {
              incomeData[j] += parseFloat(item.totalAmount || item.amount);
            }
          }
          j++;
        }
      });

    this.showIncomeVsExpenseWeeklyChart = sum(incomeData) > 0 || sum(expenseData) < 0;

    this.incomeVsExpenseWeeklyChartData = <IChartData>{
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: [
            '#00998d',
            '#00998d',
            '#00998d',
            '#00998d',
            '#00998d',
            '#00998d'
          ],
          borderColor: []
        },
        {
          label: 'Expense',
          data: expenseData,
          backgroundColor: [
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c',
              '#06467c'
              
          ],
          borderColor: []
        }
      ],

    }

    this.incomeVsExpenseWeeklyChartOptions = <IChartOptions>{
      title: <IChartTitle>{
        display: false,
        text: ''
      },
      legend: <IChartLegend>{
        display: true,
        position: 'bottom',
        fullWidth: true
      },
      scales: {
        xAxes: [{
            display: true,
            stacked: false,
            barThickness: 20,
            
            gridLines: {
              color: '#fff',
              offsetGridLines: false,
              zeroLineColor: '#fff',
              zeroLineWidth: 1,
              lineWidth: 0
            }
            
        }],
        yAxes: [{
          display: true,
          stacked: false,
          gridLines: {
            // display: false,
            color: '#fff',
            offsetGridLines: false,
            zeroLineColor: '#f5f5f5',
            zeroLineWidth: 1,
          }
        }]
      }
    }

  }

  categoryMonthlyChart(){
    let timespan = 0;
    let labels = [];
    let categories = [];
    let incomeData = [];
    let expenseData = {};
    let items = cloneDeep(this.items);

    const itemsGroupedByType = chain(items)
      .groupBy('type')
      .map((val, k) => {
        var totalAmountByType = 0;
        var categories = [];
        var amounts = [];
        var itemBycategory = chain(val)
            .groupBy('category'||'merchantName')
            .map((value, key) => {
              if(key === 'undefined'){
                return;
              }
              var totalAmtByCategory = sumBy(value, (v) => parseFloat(v.totalAmount || v.amount));
              totalAmountByType += totalAmtByCategory;

              categories.push(key);
              amounts.push(totalAmtByCategory);
              return {
                categoryName: key,
                totalAmount: totalAmtByCategory,
                items: value
              };
            }).value();
        return {
          type: k,
          totalAmount: totalAmountByType,
          categories: categories,
          amounts: amounts,
          items: itemBycategory
        };
      }).value();

    var groupedItems = itemsGroupedByType[this.selectedItemType];
    if(groupedItems){
      categories = groupedItems.categories;
    } else {
      categories = [];
    }

    if(!categories.length){
      this.showItemCategoryMonthlyChartData = false;
      return;
    } 
    categories.forEach((cat) => {
      expenseData[cat] = {
        name: cat,
        data: []
      };

    })
    
      timespan = 5;
      let i = timespan;
      while(i >= 0){
        categories.forEach((cat) => {
            expenseData[cat].data[timespan - i] = 0                
        })
        // monthlyCashFlowTotals[i] = {
        //   x: moment().subtract(i, 'month').startOf('month').format('MMM YY'),
        //   y: 0
        // };
        labels[timespan - i] = moment().subtract(i, 'month').startOf('month').format('MMM YY');
        i--;
      }

      items.forEach(item => {
        let j= timespan;
        while(j >= 0){
          if(item.date >= moment().subtract(j, 'month').startOf('month').unix() && item.date < moment().subtract(j, 'month').endOf('month').unix()){
            if((item.type === ITEM_TYPE.expense )){
              if(expenseData[item.category|| item.merchantName]){
                expenseData[item.category|| item.merchantName].data[timespan - j] += parseFloat(item.totalAmount || item.amount);
              }
            }
          }
          j--;
        }
      });
    
    this.showItemCategoryMonthlyChartData = categories.length > 0;

    const sampleDataSet = {
      label: 'Income',
      data: incomeData,
      fill: false,
      borderColor: '#00998d',
      fillColor: "rgba(220,220,220,0.2)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)",
    };
    const dataSets = [];
    const colors = [
      '#00998d',
              '#06467c',
              '#994f9c',
              '#b5bd32',
              '#137ca8',
              '#E93D42',
              '#06467c',
              '#994f9c',
              '#b5bd32',
              '#00998d',
              '#137ca8',
              '#E93D42',
              '#00998d',
              '#06467c',
              '#994f9c',
              '#b5bd32',
              '#137ca8',
              '#E93D42'
    ]

    categories.forEach((cat, index) => {
        const set = cloneDeep(sampleDataSet);
        set.label = cat;
        set.data = expenseData[cat].data;
        set.borderColor = colors[index]
        dataSets.push(set)           
    })

    console.log(dataSets);
    this.itemCategoryMonthlyChartData = <any>{
      labels: labels,
      datasets: dataSets
      // [
      //   {
      //     label: 'Income',
      //     data: incomeData,
      //     fill: false,
      //     borderColor: '#00998d',
      //     fillColor: "rgba(220,220,220,0.2)",
      //     strokeColor: "rgba(220,220,220,1)",
      //     pointColor: "rgba(220,220,220,1)",
      //     pointStrokeColor: "#fff",
      //     pointHighlightFill: "#fff",
      //     pointHighlightStroke: "rgba(220,220,220,1)",
      //   },
      //   {
      //     label: 'Expense',
      //     fill: false,
      //     data: expenseData,
      //     fillColor: "rgba(151,187,205,0.2)",
      //     strokeColor: "rgba(151,187,205,1)",
      //     pointColor: "rgba(151,187,205,1)",
      //     pointStrokeColor: "#fff",
      //     pointHighlightFill: "#fff",
      //     pointHighlightStroke: "rgba(151,187,205,1)",
      //     borderColor: '#06467c'
      //   }
      // ]

    }

    this.itemCategoryChartOptions = <IChartOptions>{
      title: <IChartTitle>{
        display: false,
        text: ''
      },
      legend: <IChartLegend>{
        display: true,
        position: 'bottom',
        fullWidth: true
      },
      scales: {
        xAxes: [{
            display: true,
            barThickness: 25,
            
            gridLines: {
              color: '#fff',
              offsetGridLines: false,
              zeroLineColor: '#fff',
              zeroLineWidth: 1,
              lineWidth: 0
            }
            
        }],
        yAxes: [{
          display: true,
          stacked: false,
          gridLines: {
            // display: false,
            color: '#fff',
            offsetGridLines: false,
            zeroLineColor: '#f5f5f5',
            zeroLineWidth: 1,
          }
        }]
      },
      legendCallback: function(chart) { 
        var text = []; 
        text.push('<ul class="' + chart.id + '-legend">'); 
        for (var i = 0; i < chart.data.datasets.length; i++) { 
            text.push('<li><span style="background-color:' + 
                       chart.data.datasets[i].borderColor + 
                       '"></span>'); 
            if (chart.data.datasets[i].label) { 
                text.push(chart.data.datasets[i].label); 
            } 
            text.push('</li>'); 
        } 
        text.push('</ul>'); 
        return text.join(''); 
      }
    }

  }

  sameMonth (a, b, other) {
    if (a.month() !== b.month()) {
        return other;
    }
    return a;
  }
}



const mockData = [
  {
    id: '1',
    date:  '03-12-2019',
    merchantType: 'Restaurant',
    paymentType: 'visa',
    totalAmount: 95,
    type: ITEM_TYPE.expense
  },
  {
    id: '1',
    date:  '03-03-2019',
    merchantType: 'Supermarket',
    paymentType: 'visa',
    totalAmount: 25,
    type: ITEM_TYPE.expense
  },
  {
    id: '1',
    date:  '02-02-2019',
    merchantType: 'Food',
    paymentType: 'visa',
    totalAmount: 45,
    type: ITEM_TYPE.expense
  },
  {
    id: '1',
    date:  '02-03-2019',
    merchantType: 'Clothes',
    paymentType: 'visa',
    totalAmount: 65,
    type: ITEM_TYPE.expense
  },
  {
    id: '1',
    date:  '01-03-2019',
    merchantType: 'Grocery',
    paymentType: 'visa',
    totalAmount: 100,
    type: ITEM_TYPE.expense
  },
  {
    id: '1',
    date:  '09-03-2018',
    merchantType: 'Restaurant',
    paymentType: 'visa',
    totalAmount: 45,
    type: ITEM_TYPE.expense
  },
  {
    id: '1',
    date:  '09-03-2018',
    merchantType: 'Medical',
    paymentType: 'visa',
    totalAmount: 45,
    type: ITEM_TYPE.expense
  },
  {
    id: '1',
    date:  '03-03-2019',
    merchantType: 'Medical',
    paymentType: 'visa',
    totalAmount: 45,
    type: ITEM_TYPE.expense
  },
  {
    id: '1',
    date:  '03-03-2019',
    merchantType: 'Restaurant',
    paymentType: 'visa',
    totalAmount: 45,
    type: ITEM_TYPE.expense
  }
]
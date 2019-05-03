import { Component, Input, ChangeDetectorRef, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';

import { TIMEFRAME } from '../../app/enums';

@Component({
  selector: 'bp-datepicker',
  templateUrl: 'datepicker.html'
})
export class DatepickerComponent implements OnInit {
  @Input() date: any; // moment
  @Input() timeFrameIndex: number = 0;
  @Input() showCalendarBtns: boolean = true;
  @Input() needDateRange: boolean = true;
  @Output() onDateChange = new EventEmitter();

  @ViewChild('calendar') calendar: any;
  @ViewChild('from') from: any;
  @ViewChild('to') to: any;

  displayText: string = '';
  showCalendar:  boolean = false;
  selectedTimeFrameIndex: number = 0;
  selectedDay = moment();
  startDate = moment();
  endDate = moment();

  view: string = 'month';
  mwlCalendarTitle:  string = '';
  viewDate: Date = new Date();
  events = [];
  
  openCount: number = 0;

  fromDate = new FormControl(new Date());
  toDate = new FormControl(new Date());
  calendarSelectedDate = new FormControl(new Date());
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private storage: Storage
  ) {

    this.storage.get('bp-daterange').then((val) => {
      if(val){
        let dateRange: IDateRange = JSON.parse(val);
        const selectedDateRange = <IDateRange>{
          startDate: moment(dateRange.startDate).startOf('day'),
          endDate: moment(dateRange.endDate).endOf('day'),
          timeFrameIndex: dateRange.timeFrameIndex
        }
        // remove this to not sync datepicker for reports view
        this.selectedDay = selectedDateRange.startDate;
        this.selectedTimeFrameIndex = selectedDateRange.timeFrameIndex;
        this.setTimeFrame(selectedDateRange.timeFrameIndex);
      } else {
        this.selectedDay = this.date ? this.date : moment();
        this.selectedTimeFrameIndex = this.timeFrameIndex >0 ? this.timeFrameIndex : 0;
        this.setTimeFrame(this.selectedTimeFrameIndex);
      }
    })

    this.fromDate.valueChanges.subscribe((val) => {
      if(moment(this.toDate.value).isBefore(val)){
        this.toDate.setValue(this.fromDate.value);
      }
      if(!this.needDateRange){
        this.onDateChange.next(moment(val));
        this.showCalendar = false;
      }
    })

    
  }

  ngOnInit(){
    console.log(this.date);
    if(!this.needDateRange){
      this.calendarSelectedDate.setValue(this.date.toDate())

      this.calendarSelectedDate.valueChanges.subscribe((val) => {
        // this.startDate = this.selectedDay.clone().startOf('day');
        // this.endDate = this.selectedDay.clone().endOf('day');
        const selectedDate = moment(val);
        this.displayText = selectedDate.format('MMM DD, YYYY');
        this.onDateChange.next({ startDate: selectedDate });
  
        document.body.classList.remove('just-calendar');
        this.showCalendar = false;
        this.calendar.close()
      })
    }
    
  }

  selectDateRange(){
    this.startDate = moment(this.fromDate.value || new Date());
    this.endDate = moment(this.toDate.value || this.startDate);
    this.setDisplayTimeFrame();
    this.selectedTimeFrameIndex = -1;
    this.showCalendar = false;
  }

  // onDatepickerChange(type: string, event: MatDatepickerInputEvent<Date>) {
  //   this.showCalendar = !this.showCalendar;
  //   this.onDaySelect(event);
  //   console.log(event);
  // }

  saveToLocalStorage = () => {
    let dateRange = <IDateRange>{
      startDate: this.startDate,
      endDate: this.endDate,
      timeFrameIndex: this.selectedTimeFrameIndex
    }
    this.storage.set('bp-daterange', JSON.stringify(dateRange))
  }

  toggleShowCalendar = () => {
    this.showCalendar = !this.showCalendar;
    if(this.showCalendar){
      document.body.classList.add('date-range-picker');
      if(!this.needDateRange){
        document.body.classList.add('just-calendar');
        this.calendar.open();
      }
    } else {
      document.body.classList.remove('date-range-picker');
      if(!this.needDateRange){
        document.body.classList.remove('just-calendar');
        this.calendar.close();
      } else {
        this.from.close();
        this.to.close();
      }
    }
  }

  nextInSelectedTimeFrame = () => {
    if(this.selectedTimeFrameIndex === TIMEFRAME.today) {
      this.nextDay();
    } else if(this.selectedTimeFrameIndex === TIMEFRAME.week) {
      this.nextWeek();
    } else if(this.selectedTimeFrameIndex === TIMEFRAME.month) {
      this.nextMonth();
    } else if(this.selectedTimeFrameIndex === TIMEFRAME.year){
      this.nextYear();
    } else {
      this.nextDay();
    }
    
  }

  previousInSelectedTimeFrame = () => {
    if(this.selectedTimeFrameIndex === TIMEFRAME.today) {
      this.previousDay();
    } else if(this.selectedTimeFrameIndex === TIMEFRAME.week) {
      this.previousWeek();
    } else if(this.selectedTimeFrameIndex === TIMEFRAME.month) {
      this.previousMonth();
    } else if(this.selectedTimeFrameIndex === TIMEFRAME.year){
      this.previousYear();
    } else {
      this.previousDay();
    }
  }

  setDateToToday = () => {
    this.selectedDay = moment();
    this.selectedTimeFrameIndex = TIMEFRAME.today;
    this.setTimeFrame(TIMEFRAME.today);

    document.body.classList.remove('date-range-picker');
  }

  setTimeFrame = (index: number) => {
    this.selectedTimeFrameIndex = index;
    if(index === TIMEFRAME.today || index === TIMEFRAME.day) {
      this.setDayTimeFrame();
    } else if(index === TIMEFRAME.week) {
      this.setWeekTimeFrame();
    } else if(index === TIMEFRAME.month) {
      this.setMonthTimeFrame();
    } else {
      this.setYearTimeFrame();
    }
    this.showCalendar = false;
    document.body.classList.remove('date-range-picker');
  }

  emitDateChangeEvent = () => {
    var dateRange: IDateRange = {
      startDate: this.startDate, 
      endDate: this.endDate,
      timeFrameIndex: this.selectedTimeFrameIndex
    }
    this.fromDate.setValue(this.startDate.toDate());
    this.toDate.setValue(this.endDate.toDate());
    this.saveToLocalStorage();
    this.onDateChange.next(dateRange);
  }

  setDisplayTimeFrame = () => {
    this.displayText = this.startDate.format('MMM DD, YYYY');
    this.displayText += ' - ' + this.endDate.format('MMM DD, YYYY');
    this.emitDateChangeEvent();
  }
  setDayTimeFrame = (day?: any) => {
    this.startDate = this.selectedDay.clone().startOf('day');
    this.endDate = this.selectedDay.clone().endOf('day');
    this.displayText = this.selectedDay.format('MMM DD, YYYY');
    this.emitDateChangeEvent();
  }

  setWeekTimeFrame = () => {
    this.startDate = this.selectedDay.clone().startOf('week');
    this.endDate = this.selectedDay.clone().endOf('week');
    this.setDisplayTimeFrame();
  }

  setMonthTimeFrame = () => {
    this.startDate = this.selectedDay.clone().startOf('month');
    this.endDate = this.selectedDay.clone().endOf('month');
    this.setDisplayTimeFrame();
  }

  setYearTimeFrame = () => {
    this.startDate = this.selectedDay.clone().startOf('year');
    this.endDate = this.selectedDay.clone().endOf('year');
    this.setDisplayTimeFrame();
  }

  nextDay = () => {
    this.selectedDay = this.selectedDay.add(1, 'day');
    this.setDayTimeFrame();
  }

  previousDay = () => {
    this.selectedDay = this.selectedDay.subtract(1, 'day');
    this.setDayTimeFrame();
  }

  nextWeek = () => {
    this.selectedDay = this.selectedDay.add(1, 'week');
    this.setWeekTimeFrame();
  }

  previousWeek = () => {
    this.selectedDay = this.selectedDay.subtract(1, 'week');
    this.setWeekTimeFrame();
  }

  nextMonth = () => {
    this.selectedDay = this.selectedDay.add(1, 'month');
    this.setMonthTimeFrame();
  }

  previousMonth = () => {
    this.selectedDay = this.selectedDay.subtract(1, 'month');
    this.setMonthTimeFrame();
  }

  nextYear = () => {
    this.selectedDay = this.selectedDay.add(1, 'year');
    this.setYearTimeFrame();
  }

  previousYear = () => {
    this.selectedDay = this.selectedDay.subtract(1, 'year');
    this.setYearTimeFrame();
  }

  // mwl calendar
  // nextMwlCalendarMonth = () => {
  //   let viewMoment = moment(this.viewDate).add(1, 'month').startOf('month');
  //   this.mwlCalendarTitle = viewMoment.format('MMM YYYY');
  //   this.viewDate = viewMoment.toDate();
  // }
  // previousMwlCalendarMonth = () => {
  //   let viewMoment = moment(this.viewDate).subtract(1, 'month').startOf('month');
  //   this.mwlCalendarTitle = viewMoment.format('MMM YYYY');
  //   this.viewDate = viewMoment.toDate();
  // }

  // onDaySelect = (day) => {
  //   this.viewDate = day.value;
  //   this.selectedDay = moment(this.viewDate);
  //   this.setTimeFrame(TIMEFRAME.day);
  //   this.showCalendar = false;
  // }

}


import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { DatePipe } from '@angular/common';
import { IDateRange } from '../../app/interfaces';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';

export class CustomDateFormatter extends CalendarDateFormatter {
  // you can override any of the methods defined in the parent class

  public monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new DatePipe(locale).transform(date, 'EEE', locale);
  }

  public monthViewTitle({ date, locale }: DateFormatterParams): string {
    return new DatePipe(locale).transform(date, 'MMM y', locale);
  }

  // public weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
  //   return new DatePipe(locale).transform(date, 'EEE', locale);
  // }

  // public dayViewHour({ date, locale }: DateFormatterParams): string {
  //   return new DatePipe(locale).transform(date, 'HH:mm', locale);
  // }
}
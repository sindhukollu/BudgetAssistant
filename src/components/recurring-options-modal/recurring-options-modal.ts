import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { RECURRING_OPTIONS } from '../../app/enums';
export const recurringOptions = [
  { id: 1, repeatVal: 1, value: RECURRING_OPTIONS.daily },
  { id: 2, repeatVal: 1, value: RECURRING_OPTIONS.weekly},
  { id: 3, repeatVal: 2, value: RECURRING_OPTIONS.biWeekly},
  { id: 4, repeatVal: 1, value: RECURRING_OPTIONS.monthly},
  { id: 5, repeatVal: 3, value: RECURRING_OPTIONS.quarterly},
  { id: 6, repeatVal: 1, value: RECURRING_OPTIONS.yearly},
  { id: 7, repeatVal: 0, value: 'None'}
];

@Component({
  selector: 'page-recurring-options-modal',
  templateUrl: 'recurring-options-modal.html',
})
export class RecurringOptionsModalComponent {
  options = recurringOptions
  
  customOption = {
    isCustom: true,
    repeatVal: 2,
    value: 'Day'
  }
  constructor(public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
  }

  optionSelected = (option) => {
    if(option.value === 'None'){
      this.viewCtrl.dismiss();
    } else {
      this.viewCtrl.dismiss(option);
    }
  }

  customOptionSelected = () => {
    this.customOption.repeatVal = parseInt(this.customOption.repeatVal+'');
    // console.log(this.customOption);
    this.viewCtrl.dismiss(this.customOption);
  }

  dismiss = () => {
    this.viewCtrl.dismiss();    
  }

}

import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ViewController, NavParams } from 'ionic-angular';
import * as moment from 'moment';

// pages/components 
import { RecurringOptionsModalComponent } from '../recurring-options-modal/recurring-options-modal';
import { CategoriesModalComponent } from '../categories-modal/categories-modal';
// interface
import { IDateRange, ICashItem } from '../../app/interfaces';
// enums
import { ITEM_TYPE, TIMEFRAME } from '../../app/enums';
import { DatepickerComponent } from '../datepicker/datepicker';

@Component({
  selector: 'add-item-modal',
  templateUrl: 'add-item-modal.html'
})
export class AddItemModalComponent {
  itemTypes = ['Expense', 'Income'];
  selectedItemType: string = '';
  selectedItemTypeIndex: number = 0;
  selectedDate = moment();
  selectedItemDate = null;
  cashItemForm: FormGroup;
  selectedExpenseCategory: any = {value: null};
  selectedIncomeCategory: any = {value: null};
  // incomeForm: FormGroup;

  // incomeItem = <IExpenseItem>{};
  repeatOption: any = {value: null, repeatVal: null};
  cashItem = <ICashItem>{};
  editMode: boolean = false;
  @ViewChild('datepicker') datepicker: DatepickerComponent;
  constructor(
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    private navParams: NavParams
  ) {
    let navParamItem = this.navParams.get('item');
    let navParamDate = this.navParams.get('selectedDate');
    
    let itemType =  0;

    if(navParamDate){
      this.selectedItemDate = moment(navParamDate);
    }
    if(navParamItem) {
      this.cashItem = navParamItem;
      itemType = this.cashItem.type;
      if(itemType === ITEM_TYPE.expense) {
        this.selectedExpenseCategory = { value: this.cashItem.category };
      } else {
        this.selectedIncomeCategory = { value: this.cashItem.category }
      }
      this.selectedItemDate = moment.unix(navParamItem.date);
      this.editMode = true;
    } 

    this.selectedDate = this.selectedItemDate;
    this.createCashItemForm();
    this.changeItemType(itemType, false);
    
    // this.createIncomeForm();
  }

  ionViewDidEnter(){
    this.datepicker.startDate = this.selectedItemDate;
    this.datepicker.selectedDay = this.selectedItemDate;
    this.datepicker.selectedTimeFrameIndex = TIMEFRAME.day;
    this.datepicker.setTimeFrame(TIMEFRAME.day);
  }

  dismiss = (save: boolean) => {
      if(save && this.cashItemForm.valid) {
        this.cashItem = Object.assign(this.cashItem, this.cashItemForm.value);
        this.cashItem.repeats = this.repeatOption.value;
        if(this.repeatOption.repeatVal){
          this.cashItem.customRepeatVal = this.repeatOption.repeatVal;
        }
        this.cashItem.date = moment(this.selectedDate).unix();
        this.cashItem.displayDate = this.selectedDate.format('MM-DD-YYYY');
        this.cashItem.type = this.selectedItemTypeIndex;
        this.cashItem.amount = parseFloat(<any>this.cashItem.amount);
        this.viewCtrl.dismiss(this.cashItem);
      } else {
        this.viewCtrl.dismiss();
      }
  }

  onDateChange = (dateRange: IDateRange) => {
    console.log(dateRange);
    this.selectedDate = dateRange.startDate;
  }

  changeItemType = (type: number, resetCategory: boolean = true) => {
    let selectedCategory = {value: null};
    if(type === ITEM_TYPE.expense){
      this.selectedItemType = this.itemTypes[type];
      selectedCategory = this.selectedExpenseCategory;
    } else {
      this.selectedItemType = this.itemTypes[type];
      selectedCategory = this.selectedIncomeCategory;
    }
    this.selectedItemTypeIndex = type;
    if(resetCategory){
      this.patchCategoryControlValue(selectedCategory);
    }
    
  }

  createCashItemForm = () => {
    const val = this.cashItem.customRepeatVal > 1 ? this.cashItem.customRepeatVal + ' ' + this.cashItem.repeats + 's': this.cashItem.repeats;
    this.cashItemForm = this.formBuilder.group({
      description: [this.cashItem.description, Validators.required],
      category: [this.cashItem.category, Validators.required],
      amount: [this.cashItem.amount, [Validators.required, Validators.pattern('^\\d*\\.?\\d*$')]],
      repeats: [{value: val, disabled: true}],
      notes: [this.cashItem.notes]
    });
  }

  patchRepeatsControlValue = (option) => {
    const val = option.isCustom ? (option.repeatVal > 1 ? option.repeatVal + ' ' + option.value + 's': '') : option.value;
    this.cashItemForm.patchValue({
      repeats: val
    })
  }

  patchCategoryControlValue = (option) => {
    this.cashItemForm.patchValue({
      category: option.value
    })
  }

  showRecurringOptions = () => {
      let modal = this.modalCtrl.create(RecurringOptionsModalComponent);
      modal.onDidDismiss( option => {
        if(option){
          this.repeatOption = option;
          this.patchRepeatsControlValue(this.repeatOption);
        }
      });

      modal.present();
  }

  showCategories = () => {
    let modal = this.modalCtrl.create(CategoriesModalComponent, { type: this.selectedItemTypeIndex });
      modal.onDidDismiss( category => {
        if(category){
          if(this.selectedItemTypeIndex === ITEM_TYPE.expense){
            this.selectedExpenseCategory = category;
          } else {
            this.selectedIncomeCategory = category;
          }
          this.patchCategoryControlValue(category);
        }
      });
      modal.present();
  }
 
}

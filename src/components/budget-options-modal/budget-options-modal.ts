import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { expenseCategories, recurringOptions } from '../../app/constants';
import { IBudgetSettings } from '../../app/interfaces';
import { RECURRING_OPTIONS } from '../../app/enums';
// services
import { EventBusService } from '../../providers/event-bus/eventBus.service';
// enums
import { EventBusListeners } from '../../app/enums/index';
import { AngularFirestore } from 'angularfire2/firestore';
import { UserService } from '../../providers/user/user.service';

const lsExpenseCategoryKey = 'bp-expense-categories';
const lsBudgetSettings = 'bp-budget-settings';



@Component({
  selector: 'budget-options-modal',
  templateUrl: 'budget-options-modal.html',
})
export class BudgetOptionsModal {
  budgetForm: FormGroup;
  categoryBudgetItems: FormArray;
  categories = [];
  timeSpans = recurringOptions;
  budgetSettings: IBudgetSettings;
  constructor(
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
    private storage: Storage,
    private eventBusService: EventBusService,
    public db: AngularFirestore,
    private userService: UserService
  ) {
    this.getExpenseCategories();
    this.createFrom();

    this.timeSpans = this.timeSpans.filter(timespan => timespan.value !== RECURRING_OPTIONS.biWeekly && timespan.value !== RECURRING_OPTIONS.quarterly)
    this.getBudgetSettings();
  }

  ionViewDidLoad() {

  }

  getExpenseCategories() {
    this.categories = [];
    this.db.collection('users').doc(this.userService.user.id).collection('expenseCategories').valueChanges()
    .map((response: any) => {
      response.forEach(category => {
        category.canDelete = true;
        this.categories.push(category);
      });
    })
    .subscribe(() => {
      this.db.collection('expenseCategories').valueChanges()
      .subscribe((response: any) => {
        this.categories = [...this.categories, ...response]
      });
    });
  }

  onFormValueChanges(){
    this.budgetForm.valueChanges.subscribe((value) => {
      if(value.daily){
        this.budgetForm.controls['weekly'].setValidators([Validators.min(value.daily)]);
        this.budgetForm.controls['monthly'].setValidators([Validators.min(value.daily)]);
        this.budgetForm.controls['yearly'].setValidators([Validators.min(value.daily)]);
      } else if(value.weekly){
        this.budgetForm.controls['monthly'].setValidators([Validators.min(value.weekly)]);
        this.budgetForm.controls['yearly'].setValidators([Validators.min(value.weekly)]);
      }
      
    })
  }

  createFrom = () => {
    this.budgetForm = this.formBuilder.group({
      daily: [null],
      weekly: [null],
      monthly: [null],
      yearly: [null],
      categoryBudgetItems : this.formBuilder.array([ this.createCategoryBudgetItems() ])
    });

    this.onFormValueChanges();
  }

  updateForm = () => {
    this.budgetForm = this.formBuilder.group({
      daily: [this.budgetSettings.daily],
      weekly: [this.budgetSettings.weekly],
      monthly: [this.budgetSettings.monthly],
      yearly: [this.budgetSettings.yearly],
      categoryBudgetItems : this.formBuilder.array(this.budgetSettings.categoryBudgetItems.map(item => {
        return this.formBuilder.group({
          category: [item.category],
          timespan: [item.timespan],
          budget: [item.budget]
        })
      }))
    });
  }

  createCategoryBudgetItems = () => {
    return this.formBuilder.group({
      category: [''],
      timespan: [''],
      budget: [null]
    })
  }

  addCategoryBudgetItem(): void {
    this.categoryBudgetItems = this.budgetForm.get('categoryBudgetItems') as FormArray;
    this.categoryBudgetItems.push(this.createCategoryBudgetItems());
  }

  getBudgetSettings = () => {
    this.storage.get(lsBudgetSettings).then((val) => {
      if(val){
        this.budgetSettings = JSON.parse(val);
        console.log(this.budgetSettings);
        this.updateForm();
      }
    })
  }

  save = () => {
    const budgetSettings = this.budgetForm.value;
    budgetSettings.daily = parseFloat(budgetSettings.daily);
    budgetSettings.weekly = parseFloat(budgetSettings.weekly);
    budgetSettings.monthly = parseFloat(budgetSettings.monthly);
    budgetSettings.yearly = parseFloat(budgetSettings.yearly);
    this.storage.set(lsBudgetSettings, JSON.stringify(budgetSettings)).then(() => {
      this.eventBusService.emit(EventBusListeners.BudgetSettingsChanged, true);
      this.dismiss();
    });
  }

  removeCategoryBudgetItem = (index) => {
    this.categoryBudgetItems = this.budgetForm.get('categoryBudgetItems') as FormArray;
    this.categoryBudgetItems.removeAt(index);
  }

  dismiss = () => {
    this.viewCtrl.dismiss();
  }
}

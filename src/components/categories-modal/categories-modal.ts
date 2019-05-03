import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

// enums
import { ITEM_TYPE } from '../../app/enums';
import { AngularFirestore } from 'angularfire2/firestore';
import { UserService } from '../../providers/user/user.service';
const lsExpenseCategoryKey = 'bp-expense-categories';
const lsIncomeCategoryKey = 'bp-income-categories';
@Component({
  selector: 'page-categories-modal',
  templateUrl: 'categories-modal.html',
})
export class CategoriesModalComponent {
  type: number;
  categories = [];
  expenseCategories = [];
  incomeCategories = [];
  newCategory
  lsKey: string = '';

  constructor(
    public viewCtrl: ViewController,
    private navParams: NavParams,
    private storage: Storage,
    public db: AngularFirestore,
    private userService: UserService
  ) {
    this.type = this.navParams.get('type');
    if(this.type == ITEM_TYPE.expense){
      this.getExpenseCategories();    
    } else {
      this.getIncomeCategories();
    }
    
  }

  ionViewDidLoad() {
  }

  saveToLocalStorage = () => {
    this.storage.set(this.lsKey, JSON.stringify(this.categories));
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

  getIncomeCategories() {
    this.categories = [];
    this.db.collection('users').doc(this.userService.user.id).collection('incomeCategories').valueChanges()
    .map((response: any) => {
      response.forEach(category => {
        category.canDelete = true;
        this.categories.push(category);
      });
    })
    .subscribe(() => {
      this.db.collection('incomeCategories').valueChanges()
      .subscribe((response: any) => {
        this.categories = [...this.categories, ...response]
      });
    });
  }

  addNewCategory = () => {
    // TODO: check for duplicate category
    // TODO: delete custom categories
    const id = this.db.createId();
    this.db.collection('users').doc(this.userService.user.id)
    .collection(this.type == ITEM_TYPE.expense ? 'expenseCategories': 'incomeCategories').doc(id).set({
      id: id,
      value: this.newCategory +''
    }).then(() => {
      this.newCategory = '';
    });

    
      
  }

  categorySelected = (category) => {
    this.viewCtrl.dismiss(category);
  }

  dismiss = () => {
    this.viewCtrl.dismiss();    
  }
}

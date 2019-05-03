import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'category-items-modal',
  templateUrl: 'category-items-modal.html',
})
export class CategoryItemsModal {
  categoryItems: any = [];
  selectedCategory: string = '';
  constructor(
    public viewCtrl: ViewController,
    private navParams: NavParams
  ) {
    this.categoryItems = this.navParams.get('categoryItems');
    this.selectedCategory = this.categoryItems[0].merchantType;
  }

  ionViewDidLoad() {
  }

  dismiss = () => {
    this.viewCtrl.dismiss();
  }

}

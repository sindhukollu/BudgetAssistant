import { Component } from '@angular/core';
import { ViewController, NavParams, ModalController } from 'ionic-angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import * as moment from 'moment';
// interface
import { IReceipt } from '../../pages/home/home';
// constants
import { PAYMENT_TYPES } from '../../pages/home/home';
import { CategoriesModalComponent } from '../categories-modal/categories-modal';
@Component({
  selector: 'receipt-details-modal',
  templateUrl: 'receipt-details-modal.html'
})
export class ReceiptDetailsModalComponent {
  receipt: IReceipt = <IReceipt>{};
  receiptForm: FormGroup;

  selectedPaymentType: string = '';
  paymentTypes: typeof PAYMENT_TYPES = PAYMENT_TYPES;
  constructor(
    private navParams: NavParams,
    private formBuilder: FormBuilder,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController
  ) {
    this.receipt = navParams.get('receipt');
    this.selectedPaymentType = this.receipt.paymentType;
    this.createForm();
    this.updateForm();
  }

  createForm = () => {
    this.receiptForm = this.formBuilder.group({
      merchantName: [null, Validators.required],
      category: [null,  Validators.required],
      totalAmount: [null, [Validators.required, Validators.min(0)]],
      paymentType: [null,  Validators.required],
      date: [null,  Validators.required]
    });
  }

  updateForm = () => {
    this.receiptForm.setValue({
      merchantName: this.receipt.merchantName || null,
      category: this.receipt.category || null,
      totalAmount: this.receipt.totalAmount || null,
      paymentType: this.receipt.paymentType || null,
      date: moment.unix(this.receipt.date).format('MM-DD-YYYY') || null
    });
  }

  setPaymentType = (type: string) => {
    this.selectedPaymentType = type;
    this.receiptForm.patchValue({
      paymentType: type
    });
  }

  save = () => {
    var updatedReceipt = this.receiptForm.value;
    updatedReceipt.category = moment(updatedReceipt.date).unix();
    updatedReceipt.date = moment(updatedReceipt.date).unix();
    updatedReceipt.displayDate = moment.unix(updatedReceipt.date).format('MM-DD-YYYY');
    this.viewCtrl.dismiss(Object.assign(this.receipt, updatedReceipt));
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  showCategories = () => {
    let modal = this.modalCtrl.create(CategoriesModalComponent, { type: 0 });
      modal.onDidDismiss( category => {
        if(category){
          this.receiptForm.patchValue({
            category: category.value
          })
        }
      });
      modal.present();
  }

}

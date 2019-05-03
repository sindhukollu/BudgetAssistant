import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ModalController, NavController } from 'ionic-angular';

// services
import { EventBusService } from '../../providers/event-bus/eventBus.service';
// pages
import { BudgetOptionsModal } from '../../components/budget-options-modal/budget-options-modal';
// enums
import { EventBusListeners } from '../../app/enums/index';
import { UserService } from '../../providers/user/user.service';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  currency: string = 'usd';
  dateFormat: string = 'MM/DD/YYYY';
  constructor(
    private storage: Storage,
    private eventBusService: EventBusService,
    public modalCtrl: ModalController,
    private userService: UserService,
    private navCtrl: NavController
  ) {
    this.storage.get('bp-currency').then((val) => {
      if(val){
        this.currency = val;
      }
    });

    this.storage.get('bp-date-format').then((val) => {
      if(val){
        this.dateFormat = val;
      }
    });
  }

  onCurrencyChnage = (currency) => {
    this.currency = currency;
    this.storage.set('bp-currency', currency);
    this.eventBusService.emit(EventBusListeners.CurrencyChanged, currency);
  }

  onDateFormatChange = (dateFormat) => {
    this.dateFormat = dateFormat;
    this.storage.set('bp-date-format', dateFormat);
    this.eventBusService.emit(EventBusListeners.DateFormatChanged, dateFormat);
  }

  openSetBudgetModal = () => {
    let modal = this.modalCtrl.create(BudgetOptionsModal);
    modal.onDidDismiss( data => {

    });

    modal.present();
  }

  signout(){
    this.userService.signout();
    this.navCtrl.setRoot(LoginPage);
  }

}

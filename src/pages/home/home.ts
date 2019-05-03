import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { LoadingController, Loading, FabContainer } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ModalController, AlertController, NavController } from 'ionic-angular';
import * as moment from 'moment';
import { chain, cloneDeep, orderBy, sumBy } from 'lodash';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';

// components
import { ReceiptDetailsModalComponent } from '../../components/receipt-details-modal/receipt-details-modal';
// services
import { EventBusService } from '../../providers/event-bus/eventBus.service';
// enums
import { RECURRING_OPTIONS, ITEM_TYPE, EventBusListeners } from '../../app/enums';

const lsBudgetSettings = 'bp-budget-settings';
// interfaces
import { IDateRange, ICashItem, IBudgetSettings } from '../../app/interfaces';
import { Subscription } from 'rxjs';
import { UserService } from '../../providers/user/user.service';
import { AddItemModalComponent } from '../../components/add-item-modal/add-item-modal';
import { DatepickerComponent } from '../../components/datepicker/datepicker';

export interface IReceipt{
  id: string;
  date:  any;
  displayDate: string;
  merchantName: string;
  merchantTypes: Array<string>;
  category: string;
  text: string;
  paymentType: string;
  lineItems: Array<ILineItems>,
  totalAmount: number;
  showLineItems: boolean;
  type: ITEM_TYPE;
  isReceipt: boolean;
}

export interface ILineItems{
  id: string;
  description: string;
  data: number;
  text: string;
}
// constants
export const PAYMENT_TYPES = ['Visa', 'Master', 'AMEX', 'Discover', 'Cash'];

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  image: Blob;
  receipts: Array<IReceipt> = [];
  items: any = [];
  groupedItems = [];
  filteredReceipts: Array<IReceipt> = [];
  selectedDateRange = <IDateRange>{};
  loader: Loading;

  budgetSettings: IBudgetSettings = null;
  budgetNotifications: Array<string> = [];
  showBudgetNotes: boolean = true;
  dateFormat: string = 'MM-DD-YYYY';
  today = moment();
  lastOpenedDate = moment();


  receiptsDoc$: AngularFirestoreDocument<any>;
  receiptsValueChangeSubscription: Array<Subscription> = [];
  @ViewChild('datepicker') datepicker: DatepickerComponent;

  userId: string;
  constructor(
    public navCtrl: NavController,
    private http: HttpClient,
    private camera: Camera,
    private file: File,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private eventBusService: EventBusService,
    public alertCtrl: AlertController,
    public db: AngularFirestore,
    private userService: UserService
  ) {
    this.userId = this.userService.user.id;
    this.selectedDateRange = <IDateRange>{ startDate: this.today.clone().startOf('day'), endDate: this.today.clone().endOf('day')};
    
    

    this.eventBusService.on(EventBusListeners.BudgetSettingsChanged, (val) => {
      if(val){
        this.showBudgetNotes = true;
        this.getBudgetSettings();
      }
    })

    
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

      this.storage.get('last-opened-date').then((val) => {
        if(val){
          this.lastOpenedDate = moment(val);
        }
        this.getReceipts();
      }).catch(() => {
        this.saveLastOpenedDateToLocalStorage();
      })
    })

  }

  saveLastOpenedDateToLocalStorage = () => {
    this.storage.set('last-opened-date', this.today.format(this.dateFormat));
  }

  handleFileInput = (files) => {
    console.log(files);
    this.image = files[0];
    this.getReceiptData();
  }

  // getItems(){
  //   this.db.collection('users').doc(this.userId).collection('receipts').valueChanges()
  //   .subscribe((response: any) => {
  //     this.items = response;

  //     if(this.lastOpenedDate.startOf('day').isBefore(this.today.startOf('day'))){
  //       this.addRecurringItems();
  //     }
  //     this.filterItems();

  //     this.getReceipts();

  //   });
  // }

  getReceipts(){
    this.db.collection('users').doc(this.userId).collection('receipts').valueChanges()
    .subscribe((response: any) => {
      this.items = [...response];

      if(this.lastOpenedDate.startOf('day').isBefore(this.today.startOf('day'))){
        this.addRecurringItems();
      }

      this.filterItems();
      this.getBudgetSettings();

      this.storage.set('receipts', JSON.stringify(this.items));
    });
  }

  getReceiptData = () => {
    const httpOptions = {
      headers: new HttpHeaders({
      'apikey' : 'e90bae70dfbd11e8989bebb60acaaa28'
      })
    }

    const formData = new FormData();
    formData.append('file', this.image);

    this.http.post("https://api.taggun.io/api/receipt/v1/verbose/file", formData, httpOptions).subscribe((response: any) => {
      const merchantTypes = response.merchantTypes.data || [];
      let receipt: IReceipt = <IReceipt>{
        id: this.guid(),
        date:  response.date.data ? moment(response.date.data).unix() : moment().unix(),
        displayDate: response.date.data ? moment(response.date.data).format(this.dateFormat) : moment().format(this.dateFormat),
        merchantName: response.merchantName.data || '',
        merchantTypes: merchantTypes,
        category: merchantTypes[0] || 'Misc',
        totalAmount: response.totalAmount.data,
        lineItems: response.lineAmounts,
        text: response.text && response.text.text,
        showLineItems: false,
        type: ITEM_TYPE.expense,
        isReceipt: true
      }

      if(this.loader){
        this.loader.dismiss();
      }

      this.parseReceiptData(receipt);
    })
  }

  parseReceiptData = (receipt: IReceipt) => {
    // set payment type
      if(receipt.text){
        PAYMENT_TYPES.forEach((type, index) => {
           if(receipt.text.toLowerCase().includes(type.toLowerCase())){
              receipt.paymentType = receipt.paymentType || type;
           }
        })
      }

      
      receipt.lineItems.forEach((item: any) => {
        const lineItemId = this.db.createId();
        delete item.regions;
        item.id = lineItemId;

        item.text = item.text.replace(/\d+$/, '');
        item.text = item.text.replace(/\.$/, '');
        item.text = item.text.replace(/\d+$/, '');
        item.text = item.text.replace('$', '');
      });
      
      const receiptId = this.db.createId();
      receipt.id = receiptId;


      this.db.collection('users').doc(this.userId).collection('receipts').doc(receiptId).set(receipt);
  }

  editReceipt = (receipt) => {
    let receiptDetailsModal = this.modalCtrl.create(ReceiptDetailsModalComponent, { receipt: receipt }, {
      showBackdrop: true,
      enableBackdropDismiss: true
    });
    receiptDetailsModal.present();

    receiptDetailsModal.onDidDismiss((updatedReceipt: IReceipt) => {
      console.log(this.receipts);
      if(updatedReceipt){
        this.db.doc(`users/${this.userId}/receipts/${receipt.id}`).set(updatedReceipt);
      }

    });
  }

  openCamera = (fab: FabContainer) => {
    fab.close();
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      cameraDirection: this.camera.Direction.BACK,
      correctOrientation: true,
      allowEdit: false,
    }

    this.camera.getPicture(options).then((imageData) => {
      const fileName = imageData.split('/').pop();
      const path = imageData.replace(fileName, '');
      this.presentLoading();
      this.file.readAsArrayBuffer(path, fileName).then((arrayBuffer) => {
        var byteArray = new Uint8Array(arrayBuffer);
        let file = new Blob([byteArray], {type:"application/image"});
        this.image = file;
        this.getReceiptData();
      });

    }, (err) => {
      // Handle error
    });
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    this.loader.present();
  }

  toggleLineItemsDisplay = ($event, receipt) => {
    $event.stopPropagation();
    receipt.showLineItems = !receipt.showLineItems
  }

  onDateChange = (dateRange: IDateRange) => {
    this.selectedDateRange = dateRange;
    this.filterItems();
  }

  // filterReceipts = () => {
  //   this.filteredReceipts = cloneDeep(this.receipts);
  //   this.filteredReceipts = this.filteredReceipts.filter((item: IReceipt) => {
  //     item.date = moment.unix(item.date).format(this.dateFormat);
  //     return moment.unix(item.date).isSameOrAfter(this.selectedDateRange.startDate) && moment.unix(item.date).isSameOrBefore(this.selectedDateRange.endDate);
  //   });
  //   // this.groupItemsByCategory(clonedItems);
  // }

  getBudgetSettings = () => {
    this.storage.get(lsBudgetSettings).then((val) => {
      if(val){
        this.budgetSettings = JSON.parse(val);
        this.evalBudgets();
      }
    })
  }

  hideBudgetNotes = () => {
    this.showBudgetNotes = false;
  }
  evalBudgets = () => {
    this.budgetNotifications = [];
    var clonedItems = cloneDeep(this.items);
    let totalCost = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    }
    let budgetCategories = {};
    this.budgetSettings.categoryBudgetItems.forEach(item => {
      budgetCategories[item.category] = {
        budget : item.budget,
        dailyCost: 0,
        weeklyCost: 0,
        monthlyCost: 0,
        yearlyCost: 0
      }
    })
    clonedItems.forEach((item: any) => {
      if(item.type === ITEM_TYPE.expense){
        if(item.date >= moment().startOf('day').unix() &&  item.date < moment().endOf('day').unix()){
          let amnt = parseFloat(item.totalAmount || item.amount);
          totalCost.daily += amnt;
          if(budgetCategories[item.category]){
            budgetCategories[item.category].dailyCost += amnt;
          }
        } else if(item.date >= moment().startOf('week').unix() &&  item.date < moment().endOf('week').unix()){
          let amnt = parseFloat(item.totalAmount || item.amount);;
          totalCost.weekly += amnt;
          if(budgetCategories[item.category]){
            budgetCategories[item.category].weeklyCost += amnt;
          }
        } else if(item.date >= moment().startOf('month').unix() &&  item.date < moment().endOf('month').unix()){
          let amnt = parseFloat(item.totalAmount || item.amount);;
          totalCost.monthly += amnt;
          if(budgetCategories[item.category]){
            budgetCategories[item.category].monthlyCost += amnt;
          }
        } else if(item.date >= moment().startOf('year').unix() &&  item.date < moment().endOf('year').unix()){
          let amnt = parseFloat(item.totalAmount || item.amount);;
          totalCost.yearly += amnt;
          if(budgetCategories[item.category]){
            budgetCategories[item.category].yearlyCost += amnt;
          }
        }
      }
    });

    totalCost.weekly += totalCost.daily;
    totalCost.monthly += totalCost.weekly;
    totalCost.yearly += totalCost.monthly;

    if(this.budgetSettings.daily && totalCost.daily >= this.budgetSettings.daily){
      this.budgetNotifications.push('Exceeded daily budget')
    }
    if(this.budgetSettings.weekly && totalCost.weekly >= this.budgetSettings.weekly){
      this.budgetNotifications.push('Exceeded weekly budget')
    }
    if(this.budgetSettings.monthly && totalCost.monthly >= this.budgetSettings.monthly){
      this.budgetNotifications.push('Exceeded monthly budget')
    }
    if(this.budgetSettings.yearly && totalCost.yearly >= this.budgetSettings.yearly){
      this.budgetNotifications.push('Exceeded yearly budget')
    }

    this.budgetSettings.categoryBudgetItems.forEach(item => {
      let categoryBudgetItem = budgetCategories[item.category];
      categoryBudgetItem.weeklyCost += categoryBudgetItem.dailyCost;
      categoryBudgetItem.monthlyCost += categoryBudgetItem.weeklyCost;
      categoryBudgetItem.yearlyCost += categoryBudgetItem.monthlyCost;

      if(item.timespan == RECURRING_OPTIONS.daily && categoryBudgetItem.dailyCost >= item.budget){
        this.budgetNotifications.push('Exceeded daily budget For '+ item.category)
      }
      if(item.timespan == RECURRING_OPTIONS.weekly && categoryBudgetItem.weeklyCost >= item.budget){
        this.budgetNotifications.push('Exceeded weekly budget For '+ item.category)
      }
      if(item.timespan == RECURRING_OPTIONS.monthly && categoryBudgetItem.monthlyCost >= item.budget){
        this.budgetNotifications.push('Exceeded monthly budget For '+ item.category)
      }
      if(item.timespan == RECURRING_OPTIONS.yearly && categoryBudgetItem.yearlyCost >= item.budget){
        this.budgetNotifications.push('Exceeded yearly budget For '+ item.category)
      }
    })

  }

  guid = () => {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }


  // non receipts
  openAddItemModal = (fab: FabContainer) => {
    fab.close();
    let addItemdmodal = this.modalCtrl.create(AddItemModalComponent, { selectedDate: this.selectedDateRange.startDate });
    addItemdmodal.onDidDismiss(item => {
      console.log(item);
      if(item){
        item.date = item.date
        item.id = this.db.createId();
        this.db.doc(`users/${this.userId}/receipts/${item.id}`).set(item);
      }
    });
    addItemdmodal.present();
  }

  editItem = (item: any) => {
    if(item.isReceipt){
      this.editReceipt(item);
      return;
    }
    let addItemdmodal = this.modalCtrl.create(AddItemModalComponent,{item: item });
    addItemdmodal.onDidDismiss(editedItem => {
      if(editedItem){
        this.db.doc(`users/${this.userId}/receipts/${item.id}`).set(editedItem);
      }
    });
    addItemdmodal.present();
  }

  deleteItem = (item) => {
    this.alertCtrl.create({
      title: 'Delete Entry',
      message: 'Are you sure you want to remove this entry',
      buttons: [
        {
          text: 'CANCEL',
          handler: () => {
            
          }
        },
        {
          text: 'YES',
          handler: () => {
            this.db.doc(`users/${this.userId}/receipts/${item.id}`).delete();
          }
        }
      ]
    }).present();
  }

  addRecurringItems = () => {
    let itemsToAdd = [];
    this.items.map((item: ICashItem) => {
      if(item.repeats && !item.isPast) {
        let lastopenedDateClone = this.lastOpenedDate.clone();
        
        switch(item.repeats){
          case RECURRING_OPTIONS.daily:
                while(lastopenedDateClone.startOf('day').isBefore(this.today.startOf('day'))){
                  let date = lastopenedDateClone.clone().add(item.customRepeatVal, 'day').startOf('day');
                  let newItem : ICashItem = cloneDeep(item);
                  newItem.date = date;
                  newItem.displayDate = date.format(this.dateFormat);
                  newItem.isPast = date.isBefore(this.today.startOf('day'))
                  itemsToAdd.push(newItem);
      
                  item.isPast = true;
                  lastopenedDateClone = date;
                }
                break;
          case RECURRING_OPTIONS.weekly:
                if(moment.unix(item.date).add(1,'week').startOf('day').isSameOrBefore(this.today.startOf('day'))){
                  let count = item.customRepeatVal;
                  while(lastopenedDateClone.startOf('day').isBefore(this.today.startOf('day'))){
                    let date = lastopenedDateClone.clone().add(1, 'day').startOf('day');
                    if(moment.unix(item.date).add(count, 'week').startOf('day').isSame(date)){
                      let newItem : ICashItem = cloneDeep(item);
                      newItem.date = date;
                      newItem.displayDate = date.format(this.dateFormat);
                      newItem.isPast = date.isBefore(this.today.startOf('day'))
                      itemsToAdd.push(newItem);
          
                      item.isPast = true;
                      count += item.customRepeatVal;
                    };
                    lastopenedDateClone = date;
                  }
                }
                break;
          case RECURRING_OPTIONS.biWeekly:
                if(moment.unix(item.date).add(2,'week').startOf('day').isSameOrBefore(this.today.startOf('day'))){
                  let count = 2;
                  while(lastopenedDateClone.startOf('day').isBefore(this.today.startOf('day'))){
                    let date = lastopenedDateClone.clone().add(1, 'day').startOf('day');
                    if(moment.unix(item.date).add(count, 'week').startOf('day').isSame(date)){
                      let newItem : ICashItem = cloneDeep(item);
                      newItem.date = date;
                      newItem.displayDate = date.format(this.dateFormat);
                      newItem.isPast = date.isBefore(this.today.startOf('day'))
                      itemsToAdd.push(newItem);
          
                      item.isPast = true;
                      count += 2
                    };
                    lastopenedDateClone = date;
                  }
                }
                break;
          case RECURRING_OPTIONS.monthly:
                if(moment.unix(item.date).add(1,'month').startOf('day').isSameOrBefore(this.today.startOf('day'))){
                  let count = item.customRepeatVal;
                  while(lastopenedDateClone.startOf('day').isBefore(this.today.startOf('day'))){
                    let date = lastopenedDateClone.clone().add(1, 'day').startOf('day');
                    if(moment.unix(item.date).add(count, 'month').startOf('day').isSame(date)){
                      let newItem : ICashItem = cloneDeep(item);
                      newItem.date = date;
                      newItem.displayDate = date.format(this.dateFormat);
                      newItem.isPast = date.isBefore(this.today.startOf('day'))
                      itemsToAdd.push(newItem);
          
                      item.isPast = true;
                      count += item.customRepeatVal;
                    };
                    lastopenedDateClone = date;
                  }
                }
                break;
          case RECURRING_OPTIONS.quarterly:
                if(moment.unix(item.date).add(3,'month').startOf('day').isSameOrBefore(this.today.startOf('day'))){
                  let count = 3;
                  while(lastopenedDateClone.startOf('day').isBefore(this.today.startOf('day'))){
                    let date = lastopenedDateClone.clone().add(1, 'day').startOf('day');
                    if(moment.unix(item.date).add(count, 'month').startOf('day').isSame(date)){
                      let newItem : ICashItem = cloneDeep(item);
                      newItem.date = date;
                      newItem.displayDate = date.format(this.dateFormat);
                      newItem.isPast = date.isBefore(this.today.startOf('day'))
                      itemsToAdd.push(newItem);
          
                      item.isPast = true;
                      count += 3;
                    };
                    lastopenedDateClone = date;
                  }
                }
                break;
          case RECURRING_OPTIONS.yearly:
                if(moment.unix(item.date).add(1,'year').startOf('day').isSameOrBefore(this.today.startOf('day'))){
                  let count = item.customRepeatVal;
                  while(lastopenedDateClone.startOf('day').isBefore(this.today.startOf('day'))){
                    let date = lastopenedDateClone.clone().add(1, 'day').startOf('day');
                    if(moment.unix(item.date).add(count, 'year').startOf('day').isSame(date)){
                      let newItem : ICashItem = cloneDeep(item);
                      newItem.date = date;
                      newItem.displayDate = date.format(this.dateFormat);
                      newItem.isPast = date.isBefore(this.today.startOf('day'))
                      itemsToAdd.push(newItem);
          
                      item.isPast = true;
                      count += item.customRepeatVal;
                    };
                    lastopenedDateClone = date;
                  }
                }
                break;
        }
          
      }
    })
    this.lastOpenedDate = this.today.clone();
    this.items = [...this.items, ...itemsToAdd];
    itemsToAdd.forEach((itemToAdd)=>{
      this.db.doc(`users/${this.userId}/receipts/${this.db.createId()}`).set(itemToAdd);
    })
    this.saveLastOpenedDateToLocalStorage();
  }

  filterItems = () => {
    var clonedItems = cloneDeep(this.items);
    clonedItems = clonedItems.filter((item: ICashItem | IReceipt) => {
      item.displayDate = moment.unix(item.date).format(this.dateFormat);
      return moment.unix(item.date).isSameOrAfter(this.selectedDateRange.startDate) 
            && moment.unix(item.date).isSameOrBefore(this.selectedDateRange.endDate);
    });
    this.groupItemsByCategory(clonedItems);
  }

  groupItemsByCategory = (items) => {
    this.groupedItems = orderBy(chain(items)
      .groupBy('category')
      .map((value, key) => {
        let categoryCost = sumBy(value, (val) => val.amount);
        return {
          category: key,
          totalCost: categoryCost,
          items: value
        };
      }).value(), ['category'], ['asc']);
  }


}

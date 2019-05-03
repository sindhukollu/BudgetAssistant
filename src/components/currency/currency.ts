import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

// service
import { EventBusService } from '../../providers/event-bus/eventBus.service';
// enums
import { EventBusListeners} from '../../app/enums';
@Component({
  selector: 'bp-currency',
  templateUrl: 'currency.html'
})
export class CurrencyComponent {

  selectedCurrency: string = 'usd';

  constructor(
    private storage: Storage,
    private eventBusService: EventBusService
  ) {
    this.storage.get('bp-currency').then((val) => {
      if(val){
        this.selectedCurrency = val;
      }
    })

    // listening to currency change
    this.eventBusService.on(EventBusListeners.CurrencyChanged, (val) => {
      this.selectedCurrency = val;
    });
  }

}

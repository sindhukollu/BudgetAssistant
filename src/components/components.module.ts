import { NgModule } from '@angular/core';
import { FormsModule ,ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from 'ionic-angular';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// 3rd party modules
import { CalendarModule } from 'angular-calendar';
import { CalendarDateFormatter } from 'angular-calendar';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

// modules
import { ChartsModule } from './charts/charts.module';
// component
import { DatepickerComponent, CustomDateFormatter } from './datepicker/datepicker';
import { CurrencyComponent } from './currency/currency';
import { ReceiptDetailsModalComponent } from './receipt-details-modal/receipt-details-modal';
import { BudgetOptionsModal } from './budget-options-modal/budget-options-modal';
import { CategoryItemsModal } from './category-items-modal/category-items-modal';
import { AddItemModalComponent } from './add-item-modal/add-item-modal';
import { RecurringOptionsModalComponent } from './recurring-options-modal/recurring-options-modal';
import { CategoriesModalComponent } from './categories-modal/categories-modal';
import { MatNativeDateModule } from '@angular/material/core';
@NgModule({
	declarations: [
		DatepickerComponent,
		CurrencyComponent,
		ReceiptDetailsModalComponent,
		BudgetOptionsModal,
		CategoryItemsModal,
		AddItemModalComponent,
		RecurringOptionsModalComponent,
		CategoriesModalComponent
	],
	imports: [
    	FormsModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		IonicModule,
		CalendarModule.forRoot(),
		ChartsModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatInputModule,
		MatFormFieldModule
	],
	exports: [
		ChartsModule,
		DatepickerComponent,
		CurrencyComponent,
		ReceiptDetailsModalComponent,
		BudgetOptionsModal,
		CategoryItemsModal,
		AddItemModalComponent,
		RecurringOptionsModalComponent,
		CategoriesModalComponent
	],
	entryComponents: [
		ReceiptDetailsModalComponent,
		BudgetOptionsModal,
		CategoryItemsModal,
		AddItemModalComponent,
		RecurringOptionsModalComponent,
		CategoriesModalComponent
	],
	providers: [
		{
			provide: CalendarDateFormatter,
			useClass: CustomDateFormatter
		},
		MatNativeDateModule
	]
})
export class ComponentsModule {}

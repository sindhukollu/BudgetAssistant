import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

// import { ChartsModule as chartjs } from 'ng2-charts';
// import { ChartsModule as chartjs} from 'ng2-charts-x';
// component
import { ChartComponent } from './bp-chart/bp-chart';

@NgModule({
	declarations: [
        	ChartComponent
	],
	imports: [
		IonicModule,
		// chartjs
	],
	exports: [
        	ChartComponent
	],
	entryComponents: [],
	providers: []
})
export class ChartsModule {

}

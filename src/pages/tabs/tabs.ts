import { Component } from '@angular/core';

import { ReportsPage } from '../reports/reports';
import { SettingsPage } from '../settings/settings';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = ReportsPage;
  tab3Root = SettingsPage;

  constructor() {

  }
}

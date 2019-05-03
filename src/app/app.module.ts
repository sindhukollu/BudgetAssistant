import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { IonicStorageModule } from '@ionic/storage';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
// import { ChartsModule } from 'ng2-charts';
// import { ChartsModule } from 'ng2-charts-x';

// modules
 import { ComponentsModule } from '../components/components.module';
 // services
import { EventBusService } from '../providers/event-bus/eventBus.service';
import { UserService } from '../providers/user/user.service';
 // components
import { MyApp } from './app.component';

import { ReportsPage } from '../pages/reports/reports';
import { SettingsPage } from '../pages/settings/settings';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';



@NgModule({
  declarations: [
    MyApp,
    ReportsPage,
    SettingsPage,
    HomePage,
    TabsPage,
    LoginPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    ComponentsModule,
    // ChartsModule,
    IonicStorageModule.forRoot({
      name: '__smartBudgetDb',
      driverOrder: ['sqlite', 'indexeddb', 'websql']
    }),
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyCRwc_jz5A0lcU-sp0j3TjEZu30q-Ns_wg",
      authDomain: "smart-budget-2987e.firebaseapp.com",
      databaseURL: "https://smart-budget-2987e.firebaseio.com",
      projectId: "smart-budget-2987e",
      storageBucket: "smart-budget-2987e.appspot.com",
      messagingSenderId: "1098687229142"
    }),
    AngularFirestoreModule,
    AngularFireAuthModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ReportsPage,
    SettingsPage,
    HomePage,
    TabsPage,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Camera,
    File,
    EventBusService,
    UserService
  ]
})
export class AppModule {}

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoginPage }  from '../../pages/login/login';
@Injectable()
export class UserService {
  user: any;
  constructor(
    public afAuth: AngularFireAuth,
    private storage: Storage
  ) {
    this.storage.get('user').then((lsUser) => {
      if(lsUser){
        this.user = JSON.parse(lsUser);
      }
    });
    
   }

  signout = () => {
     this.user = {
      id: '',
      name:'',
      email: ''
    };
    this.afAuth.auth.signOut();
    this.storage.remove('user');
  }
}

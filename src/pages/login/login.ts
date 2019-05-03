import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { AngularFirestore } from 'angularfire2/firestore';
import * as momentNs from 'moment';
const moment = momentNs;
import { Subscription } from 'rxjs';
// components
import { TabsPage } from '../tabs/tabs';
// services
import { Storage } from '@ionic/storage';
import { UserService } from '../../providers/user/user.service';

export enum AuthFormTypes {
  SIGNIN = 1,
  SIGNUP = 2,
  FORGOT_PASSWORD = 3
}

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  email: string;
  company: string;
  password: string;
  name: string;

  authFormTypes: typeof AuthFormTypes = AuthFormTypes;
  showAuthFromType: number = 1;

  user: any = {};
  errMsg: string = '';
  isEmailSent: boolean = false;

  userValueChangesSubscription: Subscription;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private userService: UserService,
    private alertController: AlertController,
    private storage: Storage
  ) {
    // if(this.userService.user.id){
    //   this.navCtrl.setRoot(TabsPage);
    // }
  }

  ionViewDidLoad() {
      this.showAuthFromType = this.authFormTypes.SIGNIN;
  }

  ngOnDestroy(){
    if(this.userValueChangesSubscription) {
      this.userValueChangesSubscription.unsubscribe();
    }
  }

  toggleForm = (authFormType) => {
    this.showAuthFromType = authFormType;
  }

  signUpWithEmailAndPassword = () => {
    if(!this.name){
      this.errMsg = "Please provide your name";
      return;
    }
    this.afAuth.auth.createUserWithEmailAndPassword(this.email, this.password).then((data: any) => {
      if(data && data.uid){
        const user = {
          id: data.uid,
          name: this.name,
          email: this.email,
          company: this.company
        }
        this.setUserDetails(user);

        this.db.collection("users").doc(user.id).set({
          name: this.name,
          email: this.email,
          company: this.company || null,
          createdDate: moment().utc().format()
        }).then(() => {
          this.afAuth.auth.currentUser.sendEmailVerification().then(() => {
            const alert = this.alertController.create({
              title: 'Confirm Email',
              subTitle: '',
              message: 'Please verify your email address by clicking on the link sent to your inbox',
              buttons: [{
                text: 'OK',
                handler: () => {
                  this.navCtrl.setRoot(TabsPage);
                }
              }]
            });
            alert.present();
          })

        });
      }
    }).catch((error) => {
      if(error.code === "auth/invalid-email"){
        this.errMsg = "Invalid email address";
      } else if(error.code === "auth/weak-password"){
        this.errMsg = "The password must be 6 characters long or more";
      } else if(error.code === "auth/email-already-in-use"){
        this.errMsg = "The email address is already in use by another account";
      }
    })
  }

  loginWithEmailAndPassword = () => {
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password).then((data) => {
      if(data && data.uid){
        this.user.id = data.uid;
        this.user.name= data.displayName,
        this.user.email= this.email,
        this.user.emailVerified = data.emailVerified;
        this.getUserDetails();
        
      }
    }).catch((err) => {
      if(err.code === 'auth/user-not-found'){
        this.errMsg = 'User not found. Please check your emaild address or signup for new account'
      } else if(err.code === 'auth/wrong-password'){
        this.errMsg = 'Invalid password. Please retry with correct password'
      }
    })
  }

  getUserDetails = () => {
    const userDoc = this.db.doc(`users/${this.user.id}`);
    this.userValueChangesSubscription = userDoc.valueChanges().subscribe((response: any)=> {
      const userData = {
        id: this.user.id,
        name: response && response.name,
        company: response && response.company,
        email: this.email
      }
      this.setUserDetails(userData);
      if(this.user.emailVerified){
        this.navCtrl.setRoot(TabsPage);
      } else {
        this.sendEmailVerificationLink();
      }
    });
  }

  sendEmailVerificationLink = () => {

    const alert = this.alertController.create({
      title: 'Confirm Email',
      subTitle: '',
      message: 'Please verify your email address to continue',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {}
        },
        {
          text: 'Resend verification link',
          handler: () => {
            this.afAuth.auth.currentUser.sendEmailVerification().then(() => {
              const alert = this.alertController.create({
                title: 'Confirm Email',
                subTitle: '',
                message: 'Please check your inbox to verify email address',
                buttons: [{
                  text: 'OK',
                  handler: () => {}
                }]
              });
            alert.present();
          })
          }
        }
      ]
    });
    alert.present();
  }

  sendPasswordResetLink = () => {
      this.afAuth.auth.sendPasswordResetEmail(this.email).then(() => {
        this.isEmailSent = true;
      }).catch((error) => {
        if(error.code === 'auth/user-not-found'){
          this.errMsg = `No user account found with email address ${this.email} `
        } else {
          this.errMsg = "something went wrong. Please try again later"
        }

      });
  }

  loginWithGoogleAuthProvider = () => {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then((data) => {
      if(data && data.user){
        const user = {
          id: data.user.uid,
          name: data.user.displayName,
          email: data.user.email,
          company: this.company
        }
        this.setUserDetails(user);
        this.user = user;
        this.navCtrl.setRoot(TabsPage);
      }
    }).catch((error) => {
      if(error.code === "auth/invalid-email"){
        this.errMsg = "Invalid email address";
      } else if(error.code === "auth/weak-password"){
        this.errMsg = "The password must be 6 characters long or more";
      } else if(error.code === "auth/email-already-in-use"){
        this.errMsg = "The email address is already in use by another account";
      }
    })
  }

  setUserDetails = (user) => {
    this.userService.user = user;
    this.storage.set('user', JSON.stringify(user));
  }

}

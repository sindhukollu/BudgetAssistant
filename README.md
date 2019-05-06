Budget Assistant

Environment Setup - Mac:

1) Install node https://nodejs.org/en/download/
2) Install Angular npm install -g @angular/cli
3) Install Ionic npm install -g ionic cordova
4) Install git https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
5) Clone repository  git clone https://github.com/sindhukollu/BudgetAssistant.git
6) Open project folder in terminal
7) install packages npm install

WEB: 
1) npm run build 
2) ionic serve -- To run and open app in browser 

Android:
https://ionicframework.com/docs/installation/android

1) Install Android Studio for running app in emulator (https://developer.android.com/studio)
2) cordova platform add android
3) cordova build android
4) Connect device and make sure it is detected by accepting RSA fingerprint on device
5) cordova run android

IOS:
https://ionicframework.com/docs/installation/ios

1) Install xcode (https://developer.apple.com/xcode/)
2) cordova platform add ios
3) cordova build ios
4) open xcode workspace created in platform folder in xcode.
5) build project and select device and run it

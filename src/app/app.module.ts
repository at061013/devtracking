import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { Uid } from '@ionic-native/uid/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
 
import firebase from '@firebase/app';


firebase.initializeApp({
  apiKey: "AIzaSyD5OUoS3dDpN5rkDRdUn355NTIKpFijldE",
  authDomain: "seen-visitor-management.firebaseapp.com",
  databaseURL: "https://seen-visitor-management-default-rtdb.firebaseio.com",
  projectId: "seen-visitor-management",
  storageBucket: "seen-visitor-management.appspot.com",
  messagingSenderId: "103517852228",
  appId: "1:103517852228:web:c5f2dd02c46abef1e6a211",
  measurementId: "G-DYJPP33DMQ"
})

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    UniqueDeviceID,
    Uid,
    AndroidPermissions,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

import { Component, ElementRef, ViewChild } from '@angular/core';

import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;

declare var google;

import firebase from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  location: Observable<any>;
  user = null;
  ref = firebase.database().ref('locations/route/unixtimestamp-deviceId-date/84d8LDYfGeUvXo4I7uiLmYCipHD2');
  itemsRef = firebase.database().ref('locations/route/');
  infos = [];
  

  // Map related
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  markers = [];

  isTracking = false;
  watch = null;


  constructor() {
    this.anonLogin();
  }

  ionViewWillEnter() {
    this.loadMap();
  }




  // Initialize a blank map
  loadMap() {
    let latLng = new google.maps.LatLng(51.9036442, 7.6673267);

    let mapOptions = {
      center: latLng,
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }



  anonLogin() {
    firebase.auth().signInAnonymously().then(res => {
      this.user = res.user;
      console.log('user:',this.user.uid);

      firebase.database().ref('locations/route/').orderByChild('timestamp');

    
      this.ref.on('value', resp => {
        this.infos = [];
        this.infos = snapshotToArray(resp);
       

        // console.log('data:', this.infos)
      });
      
    })
  }

  startTracking() {
    this.isTracking = true;
    this.watch = Geolocation.watchPosition({}, (position, err) => {
      console.log('ne Position: ', position);
      if (position) {
        this.addNewLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.timestamp
        );
      }
    });
  }

  stopTracking() {
    Geolocation.clearWatch({ id: this.watch }).then(() => {
      this.isTracking = false;
    });
  }

  addNewLocation(lat, lng, timestamp) {

    firebase.database().ref('locations/route/unixtimestamp-deviceId-date/' + this.user.uid).push().set({
      lat,
      lng,
      timestamp
    });

  }
  // Delete a location from Firebase
  deleteLocation(pos) {
    console.log('delete:', pos)
    // firebase.database().ref('locations/route/unixtimestamp-deviceId-date/'+pos.id).remove();
  }

}
  export const snapshotToArray = snapshot => {
    let returnArr = [];

    snapshot.forEach(childSnapshot => {
      let item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
    });

    return returnArr;
  };

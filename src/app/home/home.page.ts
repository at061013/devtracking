import { Component, ElementRef, ViewChild } from '@angular/core';

import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;

declare var google;

import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { Uid } from '@ionic-native/uid/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

import { Observable } from 'rxjs';

//firebase
import firebase from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import '@firebase/storage'

var db = firebase.database();
var auth = firebase.auth();


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  location: Observable<any>;
  user = null;
  UDeviceID = null;

  locations: any;

  infoWindows: any = [];
  markersInfo: any = [
    {
      title: "60/200",
      latitude: "13.7700104",
      longitude: "100.7230339"
    },
    {
      title: "60/181",
      latitude: "13.7699801",
      longitude: "100.7232186"
    }
  ];


  // Map related
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  markers = [];
  directionsService = new google.maps.DirectionsService;
  directionsRenderer = new google.maps.DirectionsRenderer;

  isTracking = false;
  watch = null;

  constructor(private uniqueDeviceID: UniqueDeviceID) {
    this.anonLogin();

  }



  ionViewWillEnter() {
    this.loadMap();
  }

  addMarkersToMap(markersInfo) {
    for (let marker of markersInfo) {
      let position = new google.maps.LatLng(marker.latitude, marker.longitude);
      let mapMarker = new google.maps.Marker({
        position: position,
        title: marker.title,
        latitude: marker.latitude,
        longitude: marker.longitude
      });
      mapMarker.setMap(this.map);
      this.addInfoWindowToMarker(mapMarker);
    }
  }
  addInfoWindowToMarker(marker) {
    let infoWindowcontent = '<div id="content">' +
      '<h2 id="firstHeading" class"firstHeading">' + marker.title + '</h2>' +
      '<p>Latitude: ' + marker.latitude + '</p>' +
      '<p>Longitude: ' + marker.latitude + '</p>' +
      '<ion-button id="navigate">Navigate</ion-button>' +
      '</div>';
    let infoWindow = new google.maps.InfoWindow({
      content: infoWindowcontent
    });

    marker.addListener('click', () => {
      this.closeAllInfoWindows();
      infoWindow.open(this.map, marker);

      google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        document.getElementById('navigate').addEventListener('click', () => {
          console.log('navigate button clicked: ')
          this.calcRoute();

        })
      })
    });
    this.infoWindows.push(infoWindow);

  }


  closeAllInfoWindows() {
    for (let window of this.infoWindows) {
      window.close();
    }
  }

  calcRoute(){
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      zoom: 7,
      center: { lat: 41.85, lng: -87.65 },
    }
  );
  directionsDisplay.setMap(map);

    var start = { lat: 13.770184, lng: 100.722271 };
    var end = { lat: 13.7700104, lng: 100.7230339 };
    var request = {
      origin: start,
      destination: end,
      travelMode: 'DRIVING'
    };
    directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(result);
      }
    });
  }



  // Initialize a blank map
  loadMap() {
    let latLng = new google.maps.LatLng(13.770184, 100.722271);

    let mapOptions = {
      center: latLng,
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.addMarkersToMap(this.markersInfo);
  }



  anonLogin() {
    auth.signInAnonymously().then(res => {
      this.user = res.user;
      console.log('user:', this.user.uid);

      this.uniqueDeviceID.get().then((uuid: any) => {
        this.UDeviceID = uuid;
        console.log('uuid: ', this.UDeviceID);
      });



      // db.ref('locations/route/').orderByChild('timestamp');

      //get data 
      db.ref('locations/route/unixtimestamp-deviceId-date/' + this.user.uid).on('value', resp => {
        this.locations = snapshotToArray(resp);

        console.log('data:', this.locations)
        this.updateMap(this.locations);


      });



    })
  }

  updateMap(locations) {
    // Remove all current marker
    this.markers.map(marker => marker.setMap(null));
    this.markers = [];

    for (let loc of locations) {

      let latLng = new google.maps.LatLng(loc.lat, loc.lng);
      console.log('infos: ', latLng)
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });
      this.markers.push(marker);
    }
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

    var date = new Date(timestamp).toLocaleDateString("zh-Hans-CN")

    console.log(date.toString()) //4/17/2020





    db.ref('locations/route/unixtimestamp-deviceId-date/' + this.user.uid).push({
      lat,
      lng,
      timestamp
    });


    // db.ref('locations/route/'+ timestamp+'-'+'12345'+'-'+'date' + this.user.uid).push({
    //   lat,
    //   lng,
    //   timestamp
    // });

  }
  // Delete a location from Firebase
  deleteLocation(pos) {
    db.ref('locations/route/unixtimestamp-deviceId-date/' + this.user.uid + '/' + pos.key).remove();
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

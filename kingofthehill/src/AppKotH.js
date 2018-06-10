import React, { Component } from 'react';
import './App.css';

import { GoogleApiWrapper } from 'google-maps-react';
//import firebase from '../public/Firebase';
import * as firebase from 'firebase';

import UserMenu from './UserMenu';

import {Modal, Button, OverlayTrigger} from 'react-bootstrap';
import { isNullOrUndefined } from 'util';
import GeoFire from 'geofire';

var config = {
  apiKey: "AIzaSyBqas9U19s8QQYT9xCfstJo7bDecLXNIyo",
  authDomain: "kingofthehill-66e32.firebaseapp.com",
  databaseURL: "https://kingofthehill-66e32.firebaseio.com",
  projectId: "kingofthehill-66e32",
  storageBucket: "kingofthehill-66e32.appspot.com",
  messagingSenderId: "944241345514"
};
firebase.initializeApp(config);

class AppKotH extends Component {

  constructor(props)
  {
    super(props);
    this.state = {
      Usuarios : [],
      userMarkers : [],
      show : true,
      currentUser : {
        nickname : "UserName",
        photoURL : "",
        uid : ""
      },
      map : {},
      DB : firebase.database().ref()
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.signInGoogle = this.signInGoogle.bind(this);
    this.doesUserExist_Client = this.doesUserExist_Client.bind(this);
    this.UserInClient = this.UserInClient.bind(this);
    this.getStudentByUid_DB = this.getStudentByUid_DB.bind(this);
    this.initMap = this.initMap.bind(this);
    this.createMarker = this.createMarker.bind(this);
    this.registerNewUser = this.registerNewUser.bind(this);
    this.updateUserLocation = this.updateUserLocation.bind(this);
    this.loadUsers = this.loadUsers.bind(this);
    this.loadUserMarkers = this.loadUserMarkers.bind(this);
    this.unloadUserMarkers = this.unloadUserMarkers.bind(this);
    this.reloadUsers = this.reloadUsers.bind(this);
    this.firebaseListToArray = this.firebaseListToArray.bind(this);
    this.registerListener_DBUpdateUsers = this.registerListener_DBUpdateUsers.bind(this);
    this.registerListener_ClientUpdatePosition = this.registerListener_ClientUpdatePosition.bind(this);
  }  

  static getDerivedStateFromProps(props, state)
  {

  }

  componentWillMount()
  {

  }

  render() {
    return (
      <div>
        <UserMenu nickname={this.state.currentUser.nickname} photoURL={this.state.currentUser.photoURL} />
        <div>
          <div ref="map" style={ {height : 500} }>
            Cargando Mapa...
          </div>
        </div>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button onClick={this.signInGoogle}>Sign In With Google</Button>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  componentDidMount()
  {
    this.initMap();
  }

//----------------------------------------------------------------------------------------------

  handleShow() {
    this.state.show = true;
    this.setState(this.state);
  }
  handleClose() {
    this.state.show = false;
    this.setState(this.state);
  }
  signInGoogle(){
    navigator.geolocation.getCurrentPosition(position => {
      var googleAuthProvider = new firebase.auth.GoogleAuthProvider;
      firebase.auth().signInWithPopup(googleAuthProvider).then((data) => {
        var userMarker = this.createMarker(data.user.nickname, data.user.photoURL, position.coords.latitude, position.coords.longitude);
        userMarker.map = this.state.map;
        this.state.currentUser = { nickname : data.user.displayName, photoURL : data.user.photoURL, uid : data.user.uid };
        this.state.show = false;
        this.setState(this.state);
        this.getStudentByUid_DB(data.user.uid).then(res => {
          if(isNullOrUndefined(res.val()))
          {
            this.registerNewUser(this.state.currentUser, position.coords.latitude, position.coords.longitude);
          }
        });
        this.reloadUsers();
        this.registerListener_ClientUpdatePosition(data.user.uid);
        this.registerListener_DBUpdateUsers();
      })
      .catch(function(err) {
        console.log("Error");
        console.log(err);
      });
    });
  }
  doesUserExist_Client(Usuarios, uid){
     Usuarios.forEach(element => {
      if(element.uid == uid)
      {
        return true;
      }
    });
    return false;
  }
  UserInClient(Usuarios, uid){
    var user = null;
    Usuarios.forEach(element => {
     if(element.uid == uid)
     {
       user = element;
     }
   });
   return user;
 }
  getStudentByUid_DB(uid){
    return this.state.DB.child('Usuarios').orderByChild("uid").equalTo(uid).once('value', snap => {return snap.val()});
  }
  initMap(){
    this.state.map = new this.props.google.maps.Map(
        this.refs.map,
        {
            center: {lat: 21.150908, lng: -101.71110470000002},
            zoom: 15
        }
    );
    console.log("initiated map");
  } 
  createMarker(nickname, photoURL, latitude, longitude){
    var icon = {
      url: photoURL, // url
      scaledSize: new this.props.google.maps.Size(50, 50), // scaled size
      origin: new this.props.google.maps.Point(0,0), // origin
      anchor: new this.props.google.maps.Point(0, 0) // anchor
    };
    var pos = new this.props.google.maps.LatLng(latitude, longitude)
    return new this.props.google.maps.Marker({
        map: this.state.map,
        icon : icon,
        position: pos,
        title: nickname
    });
    console.log("Marker created at " + latitude + " and " + longitude);
  }
  registerNewUser(usuario, lat, lng){
    this.state.DB.child('Usuarios').push(usuario);
    this.getStudentByUid_DB(usuario.uid).then(res => {
      this.updateUserLocation(Object.keys(res.val())[0], lat, lng);
    });
  }
  updateUserLocation(key, lat, lng){
    var geoFire = new GeoFire(this.state.DB.child('Usuarios').child(key));
    geoFire.set("Location", [lat, lng]);
  }
  loadUsers(snapshot){
    var usuarios = [];
    snapshot.forEach(user =>{
      usuarios.push({
        nickname: user.val().nickname,
        photoURL: user.val().photoURL,
        uid: user.val().uid
      });
    });
    this.state.Usuarios = usuarios;
    this.setState(this.state);
    console.log("loaded Users");
  }
  loadUserMarkers(snapshot){
    var markers = [];
    snapshot.forEach(userM =>{
      console.log(userM.val());
      var newMarker = this.createMarker(userM.val().nickname, userM.val().photoURL, userM.val().Location.l[0], userM.val().Location.l[1]);
      markers.push(newMarker);
      //newMarker.map = this.state.map;
      //console.log(newMarker.map);
    });
    this.state.userMarkers = markers;
    this.setState(this.state);
    console.log(this.state);
    console.log("loaded User Markers");
  }

  unloadUserMarkers(){
    this.state.userMarkers.forEach(marker =>{
      //marker.map = null;
      marker.setMap(null);
      marker = null;
    });
    this.state.userMarkers = [];
    this.setState(this.state);
    console.log(this.state);
    console.log("unloaded User Markers");
  }

  reloadUsers(){
    this.state.DB.child('Usuarios').once('value', snapshot =>{
      this.loadUsers(snapshot);
      this.unloadUserMarkers();
      this.loadUserMarkers(snapshot);
    });
  }

  firebaseListToArray(firebaseList){
    var res = [];
    firebaseList.forEach(obj =>{
      res.push(obj);
    });
    return res;
  }



  registerListener_DBUpdateUsers(){
    this.state.DB.child('Usuarios').on('child_added', snapshot => {
      console.log("child_added");
      console.log(snapshot.val());
      if(!this.doesUserExist_Client(this.state.Usuarios, snapshot.val().uid))
      {
        this.state.Usuarios.push({
          nickname: snapshot.val().nickname,
          photoURL: snapshot.val().photoURL,
          uid: snapshot.val().uid
        });
        this.setState(this.state);
      }
      this.reloadUsers();
    });
    this.state.DB.child('Usuarios').on('child_changed', snapshot => {
      console.log("child_changed");
      /*
      for(var i = 0; i < this.state.Usuarios.length; i++)
      {
        console.log(this.state);
        console.log(this.state.Usuarios[i].uid + "  |  " + snapshot.val().uid);
        if(this.state.Usuarios[i].uid == snapshot.val().uid)
        {
          console.log(this.state.userMarkers);
          var latlng = new this.props.google.maps.LatLng(-24.397, 140.644);
          this.state.userMarkers[i].setPosition(latlng);
          this.setState(this.state);
        }
      }
      
      console.log(snapshot.val());
      console.log(this.state.userMarkers);
      */
     this.reloadUsers();
      //this.loadUsers(snapshot);
      //this.unloadUserMarkers();
      //this.loadUserMarkers(snapshot);
    });
    this.state.DB.child('Usuarios').on('child_removed', snapshot => {
      console.log("child_removed");
      console.log(snapshot.val());
      //this.loadUsers(snapshot);
      //this.unloadUserMarkers();
      //this.loadUserMarkers(snapshot);
    });
    this.state.DB.child('Usuarios').on('child_moved', snapshot => {
      console.log("child_moved");
      console.log(snapshot.val());
      //this.loadUsers(snapshot);
      //this.unloadUserMarkers();
      //this.loadUserMarkers(snapshot);
    });
  }
  registerListener_ClientUpdatePosition(uid){
    navigator.geolocation.watchPosition(pos => {
      this.getStudentByUid_DB(uid).then(user => {
        console.log('Position Updated');
        this.updateUserLocation(Object.keys(user.val())[0], pos.coords.latitude, pos.coords.longitude);
        console.log(this.state);
      });
    });
  }
}
export default GoogleApiWrapper({
    apiKey: 'AIzaSyCxb5o8ncSJbvSoHrAWcYPb5bdyqz26X84',
  })(AppKotH)
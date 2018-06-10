import React, { Component } from 'react';
import './App.css';

import { GoogleApiWrapper } from 'google-maps-react';
//import firebase from '../public/Firebase';
import * as firebase from 'firebase';

import Alert from './Alert';

import Map from './Map';

import UserMenu from './UserMenu';

import {Tooltip, Popover, Modal, Button, OverlayTrigger} from 'react-bootstrap';
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
//firebase.initializeApp(config);

class App extends Component {

  constructor(props)
  {
    super(props);
    this.state = {
      Usuarios : [],
      show : true,
      logedIn : false,
      currentUser : {
        nickname : "UserName",
        photoURL : "",
        uid : ""
      },
      map : {},
      userMarker : {},
      userRadius : {}
    };
    this.DEB = this.DEB.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.signInGoogle = this.signInGoogle.bind(this);
    this.userExist = this.userExist.bind(this);
    this.cargarUsuarios = this.cargarUsuarios.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.initMap = this.initMap.bind(this);
    this.calculateDistance = this.calculateDistance.bind(this);
    this.setRadius = this.setRadius.bind(this);
    this.userMoved = this.userMoved.bind(this);
  }

  componentDidMount() {
    const UsuariosRef = firebase.database().ref().child('Usuarios');
    const nameRef = firebase.database().ref().child('Usuarios');
    UsuariosRef.on('value', snapshot => {
      this.cargarUsuarios();
    });
    console.log("lel");
    this.initMap();
  }
  
  componentWillUnmount() {
    // Un-register the listener on '/someData'.
    this.firebaseRef.off('value', this.firebaseCallback);
  }

  DEB()
  {
    var res = "";
    fetch('https://kingofthehill-66e32.firebaseio.com/.json')
      .then(function(response) {
        return response.json();
      }).then(data => 
          this.setState({
          User :{
            nickname : data.Usuarios.nickname
          }})
        ).catch(function(ex) {
        console.log('parsing failed', ex)
      });
      console.log(res.debug);
      console.log(res);
      /* fetch('https://mywebsite.com/endpoint/', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstParam: 'yourValue',
            secondParam: 'yourOtherValue',
          }),
        });
      */
  }

  handleClose() {
    this.state.show = false;
    this.setState(this.state);
  }

  handleShow() {
    this.state.show = true;
    this.setState(this.state);
  }

  initMap(){
    this.state.map = new this.props.google.maps.Map(
        this.refs.map,
        {
            center: {lat: 21.150908, lng: -101.71110470000002},
            zoom: 15
        }
    );
    console.log("initiated Map");
  }
  cargarMarkers(map){
        this.state.Usuarios.forEach(user => {
          if(user.uid != this.state.currentUser.uid)
          {
            var icon = {
                url: user.photoURL, // url
                scaledSize: new this.props.google.maps.Size(50, 50), // scaled size
                origin: new this.props.google.maps.Point(0,0), // origin
                anchor: new this.props.google.maps.Point(0, 0) // anchor
            };
            var marker = new this.props.google.maps.Marker({
                map: map,
                icon : icon,
                position: {lat : user.Location.l[0], lng : user.Location.l[1]},
                title: user.nickname
            });
            this.props.userMarkers.push(marker);
          }
        });
    }
  clearMarkers(UM) {
      UM.forEach(m=> m.setMap(null));
      UM = [];
  }
  calculateDistance(location1, location2)
  {

  }
  cargarUsuarios()
    {      
      const UsuariosRef = firebase.database().ref().child('Usuarios');
      UsuariosRef.once('value', snapshot => {
        var usuarios = [];
        snapshot.forEach(users =>{
          usuarios.push(users.val());
        });
        this.state.Usuarios = usuarios;
        this.setState(this.state);
        console.log(this.state);
        this.clearMarkers(this.props.userMarkers)
        this.cargarMarkers(this.state.map);
      });
    }

  signInGoogle()
    {
      console.log('signInGoogle');
      var googleAuthProvider = new firebase.auth.GoogleAuthProvider;
      firebase.auth().signInWithPopup(googleAuthProvider)
      .then((data) => {
        console.log("fetched");
        console.log(data);
        this.state.currentUser = { nickname : data.user.displayName, photoURL : data.user.photoURL, uid : data.user.uid };
        this.state.show = false;
        this.setState(this.state);
        console.log(this.state);
        const UsuariosRef = firebase.database().ref().child('Usuarios');
        UsuariosRef.orderByChild("uid").equalTo(this.state.currentUser.uid).once('value', snapshot => {
          if(isNullOrUndefined(snapshot.val()))
          {
            UsuariosRef.push(this.state.currentUser);
          }
          this.state.userRadius = new this.props.google.maps.Circle({
            map: this.state.map,
            radius: 10,
            fillColor: '#AA0000'
          });
          
          this.updateLocation(UsuariosRef);
          this.userMoved();
        });
        /*
        UsuariosRef.once('value', snapshot =>{
            if(!this.userExist(snapshot.val(), this.state.currentUser.uid)){
              UsuariosRef.push(this.state.Usuario);
            }
        });
        */
        this.cargarUsuarios();
      })
      .catch(function(err) {
        console.log("Error");
        console.log(err);
      })
    }
  setRadius(lat, lng, rad)
    {
      var geofire = new GeoFire(firebase.database().ref());
      var query = geofire.query({
        center : [lat, lng],
        radius : rad
      });
      var RediusEvent = query.on("key_entered", function(key, location, distance) {
        console.log(key + " entered query at " + location + " (" + distance + " km from center)");
      });
      this.state.userRadius.setMap(null);
      this.state.userRadius = new this.props.google.maps.Circle({
        center : {lat : lat, lng : lng},
        map: this.state.map,
        radius: rad,
        fillColor: '#AA0000'
      });
      this.setState(this.state);
      console.log(this.state);
    }
  userMoved()
    {
    }
  updateLocation(UsuariosRef)
    {
      navigator.geolocation.watchPosition(pos => {
        console.log("location updated");
        UsuariosRef.orderByChild("uid").equalTo(this.state.currentUser.uid).once('value', snapshot => {
          var geoFire = new GeoFire(UsuariosRef.child(Object.keys(snapshot.val())[0]));
          geoFire.set("Location", [pos.coords.latitude, pos.coords.longitude]);
          var icon = {
              url: this.state.currentUser.photoURL, // url
              scaledSize: new this.props.google.maps.Size(50, 50), // scaled size
              origin: new this.props.google.maps.Point(0,0), // origin
              anchor: new this.props.google.maps.Point(0, 0) // anchor
          };
          this.state.userMarker.map = null;
          this.state.userMarker = {};
          this.state.userMarker = new this.props.google.maps.Marker({
              map: this.state.map,
              icon : icon,
              position: {lat : pos.coords.latitude, lng : pos.coords.longitude},
              title: this.state.currentUser.nickname
          });
          this.setRadius(pos.coords.latitude, pos.coords.longitude, 100);
          this.setState(this.state);
        });
      }, error => {
        console.log(error);
      });
    }
  userExist(Usuarios, id)
    {
      Usuarios.forEach(element => {
        if(element.uid == id)
        {
          return true;
        }
      });
      return false;
    }

  
  render() {
    const popover = (
      <Popover id="modal-popover" title="popover">
        very popover. such engagement
      </Popover>
    );
    const tooltip = <Tooltip id="modal-tooltip">wow.</Tooltip>;
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
            <button onClick={this.signInGoogle}>Sign In With Google</button>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
export default GoogleApiWrapper({
  apiKey: 'AIzaSyCxb5o8ncSJbvSoHrAWcYPb5bdyqz26X84',
})(App)
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/datastore';

var config = {
    apiKey: "AIzaSyBqas9U19s8QQYT9xCfstJo7bDecLXNIyo",
    authDomain: "kingofthehill-66e32.firebaseapp.com",
    databaseURL: "https://kingofthehill-66e32.firebaseio.com",
    projectId: "kingofthehill-66e32",
    storageBucket: "kingofthehill-66e32.appspot.com",
    messagingSenderId: "944241345514"
  };
  firebase.initializeApp(config);

export default firebase.initializeApp(config);
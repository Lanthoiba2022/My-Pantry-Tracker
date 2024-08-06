import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDu2V2Ug75XXJcWlzw3wh7xb3wyuWogsl0",
  authDomain: "mypantry-d13c1.firebaseapp.com",
  projectId: "mypantry-d13c1",
  storageBucket: "mypantry-d13c1.appspot.com",
  messagingSenderId: "931622918319",
  appId: "1:931622918319:web:38030cb659ae3998909c5a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { app,firestore };
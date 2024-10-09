import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAG7yO1zESc833nb8aID-DvrZLbIukyW9M",
    authDomain: "reservation-app-62f53.firebaseapp.com",
    projectId: "reservation-app-62f53",
    storageBucket: "reservation-app-62f53.appspot.com",
    messagingSenderId: "306343560370",
    appId: "1:306343560370:web:709abba15267f27e6535ab",
    measurementId: "G-5MJ0S76G7T"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
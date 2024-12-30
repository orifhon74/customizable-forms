// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAXk8WBjcGSWTXEmsAz4V4KL1B3V5QcbWo",
    authDomain: "customizable-forms-e5862.firebaseapp.com",
    projectId: "customizable-forms-e5862",
    storageBucket: "customizable-forms-e5862.firebasestorage.app",
    messagingSenderId: "704864580387",
    appId: "1:704864580387:web:8e8cfce6942acd7c4dd296",
    measurementId: "G-61JEDJXBLT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const storage = getStorage(app);
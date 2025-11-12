// تنظیمات Firebase - از Firebase Console کپی شده
// این فایل را کپی کنید و نام آن را به firebase-config.js تغییر دهید
// سپس اطلاعات Firebase خود را در آن قرار دهید

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase (بعد از لود شدن SDK)
let db = null;
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    console.log('✅ Firebase آماده است');
} else {
    console.log('⚠️ Firebase SDK لود نشده است');
}


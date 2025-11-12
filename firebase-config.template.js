// این فایل template است و در Netlify Build به firebase-config.js تبدیل می‌شود
// Environment Variables از Netlify استفاده می‌شوند

const FIREBASE_CONFIG = {
  apiKey: "NETLIFY_FIREBASE_API_KEY",
  authDomain: "NETLIFY_FIREBASE_AUTH_DOMAIN",
  projectId: "NETLIFY_FIREBASE_PROJECT_ID",
  storageBucket: "NETLIFY_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NETLIFY_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NETLIFY_FIREBASE_APP_ID",
  measurementId: "NETLIFY_FIREBASE_MEASUREMENT_ID"
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


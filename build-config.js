// این script در Netlify Build اجرا می‌شود
// Environment Variables را از Netlify می‌گیرد و firebase-config.js می‌سازد

const fs = require('fs');
const path = require('path');

// خواندن Environment Variables از Netlify
const config = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
};

// ساخت محتوای firebase-config.js
const configContent = `// تنظیمات Firebase - از Netlify Environment Variables
const FIREBASE_CONFIG = {
  apiKey: "${config.apiKey}",
  authDomain: "${config.authDomain}",
  projectId: "${config.projectId}",
  storageBucket: "${config.storageBucket}",
  messagingSenderId: "${config.messagingSenderId}",
  appId: "${config.appId}",
  measurementId: "${config.measurementId}"
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
`;

// نوشتن فایل
const configPath = path.join(__dirname, 'firebase-config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✅ firebase-config.js ساخته شد');

// اگر Environment Variables تنظیم نشده باشند، هشدار بده
if (!config.apiKey || !config.projectId) {
  console.warn('⚠️ هشدار: برخی از Environment Variables تنظیم نشده‌اند');
  console.warn('⚠️ سیستم از localStorage استفاده خواهد کرد');
}


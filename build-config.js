// این script در Netlify Build اجرا می‌شود
// Environment Variables را از Netlify می‌گیرد و در HTML جایگزین می‌کند

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

// ساخت محتوای Firebase config
const firebaseConfigScript = `// تنظیمات Firebase - از Netlify Environment Variables
const FIREBASE_CONFIG = {
  apiKey: "${config.apiKey}",
  authDomain: "${config.authDomain}",
  projectId: "${config.projectId}",
  storageBucket: "${config.storageBucket}",
  messagingSenderId: "${config.messagingSenderId}",
  appId: "${config.appId}",
  measurementId: "${config.measurementId}"
};

// Initialize Firebase
let db = null;
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    console.log('✅ Firebase آماده است');
} else {
    console.log('⚠️ Firebase SDK لود نشده است');
}`;

// خواندن index.html
const htmlPath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// جایگزینی script tag با inline script
const scriptTagRegex = /<script src="firebase-config\.js"><\/script>/;
const inlineScript = `<script>\n${firebaseConfigScript}\n</script>`;

if (scriptTagRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(scriptTagRegex, inlineScript);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('✅ Firebase config در HTML inline شد');
} else {
  // اگر script tag پیدا نشد، بعد از firebase SDK scripts اضافه کن
  const firebaseSDKRegex = /(<script src="https:\/\/www\.gstatic\.com\/firebasejs\/.*?\/firebase-firestore-compat\.js"><\/script>)/;
  if (firebaseSDKRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(firebaseSDKRegex, `$1\n    ${inlineScript}`);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('✅ Firebase config در HTML inline شد');
  } else {
    console.error('❌ خطا: نتوانست script tag را پیدا کنم');
    process.exit(1);
  }
}

// اگر Environment Variables تنظیم نشده باشند، هشدار بده
if (!config.apiKey || !config.projectId) {
  console.warn('⚠️ هشدار: برخی از Environment Variables تنظیم نشده‌اند');
  console.warn('⚠️ سیستم از localStorage استفاده خواهد کرد');
}

# Prompt for Gemini - Auto Setup Firebase

Copy this prompt and give it to Gemini:

---

```
Hello! I have a Firebase project called "keyhan-financial" and I want to set up Firestore Database for it.

Please do the following for me:

1. Go to Firebase Console and open the project "keyhan-financial"

2. Enable Firestore Database:
   - Select "Firestore Database" from the left menu
   - If you see a "Create database" button, click on it
   - Select "Start in test mode" (for now)
   - Choose a location (preferably closest to Iran or us-central1)
   - Click "Enable"

3. Set up Security Rules:
   - In the same Firestore Database page, go to the "Rules" tab
   - Replace the code with this:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if true;
    }
  }
}

   - Click the "Publish" button

4. Verify everything is correct:
   - Make sure Firestore is enabled
   - Make sure Rules are published
   - Send me a confirmation message

Please complete all steps and let me know when everything is ready, or if there are any issues.
```

---

## How to use:

1. Copy this text
2. Go to [Google Gemini](https://gemini.google.com/)
3. Paste the text
4. Gemini will do everything for you

---

## Notes:

- Gemini needs access to your Google account
- If Gemini can't access, it will ask for your permission
- After completion, refresh the page


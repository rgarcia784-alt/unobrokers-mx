const firebaseConfig = {
  apiKey: "AIzaSyDOjPtqzQ8b7ZeMrorO15dpcuQCMrYWa1U",
  authDomain: "uno-brokers-registro.firebaseapp.com",
  projectId: "uno-brokers-registro",
  storageBucket: "uno-brokers-registro.firebasestorage.app",
  messagingSenderId: "272579298913",
  appId: "1:272579298913:web:967a6b75d1c40760f34c20"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

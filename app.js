import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection, addDoc,getDocs, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// 🔑 YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDf_QmGlx6OrOCVv84our2ipdJVgDEFGlw",
  authDomain: "ideasync-4748d.firebaseapp.com",
  projectId: "ideasync-4748d"
};

// ✅ ONLY ONE INITIALIZATION
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ EXPORT (so other files can use)
export { auth, db };

// -------- AUTH --------
window.register = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  window.location.href = "onboarding.html";
};

window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await signInWithEmailAndPassword(auth, email, password);

  // check if onboarding done
  const ref = doc(db, "users", auth.currentUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    window.location.href = "dashboard.html";
  } else {
    window.location.href = "onboarding.html";
  }
};

window.logout = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

// -------- ONBOARDING --------
window.saveOnboarding = async () => {
  const role = document.getElementById("role").value;
  const skills = document.getElementById("skills").value;

  await setDoc(doc(db, "users", auth.currentUser.uid), {
    role,
    skills,
    createdAt: new Date()
  });

  window.location.href = "dashboard.html";
};

// -------- IDEAS --------
window.postIdea = async () => {
  const title = document.getElementById("ideaTitle").value;
  const desc = document.getElementById("ideaDesc").value;

  await addDoc(collection(db, "ideas"), {
    title,
    desc,
    user: auth.currentUser.email,
    createdAt: new Date()
  });

  alert("Idea Posted 🚀");
  loadIdeas();
};

window.loadIdeas = async () => {
  const container = document.getElementById("ideas");
  if (!container) return;

  container.innerHTML = "";

  const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    container.innerHTML += `
      <div style="border:1px solid #444; padding:10px; margin:10px;">
        <h3>${data.title}</h3>
        <p>${data.desc}</p>
        <small>by ${data.user}</small>
      </div>
    `;
  });
};

// -------- PROTECT ROUTES --------
window.protectPage = () => {
  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
};

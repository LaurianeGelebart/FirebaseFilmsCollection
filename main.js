import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, collection, getDocs, onSnapshot, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBmbFbZ7i09gdl6HcVFtGj1dwATa4om12k",
    authDomain: "imac-cloud.firebaseapp.com",
    projectId: "imac-cloud",
    storageBucket: "imac-cloud.appspot.com",
    messagingSenderId: "761677070876",
    appId: "1:761677070876:web:0d216959bd2a890c9715d9",
    measurementId: "G-LVBN2SHMEM"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();


// Référence à la collection 'FILMS'
const filmsCollectionRef = collection(db, 'Films');

// // Surveille les mises à jour de la collection
const unsubscribe = onSnapshot(filmsCollectionRef, (snapshot) => {
    let films = [];
    snapshot.docs.forEach(doc => {
        films.push({ id: doc.id, ...doc.data() });
    });
    displayFilms(films); 
});

// Surveiller l'état de connexion de l'utilisateur
onAuthStateChanged(auth, (user) => {
    console.log(auth)
    const connexionDiv = document.querySelector('.connexion');
    const isConnectDiv = document.querySelector('.isConnect');

    if (user) {
        console.log('Utilisateur connecté:', user);
        connexionDiv.style.display = 'none';
        isConnectDiv.style.display = 'block';
        fetchFilms();
    } else {
        console.log('Aucun utilisateur connecté');
        connexionDiv.style.display = 'block';
        isConnectDiv.style.display = 'none';
        unsubscribe();
    }
});



// Fonction pour afficher la liste des films dans l'interface HTML
const displayFilms = (films) => {
    const filmsListDiv = document.getElementById('films-list');
    filmsListDiv.innerHTML = ''; 

    films.forEach(film => {
        const filmDiv = document.createElement('div');
        filmDiv.textContent = `${film.Nom} - Date : ${film.Date} - Note : ${film.Note} \n\n`;

        const deleteForm = document.createElement('form');
        deleteForm.classList.add('supprime');

        const idInput = document.createElement('input');
        idInput.type = 'hidden'; 
        idInput.value = film.id;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.type = 'submit'; 

        deleteForm.appendChild(idInput);
        deleteForm.appendChild(deleteButton);

        filmDiv.appendChild(deleteForm);

        filmsListDiv.appendChild(filmDiv);

        // Gestion de l'événement clic sur supprimer
        deleteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const filmId = idInput.value; 
            deleteFilm(filmId);
        });
    });
};

// Fonction pour supprimer un film
const deleteFilm = async (id) => {
    try {
        const filmRef = doc(filmsCollectionRef, id); 
        await deleteDoc(filmRef); 
    } catch (error) {
        console.error('Erreur lors de la suppression du film:', error);
    }
};

// Récupérer les films depuis Firestore et les afficher
const fetchFilms = async () => {
    try {
        const snapshot = await getDocs(filmsCollectionRef); 
        let films = [];
        snapshot.docs.forEach(doc => {
            films.push({ id: doc.id, ...doc.data() }); 
        });
        displayFilms(films); 
    } catch (error) {
        console.error('Erreur lors de la récupération des films:', error);
    }
};

// Ajouter un film
const addFilmForm = document.querySelector('.ajout');
addFilmForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newFilm = {
        Nom: addFilmForm.nom.value,
        Date: addFilmForm.date.value,
        Note: addFilmForm.note.value
    };
    try {
        await addDoc(filmsCollectionRef, newFilm); 
        addFilmForm.reset(); 
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du film:', error);
    }
});

// Connexion
const connectForm = document.querySelector('.connect');
connectForm.addEventListener('submit', async (e) => {
    console.log('Tentative de connexion');
    e.preventDefault();
    const email = connectForm.user.value;
    const password = connectForm.pass.value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Utilisateur connecté');
        connectForm.reset();
    } catch (error) {
        console.error('Erreur de connexion:', error);
    }
});

// Deconnexion
const disconnectButton = document.querySelector('.disconnect');
disconnectButton.addEventListener('submit', async (e) => {
    console.log('Tentative de déconnexion');
    e.preventDefault();
    try {
        await signOut(auth);
        console.log('Déconnexion réussie');
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
});



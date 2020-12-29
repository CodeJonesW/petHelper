console.log(firebase)

// user sign in and signout via firebase authentication
const auth = firebase.auth();

const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');
const signInButton = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userDetails = document.getElementById('userDetails');

const provider = new firebase.auth.GoogleAuthProvider();

signInButton.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut()

// conditional logic for when auth state changes allows us to control ui pending the state of login
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User: ", user)
        // signed in user's info
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        signOutBtn.hidden = false
        userDetails.innerHTML = `<h3> Hi ${user.displayName}! <p>Find pet care in your area!  </p>`;

    } else {
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
        userDetails.innerHTML = '';
        petHelperList.hidden = true;
        petHelperList.innerHTML = '';
    }
});



// // manage notes via firestore
const db = firebase.firestore();


const petHelperList = document.getElementById('petHelperList')
const petHelperDiv = document.getElementById('petHelperDiv')
const createPetHelper = document.getElementById('createPetHelper')
const firstNameInput = document.getElementById('firstName')
const lastNameInput = document.getElementById('lastName')
const service1 = document.getElementById("service1")
const service2 = document.getElementById("service2")
const service3 = document.getElementById("service3")

// two things i need when accessing firestore in real time
// 1) reference to document or collection i want access such
//    as petHelperRef. the reference is starting place for CRUD actions 
// 2) front end needs to react to changes on server so we are subcribed to a stream of changes on DB
//    we will need to stop listening/unsubscribe to this stream to avoid memory leaks and extra cost$$$
//    by reading and listening to docs we dont need for ui

let petHelperRef;
let unsubscribe; 

// we want our db records to only be accessible to logged in users so we need to check
// auth state before making a call to the Db
auth.onAuthStateChanged(user => {
    if (user) {
        console.log(user)
        const { serverTimestamp } = firebase.firestore.FieldValue;

        petHelperDiv.hidden = false
        petHelperRef = db.collection('petHelpers')


        createPetHelper.onclick = (e) => {
            let serviceValues = []
            e.preventDefault()
            var checkedValues = document.querySelectorAll('.services:checked');
            checkedValues.forEach(element => serviceValues.push(element.value))

            let names = user.displayName.split(" ")

            
                petHelperRef.add({
                    uid: user.uid,
                    firstName: names[0],
                    lastName: names[1],
                    providedServices: serviceValues,
                    // use servertimeStamp instead of Date.now() so that date obj is consistent across all client devices
                    createdAt: serverTimestamp()
                });
            

        }

        // main advantage of firestore is listening to changes in realtime by making a query
        // querys return a function that you can use to unsubscribe from the query later on
        // use it when the app state changes like when user logs out
        unsubscribe = petHelperRef
        // grabs only documents with matching ids
            // .where('uid', '==', user.uid)
            // grab data one time .get if you want to subcribe to the stream of changes use onSnapshot
            .onSnapshot(querySnapshot => {
                // this is the callback function that runs on when changes happen on the server 
                // querySnapshot is the new data we can now use to update the ui
                const items = querySnapshot.docs.map(doc => {
                    // let date = doc.data().createdAt.toDate()

                    return `<li> Name: ${doc.data().firstName + " " + doc.data().lastName} <br> Services: ${doc.data().providedServices}</li><button>View</button>`
                });
                petHelperList.innerHTML = items.join('');
            })
    } else {

        unsubscribe && unsubscribe();
    }
});




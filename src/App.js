import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  useEffect(() => {
    // if(!auth.currentUser){
    //   document.getElementById('header').classList.remove('colored-header');
    // }
    // else{
    //   document.getElementById('header').classList.add('colored-header');
    // }
    if (!auth.currentUser) {
      document.getElementById('section').classList.add('pusico-login');
      document.getElementById('header').classList.remove('colored-header');
      document.getElementById('section').classList.remove('pusico-main');
    }
    else {
      document.getElementById('header').classList.add('colored-header');
      document.getElementById('section').classList.remove('pusico-login');
      document.getElementById('section').classList.add('pusico-main');
    }
  })

  return (
    <div className="App">
      <header id='header'>
        {!auth.currentUser ? <h1 className='pulsing-text'>Welcome to the chat, be polite!</h1>
          :
          <SignOut />
        }
      </header>

      <section id='section'>
        {user ? <ChatRoom /> :
          <div>
            <SignIn />
          </div>
        }
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in special-button" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <div style={{display: 'inline'}}>
      <button className="sign-out special-button" onClick={() => auth.signOut()}>Sign Out</button>
      <a href='https://developer.mozilla.org/en-US/docs/Web/CSS/background-size'><button className="special-button">Github</button></a>
    </div>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder='Type something' />

      <button type="submit" disabled={!formValue}>Send</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
import React, {useEffect, useState} from 'react';
import {signalServer} from "./api/signals";

export default function App() {

  const [sendSignal, setSendSignal] = useState()

  const sendSignal = signalServer("localhost:8080/ws", (signal) => {
    if (signal.type === "Offer") {
      console.log("RECEIVED offer")
    } else {
      console.log("RECEIVED answer")
    }
  })

  const [status, setStatus] = useState("disabled")

  useEffect(() => {
    setTimeout(()=> {

      setSendSignal()
    }, 3000)
  });

  return (
    <div>
      <header>
        <h1>current connection state is {status.toUpperCase()}</h1>
      </header>
    </div>
  );
}

import React from 'react';
import {CyberChat} from "./components/CyberChat";
import "./App.css";
import {AuthProvider} from "./components/auth/AuthContext";

export default function App() {
    return (
        <div className="App">
            <AuthProvider>
                <CyberChat/>
            </AuthProvider>
        </div>
    );
}
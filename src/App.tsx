import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {


  return (
    <main className="container">
      <h1 className="text-white">Welcome to Tauri + React</h1>
    </main>
  );
}

export default App;

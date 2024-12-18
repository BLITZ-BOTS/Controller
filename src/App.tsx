// Packages
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// Components
import Layout from "./Layout";

// Pages
import Home from "./Pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

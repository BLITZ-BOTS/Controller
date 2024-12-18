// Packages
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// Components
import Layout from "./Layout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap pages with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<h1>hello</h1>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

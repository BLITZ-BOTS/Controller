import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SkeletonTheme } from "react-loading-skeleton";
import "./App.css";

// Layout Components
import TitleBar from "./Components/Window_Controls";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

// Pages
import Home from "./Pages/Home";
import Plugins from "./Pages/Plugins/List";
import EditPage from "./Pages/Edit";
import { Config } from "./Pages/Config";
import PluginDetails from "./Pages/Plugins/Details";

// Plugin Details

function App() {
  return (
    <>
      <TitleBar />
      <Navbar />
      <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <br></br>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plugins" element={<Plugins />} />
            <Route path="/plugin/:name" element={<PluginDetails/>}/>
            <Route path="/edit/:name" element={<EditPage />} />
            <Route path="/:bot/:plugin" element={<Config/>}/>
          </Routes>
        </Router>
      </SkeletonTheme>
      <Footer />
    </>
  );
}

export default App;

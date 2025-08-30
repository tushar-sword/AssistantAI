import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "../pages/HomaPage/HomePage";
import ProductAddPage from "../pages/productAddPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-product" element={<ProductAddPage />} />
      </Routes>
    </Router>
  );
}

export default App;

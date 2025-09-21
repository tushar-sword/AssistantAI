import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomaPage/HomePage";
import ProductAddPage from "../pages/ProductAddPage/ProductAddPage";
import Login from "../pages/AuthPages/LoginPage";
import Register from "../pages/AuthPages/RegisterPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import ProductReviewPage from "../pages/ProductReviewPage/ProductReviewPage";
import AIProRevPage from "../pages/AIProductReviewPage/AIProRevPage";
import AIContentPage from "../pages/AIContentPage/AIContentPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import AIProductDetailPage from "../pages/AiProductDetailPage/AIProductDetailPage";
import ContentProductDetails from "../pages/ContentProductDetails/ContentProductDetails";
import ContentGenerationPage from "../pages/ContentGenrationPage/ContentGenerationPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-product" element={<ProductAddPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/product-review" element={<ProductReviewPage />} />
        <Route path="/ai-product-review" element={<AIProRevPage />} />
        <Route path="/ai-content" element={<AIContentPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        <Route path="/ai-products/:id" element={<AIProductDetailPage />} /> 


        
        <Route path="/ai-content/:id/details" element={<ContentProductDetails />} />
        <Route path="/ai-content/:id/content" element={<ContentGenerationPage />} />
      </Routes>
    </Router>
  );
}

export default App;

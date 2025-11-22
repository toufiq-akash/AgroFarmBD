import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from './Components/Navbar/Navbar.jsx';
import Hero from './Components/Navbar/Hero/Hero.jsx';
import About from './Components/About/About.jsx';
import Services from './Components/Services/Services.jsx';
import Contact from './Components/Contact/Contact.jsx';
import Signup from "./Signup.jsx";
import Login from "./Login.jsx";

// Dashboards
import FarmOwnerDashboard from './FarmOwnerDashboard.jsx';
import FarmOwnerProfile from "./FarmOwnerProfile.jsx";
import CustomerDashboard from './CustomerDashboard.jsx';
import CustomerProfile from './CustomerProfile.jsx';
import DeliverymanDashboard from './DeliverymanDashboard.jsx';
import DeliverymanProfile from './DeliverymanProfile.jsx';
import ProductsPage from "./ProductsPage";
import ProductDetail from "./ProductDetail";
import FarmOwnerProductPreview from "./FarmOwnerProductPreview";
import DeliveryManagement from "./DeliveryManagement";

// Admin
import AdminDashboard from "./AdminDashboard";
import ManageUsers from "./ManageUsers";
import ManageProducts from "./ManageProducts";
import ManageOrders from "./ManageOrders";
import Feedbacks from "./Feedbacks";
import Reports from "./Reports";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <div className="container">
        <About />
        <Services />
        <Contact />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Customer / Farm Owner / Deliveryman */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/farm-owner-dashboard" element={<FarmOwnerDashboard />} />
        <Route path="/farm-owner-profile" element={<FarmOwnerProfile />} />
        <Route path="/deliveryman-dashboard" element={<DeliverymanDashboard />} />
        <Route path="/deliveryman-profile" element={<DeliverymanProfile />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/farm-owner/product/:id" element={<FarmOwnerProductPreview />} />
        <Route path="/delivery-management" element={<DeliveryManagement />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/orders" element={<ManageOrders />} />
        <Route path="/admin/feedbacks" element={<Feedbacks />} />
        <Route path="/admin/reports" element={<Reports />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

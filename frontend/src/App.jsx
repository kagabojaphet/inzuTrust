import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import RegisterTenant from './pages/TenantRegister'
import RegisterLandlord from './pages/LandlordRegister'
import TenantDashboard from './pages/TenantDashboard'
import LandlordDashboard from './pages/LandlordDashboard' // Updated import name
import Properties from './pages/Properties'
import Profile from './pages/Profile'
import AIChatbot from './components/AIChatbot';
import BackToTop from './components/BackToTop';

import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import Board from './pages/Board';
import Careers from './pages/Careers';
import Pricing from './pages/Pricing';
import VerifyOTP from './components/VerifyOTP';

import './App.css'

// Layout helper to keep the UI consistent
function Layout({ children, showFooter = true }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AIChatbot /> 
        <BackToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/register/tenant" element={<RegisterTenant />} />
          <Route path="/register/landlord" element={<RegisterLandlord />} />
          <Route path="/properties" element={<Layout><Properties /></Layout>} />
          <Route path="/about" element={<Layout><AboutUs /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/board" element={<Layout><Board /></Layout>} />
          <Route path="/careers" element={<Layout><Careers /></Layout>} />
          <Route path="/prices" element={<Layout><Pricing /></Layout>} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/login" element={<Layout><Login /></Layout>} />

          {/* General Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />

          {/* Role-Specific Protected Routes */}
          {/* Tenant specific dashboard */}
          <Route 
            path="/tenant/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <Layout><TenantDashboard /></Layout> 
              </ProtectedRoute>
            } 
          />

          {/* Landlord specific dashboard */}
          <Route 
            path="/landlord/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <Layout><LandlordDashboard /></Layout>
              </ProtectedRoute>
            } 
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
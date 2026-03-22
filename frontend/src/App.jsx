import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterTenant from './pages/TenantRegister'
import RegisterLandlord from './pages/LandlordRegister'
import TenantDashboard from './pages/TenantDashboard'
import LandlordDashboard from './pages/LandlordDashboard'
import AdminDashboard from './pages/AdminDashboard' 
import Properties from './pages/Properties'
import Profile from './pages/Profile'
import AIChatbot from './components/AIChatbot';
import BackToTop from './components/BackToTop';
import PropertyDetail from './pages/PropertyDetail';

import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import Board from './pages/Board';
import Careers from './pages/Careers';
import Pricing from './pages/Pricing';
import VerifyOTP from './components/VerifyOTP';


import './App.css'

function PublicLayout({ children, showFooter = true }) {
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
          {/* Public Pages */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/register/tenant" element={<RegisterTenant />} />
          <Route path="/register/landlord" element={<RegisterLandlord />} />
          <Route path="/properties" element={<PublicLayout><Properties /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/board" element={<PublicLayout><Board /></PublicLayout>} />
          <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
          <Route path="/prices" element={<PublicLayout><Pricing /></PublicLayout>} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/properties/:id" element={<PublicLayout><PropertyDetail /></PublicLayout>} />
          <Route path="/register/*" element={<Register />} />

          {/* Admin Protected Route */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* General Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <PublicLayout><Profile /></PublicLayout>
            </ProtectedRoute>
          } />

          {/* Role-Specific Dashboard Routes */}
          <Route 
            path="/tenant/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantDashboard /> 
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/landlord/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordDashboard />
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
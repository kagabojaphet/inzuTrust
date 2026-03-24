import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home               from './pages/Home'
import Login              from './pages/Login'
import Register           from './pages/Register'
import RegisterTenant     from './pages/TenantRegister'
import RegisterLandlord   from './pages/LandlordRegister'
import TenantDashboard    from './pages/TenantDashboard'
import LandlordDashboard  from './pages/LandlordDashboard'
import AdminDashboard     from './pages/AdminDashboard'
import Properties         from './pages/Properties'
import Profile            from './pages/Profile'
import PropertyDetail     from './pages/PropertyDetail'
import AboutUs            from './pages/AboutUs'
import Services           from './pages/Services'
import Board              from './pages/Board'
import Careers            from './pages/Careers'
import Pricing            from './pages/Pricing'
import HelpCenter         from './pages/HelpCenter'
import ContactUs          from './pages/ContactUs'
import Documentation      from './pages/Documentation'
import TermsAndConditions from './pages/TermsAndConditions'

import AIChatbot  from './components/AIChatbot'
import BackToTop  from './components/BackToTop'
import VerifyOTP  from './components/VerifyOTP'
import './App.css'

// ── Layouts ───────────────────────────────────────────────────────────────────
function PublicLayout({ children, showFooter = true }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

// Alias — some routes use <Layout>, keep both pointing to the same component
const Layout = PublicLayout;

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AIChatbot />
        <BackToTop />
        <Routes>

          {/* ── Public ── */}
          <Route path="/"          element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login"     element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register/*"element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/register/tenant"   element={<PublicLayout><RegisterTenant /></PublicLayout>} />
          <Route path="/register/landlord" element={<PublicLayout><RegisterLandlord /></PublicLayout>} />
          <Route path="/verify-otp"element={<VerifyOTP />} />

          <Route path="/properties"    element={<PublicLayout><Properties /></PublicLayout>} />
          <Route path="/properties/:id"element={<PublicLayout><PropertyDetail /></PublicLayout>} />

          <Route path="/about"      element={<PublicLayout><AboutUs /></PublicLayout>} />
          <Route path="/services"   element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/board"      element={<PublicLayout><Board /></PublicLayout>} />
          <Route path="/careers"    element={<PublicLayout><Careers /></PublicLayout>} />
          <Route path="/prices"     element={<PublicLayout><Pricing /></PublicLayout>} />

          <Route path="/help-center"          element={<Layout><HelpCenter /></Layout>} />
          <Route path="/contact-us"           element={<Layout><ContactUs /></Layout>} />
          <Route path="/documentation"        element={<Layout><Documentation /></Layout>} />
          <Route path="/terms-and-conditions" element={<Layout><TermsAndConditions /></Layout>} />

          {/* ── Protected: general ── */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <PublicLayout><Profile /></PublicLayout>
            </ProtectedRoute>
          } />

          {/* ── Protected: tenant ── */}
          <Route path="/tenant/dashboard" element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantDashboard />
            </ProtectedRoute>
          } />

          {/* ── Protected: landlord ── */}
          <Route path="/landlord/dashboard" element={
            <ProtectedRoute allowedRoles={['landlord']}>
              <LandlordDashboard />
            </ProtectedRoute>
          } />

          {/* ── Protected: admin ── */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
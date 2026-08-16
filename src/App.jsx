import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import MapSearch from '@/pages/MapSearch';
import PropertyDetail from '@/pages/PropertyDetail';
import Owner from '@/pages/Owner';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
// Add page imports here
import MyProperties from '@/pages/MyProperties';
import Admin from '@/pages/Admin';
import Settings from '@/pages/Settings';
import Messages from '@/pages/Messages';
import Conversation from '@/pages/Conversation';
import Saved from '@/pages/Saved';
import SavedSearches from '@/pages/SavedSearches';
import About from '@/pages/About';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import DataDeletion from '@/pages/DataDeletion';
import CookiePolicy from '@/pages/CookiePolicy';
import Contact from '@/pages/Contact';
import PlanuriUpgrade from '@/pages/PlanuriUpgrade';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CountryProvider } from '@/components/CountryContext';
import Account from '@/pages/Account';
import MyReports from '@/pages/MyReports';
import PostProperty from '@/pages/PostProperty';
import UserProfile from '@/pages/UserProfile';
import RecommendedListings from '@/pages/RecommendedListings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        {/* Căutare unificată: listă + hartă + filtre în aceeași pagină, stil Zillow.
            /search și /map duc la aceeași experiență. */}
        <Route path="/search" element={<MapSearch />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/upgrade" element={<PlanuriUpgrade />} />
        {/* Destinația unică a „Vezi mai multe” de pe rândurile de pe homepage —
            listă simplă, ordonată pe plan, fără hartă (harta e la /map). */}
        <Route path="/anunturi-recomandate" element={<RecommendedListings />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/map" element={<MapSearch />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/owner" element={<Owner />} />
          <Route path="/my-properties" element={<MyProperties />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/searches" element={<SavedSearches />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/account" element={<Account />} />
          <Route path="/my-reports" element={<MyReports />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/post-property" element={<PostProperty />} />
        <Route path="/messages/:id" element={<Conversation />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <CountryProvider>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </CountryProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
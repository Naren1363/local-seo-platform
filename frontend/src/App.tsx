import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BusinessOnboardingModal } from './components/BusinessOnboardingModal';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NearbyPlacesPage } from './pages/NearbyPlacesPage';
import { CompetitorsPage } from './pages/CompetitorsPage';
import { AuditPage } from './pages/AuditPage';
import { KeywordsPage } from './pages/KeywordsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ReportsPage } from './pages/ReportsPage';

const ProtectedLayout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { businesses, loading: bizLoading } = useBusiness();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  if (authLoading || bizLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-semibold">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Local SEO Platform...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenOnboarding={() => setIsOnboardingOpen(true)} />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard onOpenOnboarding={() => setIsOnboardingOpen(true)} />} />
            <Route path="/nearby" element={<NearbyPlacesPage />} />
            <Route path="/competitors" element={<CompetitorsPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/keywords" element={<KeywordsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <BusinessOnboardingModal
        isOpen={isOnboardingOpen || businesses.length === 0}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <BusinessProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BusinessProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

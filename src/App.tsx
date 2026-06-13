import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { PlannerProvider } from './state/PlannerContext';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { Landing } from './pages/Landing';
import { PlannerPage } from './pages/PlannerPage';
import { ResultsPage } from './pages/ResultsPage';
import { QuantumPage } from './pages/QuantumPage';
import { CaseStudyPage } from './pages/CaseStudyPage';
import { MethodsPage } from './pages/MethodsPage';
import { AboutPage } from './pages/AboutPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export function App() {
  return (
    <PlannerProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <NavBar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/quantum" element={<QuantumPage />} />
          <Route path="/case-study" element={<CaseStudyPage />} />
          <Route path="/methods" element={<MethodsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Landing />} />
        </Routes>
        <Footer />
      </HashRouter>
    </PlannerProvider>
  );
}

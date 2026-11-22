/** Module 1 - routing and page shell. */
import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import AppShell from '@/components/layout/AppShell';
import Footer from '@/components/layout/Footer';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import About from '@/pages/About';
import Official from '@/pages/Official';
import Community from '@/pages/Community';
import Admin from '@/pages/Admin';
import GradientButton from '@/components/ui/GradientButton';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0); // braces matter: some browsers return a value from scrollTo, and React treats a returned value as a cleanup function
  }, [pathname]);
  return null;
}

/** Landing, about and 404: floating navbar + footer. */
function SiteLayout() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen"><Outlet /></div>
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-6 pt-28 text-center">
      <div>
        <h1 className="text-4xl font-bold">This page does not exist.</h1>
        <p className="mt-3 text-slate-400">The link may be broken or the page may have moved.</p>
        <GradientButton to="/" className="mt-6">Back to home</GradientButton>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/official" element={<Official />} />
          <Route path="/community" element={<Community />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </MotionConfig>
  );
}


import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import StoreLayout from './components/StoreLayout.jsx';
import Toaster from './components/Toaster.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import About from './pages/About.jsx';
import ComingSoon from './pages/ComingSoon.jsx';

// The admin page (and its code) only downloads when the owner opens /admin.
const Admin = lazy(() => import('./pages/Admin.jsx'));

export default function App() {
  return (
    <>
      <Routes>
        {/* Customer-facing pages share the navbar */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />

          {/* Placeholder until its design is shared */}
          <Route path="/cart" element={<ComingSoon title="Cart" />} />
          <Route path="*" element={<ComingSoon title="Page not found" />} />
        </Route>

        {/* Admin has its own layout (no storefront navbar) */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

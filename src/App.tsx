import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from '@/src/context/StoreContext';
import { Layout } from '@/src/components/Layout';
import { HomePage } from '@/src/pages/HomePage';
import { ServicesPage } from '@/src/pages/ServicesPage';
import { QuoteConfiguratorPage } from '@/src/pages/QuoteConfiguratorPage';
import { CataloguePage } from '@/src/pages/CataloguePage';
import { RealisationsPage } from '@/src/pages/RealisationsPage';
import { AboutPage } from '@/src/pages/AboutPage';
import { ContactPage } from '@/src/pages/ContactPage';
import { ClientPortalPage } from '@/src/pages/ClientPortalPage';
import { AdminPage } from '@/src/pages/AdminPage';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/devis" element={<QuoteConfiguratorPage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/realisations" element={<RealisationsPage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mon-espace" element={<ClientPortalPage />} />
          </Route>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

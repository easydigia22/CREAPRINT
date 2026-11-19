import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileSpreadsheet,
  FolderOpen,
  Image,
  Kanban,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { CreaPrintLogo } from '@/src/components/CreaPrintLogo';
import { useStore } from '@/src/context/StoreContext';
import { Button } from '@/src/components/ui/primitives';
import { AdminOverview } from '@/src/components/admin/AdminOverview';
import { AdminCrmModule, AdminQuotesModule } from '@/src/components/admin/AdminCrmAndQuotes';
import { AdminFilesModule, AdminOrdersModule } from '@/src/components/admin/AdminOrdersAndFiles';
import {
  AdminGalleryModule,
  AdminProductsModule,
  AdminSettingsModule,
} from '@/src/components/admin/AdminCatalogGallerySettings';
import { cn } from '@/src/lib/utils';
import type { UserRole } from '@/src/types/creaprint';

const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard, roles: ['admin', 'commercial', 'production'] },
  { id: 'crm', label: 'Prospects / CRM', icon: Users, roles: ['admin', 'commercial'] },
  { id: 'quotes', label: 'Devis', icon: FileSpreadsheet, roles: ['admin', 'commercial'] },
  { id: 'orders', label: 'Commandes / Prod.', icon: Kanban, roles: ['admin', 'commercial', 'production'] },
  { id: 'products', label: 'Produits & Tarifs', icon: Package, roles: ['admin'] },
  { id: 'files', label: 'Fichiers clients', icon: FolderOpen, roles: ['admin', 'commercial', 'production'] },
  { id: 'gallery', label: 'Galerie', icon: Image, roles: ['admin', 'commercial'] },
  { id: 'settings', label: 'Paramètres', icon: Settings, roles: ['admin'] },
];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  commercial: 'Commercial',
  production: 'Production',
  client: 'Client',
};

export function AdminPage() {
  const { currentUser, loginAsRole, logout } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  const isStaff =
    currentUser &&
    (currentUser.role === 'admin' ||
      currentUser.role === 'commercial' ||
      currentUser.role === 'production');

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-[#151515] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#1E1E1E] border border-white/10 p-8 space-y-6">
          <div className="text-center space-y-2">
            <CreaPrintLogo variant="light" showSignature size="md" className="mx-auto" />
            <h1 className="pt-3 font-display text-xl font-bold">Espace Équipe CreaPrint</h1>
            <p className="text-xs text-white/65">
              Sélectionnez votre profil pour accéder au tableau de bord sécurisé par rôle.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => loginAsRole('admin')}
              className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#56B9E8] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-white">Administrateur</span>
                <span className="text-[11px] font-semibold text-[#56B9E8]">Accès complet</span>
              </div>
              <p className="text-xs text-white/60 mt-1">
                CRM, Devis, Production, Produits, Tarifs, Fichiers, Galerie et Paramètres.
              </p>
            </button>

            <button
              type="button"
              onClick={() => loginAsRole('commercial')}
              className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F5D84C] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-white">Commercial</span>
                <span className="text-[11px] font-semibold text-[#F5D84C]">Ventes &amp; Devis</span>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Gestion des prospects, relances WhatsApp, création de devis PDF et suivi commandes.
              </p>
            </button>

            <button
              type="button"
              onClick={() => loginAsRole('production')}
              className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F17B9B] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-white">Production</span>
                <span className="text-[11px] font-semibold text-[#F17B9B]">Atelier &amp; BAT</span>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Kanban production, contrôle qualité et validation des fichiers clients.
              </p>
            </button>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/65 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour au site public CreaPrint
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const allowedNav = NAV_ITEMS.filter((item) => item.roles.includes(currentUser.role));
  const safeTab = allowedNav.some((i) => i.id === activeTab) ? activeTab : allowedNav[0].id;
  const activeNavObj = allowedNav.find((i) => i.id === safeTab);

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col lg:flex-row">
      {/* Sidebar on #151515 graphite */}
      <aside className="w-full lg:w-64 bg-[#151515] text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
            <Link to="/">
              <CreaPrintLogo variant="light" size="sm" />
            </Link>
            <span className="text-[10px] font-mono font-bold text-[#F5D84C]">ADMIN</span>
          </div>

          <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {allowedNav.map((item) => {
              const Icon = item.icon;
              const isActive = safeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer',
                    isActive
                      ? 'bg-[#56B9E8] text-[#151515] font-bold'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-lg bg-white/10 inline-flex items-center justify-center text-[#F5D84C]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{currentUser.fullName}</p>
              <p className="text-[11px] text-white/60">{ROLE_LABELS[currentUser.role]}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 h-8 inline-flex items-center justify-center rounded-md border border-white/15 text-[11px] font-semibold text-white/80 hover:bg-white/10"
            >
              Site public
            </Link>
            <button
              type="button"
              onClick={logout}
              className="h-8 px-2.5 inline-flex items-center justify-center rounded-md border border-white/15 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-[#E9E9E6] px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#70849A]">
            <span>CreaPrint Admin</span>
            <span>/</span>
            <span className="font-display font-bold text-[#151515] text-sm">
              {activeNavObj?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Changer de rôle (démonstration)"
              value={currentUser.role}
              onChange={(e) => loginAsRole(e.target.value as UserRole)}
              className="h-9 rounded-lg border border-[#DCDCD7] bg-[#F7F7F4] px-2.5 text-xs font-semibold text-[#151515]"
            >
              <option value="admin">Rôle : Administrateur</option>
              <option value="commercial">Rôle : Commercial</option>
              <option value="production">Rôle : Production</option>
            </select>
            <Button type="button" variant="outline" size="sm" onClick={logout} className="lg:hidden">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        <main className="p-6 flex-1 overflow-x-hidden">
          {safeTab === 'overview' && <AdminOverview onNavigate={setActiveTab} />}
          {safeTab === 'crm' && <AdminCrmModule />}
          {safeTab === 'quotes' && <AdminQuotesModule onConverted={() => setActiveTab('orders')} />}
          {safeTab === 'orders' && <AdminOrdersModule />}
          {safeTab === 'products' && <AdminProductsModule />}
          {safeTab === 'files' && <AdminFilesModule />}
          {safeTab === 'gallery' && <AdminGalleryModule />}
          {safeTab === 'settings' && <AdminSettingsModule />}
        </main>
      </div>
    </div>
  );
}

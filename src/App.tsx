import React, { useState, useEffect } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useVacations } from '@/hooks/useVacations';
import { useExport } from '@/hooks/useExport';
import { DashboardPage } from '@/pages/DashboardPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { VacationForm } from '@/components/vacation/VacationForm';
import { VacationInput } from '@/domain/types';
import {
  Calendar,
  LayoutDashboard,
  Moon,
  Sun,
  Palmtree,
  Download,
  Plus,
} from 'lucide-react';

export default function App() {
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar'>('dashboard');
  const { vacations, safeAdd, seedSampleData } = useVacations();
  const { exportCSV } = useExport();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Seed sample data on first visit if database is completely empty so user has immediate rich preview
  useEffect(() => {
    const hasInitialized = localStorage.getItem('vacations_initialized');
    if (!hasInitialized) {
      seedSampleData().then(() => {
        localStorage.setItem('vacations_initialized', 'true');
      });
    }
  }, [seedSampleData]);

  const handleQuickAdd = async (input: VacationInput) => {
    const res = await safeAdd(input);
    if (res.ok) {
      showToast('Férias cadastradas com sucesso!');
      return { ok: true };
    }
    return { ok: false, message: res.conflict.message };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract: 3 zones separated by gap-8: Brand wordmark — Nav links — Primary action */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand single-line wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Palmtree className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Gerenciador de Férias
            </span>
          </div>

          {/* Zone 2: Single-line clean text navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'dashboard'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Painel</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'calendar'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendário</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const res = exportCSV();
                if (res.success) {
                  showToast(`CSV exportado (${res.count} registros).`);
                } else {
                  showToast('Nenhum registro para exportar.');
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </nav>

          {/* Zone 3: Dark Mode toggle & Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
              aria-label="Alternar tema claro e escuro"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agendar Férias</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {currentView === 'dashboard' ? (
          <DashboardPage onNavigateToCalendar={() => setCurrentView('calendar')} />
        ) : (
          <CalendarPage onNavigateToDashboard={() => setCurrentView('dashboard')} />
        )}
      </main>

      {/* Toast Feedback */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium shadow-lg border border-slate-700 dark:border-slate-300"
        >
          {toastMessage}
        </aside>
      )}

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <VacationForm
              existingVacations={vacations}
              onSubmit={handleQuickAdd}
              onCancel={() => setIsQuickAddOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

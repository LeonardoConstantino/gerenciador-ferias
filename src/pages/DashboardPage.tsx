import React, { useState, useMemo } from 'react';
import { useVacations } from '@/hooks/useVacations';
import { useConflicts } from '@/hooks/useConflicts';
import { useNotifications } from '@/hooks/useNotifications';
import { useExport } from '@/hooks/useExport';
import { Vacation, VacationInput } from '@/domain/types';
import { ConflictBanner } from '@/components/alerts/ConflictBanner';
import { UpcomingBanner } from '@/components/alerts/UpcomingBanner';
import { VacationList } from '@/components/vacation/VacationList';
import { VacationForm } from '@/components/vacation/VacationForm';
import {
  Calendar,
  Clock,
  Download,
  Plus,
  Sparkles,
  SunMedium,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { formatDateBR } from '@/utils/dateUtils';

interface DashboardPageProps {
  onNavigateToCalendar: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToCalendar }) => {
  const {
    vacations,
    isLoading,
    safeAdd,
    safeUpdate,
    deleteVacation,
    seedSampleData,
    clearAll,
  } = useVacations();
  const { conflictingVacationIds } = useConflicts();
  const { alerts, permission, requestPermission } = useNotifications();
  const { exportCSV } = useExport();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vacationToEdit, setVacationToEdit] = useState<Vacation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const totalDays = vacations.reduce((acc, v) => acc + v.durationDays, 0);
    const upcomingList = vacations.filter(v => v.status === 'upcoming');
    const ongoingList = vacations.filter(v => v.status === 'ongoing');
    const pastList = vacations.filter(v => v.status === 'past');

    const nextUpcoming = upcomingList.length > 0 ? upcomingList[0] : null;

    return {
      totalDays,
      upcomingCount: upcomingList.length,
      ongoingCount: ongoingList.length,
      pastCount: pastList.length,
      nextUpcoming,
    };
  }, [vacations]);

  // Colliding items for the conflict banner
  const conflictingVacations = useMemo(() => {
    return vacations.filter(v => conflictingVacationIds.has(v.id));
  }, [vacations, conflictingVacationIds]);

  const handleFormSubmit = async (input: VacationInput) => {
    if (vacationToEdit) {
      const res = await safeUpdate(vacationToEdit.id, input);
      if (res.ok) {
        showToast('Férias atualizadas com sucesso!');
        return { ok: true };
      }
      return { ok: false, message: res.conflict.message };
    } else {
      const res = await safeAdd(input);
      if (res.ok) {
        showToast('Novas férias agendadas com sucesso!');
        return { ok: true };
      }
      return { ok: false, message: res.conflict.message };
    }
  };

  const handleEditClick = (vacation: Vacation) => {
    setVacationToEdit(vacation);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setVacationToEdit(null);
    setIsFormOpen(true);
  };

  const handleExport = () => {
    const result = exportCSV();
    if (result.success) {
      showToast(`Exportação de ${result.count} registro(s) gerada com sucesso.`);
    } else {
      showToast('Nenhum registro para exportar.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium shadow-lg border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-2"
        >
          {toastMessage}
        </aside>
      )}

      {/* Hero / Action Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Painel Geral de Férias
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Gerenciamento offline-first com persistência IndexedDB, detecção de sobreposição e
            alertas de proximidade.
          </p>
        </div>

        {/* Global Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={vacations.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
              vacations.length === 0
                ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToCalendar}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ver no Calendário</span>
          </button>

          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Férias</span>
          </button>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section aria-label="Estatísticas gerais de férias" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Acumulado</span>
            <SunMedium className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {metrics.totalDays}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">
              dias
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Somatório de todos os períodos
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Próximos Períodos</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {metrics.upcomingCount}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {metrics.nextUpcoming
              ? `Próxima: ${formatDateBR(metrics.nextUpcoming.startDate)}`
              : 'Nenhuma agendada'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Em Andamento</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {metrics.ongoingCount}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {metrics.ongoingCount > 0 ? 'Férias ativas hoje' : 'Nenhuma em curso'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-700 dark:text-slate-300">
            {metrics.pastCount}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Histórico concluído
          </p>
        </div>
      </section>

      {/* Proximity Alerts Banner */}
      <UpcomingBanner
        alerts={alerts}
        permission={permission}
        onRequestPermission={requestPermission}
        onSelectVacation={id => {
          const vac = vacations.find(v => v.id === id);
          if (vac) handleEditClick(vac);
        }}
      />

      {/* Conflicts Banner */}
      <ConflictBanner
        conflictingVacations={conflictingVacations}
        onSelectVacation={handleEditClick}
      />

      {/* Vacation List */}
      <VacationList
        vacations={vacations}
        conflictingIds={conflictingVacationIds}
        onAddNew={handleAddNew}
        onEdit={handleEditClick}
        onDelete={deleteVacation}
        onSeedSamples={async () => {
          await seedSampleData();
          showToast('Dados de exemplo carregados com sucesso.');
        }}
      />

      {/* Quick Database Reset / Sample Seed Toolbar Footer */}
      {vacations.length > 0 && (
        <footer className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Armazenamento local ativo via IndexedDB (Dexie.js)</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                await seedSampleData();
                showToast('Dados de exemplo redefinidos com sucesso.');
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Recarregar Exemplos
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Tem certeza de que deseja apagar todos os registros de férias do banco local?')) {
                  await clearAll();
                  showToast('Todos os registros foram excluídos.');
                }
              }}
              className="text-rose-600 dark:text-rose-400 hover:underline"
            >
              Limpar Banco de Dados
            </button>
          </div>
        </footer>
      )}

      {/* Vacation Create/Edit Modal Dialog */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <VacationForm
              vacationToEdit={vacationToEdit}
              existingVacations={vacations}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setVacationToEdit(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

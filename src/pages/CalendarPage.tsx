import React, { useState } from 'react';
import { useVacations } from '@/hooks/useVacations';
import { VacationCalendar } from '@/components/vacation/VacationCalendar';
import { VacationForm } from '@/components/vacation/VacationForm';
import { Vacation, VacationInput } from '@/domain/types';
import { ArrowLeft, Plus } from 'lucide-react';

interface CalendarPageProps {
  onNavigateToDashboard: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onNavigateToDashboard }) => {
  const { vacations, safeAdd, safeUpdate, deleteVacation } = useVacations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vacationToEdit, setVacationToEdit] = useState<Vacation | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectVacation = (vacation: Vacation) => {
    setVacationToEdit(vacation);
    setPrefilledDate(null);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setVacationToEdit(null);
    setPrefilledDate(null);
    setIsFormOpen(true);
  };

  const handleAddNewWithDate = (date: Date) => {
    setVacationToEdit(null);
    setPrefilledDate(date);
    setIsFormOpen(true);
  };

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
        showToast('Novas férias agendadas no calendário!');
        return { ok: true };
      }
      return { ok: false, message: res.conflict.message };
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

      {/* Top Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Voltar ao Painel"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Calendário Interativo
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Visualize intervalos de férias, sobreposições e dias disponíveis.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Período</span>
        </button>
      </section>

      {/* Monthly FullCalendar */}
      <VacationCalendar
        vacations={vacations}
        onSelectVacation={handleSelectVacation}
        onAddNewWithDate={handleAddNewWithDate}
        onDelete={id => {
          deleteVacation(id);
          showToast('Período removido do calendário.');
        }}
      />

      {/* Vacation Create/Edit Modal Dialog */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <VacationForm
              vacationToEdit={
                vacationToEdit ||
                (prefilledDate
                  ? {
                      id: '',
                      name: '',
                      startDate: prefilledDate,
                      durationDays: 7,
                      endDate: prefilledDate,
                      status: 'upcoming',
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    }
                  : null)
              }
              existingVacations={vacations}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setVacationToEdit(null);
                setPrefilledDate(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

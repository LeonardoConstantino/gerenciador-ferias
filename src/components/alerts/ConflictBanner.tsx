import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Vacation } from '@/domain/types';
import { formatDateBR } from '@/utils/dateUtils';

interface ConflictBannerProps {
  conflictingVacations: Vacation[];
  onSelectVacation?: (vacation: Vacation) => void;
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({
  conflictingVacations,
  onSelectVacation,
}) => {
  if (conflictingVacations.length === 0) return null;

  return (
    <section
      aria-label="Aviso de conflito de datas"
      className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-100 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-rose-900 dark:text-rose-200">
            Conflito de agendamento detectado
          </h2>
          <p className="mt-1 text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
            Há {conflictingVacations.length} períodos com sobreposição de datas no calendário.
            Verifique as datas para evitar agendamentos simultâneos indesejados.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {conflictingVacations.map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVacation?.(v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors"
              >
                <span>{v.name}</span>
                <span className="text-rose-600 dark:text-rose-400 tabular-nums">
                  ({formatDateBR(v.startDate)} – {formatDateBR(v.endDate)})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

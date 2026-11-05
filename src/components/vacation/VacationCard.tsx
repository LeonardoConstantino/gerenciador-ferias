import React from 'react';
import { Vacation } from '@/domain/types';
import { formatDateBR, getProximityLabel } from '@/utils/dateUtils';
import { Calendar, Clock, Edit2, Trash2, AlertCircle, FileText } from 'lucide-react';

interface VacationCardProps {
  vacation: Vacation;
  hasConflict?: boolean;
  onEdit: (vacation: Vacation) => void;
  onDelete: (id: string) => void;
}

export const VacationCard: React.FC<VacationCardProps> = ({
  vacation,
  hasConflict,
  onEdit,
  onDelete,
}) => {
  const statusLabel =
    vacation.status === 'upcoming'
      ? 'Próximas'
      : vacation.status === 'ongoing'
      ? 'Em andamento'
      : 'Concluídas';

  const statusColorClass =
    vacation.status === 'ongoing'
      ? 'text-emerald-700 dark:text-emerald-400'
      : vacation.status === 'upcoming'
      ? 'text-blue-700 dark:text-blue-400'
      : 'text-slate-600 dark:text-slate-400';

  const proximity = vacation.status === 'upcoming' ? getProximityLabel(vacation.startDate) : null;

  return (
    <article
      className={`p-4 rounded-xl border bg-white dark:bg-slate-900 transition-all ${
        hasConflict
          ? 'border-rose-300 dark:border-rose-800 ring-1 ring-rose-200 dark:ring-rose-900/50'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header Title */}
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
            {vacation.name}
          </h3>

          {/* Unboxed Metadata with clean typographic separators */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400">
            <span className={`font-medium ${statusColorClass}`}>{statusLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono text-slate-700 dark:text-slate-300">
              {formatDateBR(vacation.startDate)} até {formatDateBR(vacation.endDate)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">
              {vacation.durationDays} {vacation.durationDays === 1 ? 'dia' : 'dias'}
            </span>
          </div>

          {/* Proximity notice if upcoming */}
          {proximity && (
            <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{proximity}</span>
            </p>
          )}

          {/* Conflict warning */}
          {hasConflict && (
            <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Conflito: sobreposição de período com outro registro</span>
            </p>
          )}

          {/* Notes preview if present */}
          {vacation.notes && (
            <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2">
              <FileText className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              {vacation.notes}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(vacation)}
            title="Editar período"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Deseja excluir o período "${vacation.name}"?`)) {
                onDelete(vacation.id);
              }
            }}
            title="Excluir período"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

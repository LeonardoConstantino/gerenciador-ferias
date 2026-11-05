import React, { useState, useMemo } from 'react';
import { Vacation, VacationStatus } from '@/domain/types';
import { formatDateBR } from '@/utils/dateUtils';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
  X,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';

interface VacationCalendarProps {
  vacations: Vacation[];
  onSelectVacation: (vacation: Vacation) => void;
  onAddNewWithDate?: (selectedDate: Date) => void;
  onDelete?: (id: string) => void;
}

const STATUS_THEMES: Record<
  VacationStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  upcoming: {
    bg: 'bg-blue-600 dark:bg-blue-600',
    text: 'text-white',
    border: 'border-blue-700',
    label: 'Próximas',
  },
  ongoing: {
    bg: 'bg-emerald-600 dark:bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-700',
    label: 'Em andamento',
  },
  past: {
    bg: 'bg-slate-500 dark:bg-slate-600',
    text: 'text-white',
    border: 'border-slate-600',
    label: 'Concluídas',
  },
};

export const VacationCalendar: React.FC<VacationCalendarProps> = ({
  vacations,
  onSelectVacation,
  onAddNewWithDate,
  onDelete,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedVacation, setSelectedVacation] = useState<Vacation | null>(null);

  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Generate calendar days matrix
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const today = useMemo(() => new Date(), []);

  // Filter vacations that intersect with a given day
  const getVacationsForDay = (day: Date) => {
    const checkTime = startOfDay(day).getTime();
    return vacations.filter(v => {
      const vStart = startOfDay(new Date(v.startDate)).getTime();
      const vEnd = startOfDay(new Date(v.endDate)).getTime();
      return checkTime >= vStart && checkTime <= vEnd;
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Legend Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize min-w-40">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>

          <button
            type="button"
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Hoje
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Próximas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Em andamento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Concluídas</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {/* Week Day Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850 text-center py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const dayVacations = getVacationsForDay(day);

            return (
              <div
                key={idx}
                onClick={() => onAddNewWithDate?.(day)}
                className={`min-h-24 sm:min-h-28 p-1.5 flex flex-col justify-between group transition-colors cursor-pointer ${
                  !isCurrentMonth
                    ? 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-850/60'
                }`}
              >
                {/* Day Number and Quick Add affordance */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-mono tabular-nums ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-blue-600 text-white font-bold shadow-xs'
                        : isCurrentMonth
                        ? 'font-medium text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  <span className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-opacity p-0.5">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Day Vacation Badges */}
                <div className="space-y-1 flex-1 flex flex-col justify-start overflow-hidden">
                  {dayVacations.slice(0, 3).map(v => {
                    const theme = STATUS_THEMES[v.status];
                    const isStart = isSameDay(day, new Date(v.startDate));

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedVacation(v);
                        }}
                        className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium truncate transition-transform hover:scale-[1.02] shadow-xs ${theme.bg} ${theme.text}`}
                        title={`${v.name} (${formatDateBR(v.startDate)} – ${formatDateBR(v.endDate)})`}
                      >
                        {isStart && <span className="font-semibold mr-1">▶</span>}
                        {v.name}
                      </button>
                    );
                  })}

                  {dayVacations.length > 3 && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pl-1">
                      +{dayVacations.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Vacation Detail Popover/Modal */}
      {selectedVacation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs uppercase font-semibold text-blue-600 dark:text-blue-400 tracking-wider">
                  Detalhes do Período
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedVacation.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVacation(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Início:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                  {formatDateBR(selectedVacation.startDate)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Término:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                  {formatDateBR(selectedVacation.endDate)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Duração:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                  {selectedVacation.durationDays} dias
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Status atual:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {STATUS_THEMES[selectedVacation.status].label}
                </span>
              </div>

              {selectedVacation.notes && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Anotações:</span>
                  <p className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedVacation.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Excluir as férias "${selectedVacation.name}"?`)) {
                      onDelete(selectedVacation.id);
                      setSelectedVacation(null);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  Excluir
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedVacation(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const vac = selectedVacation;
                    setSelectedVacation(null);
                    onSelectVacation(vac);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { CalendarClock, Bell, BellRing } from 'lucide-react';
import { UpcomingAlert } from '@/domain/types';
import { formatDateBR } from '@/utils/dateUtils';

interface UpcomingBannerProps {
  alerts: UpcomingAlert[];
  permission: NotificationPermission;
  onRequestPermission: () => Promise<NotificationPermission>;
  onSelectVacation?: (vacationId: string) => void;
}

export const UpcomingBanner: React.FC<UpcomingBannerProps> = ({
  alerts,
  permission,
  onRequestPermission,
  onSelectVacation,
}) => {
  if (alerts.length === 0 && permission !== 'default') return null;

  return (
    <div className="space-y-3">
      {/* Browser Notification Prompt if permission is default */}
      {permission === 'default' && (
        <aside
          aria-label="Ativação de notificações no navegador"
          className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/20 text-sky-950 dark:text-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-sky-950 dark:text-sky-100">
                Ativar alertas de proximidade no navegador?
              </p>
              <p className="text-xs text-sky-800 dark:text-sky-300">
                Receba avisos automáticos em D-7, D-3 e D-1 antes do início das suas férias.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRequestPermission}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg transition-colors shrink-0 shadow-xs"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Permitir Notificações</span>
          </button>
        </aside>
      )}

      {/* Proximity alerts cards */}
      {alerts.length > 0 && (
        <section
          aria-label="Alertas de proximidade de férias"
          className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-amber-950 dark:text-amber-100">
                  Férias se aproximando!
                </h2>
                <span className="text-xs font-medium text-amber-800 dark:text-amber-300 tabular-nums">
                  {alerts.length} {alerts.length === 1 ? 'período próximo' : 'períodos próximos'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                Prepare-se e organize suas pendências antes de iniciar o descanso.
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {alerts.map(a => {
                  const isHigh = a.urgency === 'high';
                  const daysText =
                    a.daysUntilStart === 0
                      ? 'Começa hoje!'
                      : a.daysUntilStart === 1
                      ? 'Começa amanhã!'
                      : `Faltam ${a.daysUntilStart} dias`;

                  return (
                    <button
                      key={a.vacation.id}
                      type="button"
                      onClick={() => onSelectVacation?.(a.vacation.id)}
                      className={`text-left p-2.5 rounded-lg border transition-all ${
                        isHigh
                          ? 'bg-white dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/80 shadow-xs'
                          : 'bg-white/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 hover:bg-white dark:hover:bg-amber-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {a.vacation.name}
                        </span>
                        <span
                          className={`font-mono text-xs tabular-nums font-semibold shrink-0 ${
                            isHigh
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {daysText}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                        Início: {formatDateBR(a.vacation.startDate)} · {a.vacation.durationDays} dias
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

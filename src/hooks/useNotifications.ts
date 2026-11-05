import { useEffect, useState, useCallback, useMemo } from 'react';
import { useVacationStore } from '@/store/vacationStore';
import { calculateUpcomingAlerts } from '@/domain/rules/alertCalculator';
import { UpcomingAlert } from '@/domain/types';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const vacations = useVacationStore(s => s.vacations);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setIsSupported(false);
      setPermission('denied');
    }
  }, []);

  const alerts: UpcomingAlert[] = useMemo(() => {
    return calculateUpcomingAlerts(vacations, 7);
  }, [vacations]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'denied' as NotificationPermission;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (err) {
      console.warn('Notification permission request failed or was dismissed:', err);
      return 'denied' as NotificationPermission;
    }
  }, []);

  const notify = useCallback(
    (title: string, body: string) => {
      if (permission !== 'granted' || !('Notification' in window)) return;
      try {
        new Notification(title, {
          body,
          tag: title,
        });
      } catch (err) {
        console.warn('Could not dispatch browser notification:', err);
      }
    },
    [permission]
  );

  // Trigger notification on permission grant or vacations update
  useEffect(() => {
    if (permission !== 'granted') return;

    // Check once upon load or change
    alerts.forEach(a => {
      const label = a.daysUntilStart === 0 ? 'hoje' : `em ${a.daysUntilStart} dia(s)`;
      notify('🏖️ Férias se aproximando!', `"${a.vacation.name}" começa ${label}.`);
    });

    // Check periodically every 6 hours
    const interval = setInterval(() => {
      const currentAlerts = calculateUpcomingAlerts(vacations, 7);
      currentAlerts.forEach(a => {
        const label = a.daysUntilStart === 0 ? 'hoje' : `em ${a.daysUntilStart} dia(s)`;
        notify('🏖️ Férias se aproximando!', `"${a.vacation.name}" começa ${label}.`);
      });
    }, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [permission, alerts, notify, vacations]);

  return {
    permission,
    isSupported,
    requestPermission,
    alerts,
    notify,
  };
}

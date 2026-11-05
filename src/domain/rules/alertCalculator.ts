import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { Vacation, UpcomingAlert, ALERT_THRESHOLDS } from '../types';

export function calculateUpcomingAlerts(
  vacations: Vacation[],
  thresholdDays = 7,
  now = new Date()
): UpcomingAlert[] {
  const normalizedNow = startOfDay(now);

  return vacations
    .filter(v => v.status === 'upcoming')
    .map(v => ({
      vacation: v,
      daysUntilStart: differenceInCalendarDays(startOfDay(v.startDate), normalizedNow),
    }))
    .filter(a => a.daysUntilStart >= 0 && a.daysUntilStart <= thresholdDays)
    .sort((a, b) => a.daysUntilStart - b.daysUntilStart)
    .map(a => ({
      ...a,
      urgency:
        a.daysUntilStart <= ALERT_THRESHOLDS.high
          ? 'high'
          : a.daysUntilStart <= ALERT_THRESHOLDS.medium
          ? 'medium'
          : 'low',
    }));
}

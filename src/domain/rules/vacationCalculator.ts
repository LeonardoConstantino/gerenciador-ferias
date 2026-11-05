import { addDays, startOfDay } from 'date-fns';
import { Vacation, VacationInput, VacationStatus } from '../types';

export function calculateVacationFields(
  input: VacationInput,
  now = new Date()
): Pick<Vacation, 'endDate' | 'status'> {
  const endDate = addDays(input.startDate, input.durationDays);
  const status = deriveStatus(input.startDate, endDate, now);
  return { endDate, status };
}

export function deriveStatus(startDate: Date, endDate: Date, now: Date): VacationStatus {
  const normalizedNow = startOfDay(now);
  const normalizedStart = startOfDay(startDate);
  const normalizedEnd = startOfDay(endDate);

  if (normalizedNow >= normalizedEnd) return 'past';
  if (normalizedNow >= normalizedStart) return 'ongoing';
  return 'upcoming';
}

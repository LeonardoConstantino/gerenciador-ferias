import { format, parseISO, isValid, differenceInCalendarDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formats a date to standard Brazilian notation: 'dd/MM/yyyy'
 */
export function formatDateBR(date: Date | string | number): string {
  const d = new Date(date);
  if (!isValid(d)) return '-';
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Formats a date with full month: '20 de outubro de 2026'
 */
export function formatDateFullBR(date: Date | string | number): string {
  const d = new Date(date);
  if (!isValid(d)) return '-';
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Formats a date for HTML <input type="date"> (YYYY-MM-DD)
 * Uses local year, month, date to prevent timezone rollbacks
 */
export function toInputDateFormat(date: Date | string | number): string {
  const d = new Date(date);
  if (!isValid(d)) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD safely into a local midnight Date
 */
export function parseInputDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 0, 0, 0, 0);
  }
  return parseISO(dateStr);
}

/**
 * Returns a human-friendly countdown/status string
 */
export function getProximityLabel(targetDate: Date, now = new Date()): string {
  const diff = differenceInCalendarDays(startOfDay(targetDate), startOfDay(now));
  if (diff === 0) return 'Começa hoje!';
  if (diff === 1) return 'Começa amanhã!';
  if (diff > 1) return `Começa em ${diff} dias`;
  if (diff === -1) return 'Começou ontem';
  return `Iniciado há ${Math.abs(diff)} dias`;
}

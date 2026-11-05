import { useEffect, useCallback } from 'react';
import { addDays } from 'date-fns';
import { useVacationStore } from '@/store/vacationStore';
import { detectConflicts } from '@/domain/rules/conflictDetector';
import { VacationInput, ConflictResult, Vacation } from '@/domain/types';

export function useVacations() {
  const vacations = useVacationStore(s => s.vacations);
  const isLoading = useVacationStore(s => s.isLoading);
  const error = useVacationStore(s => s.error);
  const loadAll = useVacationStore(s => s.loadAll);
  const addVacation = useVacationStore(s => s.addVacation);
  const updateVacation = useVacationStore(s => s.updateVacation);
  const deleteVacation = useVacationStore(s => s.deleteVacation);
  const seedSampleData = useVacationStore(s => s.seedSampleData);
  const clearAll = useVacationStore(s => s.clearAll);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const checkConflict = useCallback(
    (input: VacationInput, excludeId?: string): ConflictResult => {
      const endDate = addDays(input.startDate, input.durationDays);
      return detectConflicts({ startDate: input.startDate, endDate }, vacations, excludeId);
    },
    [vacations]
  );

  const safeAdd = useCallback(
    async (
      input: VacationInput
    ): Promise<{ ok: true; vacation: Vacation } | { ok: false; conflict: ConflictResult }> => {
      const conflict = checkConflict(input);
      if (conflict.hasConflict) {
        return { ok: false, conflict };
      }
      const vacation = await addVacation(input);
      return { ok: true, vacation };
    },
    [checkConflict, addVacation]
  );

  const safeUpdate = useCallback(
    async (
      id: string,
      input: VacationInput
    ): Promise<{ ok: true } | { ok: false; conflict: ConflictResult }> => {
      const conflict = checkConflict(input, id);
      if (conflict.hasConflict) {
        return { ok: false, conflict };
      }
      await updateVacation(id, input);
      return { ok: true };
    },
    [checkConflict, updateVacation]
  );

  return {
    vacations,
    isLoading,
    error,
    loadAll,
    checkConflict,
    safeAdd,
    safeUpdate,
    deleteVacation,
    seedSampleData,
    clearAll,
  };
}

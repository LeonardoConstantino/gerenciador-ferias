import { useMemo } from 'react';
import { useVacationStore } from '@/store/vacationStore';
import { detectConflicts } from '@/domain/rules/conflictDetector';
import { Vacation, ConflictResult } from '@/domain/types';

export function useConflicts() {
  const vacations = useVacationStore(s => s.vacations);

  // Detect which existing vacations in the database currently have collisions with any other
  const conflictingVacationIds = useMemo(() => {
    const ids = new Set<string>();

    for (let i = 0; i < vacations.length; i++) {
      for (let j = i + 1; j < vacations.length; j++) {
        const v1 = vacations[i];
        const v2 = vacations[j];
        const v1Start = new Date(v1.startDate).getTime();
        const v1End = new Date(v1.endDate).getTime();
        const v2Start = new Date(v2.startDate).getTime();
        const v2End = new Date(v2.endDate).getTime();

        if (v1Start < v2End && v1End > v2Start) {
          ids.add(v1.id);
          ids.add(v2.id);
        }
      }
    }

    return ids;
  }, [vacations]);

  const checkCandidate = (
    candidate: Pick<Vacation, 'startDate' | 'endDate'>,
    excludeId?: string
  ): ConflictResult => {
    return detectConflicts(candidate, vacations, excludeId);
  };

  return {
    conflictingVacationIds,
    hasAnyExistingConflicts: conflictingVacationIds.size > 0,
    checkCandidate,
  };
}

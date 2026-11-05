import { Vacation, ConflictResult } from '../types';

export function detectConflicts(
  candidate: Pick<Vacation, 'startDate' | 'endDate'>,
  existing: Vacation[],
  excludeId?: string
): ConflictResult {
  const candStart = new Date(candidate.startDate).getTime();
  const candEnd = new Date(candidate.endDate).getTime();

  const conflicts = existing.filter(v => {
    if (excludeId && v.id === excludeId) return false;
    const vStart = new Date(v.startDate).getTime();
    const vEnd = new Date(v.endDate).getTime();
    return candStart < vEnd && candEnd > vStart;
  });

  return {
    hasConflict: conflicts.length > 0,
    conflictingWith: conflicts,
    message:
      conflicts.length > 0
        ? `Conflito com o período: ${conflicts.map(v => `"${v.name}"`).join(', ')}`
        : '',
  };
}

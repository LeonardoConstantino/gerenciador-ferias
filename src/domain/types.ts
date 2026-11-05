export type VacationStatus = 'upcoming' | 'ongoing' | 'past';

export interface Vacation {
  id: string;
  name: string;
  startDate: Date;
  durationDays: number;
  endDate: Date;
  status: VacationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VacationInput {
  name: string;
  startDate: Date;
  durationDays: number;
  notes?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingWith: Vacation[];
  message: string;
}

export interface UpcomingAlert {
  vacation: Vacation;
  daysUntilStart: number;
  urgency: 'low' | 'medium' | 'high';
}

export const ALERT_THRESHOLDS = {
  high: 3,
  medium: 7,
} as const;

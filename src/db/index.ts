import Dexie, { type Table } from 'dexie';
import { Vacation } from '@/domain/types';

export class VacationDatabase extends Dexie {
  vacations!: Table<Vacation, string>;

  constructor() {
    super('VacationManagerDB');
    this.version(1).stores({
      vacations: 'id, startDate, endDate, status',
    });

    this.vacations.hook('reading', (obj: Vacation) => ({
      ...obj,
      startDate: new Date(obj.startDate),
      endDate: new Date(obj.endDate),
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
    }));
  }
}

export const db = new VacationDatabase();

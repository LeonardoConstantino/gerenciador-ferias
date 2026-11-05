import { db } from './index';
import { Vacation } from '@/domain/types';

export const vacationRepository = {
  getAll: async (): Promise<Vacation[]> => {
    const list = await db.vacations.toArray();
    return list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  },

  getById: (id: string): Promise<Vacation | undefined> => {
    return db.vacations.get(id);
  },

  add: (vacation: Vacation): Promise<string> => {
    return db.vacations.add(vacation);
  },

  update: (id: string, changes: Partial<Vacation>): Promise<number> => {
    return db.vacations.update(id, { ...changes, updatedAt: new Date() });
  },

  delete: (id: string): Promise<void> => {
    return db.vacations.delete(id);
  },

  getOverlapping: async (startDate: Date, endDate: Date): Promise<Vacation[]> => {
    const list = await db.vacations.toArray();
    const start = startDate.getTime();
    const end = endDate.getTime();
    return list.filter(v => {
      const vStart = new Date(v.startDate).getTime();
      const vEnd = new Date(v.endDate).getTime();
      return start < vEnd && end > vStart;
    });
  },

  clearAll: (): Promise<void> => {
    return db.vacations.clear();
  },

  bulkAdd: (vacations: Vacation[]): Promise<string> => {
    return db.vacations.bulkAdd(vacations);
  },
};

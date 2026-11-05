import { create } from 'zustand';
import { Vacation, VacationInput } from '@/domain/types';
import { vacationRepository } from '@/db/vacationRepository';
import { calculateVacationFields, deriveStatus } from '@/domain/rules/vacationCalculator';
import { addDays, subDays } from 'date-fns';

interface VacationState {
  vacations: Vacation[];
  isLoading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  addVacation: (input: VacationInput) => Promise<Vacation>;
  updateVacation: (id: string, input: VacationInput) => Promise<void>;
  deleteVacation: (id: string) => Promise<void>;
  seedSampleData: () => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useVacationStore = create<VacationState>((set, get) => ({
  vacations: [],
  isLoading: false,
  error: null,

  loadAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const stored = await vacationRepository.getAll();
      const now = new Date();

      // Recalculate status dynamically to guarantee domain consistency with current date
      const updated = stored.map(v => {
        const freshStatus = deriveStatus(new Date(v.startDate), new Date(v.endDate), now);
        if (freshStatus !== v.status) {
          vacationRepository.update(v.id, { status: freshStatus }).catch(() => {});
          return { ...v, status: freshStatus };
        }
        return v;
      });

      set({ vacations: updated, isLoading: false });
    } catch (err) {
      console.error('Error loading vacations:', err);
      set({ error: 'Erro ao carregar dados do banco local.', isLoading: false });
    }
  },

  addVacation: async (input: VacationInput) => {
    const derived = calculateVacationFields(input);
    const vacation: Vacation = {
      id: crypto.randomUUID ? crypto.randomUUID() : `vac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: input.name.trim(),
      startDate: input.startDate,
      durationDays: input.durationDays,
      notes: input.notes?.trim() || undefined,
      ...derived,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await vacationRepository.add(vacation);
    const nextList = [...get().vacations, vacation].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    set({ vacations: nextList });
    return vacation;
  },

  updateVacation: async (id: string, input: VacationInput) => {
    const derived = calculateVacationFields(input);
    const changes: Partial<Vacation> = {
      name: input.name.trim(),
      startDate: input.startDate,
      durationDays: input.durationDays,
      notes: input.notes?.trim() || undefined,
      ...derived,
      updatedAt: new Date(),
    };

    await vacationRepository.update(id, changes);
    const nextList = get().vacations.map(v => (v.id === id ? ({ ...v, ...changes } as Vacation) : v));
    nextList.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    set({ vacations: nextList });
  },

  deleteVacation: async (id: string) => {
    await vacationRepository.delete(id);
    set(s => ({ vacations: s.vacations.filter(v => v.id !== id) }));
  },

  clearAll: async () => {
    await vacationRepository.clearAll();
    set({ vacations: [] });
  },

  seedSampleData: async () => {
    const today = new Date();
    // Curated realistic vacation schedule:
    // 1. Ongoing or starting very soon
    // 2. Proximity alert in 5 days (medium alert)
    // 3. High proximity alert in 2 days
    // 4. Future summer trip
    // 5. Past retreat
    const samples: VacationInput[] = [
      {
        name: 'Feriado Prolongado na Serra',
        startDate: addDays(today, 2),
        durationDays: 4,
        notes: 'Chalé reservado, trilhas e descanso.',
      },
      {
        name: 'Recesso de Verão no Litoral',
        startDate: addDays(today, 18),
        durationDays: 10,
        notes: 'Praia com a família, aluguel de casa pé na areia.',
      },
      {
        name: 'Viagem Cultural a Buenos Aires',
        startDate: addDays(today, 45),
        durationDays: 7,
        notes: 'Passagens compradas, roteiro de gastronomia e shows de tango.',
      },
      {
        name: 'Descanso de Inverno',
        startDate: subDays(today, 30),
        durationDays: 8,
        notes: 'Férias anteriores concluídas.',
      },
    ];

    await vacationRepository.clearAll();

    const created: Vacation[] = samples.map((input, idx) => {
      const derived = calculateVacationFields(input, today);
      return {
        id: `sample_${idx + 1}_${Date.now()}`,
        name: input.name,
        startDate: input.startDate,
        durationDays: input.durationDays,
        notes: input.notes,
        ...derived,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    for (const item of created) {
      await vacationRepository.add(item);
    }

    created.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    set({ vacations: created });
  },
}));

export const selectUpcoming = (s: VacationState) => s.vacations.filter(v => v.status === 'upcoming');
export const selectOngoing = (s: VacationState) => s.vacations.filter(v => v.status === 'ongoing');
export const selectPast = (s: VacationState) => s.vacations.filter(v => v.status === 'past');

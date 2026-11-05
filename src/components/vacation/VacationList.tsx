import React, { useState, useMemo } from 'react';
import { Vacation, VacationStatus } from '@/domain/types';
import { VacationCard } from './VacationCard';
import { Search, Plus, CalendarX, Sparkles, Filter } from 'lucide-react';

interface VacationListProps {
  vacations: Vacation[];
  conflictingIds: Set<string>;
  onAddNew: () => void;
  onEdit: (vacation: Vacation) => void;
  onDelete: (id: string) => void;
  onSeedSamples: () => void;
}

export const VacationList: React.FC<VacationListProps> = ({
  vacations,
  conflictingIds,
  onAddNew,
  onEdit,
  onDelete,
  onSeedSamples,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | VacationStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Counts by status
  const counts = useMemo(() => {
    return {
      all: vacations.length,
      upcoming: vacations.filter(v => v.status === 'upcoming').length,
      ongoing: vacations.filter(v => v.status === 'ongoing').length,
      past: vacations.filter(v => v.status === 'past').length,
    };
  }, [vacations]);

  // Filtered vacations
  const filtered = useMemo(() => {
    return vacations.filter(v => {
      const matchesTab = activeTab === 'all' || v.status === activeTab;
      const matchesSearch =
        searchTerm.trim() === '' ||
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.notes && v.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [vacations, activeTab, searchTerm]);

  return (
    <section className="space-y-4">
      {/* Controls: Search and Filter segmented bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Todas <span className="tabular-nums font-mono text-slate-400">({counts.all})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Próximas{' '}
            <span className="tabular-nums font-mono text-slate-400">({counts.upcoming})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ongoing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'ongoing'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Em andamento{' '}
            <span className="tabular-nums font-mono text-slate-400">({counts.ongoing})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'past'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Concluídas <span className="tabular-nums font-mono text-slate-400">({counts.past})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por destino ou anotação..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Vacation Cards Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(vacation => (
            <VacationCard
              key={vacation.id}
              vacation={vacation}
              hasConflict={conflictingIds.has(vacation.id)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : vacations.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <CalendarX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Nenhuma férias cadastrada ainda
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Organize seus períodos de descanso, acompanhe contagens regressivas e previna
            sobreposição de datas.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Minhas Primeiras Férias</span>
            </button>
            <button
              type="button"
              onClick={onSeedSamples}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Carregar Dados de Exemplo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <Filter className="w-5 h-5 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Nenhum período encontrado para este filtro
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Tente remover a busca ou selecionar outra aba de status.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchTerm('');
            }}
            className="mt-3 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </section>
  );
};

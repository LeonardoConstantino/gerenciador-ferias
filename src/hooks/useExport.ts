import Papa from 'papaparse';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useVacationStore } from '@/store/vacationStore';

export function useExport() {
  const vacations = useVacationStore(s => s.vacations);

  const exportCSV = () => {
    if (vacations.length === 0) {
      return { success: false, reason: 'empty' as const };
    }

    const rows = vacations.map(v => ({
      Nome: v.name,
      'Data Inicial': format(new Date(v.startDate), 'dd/MM/yyyy', { locale: ptBR }),
      'Data Final': format(new Date(v.endDate), 'dd/MM/yyyy', { locale: ptBR }),
      Dias: v.durationDays,
      Status:
        v.status === 'upcoming'
          ? 'Próximas'
          : v.status === 'ongoing'
          ? 'Em andamento'
          : 'Concluídas',
      Observações: v.notes || '',
    }));

    const csv = Papa.unparse(rows, { delimiter: ';' });
    // \uFEFF UTF-8 BOM prefix ensures accent marks open cleanly in MS Excel
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ferias_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, count: vacations.length };
  };

  return { exportCSV, totalItems: vacations.length };
}

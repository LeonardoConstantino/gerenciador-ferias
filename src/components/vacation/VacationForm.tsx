import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDays } from 'date-fns';
import { Vacation, VacationInput } from '@/domain/types';
import { detectConflicts } from '@/domain/rules/conflictDetector';
import { formatDateBR, parseInputDate, toInputDateFormat } from '@/utils/dateUtils';
import { AlertCircle, Calendar, Check, Clock, X } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter ao menos 2 caracteres'),
  startDateStr: z.string().min(1, 'Data inicial é obrigatória'),
  durationDays: z
    .number()
    .int('Duração deve ser um número inteiro')
    .min(1, 'Mínimo de 1 dia de férias')
    .max(120, 'Máximo de 120 dias por período'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface VacationFormProps {
  vacationToEdit?: Vacation | null;
  existingVacations: Vacation[];
  onSubmit: (input: VacationInput) => Promise<{ ok: boolean; message?: string }>;
  onCancel: () => void;
}

export const VacationForm: React.FC<VacationFormProps> = ({
  vacationToEdit,
  existingVacations,
  onSubmit,
  onCancel,
}) => {
  const isEditing = Boolean(vacationToEdit);

  const defaultValues: FormValues = useMemo(() => {
    if (vacationToEdit) {
      return {
        name: vacationToEdit.name,
        startDateStr: toInputDateFormat(vacationToEdit.startDate),
        durationDays: vacationToEdit.durationDays,
        notes: vacationToEdit.notes || '',
      };
    }
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      name: '',
      startDateStr: toInputDateFormat(tomorrow),
      durationDays: 10,
      notes: '',
    };
  }, [vacationToEdit]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const currentStartDateStr = watch('startDateStr');
  const currentDurationDays = watch('durationDays');

  // Compute live preview of dates and conflicts
  const livePreview = useMemo(() => {
    if (!currentStartDateStr || !currentDurationDays || currentDurationDays < 1) {
      return null;
    }
    const startDate = parseInputDate(currentStartDateStr);
    const endDate = addDays(startDate, Number(currentDurationDays));

    const conflict = detectConflicts(
      { startDate, endDate },
      existingVacations,
      vacationToEdit?.id
    );

    return {
      startDate,
      endDate,
      conflict,
    };
  }, [currentStartDateStr, currentDurationDays, existingVacations, vacationToEdit]);

  const handleFormSubmit = async (data: FormValues) => {
    const startDate = parseInputDate(data.startDateStr);
    const input: VacationInput = {
      name: data.name,
      startDate,
      durationDays: data.durationDays,
      notes: data.notes,
    };

    const res = await onSubmit(input);
    if (res.ok) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {isEditing ? 'Editar Período de Férias' : 'Agendar Novas Férias'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Preencha a data inicial e os dias desejados. As datas de término e status são calculados
            automaticamente.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Fechar formulário"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Vacation Title */}
      <div>
        <label
          htmlFor="vacation-name"
          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Título / Destino das Férias
        </label>
        <input
          id="vacation-name"
          type="text"
          placeholder="Ex: Viagem de Verão no Nordeste"
          {...register('name')}
          className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.name
              ? 'border-rose-400 dark:border-rose-700 focus:ring-rose-500'
              : 'border-slate-300 dark:border-slate-700'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.name.message}</span>
          </p>
        )}
      </div>

      {/* Date & Duration grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="vacation-start"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Data de Início
          </label>
          <div className="relative">
            <input
              id="vacation-start"
              type="date"
              {...register('startDateStr')}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.startDateStr
                  ? 'border-rose-400 dark:border-rose-700 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.startDateStr && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {errors.startDateStr.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vacation-duration"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Duração (Dias)
          </label>
          <input
            id="vacation-duration"
            type="number"
            min={1}
            max={120}
            {...register('durationDays', { valueAsNumber: true })}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.durationDays
                ? 'border-rose-400 dark:border-rose-700 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.durationDays && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {errors.durationDays.message}
            </p>
          )}
        </div>
      </div>

      {/* Calculated range preview */}
      {livePreview && (
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Período resultante:{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                {formatDateBR(livePreview.startDate)} até {formatDateBR(livePreview.endDate)}
              </strong>
            </span>
          </div>
          <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
            {currentDurationDays} {currentDurationDays === 1 ? 'dia' : 'dias'}
          </span>
        </div>
      )}

      {/* Real-time Conflict Alert */}
      {livePreview?.conflict?.hasConflict && (
        <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-rose-900 dark:text-rose-200">
                Sobreposição de datas detectada:
              </p>
              <p className="mt-0.5 text-rose-700 dark:text-rose-300">
                {livePreview.conflict.message}
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Altere a data de início ou a duração para evitar conflitos de período.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes / Observações */}
      <div>
        <label
          htmlFor="vacation-notes"
          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Observações / Planejamento (Opcional)
        </label>
        <textarea
          id="vacation-notes"
          rows={2}
          placeholder="Ex: Reserva de hotel confirmada, passagens aéreas e seguro viagem emitidos."
          {...register('notes')}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || Boolean(livePreview?.conflict?.hasConflict)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors ${
            livePreview?.conflict?.hasConflict
              ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-75'
              : 'bg-blue-600 hover:bg-blue-700 shadow-xs'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Salvar Alterações' : 'Confirmar Agendamento'}</span>
        </button>
      </div>
    </form>
  );
};

import { useApiClient } from '~/shared/api/client'
import type { ApplyInput, ApplyResult, RecommendInput, RecommendationResult } from './types'

export function useAiApi() {
  const api = useApiClient()
  const { locale } = useI18n()

  return {
    recommend(input: RecommendInput) {
      return api.post<{ data: RecommendationResult }>('/api/ai/recommendations', {
        ...input,
        locale: locale.value,
      })
    },

    apply(input: ApplyInput) {
      return api.post<{ data: ApplyResult }>(
        `/api/ai/recommendations/${input.recommendation_id}/apply`,
        {
          employee_id: input.employee_id,
          allocation_date: input.allocation_date,
          hours: input.hours,
          notes: input.notes,
        },
      )
    },
  }
}

export type BenchSkill = {
  id: number
  name: string
  proficiency_level?: string
}

export type BenchEmployee = {
  employee_id: number
  document_id: string
  full_name: string
  team_id?: number | null
  team_name?: string | null
  available_hours: number
  allocated_hours: number
  remaining_hours: number
  utilization_pct: number
  bench_pct: number
  skills: BenchSkill[]
}

export type BenchResult = {
  from: string
  to: string
  skill_ids: number[]
  team_id?: number | null
  totals: {
    employees: number
    available_hours: number
    allocated_hours: number
    remaining_hours: number
    utilization_pct: number
    bench_pct: number
  }
  employees: BenchEmployee[]
}

export type ForecastStub = {
  status: 'stub'
  milestone: number
  message: string
  scope: string
  from: string
  to: string
  baseline: {
    remaining_hours: number
    utilization_pct: number
    bench_pct: number
    employees: number
  }
  series: { date: string; remaining_hours: number; utilization_pct: number }[]
}

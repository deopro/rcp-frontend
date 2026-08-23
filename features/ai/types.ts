export type SkillMatchDetail = {
  skill_id: number
  skill_name: string
  required: boolean
  has_skill: boolean
  proficiency_level?: string | null
}

export type RecommendationMatch = {
  employee_id: number
  document_id: string
  full_name: string
  team_name?: string | null
  score: number
  skill_score: number
  availability_score: number
  remaining_hours: number
  bench_pct: number
  matched_skills: SkillMatchDetail[]
  missing_skills: { skill_id: number; skill_name: string }[]
  reasons: string[]
  explanation?: string
}

export type RecommendationResult = {
  recommendation_id: string
  project_id: number
  project_document_id: string
  project_name: string
  from: string
  to: string
  provider: string
  matches: RecommendationMatch[]
  availability_summary: {
    candidates: number
    avg_utilization_pct: number
    total_remaining_hours: number
  }
}

export type ApplyResult = {
  allocation_id: number
  document_id: string
  employee_id: number
  project_id: number
  allocation_date: string
  hours: number
  status: string
}

export type RecommendInput = {
  project_id: number
  from: string
  to: string
  team_id?: number
  limit?: number
}

export type ApplyInput = {
  recommendation_id: string
  employee_id: number
  allocation_date: string
  hours: number
  notes?: string
}

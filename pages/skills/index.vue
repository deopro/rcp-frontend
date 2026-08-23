<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/auth'
import { useOrganizationStore } from '~/features/organization/stores/organization'
import EmployeeSkillForm from '~/features/skills/components/EmployeeSkillForm.vue'
import ProficiencyBadge from '~/features/skills/components/ProficiencyBadge.vue'
import SkillCatalogForm from '~/features/skills/components/SkillCatalogForm.vue'
import SkillCategoryForm from '~/features/skills/components/SkillCategoryForm.vue'
import { useSkillsStore } from '~/features/skills/stores/skills'
import type {
  EmployeeSkill,
  EmployeeSkillInput,
  Skill,
  SkillCategory,
  SkillCategoryInput,
  SkillInput,
} from '~/features/skills/types'

definePageMeta({})

const { t } = useI18n()
const auth = useAuthStore()
const org = useOrganizationStore()
const store = useSkillsStore()
const toast = useToast()
const { showApiError } = useApiErrorToast()

type Panel = 'matrix' | 'category' | 'skill' | null

const panel = ref<Panel>(null)
const selectedCategory = ref<SkillCategory | null>(null)
const selectedSkill = ref<Skill | null>(null)
const selectedRecord = ref<EmployeeSkill | null>(null)

const canWriteMatrix = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader', 'employee'),
)
const canWriteCatalog = computed(() => auth.hasRole('administrator'))
const canDelete = computed(() => auth.hasRole('administrator'))
const canDeleteMatrix = computed(() =>
  auth.hasRole('administrator', 'department_manager', 'team_leader', 'employee'),
)

const lockedEmployeeId = computed(() => {
  if (!auth.hasRole('employee')) return undefined
  return org.employees[0]?.id
})

const {
  page: matrixPage,
  pageSize: matrixPageSize,
  pageCount: matrixPageCount,
  total: matrixTotal,
  pageItems: matrixPageItems,
  from: matrixFrom,
  to: matrixTo,
} = useClientPagination(() => store.filteredMatrix)

const {
  page: categoryPage,
  pageSize: categoryPageSize,
  pageCount: categoryPageCount,
  total: categoryTotal,
  pageItems: categoryPageItems,
  from: categoryFrom,
  to: categoryTo,
} = useClientPagination(() => store.categories)

const {
  page: skillPage,
  pageSize: skillPageSize,
  pageCount: skillPageCount,
  total: skillTotal,
  pageItems: skillPageItems,
  from: skillFrom,
  to: skillTo,
} = useClientPagination(() => store.skills)

onMounted(async () => {
  try {
    await Promise.all([store.loadAll(), org.loadEmployees()])
  } catch (e) {
    showApiError(e)
  }
})

function openMatrixCreate() {
  selectedRecord.value = null
  panel.value = 'matrix'
}

function openMatrixEdit(row: EmployeeSkill) {
  selectedRecord.value = row
  panel.value = 'matrix'
}

function openCategoryCreate() {
  selectedCategory.value = null
  panel.value = 'category'
}

function openCategoryEdit(row: SkillCategory) {
  selectedCategory.value = row
  panel.value = 'category'
}

function openSkillCreate() {
  selectedSkill.value = null
  panel.value = 'skill'
}

function openSkillEdit(row: Skill) {
  selectedSkill.value = row
  panel.value = 'skill'
}

function closePanel() {
  panel.value = null
  selectedCategory.value = null
  selectedSkill.value = null
  selectedRecord.value = null
}

async function onSaveCategory(input: SkillCategoryInput, documentId?: string) {
  try {
    await store.saveCategory(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onRemoveCategory(documentId: string) {
  try {
    await store.removeCategory(documentId)
    toast.success({ title: t('forms.deleted') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onSaveSkill(input: SkillInput, documentId?: string) {
  try {
    await store.saveSkill(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onRemoveSkill(documentId: string) {
  try {
    await store.removeSkill(documentId)
    toast.success({ title: t('forms.deleted') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onSaveMatrix(input: EmployeeSkillInput, documentId?: string) {
  try {
    await store.saveEmployeeSkill(input, documentId)
    toast.success({ title: documentId ? t('forms.updated') : t('forms.created') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

async function onRemoveMatrix(documentId: string) {
  try {
    await store.removeEmployeeSkill(documentId)
    toast.success({ title: t('forms.deleted') })
    closePanel()
  } catch (e) {
    showApiError(e)
  }
}

const panelTitle = computed(() => {
  if (panel.value === 'matrix') {
    return selectedRecord.value ? t('skills.matrix.edit') : t('skills.matrix.add')
  }
  if (panel.value === 'category') {
    return selectedCategory.value ? t('skills.categories.edit') : t('skills.categories.add')
  }
  if (panel.value === 'skill') {
    return selectedSkill.value ? t('skills.catalog.edit') : t('skills.catalog.add')
  }
  return ''
})
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">{{ t('skills.title') }}</h2>
        <p class="text-sm text-muted">{{ t('skills.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UiButton v-if="canWriteCatalog" variant="outline" @click="openCategoryCreate">
          {{ t('skills.categories.add') }}
        </UiButton>
        <UiButton v-if="canWriteCatalog" variant="outline" @click="openSkillCreate">
          {{ t('skills.catalog.add') }}
        </UiButton>
        <UiButton v-if="canWriteMatrix" @click="openMatrixCreate">
          {{ t('skills.matrix.add') }}
        </UiButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div class="space-y-1.5 lg:col-span-2">
        <UiFormLabel for="filter-search">{{ t('nav.search') }}</UiFormLabel>
        <UiInput
          id="filter-search"
          v-model="store.filters.search"
          :placeholder="t('skills.filters.searchPlaceholder')"
        />
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="filter-category">{{ t('skills.fields.category') }}</UiFormLabel>
        <UiSelect id="filter-category" v-model="store.filters.categoryId">
          <option value="">{{ t('skills.filters.all') }}</option>
          <option v-for="c in store.categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="filter-team">{{ t('org.fields.team') }}</UiFormLabel>
        <UiSelect id="filter-team" v-model="store.filters.teamId">
          <option value="">{{ t('skills.filters.all') }}</option>
          <option v-for="team in store.teamOptions" :key="team.id" :value="String(team.id)">
            {{ team.name }}
          </option>
        </UiSelect>
      </div>
      <div class="space-y-1.5">
        <UiFormLabel for="filter-level">{{ t('skills.fields.proficiency') }}</UiFormLabel>
        <UiSelect id="filter-proficiency" v-model="store.filters.proficiency">
          <option value="">{{ t('skills.filters.all') }}</option>
          <option value="basic">{{ t('skills.proficiency.basic') }}</option>
          <option value="intermediate">{{ t('skills.proficiency.intermediate') }}</option>
          <option value="advanced">{{ t('skills.proficiency.advanced') }}</option>
          <option value="expert">{{ t('skills.proficiency.expert') }}</option>
        </UiSelect>
      </div>
    </div>

    <div class="flex justify-end">
      <UiButton variant="ghost" size="sm" @click="store.resetFilters()">
        {{ t('skills.filters.reset') }}
      </UiButton>
    </div>

    <div v-if="store.loading && !store.employeeSkills.length" class="text-sm text-muted">
      {{ t('skills.loading') }}
    </div>

    <div
      v-else-if="!store.filteredMatrix.length"
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted"
    >
      {{ t('skills.matrix.empty') }}
    </div>

    <!-- Desktop matrix -->
    <div v-else class="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border bg-subtle text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">{{ t('skills.fields.employee') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('skills.fields.skill') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('skills.fields.category') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('skills.fields.proficiency') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('skills.fields.yearsExperience') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('skills.fields.certification') }}</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="row in matrixPageItems"
            :key="row.documentId"
            class="hover:bg-hover"
          >
            <td class="px-4 py-3">
              <p class="font-medium">{{ row.employee?.full_name }}</p>
              <p class="text-xs text-muted">{{ row.employee?.team?.name || t('org.none') }}</p>
            </td>
            <td class="px-4 py-3">{{ row.skill?.name }}</td>
            <td class="px-4 py-3 text-muted">
              {{ row.skill?.skill_category?.name || t('org.none') }}
            </td>
            <td class="px-4 py-3"><ProficiencyBadge :level="row.proficiency_level" /></td>
            <td class="px-4 py-3">{{ row.years_experience }}</td>
            <td class="px-4 py-3 text-muted">{{ row.certification || t('org.none') }}</td>
            <td class="px-4 py-3 text-right">
              <UiButton size="sm" variant="ghost" @click="openMatrixEdit(row)">
                {{ canWriteMatrix ? t('actions.edit') : t('org.view') }}
              </UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <ul v-if="store.filteredMatrix.length" class="space-y-3 md:hidden">
      <li
        v-for="row in matrixPageItems"
        :key="row.documentId"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-medium">{{ row.employee?.full_name }}</p>
            <p class="mt-0.5 text-sm">{{ row.skill?.name }}</p>
            <p class="mt-1 text-xs text-muted">
              {{ row.skill?.skill_category?.name || t('org.none') }}
              · {{ row.years_experience }}y
            </p>
          </div>
          <ProficiencyBadge :level="row.proficiency_level" />
        </div>
        <p v-if="row.certification" class="mt-2 text-xs text-muted">
          {{ t('skills.fields.certification') }}: {{ row.certification }}
        </p>
        <UiButton class="mt-3 w-full" size="sm" variant="outline" @click="openMatrixEdit(row)">
          {{ canWriteMatrix ? t('actions.edit') : t('org.view') }}
        </UiButton>
      </li>
    </ul>

    <UiPagination
      v-model:page="matrixPage"
      v-model:page-size="matrixPageSize"
      :page-count="matrixPageCount"
      :total="matrixTotal"
      :from="matrixFrom"
      :to="matrixTo"
    />

    <!-- Catalog quick lists (admin) -->
    <section v-if="canWriteCatalog" class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-lg border border-border bg-surface p-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">{{ t('skills.categories.title') }}</h3>
          <UiButton size="sm" variant="ghost" @click="openCategoryCreate">{{ t('actions.add') }}</UiButton>
        </div>
        <ul class="divide-y divide-border text-sm">
          <li
            v-for="cat in categoryPageItems"
            :key="cat.documentId"
            class="flex items-center justify-between py-2"
          >
            <span>{{ cat.name }}</span>
            <UiButton size="sm" variant="ghost" @click="openCategoryEdit(cat)">
              {{ t('actions.edit') }}
            </UiButton>
          </li>
        </ul>
        <UiPagination
          class="mt-3"
          v-model:page="categoryPage"
          v-model:page-size="categoryPageSize"
          :page-count="categoryPageCount"
          :total="categoryTotal"
          :from="categoryFrom"
          :to="categoryTo"
        />
      </div>
      <div class="rounded-lg border border-border bg-surface p-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">{{ t('skills.catalog.title') }}</h3>
          <UiButton size="sm" variant="ghost" @click="openSkillCreate">{{ t('actions.add') }}</UiButton>
        </div>
        <ul class="divide-y divide-border text-sm">
          <li
            v-for="skill in skillPageItems"
            :key="skill.documentId"
            class="flex items-center justify-between py-2"
          >
            <span>
              {{ skill.name }}
              <span class="text-muted">· {{ skill.skill_category?.name || t('org.none') }}</span>
            </span>
            <UiButton size="sm" variant="ghost" @click="openSkillEdit(skill)">
              {{ t('actions.edit') }}
            </UiButton>
          </li>
        </ul>
        <UiPagination
          class="mt-3"
          v-model:page="skillPage"
          v-model:page-size="skillPageSize"
          :page-count="skillPageCount"
          :total="skillTotal"
          :from="skillFrom"
          :to="skillTo"
        />
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="panel"
        class="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 md:items-center"
        @click.self="closePanel"
      >
        <div class="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-soft">
          <h3 class="mb-4 text-lg font-semibold">{{ panelTitle }}</h3>
          <EmployeeSkillForm
            v-if="panel === 'matrix'"
            :record="selectedRecord"
            :employees="org.employees"
            :skills="store.skills"
            :can-edit="canWriteMatrix"
            :can-delete="canDeleteMatrix"
            :locked-employee-id="lockedEmployeeId"
            @save="onSaveMatrix"
            @remove="onRemoveMatrix"
            @cancel="closePanel"
          />
          <SkillCategoryForm
            v-else-if="panel === 'category'"
            :category="selectedCategory"
            :can-edit="canWriteCatalog"
            :can-delete="canDelete"
            @save="onSaveCategory"
            @remove="onRemoveCategory"
            @cancel="closePanel"
          />
          <SkillCatalogForm
            v-else-if="panel === 'skill'"
            :skill="selectedSkill"
            :categories="store.categories"
            :can-edit="canWriteCatalog"
            :can-delete="canDelete"
            @save="onSaveSkill"
            @remove="onRemoveSkill"
            @cancel="closePanel"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

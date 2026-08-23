<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <section class="rounded-lg border border-border bg-surface p-6 shadow-soft md:p-8">
      <p class="text-sm font-medium text-accent">{{ t('home.foundationReady') }}</p>
      <h2 class="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
        {{ t('home.welcome') }}
      </h2>
      <p class="mt-3 max-w-2xl text-muted">
        {{ t('home.subtitle') }}
      </p>
      <p class="mt-6 text-sm text-muted">
        {{ t('home.nextMilestone') }}
      </p>
    </section>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink
        to="/leave"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
      >
        <h3 class="text-sm font-semibold">{{ t('leave.title') }}</h3>
        <p class="mt-1 text-sm text-muted">{{ t('leave.subtitle') }}</p>
      </NuxtLink>
      <NuxtLink
        to="/allocations"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
      >
        <h3 class="text-sm font-semibold">{{ t('nav.allocations') }}</h3>
        <p class="mt-1 text-sm text-muted">{{ t('allocations.subtitle') }}</p>
      </NuxtLink>
      <NuxtLink
        to="/projects"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
      >
        <h3 class="text-sm font-semibold">{{ t('nav.projects') }}</h3>
        <p class="mt-1 text-sm text-muted">{{ t('projects.subtitle') }}</p>
      </NuxtLink>
      <NuxtLink
        to="/clients"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
      >
        <h3 class="text-sm font-semibold">{{ t('nav.clients') }}</h3>
        <p class="mt-1 text-sm text-muted">{{ t('projects.clients.subtitle') }}</p>
      </NuxtLink>
      <NuxtLink
        to="/skills"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
      >
        <h3 class="text-sm font-semibold">{{ t('nav.skills') }}</h3>
        <p class="mt-1 text-sm text-muted">{{ t('skills.subtitle') }}</p>
      </NuxtLink>
      <NuxtLink
        to="/departments"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
      >
        <h3 class="text-sm font-semibold">{{ t('nav.departments') }}</h3>
        <p class="mt-1 text-sm text-muted">{{ t('org.departments.subtitle') }}</p>
      </NuxtLink>
      <NuxtLink
        to="/teams"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
      >
        <h3 class="text-sm font-semibold">{{ t('org.teams.title') }}</h3>
        <p class="mt-1 text-sm text-muted">{{ t('org.teams.subtitle') }}</p>
      </NuxtLink>
      <NuxtLink
        to="/employees"
        class="rounded-lg border border-border bg-surface p-4 shadow-soft transition-colors hover:border-accent"
      >
        <h3 class="text-sm font-semibold">{{ t('nav.employees') }}</h3>
        <p class="mt-1 text-sm text-muted">{{ t('org.employees.subtitle') }}</p>
      </NuxtLink>
    </section>
  </div>
</template>

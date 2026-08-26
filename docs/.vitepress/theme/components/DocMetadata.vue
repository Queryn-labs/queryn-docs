<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

type Authority = "normative" | "informational";
type Lifecycle = "active" | "archived";
type AdrStatus = "accepted" | "superseded" | "rejected";

interface DocumentFrontmatter {
  authority?: Authority;
  lifecycle?: Lifecycle;
  adrStatus?: AdrStatus;
  supersededBy?: number;
}

const { page } = useData();
const metadata = computed(() => page.value.frontmatter as DocumentFrontmatter);
const isAdr = computed(() => Boolean(metadata.value.adrStatus));
const isArchived = computed(() => metadata.value.lifecycle === "archived");

const badgeLabel = computed(() => {
  const authorityLabel = metadata.value.authority === "normative" ? "Нормативный" : "Информационный";
  if (metadata.value.adrStatus === "superseded") {
    const target = formatAdrNumber(metadata.value.supersededBy);
    return target ? `${authorityLabel} · Заменён → ADR-${target}` : `${authorityLabel} · Заменён`;
  }
  if (metadata.value.adrStatus === "rejected") return `${authorityLabel} · Отклонён`;
  if (metadata.value.adrStatus === "accepted") return `${authorityLabel} · Действует`;
  if (isArchived.value) return `${authorityLabel} · Архив`;
  return `${authorityLabel} · Действует`;
});

function formatAdrNumber(value: number | undefined): string | undefined {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? String(value).padStart(4, "0") : undefined;
}
</script>

<template>
  <div class="doc-metadata" aria-label="Состояние документа">
    <span class="doc-metadata__badge" :data-adr-status="metadata.adrStatus || undefined">
      {{ badgeLabel }}
    </span>
    <aside v-if="isArchived && !isAdr" class="doc-metadata__notice" role="note">
      Эта страница находится в архиве. Для актуальных положений используйте ссылки на действующие документы.
    </aside>
  </div>
</template>

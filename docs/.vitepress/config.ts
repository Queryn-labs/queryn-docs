import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Osnova",
  description: "Local-first учебные проекты как обычные папки.",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Продукт", link: "/product/vision" },
      { text: "Архитектура", link: "/architecture/overview" },
      { text: "Спецификация", link: "/specification/" },
      { text: "ADR", link: "/adr/adr-0001-windows-first" },
      { text: "Участие", link: "/contributing" }
    ],
    sidebar: [
      {
        text: "Продукт",
        items: [
          { text: "Видение", link: "/product/vision" },
          { text: "Osnova Reborn", link: "/product/osnova-reborn" },
          { text: "Принципы", link: "/product/principles" },
          { text: "Аудитория и JTBD", link: "/product/jobs-and-non-goals" },
          { text: "UX-доктрина", link: "/product/ux-doctrine" },
          { text: "Базовый проект приложения", link: "/product/application-blueprint" },
          { text: "MVP", link: "/product/mvp" },
          { text: "Roadmap", link: "/product/roadmap" }
        ]
      },
      {
        text: "Архитектура",
        items: [
          { text: "Обзор", link: "/architecture/overview" },
          { text: "Карта репозиториев", link: "/architecture/repository-map" },
          { text: "Desktop", link: "/architecture/desktop" },
          { text: "Local First", link: "/architecture/local-first" },
          { text: "Система плагинов", link: "/architecture/plugin-system" },
          { text: "Osnova Runtime", link: "/architecture/ai-runtime" },
          { text: "Runtime и безопасность", link: "/architecture/runtime-and-security" },
          { text: "Артефакты, контекст и агент", link: "/architecture/artifacts-context-and-agent" },
          { text: "Версии и миграции", link: "/architecture/versioning-and-migrations" }
        ]
      },
      {
        text: "Политики и безопасность",
        items: [
          { text: "Local-first, AI и приватность", link: "/policies/local-first-ai-and-privacy" },
          { text: "Расширения и доверие", link: "/policies/extensions-and-trust" },
          { text: "Threat model", link: "/security/threat-model" },
          { text: "Разработка расширений", link: "/contributing/extensions" }
        ]
      },
      {
        text: "Спецификация",
        items: [{ text: "Формат проекта", link: "/specification/" }]
      },
      {
        text: "ADR",
        items: [
          { text: "0001 Windows First", link: "/adr/adr-0001-windows-first" },
          { text: "0002 Electron React TypeScript", link: "/adr/adr-0002-electron-react-typescript" },
          { text: "0003 Folder Based Projects", link: "/adr/adr-0003-folder-based-projects" },
          { text: "0004 Plugin System", link: "/adr/adr-0004-plugin-system" },
          { text: "0005 Osnova Reborn", link: "/adr/adr-0005-osnova-reborn" },
          { text: "0006 Artifacts and Sessions", link: "/adr/adr-0006-artifacts-and-sessions" },
          { text: "0007 Extension Contributions", link: "/adr/adr-0007-extension-contributions" },
          { text: "0008 Runtime Supervisor", link: "/adr/adr-0008-runtime-supervisor" },
          { text: "0009 Context Policy", link: "/adr/adr-0009-context-policy" },
          { text: "0010 Agent Risk Policy", link: "/adr/adr-0010-agent-risk-policy" },
          { text: "0011 Cross Session Memory", link: "/adr/adr-0011-cross-session-memory" },
          { text: "0012 Unified Agent Loop", link: "/adr/adr-0012-unified-agent-loop" },
          { text: "0013 Agent Network Tools", link: "/adr/adr-0013-agent-network-tools" }
        ]
      }
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/Osnova-labs" }]
  }
});

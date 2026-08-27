import { createRequire } from "node:module";
import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const require = createRequire(import.meta.url);
const mermaidBundlePath = require.resolve("mermaid/dist/mermaid.esm.mjs");

const productSidebar = [
  {
    text: "Продукт",
    items: [
      { text: "Видение", link: "/product/vision" },
      { text: "Queryn", link: "/product/queryn" },
      { text: "Принципы", link: "/product/principles" },
      { text: "Аудитория и JTBD", link: "/product/jobs-and-non-goals" },
      { text: "UX-доктрина", link: "/product/ux-doctrine" },
      { text: "Roadmap", link: "/product/roadmap" },
      { text: "Карта историй", link: "/product/story-map" },
      {
        text: "Пользовательские потоки",
        collapsed: true,
        items: [
          { text: "Первый запуск и создание проекта", link: "/product/flows/first-launch-create" },
          { text: "Усыновление папки", link: "/product/flows/adopt-folder" },
          { text: "Конспекты и wiki-ссылки", link: "/product/flows/notes-and-wiki-links" },
          { text: "Добавление файлов", link: "/product/flows/add-assets" },
          { text: "Агентный ход с подтверждениями", link: "/product/flows/agent-confirmations" },
          { text: "Установка расширения и разрешения", link: "/product/flows/extension-permissions" },
          { text: "Ручной запуск инструмента", link: "/product/flows/manual-tool" },
          { text: "Настройки, палитра и пользовательский CSS", link: "/product/flows/settings-theme-css" }
        ]
      }
    ]
  },
  {
    text: "Архив",
    collapsed: true,
    items: [
      { text: "MVP 0.1", link: "/archive/mvp" },
      { text: "Базовый проект приложения", link: "/archive/application-blueprint" }
    ]
  }
];

const architectureSidebar = [
  {
    text: "Архитектура",
    items: [
      { text: "Обзор", link: "/architecture/overview" },
      { text: "Системная архитектура", link: "/architecture/system" },
      { text: "Архитектурные потоки", link: "/architecture/flows" },
      { text: "Карта репозиториев", link: "/architecture/repository-map" },
      { text: "Desktop", link: "/architecture/desktop" },
      { text: "Local First", link: "/architecture/local-first" },
      { text: "Система расширений", link: "/architecture/plugin-system" },
      { text: "Queryn Runtime", link: "/architecture/ai-runtime" },
      { text: "Runtime и безопасность", link: "/architecture/runtime-and-security" },
      { text: "Артефакты, контекст и агент", link: "/architecture/artifacts-context-and-agent" },
      { text: "Версии и миграции", link: "/architecture/versioning-and-migrations" }
    ]
  }
];

const developerSidebar = [
  {
    text: "Разработчику",
    items: [
      { text: "Участие", link: "/contributing" },
      { text: "Руководство по документации", link: "/guidelines" },
      { text: "Разработка расширений", link: "/contributing/extensions" },
      { text: "CLI runtime", link: "/developer/runtime-cli" },
      { text: "Preload и IPC API", link: "/developer/preload-ipc" },
      { text: "Команды разработки", link: "/developer/development-commands" }
    ]
  },
  {
    text: "Политики и безопасность",
    items: [
      { text: "Расширения и доверие", link: "/policies/extensions-and-trust" },
      { text: "Local-first, AI и приватность", link: "/policies/local-first-ai-and-privacy" },
      { text: "Модель угроз", link: "/security/threat-model" }
    ]
  }
];

const specificationSidebar = [
  {
    text: "Спецификация",
    items: [{ text: "Формат проекта", link: "/specification/" }]
  }
];

const adrSidebar = [
  {
    text: "ADR",
    items: [
      { text: "Журнал решений", link: "/adr/" },
      { text: "Шаблон ADR", link: "/adr/template" },
      { text: "Жизненный цикл ADR", link: "/adr/lifecycle" },
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
      { text: "0013 Agent Network Tools", link: "/adr/adr-0013-agent-network-tools" },
      { text: "0014 Равноправные desktop-цели", link: "/adr/adr-0014-equal-desktop-targets" },
      { text: "0015 Каталог поставщиков моделей", link: "/adr/adr-0015-model-provider-catalog" }
    ]
  }
];

export default withMermaid(defineConfig({
  title: "Queryn",
  description: "Local-first учебные и исследовательские проекты как обычные папки.",
  cleanUrls: true,
  ignoreDeadLinks: false,
  head: [["link", { rel: "icon", href: "/favicon.svg" }]],
  vite: {
    resolve: {
      alias: [{ find: /^mermaid$/, replacement: mermaidBundlePath }]
    }
  },
  themeConfig: {
    logo: { light: "/logo-light.svg", dark: "/logo.svg", alt: "Queryn" },
    siteTitle: false,
    nav: [
      { text: "Главная", link: "/" },
      { text: "Продукт", link: "/product/vision" },
      { text: "Архитектура", link: "/architecture/overview" },
      { text: "Разработчику", link: "/contributing" },
      { text: "Спецификация", link: "/specification/" },
      { text: "ADR", link: "/adr/" }
    ],
    sidebar: {
      "/product/": productSidebar,
      "/archive/": productSidebar,
      "/architecture/": architectureSidebar,
      "/contributing": developerSidebar,
      "/developer/": developerSidebar,
      "/guidelines": developerSidebar,
      "/policies/": developerSidebar,
      "/security/": developerSidebar,
      "/specification/": specificationSidebar,
      "/adr/": adrSidebar
    },
    socialLinks: [{ icon: "github", link: "https://github.com/Queryn-labs" }]
  },
  mermaid: {
    theme: "base",
    flowchart: { curve: "basis" }
  }
}));

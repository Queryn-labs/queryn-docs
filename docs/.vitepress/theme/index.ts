import { h, type Component } from "vue";
import DefaultTheme from "vitepress/theme";
import DocMetadata from "./components/DocMetadata.vue";
import "./style.css";

const Layout: Component = () =>
  h(DefaultTheme.Layout, null, {
    "doc-before": () => h(DocMetadata)
  });

export default {
  extends: DefaultTheme,
  Layout
};

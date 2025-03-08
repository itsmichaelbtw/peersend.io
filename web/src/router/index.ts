import type { RouteRecordRaw } from "vue-router";

import { createRouter, createWebHistory } from "vue-router";

import App from "@/pages/App.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/app"
  },
  {
    path: "/app",
    component: App
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

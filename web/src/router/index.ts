import type { RouteRecordRaw } from "vue-router";

import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "@/layouts/MainLayout.vue";
import SessionLayout from "@/layouts/SessionLayout.vue";

import App from "@/views/App.vue";

import CreateSession from "@/views/session/CreateSession.vue";
import JoinSession from "@/views/session/JoinSession.vue";
import ActiveSession from "@/views/session/ActiveSession.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        component: App
      }
    ]
  },
  {
    path: "/session",
    component: SessionLayout,
    children: [
      {
        path: "create",
        component: CreateSession
      },
      {
        path: "join",
        component: JoinSession
      },
      {
        path: ":session_code",
        name: "active-session",
        component: ActiveSession
      }
    ]
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

import type { RouteRecordRaw } from "vue-router";

import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "@/layouts/MainLayout.vue";
import SessionLayout from "@/layouts/SessionLayout.vue";

import App from "@/views/App.vue";

import CreateSession from "@/views/session/CreateSession.vue";
import JoinSession from "@/views/session/JoinSession.vue";
import ActiveSession from "@/views/session/ActiveSession.vue";
import SessionFull from "@/views/session/SessionFull.vue";

import { websocketState } from "@/state/websocket";

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
        path: "",
        redirect: "/session/create"
      },
      {
        path: "create",
        component: CreateSession
      },
      {
        path: "join",
        component: JoinSession
      },
      {
        path: "full",
        component: SessionFull,
        beforeEnter(_1, _2, next) {
          if (websocketState.is_connected || !websocketState.session_code) {
            next("/session/create");
          } else {
            next();
          }
        }
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

// router.beforeEach((to, from, next) => {
//   if ()

//   next();
// });

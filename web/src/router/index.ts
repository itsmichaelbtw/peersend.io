import type { RouteRecordRaw } from "vue-router";

import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "@/layouts/MainLayout.vue";
import SessionLayout from "@/layouts/SessionLayout.vue";

import App from "@/views/App.vue";

import CreateSession from "@/views/session/CreateSession.vue";
import JoinSession from "@/views/session/JoinSession.vue";
import ActiveSession from "@/views/session/ActiveSession.vue";
import SessionFull from "@/views/session/SessionFull.vue";

import Compatibility from "@/views/Compatibility.vue";

import { applicationState } from "@/state/application";
import { checkWebRTCCompatibility } from "@/utils/compatibility";

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
    path: "/compatibility",
    component: Compatibility
  },
  {
    path: "/session",
    component: SessionLayout,
    beforeEnter(_1, _2, next) {
      if (!checkWebRTCCompatibility()) {
        return next("/compatibility");
      }

      next();
    },
    children: [
      {
        path: "",
        redirect: "/session/create"
      },
      {
        path: "create",
        component: CreateSession,
        beforeEnter(_1, _2, next) {
          if (applicationState.is_connected && applicationState.session_code) {
            next(`/session/${applicationState.session_code}`);
          } else {
            next();
          }
        }
      },
      {
        path: "join",
        component: JoinSession,
        beforeEnter(_1, _2, next) {
          if (applicationState.is_connected && applicationState.session_code) {
            next(`/session/${applicationState.session_code}`);
          } else {
            next();
          }
        }
      },
      {
        path: "full",
        component: SessionFull,
        beforeEnter(_1, _2, next) {
          if (applicationState.is_connected || !applicationState.session_code) {
            next("/session/create");
          } else {
            next();
          }
        }
      },
      {
        path: ":session_code",
        name: "active-session",
        component: ActiveSession,
        beforeEnter(_1, _2, next) {
          if (applicationState.is_connected) {
            next();
          } else {
            next("/session/create");
          }
        }
      }
    ]
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

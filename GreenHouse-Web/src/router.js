import auth from "./api/auth";
import { createRouter, createWebHashHistory } from "vue-router";

import Projects from "./views/projects-page";
import Users from "./views/user-page.vue";
import ProjectDetail from "./views/project-detail";
import ProjectMonitor from "./views/project-monitor";
import ChangePassword from "./views/change-password"
import defaultLayout from "./layouts/side-nav-outer-toolbar";
import simpleLayout from "./layouts/single-card";

function loadView(view) {
  return () => import (/* webpackChunkName: "login" */ `./views/${view}.vue`)
}

const router = new createRouter({
  routes: [
    {
      path: "/projects",
      name: "projects",
      meta: {
        requiresAuth: true,
        layout: defaultLayout
      },
      component: Projects
    },
    {
      path: "/users",
      name: "users",
      meta: {
        isAdmin: true,
        requiresAuth: true,
        layout: defaultLayout
      },
      component: Users
    },
    {
      path: "/change-password",
      name: "change-password",
      meta: {
        requiresAuth: true,
        layout: defaultLayout
      },
      component: ChangePassword
    },
    {
      path: "/project-detail/:id",
      name: "project-detail",
      meta: {
        requiresAuth: true,
        layout: defaultLayout
      },
      component: ProjectDetail
    },
    {
      path: "/project-monitor/:id",
      name: "project-monitor",
      meta: {
        requiresAuth: true,
        layout: simpleLayout
      },
      component: ProjectMonitor
    },
    {
      path: "/login-form",
      name: "login-form",
      meta: {
        requiresAuth: false,
        layout: simpleLayout,
        title: "Sign In"
      },
      component: loadView("login-form")
    },
    {
      path: "/create-account",
      name: "create-account",
      meta: {
        requiresAuth: false,
        layout: simpleLayout,
        title: "Sign Up"
      },
      component: loadView("create-account-form"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/projects"
    }
  ],
  history: createWebHashHistory()
});

router.beforeEach((to, from, next) => {

  if (to.name === "login-form" && auth.loggedIn()) {
    next({ name: "projects" });
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!auth.loggedIn()) {
      next({
        name: "login-form",
        query: { redirect: to.fullPath }
      });
    } else {
      let userLogin = JSON.parse(localStorage.getItem('user'));
      if(userLogin.role != 0 && to.name === "users") {
        next({
          name: "projects",
        });
      } else {
        next();
      }
      next();
    }
  } else {
    next();
  }
});

export default router;

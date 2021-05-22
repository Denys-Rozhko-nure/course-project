import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Basket from "../views/Basket";
import Register from "@/views/Register";
import Login from "@/views/Login";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/basket",
    name: "Basket",
    component: Basket,
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;

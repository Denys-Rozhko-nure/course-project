import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Basket from "../views/Basket";
import Register from "@/views/Register";
import Login from "@/views/Login";
import NewOrder from "@/views/NewOrder";
import OrderHistory from "@/views/OrderHistory";
import AdminPanel from "@/views/AdminPanel";
import ProvidersHistory from "@/views/ProvidersHistory";

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
  {
    path: "/new_order",
    name: "NewOrder",
    component: NewOrder,
  },
  {
    path: "/history",
    name: "OrderHistory",
    component: OrderHistory,
  },
  {
    path: "/admin",
    name: "AdminPanel",
    component: AdminPanel,
  },
  {
    path: "/admin/providers_history",
    name: "ProvidersHistory",
    component: ProvidersHistory,
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;

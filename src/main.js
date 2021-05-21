import Vue from "vue";
import App from "./App.vue";
import Loader from "./components/Loader";
import router from "./router";
import store from "./store";
import "materialize-css/dist/css/materialize.min.css";

Vue.config.productionTip = false;

Vue.component("Loader", Loader);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

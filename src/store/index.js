import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    defaultFilters: {
      maxPrice: 99000,
      minPrice: 3500,
      isAscending: true,
      categories: new Map([
        [1, "Творчість"],
        [2, "Канцелярія"],
        [3, "Електроніка"],
        [4, "Товари для дому"],
      ]),
      providers: new Set([
        "Faber-Castell",
        "Com4ball Stabilo",
        "Dunlop",
        "A4Tech",
        "Wenger",
        "Premax",
      ]),
      isSet: true,
    },
  },
  mutations: {
    setUser(user) {
      this.user = user;
    },
    setFilters(filters) {
      console.log("commit");
      this.defaultFilters = filters;
      this.defaultFilters.isSet = true;
      console.log("commited");
    },
  },
  actions: {},
  modules: {},
  getters: {
    user: (state) => state.user,
    defaultFilters: (state) => state.defaultFilters,
  },
});

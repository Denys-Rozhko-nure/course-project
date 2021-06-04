import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isAdmin: false,
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
    setIsAdmin(isAdmin) {
      this.isAdmin = isAdmin;
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
    isAdmin: (state) => state.isAdmin,
    defaultFilters: (state) => state.defaultFilters,
  },
});

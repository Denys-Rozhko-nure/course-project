<template>
  <div class="container">
    <Loader class="center loader" v-if="productsLoading || filtersLoading" />
    <div v-else class="row">
      <HomeFilters class="col s12 m3" :products="products" />

      <HomeProductsList class="col s12 m9" :products="products" />
    </div>
  </div>
</template>

<style scoped>
.loader {
  margin-top: 40px;
}
</style>

<script>
import HomeFilters from "@/components/HomeFilters";
import HomeProductsList from "@/components/HomeProductsList";
import M from "materialize-css";

export default {
  data: () => ({
    products: [],
    productsLoading: true,
    filtersLoading: false,
  }),
  async beforeMount() {
    await this.fetchProducts();

    if (!this.$store.getters.defaultFilters.isSet) await this.fetchFilters();
  },
  methods: {
    async fetchFilters() {
      //eslint-disable-next-line no-debugger
      // debugger;

      try {
        this.filtersLoading = true;
        const responce = await fetch(`${window.location.origin}/api/filters`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        });

        const filters = await responce.json();

        filters.categories = new Map(
          filters.categories.map((c) => [c.categoryId, c.categoryName])
        );
        filters.providers = new Set(filters.providers);

        this.$store.commit("setFilters", filters);

        this.filtersLoading = false;
      } catch (e) {
        M.toast({ html: "Не вдалося завантажити фільтри" });
      }
    },
    async fetchProducts() {
      // //eslint-disable-next-line no-debugger
      // debugger;
      try {
        const responce = await fetch(
          `${window.location.origin}/api/products${this.$route.fullPath}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
          }
        );

        const body = await responce.json();
        this.products = [];
        for (let key in body) this.products.push(body[key]);

        this.productsLoading = false;
      } catch (e) {
        M.toast({ html: "Не вдалося завантажити список товарів" });
      }
    },
  },
  watch: {
    "$route.fullPath": function () {
      this.fetchProducts();
    },
  },
  components: {
    HomeFilters,
    HomeProductsList,
  },
};
</script>

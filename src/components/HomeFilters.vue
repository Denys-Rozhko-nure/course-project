<template>
  <div class="filters">
    <div class="pink-text flow-text">Фільтри:</div>
    <ul class="collapsible" ref="collapsible">
      <li>
        <div class="collapsible-header">
          <i class="material-icons">shopping_cart</i>Продавець
        </div>
        <div class="collapsible-body">
          <label
            class="d-block"
            v-for="provider of $store.getters.defaultFilters.providers"
            :key="provider"
          >
            <input
              type="checkbox"
              class="filled-in"
              :value="provider"
              v-model="providers"
            />
            <span>{{ provider }}</span>
          </label>
        </div>
      </li>

      <li>
        <div class="collapsible-header">
          <i class="material-icons">credit_card</i>Ціна
        </div>
        <div class="collapsible-body">
          <label>Мінімальна ціна: </label>
          <input
            type="number"
            :min="$store.getters.defaultFilters.minPrice / 100"
            :max="maxPrice"
            v-model="minPrice"
            step="0.01"
          />

          <label>Максимальна ціна: </label>
          <input
            type="number"
            :min="minPrice"
            :max="$store.getters.defaultFilters.maxPrice / 100"
            v-model="maxPrice"
            step="0.01"
          />

          <div class="text">Сортувати за ціною:</div>
          <div class="switch">
            <label>
              За спаданням
              <input type="checkbox" v-model="isAscending" />
              <span class="lever"></span>
              За зростанням
            </label>
          </div>
        </div>
      </li>

      <li>
        <div class="collapsible-header">
          <i class="material-icons">assessment</i>Категорії
        </div>
        <div class="collapsible-body">
          <label
            class="d-block"
            v-for="[categoryId, categoryName] of $store.getters.defaultFilters
              .categories"
            :key="categoryId"
          >
            <input
              type="checkbox"
              class="filled-in"
              :value="categoryId"
              v-model="categories"
            />
            <span>{{ categoryName }}</span>
          </label>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.d-block {
  display: block;
}
</style>

<script>
import M from "materialize-css";

export default {
  data() {
    return {
      collapsible: null,

      minPrice: this.$store.getters.defaultFilters.minPrice / 100,
      maxPrice: this.$store.getters.defaultFilters.maxPrice / 100,
      isAscending: this.$store.getters.defaultFilters.isAscending,
      providers: [...this.$store.getters.defaultFilters.providers],
      categories: [...this.$store.getters.defaultFilters.categories.keys()],
    };
  },
  mounted() {
    this.collapsible = M.Collapsible.init(
      document.querySelectorAll(".collapsible")
    )[0];

    if (this.$route.query.min)
      this.minPrice = Number.parseFloat(this.$route.query.min);
    if (this.$route.query.max)
      this.maxPrice = Number.parseFloat(this.$route.query.max);

    if (this.$route.query.dec)
      this.isAscending = this.$route.query.desc === "true";

    if (this.$route.query.providers)
      this.providers = this.$route.query.providers.split(",");

    if (this.$route.query.categories)
      this.categories = this.$route.query.categories
        .split(",")
        .map((n) => Number.parseInt(n));
  },
  computed: {
    maxPriceNumber() {
      return Math.floor(Number.parseFloat(this.maxPrice) * 100);
    },
    minPriceNumber() {
      return Math.floor(Number.parseFloat(this.minPrice) * 100);
    },
  },
  methods: {
    applyFilters() {
      let resultQuery = "?";

      if (this.minPriceNumber !== this.$store.getters.defaultFilters.minPrice) {
        resultQuery += `min=${this.minPrice}&`;
      }

      if (this.maxPriceNumber !== this.$store.getters.defaultFilters.maxPrice) {
        resultQuery += `max=${this.maxPrice}&`;
      }

      if (
        this.isAscending !== this.$store.getters.defaultFilters.isAscending
      ) {
        resultQuery += `desc=${!this.isAscending}&`;
      }

      if (
        this.providers.length !==
        this.$store.getters.defaultFilters.providers.size
      ) {
        resultQuery += `providers=${this.providers.join(",")}&`;
      }

      if (
        this.categories.length !==
        this.$store.getters.defaultFilters.categories.size
      ) {
        resultQuery += `categories=${this.categories.join(",")}&`;
      }

      resultQuery = resultQuery.slice(0, resultQuery.length - 1);

      this.$router.push(`/${resultQuery}`);
    },
  },
  watch: {
    categories() {
      this.applyFilters();
    },
    providers() {
      this.applyFilters();
    },
    minPrice() {
      this.applyFilters();
    },
    maxPrice() {
      this.applyFilters();
    },
    isAscending() {
      this.applyFilters();
    },
  },
  beforeDestroy() {
    this.collapsible.destroy();
  },
};
</script>

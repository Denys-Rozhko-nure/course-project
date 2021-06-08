<template>
  <div class="container">
    <h2>Ваш кошик:</h2>
    <Loader v-if="loading" class="center" />
    <div class="wrapper" v-else>
      <BasketProduct
        v-for="product of products"
        :key="`product${product.productId}`"
        :product="product"
        :class="{ absent: absentProductsId.has(product.productId) }"
        @deleted="deleteProduct"
      />
    </div>
    <h3>
      Усього
      {{ products.reduce((sum, el) => sum + el.price * el.number, 0) / 100 }}
      грн
    </h3>
    <router-link to="new_order" tag="a" class="btn waves-effect">
      Оформити замовлення
    </router-link>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  flex-wrap: wrap;
}

.container {
  margin-bottom: 500px;
}

.card {
  width: 330px;
}

.card.absent {
  background: #ffc2c2;
}
</style>

<script>
import M from "materialize-css";
import BasketProduct from "@/components/BasketProduct";

export default {
  data: () => ({
    products: [],
    loading: true,
    absentProductsId: new Set(),
  }),
  beforeMount() {
    this.absentProductsId = new Set(
      this.$route.query.absent?.split(",")?.map((el) => Number.parseInt(el))
    );
    console.log(this.absentProductsId);
  },
  async mounted() {
    try {
      const responce = await fetch(
        `${window.location.origin}/api/product_in_basket`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        }
      );

      if (responce.status === 403) {
        M.toast({ html: "Кошик мають лише авторизовані користувачі" });
        this.$router.push("/login?redirect=basket");
      }

      const products = await responce.json();
      this.products = [];

      for (let key in products) this.products.push(products[key]);
      this.loading = false;
      console.log(this.products);
    } catch (e) {
      M.toast({ html: "Не вдалося завантажити Ваш кошик" });
    }
  },
  methods: {
    deleteProduct(productId) {
      this.products = this.products.filter((el) => el.productId !== productId);
    },
  },
  components: {
    BasketProduct,
  },
};
</script>

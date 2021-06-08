<template>
  <div class="card">
    <div class="card-image waves-effect waves-block waves-light">
      <img class="activator" :src="`img/${product.productId}.jpg`" />
    </div>
    <div class="card-content">
      <span class="card-title activator grey-text text-darken-4"
        >{{ product.productName }}<br />
        {{ product.price / 100 }} грн<i class="material-icons right"
          >more_vert</i
        ></span
      >
      <div>
        Додати
        <input
          type="number"
          :min="Math.min(1, product.availableNumber)"
          :max="product.availableNumber"
          v-model="count"
        />
        {{ wordOneAdd }}
        <button class="btn waves-effect" @click="addToBasketOnServer">
          до кошику
        </button>
      </div>
    </div>
    <div class="card-reveal">
      <span class="card-title grey-text text-darken-4"
        >{{ product.productName }} <br />
        {{ product.price / 100 }} грн<i class="material-icons right"
          >close</i
        ></span
      >
      <p>{{ product.description }}</p>
      <p>
        У наявності {{ product.availableNumber }}
        {{ wordOne(product.availableNumber) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.card {
  transform: scale(1);
  transition: all 0.5s;
}

.card:hover {
  transform: scale(1.1);
  z-index: 100;
}

input {
  display: inline-block;
  width: 3em !important;
  margin: 0 0.5em !important;
}
</style>

<script>
import M from "materialize-css";

export default {
  props: ["product"],
  data: () => ({
    count: 1,
  }),
  computed: {
    wordOneAdd() {
      return this.count % 10 == 1 ? "одиницю" : this.wordOne(this.count);
    },
  },
  methods: {
    async addToBasketOnServer() {
      if (this.count === 0) {
        M.toast({ html: "Даного товару немає у наявності" });
        return;
      }
      try {
        const responce = await fetch(
          `http://localhost:4000/api/product_in_basket`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
              n: this.count,
              productId: this.product.productId,
            }),
          }
        );

        if (responce.ok) {
          M.toast({ html: "Товар успішно доданий до кошику" });
        }
        if (responce.status == 403) {
          M.toast({
            html: "Щоб додавати товари до кошику треба аторизуватися",
          });
          this.$router.push("/login");
        }
      } catch (e) {
        M.toast({ html: "Не вдалося додати товар до кошику" });
      }
    },
    wordOne(n) {
      return n % 10 == 1
        ? "одиниця"
        : [2, 3, 4].includes(n % 10)
        ? "одиниці"
        : "одиниць";
    },
  },
};
</script>

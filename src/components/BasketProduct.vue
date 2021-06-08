<template>
  <div class="card">
    <div class="card-image waves-effect waves-block waves-light">
      <img class="activator" :src="`img/${product.productId}.jpg`" />
    </div>
    <div class="card-content">
      <span class="card-title activator grey-text text-darken-4"
        >{{ product.name }}<br />
        {{ product.price / 100 }} грн<i class="material-icons right"
          >more_vert</i
        ></span
      >
      <div>
        Залишити
        <input type="number" min="0" :max="product.number" v-model="count" />
        {{ wordOneAdd }}
        <button class="btn waves-effect" @click="updateBasketElementOnServer">
          у кошику
        </button>
      </div>
    </div>
    <div class="card-reveal">
      <span class="card-title grey-text text-darken-4"
        >{{ product.name }} <br />
        {{ product.price / 100 }} грн
        <i class="material-icons right">close</i></span
      >
      <p>{{ product.description }}</p>
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
  data() {
    return {
      count: this.product.number,
    };
  },
  computed: {
    wordOneAdd() {
      return this.product.number % 10 == 1
        ? "одиницю"
        : this.wordOne(this.product.number);
    },
  },
  methods: {
    async updateBasketElementOnServer() {
      try {
        const responce = await fetch(
          `${window.location.origin}/api/product_in_basket`,
          {
            method: "PATCH",
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
          if (this.count == 0) {
            M.toast({ html: "Товар успішно видалений з корзини" });
            this.$emit("deleted", this.product.productId);
          } else {
            M.toast({ html: "Кількість товару успішно змінена" });
          }
        }
        if (responce.status == 403) {
          M.toast({
            html: "Сесія закінчилася. Необхідно завово аторизуватися",
          });
          this.$router.push("/login?redirect=basket");
        }
      } catch (e) {
        M.toast({ html: "Не вдалося оновити кошик" });
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

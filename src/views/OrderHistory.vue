<template>
  <Loader v-if="orders.lenght > 0" class="center" />
  <div v-else class="container">
    <h2>Ваша історія замовлень:</h2>
    <div v-for="o of orders" :key="`order${o.orderId}`" class="order">
      <h4>Замовлення № {{ o.orderId }}</h4>
      <p class="status">
        Статус:
        <span v-if="o.status === 0" class="yellow-text text-darken-3"
          >Очікується</span
        >
        <span v-else-if="o.status === -1" class="red-text text-darken-3"
          >Відхилено</span
        >
        <span v-else class="green-text text-darken-3">Схвалено</span>
      </p>
      <p>{{ o.oblast }}</p>
      <p>{{ o.locality }}</p>
      <p>Відділення №{{ o.departmentNumber }}</p>
      <p>{{ o.oblast }}</p>

      <div class="card-wrapper">
        <div
          v-for="p of o.products"
          :key="`${p.productId}${o.orderId}`"
          class="card"
        >
          <div class="card-image waves-effect waves-block waves-light">
            <img class="activator" :src="`img/${p.productId}.jpg`" />
          </div>
          <div class="card-content">
            <span class="card-title activator grey-text text-darken-4"
              >{{ p.name }}<br />
              {{ p.price / 100 }} грн<i class="material-icons right"
                >more_vert</i
              ></span
            >
            <div>Кількість: {{ p.number }}</div>
          </div>
          <div class="card-reveal">
            <span class="card-title grey-text text-darken-4"
              >{{ p.name }} <br />
              {{ p.price / 100 }} грн
              <i class="material-icons right">close</i></span
            >
            <p>{{ p.description }}</p>
          </div>
        </div>
      </div>
      <hr />
    </div>
  </div>
</template>

<style scoped>
p.status {
  font-size: 1.4em;
}

.card-wrapper {
  display: flex;
  justify-content: space-around;
}

.card {
  width: 350px;
  margin: 10px 20px;
}
</style>

<script>
import M from "materialize-css";
// import orders from "../../orsers";

export default {
  data: () => ({
    orders: [],
  }),
  async mounted() {
    try {
      const responce = await fetch(`${window.location.origin}/api/order`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });

      if (responce.status == 403) {
        M.toast({
          html: "Для перегляду історію замовлень Вам треба увійти до акаунту",
        });
        this.$router.push("/login?redirect=history");
        return;
      }

      this.orders = await responce.json();
    } catch (e) {
      M.toast({ html: "Не вдалося завантажити історію замовлень" });
    }
  },
};
</script>

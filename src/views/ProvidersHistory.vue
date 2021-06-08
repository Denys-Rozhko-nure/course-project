<template>
  <div class="container">
    <h3>Історія потсачальника, замовлення товаріх якіх бажаєте переглянути</h3>
    <select
      v-model="selectedProvider"
      @change="selectedProviderChanged"
      class="browser-default"
    >
      <option value="" disabled>Оберіть постачальника</option>
      <option v-for="p of $store.getters.providers" :key="p" :value="p">
        {{ p }}
      </option>
    </select>
    <Loader class="center" v-if="ordersLoading" />

    <template v-else>
      <div v-for="o of orders" :key="`order${o.orderId}`" class="order">
        <h4>Замовлення № {{ o.orderId }} користувача {{ o.userFullName }}</h4>
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

        <div class="card-wrapper">
          <div
            v-for="p of o.products"
            :key="`${p.productId}${o.orderId}`"
            class="card"
          >
            <div class="card-image waves-effect waves-block waves-light">
              <img class="activator" :src="`/img/${p.productId}.jpg`" />
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
    </template>
  </div>
</template>

<style scoped>
select {
  display: inline;
}

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

export default {
  data: () => ({
    orders: [],
    ordersLoading: false,
    selectedProvider: "",
  }),
  methods: {
    async selectedProviderChanged(event) {
      console.log(event);
      try {
        const query = `?provider=${window.encodeURIComponent(
          this.selectedProvider
        )}`;
        const responce = await fetch(
          `http://localhost:4000/api/order/by_provider${query}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
          }
        );

        if (responce.status == 403) {
          M.toast({
            html: "Перегляд історії покупок товарів постачальників доступний лише адміністраторам",
          });
          this.$router.push("/login?redirect=providers_history");
          return;
        }

        this.orders = await responce.json();
      } catch (e) {
        console.log(e);
        M.toast({ html: "Не вдалося завантажити історію замовлень" });
      }
    },
  },
  async mounted() {},
};
</script>

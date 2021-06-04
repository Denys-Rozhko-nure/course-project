<template>
  <Loader v-if="orders.lenght > 0" class="center" />
  <div v-else class="container">
    <h2>Ваша історія замовлень:</h2>
    <router-link to="/admin/providers_history"
      >До перегляду історії покупок товарів постачальників</router-link
    >
    <div v-for="o of orders" :key="`order${o.orderId}`" class="order">
      <h4>Замовлення № {{ o.orderId }} користувача {{ o.userFullName }}</h4>

      <p class="status" v-if="o.status !== 0">
        Статус:
        <span v-if="o.status === -1" class="red-text text-darken-3"
          >Відхилено</span
        >
        <span v-else class="green-text text-darken-3">Схвалено</span>
      </p>
      <template v-else>
        <a
          class="waves-effect waves-light btn-small red"
          @click="setOrderStatus(o.orderId, -1)"
          >Відхилити </a
        >&nbsp; &nbsp;
        <a
          class="waves-effect waves-light btn-small light-green"
          @click="setOrderStatus(o.orderId, 1)"
          >Підтвердити</a
        >
      </template>
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

export default {
  data: () => ({
    orders: [],
  }),
  methods: {
    async setOrderStatus(orderId, status) {
      try {
        const responce = await fetch(`http://localhost:4000/api/order`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({ orderId, status }),
        });

        if (responce.status == 403) {
          M.toast({
            html: "Змінювати статус замовлень можуть лише адміністратори",
          });
          this.$router.push("/login?redirect=admin");
          return;
        }

        this.$router.go();
      } catch (e) {
        M.toast({ html: "Не вдалося змінити статус замовлення" });
      }
    },
  },
  async mounted() {
    try {
      const responce = await fetch(`http://localhost:4000/api/order/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });

      if (responce.status == 403) {
        M.toast({
          html: "Замовлення користувачів можуть переглядати лише адміністратор",
        });
        this.$router.push("/login?redirect=admin");
        return;
      }

      this.orders = await responce.json();
    } catch (e) {
      M.toast({ html: "Не вдалося завантажити список замовлень" });
    }
  },
};
</script>

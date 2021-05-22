<template>
  <div class="wrapper">
    <h3>Оформлення замовлення</h3>

    <form class="form" action="post" @submit.prevent="onSubmit">
      <div class="input-field">
        <select v-model="oblast" class="browser-default" required>
          <option value="" disabled selected>Виберіть Вашу область</option>
          <option value="Полтавська область">Полтавська область</option>
          <option value="Харківська область">Харківська область</option>
          <option value="Київська область">Київська область</option>
          <option value="Сумська область">Сумська область</option>
        </select>
      </div>

      <div class="input-field">
        <input
          type="text"
          placeholder="м. Полтава"
          v-model="locality"
          data-length="45"
          minlength="3"
          required
        />
        <label>Населений пункт:</label>
      </div>

      <div class="input-field">
        <input type="number" min="1" v-model="departmentNumber" required />
        <label>Номер відділення:</label>
      </div>

      <button type="submit" class="waves-effect waves-light btn right">
        Оформити
      </button>
    </form>
  </div>
</template>

<style lang="less" scoped>
.wrapper {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;

  button {
    margin: 0 auto;
  }

  small {
    color: red;
  }
}
</style>

<script>
import M from "materialize-css";

export default {
  data: () => ({
    oblast: "",
    locality: "",
    departmentNumber: null,
  }),
  mounted() {
    this.dataCounters = M.CharacterCounter.init(
      document.querySelectorAll("input[data-length]")
    );
  },
  beforeDestroy() {
    this.dataCounters.forEach((c) => c.destroy());
  },
  methods: {
    async onSubmit() {
      try {
        const responce = await fetch("http://localhost:4000/api/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({
            locality: this.locality,
            oblast: this.oblast,
            departmentNumber: this.departmentNumber,
          }),
        });

        if (responce.status === 409) {
          const body = await responce.json();
          if (body.absentProducts) {
            this.$router.push(
              `/basket?absent=${body.absentProducts.join(",")}`
            );
            console.log("new order, status 409, push /basket?absent=");
          }
          M.toast({ html: body.message });
          console.log(body);
        } else if (responce.status === 403) {
          this.$router.push("/login?redirect=new_order");
          console.log("new order, status 403, push /login?redirect=new_order");
          M.toast({
            html: "Оформлювати замовлення можуть лише авторизовані користувачі",
          });
        } else {
          this.$router.push("/history");
          console.log("new order, status 200, push /history");
          M.toast({ html: "Замовлення успішно створено" });
        }
      } catch (e) {
        M.toast({ html: "Не вдалося створити замовлення" });
        console.log(e);
      }
    },
  },
};
</script>

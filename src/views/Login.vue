<template>
  <div class="wrapper">
    <h3>Вхід до акаунту</h3>

    <form class="form" action="post" @submit.prevent="onSubmit">
      <p>Ще не маєте акаунту? - <router-link to="/login">Реєстрація</router-link></p>

      <div class="input-field">
        <label>Логін:</label>
        <input
          type="text"
          v-model="login"
          data-length="100"
          :class="{ invalide: inputs.loginErrorText }"
        />
        <small v-if="inputs.loginErrorText" class="helper-text invalid">{{
          inputs.loginErrorText
        }}</small>
      </div>

      <div class="input-field">
        <label>Пароль:</label>
        <input
          type="password"
          v-model="password"
          data-length="30"
          :class="{ invalide: inputs.passwordErrorText }"
        />
        <small v-if="inputs.passwordErrorText" class="helper-text invalid">{{
          inputs.passwordErrorText
        }}</small>
      </div>

      <button type="submit" class="waves-effect waves-light btn right">
        Увійти
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
    login: "",
    password: "",

    dataCounters: [],

    inputs: {
      loginErrorText: "",
      passwordErrorText: "",
    },
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
    onSubmit() {
      let invalidFlag = false;

      if (this.login.length === 0) {
        this.inputs.loginErrorText = "Логін не може бути пустим";
        invalidFlag = true;
      } else if (this.login.length > 100) {
        this.inputs.loginErrorText = "Логін не може перевищувати 100 символів";
        invalidFlag = true;
      } else {
        this.inputs.loginErrorText = "";
      }

      if (this.password.length < 8) {
        this.inputs.passwordErrorText =
          "Довжина паролю не може бути менша за 8 символів";
        invalidFlag = true;
      } else if (this.password.length > 30) {
        this.inputs.passwordErrorText =
          "Пароль не може перевищувати 30 символів";
        invalidFlag = true;
      } else {
        this.inputs.passwordErrorText = "";
      }

      if(invalidFlag)
        return;
    },
  },
};
</script>

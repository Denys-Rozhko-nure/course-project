<template>
  <div class="wrapper">
    <h3>Регістрація</h3>

    <form class="form" action="post" @submit.prevent="onSubmit" ref="form">
      <p>
        Вже маєте акаунт? -
        <router-link
          :to="
            '/login' +
            ($route.query.redirect ? `?redirect=${$route.query.redirect}` : '')
          "
          >Увійти</router-link
        >
      </p>

      <div class="input-field">
        <label>Ім'я:</label>
        <input
          type="text"
          v-model="firstName"
          data-length="45"
          :class="{ invalide: inputs.firstNameErrorText }"
        />
        <small v-if="inputs.firstNameErrorText" class="helper-text invalid">{{
          inputs.firstNameErrorText
        }}</small>
      </div>

      <div class="input-field">
        <label>Прізвище:</label>
        <input
          type="text"
          v-model="surname"
          data-length="45"
          :class="{ invalide: inputs.surnameErrorText }"
        />
        <small v-if="inputs.surnameErrorText" class="helper-text invalid">{{
          inputs.surnameErrorText
        }}</small>
      </div>

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

      <div class="input-field">
        <label>Повторіть пароль:</label>
        <input
          type="password"
          v-model="password2"
          data-length="30"
          :class="{ invalide: inputs.password2ErrorText }"
        />
        <small v-if="inputs.password2ErrorText" class="helper-text invalid">{{
          inputs.password2ErrorText
        }}</small>
      </div>

      <button type="submit" class="waves-effect waves-light btn right">
        Зареєструватися
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
    firstName: "",
    surname: "",
    login: "",
    password: "",
    password2: "",

    dataCounters: [],

    inputs: {
      firstNameErrorText: "",
      surnameErrorText: "",
      loginErrorText: "",
      passwordErrorText: "",
      password2ErrorText: "",
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

      if (this.firstName.length === 0) {
        this.inputs.firstNameErrorText = "Ім'я не може бути пустим";
        invalidFlag = true;
      } else if (this.firstName.length > 45) {
        this.inputs.firstNameErrorText =
          "Ім'я не може перевищувати 45 символів";
        invalidFlag = true;
      } else {
        this.inputs.firstNameErrorText = "";
      }

      if (this.surname.length > 45) {
        this.inputs.surnameErrorText =
          "Прізвище не може перевищувати 45 символів";
        invalidFlag = true;
      } else {
        this.inputs.surnameErrorText = "";
      }

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

      if (this.password !== this.password2) {
        this.inputs.password2ErrorText = "Паролі мають співпадати";
        invalidFlag = true;
      }

      if (invalidFlag) return;

      this.registerOnServer();
    },
    async registerOnServer() {
      let responce;
      try {
        responce = await fetch("http://localhost:4000/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({
            firstName: this.firstName,
            surname: this.surname,
            login: this.login,
            password: this.password,
          }),
        });
      } catch (e) {
        console.log(e);
      }

      if (responce.status !== 200) {
        M.toast({ html: "Не вдалося зареєструватися на сервері" });
        return;
      }

      const user = await responce.json();
      this.$store.commit("setUser", user);

      M.toast({ html: "Вас успішно зареєстровано" });

      const redirect = this.$route.query.redirect ?? "";
      this.$router.push(`/${redirect}`);
    },
  },
};
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="filters col s12 m3">
        <div class="pink-text flow-text">Фільтри:</div>
        <ul class="collapsible" ref="collapsible">
          <li>
            <div class="collapsible-header">
              <i class="material-icons">shopping_cart</i>Продавець
            </div>
            <div class="collapsible-body"><span>Продавці...</span></div>
          </li>

          <li>
            <div class="collapsible-header">
              <i class="material-icons">credit_card</i>Ціна
            </div>
            <div class="collapsible-body">
              <label>Мінімальна ціна: </label>
              <input
                type="number"
                min="0"
                :max="maxCost"
                v-model="minCost"
                step="0.01"
              />

              <label>Максимальна ціна: </label>
              <input
                type="number"
                :min="minCost"
                max="0"
                v-model="maxCost"
                step="0.01"
              />

              <div class="text">Сортувати за ціною:</div>
              <div class="switch">
                <label>
                  За зростанням
                  <input type="checkbox" v-model="isDecreasing" />
                  <span class="lever"></span>
                  За спаданням
                </label>
              </div>
            </div>
          </li>

          <li>
            <div class="collapsible-header">
              <i class="material-icons">assessment</i>Категорії
            </div>
            <div class="collapsible-body"><span>Продавці...</span></div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text {
  margin-top: 20px;
}
</style>

<script>
import M from "materialize-css";

export default {
  data: () => ({
    collapsible: null,
    minCost: 0,
    maxCost: 1,
    isDecreasing: true,
  }),
  mounted() {
    this.collapsible = M.Collapsible.init(
      document.querySelectorAll(".collapsible")
    )[0];

    this.slider = this.$refs.slider;
  },
  beforeDestroy() {
    this.collapsible.destroy();
  },
};
</script>

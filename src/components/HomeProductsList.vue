<template>
  <div class="wrapper">
    <HomeProductCard
      v-for="p of products"
      :key="`product${p.productId}`"
      :product="p"
      class="col s12 m4"
    />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  flex-wrap: wrap;
}
</style>

<script>
import HomeProductCard from "@/components/HomeProductCard";

export default {
  props: {
    products: {
      type: Array,
      required: true,
    },
  },
  components: {
    HomeProductCard,
  },
};
</script>

<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<script>
import Header from "@/components/Header";

export default {
  components: {
    Header,
  },
  async mounted() {
    try {
      const responce = await fetch(`http://localhost:4000/api/isAdmin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });

      if (responce.ok) {
        const body = await responce.json();
        this.$store.commit(body.isAdmin);
        console.log(body);
      }
    } catch (ignored) {
      console.log(ignored);
    }
  },
};
</script>

<template>
  <div class="all">
    <div class="navbar-fixed">
      <nav>
        <div class="nav-wrapper pink lighten-1r">
          <img class="brand-logo right" src="../assets/logo.png" />
          <!-- <a href="#!" class="brand-logo right" @click.prevent>Logo</a> -->
          <a href="#" data-target="mobile-demo" class="sidenav-trigger"
            ><i class="material-icons">menu</i></a
          >
          <ul class="hide-on-med-and-down left navbar-tabs">
            <router-link
              v-for="link of links"
              :key="link.to"
              :to="link.to"
              :exact="link.exact || false"
              tag="li"
              active-class="active"
              class="waves-effect pointer"
            >
              <a href="#">{{ link.text }}</a>
            </router-link>
          </ul>
        </div>
      </nav>
    </div>

    <ul class="sidenav white" id="mobile-demo">
      <li class="center-align">
        <i class="material-icons">account_circle</i>
        <br />
        username
      </li>
      <li><div class="divider"></div></li>

      <template v-for="link of links">
        <router-link
          :key="'side-' + link.to"
          :to="link.to"
          :exact="link.exact || false"
          tag="li"
          active-class="active"
          class="waves-effect pointer"
        >
          <a href="#">{{ link.text }}</a>
        </router-link>

        <li :key="link.to"><div class="divider"></div></li>
      </template>
    </ul>
  </div>
</template>

<style lang="less" scoped>
#mobile-demo {
  i {
    font-size: 80px;
  }
}

.navbar-tabs {
  margin-left: 15vw;

  & li {
    padding-right: 20px;
    padding-left: 20px;
    cursor: pointer;

    & a:hover {
      background: none;
    }
  }
}

.brand-logo {
  margin-right: 15vw;
  height: 100%;
  border-radius: 35%;
}

.sidenav {
  li {
    display: block;
  }

  .divider {
    margin: 0;
  }
}

@media print {
  .all {
    display: none;
  }
}
</style>

<script>
import M from "materialize-css";

export default {
  data: () => ({
    sidenavInstances: [],
    links: [
      {
        to: "/",
        text: "Головна",
        exact: true,
      },
      {
        to: "/basket",
        text: "Корзина",
      },
      {
        to: "/history",
        text: "Моя історія покупок",
      },
      {
        to: "/login",
        text: "Увійти до акаунту",
      },
      {
        to: "/admin",
        text: "Адміністративна панель",
      },
    ],
  }),
  mounted() {
    const elems = document.querySelectorAll(".sidenav");
    this.sidenavInstances = M.Sidenav.init(elems);
  },
  beforeDestroy() {
    this.sidenavInstances.forEach((e) => e.destroy());
  },
};
</script>

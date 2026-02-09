import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Cabina from "../views/Cabina.vue"
import Avarage from "../views/Avarage.vue"
const routes = [
  {
    path: "/",
    name: "home",
    component: Home
  },

{

path: "/cabina",
component:Cabina},

{

path: "/avarage",
component:Avarage}
];

export default createRouter({
  history: createWebHashHistory(),
  routes
});

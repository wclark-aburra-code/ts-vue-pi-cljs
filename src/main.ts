import Vue, { VNode } from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
var VueApp: any = Vue;
new VueApp({
  render(h: Function): VNode { return h(App) },
}).$mount('#app')

import { createApp, defineAsyncComponent, Plugin} from 'vue'
import App from './App.vue'
import elmentUI from 'element-plus'
import 'element-plus/dist/index.css'
import {createPinia} from 'pinia'
import mitt from 'mitt'

const app = createApp(App)
    .use(elmentUI)
    .use(createPinia())
    // .component('VueLineup', defineAsyncComponent(() => import('vue-lineup')))
    .provide('bus', mitt())
    .mount('#app')
import {createApp} from 'vue'
import PrimeVue from 'primevue/config';
import App from './App.vue'

// primevue theme
import "primevue/resources/primevue.min.css";
import "primeflex/primeflex.css";
import "./assets/primevue/theme.css";

// mdi icons
import "./assets/mdi-icons-v7/css/materialdesignicons.min.css"

const app = createApp(App);
app.use(PrimeVue, { ripple: true });

app.mount('#app')

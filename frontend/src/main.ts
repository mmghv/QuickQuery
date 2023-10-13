import { createApp } from 'vue'
import { RouterLink } from 'vue-router';
import PrimeVue from 'primevue/config';
import App from './App.vue'
import { BrowserOpenURL } from '../wailsjs/runtime'

// primevue theme
import "primevue/resources/primevue.min.css";
import "primeflex/primeflex.css";
import "./assets/primevue/theme.css";

// mdi icons
import "./assets/mdi-icons-v7/css/materialdesignicons.min.css"

createApp(App)
  .use(PrimeVue, { ripple: true })
  // register router-link so Primevue doesn't complain
  .component('router-link', RouterLink)
  .mount('#app')

// Open all links externally
document.body.addEventListener('click', function(e) {
  if (e.target && e.target instanceof HTMLAnchorElement && e.target.href) {
    const url = e.target.href;
    if (
      !url.startsWith('http://#') &&
      !url.startsWith('file://') &&
      !url.startsWith('http://wails.localhost:')
    ) {
      e.preventDefault();
      BrowserOpenURL(url);
    }
  }
});

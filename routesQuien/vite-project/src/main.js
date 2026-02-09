import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./routes/routes.js"

const app = createApp(App)

app.use(router)     // ✅ AQUÍ es donde va
app.mount('#app')

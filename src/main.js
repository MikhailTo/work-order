import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
import { Layout, Breadcrumb, Menu, Button, Table, Popconfirm, Input, Textarea, DatePicker, Select } from "ant-design-vue";
app.use(Layout);
app.use(Breadcrumb);
app.use(Menu);
app.use(Button);
app.use(Table);
app.use(Popconfirm);
app.use(Input);
app.use(Textarea);
app.use(DatePicker);
app.use(Select);
app.mount('#app')

import Vue from 'vue'
import App from './App.vue'
import router from './router'

//#region 
//引入elementui
import 'element-ui/lib/theme-chalk/index.css';
import {
  Form,
  FormItem,
  Button,
  Input,
  Message
} from 'element-ui';

Vue.component(Form.name, Form)
Vue.component(FormItem.name, FormItem)
Vue.component(Button.name, Button)
Vue.component(Input.name, Input)
//全局注册Message组件
Vue.prototype.$message = Message
//#endregion

//导入全局样式
import './assets/css/global.css'

//#region 
//引入axios
import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
Vue.prototype.$http = axios   //使Vue的每个组件都能通过this访问到$http,从而发起Ajax请求
//#endregion

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

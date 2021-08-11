import Vue from 'vue'
import App from './App.vue'
import router from './router'

//导入vue-table-with-tree-grid插件
import TreeTable from 'vue-table-with-tree-grid'


//#region 
//引入elementui
import 'element-ui/lib/theme-chalk/index.css';
import {
  Form,
  FormItem,
  Button,
  Input,
  Message,
  Aside,
  Header,
  Main,
  Container,
  Menu,
  MenuItem,
  Submenu,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Col,
  Row,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  MessageBox,
  Tag,
  Tree,
  Select,
  Option,
  Cascader
} from 'element-ui';

Vue.component(Form.name, Form)
Vue.component(FormItem.name, FormItem)
Vue.component(Button.name, Button)
Vue.component(Input.name, Input)
Vue.component(Aside.name, Aside)
Vue.component(Header.name, Header)
Vue.component(Main.name, Main)
Vue.component(Container.name, Container)
Vue.component(Menu.name, Menu)
Vue.component(MenuItem.name, MenuItem)
Vue.component(Submenu.name, Submenu)
Vue.component(Breadcrumb.name, Breadcrumb)
Vue.component(BreadcrumbItem.name, BreadcrumbItem)
Vue.component(Card.name, Card)
Vue.component(Col.name, Col)
Vue.component(Row.name, Row)
Vue.component(Table.name, Table)
Vue.component(TableColumn.name, TableColumn)
Vue.component(Switch.name, Switch)
Vue.component(Tooltip.name, Tooltip)
Vue.component(Pagination.name, Pagination)
Vue.component(Dialog.name, Dialog)
Vue.component(Tag.name, Tag)
Vue.component(Tree.name, Tree)
Vue.component(Select.name, Select)
Vue.component(Option.name, Option)
Vue.component(Cascader.name, Cascader)

//全局注册Message组件
Vue.prototype.$message = Message
//全局注册MessageBox组件
Vue.prototype.$confirm = MessageBox.confirm
//#endregion

//导入全局样式
import './assets/css/global.css'
//动画库
import animate from 'animate.css'
Vue.use(animate)
Vue.component('tree-table', TreeTable)

//#region 
//引入axios
import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
//挂载前,设置axios请求拦截器,添加token,保证拥有获取数据的权限
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios //使Vue的每个组件都能通过this访问到$http,从而发起Ajax请求
//#endregion

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

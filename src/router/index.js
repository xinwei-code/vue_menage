import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [{
      path: '/login',
      component: Login
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/home',
      component: Home
    }
  ]
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to将要访问的路径
  //from表示从哪个路径跳转而来
  //next是一个函数， 表示放行  next('/login')表示强制跳转到login
  if (to.path === '/login') return next()
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) { //当token不存在
    return next('/login')
  } else {
    next() //放行
  }

})


export default router

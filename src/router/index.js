import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Dashboard from '../components/Start/Dashboard.vue'
import Discovered from '../components/Start/Discovered.vue'
import Presettings from '../components/Devices/Presettings.vue'
import Prelist from '../components/Devices/Prelist.vue'
import Installing from '../components/Devices/Installing.vue'
import Installed from '../components/Devices/Installed.vue'
import Images from '../components/Templates/Images.vue'
import Ostemps from '../components/Templates/Ostemps.vue'
import Hwtemps from '../components/Templates/Hwtemps.vue'
import Tasktemps from '../components/Task/Tasktemps.vue'
import Hostlist from '../components/Task/Hostlist.vue'
import Taskresult from '../components/Task/Taskresult.vue'

Vue.use(VueRouter)

// const routes = [
//   { path: '/', redirect: '/login' },
//   { path: '/login', component: Login },
//   {
//     path: '/home',
//     component: Home,
//     redirect: '/welcome', // 访问home重定向到welcome
//     children: [
//       {
//         // 当 /welcome 匹配成功，
//         // Welcome 会被渲染在 Home 的 <router-view> 中
//         path: '/welcome',
//         component: Welcome
//       },
//       {
//         path: '/page1',
//         component: Subpage1
//       },
//       {
//         path: '/page2',
//         component: Subpage2
//       }
//     ]
//   }
// ]

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/dashboard',
    children: [
      { path: '/dashboard', component: Dashboard },
      { path: '/discovered', component: Discovered },
      { path: '/presettings', component: Presettings },
      { path: '/prelist', component: Prelist },
      { path: '/installing', component: Installing },
      { path: '/installed', component: Installed },
      { path: '/images', component: Images },
      { path: '/ostemps', component: Ostemps },
      { path: '/hwtemps', component: Hwtemps },
      { path: '/hostlist', component: Hostlist },
      { path: '/tasktemps', component: Tasktemps },
      { path: '/taskresult', component: Taskresult }

    ]
  }
]

const router = new VueRouter({
  routes
})

// 没有token（第一次登陆/登陆失效）将重定向到/login
router.beforeEach((to, from, next) => {
  // console.log(to) // 去哪里
  // console.log(from) // 从哪里来
  // console.log(next) // 勾子函数，如果成功了就执行该函数
  if (to.path === '/login') {
    next() // 放行的意思
  } else {
    const token = window.localStorage.getItem('token')
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router

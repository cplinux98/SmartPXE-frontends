import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/main.css'
import axios from 'axios'
import * as echarts from 'echarts'
import moment from 'moment'
moment.locale('zh-cn')

// 请求拦截器，只要发送请求都要带上这个token
axios.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('token')
  return config
})

// 响应拦截器，只要状态码小于100，就跳转到登陆页，重新登录
axios.interceptors.response.use(response => {
  // 只要状态码存在，且小于100
  if (response.data.code && response.data.code < 100) {
    // 弹回登录页面
    Vue.prototype.$message.error(response.data.message)
    router.push('/login')
  } else {
    // 否则就放行响应
    return response
  }
})

// 只要是异步请求，都要带上这个uri头
axios.defaults.baseURL = '/api/v1/'
Vue.prototype.$http = axios

// 引入echarts
Vue.prototype.$echarts = echarts

Vue.config.productionTip = false

Vue.filter('dateFmt', function (dateStr, fmt = 'lll') {
  return moment(dateStr).format(fmt)
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Dashboard</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row :gutter="12">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="flex justify-between">
            <div class="icon">
              <i class="el-icon-monitor" style="font-size: 40px;"></i>
            </div>
            <div class="data flex justify-between">
              <div>在线待处理</div>
              <span>{{ status.online }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="flex justify-between">
            <div class="icon">
              <i class="el-icon-loading" style="font-size: 40px;"></i>
            </div>
            <div class="data flex justify-between">
              <div>正在安装</div>
              <span>{{ status.running }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="flex justify-between">
            <div class="icon">
              <i class="el-icon-circle-check" style="font-size: 40px;"></i>
            </div>
            <div class="data flex justify-between">
              <div>安装成功</div>
              <span>{{ status.success }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="flex justify-between">
            <div class="icon">
              <i class="el-icon-circle-close" style="font-size: 40px;"></i>
            </div>
            <div class="data flex justify-between">
              <div>安装失败</div>
              <span>{{ status.failed }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row style="margin-top: 15px" :gutter="24">
      <el-col :span="8">
        <el-card shadow="hover">
          <div id="cpu" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div id="mem" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div id="disk" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 15px" :gutter="12">
      <el-col :span="24">
        <el-card shadow="hover">
          <div id="statistical" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// import { json } from 'body-parser'
// import { time } from 'console'
import * as echarts from 'echarts'
export default {
  mounted() {
    this.initEcharts()
    this.getMonitorInfo()
    this.getStatusInfo()
    this.getHistoryInfo()
  },
  data() {
    return {
      status: {
        success: 0,
        failed: 0,
        online: 0,
        running: 0
      },
      chartObj: {
        cpu: 0,
        mem: 0,
        disk: 0
      },
      historyObj: {
        days: [],
        success: [],
        failed: []
      },
      echarts_cpu: '',
      echarts_mem: '',
      echarts_disk: '',
      echarts_history: ''
    }
  },
  methods: {
    initEcharts() {
      this.echarts_cpu = echarts.init(document.getElementById('cpu'))
      this.echarts_mem = echarts.init(document.getElementById('mem'))
      this.echarts_disk = echarts.init(document.getElementById('disk'))
      this.echarts_history = echarts.init(document.getElementById('statistical'))

      this.echarts_cpu.showLoading()
      this.echarts_mem.showLoading()
      this.echarts_disk.showLoading()
      this.echarts_history.showLoading()
    },
    // sleep(time) {
    //   var timeStamp = new Date().getTime()
    //   var endTime = timeStamp + time
    //   while (true) {
    //     if (new Date().getTime() > endTime) {
    //       return
    //     }
    //   }
    // },
    async getStatusInfo() {
      const { data: response } = await this.$http.get('dashboard/status/')
      if (response.code) {
        return this.$message.error(response.code)
      }
      this.status = response
      console.log(response)
    },
    async getMonitorInfo() {
      const { data: response } = await this.$http.get('dashboard/sysinfo/')
      if (response.code) {
        return this.$message.error(response.code)
      }
      this.chartObj = response
      for (const key in this.chartObj) {
        const keyUpper = key.toUpperCase()
        const value = this.chartObj[key]
        const option = {
          title: {
            text: keyUpper + '使用率'
          },
          tooltip: {
            formatter: '已经使用: {c}%'
          },
          toolbox: {
            feature: {
              restore: {},
              saveAsImage: {}
            }
          },
          series: [
            {
              name: keyUpper + '图表',
              type: 'gauge',
              detail: { formatter: '{value}%' },
              data: [{ value }]
            }
          ]
        }
        switch (key) {
          case 'cpu':
            this.echarts_cpu.setOption(option, true)
            this.echarts_cpu.hideLoading()
            window.onresize = function () {
              this.echarts_cpu.resize()
            }
            break
          case 'mem':
            this.echarts_mem.setOption(option, true)
            this.echarts_mem.hideLoading()
            window.onresize = function () {
              this.echarts_mem.resize()
            }
            break
          case 'disk':
            this.echarts_disk.setOption(option, true)
            this.echarts_disk.hideLoading()
            window.onresize = function () {
              this.echarts_disk.resize()
            }
            break
          default:
            break
        }
      }
    },
    async getHistoryInfo() {
      const { data: response } = await this.$http.get('dashboard/history/')
      if (response.code) {
        return this.$message.error(response.code)
      }
      this.historyObj = response

      const days = 'days'
      const success = 'success'
      const failed = 'failed'
      // 统计折线图
      const option = {
        title: {
          text: '前30天的安装统计'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['安装成功', '安装失败']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.historyObj[days]
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '安装成功',
            type: 'line',
            stack: 'Total',
            data: this.historyObj[success]
          },
          {
            name: '安装失败',
            type: 'line',
            stack: 'Total',
            data: this.historyObj[failed]
          }
        ]
      }
      // const chart2 = echarts.init(document.getElementById('statistical'))
      this.echarts_history.setOption(
        option, true
      )
      this.echarts_history.hideLoading()
      window.onresize = function () {
        this.echarts_history.resize()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.icon {
  padding: 16px;
}

.icon .i {
  font-size: 40px;
}

.data {
  flex-direction: column;
}

.data>span {
  text-align: right;
  font-size: 20px;
  line-height: 1;
  font-weight: 700;
}
</style>

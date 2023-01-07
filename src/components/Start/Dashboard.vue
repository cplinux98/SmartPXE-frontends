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
import * as echarts from 'echarts'
export default {
  mounted() {
    this.getCpuInfo()
    this.getStatusInfo()
  },
  data() {
    return {
      status: {
        success: 0,
        failed: 0,
        online: 0,
        running: 0
      },
      // status: {},
      chartObj: {
        cpu: 0,
        mem: 0,
        disk: 0
      }
    }
  },
  methods: {
    async getStatusInfo() {
      const { data: response } = await this.$http.get('dashboard/status/')
      if (response.code) {
        return this.$message.error(response.code)
      }
      this.status = response
      console.log(response)
    },
    async getCpuInfo() {
      const { data: response } = await this.$http.get('dashboard/sysinfo/')
      if (response.code) {
        return this.$message.error(response.code)
      }
      this.chartObj = response
      for (const key in this.chartObj) {
        const keyUpper = key.toUpperCase()
        const value = this.chartObj[key]
        const option = {
          tooltip: {
            formatter: '{a} <br/>{b} : {c}%'
          },
          toolbox: {
            feature: {
              restore: {},
              saveAsImage: {}
            }
          },
          series: [
            {
              name: keyUpper + '使用率',
              type: 'gauge',
              detail: { formatter: '{value}%' },
              data: [{ value, name: keyUpper + '使用率' }]
            }
          ]
        }
        const chart = echarts.init(document.getElementById(key))
        chart.setOption(
          option
          , true)
        window.onresize = function () {
          chart.resize()
        }
      }
      // 统计折线图
      const option = {
        title: {
          text: '一个月内历史统计'
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
          data: ['2022-01-01', '2022-01-02', '2022-01-03', '2022-01-04', '2022-01-05', '2022-01-06', '2022-01-07', '2022-01-08', '2022-01-09', '2022-01-10', '2022-01-11', '2022-01-12', '2022-01-13', '2022-01-14', '2022-01-15', '2022-01-16', '2022-01-17', '2022-01-18', '2022-01-19', '2022-01-20', '2022-01-21', '2022-01-22', '2022-01-23', '2022-01-24', '2022-01-25', '2022-01-26', '2022-01-27', '2022-01-28', '2022-01-29', '2022-01-30']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '安装成功',
            type: 'line',
            stack: 'Total',
            data: [77, 69, 5, 16, 31, 46, 71, 29, 23, 52, 63, 47, 73, 43, 18, 44, 73, 30, 13, 1, 39, 15, 89, 27, 21, 73, 27, 94, 48, 56]
          },
          {
            name: '安装失败',
            type: 'line',
            stack: 'Total',
            data: [79, 59, 40, 54, 4, 30, 13, 97, 84, 70, 18, 71, 95, 24, 32, 35, 30, 40, 26, 35, 93, 87, 35, 46, 51, 48, 69, 46, 60, 33]
          }
        ]
      }
      const chart2 = echarts.init(document.getElementById('statistical'))
      chart2.setOption(
        option, true
      )
      window.onresize = function () {
        chart2.resize()
      }
    }
  }
}
</script>

<style lang="less" scoped>
// #cpu {
//   width: 80%;
//   height: 80%;
//   min-height: 500px;
// }

// #mem {
//   width: 100%;
//   height: 100%;
//   min-height: 500px;
// }

// #disk {
//   width: 100%;
//   height: 100%;
//   min-height: 500px;
// }

// .time {
//   font-size: 13px;
//   color: #999;
// }

// .bottom {
//   margin-top: 13px;
//   line-height: 12px;
// }

// .button {
//   padding: 0;
//   float: right;
// }

// .image {
//   width: 100%;
//   height: 50%;
//   display: block;
// }

// .clearfix:before,
// .clearfix:after {
//   display: table;
//   content: '';
// }

// .clearfix:after {
//   clear: both;
// }

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

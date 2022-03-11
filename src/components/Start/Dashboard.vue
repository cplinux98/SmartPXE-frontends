<template>
  <div class="Echarts">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Dashboard</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- kuang -->
    <!-- <el-row :gutter="20">
      <el-col :span="5" v-for="i in itemList" :key="i.title">
        <el-card shadow="hover">
          <div>
            <h3>{{ i.title }}</h3>
            <hr />
            <h1>{{ i.value }}</h1>
          </div>
        </el-card>
      </el-col>
    </el-row> -->
    <el-row :gutter="24">
      <el-col :span="6" v-for="(val, key) in status" :key="key">
        <el-card :body-style="{ padding: '0px' }">
          <img :src="val.img" class="image" />
          <div style="padding: 14px">
            <span>{{ val.title }}</span>
            <div class="bottom clearfix">
              <a> {{ val.value }} </a>
              <time class="time">更新于: {{ val.date | dateFmt }}</time>
              <el-button type="text" class="button" @click="$router.push(val.link)">查看详情</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div style="margin-top: 20px">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-card><p id="cpu"></p></el-card>
        </el-col>
        <el-col :span="8">
          <el-card><p id="mem"></p></el-card>
        </el-col>
        <el-col :span="8">
          <el-card><p id="disk"></p></el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  mounted() {
    this.getCpuInfo()
    this.getStatusInfo()
  },
  data() {
    return {
      status: {},
      chartList: ['cpu', 'mem', 'disk']
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
      const { cpu, mem, disk } = response
      const obj = {
        cpu: JSON.parse(cpu),
        mem: JSON.parse(mem),
        disk: JSON.parse(disk)
      }
      Object.keys(obj).forEach(function (key) {
        const chart = echarts.init(document.getElementById(key))
        chart.setOption(obj[key])
      })
    }
  }
}
</script>

<style lang="less" scoped>
#cpu {
  width: 80%;
  height: 80%;
  min-height: 500px;
}
#mem {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
#disk {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  height: 50%;
  display: block;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}

.clearfix:after {
  clear: both;
}
</style>

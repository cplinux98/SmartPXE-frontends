<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>发现设备</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="search"> <el-button slot="append" icon="el-icon-search"></el-button> </el-input>
        </el-col>
        <el-col :span="2"><el-button type="success" @click="getHostList()">手动刷新</el-button></el-col>
        <el-col :span="3"><el-button type="danger" @click="cycleRunFunc(0)">停止自动刷新</el-button></el-col>
      </el-row>
      <el-table ref="multipleTable" :data="hostList" row-key="mac" border style="width: 100%">
        <el-table-column type="selection" :reserve-selection="true" width="45"> </el-table-column>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="sn" label="SN" width="180"> </el-table-column>
        <el-table-column prop="vender" label="生厂商"> </el-table-column>
        <el-table-column prop="product" label="产品型号"> </el-table-column>
        <el-table-column prop="cpuinfo" label="CPU"> </el-table-column>
        <el-table-column prop="meminfo" label="内存"> </el-table-column>
        <el-table-column prop="clientip" label="Client IP"> </el-table-column>
        <el-table-column prop="ipmi" label="IPMI IP"> </el-table-column>
        <!-- <el-table-column prop="date" label="更新时间"> </el-table-column> -->
        <el-table-column prop="date" label="更新时间" width="180">
          <template #default="{ row }">
            <span> {{ row.date | dateFmt }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200px">
          <template slot-scope="scope">
            <el-button @click="handleInfo(scope.row)" type="info" size="small">查看</el-button>
            <el-button @click="handleDel(scope.row)" type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.page"
        :page-size="pagination.size"
        layout="total, prev, pager, next, jumper"
        :total="pagination.total"
      >
      </el-pagination>
      <div style="margin-top: 20px">
        <el-button type="primary" size="small" @click="handleInstall()">进入装机</el-button>
        <el-button type="success" size="small" @click="handleTask()">进入任务</el-button>
        <el-button type="danger" size="small" disabled>关机</el-button>
        <el-button type="danger" size="small" disabled>删除</el-button>
        <el-button type="info" size="small" disabled>信息导出</el-button>
      </div>
    </el-card>
    <h2>这里的设备:</h2>
    <li>刚进入时为【自动刷新】，可手动设置【停止自动刷新】</li>
    <li>按了【查看】后，可以查看更详细的信息</li>
    <li>按了【进入装机】后，进入"部署流"，可以在【设备管理】的【准备列表】中查看</li>
    <li>按了【进入任务】后，进入"任务流"，可以在【任务管理】的【准备列表】中查看</li>
    <li>按了【删除】后，将失去与【BootOS】的链接，只有【重启BootOS】才可以重新查看到</li>
    <el-drawer
      :title="`设备: ${SysInfo.SN} 的详细信息`"
      :before-close="handleClose"
      :visible.sync="dialog"
      direction="rtl"
      size="70%"
      custom-class="demo-drawer"
      ref="drawer"
      :border="true"
    >
      <div class="demo-drawer__content">
        <el-descriptions class="margin-top" title="设备详情" :column="4" border size="small">
          <!-- <el-descriptions-item label="ID">100</el-descriptions-item> -->
          <el-descriptions-item label="SN">
            <el-tag size="medium"
              ><font size="6">{{ SysInfo.SN }}</font></el-tag
            >
          </el-descriptions-item>
          <el-descriptions-item label="厂商">{{ SysInfo.Vender }}</el-descriptions-item>
          <el-descriptions-item label="产品型号">{{ SysInfo.Product }}</el-descriptions-item>
          <el-descriptions-item label="是否为虚拟机">{{ SysInfo.isVM ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="CPU信息" :span="4">
            <el-table :data="SysInfo.CPU" border>
              <el-table-column prop="slot" label="槽位"> </el-table-column>
              <el-table-column prop="model" label="型号"> </el-table-column>
              <el-table-column prop="core" label="核心"> </el-table-column>
            </el-table>
          </el-descriptions-item>
          <el-descriptions-item label="内存信息" :span="4">
            <el-table :data="SysInfo.MEM" border>
              <el-table-column prop="slot" label="槽位"> </el-table-column>
              <el-table-column prop="size" label="大小"> </el-table-column>
              <el-table-column prop="description" label="描述信息"> </el-table-column>
            </el-table>
          </el-descriptions-item>
          <el-descriptions-item label="网卡信息" :span="4">
            <el-table :data="SysInfo.ETH" border>
              <el-table-column prop="name" label="名称"> </el-table-column>
              <el-table-column prop="mac" label="MAC地址"> </el-table-column>
              <el-table-column prop="product" label="产品型号"> </el-table-column>
              <el-table-column prop="description" label="描述信息"> </el-table-column>
            </el-table>
          </el-descriptions-item>
          <el-descriptions-item label="磁盘信息" :span="4">
            <el-table :data="SysInfo.DISK" border>
              <el-table-column type="index" label="ID"></el-table-column>
              <el-table-column prop="product" label="产品型号"> </el-table-column>
              <el-table-column prop="type" label="类型"> </el-table-column>
              <el-table-column prop="size" label="大小"> </el-table-column>
            </el-table>
          </el-descriptions-item>
          <!-- <el-descriptions-item label="网卡硬件信息"> 03:00.0 Ethernet controller: VMware VMXNET3 Ethernet Controller (rev 01) </el-descriptions-item> -->
          <el-descriptions-item label="阵列卡信息" :span="4">
            <el-table :data="SysInfo.RAID" border>
              <el-table-column type="index" label="ID"></el-table-column>
              <el-table-column prop="type" label="类型"> </el-table-column>
              <el-table-column prop="product" label="产品型号"> </el-table-column>
              <el-table-column prop="description" label="描述信息"> </el-table-column>
            </el-table>
          </el-descriptions-item>
          <el-descriptions-item label="IPMI" :span="4">
            <el-table :data="SysInfo.IPMI" border>
              <el-table-column prop="mac" label="MAC地址"> </el-table-column>
              <el-table-column prop="ipaddr" label="IP地址"> </el-table-column>
              <el-table-column prop="mask" label="掩码长度"> </el-table-column>
              <el-table-column prop="gateway" label="网关"> </el-table-column> </el-table
          ></el-descriptions-item>
          <!-- <el-descriptions-item label="最后更新时间">
            {{ SysInfo.ctime | dateFmt }}
          </el-descriptions-item> -->
        </el-descriptions>
        <div class="demo-drawer__footer"></div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  created() {
    this.getHostList()
    this.cycleRunFunc(1, this.getHostList, 5000)
  },
  beforeDestroy() {
    if (this.intervalID) {
      clearInterval(this.intervalID)
    }
  },
  data() {
    return {
      hostList: [],
      multipleSelection: [],
      selectArrayMac: [],
      selectArray: [],
      intervalID: null,
      search: null,
      table: false,
      dialog: false,
      pagination: { page: 1, size: 20, total: 0 }, // 设置初始化的分页信息，否则会报错
      loading: false,
      formLabelWidth: '200px',
      timer: null,
      size: '',
      SysInfo: {}
    }
  },
  methods: {
    handleSizeChange(val) {
      console.log(`每页 ${val}`)
    },
    handleCurrentChange(val) {
      console.log(`当前页： ${val}`)
      this.getHostList(val)
    },
    cycleRunFunc(status, func, time) {
      if (status) {
        // start == 1
        this.intervalID = setInterval(func, time)
      } else {
        // stop == 0
        clearInterval(this.intervalID)
        this.$message.success('已停止自动刷新，刷新页面后继续自动刷新')
      }
      // return setInterval(func, time)
    },
    async getHostList(page) {
      if (!page) {
        page = this.pagination.page
      }
      console.log('当前刷新的页面为：', page)
      const { data: response } = await this.$http.get(`install/discover/?page=${page}`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.hostList = response.results
      this.pagination = response.pagination
      console.log('列表刷新完成')
      console.log('当前选中的数据为：', this.$refs.multipleTable.selection)
      // 刷新完成后，判断当前页面中选中数组中是否有值，如果有值，重新选中
      // 用选中后的值，去获取的列表中去比对，如果选中的值，不在新的获取列表中了，就删除该值
      if (this.$refs.multipleTable.selection.length !== 0) {
        this.$refs.multipleTable.selection.forEach((row) => {
          console.log(JSON.stringify(this.hostList).indexOf(JSON.stringify(row))) // 如果值为-1，删除掉该元素
          if (JSON.stringify(this.hostList).indexOf(JSON.stringify(row)) === -1) {
            this.$refs.multipleTable.selection.splice(this.$refs.multipleTable.selection.indexOf(row), 1)
          }
        })
      }
    },
    // handleSelectionChange(val) {
    //   console.log(this.$refs.multipleTable.selection)
    // },
    handleInstall() {
      console.log('进入装机列表的', this.$refs.multipleTable.selection)
      if (this.$refs.multipleTable.selection.length !== 0) {
        this.$refs.multipleTable.selection.forEach(async (row) => {
          console.log('当前处理的mac地址', row.mac)
          const { data: response } = await this.$http.post(`/install/discover/${row.mac}/convert/2/`)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.$message.success(`${row.mac}已经成功添加到装机列表`)
          this.$refs.multipleTable.selection.shift() // 配置成功后，就删除掉该值
          this.getHostList()
          console.log('刷新完成了')
        })
      } else {
        this.$message.error('当前未选中任何设备')
      }
    },
    handleTask() {
      console.log('进入任务列表的', this.$refs.multipleTable.selection)
      if (this.$refs.multipleTable.selection.length !== 0) {
        this.$refs.multipleTable.selection.forEach(async (row) => {
          console.log('当前处理的mac地址', row.mac)
          const { data: response } = await this.$http.post(`/install/discover/${row.mac}/convert/1/`)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.$message.success(`${row.mac}已经成功添加到任务列表`)
          this.$refs.multipleTable.selection.shift() // 配置成功后，就删除掉该值
          this.getHostList()
          console.log('刷新完成了')
        })
      } else {
        this.$message.error('当前未选中任何设备')
      }
    },
    handleEdit() {},
    handleDelete(row) {
      console.log(row.mac)
    },
    handleClose() {
      this.dialog = false
    },
    handleInfo(row) {
      this.SysInfo = row.sysinfo
      // this.SysInfo.ctime = row.date
      console.log(this.SysInfo)
      this.dialog = true
    },
    handleDel(row) {
      this.$msgbox
        .confirm('此操作将删除该设备, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
          // center: true
        })
        .then(async () => {
          console.log(row.mac)
          const { data: response } = await this.$http.delete(`install/discover/${row.mac}/`)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.getHostList(this.pagination.page)
          this.$message.success('设备' + row.sn + ' 已成功删除')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
    // async handleDel(row) {
    //   console.log(row.mac)
    //   this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   })
    //     .then(() => {
    //       this.$message({
    //         type: 'success',
    //         message: '删除成功!'
    //       })
    //     })
    //     .catch(() => {
    //       this.$message({
    //         type: 'info',
    //         message: '已取消删除'
    //       })
    //     })
    // }
  }
}
</script>

<style lang="less" scoped>
// .my-label {
//   background: #4bd107;
// }

// .my-content {
//   background: #fde2fc;
// }

/deep/ .el-descriptions__body .el-descriptions__table {
  border-collapse: inherit;
  width: 98%;
  // table-layout: fixed;
}

/deep/ .el-drawer__body {
  margin-left: 2%;
}
</style>
<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>设备管理</el-breadcrumb-item>
      <el-breadcrumb-item>正在安装</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容"> <el-button slot="append" icon="el-icon-search"></el-button> </el-input>
        </el-col>
        <el-col :span="2"><el-button type="success" @click="getHostList()">手动刷新</el-button></el-col>
        <el-col :span="3"><el-button type="danger" @click="cycleRunFunc(0, getHostList)">停止自动刷新</el-button></el-col>
      </el-row>
      <el-table :data="hostList" border style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45"> </el-table-column>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="sn" label="SN" width="180px"> </el-table-column>
        <el-table-column prop="vender" label="生厂商"> </el-table-column>
        <el-table-column prop="product" label="产品型号"> </el-table-column>
        <el-table-column prop="os" label="镜像"> </el-table-column>
        <el-table-column prop="config" label="系统配置"> </el-table-column>
        <el-table-column prop="clientip" label="Client IP"> </el-table-column>
        <el-table-column prop="ipmi" label="IPMI IP"> </el-table-column>
        <!-- <el-table-column prop="install_date" label="安装时间" width="300px"> </el-table-column> -->
        <el-table-column prop="install_date" label="安装时间" width="180">
          <template #default="{ row }">
            <span> {{ row.install_date | dateFmt }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status_progress" label="进度">
          <template slot-scope="scope">
            <el-progress :text-inside="true" :stroke-width="26"
              :percentage="parseInt(scope.row.status_progress)"></el-progress>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200px">
          <template slot-scope="scope">
            <el-button @click="handleInfo(scope.row)" type="info" size="small">安装详情</el-button>
            <el-button type="danger" size="small" slot="reference" @click="handleDel(scope.row)">取消安装</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="pagination.page" :page-size="pagination.size" layout="total, prev, pager, next, jumper"
        :total="pagination.total">
      </el-pagination>
      <div style="margin-top: 20px">
        <el-button type="danger" size="small" disabled>终止并关机</el-button>
        <el-button type="danger" size="small" disabled>终止并重启</el-button>
      </div>
    </el-card>
    <el-dialog :title="`正在对: ${tempObj.sn}进行操作`" :visible.sync="delDialogVisible" width="30%">
      <span>是否确定终止该设备的安装程序</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="handleDelete(tempObj.mac, 0)" disabled>终止并关机</el-button>
        <el-button type="danger" @click="handleDelete(tempObj.mac, 1)" disabled>终止并重启</el-button>
        <el-button type="danger" @click="handleDelRecord(tempObj.mac)">仅清除记录和pxe菜单</el-button>
      </span>
    </el-dialog>

    <el-drawer :title="`${tempInfoObj.sn} 的详细信息`" :before-close="handleClose" :visible.sync="dialog" direction="rtl"
      size="70%" custom-class="demo-drawer" ref="drawer" :border="true">
      <div class="demo-drawer__content">
        <el-descriptions class="margin-top" title="安装详情" :column="1" border size="small">
          <el-descriptions-item label="当前状态">
            <el-steps :space="200" :active="parseInt(tempInfoObj.status_id)" finish-status="success">
              <el-step title="获取指令"></el-step>
              <el-step title="初始化"></el-step>
              <el-step title="设置硬件"></el-step>
              <el-step title="重启"></el-step>
              <!-- 重启完成  -->
              <el-step title="运行装机程序"></el-step>
              <!-- ks_pre  -->
              <el-step title="安装中"></el-step>
              <!-- ks_post  -->
              <el-step title="生成系统内核"></el-step>
              <!-- ks_post_end  -->
              <el-step title="系统已完成"></el-step>
            </el-steps>
          </el-descriptions-item>
          <el-descriptions-item label="实时日志">
            <div>
              <h2>如果任务日志长时间未更新，请检查是否已经安装完成。</h2>
            </div>
            <el-input type="textarea" :disabled="true" v-model="tempInfoObj.status_content" :rows="20"> </el-input>
          </el-descriptions-item>
          <!-- <el-descriptions-item label="VNC画面">
            <el-input type="textarea" v-model="infoObj.vncInfo"> </el-input>
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
    for (var i in this.timerManager) {
      clearInterval(this.timerManager[i])
    }
  },
  data() {
    return {
      delDialogVisible: false,
      pagination: { page: 1, size: 20, total: 0 }, // 设置初始化的分页信息，否则会报错
      hostList: [],
      tempInfoObj: {
        status_id: '',
        status_content: '',
        vncInfo: ''
      },
      tempObj: '',
      tempMac: '',
      tempCycleID: '',
      table: false,
      dialog: false,
      loading: false,
      formLabelWidth: '200px',
      timer: null,
      size: '',
      timerManager: {}
    }
  },
  methods: {
    cycleRunFunc(status, func, time) {
      const funcName = func.name
      if (status) {
        // start == 1
        this.$message.success('自动刷新已经开始')
        const intervalID = setInterval(func, time)
        this.timerManager[funcName] = intervalID
      } else {
        // stop == 0
        const intervalID = this.timerManager[funcName]
        clearInterval(intervalID)
        this.timerManager[funcName] = undefined
        this.$message.success('已停止自动刷新')
      }
      // return setInterval(func, time)
    },
    async getHostList(page) {
      if (!page) {
        page = this.pagination.page
      }
      const { data: response } = await this.$http.get(`install/progress/?page=${page}`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.hostList = response.results
      this.pagination = response.pagination
      // console.log(this.hostList)
      // console.log('======')
    },
    handleSizeChange(val) {
      // console.log(`每页 ${val}`)
    },
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`)
      this.getHostList(val)
    },
    handleDel(row) {
      this.delDialogVisible = true
      this.tempObj = row
    },
    async handleDelete(mac, cmd) {
      const { data: response } = await this.$http.post(`install/progress/${mac}/termination/${cmd}/`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.$message.success('操作成功!')
      this.getHostList()
      this.delDialogVisible = false
    },
    handleInfo(row) {
      this.tempInfoObj = row
      this.tempMac = row.mac
      this.dialog = true
      console.log(this.tempMac)
      // setTimeout(this.timeoutMac(this.handleGetOne, mac, 5000), 5000)
      this.cycleRunFunc(1, this.handleGetOne, 3000)
    },
    timeoutMac(f, p, t) {
      f.call(p)
      setTimeout(this.timeoutMac(f, p, t), t)
    },
    async handleGetOne() {
      const mac = this.tempMac
      const { data: response } = await this.$http.get(`install/progress/${mac}/`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.tempInfoObj = response
    },
    handleClose() {
      this.tempInfoObj = {}
      this.tempMac = ''
      // clearInterval(this.tempCycleID)
      // this.tempCycleID = ''
      this.cycleRunFunc(0, this.handleGetOne)
      this.dialog = false
    },
    handleInstall() { },
    handlePxeboot() { },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleDelRecord(id) {
      this.$msgbox
        .confirm('此操作将删除该记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(async () => {
          const { data: response } = await this.$http.delete(`install/progress/${id}/`)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.getHostList()
          this.$message.success('记录已成功删除')
          this.delDialogVisible = false
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-textarea.is-disabled .el-textarea__inner {
  background-color: #303133;
  border-color: #e4e7ed;
  color: #f56c6c;
  cursor: not-allowed;
}

/deep/ .el-descriptions__body .el-descriptions__table {
  border-collapse: inherit;
  width: 98%;
  // table-layout: fixed;
}

/deep/ .el-drawer__body {
  margin-left: 2%;
}
</style>
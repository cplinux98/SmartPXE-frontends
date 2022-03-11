<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>任务管理</el-breadcrumb-item>
      <el-breadcrumb-item>执行结果</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容"> <el-button slot="append" icon="el-icon-search"></el-button> </el-input>
        </el-col>
        <el-col :span="2"><el-button type="success" @click="getList()">手动刷新</el-button></el-col>
        <el-col :span="3"><el-button type="danger" @click="cycleRunFunc(0, getList)">停止自动刷新</el-button></el-col>
      </el-row>
      <el-table :data="tableData" border style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45"> </el-table-column>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="name" label="SN" width="180px"> </el-table-column>
        <el-table-column prop="playbook" label="运行模板"> </el-table-column>
        <el-table-column prop="task_id" label="任务ID"> </el-table-column>
        <el-table-column prop="date" label="开始时间" width="180">
          <template #default="{ row }">
            <span> {{ row.date | dateFmt }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="任务状态"
          width="100"
          :filters="[
            { text: '正在运行中', value: 1 },
            { text: '任务结束', value: 0 }
          ]"
          :filter-method="filterTag"
          filter-placement="bottom-end"
        >
          <template #default="{ row }">
            <el-tag :type="row.status ? 'primary' : 'danger'" disable-transitions>{{ row.status ? 'Running' : 'Done' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200px">
          <template #default="{ row }">
            <el-button @click="handleInfo(row)" type="info" size="small">任务详情</el-button>
            <el-button @click="handleDel(row.id)" type="danger" size="small">删除</el-button>
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
        <el-button type="info" size="small" disabled>信息导出</el-button>
      </div>
    </el-card>
    <el-drawer
      :title="`${tempInfoObj.name} 的详细信息`"
      :before-close="handleClose"
      :visible.sync="dialog"
      direction="rtl"
      size="70%"
      custom-class="demo-drawer"
      ref="drawer"
      :border="true"
    >
      <div class="demo-drawer__content">
        <el-descriptions class="margin-top" title="任务详情" :column="1" border size="small">
          <el-descriptions-item label="当前状态">
            <el-steps :space="200" :active="parseInt(tempInfoObj.progress)" finish-status="success">
              <el-step title="任务开始"></el-step>
              <el-step title="执行中"></el-step>
              <el-step title="任务结束"></el-step>
            </el-steps>
          </el-descriptions-item>
          <el-descriptions-item label="实时日志">
            <div class="console">
              <div class="output" id="output" v-for="(output, index) in outputList" :key="index">
                <p v-html="output"></p>
                <!-- {{ output }} -->
              </div>
            </div>
            <!-- <el-input type="textarea" :disabled="true" v-model="tempInfoObj.result" :rows="20"> </el-input> -->
          </el-descriptions-item>
        </el-descriptions>
        <div class="demo-drawer__footer"></div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import AnsiUp from 'ansi_up'

export default {
  created() {
    this.getList()
    this.cycleRunFunc(1, this.getList, 5000)
  },
  beforeDestroy() {
    for (var i in this.timerManager) {
      clearInterval(this.timerManager[i])
    }
    // if (this.intervalID) {
    //   clearInterval(this.intervalID)
    // }
  },
  data() {
    return {
      pagination: { page: 1, size: 20, total: 0 }, // 设置初始化的分页信息，否则会报错
      table: false,
      dialog: false,
      loading: false,
      formLabelWidth: '200px',
      timer: null,
      size: '',
      outputList: [],
      tempInfoObj: {
        name: '',
        progress: '',
        result: '',
        taskid: ''
      },
      tableData: [],
      whileTag: 1,
      // form: {
      //   name: '',
      //   region: '',
      //   date1: '',
      //   date2: '',
      //   delivery: false,
      //   type: [],
      //   resource: '',
      //   desc: ''
      // },
      intervalID: null,
      timerManager: {}
    }
  },
  methods: {
    async getList(page) {
      if (!page) {
        page = this.pagination.page
      }
      const { data: response } = await this.$http.get(`task/result/?page=${page}`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.tableData = response.results
      this.pagination = response.pagination
      console.log('刷新主页面数据')
    },
    filterTag(value, row) {
      return row.status === value
    },
    filterHandler(value, row, column) {
      const property = column.property
      return row[property] === value
    },
    handleSizeChange(val) {
      console.log(`每页 ${val}`)
    },
    handleCurrentChange(val) {
      console.log(`当前页： ${val}`)
      this.getList(val)
    },
    handleClose() {
      this.getList()
      this.dialog = false
      this.cycleRunFunc(0, this.getRunningResult)
      this.tempInfoObj = {
        name: '',
        progress: '',
        result: '',
        taskid: ''
      }
      this.outputList = []
    },
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
    handleInfo(row) {
      if (row.status) {
        console.log('任务运行中，需要去redis中读取数据')
        this.dialog = true
        this.tempInfoObj.taskid = row.task_id
        this.tempInfoObj.progress = row.progress
        // 设置定时器，循环执行一个函数，通过任务id，获取redis数据库中的值
        this.cycleRunFunc(1, this.getRunningResult, 3000)
      } else {
        console.log('任务已经结束，直接从row中读取数据')
        this.tempInfoObj = row
        const ansiUp = new AnsiUp()
        // console.log(ansiUp)
        const outputs = row.result
        // console.log(outputs)
        const html = ansiUp.ansi_to_html(outputs)
        this.outputList.push(html)
        this.dialog = true
      }
    },
    async getRunningResult() {
      this.outputList = []
      const id = this.tempInfoObj.taskid
      console.log(id)
      const { data: response } = await this.$http.get(`task/result/running/?taskid=${id}`)
      if (response.code) {
        if (response.code === 888) {
          this.cycleRunFunc(0, this.getRunningResult)
          return this.$message.error(response.message)
        }
        return this.$message.error(response.message)
      }
      const ansiUp = new AnsiUp()
      // console.log(ansiUp)
      const outputs = response
      // console.log(outputs)
      const html = ansiUp.ansi_to_html(outputs)
      this.outputList.push(html)
      // this.tempInfoObj.result = response
      console.log('刷新任务详情数据')
    },
    handlePxeboot() {},
    handleDel(id) {
      this.$msgbox
        .confirm('此操作将删除该记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(async () => {
          const { data: response } = await this.$http.delete(`task/result/${id}/`)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.getList()
          this.$message.success('记录已成功删除')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
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
    }
  }
}
</script>

<style lang="less" scoped>
// /deep/ .el-descriptions__body {
//   border-collapse: inherit;
//   width: 98%;
//   // table-layout: fixed;
// }
/deep/ .el-descriptions__body .el-descriptions__table {
  border-collapse: inherit;
  width: 98%;
}

/deep/ .el-drawer__body {
  margin-left: 2%;
}
.console {
  width: 1200px;
  height: 600px;
  background-color: #000;
  font-size: 15px;
  padding: 5px;
  color: #fff;
  white-space: pre-line;
}
</style>
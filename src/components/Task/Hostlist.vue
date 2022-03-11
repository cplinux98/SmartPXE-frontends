<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>任务管理</el-breadcrumb-item>
      <el-breadcrumb-item>主机列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="search"> <el-button slot="append" icon="el-icon-search"></el-button> </el-input>
        </el-col>
        <el-col :span="2"><el-button type="success" @click="getHostList()">手动刷新</el-button></el-col>
      </el-row>
      <el-table ref="multipleTable" :data="hostList" border row-key="mac" style="width: 100%" @select="handleSelectionChange">
        <el-table-column type="selection" :reserve-selection="true" width="45"> </el-table-column>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="sn" label="SN" width="180"> </el-table-column>
        <el-table-column prop="vender" label="生厂商"> </el-table-column>
        <el-table-column prop="product" label="产品型号"> </el-table-column>
        <el-table-column prop="clientip" label="Client IP"> </el-table-column>
        <el-table-column prop="ipmi" label="IPMI IP"> </el-table-column>
        <el-table-column prop="join_date" label="加入时间" width="180">
          <template #default="{ row }">
            <span> {{ row.join_date | dateFmt }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280px">
          <template #default="{ row }">
            <el-button @click="handleCommand(row)" type="primary" size="small">运行命令</el-button>
            <el-button @click="handlePlaybook(row)" type="success" size="small">执行模板</el-button>
            <el-button @click="handleDel(row)" type="danger" size="small">删除</el-button>
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
        <!-- <el-button type="primary" size="small" @click="handleInstall()">立即安装</el-button> -->
        <el-button type="success" size="small" @click="handleInstall()">更改到装机列表</el-button>
        <el-button type="danger" size="small" disabled>关机</el-button>
        <!-- <el-button type="info" size="small">信息导出</el-button> -->
      </div>
      <div class="info">
        <h2>这里可以对进入BootOS的主机执行任务</h2>
        <h2>任务包含： ansible模块， playbook</h2>
        <h2>执行任务完成后，依然可以转到安装列表中</h2>
        <h2>命令的执行可以在当前窗口直接获取结果</h2>
        <h2>模板的执行可以需要在记录中查看</h2>
      </div>
    </el-card>
    <!-- 这里是隐藏的弹出表单 @执行命令 -->
    <el-dialog title="执行命令" :visible.sync="commandDialogFormVisible" :before-close="closeHandler" @close="resetForm('command')">
      <el-form :model="commandForm" :rules="commandRules" ref="command" label-width="100px">
        <el-form-item label="当前设备">
          {{ commandForm.sn }}
        </el-form-item>
        <el-form-item label="模块" prop="model">
          <el-input v-model="commandForm.model" placeholder="请输入模块名称" style="width: 50%"></el-input>
        </el-form-item>
        <el-form-item label="参数" prop="args">
          <el-input v-model="commandForm.args" placeholder="请输入模块参数" style="width: 50%"></el-input>
          <div style="margin-top: 20px">
            <el-button type="danger" @click="clear()">清空显示框</el-button>
            <el-button type="primary" @click="submitCommand()">{{ loadingtext }}</el-button>
          </div>
        </el-form-item>
      </el-form>
      <!-- <div class="result">
        <el-input type="textarea" v-model="commandResult" placeholder="这里显示执行结果" :rows="10"></el-input>
      </div> -->
      <div class="console">
        <div class="output" id="output" v-for="(output, index) in outputList" :key="index">
          <p v-html="output"></p>
          <!-- {{ output }} -->
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="commandDialogFormVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 这里是隐藏的弹出表单 @执行模板 -->
    <el-dialog title="选择模板" :visible.sync="templateDialogVisible" @close="resetForm('template')" :before-close="closeHandler" width="30%">
      <el-form ref="template" :model="templateForm" :rules="templateRules" label-width="100px" border>
        <el-form-item label="当前设备">
          {{ templateForm.sn }}
        </el-form-item>
        <el-form-item label="模板名称" prop="tempid">
          <el-select v-model="templateForm.tempid" placeholder="请选择即将运行的模板" style="width: 50%">
            <el-option v-for="item in templateList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="templateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitPlaybook()">发送任务</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AnsiUp from 'ansi_up'
import { Loading } from 'element-ui'

export default {
  created() {
    this.getHostList()
    this.getTemplateList()
  },
  data() {
    return {
      loadingbutton: false,
      loadingtext: '发送并执行',
      hostList: [],
      multipleSelection: [],
      selectArray: [],
      search: null,
      pagination: { page: 1, size: 20, total: 0 }, // 设置初始化的分页信息，否则会报错
      outputList: [],
      commandDialogFormVisible: false,
      commandForm: {
        sn: '',
        mac: '',
        model: '',
        args: ''
      },
      commandRules: {
        model: [{ required: true, message: '请输入模块名称', trigger: 'blur' }]
        // args: [{ required: true, message: '请输入模块参数', trigger: 'blur' }]
      },
      templateList: [],
      templateForm: {
        sn: '',
        mac: '',
        tempid: ''
      },
      templateDialogVisible: false,
      templateRules: {
        tempid: [{ required: true, message: '请选择模板', trigger: 'change' }]
        // args: [{ required: true, message: '请输入模块参数', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取模板列表
    async getTemplateList() {
      const { data: response } = await this.$http.get('task/template/')
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.templateList = response.results
      console.log(this.templateList)
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.multipleSelection = []
      this.outputList = []
    },
    handleSizeChange(val) {
      console.log(`每页 ${val}`)
    },
    handleCurrentChange(val) {
      console.log(`当前页： ${val}`)
      this.getHostList(val)
    },
    async getHostList(page) {
      if (!page) {
        page = this.pagination.page
      }
      const { data: response } = await this.$http.get(`task/hostlist/?page=${page}`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.hostList = response.results
      this.pagination = response.pagination
      console.log('======')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log('当前被选择的', this.multipleSelection)
    },
    // handleInstall() {
    //   this.selectArray = []
    //   this.multipleSelection.forEach((row) => {
    //     this.selectArray.push(row.mac)
    //   })
    //   console.log('进入装机列表的', this.selectArray)
    //   this.selectArray.forEach(async (mac) => {
    //     console.log('当前处理的mac地址', mac)
    //     const { data: response } = await this.$http.post(`/install/iprelist/${mac}/install/`)
    //     if (response.code) {
    //       return this.$message.error(response.message)
    //     }
    //     this.$message.success(`${mac}已经成功添加到了装机队列`)
    //     this.getHostList()
    //   })
    //   this.selectArray = []
    // },
    handleCommand(row) {
      this.commandForm.sn = row.sn
      this.commandForm.mac = row.mac
      this.commandDialogFormVisible = true
    },
    submitCommand() {
      // this.loadingbutton = true
      this.loadingbutton = '运行中...'
      console.log(this.commandForm)
      const name = 'command'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const loadingInstance = Loading.service({
            lock: true,
            text: '运行中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.8)',
            target: document.querySelector('.el-dialog__body')
          })
          const { data: response } = await this.$http.post(`task/hostlist/${this.commandForm.mac}/command/`, this.commandForm)
          if (response.code) {
            this.$nextTick(() => {
              // 以服务的方式调用的 Loading 需要异步关闭
              loadingInstance.close()
            })
            return this.$message.error(response.message)
          }
          // this.editDialogFormVisible = false
          // this.getHostList(this.pagination.page)
          this.$message.success('命令提交成功')
          const ansiUp = new AnsiUp()
          console.log(ansiUp)
          const outputs = response
          console.log(outputs)
          const html = ansiUp.ansi_to_html(outputs)
          console.log(html)
          this.outputList.push(html)
          this.$nextTick(() => {
            // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close()
          })
          this.loadingbutton = false
          this.loadingtext = '提交并运行'
        } else {
          this.fullscreenLoading = false
          this.$message.error('验证失败，请检查内容！')
        }
      })
    },
    closeHandler() {
      this.$msgbox
        .confirm('关闭窗口将会丢失当前内容, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
          // center: true
        })
        .then(() => {
          this.commandDialogFormVisible = false
          // this.editConfigDialogVisible = false
          this.$message.success('关闭窗口成功')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消关闭窗口'
          })
        })
    },
    clear() {
      this.outputList = []
    },
    handleEdit(row) {
      console.log(row)
      this.editHostForm = row
      this.editDialogFormVisible = true
    },
    async getConfigList() {
      const { data: response } = await this.$http.get('temp/config/')
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.configList = response.results
      console.log(this.configList)
    },
    handlePlaybook(row) {
      this.templateForm.sn = row.sn
      this.templateForm.mac = row.mac
      this.templateDialogVisible = true
    },
    submitPlaybook() {
      console.log(this.templateForm)
      const name = 'template'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const { data: response } = await this.$http.post(`task/hostlist/${this.templateForm.mac}/playbook/`, this.templateForm)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.templateDialogVisible = false
          this.getHostList(this.pagination.page)
          this.$message.success(response)
        } else {
          this.$message.error('验证失败，请检查内容！')
        }
      })
    },
    editHost() {
      console.log(this.editHostForm)
      const name = 'editHost'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const { data: response } = await this.$http.patch(`install/iprelist/${this.editHostForm.mac}/`, this.editHostForm)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.editDialogFormVisible = false
          this.getHostList(this.pagination.page)
          this.$message.success('配置成功')
        } else {
          this.$message.error('验证失败，请检查内容！')
        }
      })
    },
    handleDelete() {},
    handlePxeboot() {},
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
          const { data: response } = await this.$http.delete(`task/hostlist/${row.mac}/`)
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
    handleInstall() {
      console.log('进入装机列表的', this.$refs.multipleTable.selection)
      if (this.$refs.multipleTable.selection.length !== 0) {
        this.$refs.multipleTable.selection.forEach(async (row) => {
          console.log('当前处理的mac地址', row.mac)
          const { data: response } = await this.$http.post(`/task/hostlist/${row.mac}/convert/`)
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
    }
  }
}
</script>

<style lang="less" scoped>
.my-label {
  background: #4bd107;
}

.my-content {
  background: #fde2fc;
}
.console {
  width: 100%;
  height: 300px;
  background-color: #000;
  font-size: 15px;
  padding: 5px;
  color: #fff;
  white-space: pre-line;
}
</style>
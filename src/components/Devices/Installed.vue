<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>设备管理</el-breadcrumb-item>
      <el-breadcrumb-item>安装记录</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容"> <el-button slot="append" icon="el-icon-search"></el-button> </el-input>
        </el-col>
      </el-row>
      <el-table :data="tableData" border style="width: 100%" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="45"> </el-table-column>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="sn" label="SN" width="80"> </el-table-column>
        <el-table-column prop="xinghao" label="型号"> </el-table-column>
        <el-table-column prop="osTemp" label="系统模板"> </el-table-column>
        <el-table-column prop="hwTemp" label="硬件模板"> </el-table-column>
        <el-table-column prop="osipaddr" label="Client IP"> </el-table-column>
        <el-table-column prop="ipmiaddr" label="IPMI IP"> </el-table-column> -->
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
        <el-table-column prop="date" label="安装时间" width="180">
          <template #default="{ row }">
            <span> {{ row.date | dateFmt }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="安装结果" width="100" :filters="[
          { text: '成功', value: 1 },
          { text: '失败', value: 0 }
        ]" :filter-method="filterTag" filter-placement="bottom-end">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'" disable-transitions>{{
              row.status ? 'success' : 'failed'
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200px">
          <template #default="{ row }">
            <el-button @click="handleInfo(row)" type="info" size="small">安装详情</el-button>
            <el-button @click="handleDel(row.id)" type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="pagination.page" :page-size="pagination.size" layout="total, prev, pager, next, jumper"
        :total="pagination.total">
      </el-pagination>
      <div style="margin-top: 20px">
        <el-button type="info" size="small" disabled>信息导出</el-button>
      </div>
    </el-card>
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
            <el-input type="textarea" :disabled="true" v-model="tempInfoObj.status_content" :rows="20"> </el-input>
          </el-descriptions-item>
        </el-descriptions>
        <div class="demo-drawer__footer"></div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  created() {
    this.getList()
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
      tempInfoObj: {
        status_id: '',
        status_content: '',
        vncInfo: ''
      },
      tableData: [],
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
    }
  },
  methods: {
    async getList(page) {
      if (!page) {
        page = this.pagination.page
      }
      const { data: response } = await this.$http.get(`install/result/?page=${page}`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.tableData = response.results
      this.pagination = response.pagination
      // console.log('======')
    },
    filterTag(value, row) {
      return row.status === value
    },
    filterHandler(value, row, column) {
      const property = column.property
      return row[property] === value
    },
    handleSizeChange(val) {
      // console.log(`每页 ${val}`)
    },
    handleCurrentChange(val) {
      // console.log(`当前页： ${val}`)
      this.getList(val)
    },
    handleClose() {
      this.dialog = false
    },
    handleInfo(row) {
      this.tempInfoObj = row
      this.tempMac = row.mac
      this.dialog = true
      console.log(this.tempMac)
    },
    handleInstall() { },
    handlePxeboot() { },
    handleDel(id) {
      this.$msgbox
        .confirm('此操作将删除该记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(async () => {
          const { data: response } = await this.$http.delete(`install/result/${id}/`)
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
</style>
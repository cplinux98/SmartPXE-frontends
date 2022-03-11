<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>模板管理</el-breadcrumb-item>
      <el-breadcrumb-item>镜像模板</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容"> <el-button slot="append" icon="el-icon-search"></el-button> </el-input>
        </el-col>
        <el-col :span="12"><el-button type="primary" @click="addImagedialogVisible = true">上传镜像</el-button></el-col>
      </el-row>
      <el-table :data="imageList" border style="width: 100%">
        <el-table-column type="index" label="序号" width="50px"></el-table-column>
        <el-table-column prop="name" label="镜像名称"> </el-table-column>
        <el-table-column prop="type" label="系统类型"> </el-table-column>
        <el-table-column prop="version" label="版本"> </el-table-column>
        <!-- <el-table-column prop="path" label="存储库位置" width="600px"> </el-table-column> -->
        <el-table-column prop="path" label="存储库位置" width="600px"> </el-table-column>
        <el-table-column fixed="right" label="操作" width="200px">
          <template #default="{ row }">
            <el-button @click="openNewPage(row.path)" type="primary" size="small">查 看</el-button>
            <el-button @click="handleDel(row.id)" type="danger" size="small">删 除</el-button>
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
    </el-card>
    <!-- 上传镜像的提示框 -->
    <el-dialog title="提示" width="35%" :visible.sync="addImagedialogVisible" @close="resetForm('addImages')" :before-close="closeHandler">
      <el-form ref="addImages" :model="addImageForm" :rules="addImageRules" label-width="100px">
        <el-form-item label="镜像名称" prop="name">
          <el-input v-model="addImageForm.name" placeholder="请输入镜像的名称"></el-input>
        </el-form-item>
        <el-form-item label="系统类型" prop="type">
          <el-select v-model="addImageForm.type" placeholder="请选择系统类型">
            <el-option label="CentOS" value="CentOS"></el-option>
            <!-- <el-option label="Ubuntu" value="Ubuntu" disabled></el-option>
            <el-option label="RHEL" value="RHEL"></el-option>
            <el-option label="Windows" value="Windows"></el-option> -->
          </el-select>
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="addImageForm.version" placeholder="请输入镜像的发型版本"></el-input>
        </el-form-item>
        <el-form-item label="选择镜像" prop="path">
          <el-input v-model="addImageForm.path" placeholder="请输入镜像的完整路径"> </el-input>
        </el-form-item>
        <el-form-item label="解压镜像">
          <el-button type="primary" @click="extractImage(addImageForm)">执行</el-button>
        </el-form-item>
        <!-- <el-upload
            class="upload-demo"
            ref="upload"
            :action="$http.defaults.baseURL + 'temp/upload/'"
            :data="this.addImageForm"
            :headers="getHeaders()"
            :limit="1"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :file-list="fileList"
            :auto-upload="false"
          >
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <el-button style="margin-left: 10px" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
            <div slot="tip" class="el-upload__tip">只能上传ISO文件</div>
          </el-upload> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeHandler()">取 消</el-button>
        <el-button type="primary" @click="handleAddImage">增加镜像</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
export default {
  created() {
    this.getImageList()
  },
  data() {
    return {
      imageList: [],
      addImagedialogVisible: false,
      // 重置表单需要初始化和prop
      addImageForm: {
        name: '',
        type: '',
        version: '',
        path: '',
        save_path: ''
      },
      addImageRules: {
        name: [
          { required: true, message: '请输入镜像名称', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请选择镜像类型', trigger: 'change' }],
        version: [
          { required: true, message: '请输入版本标识', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        path: [{ required: true, message: '请上传镜像', trigger: 'blur' }]
      },
      input3: '',
      fileList: [],
      imageTag: 1,
      pagination: { page: 1, size: 20, total: 0 } // 设置初始化的分页信息，否则会报错
    }
  },
  methods: {
    openNewPage(url) {
      window.open(url)
    },
    async getImageList(page) {
      if (!page) {
        page = this.pagination.page
      }
      console.log('当前刷新的页面为：', page)
      const { data: response } = await this.$http.get(`temp/image/?page=${page}`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.imageList = response.results
      this.pagination = response.pagination
      console.log('======')
    },
    handleSuccess(response, file, fileList) {
      this.fileList = [response]
      this.addImageForm.path = this.fileList[0].url
      this.addImageForm.save_path = this.fileList[0].save_path
    },
    handleRemove(file, fileList) {
      console.log(fileList, file)
      this.fileList = []
    },
    getHeaders() {
      return { Authorization: `Bearer ${window.localStorage.getItem('token')}` }
    },
    submitUpload() {
      console.log(this.$refs.upload.handleSuccess)
      this.$refs.upload.handleSuccess = this.handleSuccess
      console.log(this.$refs.upload.handleSuccess)
      this.$refs.upload.submit()
    },
    extractImage(form) {
      console.log(form)
      const name = 'addImages'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const loadingInstance = Loading.service({
            lock: true,
            text: '后台解压中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.8)',
            target: document.querySelector('.el-dialog__body')
          })
          const { data: response } = await this.$http.post('temp/extract/', this.addImageForm)
          if (response.code) {
            this.$nextTick(() => {
              // 以服务的方式调用的 Loading 需要异步关闭
              loadingInstance.close()
            })
            return this.$message.error(response.message)
          }
          this.addImageForm.path = response.url
          this.addImageForm.save_path = response.save_path
          this.imageTag = 0
          this.$nextTick(() => {
            // 以服务的方式调用的 Loading 需要异步关闭
            loadingInstance.close()
          })
          this.$message.success('镜像解压成功！')
        } else {
          this.$message.error('验证失败，请重新输入')
        }
      })
    },
    handleAddImage() {
      const name = 'addImages'
      this.$refs[name].validate(async (valid) => {
        if (this.imageTag) {
          return this.$message.error('验证失败，请先解压镜像')
        }
        if (valid) {
          console.log(valid, '+++++')
          console.log(this.addImageForm)
          const { data: response } = await this.$http.post('temp/image/', this.addImageForm)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.$message.success('镜像上传成功！')
          this.addImagedialogVisible = false
          this.resetForm('addImages')
          this.getImageList()
        } else {
          this.$message.error('验证失败，请重新输入')
        }
      })
    },
    handleSizeChange(val) {
      console.log(`每页 ${val}`)
    },
    handleCurrentChange(val) {
      console.log(`当前页： ${val}`)
      this.getImageList(val)
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.fileList = []
      this.imageTag = 1
    },
    closeHandler() {
      this.$msgbox
        .confirm('关闭窗口将会丢失已经上传的镜像, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
          // center: true
        })
        .then(() => {
          this.addImagedialogVisible = false
          this.resetForm('addImages')
          this.$message.success('取消上传镜像')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消关闭窗口'
          })
        })
    },
    handleDel(id) {
      this.$msgbox
        .confirm('此操作将删除该镜像, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(async () => {
          const { data: response } = await this.$http.delete(`temp/image/${id}/`)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.getImageList(this.pagination.page)
          this.$message.success('镜像已成功删除')
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
.el-dialog .el-form-item .el-select {
  width: 80%;
}
.el-dialog .el-form-item .el-input {
  width: 80%;
}
</style>
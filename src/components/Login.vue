<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="logo" />
      </div>
      <div class="ms-title">SmartPXE智能部署平台</div>
      <el-form ref="loginFormRef" class="login_form" :model="loginForm" :rules="loginRules">
        <el-form-item prop="username">
          <el-input placeholder="请输入用户名" prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input placeholder="请输入密码" prefix-icon="el-icon-lock" v-model="loginForm.password" @keyup.enter.native="login"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="danger" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 16, message: '长度在 5 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm() {
      console.log('reset ~~~~~', this)
      console.log(this.$refs.loginFormRef.resetFields())
    },
    login() {
      // 这里的数据要进行校验，校验后根据校验结果选择对应的函数，校验内部是一个回调函数
      this.$refs.loginFormRef.validate(async (valid, object) => {
        if (valid) {
          // console.log('本地验证通过 ++++++')
          const { data: response } = await this.$http.post('login/', this.loginForm)
          console.log(response)
          if (!response.code) {
            this.$message.success('登陆成功，欢迎使用！')
            // console.log('successful !')
            const token = response.access
            window.localStorage.setItem('token', token)
            this.$router.push('/home')
          } else {
            this.$message.error(response.message)
            // console.log('faild')
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 25px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    height: 130px;
    width: 130px;
    padding: 10px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 15%;
    }
  }
  .ms-title {
    width: 100%;
    line-height: 150px;
    text-align: center;
    font-size: 20px;
    color: rgb(10, 10, 10);
    // border-bottom: 1px solid #ddd;
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
}
</style>

<template>
  <div>
    <el-button type="info" @click="logOut">退出</el-button>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    logOut() {
      window.sessionStorage.removeItem('token') //销毁token
      this.$router.replace('/login')
      this.$message({
        type: 'warning',
        message: '退出成功',
        center: true,
      })
    },
  },
}
</script>




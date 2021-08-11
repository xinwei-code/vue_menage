<template>
  <div>
    <h1 :style="{ opacity }">Welcome!</h1>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
  data() {
    return {
      opacity: 1,
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.opacity -= 0.01
      if (this.opacity <= 0) {
        this.opacity = 1
      }
    }, 16)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
}
</script>

 <style lang="less" scoped>
div {
  margin: 100px auto;
}
h1 {
  font-size: 50px;
  color: skyblue;
}
</style>


<template>
  <div class="dashboard-container">
    <div class="dashboard-text">
      <h3> ^_^ 您好，{{ name }}</h3>
      <div>欢迎来到 Bo Blog！</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters(['name'])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
}
</style>

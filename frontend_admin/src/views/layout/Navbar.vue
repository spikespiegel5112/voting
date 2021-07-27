<template>
  <el-menu class="navbar" mode="horizontal">
    <el-row>
      <el-col :span="18">
        <Hamburger
          class="hamburger-container"
          :toggleClick="toggleSideBar"
          :isActive="$store.state.app.sidebar.opened === 1"
        />
        <Breadcrumb />
      </el-col>
      <el-col :span="6" class="right-menu">
        <div class="common_environmenthint_item" v-if="$prodEnv">测试环境</div>
        <LangSelect class="international right-menu-item" />
        <el-dropdown class="avatar-container" trigger="click">
          <div class="common_imguploadpreview_wrapper">
            <img class="user-avatar" :src="avatarImage" />
            <i class="el-icon-caret-bottom"></i>
          </div>
          <el-dropdown-menu class="user-dropdown" slot="dropdown">
            <RouterLink class="inlineBlock" to="/">
              <el-dropdown-item>Home</el-dropdown-item>
            </RouterLink>
            <el-dropdown-item divided>
              <span @click="logout">LogOut</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex';
import Breadcrumb from '@/components/Breadcrumb';
import Hamburger from '@/components/Hamburger';
import LangSelect from '@/components/LangSelect';

export default {
  components: {
    Breadcrumb,
    Hamburger,
    LangSelect
  },
  data() {
    return {
      avatarImage: !!this.$store.state.user.image
        ? this.$store.state.user.image + '-style_100x100'
        : require('@/assets/img/default/defaultavatar_60_60.png')
    };
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'image'])
  },
  mounted() {
    console.log(this.$store.state.user);
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar');
    },
    logout() {
      // 为了重新实例化vue-router对象 避免bug
      this.$store.dispatch('LogOut').then(() => {
        location.reload();
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  /*line-height: 50px;*/
  border-radius: 0px !important;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .breadcrumb-container {
    float: left;
  }
  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }
  .right-menu {
    height: 100%;
    &:focus {
      outline: none;
    }
    .right-menu-item {
      display: inline-block;
      margin: 0 8px;
    }
    .screenfull {
      height: 20px;
    }
    .international {
      height: 50px;
      vertical-align: middle;
    }
    .theme-switch {
      vertical-align: 15px;
    }
  }
}
</style>

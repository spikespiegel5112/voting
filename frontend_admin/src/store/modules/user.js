import { login, logout, getInfo } from '@/api/login';
import { Message } from 'element-ui';
import service, { baseUrl } from '@/utils/request';

const user = {
  state: {
    token: '',
    login_id: '',
    nick_name: '',
    image: '',
    avatar: '',
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_LOGIN_ID: (state, login_id) => {
      state.login_id = login_id;
    },
    SET_NICK_NAME: (state, nick_name) => {
      state.nick_name = nick_name;
    },
    SET_IMAGE: (state, image) => {
      state.image = image;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    }
  },

  actions: {
    // 登录

    // 获取用户信息

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        const logoutRequest = baseUrl + 'user/logout';

        service
          .post(logoutRequest, {
            token: state.token
          })
          .then(response => {
            commit('SET_TOKEN', '');
            // commit('SET_ROLES', [])
            resolve();
          })
          .catch(error => {
            reject(error);
          });
        // logout(state.token).then(() => {
        //   commit('SET_TOKEN', '');
        //   // commit('SET_ROLES', [])
        //   removeToken();
        //   removeLoginId();
        //   resolve();
        // }).catch(error => {
        //   reject(error);
        // });
      });
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '');
        resolve();
      });
    }
  }
};

export default user;

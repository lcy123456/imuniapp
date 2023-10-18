import {
    v4 as uuidv4
} from 'uuid';
import IMSDK from 'openim-uniapp-polyfill';
import {
    businessGetUserInfo,
    getAppConfigFromSvr
} from '@/api/login';
import {
    filterEmptyValue
} from '@/util/common';

export const businessAllowType = {
    Allow: 1,
    NotAllow: 2,
};

const defaultConfig = {
    allowSendMsgNotFriend: businessAllowType.Allow,
    needInvitationCodeRegister: false,
};

const state = {
    clientID: '',
    authData: {},
    selfInfo: {},
    appConfig: {},
    userList: [],
    isSyncing: false,
    isProd: process.env.NODE_ENV === 'production',
};

const mutations = {
    SET_CLIENT_ID (state, data) {
        state.clientID = data;
    },
    SET_AUTH_DATA (state, data) {
        state.authData = {
            ...data
        };
    },
    SET_SELF_INFO (state, info) {
        state.selfInfo = {
            ...info
        };
    },
    SET_APP_CONFIG (state, config) {
        state.appConfig = {
            ...config
        };
    },
    SET_IS_SYNCING (state, data) {
        state.isSyncing = data;
    },
    SET_IS_PROD (state) {
        state.isProd = !state.isProd;
    },
    SET_USER_LIST (state, data) {
        if (!state.userList.map(v => v.userID).includes(data.userID)) {
            state.userList = state.userList.concat([data]);
        }
    },
    SET_DEL_USER_LIST (state, data) {
        state.userList = state.userList.filter(v => v.userID !== data.userID);
    },
    SET_UPDATE_USER_LIST (state, data) {
        state.userList.forEach((v, i) => {
            if (v.userID === data.userID) {
                state.userList[i] = {
                    ...v,
                    ...data
                };
            }
        });
    },
};

const actions = {
    async getSelfInfo ({
        commit
    }) {
        try {
            const {
                data
            } = await IMSDK.asyncApi(IMSDK.IMMethods.GetSelfUserInfo, uuidv4());
            const {
                users
            } = await businessGetUserInfo(data.userID);
            const businessData = users[0] ?? {};
            filterEmptyValue(businessData);
            console.log(data, 'datadatadata');
            commit('SET_SELF_INFO', {
                ...data,
                ...businessData
            });
            commit('SET_UPDATE_USER_LIST', {
                ...data,
                ...businessData
            });
        } catch (e) {
            console.log(e, '获取个人信息失败');
            uni.$u.toast('连接失败，请检查网络');
        }
    },
    async updateBusinessInfo ({
        commit,
        state
    }) {
        try {
            const {
                users
            } = await businessGetUserInfo(state.selfInfo.userID);
            const businessData = users[0] ?? {};
            filterEmptyValue(businessData);
            commit('SET_SELF_INFO', {
                ...state.selfInfo,
                ...businessData
            });
        } catch (e) {
            console.log(e);
        }
    },
    async getAppConfig ({
        commit
    }) {
        try {
            const data = await getAppConfigFromSvr();
            console.log(data);
            commit('SET_APP_CONFIG', data.config ?? defaultConfig);
        } catch (e) {
            console.error(e);
        }
    }
};


export default {
    namespaced: true,
    state,
    mutations,
    actions,
};

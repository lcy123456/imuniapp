import { pinList } from '@/api/pinToTop';
import { getUnreadMsgCount } from '@/api/message';
import {
    requestAndroidPermission,
    judgeIosPermission,
    gotoAppPermissionSetting
} from '@/util/permission.js';
const state = {
    pinList: [],
    connectingStatus: '',
    keyBoardHeight: 0,
    isShowkeyBoard: false,
    isShowTip: false,
    unreadMap: {},
    thirdData: {
        gif: {
            url: '',
            apiKey: ''
        },
        livekit: {
            url: ''
        }
    }
};

const mutations = {
    SET_THIRD_DATA(state, data) {
        state.thirdData = data;
    },
    SET_PIN_LIST(state, list) {
        state.pinList = list;
    },
    SET_CONNECTING_STATUS(state, value) {
        state.connectingStatus = value;
    },
    SET_KEYBOARD_HEIGHT(state, value) {
        state.keyBoardHeight = value;
    },
    SET_IS_SHOW_KEYBOARD(state, boo) {
        state.isShowkeyBoard = boo;
    },
    SET_TIP_STATUS(state, boo) {
        state.isShowTip = boo;
    },
    SET_UNREAD_MAP(state, map) {
        state.unreadMap = map;
        if (map.count) {
            uni.setTabBarBadge({
                index: 2,
                text: map.count < 99 ? map.count + '' : '99+'
            });
        } else {
            uni.removeTabBarBadge({
                index: 2
            });
        }
    }
};

const actions = {
    async getUnreadMsgCount({ rootState, commit }) {
        try {
            const data = await getUnreadMsgCount({
                userID: rootState.user.userList
                    .map(item => item.userID)
                    .filter(userID => userID !== rootState.user.authData.userID)
            });
            commit('SET_UNREAD_MAP', data || {});
        } catch (e) {
            // console.log(e, '获取未读数据失败');
        }
    },
    async pinList({ commit }, conversationID) {
        try {
            const data = await pinList({
                conversationID,
                pagination: {
                    pageNumber: 1,
                    showNumber: 200
                }
            });
            commit('SET_PIN_LIST', data.list || []);
        } catch (e) {
            console.log(e, '获取置顶列表失败');
        }
    },
    async hasCameraPermissions() {
        const isIOS = uni.$u.os() === 'ios';
        let hasCamera = false;

        if (isIOS) {
            const cameraResult = judgeIosPermission('camera');
            hasCamera = cameraResult;
        } else {
            const cameraResult = await requestAndroidPermission(
                'android.permission.CAMERA'
            );
            hasCamera = cameraResult === 1;
        }

        if (!hasCamera) {
            uni.showModal({
                title: '使用摄像头',
                content: '想访问您的摄像头',
                success: res => {
                    if (res.confirm) gotoAppPermissionSetting();
                }
            });
        }
        return hasCamera;
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
};

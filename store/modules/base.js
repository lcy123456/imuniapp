import { pinList } from '@/api/pinToTop';
import { requestAndroidPermission, judgeIosPermission, gotoAppPermissionSetting } from '@/util/permission.js';
const state = {
    pinList: [],
    connectingStatus: ''
};

const mutations = {
    SET_PIN_LIST (state, list) {
        state.pinList = list;
    },
    SET_CONNECTING_STATUS (state, value) {
        state.connectingStatus = value;
    }
};

const actions = {
    async pinList ({
        commit
    }, conversationID) {
        try {
            const data = await pinList({
                conversationID,
                pagination: {
                    pageNumber: 1,
                    showNumber: 200
                }
            });
            console.log(data.list, 'pinListpinListpinListpinList', conversationID);
            commit('SET_PIN_LIST', data.list || []);
        } catch (e) {
            console.log(e, '获取置顶列表失败');
        }
    },
    async hasCameraPermissions () {
        const isIOS = uni.$u.os() === 'ios';
        let hasCamera = false;

        if (isIOS) {
            const cameraResult = judgeIosPermission('camera');
            hasCamera = cameraResult;
        } else {
            const cameraResult = await requestAndroidPermission('android.permission.CAMERA');
            hasCamera = cameraResult === 1;
        }

        if (!hasCamera) {
            uni.showModal({
                title: "使用摄像头",
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
    actions,
};

import { requestAndroidPermission, judgeIosPermission, gotoAppPermissionSetting } from '@/util/permission.js';
import IMSDK, {
    IMMethods,
} from "openim-uniapp-polyfill";

const state = {
    callTime: '',
    incomingCallToken: '',
    isIncomingCallTop: false, // 顶部弹出
    isIncomingCallSmall: false, // 悬浮缩小
    isAnswer: false, // true拨打电话 false接听电话
    isIncomingCallIng: false, // 正在通话中
    isIncomingCallLoading: false, // 双方等待接通电话
    incomingCallMessage: {},
    incomingCallUserInfo: {
        faceURL: '',
        nickname: '菠萝吹雪'
    },
    incomingCallSmallStyle: {
        moveX: 7,
        moveY: 90
    }
};

const mutations = {
    SET_INCOMING_CALL_TOKEN (state, value) {
        state.incomingCallToken = value;
    },
    SET_INCOMING_CALL_USER_INFO (state, value) {
        state.incomingCallUserInfo = value;
    },
    SET_INCOMING_CALL_TOP (state, value) {
        state.isIncomingCallTop = value;
    },
    SET_IS_INCOMING_CALL_SMALL (state, value) {
        state.isIncomingCallSmall = value;
    },
    SET_IS_ANSWER (state, value) {
        state.isAnswer = value;
    },
    SET_IS_INCOMING_CALL_ING (state, value) {
        state.isIncomingCallIng = value;
    },
    SET_IS_INCOMING_CALL_LOADING (state, value) {
        state.isIncomingCallLoading = value;
    },
    SET_CALL_TIME (state, value) {
        state.callTime = value;
    },
    SET_IS_INCOMING_CALL_SMALL_STYLE (state, value) {
        state.incomingCallSmallStyle = value;
    },
    SET_IS_INCOMING_CALL_MESSAGE (state, value) {
        state.incomingCallMessage = {
            ...state.incomingCallMessage,
            ...value
        };
    },
};

const actions = {
    // 检查麦克风、摄像头权限
    async reviewPermission () {
        const isIOS = uni.$u.os() === 'ios';
        let hasRecord = false;
        let hasCamera = false;

        if (isIOS) {
            const recordResult = judgeIosPermission('record');
            const cameraResult = judgeIosPermission('camera');
            hasRecord = recordResult === 1;
            hasCamera = cameraResult;
        } else {
            const recordResult = await requestAndroidPermission('android.permission.RECORD_AUDIO');
            const cameraResult = await requestAndroidPermission('android.permission.CAMERA');
            hasRecord = recordResult === 1;
            hasCamera = cameraResult === 1;
        }

        if (!hasRecord || !hasCamera) {
            uni.showModal({
                title: "使用麦克风",
                content: '想访问您的麦克风与摄像头',
                success: res => {
                    if (res.confirm) gotoAppPermissionSetting();
                }
            });
        }

        return hasRecord && hasCamera;
    },

    // 拨打电话
    async onThrowCall ({
        commit
    }, message) {
        try {
            const { sendID } = message;
            const usersInfo = await IMSDK.asyncApi(IMMethods.GetUsersInfo, IMSDK.uuid(),
                [sendID]
            );
            if (usersInfo?.data) {
                // eslint-disable-next-line no-unsafe-optional-chaining
                const { faceURL, nickname } = usersInfo?.data[0]?.friendInfo;
                commit('SET_INCOMING_CALL_USER_INFO', { faceURL, nickname });
                console.log('拨打电话，对方用户信息', { faceURL, nickname });
            }

            commit('SET_IS_INCOMING_CALL_MESSAGE', message);
            commit('SET_IS_INCOMING_CALL_LOADING', true);
            commit('SET_IS_ANSWER', false);
            commit('SET_CALL_TIME', +new Date());
        } catch (e) {
            console.log(e, '拨打电话失败');
        }
    },

    // 出现电话，等待接听
    async appearLoadingCall ({
        commit
    }, message) {
        try {
            const { sendID } = message;
            const usersInfo = await IMSDK.asyncApi(IMMethods.GetUsersInfo, IMSDK.uuid(),
                [sendID]
            );
            if (usersInfo?.data) {
                // eslint-disable-next-line no-unsafe-optional-chaining
                const { faceURL, nickname } = usersInfo?.data[0]?.friendInfo;
                commit('SET_INCOMING_CALL_USER_INFO', { faceURL, nickname });
                console.log('等待接听电话，对方用户信息', { faceURL, nickname });
            }

            commit('SET_IS_INCOMING_CALL_MESSAGE', message);
            commit('SET_IS_INCOMING_CALL_LOADING', true);
            commit('SET_INCOMING_CALL_TOP', true);
            commit('SET_IS_ANSWER', true);
            commit('SET_CALL_TIME', +new Date());
        } catch (e) {
            console.log(e, '接听电话失败');
        }
    },

    // 缩小
    async onSmall ({
        commit
    }) {
        commit('SET_IS_INCOMING_CALL_SMALL', true);
    },

    // 挂断电话
    async onDangerCall ({ commit }) {
        commit('SET_IS_INCOMING_CALL_SMALL', false);
        commit('SET_INCOMING_CALL_TOP', false);
        commit('SET_IS_INCOMING_CALL_ING', false);
        commit('SET_IS_INCOMING_CALL_LOADING', false);
    },

    // 接通电话
    async onSuccessCall ({ commit }) {
        commit('SET_IS_INCOMING_CALL_SMALL', false);
        commit('SET_INCOMING_CALL_TOP', false);
        commit('SET_IS_INCOMING_CALL_ING', true);
        commit('SET_IS_INCOMING_CALL_LOADING', false);
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};

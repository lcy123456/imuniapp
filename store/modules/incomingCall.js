import conversation from './conversation';
import { requestAndroidPermission, judgeIosPermission, gotoAppPermissionSetting } from '@/util/permission.js';

const state = {
    incomingCallWSURL: 'testWSURL',
    incomingCallTOKEN: 'testToken',
    isCallOrAnswer: false, // true主动拨打  false等待接听
    callType: 'video', // video视频通话 audio语音通话
    conversationID: '',
    callTime: '',
    isIncomingCallTop: false, // 顶部弹出
    isIncomingCallSmall: false, // 悬浮缩小
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
    SET_INCOMING_CALL_WSURL (state, value) {
        state.incomingCallWSURL = value;
    },
    SET_INCOMING_CALL_TOKEN (state, value) {
        state.incomingCallTOKEN = value;
    },
    SET_IS_CALL_OR_ANSWER (state, value) {
        state.isCallOrAnswer = value;
    },
    SET_CALL_TYPE (state, value) {
        state.callType = value;
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
    SET_IS_INCOMING_CALL_ING (state, value) {
        state.isIncomingCallIng = value;
    },
    SET_IS_INCOMING_CALL_LOADING (state, value) {
        state.isIncomingCallLoading = value;
    },
    SET_CALL_CONVERSATIONID (state, value) {
        state.conversationID = value;
    },
    SET_CALL_TIME (state, value) {
        state.callTime = value;
    },
    SET_IS_INCOMING_CALL_SMALL_STYLE (state, value) {
        state.incomingCallSmallStyle = value;
    },
    SET_IS_INCOMING_CALL_MESSAGE (state, value) {
        state.incomingCallMessage = value;
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
    }, data) {
        try {
            // const data = await pinList({
            //     conversationID,
            //     pagination: {
            //         pageNumber: 1,
            //         showNumber: 200
            //     }
            // });
            // console.log(data.list, 'pinListpinListpinListpinList', conversationID);
            const wsURL = `ws://192.168.2.20:7880`;
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAzNzY2ODAsImlzcyI6IkFQSVZWQ3BETGtaTHZSViIsIm5iZiI6MTY5Nzc4NDY4MCwic3ViIjoicGFydGljaXBhbnRJZGVudGl0eTMiLCJ2aWRlbyI6eyJyb29tIjoiTVVTSyIsInJvb21Kb2luIjp0cnVlfX0.Ca0sYNhNTdOHkwNk1mJeDQq9XWhjC0ska1j-rX1y9QA`;
            commit('SET_INCOMING_CALL_WSURL', wsURL);
            commit('SET_INCOMING_CALL_TOKEN', token);
            commit('SET_CALL_TYPE', data.callType);
            console.log(data, '-----------1111111111111111');
            commit('SET_IS_INCOMING_CALL_MESSAGE', data);
            commit('SET_IS_CALL_OR_ANSWER', true);
            commit('SET_IS_INCOMING_CALL_LOADING', true);
            commit('SET_CALL_CONVERSATIONID', conversation.state.currentConversation.conversationID);
            commit('SET_CALL_TIME', +new Date());
        } catch (e) {
            console.log(e, '拨打电话失败');
        }
    },

    // 等待接听电话
    async onCatchCall ({
        commit
    }, callType) {
        try {
            const wsURL = `ws://192.168.2.20:7880`;
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAzNzY2ODAsImlzcyI6IkFQSVZWQ3BETGtaTHZSViIsIm5iZiI6MTY5Nzc4NDY4MCwic3ViIjoicGFydGljaXBhbnRJZGVudGl0eTMiLCJ2aWRlbyI6eyJyb29tIjoiTVVTSyIsInJvb21Kb2luIjp0cnVlfX0.Ca0sYNhNTdOHkwNk1mJeDQq9XWhjC0ska1j-rX1y9QA`;
            commit('SET_INCOMING_CALL_WSURL', wsURL);
            commit('SET_INCOMING_CALL_TOKEN', token);
            commit('SET_CALL_TYPE', callType);
            commit('SET_IS_CALL_OR_ANSWER', false);
            commit('SET_IS_INCOMING_CALL_LOADING', true);
            commit('SET_INCOMING_CALL_TOP', true);
            commit('SET_CALL_CONVERSATIONID', conversation.state.currentConversation.conversationID);
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
        commit('SET_INCOMING_CALL_WSURL', '');
        commit('SET_INCOMING_CALL_TOKEN', '');
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
        commit('SET_IS_CALL_OR_ANSWER', false);
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};

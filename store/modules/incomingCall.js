import conversation from './conversation';
import { requestAndroidPermission, judgeIosPermission } from '@/util/permission.js';
import { showToast } from '@/util/unisdk';

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
    SET_CALL_CONVERSATIONID (state, value) {
        state.conversationID = value;
    },
    SET_CALL_TIME (state, value) {
        state.callTime = value;
    },
    SET_IS_INCOMING_CALL_SMALL_STYLE (state, value) {
        state.incomingCallSmallStyle = value;
    },
};

const actions = {
    // 检查麦克风、摄像头权限
    async reviewPermission () {
        let result = false;
        if (plus.io.name === 'ios') {
            const haveRecord = judgeIosPermission('record');
            const haveCamera = judgeIosPermission('camera');
            if (!haveCamera)
                showToast({ title: '请开启麦克风权限'});
            if (!haveCamera)
                showToast({ title: '请开启摄像头权限'});

            result = haveRecord &&  haveCamera;
        } else {
            const HAVE_RECORD_AUDIO = await requestAndroidPermission('android.permission.RECORD_AUDIO');
            const HAVE_CAMERA = await requestAndroidPermission('android.permission.CAMERA');
            if ([0, -1].includes(HAVE_RECORD_AUDIO))
                showToast({ title: '请开启麦克风权限'});
            if ([0, -1].includes(HAVE_CAMERA))
                showToast({ title: '请开启摄像头权限'});

            result = HAVE_RECORD_AUDIO === 1 && HAVE_CAMERA === 1;
        }
        return result;
    },
    // 拨打电话
    async onThrowCall ({
        commit
    }, callType) {
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
            commit('SET_CALL_TYPE', callType);
            commit('SET_IS_CALL_OR_ANSWER', true);
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
            commit('SET_INCOMING_CALL_TOP', true);
            commit('SET_CALL_CONVERSATIONID', conversation.state.currentConversation.conversationID);
            commit('SET_CALL_TIME', +new Date());
        } catch (e) {
            console.log(e, '接听电话失败');
        }
    },

    // 缩小
    onSmall ({
        commit
    }) {
        commit('SET_IS_INCOMING_CALL_SMALL', true);
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};

import conversation from './conversation';
const state = {
    incomingCallWSURL: 'testWSURL',
    incomingCallTOKEN: 'testTokenxxxxxxxx',
    isCallOrAnswer: false, // true主动拨打  false等待接听
    conversationID: '',
    callTime: '',
    incomingCallCatchUser: {
        nickname: '好上头接电话'
    }, // 接电话用户
    incomingCallThrowUser: {
        nickname: '好上头打电话'
    }, // 拨打电话用户
    callType: 'video', // video视频通话 audio语音通话
    isVideoCall: false, // true视频通话, false语音通话
    isIncomingCallTop: false, // 顶部弹出
    isIncomingCallSmall: false, // 悬浮缩小
    isIncomingCallIng: false, // 正在通话中


    handleAttr: {
        isActiveMic: true, // 麦克风
        isActiveSpeak: true, // 扬声器
        isActiveCam: true, // 摄像头
        isActiveOverturn: false, // 翻转
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
    SET_INCOMING_CALL_CATCH_USER (state, value) {
        state.incomingCallCatchUser = value;
    },
    SET_INCOMING_CALL_THROW_USER (state, value) {
        state.incomingCallThrowUser = value;
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
    SET_ON_HANDLE_ATTR (state, {key, value}) {
        state.handleAttr[key] = value;
    },
    SET_CALL_CONVERSATIONID (state, value) {
        state.conversationID = value;
    },
    SET_CALL_TIME (state, value) {
        state.callTime = value;
    }
};

const actions = {
    onHandleAttr ({
        state,
        commit
    }, key) {
        const value = !state.handleAttr[key];
        commit('SET_ON_HANDLE_ATTR', {key, value});
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

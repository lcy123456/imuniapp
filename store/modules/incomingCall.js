const state = {
    incomingCallWSURL: '',
    incomingCallTOKEN: 'testTokenxxxxxxxx',
    incomingCallCatch: false, // 等待接电话，拒绝/接听
    incomingCallThrow: false, // 主动拨打电话
    incomingCallCatchUser: {
        nickname: '好上头接电话'
    }, // 接电话用户
    incomingCallThrowUser: {
        nickname: '好上头打电话'
    }, // 拨打电话用户
    isVideoCall: false, // true视频通话, false语音通话
    isIncomingCallTop: false, // 顶部弹出
    isIncomingCallMain: false, // 全屏通话
    isIncomingCallSmall: false, // 悬浮缩小
    isIncomingCallIng: false, // 通话中,


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
    SET_INCOMING_CALL_CATCH (state, value) {
        state.incomingCallCatch = value;
    },
    SET_INCOMING_CALL_THROW (state, value) {
        state.incomingCallThrow = value;
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
    SET_IS_INCOMING_CALL_MAIN (state, value) {
        state.isIncomingCallMain = value;
    },
    SET_IS_INCOMING_CALL_SMALL (state, value) {
        state.isIncomingCallSmall = value;
    },
    SET_IS_VIDEO_CALL (state, value) {
        state.isVideoCall = value;
    },
    SET_IS_INCOMING_CALL_ING (state, value) {
        state.isIncomingCallIng = value;
    },
    SET_ON_HANDLE_ATTR (state, {key, value}) {
        state.handleAttr[key] = value;
    },
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
    }, isVideoCall) {
        try {
            // const data = await pinList({
            //     conversationID,
            //     pagination: {
            //         pageNumber: 1,
            //         showNumber: 200
            //     }
            // });
            // console.log(data.list, 'pinListpinListpinListpinList', conversationID);
            const wsurl = '123';
            const token = '321';
            commit('SET_INCOMING_CALL_WSURL', wsurl);
            commit('SET_INCOMING_CALL_TOKEN', token);
            commit('SET_IS_VIDEO_CALL', isVideoCall);
            commit('SET_INCOMING_CALL_THROW', true);
            commit('SET_IS_INCOMING_CALL_MAIN', true);

            uni.switchTab({
                url: '/pages/phone/index/index',
            });
        } catch (e) {
            console.log(e, '拨打电话失败');
        }
    },

    // 接听电话
    async onCatchCall ({
        commit
    },) {
        try {
            // commit('SET_INCOMING_CALL_WSURL', wsurl);
            // commit('SET_INCOMING_CALL_TOKEN', token);
        } catch (e) {
            console.log(e, '接听电话失败');
        }
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};

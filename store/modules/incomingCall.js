const state = {
    incomingCallLoading: false, // 呼入电话等待接听/拒绝
    isIncomingCallTop: false, // 顶部弹出
    isIncomingCallMain: false, // 全屏通话
    isIncomingCallSmall: false, // 悬浮缩小
    isIncomingCallIng: false, // 通话中
};

const mutations = {
    SET_INCOMING_CALL_LOADING (state, value) {
        state.incomingCallLoading = value;
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
    SET_IS_INCOMING_CALL_ING (state, value) {
        state.isIncomingCallIng = value;
    },
};

const actions = {
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};

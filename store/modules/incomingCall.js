const state = {
    incomingCallCatch: false, // 等待接电话，拒绝/接听
    incomingCallThrow: false, // 主动拨打电话
    incomingCallCatchUser: {
        nickname: '好上头接电话'
    }, // 接电话用户
    incomingCallThrowUser: {
        nickname: '好上头'
    }, // 拨打电话用户
    isIncomingCallTop: false, // 顶部弹出
    isIncomingCallMain: false, // 全屏通话
    isIncomingCallSmall: false, // 悬浮缩小
    isIncomingCallIng: false, // 通话中
};

const mutations = {
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

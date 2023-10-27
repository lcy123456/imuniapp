import { requestAndroidPermission, judgeIosPermission, gotoAppPermissionSetting } from '@/util/permission.js';
import IMSDK, {
    IMMethods,
} from "openim-uniapp-polyfill";
import dayjs from 'dayjs';

const state = {
    startTime: '',
    callTime: '',
    incomingCallToken: '',
    isIncomingCallTop: false, // 顶部弹出
    isIncomingCallSmall: false, // 悬浮缩小
    isAnswer: false, // true拨打电话 false接听电话
    isIncomingCallIng: false, // 正在通话中
    isIncomingCallLoading: false, // 双方等待接通电话
    isHangup: false, // 刚刚挂断
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
    SET_IS_HANGUP (state, value) {
        state.isHangup = value;
    },
    SET_IS_INCOMING_CALL_LOADING (state, value) {
        state.isIncomingCallLoading = value;
    },
    SET_CALL_TIME (state, value) {
        state.callTime = value;
    },
    SET_START_TIME (state, value) {
        state.startTime = value;
    },
    SET_IS_INCOMING_CALL_SMALL_STYLE (state, value) {
        state.incomingCallSmallStyle = value;
    },
    SET_IS_INCOMING_CALL_MESSAGE (state, value) {
        state.incomingCallMessage = value;
        console.log('state.incomingCallMessagestate.incomingCallMessage', state.incomingCallMessage);
        console.log('value.value.value', value);
    },
};

const actions = {
    // 检查麦克风、摄像头权限
    async reviewPermission () {
        const isIOS = uni.$u.os() === 'ios';
        let hasRecord = false;
        let hasCamera = false;

        if (isIOS) {
            // const recordResult = judgeIosPermission('record');
            // const cameraResult = judgeIosPermission('camera');
            // hasRecord = recordResult === 1;
            // hasCamera = cameraResult;
            return true;
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
            if (message.sessionType !== 3) {
                const { recvID } = message;
                const usersInfo = await IMSDK.asyncApi(IMMethods.GetUsersInfo, IMSDK.uuid(),
                    [recvID]
                );
                if (usersInfo?.data) {
                    const [uData] = usersInfo.data;
                    const { faceURL, nickname } = uData.publicInfo;
                    commit('SET_INCOMING_CALL_USER_INFO', { faceURL, nickname });
                    console.log('拨打电话，对方用户信息', { faceURL, nickname });
                }
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
            const isGroupMessage = message.sessionType === 3;
            if (isGroupMessage) {
                // 群聊
                const { groupID } = message;
                const groupInfo = await IMSDK.asyncApi(IMMethods.GetSpecifiedGroupsInfo, IMSDK.uuid(),
                    [groupID]
                );
                if (groupInfo?.data) {
                    const [uData] = groupInfo.data;
                    const { faceURL, groupName } = uData;
                    commit('SET_INCOMING_CALL_USER_INFO', { faceURL, nickname: groupName });
                    console.log('等待接听电话，群信息', { faceURL, nickname: groupName });
                }
            } else {
                // 单聊
                const { sendID } = message;
                const usersInfo = await IMSDK.asyncApi(IMMethods.GetUsersInfo, IMSDK.uuid(),
                    [sendID]
                );
                if (usersInfo?.data) {
                    const [uData] = usersInfo.data;
                    const { faceURL, nickname } = uData.publicInfo;
                    commit('SET_INCOMING_CALL_USER_INFO', { faceURL, nickname });
                    console.log('等待接听电话，对方用户信息', { faceURL, nickname });
                }
            }

            commit('SET_IS_INCOMING_CALL_MESSAGE', message);
            commit('SET_IS_INCOMING_CALL_LOADING', true);
            commit('SET_INCOMING_CALL_TOP', true);
            commit('SET_IS_ANSWER', true);
            commit('SET_CALL_TIME', +new Date());
        } catch (e) {
            console.log(e, '出现电话，等待接听，失败');
        }
    },

    // 缩小
    async onSmall ({
        commit
    }) {
        console.log('手动缩小操作');
        commit('SET_IS_INCOMING_CALL_SMALL', true);
    },

    // 挂断电话
    async onDangerCall ({ commit, state }) {
        if (state.isIncomingCallIng) {
            // 正在通话中，挂断代表已完成
            console.log('双方通话中，挂断电话', state.isIncomingCallSmall);
            commit('SET_IS_INCOMING_CALL_SMALL', true);
            commit('SET_IS_HANGUP', true);
            commit('SET_INCOMING_CALL_TOP', false);
            commit('SET_IS_INCOMING_CALL_ING', false);
            commit('SET_IS_INCOMING_CALL_LOADING', false);
            setTimeout(()=> {
                console.log('双方通话中，挂断电话，setTimeout（1000）');
                commit('SET_IS_INCOMING_CALL_SMALL', false);
                commit('SET_IS_HANGUP', false);
            }, 1000);
        } else {
            // 已取消、已拒绝
            commit('SET_IS_INCOMING_CALL_SMALL', false);
            commit('SET_INCOMING_CALL_TOP', false);
            commit('SET_IS_INCOMING_CALL_ING', false);
            commit('SET_IS_INCOMING_CALL_LOADING', false);
        }
    },

    // 接通电话
    async onSuccessCall ({ commit }) {
        console.log('onSuccessCall()双方接通电话');
        commit('SET_IS_INCOMING_CALL_SMALL', false);
        commit('SET_INCOMING_CALL_TOP', false);
        commit('SET_IS_INCOMING_CALL_ING', true);
        commit('SET_IS_INCOMING_CALL_LOADING', false);
        commit('SET_START_TIME', dayjs());
        commit('SET_CALL_TIME', +new Date());
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};

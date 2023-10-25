import conversation from './conversation';
import { requestAndroidPermission, judgeIosPermission, gotoAppPermissionSetting } from '@/util/permission.js';
import IMSDK, {
    IMMethods,
} from "openim-uniapp-polyfill";
import { AudioVideoType } from "@/enum";

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
    }, data) {
        try {
            console.log(data, '-----------1111111111111111');
            const customElem = JSON.parse(data.customElem.data);
            const callType = customElem?.type == AudioVideoType.Video ? AudioVideoType.Video : AudioVideoType.Audio;
            console.log('拨打电话类型是多少?', callType);
            commit('SET_CALL_TYPE', callType);
            commit('SET_IS_INCOMING_CALL_MESSAGE', data);
            commit('SET_IS_CALL_OR_ANSWER', true);
            commit('SET_IS_INCOMING_CALL_LOADING', true);
            commit('SET_CALL_CONVERSATIONID', conversation.state.currentConversation.conversationID);
            commit('SET_CALL_TIME', +new Date());
        } catch (e) {
            console.log(e, '拨打电话失败');
        }
    },

    // 出现电话，等待接听
    async appearLoadingCall ({
        commit
    }, message) {
        // {
        //     "seq": 37,
        //     "contentType": 101,
        //     "textElem": {
        //     "content": "12"
        // },
        //     "status": 2,
        //     "msgFrom": 100,
        //     "sessionType": 1,
        //     "sendTime": 1698207224598,
        //     "clientMsgID": "3e6d1485875070f27c0d731e60791cec",
        //     "attachedInfoElem": {
        //     "isEncryption": false,
        //         "inEncryptStatus": false,
        //         "isPrivateChat": false,
        //         "groupHasReadInfo": {
        //         "hasReadCount": 0,
        //             "groupMemberCount": 0
        //     },
        //     "hasReadTime": 0,
        //         "burnDuration": 0,
        //         "notSenderNotificationPush": false
        // },
        //     "senderPlatformID": 3,
        //     "serverMsgID": "99b237bf72b4149c0f68cb49680f0365",
        //     "createTime": 1698207224598,
        //     "isRead": false,
        //     "attachedInfo": "null",
        //     "sendID": "2419517825",
        //     "recvID": "3426910008",
        //     "senderNickname": "半秋半冬"
        // }
        try {
            const { sendID } = message;
            const usersInfo = await IMSDK.asyncApi(IMMethods.GetUsersInfo, IMSDK.uuid(),
                [sendID]
            );
            if (usersInfo?.data) {
                // eslint-disable-next-line no-unsafe-optional-chaining
                const { faceURL, nickname } = usersInfo?.data[0]?.friendInfo;
                commit('SET_INCOMING_CALL_USER_INFO', { faceURL, nickname });
            }

            commit('SET_CALL_TYPE', message.callType);
            commit('SET_IS_INCOMING_CALL_MESSAGE', message);
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

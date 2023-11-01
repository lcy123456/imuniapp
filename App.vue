<script>
import { mapGetters, mapActions } from "vuex";
import IMSDK, {
    IMMethods,
    MessageType,
    SessionType,
    MessageReceiveOptType
} from "openim-uniapp-polyfill";
import { idsGetConversationID } from '@/util/imCommon';
import { AudioVideoType, AudioVideoStatus } from '@/enum';
import config from "./common/config";
import { getDbDir, toastWithCallback } from "@/util/common.js";
import { IMLogin, conversationSort } from "@/util/imCommon";
import { PageEvents, UpdateMessageTypes, AudioVideoRenderTypes } from "@/constant";
import { videoGetToken } from '@/api/incoming';

// const customStatusTextMap = {
//     [AudioVideoStatus.Done]: '通话结束',
//     [AudioVideoStatus.Cancel]: '对方已取消',
//     [AudioVideoStatus.Reject]: '对方已拒绝',
//     [AudioVideoStatus.NotAnswered]: '对方未应答',
//     [AudioVideoStatus.Busy]: '对方忙线中'
// };
export default {
    onLaunch: function () {
        this.$store.dispatch("user/getAppConfig");
        this.setGlobalIMlistener();
        this.tryLogin();
        this.handleAudioManager();
        this.handleUniPush();
        uni.preloadPage({url: "/pages/conversation/webrtc/index"});
    },
    onShow: function () {
        plus.runtime.setBadgeNumber(0);
        IMSDK.asyncApi(IMSDK.IMMethods.SetAppBackgroundStatus, IMSDK.uuid(), false);
    },
    onHide: function () {
        IMSDK.asyncApi(IMSDK.IMMethods.SetAppBackgroundStatus, IMSDK.uuid(), true);
    },
    data () {
        return {
            innerAudioContext: null
        };
    },
    computed: {
        ...mapGetters([
            "storeIMUserID",
            "storeIMToken",
            "storeConversationList",
            "storeCurrentConversation",
            "storeCurrentUserID",
            "storeSelfInfo",
            "storeRecvFriendApplications",
            "storeRecvGroupApplications",
            "storeHistoryMessageList",
            "storeIsSyncing",
            "storeHasMoreAfterMessage",
            "storeIsShowSetEnd",
            "conversationUnread",
            "storeUserID",
            "storeIsIncomingCallIng",
            "storeIsIncomingCallLoading",
            "storeIncomingCallMessage"
        ]),
        contactBadgeRely () {
            return {
                recvFriendApplications: this.storeRecvFriendApplications,
                recvGroupApplications: this.storeRecvGroupApplications,
                userKey: this.storeCurrentUserID,
            };
        },
    },
    watch: {
        contactBadgeRely: {
            handler (newValue) {
                const { recvFriendApplications, recvGroupApplications, userKey } = newValue;
                if (!userKey) return;
                let unHandleFriendApplicationNum = recvFriendApplications.filter(
                    (application) => application.handleResult === 0
                ).length;
                let unHandleGroupApplicationNum = recvGroupApplications.filter(
                    (application) => application.handleResult === 0
                ).length;
                const total = unHandleFriendApplicationNum + unHandleGroupApplicationNum;
                if (total) {
                    uni.setTabBarBadge({
                        index: 1,
                        text: total < 99 ? total + "" : "99+",
                    });
                } else {
                    uni.removeTabBarBadge({
                        index: 1,
                    });
                }
                this.$store.commit(
                    "contact/SET_UNHANDLE_FRIEND_APPLICATION_NUM",
                    unHandleFriendApplicationNum
                );
                this.$store.commit(
                    "contact/SET_UNHANDLE_GROUP_APPLICATION_NUM",
                    unHandleGroupApplicationNum
                );
            },
            deep: true,
        },
    },
    methods: {
        ...mapActions("message", ["pushNewMessage", "updateOneMessage"]),
        ...mapActions("conversation", ["updateCurrentMemberInGroup"]),
        ...mapActions("contact", [
            "updateFriendInfo",
            "pushNewFriend",
            "updateBlackInfo",
            "pushNewBlack",
            "pushNewGroup",
            "updateGroupInfo",
            "pushNewRecvFriendApplition",
            "updateRecvFriendApplition",
            "pushNewSentFriendApplition",
            "updateSentFriendApplition",
            "pushNewRecvGroupApplition",
            "updateRecvGroupApplition",
            "pushNewSentGroupApplition",
            "updateSentGroupApplition",
        ]),
        ...mapActions('incomingCall', ['appearLoadingCall']),
      
        setGlobalIMlistener () {
            console.log("setGlobalIMlistener");
            // init
            const kickHander = (message) => {
                toastWithCallback(message, () => {
                    this.$store.commit('user/SET_AUTH_DATA', {});
                    // Igexin.unbindAlias(this.storeCurrentUserID)
                    uni.reLaunch({
                        url: "/pages/login/index"
                    });
                });
            };
            IMSDK.subscribe(IMSDK.IMEvents.OnConnectFailed, ({ errCode }) => {
                console.log(errCode);
            });
            IMSDK.subscribe(IMSDK.IMEvents.OnConnecting, (data) => {
                console.log(data);
            });
            IMSDK.subscribe(IMSDK.IMEvents.OnConnectSuccess, (data) => {
                console.log(data);
            });
            IMSDK.subscribe(IMSDK.IMEvents.OnKickedOffline, () => {
                kickHander("您的账号在其他设备登录，请重新登陆！");
            });
            IMSDK.subscribe(IMSDK.IMEvents.OnUserTokenExpired, () => {
                kickHander("您的登录已过期，请重新登陆！");
            });
            

            // sync
            const syncStartHandler = () => {
                // uni.showLoading({
                //     title: "同步中",
                //     mask: true,
                // });
                this.$store.commit("user/SET_IS_SYNCING", true);
            };
            const syncFinishHandler = () => {
                // uni.hideLoading();
                this.$store.dispatch("conversation/getConversationList");
                this.$store.dispatch("conversation/getUnReadCount");
                this.$store.commit("user/SET_IS_SYNCING", false);
            };
            const syncFailedHandler = () => {
                // uni.hideLoading();
                uni.$u.toast("同步消息失败");
                this.$store.dispatch("conversation/getConversationList");
                this.$store.dispatch("conversation/getUnReadCount");
                this.$store.commit("user/SET_IS_SYNCING", false);
            };
            IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerStart, syncStartHandler);
            IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerFinish, syncFinishHandler);
            IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerFailed, syncFailedHandler);

            // self
            const selfInfoUpdateHandler = ({ data }) => {
                this.$store.commit("user/SET_SELF_INFO", {
                    ...this.storeSelfInfo,
                    ...data,
                });
            };

            IMSDK.subscribe(IMSDK.IMEvents.OnSelfInfoUpdated, selfInfoUpdateHandler);

            // message
            const newMessagesHandler = ({ data }) => {
                console.log('收到新的消息', data);
                if (this.storeIsSyncing) {
                    return;
                }
                const conversationID = data && data[0] ? idsGetConversationID(data[0]) : '';
                let isMute = false;
                this.storeConversationList.forEach(conversation => {
                    if (conversation.conversationID === conversationID && conversation.recvMsgOpt !== MessageReceiveOptType.Nomal) {
                        isMute = true;
                    }
                });
                console.log(this.storeConversationList, conversationID);
                if (!this.storeIsIncomingCallLoading && !this.storeIsIncomingCallIng && !isMute) {
                    this.innerAudioContext.play();
                }
                data.forEach(this.handleNewMessage);
            };
            const c2cReadReceiptHandler = ({ data: receiptList }) => {
                if (receiptList[0].userID !== this.storeCurrentConversation.userID) {
                    return;
                }

                receiptList.forEach((item) => {
                    item.msgIDList && item.msgIDList.forEach((msgID) => {
                        this.updateOneMessage({
                            message: {
                                clientMsgID: msgID,
                            },
                            type: UpdateMessageTypes.KeyWords,
                            keyWords: {
                                key: "isRead",
                                value: true,
                            },
                        });
                    });
                });
            };
            const groupReadReceiptHandler = ({ data: receiptList }) => {
                console.log('receiptList------', receiptList);
                receiptList.forEach((item) => {
                    item.msgIDList && item.msgIDList.forEach((msgID) => {
                        this.updateOneMessage({
                            message: {
                                clientMsgID: msgID,
                            },
                            type: UpdateMessageTypes.KeyWords,
                            keyWords: [{
                                key: "isRead",
                                value: true,
                            }],
                        });
                    });
                });
            };
            const newRecvMessageRevokedHandler = ({ data: revokedMessage }) => {
                // if (!this.storeCurrentConversation.conversationID) {
                //     return;
                // }

                this.updateOneMessage({
                    message: revokedMessage,
                    type: UpdateMessageTypes.KeyWords,
                    keyWords: [
                        {
                            key: "contentType",
                            value: MessageType.RevokeMessage,
                        },
                        {
                            key: "notificationElem",
                            value: {
                                detail: JSON.stringify(revokedMessage),
                            },
                        },
                    ],
                });
            };
            IMSDK.subscribe(IMSDK.IMEvents.OnRecvNewMessages, newMessagesHandler);
            IMSDK.subscribe(
                IMSDK.IMEvents.OnRecvC2CReadReceipt,
                c2cReadReceiptHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnRecvGroupReadReceipt,
                groupReadReceiptHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnNewRecvMessageRevoked,
                newRecvMessageRevokedHandler
            );

            // friend
            const friendInfoChangeHandler = ({ data }) => {
                console.log(data);
                this.updateFriendInfo({
                    friendInfo: data,
                });
            };
            const friendAddedHandler = ({ data }) => {
                this.pushNewFriend(data);
            };
            const friendDeletedHander = ({ data }) => {
                this.updateFriendInfo({
                    friendInfo: data,
                    isRemove: true,
                });
            };

            IMSDK.subscribe(
                IMSDK.IMEvents.OnFriendInfoChanged,
                friendInfoChangeHandler
            );
            IMSDK.subscribe(IMSDK.IMEvents.OnFriendAdded, friendAddedHandler);
            IMSDK.subscribe(IMSDK.IMEvents.OnFriendDeleted, friendDeletedHander);

            // blacklist
            const blackAddedHandler = ({ data }) => {
                this.pushNewBlack(data);
            };
            const blackDeletedHandler = ({ data }) => {
                this.updateBlackInfo({
                    blackInfo: data,
                    isRemove: true,
                });
            };

            IMSDK.subscribe(IMSDK.IMEvents.OnBlackAdded, blackAddedHandler);
            IMSDK.subscribe(IMSDK.IMEvents.OnBlackDeleted, blackDeletedHandler);

            // group
            const joinedGroupAddedHandler = ({ data }) => {
                this.pushNewGroup(data);
            };
            const joinedGroupDeletedHandler = ({ data }) => {
                this.updateGroupInfo({
                    groupInfo: data,
                    isRemove: true,
                });
            };
            const groupInfoChangedHandler = ({ data }) => {
                this.updateGroupInfo({
                    groupInfo: data,
                });
            };
            const groupMemberInfoChangedHandler = ({ data }) => {
                this.updateCurrentMemberInGroup(data);
            };

            IMSDK.subscribe(
                IMSDK.IMEvents.OnJoinedGroupAdded,
                joinedGroupAddedHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnJoinedGroupDeleted,
                joinedGroupDeletedHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnGroupInfoChanged,
                groupInfoChangedHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnGroupMemberInfoChanged,
                groupMemberInfoChangedHandler
            );

            // application
            const friendApplicationNumHandler = ({ data }) => {
                const isRecv = data.toUserID === this.storeCurrentUserID;
                if (isRecv) {
                    this.pushNewRecvFriendApplition(data);
                } else {
                    this.pushNewSentFriendApplition(data);
                }
            };
            const friendApplicationAccessHandler = ({ data }) => {
                const isRecv = data.toUserID === this.storeCurrentUserID;
                if (isRecv) {
                    this.updateRecvFriendApplition({
                        application: data,
                    });
                } else {
                    this.updateSentFriendApplition({
                        application: data,
                    });
                }
            };
            const groupApplicationNumHandler = ({ data }) => {
                const isRecv = data.userID !== this.storeCurrentUserID;
                if (isRecv) {
                    this.pushNewRecvGroupApplition(data);
                } else {
                    this.pushNewSentGroupApplition(data);
                }
            };
            const groupApplicationAccessHandler = ({ data }) => {
                const isRecv = data.userID !== this.storeCurrentUserID;
                if (isRecv) {
                    this.updateRecvGroupApplition({
                        application: data,
                    });
                } else {
                    this.updateSentGroupApplition({
                        application: data,
                    });
                }
            };

            IMSDK.subscribe(
                IMSDK.IMEvents.OnFriendApplicationAdded,
                friendApplicationNumHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnFriendApplicationAccepted,
                friendApplicationAccessHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnFriendApplicationRejected,
                friendApplicationAccessHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnGroupApplicationAdded,
                groupApplicationNumHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnGroupApplicationAccepted,
                groupApplicationAccessHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnGroupApplicationRejected,
                groupApplicationAccessHandler
            );

            // conversation
            const totalUnreadCountChangedHandler = ({ data }) => {
                if (this.storeIsSyncing) {
                    return;
                }
                this.$store.commit("conversation/SET_UNREAD_COUNT", data);
            };
            const newConversationHandler = ({ data }) => {
                if (this.storeIsSyncing) {
                    return;
                }
                const result = [...data, ...this.storeConversationList];
                this.$store.commit(
                    "conversation/SET_CONVERSATION_LIST",
                    conversationSort(result)
                );
            };
            const conversationChangedHandler = ({ data }) => {
                if (this.storeIsSyncing) {
                    return;
                }
                let filterArr = [];
                const chids = data.map((ch) => ch.conversationID);
                filterArr = this.storeConversationList.filter(
                    (tc) => !chids.includes(tc.conversationID)
                );
                const idx = data.findIndex(
                    (c) =>
                        c.conversationID === this.storeCurrentConversation.conversationID
                );
                if (idx !== -1) {
                    this.$store.commit(
                        "conversation/SET_CURRENT_CONVERSATION",
                        data[idx]
                    );
                }
                    
                const result = [...data, ...filterArr];
                this.$store.commit(
                    "conversation/SET_CONVERSATION_LIST",
                    conversationSort(result)
                );
            };

            IMSDK.subscribe(
                IMSDK.IMEvents.OnTotalUnreadMessageCountChanged,
                totalUnreadCountChangedHandler
            );
            IMSDK.subscribe(IMSDK.IMEvents.OnNewConversation, newConversationHandler);
            IMSDK.subscribe(
                IMSDK.IMEvents.OnConversationChanged,
                conversationChangedHandler
            );
        },

        async tryLogin () {
            try {
                const path = await getDbDir();
                const flag = await IMSDK.asyncApi(IMMethods.InitSDK, IMSDK.uuid(), {
                    platformID: uni.$u.os() === "ios" ? 1 : 2, // 平台，参照IMPlatform类,
                    apiAddr: config.getApiUrl(), // SDK的API接口地址。如：http://xxx:10002
                    wsAddr: config.getWsUrl(), // SDK的websocket地址。如： ws://xxx:10001
                    dataDir: path, // 数据存储路径
                    logLevel: 6,
                    logFilePath: path,
                    isLogStandardOutput: true,
                });
                if (!flag) {
                    uni.$u.toast("初始化IMSDK失败！");
                    return new Error('初始化IMSDK失败！');
                }
                await IMLogin();
            } catch (err) {
                console.log(err);
                plus.navigator.closeSplashscreen();
                // uni.$u.route('/pages/login/index');
            }
        },
        isAudioVideoSend (message) {
            const customElemData = message.customElem?.data;
            let data = {};
            try {
                data = JSON.parse(customElemData);
            } catch (err) {
                return false;
            }
            return AudioVideoRenderTypes.includes(message.contentType)
                && data.type
                && [AudioVideoType.Video, AudioVideoType.Audio].includes(data.type)
                && data.status;
        },

        async handleNewMessage (newServerMsg) {
            if (this.inCurrentConversation(newServerMsg)) {
                if (![MessageType.TypingMessage, MessageType.RevokeMessage].includes(newServerMsg.contentType)) {
                    if (this.storeHasMoreAfterMessage) {
                        console.log('当前数据不在底端，不做数据推送');
                        let conversationUnread = this.conversationUnread + 1;
                        this.$store.commit('conversation/SET_CONVERSATION_UNREAD', conversationUnread);
                        return;
                    }
                    if (this.storeIsShowSetEnd) {
                        // 置底图标显示不滚动到底
                        let conversationUnread = this.conversationUnread + 1;
                        this.$store.commit('conversation/SET_CONVERSATION_UNREAD', conversationUnread);
                    }
                    this.pushNewMessage(newServerMsg);
                    uni.$u.debounce(this.markConversationAsRead, 2000);
                    if (this.storeIsShowSetEnd) return;
                    setTimeout(() => uni.$emit(PageEvents.ScrollToBottom, {isRecv: true}));
                }
            }
            const customStatus = this.isAudioVideoSend(newServerMsg);
            if (newServerMsg.contentType === AudioVideoStatus.groupDone) {
                try {
                    const data = JSON.parse(newServerMsg.notificationElem.detail);
                    if (idsGetConversationID(newServerMsg) !== idsGetConversationID(this.storeIncomingCallMessage)) return;
                    uni.$emit('incoming_message_callback', {
                        ...newServerMsg,
                        customStatus: data.status
                    });
                    // uni.$u.toast(customStatusTextMap[data.status]);
                } catch (err) {
                    return false;
                }
            }
            if (customStatus) {
                if ([AudioVideoStatus.Send].includes(customStatus)) {
                    console.log(newServerMsg, 'newServerMsgnewServerMsg');
                    if (newServerMsg.sendID === this.storeUserID) return;
                    if (this.storeIsIncomingCallLoading || this.storeIsIncomingCallIng) {
                        // uni.$u.toast('占线占线');
                        return false;
                    }
                    try {
                        const { token } = await videoGetToken({
                            recvID: this.storeUserID,
                            conversationID: idsGetConversationID(newServerMsg)
                        });
                        this.$store.commit('incomingCall/SET_INCOMING_CALL_TOKEN', token);
                        console.log(token);
                        this.appearLoadingCall(newServerMsg);
                    } catch (err) {
                        console.log(err);
                        // uni.$u.toast('聊天已过期');
                        return false;
                    }
                } else if (
                    [
                        AudioVideoStatus.Done,
                        AudioVideoStatus.Cancel,
                        AudioVideoStatus.Reject,
                        AudioVideoStatus.NotAnswered,
                        // AudioVideoStatus.Busy
                    ].includes(customStatus)
                ) {
                    if (idsGetConversationID(newServerMsg) !== idsGetConversationID(this.storeIncomingCallMessage)) return;
                    uni.$emit('incoming_message_callback', {
                        ...newServerMsg,
                        customStatus
                    });
                    // uni.$u.toast(customStatusTextMap[customStatus]);
                }
            }
        },
        inCurrentConversation (newServerMsg) {
            switch (newServerMsg.sessionType) {
            case SessionType.Single:
                return (
                    newServerMsg.sendID === this.storeCurrentConversation.userID ||
            (newServerMsg.sendID === this.storeCurrentUserID &&
              newServerMsg.recvID === this.storeCurrentConversation.userID)
                );
            case SessionType.WorkingGroup:
                return newServerMsg.groupID === this.storeCurrentConversation.groupID;
            case SessionType.Notification:
                return newServerMsg.sendID === this.storeCurrentConversation.userID;
            default:
                return false;
            }
        },
        markConversationAsRead () {
            IMSDK.asyncApi(
                IMSDK.IMMethods.MarkConversationMessageAsRead,
                IMSDK.uuid(),
                this.storeCurrentConversation.conversationID
            );
        },
        handleAudioManager () {
            this.innerAudioContext = uni.createInnerAudioContext();
            this.innerAudioContext.src = '/static/audio/message_tip.mp3';
        },
        handleUniPush () {
            setTimeout(() => {
                plus.push.getClientInfoAsync((info) => {
                    const cid = info["clientid"];
                    console.log('clientid', cid, info);
                    this.$store.commit('user/SET_CLIENT_ID', cid);
                });
            }, 3000);
            plus.push.addEventListener('click', this._handlePush);  
        },
        _handlePush (message) {
            let payload = message.payload || {};
            console.log('push', JSON.stringify(payload));
            if (!payload.conversationID) return;
            uni.$emit(PageEvents.ClickPushMessage, payload.conversationID);
        }
    },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/uni_modules/uview-ui/index.scss";
@import "@/styles/base.scss";
@import "@/styles/login.scss";
@import "@/styles/global.scss";
@import "@/styles/pages.scss";
/* #ifndef APP-NVUE */
@import 'animate.css';
/* #endif */
</style>

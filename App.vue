<script>
import { mapGetters, mapActions } from 'vuex';
import IMSDK, {
    IMMethods,
    MessageType,
    SessionType,
    MessageReceiveOptType,
    GroupAtType
} from 'openim-uniapp-polyfill';
import {
    idsGetConversationID,
    isEdit,
    isLike,
    formatFileUrl
} from '@/util/imCommon';
import fCheckVersion from '@/util/fCheckVersion';
import { AudioVideoType, AudioVideoStatus } from '@/enum';
import config from './common/config';
import { getDbDir, toastWithCallback } from '@/util/common.js';
import { IMLogin, conversationSort } from '@/util/imCommon';
import {
    PageEvents,
    UpdateMessageTypes,
    AudioVideoRenderTypes
} from '@/constant';
import { videoGetToken } from '@/api/incoming';
import { thirdConfig } from '@/api/';
import { bindCid } from '@/api/index';

export default {
    onLaunch() {
        this.$store.dispatch('user/getAppConfig');
        this.thirdConfig();
        this.setGlobalIMlistener();
        this.tryLogin();
        this.handleAudioManager();
        this.handleUniPush();
        uni.$on('toast', message => {
            uni.$u.toast(message);
        });
        uni.$on('play_audio', this.handlePlayAudio);
        uni.$on('stop_audio', this.handleStopAudio);
        uni.$on('setMediaList', this.setMediaList);
        this.timer = setInterval(() => {
            if (!this.$store.getters.storeIMToken) return;
            this.getUnreadMsgCount();
        }, 2000);
        this.setQuit();
        fCheckVersion();
        uni.preloadPage({ url: '/pages/conversation/webrtc/index' });
        this.initBackgroundTaskModule();
    },
    async onShow() {
        this.num++;
        this.isHide = false;
        this.isOnLaunch = false;
        this.stopPlayAudio();
        IMSDK.asyncApi(
            IMSDK.IMMethods.SetAppBackgroundStatus,
            IMSDK.uuid(),
            false
        );
        uni.$emit('app_show');
    },
    onHide() {
        this.isHide = true;
        this.reloadTime = 0;
        this.startPlayAudioWithFile();
        IMSDK.asyncApi(
            IMSDK.IMMethods.SetAppBackgroundStatus,
            IMSDK.uuid(),
            true
        );
    },
    data() {
        return {
            num: 0,
            isInitSDK: false,
            isHide: true,
            payload: false,
            innerAudioContext: null,
            isOnLaunch: false
        };
    },
    computed: {
        ...mapGetters([
            'storeIMUserID',
            'storeIMToken',
            'storeConversationList',
            'storeCurrentConversation',
            'storeCurrentUserID',
            'storeSelfInfo',
            'storeRecvFriendApplications',
            'storeRecvGroupApplications',
            'storeHistoryMessageList',
            'storeIsSyncing',
            'storeHasMoreAfterMessage',
            'storeIsShowSetEnd',
            'conversationUnread',
            'storeUserID',
            'storeIsIncomingCallIng',
            'storeIsIncomingCallLoading',
            'storeIncomingCallMessage',
            'storeIsLoginStatus',
            'storeCurrentConversationID'
        ]),
        contactBadgeRely() {
            return {
                recvFriendApplications: this.storeRecvFriendApplications,
                recvGroupApplications: this.storeRecvGroupApplications,
                userKey: this.storeCurrentUserID
            };
        }
    },
    watch: {
        contactBadgeRely: {
            handler(newValue) {
                const {
                    recvFriendApplications,
                    recvGroupApplications,
                    userKey
                } = newValue;
                if (!userKey) return;
                let unHandleFriendApplicationNum =
                    recvFriendApplications.filter(
                        application => application.handleResult === 0
                    ).length;
                let unHandleGroupApplicationNum = recvGroupApplications.filter(
                    application => application.handleResult === 0
                ).length;
                const total =
                    unHandleFriendApplicationNum + unHandleGroupApplicationNum;
                if (total) {
                    uni.setTabBarBadge({
                        index: 1,
                        text: total < 99 ? total + '' : '99+'
                    });
                } else {
                    uni.removeTabBarBadge({
                        index: 1
                    });
                }
                plus.runtime.setBadgeNumber(total || 0);
                this.$store.commit(
                    'contact/SET_UNHANDLE_FRIEND_APPLICATION_NUM',
                    unHandleFriendApplicationNum
                );
                this.$store.commit(
                    'contact/SET_UNHANDLE_GROUP_APPLICATION_NUM',
                    unHandleGroupApplicationNum
                );
            },
            deep: true
        }
    },
    methods: {
        ...mapActions('message', [
            'pushNewMessage',
            'updateOneMessage',
            'deleteMessages'
        ]),
        ...mapActions('conversation', ['updateCurrentMemberInGroup']),
        ...mapActions('contact', [
            'updateFriendInfo',
            'pushNewFriend',
            'updateBlackInfo',
            'pushNewBlack',
            'pushNewGroup',
            'updateGroupInfo',
            'pushNewRecvFriendApplition',
            'updateRecvFriendApplition',
            'pushNewSentFriendApplition',
            'updateSentFriendApplition',
            'pushNewRecvGroupApplition',
            'updateRecvGroupApplition',
            'pushNewSentGroupApplition',
            'updateSentGroupApplition'
        ]),
        ...mapActions('incomingCall', ['appearLoadingCall']),
        initBackgroundTaskModule() {
            if (uni.$u.os() !== 'ios') return;
            this.bgKeepAlive = uni.requireNativePlugin(
                'DCTestUniPlugin-backgroundTaskModule'
            );
            this.bgKeepAlive.playStopBack(() => {
                this.bgKeepAlive.exitApp();
            });
        },
        startPlayAudioWithFile() {
            if (uni.$u.os() !== 'ios') return;
            this.bgKeepAlive.startPlayAudioWithFile(
                plus.io.convertLocalFileSystemURL('/static/audio/nono.m4a')
            );
            this.restartTime = 0;
            this.timer3 = setInterval(() => {
                this.restartTime++;
                if (this.bgKeepAlive.getBackgroundTime() <= 20) {
                    this.bgKeepAlive.exitApp();
                }
            }, 1000);
        },
        stopPlayAudio() {
            if (uni.$u.os() !== 'ios') return;
            clearInterval(this.timer3);
            this.bgKeepAlive.stopPlayAudio();
        },
        setQuit() {
            if (uni.$u.os() !== 'ios') {
                const main = plus?.android?.runtimeMainActivity();
                //为了防止快速点按返回键导致程序退出重写quit方法改为隐藏至后台
                plus.runtime.quit = function () {
                    main && main.moveTaskToBack(false);
                };
                //重写toast方法如果内容为 ‘再按一次退出应用’ 就隐藏应用，其他正常toast
                plus.nativeUI.toast = function (str) {
                    if (str === '再按一次退出应用') {
                        main && main.moveTaskToBack(false);
                        return false;
                    } else {
                        uni.showToast({
                            title: str,
                            icon: 'none'
                        });
                    }
                };
            }
        },

        setGlobalIMlistener() {
            // init
            const kickHander = message => {
                toastWithCallback(message, () => {
                    this.$store.commit('user/SET_AUTH_DATA', {});
                    // Igexin.unbindAlias(this.storeCurrentUserID)
                    uni.reLaunch({
                        url: '/pages/login/index'
                    });
                });
            };
            IMSDK.subscribe(IMSDK.IMEvents.OnConnectFailed, ({ errCode }) => {
                console.log(errCode);
                this.$store.commit(
                    'base/SET_CONNECTING_STATUS',
                    '网络异常，请检查网络'
                );
            });
            IMSDK.subscribe(IMSDK.IMEvents.OnConnecting, data => {
                console.log(data);
                this.$store.commit('base/SET_CONNECTING_STATUS', '连接中...');
            });
            IMSDK.subscribe(IMSDK.IMEvents.OnConnectSuccess, data => {
                console.log(data);
                this.$store.commit('base/SET_CONNECTING_STATUS', '');
            });
            IMSDK.subscribe(IMSDK.IMEvents.OnKickedOffline, () => {
                kickHander('您的账号在其他设备登录，请重新登陆！');
            });
            IMSDK.subscribe(IMSDK.IMEvents.OnUserTokenExpired, () => {
                kickHander('您的登录已过期，请重新登陆！');
            });

            // sync
            const syncStartHandler = () => {
                // uni.showLoading({
                //     title: "同步中",
                //     mask: true,
                // });
                // uni.$u.toast('同步');
                console.log('同步开始');
                this.$store.commit('user/SET_IS_SYNCING', true);
            };
            const done = () => {
                this.$store.commit('user/SET_IS_SYNCING', false);
                // const time = uni.getStorageSync('time');
                // if (time && +new Date() - time <= 5 * 1000) return;
                // uni.setStorageSync('time', +new Date());
                // uni.hideLoading();
                this.$store.dispatch('conversation/getConversationList');
                this.$store.dispatch('conversation/getUnReadCount');

                uni.$emit(
                    PageEvents.ClickPushMessage,
                    this.payload.conversationID
                );
                uni.$emit('reloadMore');
                this.payload = false;
            };
            const syncFinishHandler = () => {
                console.log('同步完成');
                done();
            };
            const syncFailedHandler = () => {
                uni.$u.toast('同步消息失败');
                done();
            };
            IMSDK.subscribe(IMSDK.IMEvents.OnSyncServerStart, syncStartHandler);
            IMSDK.subscribe(
                IMSDK.IMEvents.OnSyncServerFinish,
                syncFinishHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnSyncServerFailed,
                syncFailedHandler
            );

            // self
            const selfInfoUpdateHandler = ({ data }) => {
                this.$store.commit('user/SET_SELF_INFO', {
                    ...this.storeSelfInfo,
                    ...data
                });
            };

            IMSDK.subscribe(
                IMSDK.IMEvents.OnSelfInfoUpdated,
                selfInfoUpdateHandler
            );

            // message
            const newMessagesHandler = ({ data }) => {
                // console.log('收到新的消息', data);
                if (this.storeIsSyncing) {
                    return;
                }
                const d = data[0] || {};
                const isMyMessage = d.sendID === this.storeUserID;
                const conversationID =
                    data && data[0] ? idsGetConversationID(data[0]) : '';
                let isMute = false;
                this.storeConversationList.forEach(conversation => {
                    if (
                        conversation.conversationID === conversationID &&
                        conversation.recvMsgOpt !==
                            MessageReceiveOptType.Nomal &&
                        conversation.groupAtType === GroupAtType.AtNormal
                    ) {
                        isMute = true;
                    }
                });
                if (
                    this.storeSelfInfo.globalRecvMsgOpt ===
                        MessageReceiveOptType.Nomal &&
                    !this.storeIsIncomingCallLoading &&
                    !this.storeIsIncomingCallIng &&
                    !isMute &&
                    !isMyMessage &&
                    !data[0]?.typingElem?.msgTips
                ) {
                    if (
                        !this.innerAudioContext ||
                        this.innerAudioContext.isPaused()
                    ) {
                        const tip =
                            uni.getStorageSync('voice') ||
                            `/static/audio/voice1.mp3`;
                        this.handlePlayAudio(tip, 'ambient');
                    }
                }
                data.forEach(this.handleNewMessage);
            };
            const c2cReadReceiptHandler = ({ data: receiptList }) => {
                if (
                    receiptList[0].userID !==
                    this.storeCurrentConversation.userID
                ) {
                    return;
                }

                receiptList.forEach(item => {
                    item.msgIDList &&
                        item.msgIDList.forEach(msgID => {
                            this.updateOneMessage({
                                message: {
                                    clientMsgID: msgID
                                },
                                type: UpdateMessageTypes.KeyWords,
                                keyWords: {
                                    key: 'isRead',
                                    value: true
                                }
                            });
                        });
                });
            };
            const groupReadReceiptHandler = ({ data: receiptList }) => {
                // console.log('receiptList----receiptList收到群聊', receiptList);
                receiptList.forEach(item => {
                    item.msgIDList &&
                        item.msgIDList.forEach(msgID => {
                            this.updateOneMessage({
                                message: {
                                    clientMsgID: msgID
                                },
                                type: UpdateMessageTypes.KeyWords,
                                keyWords: [
                                    {
                                        key: 'isRead',
                                        value: true
                                    }
                                ]
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
                            key: 'contentType',
                            value: MessageType.RevokeMessage
                        },
                        {
                            key: 'notificationElem',
                            value: {
                                detail: JSON.stringify(revokedMessage)
                            }
                        }
                    ]
                });
            };

            const customBusinessMessageHandler = ({ data }) => {
                // console.log(
                //     'customBusinessMessageHandler--customBusinessMessageHandler',
                //     data
                // );
                const { key } = data;
                let inviteOrKickMap = {};
                if (['video_invite', 'video_kick'].includes(key)) {
                    const res = JSON.parse(data.data);
                    inviteOrKickMap = {
                        contentType: 110,
                        customElem: {
                            data: JSON.stringify({
                                type: res.type,
                                status: 1650
                            })
                        },
                        groupID: res.roomName.split('_')[1],
                        recvID: '',
                        sessionType: 3,
                        type: res.type === 130 ? 'audio' : 'video'
                    };
                }
                switch (key) {
                    case 'video_invite':
                        this.appearCall(inviteOrKickMap);
                        break;
                    case 'video_kick':
                        this.callOut(inviteOrKickMap, 1655);
                        setTimeout(() => {
                            uni.$u.toast('你被移除群聊');
                        }, 1000);
                        break;
                    case 'modify':
                        try {
                            const message = JSON.parse(data.data);
                            this.updateOneMessage({
                                message: {
                                    ...message
                                }
                            });
                        } catch (err) {
                            console.log(err);
                        }
                        break;
                    case 'hasReadMSG':
                        try {
                            const receiptList = JSON.parse(data.data);
                            groupReadReceiptHandler({ data: receiptList });
                        } catch (err) {
                            console.log(err);
                        }
                        break;
                    case 'reload':
                        plus.runtime.restart();
                        break;
                }
            };
            IMSDK.subscribe(
                IMSDK.IMEvents.OnRecvCustomBusinessMessage,
                customBusinessMessageHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnRecvNewMessages,
                newMessagesHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnRecvC2CReadReceipt,
                c2cReadReceiptHandler
            );
            // IMSDK.subscribe(
            //     IMSDK.IMEvents.OnRecvGroupReadReceipt,
            //     groupReadReceiptHandler
            // );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnNewRecvMessageRevoked,
                newRecvMessageRevokedHandler
            );

            // friend
            const friendInfoChangeHandler = ({ data }) => {
                // console.log(data);
                this.updateFriendInfo({
                    friendInfo: data
                });
            };
            const friendAddedHandler = ({ data }) => {
                this.pushNewFriend(data);
            };
            const friendDeletedHander = ({ data }) => {
                this.updateFriendInfo({
                    friendInfo: data,
                    isRemove: true
                });
            };

            IMSDK.subscribe(
                IMSDK.IMEvents.OnFriendInfoChanged,
                friendInfoChangeHandler
            );
            IMSDK.subscribe(IMSDK.IMEvents.OnFriendAdded, friendAddedHandler);
            IMSDK.subscribe(
                IMSDK.IMEvents.OnFriendDeleted,
                friendDeletedHander
            );

            // blacklist
            const blackAddedHandler = ({ data }) => {
                this.pushNewBlack(data);
            };
            const blackDeletedHandler = ({ data }) => {
                this.updateBlackInfo({
                    blackInfo: data,
                    isRemove: true
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
                    isRemove: true
                });
            };
            const groupInfoChangedHandler = ({ data }) => {
                this.updateGroupInfo({
                    groupInfo: data
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
                        application: data
                    });
                } else {
                    this.updateSentFriendApplition({
                        application: data
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
                        application: data
                    });
                } else {
                    this.updateSentGroupApplition({
                        application: data
                    });
                }
            };

            const msgDeletedHandller = ({ data }) => {
                // console.log('OnMsgDeleted------OnMsgDeleted', data);
                this.deleteMessages([data]);
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
            IMSDK.subscribe(IMSDK.IMEvents.OnMsgDeleted, msgDeletedHandller);

            // conversation
            const totalUnreadCountChangedHandler = ({ data }) => {
                if (this.storeIsSyncing) {
                    return;
                }
                this.$store.commit('conversation/SET_UNREAD_COUNT', data);
            };
            const newConversationHandler = ({ data }) => {
                if (this.storeIsSyncing) {
                    return;
                }
                const result = [...data, ...this.storeConversationList];
                this.$store.commit(
                    'conversation/SET_CONVERSATION_LIST',
                    conversationSort(result)
                );
            };
            const conversationChangedHandler = ({ data }) => {
                if (this.storeIsSyncing) {
                    return;
                }
                let filterArr = [];
                const chids = data.map(ch => ch.conversationID);
                filterArr = this.storeConversationList.filter(
                    tc => !chids.includes(tc.conversationID)
                );
                const idx = data.findIndex(
                    c =>
                        c.conversationID ===
                        this.storeCurrentConversation.conversationID
                );
                if (idx !== -1) {
                    this.$store.commit(
                        'conversation/SET_CURRENT_CONVERSATION',
                        data[idx]
                    );
                }

                const result = [...data, ...filterArr];
                this.$store.commit(
                    'conversation/SET_CONVERSATION_LIST',
                    conversationSort(result)
                );
                this.setTipMessage(data[0]);
            };

            IMSDK.subscribe(
                IMSDK.IMEvents.OnTotalUnreadMessageCountChanged,
                totalUnreadCountChangedHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnNewConversation,
                newConversationHandler
            );
            IMSDK.subscribe(
                IMSDK.IMEvents.OnConversationChanged,
                conversationChangedHandler
            );
        },
        setTipMessage(source) {
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            const page = currentPage.route;
            let tipStatus = true;
            if (
                this.storeSelfInfo.globalRecvMsgOpt !==
                    MessageReceiveOptType.Nomal ||
                page === `pages/conversation/conversationList/index` ||
                (page === `pages/conversation/chating/index` &&
                    source.conversationID ===
                        this.storeCurrentConversationID) ||
                source.recvMsgOpt !== MessageReceiveOptType.Nomal ||
                !source.unreadCount
            ) {
                tipStatus = false;
            }
            if (tipStatus) {
                this.$store.commit(
                    'conversation/SET_LAST_CONVERSATION',
                    source
                );
                this.$store.commit('base/SET_TIP_STATUS', false);
                setTimeout(() => {
                    this.$store.commit('base/SET_TIP_STATUS', tipStatus);
                }, 300);
            }
        },

        async tryLogin() {
            try {
                const path = await getDbDir();
                const flag = await IMSDK.asyncApi(
                    IMMethods.InitSDK,
                    IMSDK.uuid(),
                    {
                        platformID: uni.$u.os() === 'ios' ? 1 : 2, // 平台，参照IMPlatform类,
                        apiAddr: config.getApiUrl(), // SDK的API接口地址。如：http://xxx:10002
                        wsAddr: config.getWsUrl(), // SDK的websocket地址。如： ws://xxx:10001
                        dataDir: path, // 数据存储路径
                        logLevel: 6,
                        logFilePath: path,
                        isLogStandardOutput: true
                    }
                );
                if (!flag) {
                    uni.$u.toast('初始化IMSDK失败！');
                    return new Error('初始化IMSDK失败！');
                }
                this.isInitSDK = true;
                await IMLogin();
            } catch (err) {
                console.log(err);
                plus.navigator.closeSplashscreen();
                // uni.$u.route('/pages/login/index');
            }
        },
        async thirdConfig() {
            try {
                const data = await thirdConfig();
                this.$store.commit('base/SET_THIRD_DATA', data);
                return data;
            } catch (err) {
                setTimeout(() => {
                    this.thirdConfig();
                }, 3000);
            }
        },
        async getUnreadMsgCount() {
            this.$store.dispatch('base/getUnreadMsgCount');
        },
        isAudioVideoSend(message) {
            const customElemData = message.customElem?.data;
            let data = {};
            try {
                data = JSON.parse(customElemData);
            } catch (err) {
                return false;
            }
            return (
                AudioVideoRenderTypes.includes(message.contentType) &&
                data.type &&
                (!data.userIDs || data.userIDs.includes(this.storeUserID)) &&
                [AudioVideoType.Video, AudioVideoType.Audio].includes(
                    data.type
                ) &&
                data.status
            );
        },
        isNewMessage(newServerMsg) {
            return !isEdit(newServerMsg) && !isLike(newServerMsg);
        },
        androidPushMsg(newServerMsg) {
            if (uni.$u.os() !== 'ios' && this.isHide) {
                plus.push.createMessage(
                    '你有一条新消息',
                    JSON.stringify({
                        payload: {
                            conversationID: idsGetConversationID(newServerMsg)
                        }
                    }),
                    { title: newServerMsg.senderNickname }
                );
            }
        },
        async handleNewMessage(newServerMsg) {
            if (
                ![
                    MessageType.TypingMessage,
                    MessageType.RevokeMessage
                ].includes(newServerMsg.contentType)
            ) {
                this.androidPushMsg(newServerMsg);
            }
            const customStatus = this.isAudioVideoSend(newServerMsg);
            if (newServerMsg.contentType === AudioVideoStatus.groupDone) {
                // 语音结束
                try {
                    const data = JSON.parse(
                        newServerMsg.notificationElem.detail
                    );
                    if (
                        idsGetConversationID(newServerMsg) !==
                        idsGetConversationID(this.storeIncomingCallMessage)
                    )
                        return;
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
                    this.appearCall(newServerMsg);
                } else if (
                    [
                        AudioVideoStatus.Done,
                        AudioVideoStatus.Cancel,
                        AudioVideoStatus.Reject,
                        AudioVideoStatus.NotAnswered
                        // AudioVideoStatus.Busy
                    ].includes(customStatus)
                ) {
                    this.callOut(newServerMsg);
                }
            }
            if (!this.inCurrentConversation(newServerMsg)) return;
            if (
                ![
                    MessageType.TypingMessage,
                    MessageType.RevokeMessage
                ].includes(newServerMsg.contentType)
            ) {
                if (this.storeHasMoreAfterMessage) {
                    // 当前数据不在底端，不做数据推送
                    let conversationUnread = this.conversationUnread + 1;
                    this.$store.commit(
                        'conversation/SET_CONVERSATION_UNREAD',
                        conversationUnread
                    );
                } else {
                    if (
                        this.storeIsShowSetEnd &&
                        this.isNewMessage(newServerMsg)
                    ) {
                        // 置底图标显示不滚动到底
                        let conversationUnread = this.conversationUnread + 1;
                        this.$store.commit(
                            'conversation/SET_CONVERSATION_UNREAD',
                            conversationUnread
                        );
                    }
                    this.pushNewMessage(newServerMsg);
                    uni.$u.debounce(this.markConversationAsRead, 2000);
                    if (
                        !this.storeIsShowSetEnd &&
                        this.isNewMessage(newServerMsg)
                    ) {
                        setTimeout(() =>
                            uni.$emit(PageEvents.ScrollToBottom, {
                                isRecv: true
                            })
                        );
                    }
                }
            } else if (
                [MessageType.TypingMessage].includes(newServerMsg.contentType)
            ) {
                // 正在输入..
                uni.$emit('setStatus', newServerMsg.typingElem?.msgTips);
            }
        },
        callOut(newServerMsg, status) {
            const customStatus = status || this.isAudioVideoSend(newServerMsg);
            if (
                idsGetConversationID(newServerMsg) !==
                idsGetConversationID(this.storeIncomingCallMessage)
            )
                return;
            uni.$emit('incoming_message_callback', {
                ...newServerMsg,
                customStatus
            });
            // uni.$u.toast(customStatusTextMap[customStatus]);
        },
        async appearCall(newServerMsg) {
            if (newServerMsg.sendID === this.storeUserID) return;
            if (
                this.storeIsIncomingCallLoading ||
                this.storeIsIncomingCallIng
            ) {
                // uni.$u.toast('占线占线');
                return false;
            }
            try {
                const { token } = await videoGetToken({
                    recvID: this.storeUserID,
                    conversationID: idsGetConversationID(newServerMsg)
                });
                this.$store.commit(
                    'incomingCall/SET_INCOMING_CALL_TOKEN',
                    token
                );
                this.appearLoadingCall(newServerMsg);
            } catch (err) {
                console.log(err);
                // uni.$u.toast('聊天已过期');
                return false;
            }
        },
        inCurrentConversation(newServerMsg) {
            switch (newServerMsg.sessionType) {
                case SessionType.Single:
                    return (
                        newServerMsg.sendID ===
                            this.storeCurrentConversation.userID ||
                        (newServerMsg.sendID === this.storeCurrentUserID &&
                            newServerMsg.recvID ===
                                this.storeCurrentConversation.userID)
                    );
                case SessionType.WorkingGroup:
                    return (
                        newServerMsg.groupID ===
                        this.storeCurrentConversation.groupID
                    );
                case SessionType.Notification:
                    return (
                        newServerMsg.sendID ===
                        this.storeCurrentConversation.userID
                    );
                default:
                    return false;
            }
        },
        markConversationAsRead() {
            IMSDK.asyncApi(
                IMSDK.IMMethods.MarkConversationMessageAsRead,
                IMSDK.uuid(),
                this.storeCurrentConversation.conversationID
            );
        },
        getAudio({ src = '', sessionCategory = 'playback' }) {
            this.audioSrc = src;
            this.innerAudioContext = plus.audio.createPlayer({
                src
            });
            /** * ambient模式在iOS端默认带有跟随系统铃声模式的行为，iOS端默认值为soloAmbient * iOS端默认情况下为soloAmbient，但偶现有打开playback，即出现了之前静音模式下也播放铃声的问题 * ambient支持多音频混合，故不会打断正在播放的音乐 */
            this.innerAudioContext.setSessionCategory(sessionCategory);
            // 判断平台如果是Android
            if (uni.$u.os() !== 'ios') {
                // 导入声音管理类（AudioManager提供对音量和铃声模式控制的访问）
                // let AudioManager = plus.android.importClass('android.media.AudioManager');
                // this.audioManager = new AudioManager();
                plus.android.importClass('android.media.AudioManager');
                let main = plus.android.runtimeMainActivity(); // 获取应用主Activity实例对象
                let Context = plus.android.importClass(
                    'android.content.Context'
                ); // 全局上下文
                this.audioManager = main.getSystemService(
                    Context.AUDIO_SERVICE
                );
            }
            this.innerAudioContext.addEventListener('ended', () => {
                this.audioSrc = '';
            });
            this.innerAudioContext.seekTo(0);
            this.play(sessionCategory);
        },
        play(sessionCategory) {
            // 播放的时候，iOS端可直接播放，因为ambient模式自带有跟随系统铃声模式的默认行为
            // 但Android端需要判断系统的铃声模式来决定是否需要播放
            if (uni.$u.os() !== 'ios') {
                /** * 获取当前手机的铃声模式 * 0. 林格模式，将沉默，不会振动。 （这会覆盖振动设置。） * 1. 林肯模式，将沉默，并会振动。 （这会导致电话铃声总是振动，但是如果设置，通知振动只会振动。） * 2. 铃声模式可能会发出声音并可能振动。 如果在更换此模式之前的音量可以听到，则会发出声音。 如果振动设置打开，它会振动。 */
                let status = this.audioManager.getRingerMode();
                if (status === 2 || sessionCategory === 'playback') {
                    // 铃声模式下才播放音频
                    this.innerAudioContext.play();
                } else {
                    this.audioSrc = '';
                }
                return;
            }
            this.innerAudioContext.play();
            // iOS端直接播放
        },
        handleAudioManager() {
            // this.innerAudioContext = uni.createInnerAudioContext();
        },
        handlePlayAudio(src, sessionCategory) {
            if (this.audioSrc) {
                this.innerAudioContext.close();
                if (src === this.audioSrc) {
                    this.audioSrc = '';
                    return;
                }
            }
            if (!src) return;
            this.getAudio({
                src,
                sessionCategory
            });
        },
        handleStopAudio(src) {
            if (this.innerAudioContext._Player_Param.src === src) {
                this.innerAudioContext.close();
            }
        },
        handleUniPush() {
            setTimeout(() => {
                plus.push.getClientInfoAsync(async info => {
                    const cid = info['clientid'];
                    if (!cid) {
                        this.handleUniPush();
                        return;
                    }
                    try {
                        this.storeUserID &&
                            (await bindCid({
                                platform: uni.$u.os() === 'ios' ? 1 : 2,
                                userID: this.storeUserID,
                                cid
                            }));
                    } catch (e) {
                        console.log(e);
                    }
                    this.$store.commit('user/SET_CLIENT_ID', cid);
                });
            }, 3000);
            // plus.push.addEventListener('click', this._handlePush);
        },
        setMediaList(list, type = '') {
            let imgList = list.map(message => {
                const { contentType, pictureElem, videoElem, clientMsgID } = message;
                const isVideo = contentType === MessageType.VideoMessage;
                let map = {
                    url: formatFileUrl(pictureElem?.sourcePicture.url),
                    poster: [
                        formatFileUrl(pictureElem?.sourcePicture.url),
                        pictureElem?.sourcePath,
                        message.localEx
                    ],
                    type: 'image'
                };
                if (isVideo) {
                    map = {
                        url: formatFileUrl(videoElem.videoUrl),
                        poster: [
                            formatFileUrl(videoElem?.snapshotUrl),
                            videoElem?.snapshotPath,
                            message.localEx
                        ],
                        type: 'video'
                    };
                }
				map.clientMsgID = clientMsgID;
                return map;
            });
            type === 'reverse' && imgList.reverse();
            this.$store.commit(
                'conversation/SET_CONVERSATION_MEDIA_LIST',
                imgList
            );
        },
        _handlePush(message) {
            let payload = (message && message.payload) || {};
            if (!payload.conversationID || !this.isInitSDK) return;
            uni.$emit(PageEvents.ClickPushMessage, payload.conversationID);
        }
    }
};
</script>

<style lang="scss">
/*每个页面公共css */
@import '@/uni_modules/uview-ui/index.scss';
@import '@/styles/base.scss';
@import '@/styles/login.scss';
@import '@/styles/global.scss';
@import '@/styles/pages.scss';
/* #ifndef APP-NVUE */
@import 'animate.css';
/* #endif */
</style>

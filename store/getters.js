import { idsGetConversationID } from '@/util/imCommon';
export default {
    storeConversationList: (state) => state.conversation.conversationList,
    storeConversationMediaList: (state) => state.conversation.conversationMediaList,
    storeCurrentConversation: (state) => state.conversation.currentConversation,
    storeCurrentConversationID: (state) => state.conversation.currentConversation.conversationID,
    storeUnReadCount: (state) => state.conversation.unReadCount,
    storeCurrentGroup: (state) => state.conversation.currentGroup,
    storeCurrentMemberInGroup: (state) => state.conversation.currentMemberInGroup,
    conversationUnread: (state) => state.conversation.conversationUnread,
    storeFriendList: (state) => state.contact.friendList,
    storeBlackList: (state) => state.contact.blackList,
    storeGroupList: (state) => state.contact.groupList,
    storeRecvFriendApplications: (state) => state.contact.recvFriendApplications,
    storeSentFriendApplications: (state) => state.contact.sentFriendApplications,
    storeRecvGroupApplications: (state) => state.contact.recvGroupApplications,
    storeSentGroupApplications: (state) => state.contact.sentGroupApplications,
    storeUnHandleFriendApplicationNum: (state) => state.contact.unHandleFriendApplicationNum,
    storeUnHandleGroupApplicationNum: (state) => state.contact.unHandleGroupApplicationNum,
    storeIsScrollWay: (state) => state.conversation.isScrollWay,
    storeIsShowSetEnd: (state) => {
        const { message, conversation } = state;
        const { historyMessageMap } = message;
        const { isScrollWay, currentConversation } = conversation;
        const hasAfterMore = historyMessageMap[currentConversation.conversationID]?.hasAfterMore ?? true;
        return hasAfterMore || isScrollWay;
    },
    storeHistoryMessageList: (state) => {
        const { message, conversation, base } = state;
        const { historyMessageMap } = message;
        const { currentConversation } = conversation;
        const list = historyMessageMap[currentConversation.conversationID]?.messageList || [];
        const pinList = base?.pinList.map(v => v.clientMsgID);
        const l = JSON.parse(JSON.stringify(list));
        l.map((msg, i) => {
            let index = pinList.indexOf(msg.clientMsgID);
            if (index > -1) {
                msg.pinMap = base?.pinList[index];
            }
            try {
                if (msg.contentType === 110) {
                    const data = JSON.parse(msg.customElem.data);
                    if (data.status === 1650) {
                        l[i] = null;
                    }
                }
            } catch (err) {
                //
            }
        });
        return l.filter(v => v);
    },
    storeHistoryMessageListReverse: (state) => {
        const { message, conversation, base } = state;
        const { historyMessageMap } = message;
        const { currentConversation } = conversation;
        const list = historyMessageMap[currentConversation.conversationID]?.messageList || [];
        const pinList = base?.pinList.map(v => v.clientMsgID);
        const l = JSON.parse(JSON.stringify(list));
        l.map((msg, i) => {
            let index = pinList.indexOf(msg.clientMsgID);
            if (index > -1) {
                msg.pinMap = base?.pinList[index];
            }
            try {
                if (msg.contentType === 110) {
                    const data = JSON.parse(msg.customElem.data);
                    if (data.status === 1650) {
                        l[i] = null;
                    }
                }
            } catch (err) {
                //
            }
        });
        return l.filter(v => v).reverse();
    },
    storeHasMoreMessage: (state) => {
        const { message, conversation } = state;
        const { historyMessageMap } = message;
        const { currentConversation } = conversation;
        const hasMore = historyMessageMap[currentConversation.conversationID]?.hasMore ?? true;
        return hasMore;
    },
    storeHasMoreAfterMessage: (state) => {
        const { message, conversation } = state;
        const { historyMessageMap } = message;
        const { currentConversation } = conversation;
        const hasAfterMore = historyMessageMap[currentConversation.conversationID]?.hasAfterMore ?? true;
        return hasAfterMore;
    },
    storeIsIncomingConversation: (state) => {
        const { conversation, incomingCall } = state;
        const { incomingCallMessage, isAnswer } = incomingCall;
        const { currentConversation } = conversation;
        let conversationID = '';
        if (isAnswer) {
            conversationID = idsGetConversationID(incomingCallMessage);
        }
        return !isAnswer || currentConversation.conversationID === conversationID;
    },
    storeClientID: (state) => state.user.clientID,
    storeAuthData: (state) => state.user.authData,
    storeUserID: (state) => state.user.authData.userID,
    storeIMToken: (state) => state.user.authData.imToken,
    storeBusinessToken: (state) => state.user.authData.chatToken,
    storeCryptoPadding: (state) => state.user.authData.cryptoPadding,
    storeSelfInfo: (state) => state.user.selfInfo,
    storeUserList: (state) => state.user.userList,
    storeCurrentUserID: (state) => state.user.selfInfo.userID,
    storeAppConfig: (state) => state.user.appConfig,
    storeIsSyncing: (state) => state.user.isSyncing,
    storeIsProd: (state) => state.user.isProd,
    storePinList: (state) => state.base.pinList,
    storeIncomingCallUserInfo: (state) => state.incomingCall.incomingCallUserInfo,
    storeIsIncomingCallTop: (state) => state.incomingCall.isIncomingCallTop,
    storeIsIncomingCallSmall: (state) => state.incomingCall.isIncomingCallSmall,
    storeIsAnswer: (state) => state.incomingCall.isAnswer,
    storeIsIncomingCallIng: (state) => state.incomingCall.isIncomingCallIng,
    storeIncomingIsHangup: (state) => state.incomingCall.isHangup,
    storeIncomingCallToken: (state) => state.incomingCall.incomingCallToken,
    storeIsIncomingCallLoading: (state) => state.incomingCall.isIncomingCallLoading,
    storeIncomingCallMessage: (state) => state.incomingCall.incomingCallMessage,
    storeIncomingCallCallTime: (state) => state.incomingCall.callTime,
    storeIncomingCallStartTime: (state) => state.incomingCall.startTime,
    storeIncomingCallSmallStyle: (state) => state.incomingCall.incomingCallSmallStyle,
};

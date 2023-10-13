export default {
    storeConversationList: (state) => state.conversation.conversationList,
    storeConversationMediaList: (state) => state.conversation.conversationMediaList,
    storeCurrentConversation: (state) => state.conversation.currentConversation,
    storeCurrentConversationID: (state) => state.conversation.currentConversation.conversationID,
    storeUnReadCount: (state) => state.conversation.unReadCount,
    storeCurrentGroup: (state) => state.conversation.currentGroup,
    storeCurrentMemberInGroup: (state) => state.conversation.currentMemberInGroup,
    storeFriendList: (state) => state.contact.friendList,
    storeBlackList: (state) => state.contact.blackList,
    storeGroupList: (state) => state.contact.groupList,
    storeRecvFriendApplications: (state) => state.contact.recvFriendApplications,
    storeSentFriendApplications: (state) => state.contact.sentFriendApplications,
    storeRecvGroupApplications: (state) => state.contact.recvGroupApplications,
    storeSentGroupApplications: (state) => state.contact.sentGroupApplications,
    storeUnHandleFriendApplicationNum: (state) => state.contact.unHandleFriendApplicationNum,
    storeUnHandleGroupApplicationNum: (state) => state.contact.unHandleGroupApplicationNum,
    storeHistoryMessageList: (state) => {
        const { message, conversation } = state;
        const { historyMessageMap } = message;
        const { currentConversation } = conversation;
        const list = historyMessageMap[currentConversation.conversationID]?.messageList || [];
        return list;
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
        const hasMore = historyMessageMap[currentConversation.conversationID]?.hasAfterMore ?? true;
        return hasMore;
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
};

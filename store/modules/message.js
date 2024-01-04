import IMSDK from 'openim-uniapp-polyfill';
import { v4 as uuidv4 } from 'uuid';
import { UpdateMessageTypes } from '@/constant';
import { idsGetConversationID, isEdit, isLike } from '@/util/imCommon';

const state = {
    historyMessageMap: {}
};

const mutations = {
    SET_HISTORY_MESSAGE_MAP(state, obj) {
        console.log('obj-------obj', JSON.parse(JSON.stringify(obj)));
        state.historyMessageMap = obj;
    }
};

const actions = {
    async getHistoryMesageList({ commit, state }, params) {
        const { conversationID, isInit, positionMsgID, isSyncing, seq } =
            params;
        if (state.historyMessageMap[conversationID]?.hasAfterMore && isSyncing)
            return; // 定位数据时同步信息不处理
        const {
            messageList: oldMessageList = [],
            lastMinSeq: oldLastMinSeq = 0
        } = state.historyMessageMap[conversationID] || {};
        const startClientMsgID =
            positionMsgID || oldMessageList[0]?.clientMsgID || '';
        console.log('paramsparamsparams----', {
            ...params,
            isInit: undefined,
            startClientMsgID: isInit && !positionMsgID ? '' : startClientMsgID,
            lastMinSeq: seq ? seq : isInit ? 0 : oldLastMinSeq
        });
        try {
            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetAdvancedHistoryMessageList,
                uuidv4(),
                {
                    ...params,
                    isInit: undefined,
                    startClientMsgID:
                        isInit && !positionMsgID ? '' : startClientMsgID,
                    lastMinSeq: seq ? seq : isInit ? 0 : oldLastMinSeq
                }
            );
            console.log('getHistoryMesageList----', data);
            const { messageList = [], lastMinSeq } = data;
            const hasAfterMore =
                state.historyMessageMap[conversationID]?.hasAfterMore;
            commit('SET_HISTORY_MESSAGE_MAP', {
                ...state.historyMessageMap,
                [conversationID]: {
                    messageList: [
                        ...messageList.concat(isInit ? [] : oldMessageList)
                    ],
                    hasMore: messageList[0]?.seq > 1,
                    hasAfterMore:
                        isInit && !positionMsgID
                            ? false
                            : typeof hasAfterMore === 'undefined'
                              ? true
                              : hasAfterMore,
                    lastMinSeq: lastMinSeq
                }
            });
            return messageList;
        } catch (e) {
            const { errCode } = e;
            console.log('eeeeeee-eeee222', errCode);
            if (errCode === 10005) {
                uni.$u.toast('获取历史数据失败');
            }
            return [];
        }
    },

    async getHistoryMesageListReverse({ commit, state }, params) {
        const { conversationID, isInit, positionMsgID, isSyncing, seq } =
            params;
        if (state.historyMessageMap[conversationID]?.hasAfterMore && isSyncing)
            return; // 定位数据时同步信息不处理
        const {
            messageList: oldMessageList = [],
            lastMinSeq: oldLastMinSeq = 0
        } = state.historyMessageMap[conversationID] || {};
        const startClientMsgID =
            positionMsgID ||
            oldMessageList[oldMessageList.length - 1]?.clientMsgID ||
            '';
        console.log('paramsparamsparams----', {
            ...params,
            isInit: undefined,
            startClientMsgID: isInit && !positionMsgID ? '' : startClientMsgID,
            lastMinSeq: seq ? seq : isInit ? 0 : oldLastMinSeq
        });
        try {
            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetAdvancedHistoryMessageListReverse,
                uuidv4(),
                {
                    ...params,
                    isInit: undefined,
                    startClientMsgID:
                        isInit && !positionMsgID ? '' : startClientMsgID,
                    lastMinSeq: seq ? seq : isInit ? 0 : oldLastMinSeq
                }
            );
            console.log('getHistoryMesageListReverse----', data);
            const { messageList = [], lastMinSeq } = data;
            const clientMsgIDList = oldMessageList.map(
                item => item.clientMsgID
            );
            const filterMessageList = messageList.filter(
                item => !clientMsgIDList.includes(item.clientMsgID)
            );
            commit('SET_HISTORY_MESSAGE_MAP', {
                ...state.historyMessageMap,
                [conversationID]: {
                    messageList: [...oldMessageList.concat(filterMessageList)],
                    hasMore: state.historyMessageMap[conversationID]?.hasMore,
                    hasAfterMore: messageList.length !== 0,
                    lastMinSeq: lastMinSeq
                }
            });
            return messageList;
        } catch (e) {
            const { errCode } = e;
            console.log('eeeeeee-eeee222', errCode);
            if (errCode === 10005) {
                uni.$u.toast('获取历史数据失败');
            }
            return [];
        }
    },
    pushNewMessage({ commit, state, rootState }, message) {
        let conversationID =
            rootState.conversation.currentConversation.conversationID;
        if (!conversationID) {
            conversationID = idsGetConversationID(message);
        }
        const obj = state.historyMessageMap[conversationID];
        let msgList = [];
        if (!isEdit(message) && !isLike(message)) {
            msgList = [...(obj?.messageList || []), message];
        } else {
            // 编辑消息
            let index = -1;
            msgList = [...obj.messageList];
            if (
                !msgList.map(v => v.clientMsgID).includes(message.clientMsgID)
            ) {
                obj.messageList.forEach((item, i) => {
                    const preMsg = obj.messageList[i - 1] || {};
                    const msg = obj.messageList[i] || {};
                    const { sendTime } = message;
                    if (
                        sendTime >= preMsg.sendTime &&
                        sendTime <= msg.sendTime
                    ) {
                        index = i;
                    }
                });
                let i = index === -1 ? obj.messageList.length : index;
                console.log('pushNewMessage-pushNewMessage', i);
                msgList = [
                    ...(obj?.messageList || []).slice(0, i),
                    message,
                    ...(obj?.messageList || []).slice(i)
                ];
            }
            console.log('msgList-msgList', msgList);
        }
        commit('SET_HISTORY_MESSAGE_MAP', {
            ...state.historyMessageMap,
            [conversationID]: {
                ...obj,
                messageList: [...msgList]
            }
        });
    },
    updateOneMessage(
        { commit, state, rootState },
        { message, type = UpdateMessageTypes.Overall, keyWords = [] }
    ) {
        console.log('updateOneMessage', message);
        let conversationID =
            rootState.conversation.currentConversation.conversationID;
        const obj = state.historyMessageMap[conversationID];
        const tmpList = obj?.messageList || [];

        const idx = tmpList.findIndex(
            v => v.clientMsgID === message.clientMsgID
        );
        if (idx === -1) return;
        if (type === UpdateMessageTypes.Overall) {
            tmpList[idx] = message;
        } else if (type === UpdateMessageTypes.KeyWords) {
            const updateFields = Array.isArray(keyWords)
                ? keyWords
                : [keyWords];
            updateFields.forEach(v => (tmpList[idx][v.key] = v.value));
        }
        commit('SET_HISTORY_MESSAGE_MAP', {
            ...state.historyMessageMap,
            [conversationID]: {
                ...obj,
                messageList: [...tmpList]
            }
        });
    },
    deleteMessages({ commit, state, rootState }, messages) {
        setTimeout(() => {
            let conversationID =
                rootState.conversation.currentConversation.conversationID;
            if (!conversationID) {
                conversationID = idsGetConversationID(messages[0]);
            }

            const obj = state.historyMessageMap[conversationID];
            const tmpList = [...obj.messageList];
            console.log('删除的------', messages);
            messages.forEach(v => {
                const idx = tmpList.findIndex(
                    j => j.clientMsgID === v.clientMsgID
                );
                if (idx !== -1) {
                    tmpList.splice(idx, 1);
                }
            });
            commit('SET_HISTORY_MESSAGE_MAP', {
                ...state.historyMessageMap,
                [conversationID]: {
                    ...obj,
                    messageList: [...tmpList]
                }
            });
        }, 100);
    },
    resetMessageState({ commit }) {
        // commit('SET_HISTORY_MESSAGE_LIST', []);
        // commit('SET_HAS_MORE_MESSAGE', true);
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
};

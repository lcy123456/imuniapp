import IMSDK from 'openim-uniapp-polyfill';
import { v4 as uuidv4 } from 'uuid';
import { UpdateMessageTypes } from '@/constant';

const state = {
    historyMessageMap: {}
};

const mutations = {
    SET_HISTORY_MESSAGE_LIST (state, list) {
        state.historyMessageList = [...list];
    },
    SET_HAS_MORE_MESSAGE (state, hasMore) {
        state.hasMoreMessage = hasMore;
    },
    SET_HISTORY_MESSAGE_MAP (state, obj) {
        const { conversationID, key, value } = obj;
        const temp = JSON.parse(JSON.stringify(state.historyMessageMap[conversationID] || {}));
        temp[key] = value;
        state.historyMessageMap = {
            ...state.historyMessageList,
            [conversationID]: temp
        };
    },
};

const actions = {
    async getHistoryMesageList ({ commit, state }, params) {
        const { conversationID, count, isInit } = params;
        try {
            const {
                messageList: oldMessageList = [],
                lastMinSeq: oldLastMinSeq = 0
            } = state.historyMessageMap[conversationID] || {};
            const startClientMsgID = oldMessageList[0]?.clientMsgID || '';

            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetAdvancedHistoryMessageList,
                uuidv4(),
                {
                    ...params,
                    isInit: undefined,
                    startClientMsgID: isInit ? '' : startClientMsgID,
                    lastMinSeq: isInit ? 0 : oldLastMinSeq
                }
            );
            console.log(data);
            const { messageList = [], isEnd, lastMinSeq } = data;
            commit('SET_HISTORY_MESSAGE_MAP', {
                conversationID: conversationID,
                key: 'messageList',
                value: messageList.concat(isInit ? [] : oldMessageList)
            });
            commit('SET_HISTORY_MESSAGE_MAP', {
                conversationID: conversationID,
                key: 'hasMore',
                value: !isEnd && messageList.length === count,
            });
            commit('SET_HISTORY_MESSAGE_MAP', {
                conversationID: conversationID,
                key: 'lastMinSeq',
                value: lastMinSeq,
            });
        } catch (e) {
            commit('SET_HISTORY_MESSAGE_MAP', {
                conversationID,
                key: 'messageList',
                value: []
            });
        }
    },
    pushNewMessage ({ commit, state, rootState }, message) {
        console.log('pushNewMessage', message);
        const conversationID = rootState.conversation.currentConversation.conversationID;
        commit('SET_HISTORY_MESSAGE_MAP', {
            conversationID,
            key: 'messageList',
            value: [
                ...state.historyMessageMap[conversationID].messageList,
                message,
            ]
        });
    },
    updateOneMessage ({ commit, state, rootState }, {
        message,
        type = UpdateMessageTypes.Overall,
        keyWords = [],
    }) {
        const conversationID = rootState.conversation.currentConversation.conversationID;
        const tmpList = state.historyMessageMap[conversationID].messageList;

        const idx = tmpList.findIndex(v => v.clientMsgID === message.clientMsgID);
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
            conversationID,
            key: 'messageList',
            value: tmpList
        });
        // commit('SET_HISTORY_MESSAGE_LIST', tmpList);
    },
    deleteMessages ({ commit, state, rootState }, messages) {
        const conversationID = rootState.conversation.currentConversation.conversationID;
        const tmpList = state.historyMessageMap[conversationID].messageList;
        messages.forEach((v) => {
            const idx = tmpList.findIndex(j => j.clientMsgID === v.clientMsgID);
            if (idx !== -1) {
                tmpList.splice(idx, 1);
            }
        });
        commit('SET_HISTORY_MESSAGE_MAP', {
            conversationID,
            key: 'messageList',
            value: tmpList
        });
        // commit('SET_HISTORY_MESSAGE_LIST', tmpList);
    },
    resetMessageState ({ commit }) {
        // commit('SET_HISTORY_MESSAGE_LIST', []);
        // commit('SET_HAS_MORE_MESSAGE', true);
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};

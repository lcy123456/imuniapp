import IMSDK from 'openim-uniapp-polyfill';
import { v4 as uuidv4 } from 'uuid';
import { UpdateMessageTypes } from '@/constant';
import { idsGetConversationID } from '@/util/imCommon';

const state = {
    historyMessageMap: {}
};

const mutations = {
    // SET_HISTORY_MESSAGE_LIST (state, list) {
    //     state.historyMessageList = [...list];
    // },
    // SET_HAS_MORE_MESSAGE (state, hasMore) {
    //     state.hasMoreMessage = hasMore;
    // },
    SET_HISTORY_MESSAGE_MAP (state, obj) {
        // const { conversationID, key, value } = obj;
        // const temp = state.historyMessageMap[conversationID] || {};
        // temp[key] = value;
        // state.historyMessageMap = {
        //     ...state.historyMessageList,
        //     [conversationID]: temp
        // };
        state.historyMessageMap = obj;
    },
};

const actions = {
    async getHistoryMesageList ({ commit, state }, params) {
        const { conversationID, count, isInit, positionMsgID } = params;
        try {
            const {
                messageList: oldMessageList = [],
                lastMinSeq: oldLastMinSeq = 0
            } = state.historyMessageMap[conversationID] || {};
            const startClientMsgID = positionMsgID || oldMessageList[0]?.clientMsgID || '';

            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetAdvancedHistoryMessageList,
                uuidv4(),
                {
                    ...params,
                    isInit: undefined,
                    startClientMsgID: isInit && !positionMsgID ? '' : startClientMsgID,
                    lastMinSeq: isInit ? 0 : oldLastMinSeq
                }
            );
            console.log('getHistoryMesageList----', data, positionMsgID, startClientMsgID);
            const { messageList = [], isEnd, lastMinSeq } = data;
            // commit('SET_HISTORY_MESSAGE_MAP', {
            //     conversationID: conversationID,
            //     key: 'messageList',
            //     value: [...messageList.concat(isInit ? [] : oldMessageList)]
            // });
            // commit('SET_HISTORY_MESSAGE_MAP', {
            //     conversationID: conversationID,
            //     key: 'hasMore',
            //     value: !isEnd && messageList.length === count,
            // });
            // commit('SET_HISTORY_MESSAGE_MAP', {
            //     conversationID: conversationID,
            //     key: 'lastMinSeq',
            //     value: lastMinSeq,
            // });
            const hasAfterMore = state.historyMessageMap[conversationID]?.hasAfterMore;
            commit('SET_HISTORY_MESSAGE_MAP', {
                ...state.historyMessageMap, 
                [conversationID]: {
                    messageList: [...messageList.concat(isInit ? [] : oldMessageList)],
                    hasMore: !isEnd && messageList.length === count,
                    hasAfterMore: (isInit && !positionMsgID) ?
                        false : (typeof hasAfterMore === 'undefined' ? true : hasAfterMore),
                    lastMinSeq: lastMinSeq
                },
            });
            return data;
        } catch (e) {
            // commit('SET_HISTORY_MESSAGE_MAP', {
            //     ...state.historyMessageMap, 
            //     [conversationID]: {},
            // });
        }
    },

    async getHistoryMesageListReverse ({ commit, state }, params) {
        const { conversationID, count, isInit, positionMsgID } = params;
        try {
            const {
                messageList: oldMessageList = [],
                lastMinSeq: oldLastMinSeq = 0
            } = state.historyMessageMap[conversationID] || {};
            const startClientMsgID = positionMsgID || oldMessageList[oldMessageList.length - 1]?.clientMsgID || '';

            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetAdvancedHistoryMessageListReverse,
                uuidv4(),
                {
                    ...params,
                    isInit: undefined,
                    startClientMsgID: isInit && !positionMsgID ? '' : startClientMsgID,
                    lastMinSeq: isInit ? 0 : oldLastMinSeq
                }
            );
            console.log('getHistoryMesageListReverse----', data);
            const { messageList = [], isEnd, lastMinSeq } = data;
            commit('SET_HISTORY_MESSAGE_MAP', {
                ...state.historyMessageMap, 
                [conversationID]: {
                    messageList: [...oldMessageList.concat(messageList)],
                    hasMore: state.historyMessageMap[conversationID]?.hasMore,
                    hasAfterMore: !isEnd && messageList.length === count,
                    lastMinSeq: lastMinSeq
                },
            });
            return data;
        } catch (e) {
            // 
        }
    },
    pushNewMessage ({ commit, state, rootState }, message) {
        let conversationID = rootState.conversation.currentConversation.conversationID;
        if (!conversationID) {
            conversationID = idsGetConversationID(message);
        }
        console.log('pushNewMessage', message, conversationID);
        // commit('SET_HISTORY_MESSAGE_MAP', {
        //     conversationID,
        //     key: 'messageList',
        //     value: [
        //         ...state.historyMessageMap[conversationID]?.messageList || [],
        //         message,
        //     ]
        // });
        const obj = state.historyMessageMap[conversationID];
        commit('SET_HISTORY_MESSAGE_MAP', {
            ...state.historyMessageMap,
            [conversationID]: {
                ...obj,
                messageList: [...obj?.messageList || [], message],
            },
        });
    },
    updateOneMessage ({ commit, state, rootState }, {
        message,
        type = UpdateMessageTypes.Overall,
        keyWords = [],
    }) {
        console.log('updateOneMessage', message);
        let conversationID = rootState.conversation.currentConversation.conversationID;
        if (!conversationID) {
            conversationID = idsGetConversationID(message);
        }
        const obj = state.historyMessageMap[conversationID];
        const tmpList = obj?.messageList || [];

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
        // commit('SET_HISTORY_MESSAGE_MAP', {
        //     conversationID,
        //     key: 'messageList',
        //     value: [...tmpList]
        // });
        commit('SET_HISTORY_MESSAGE_MAP', {
            ...state.historyMessageMap,
            [conversationID]: {
                ...obj,
                messageList: [...tmpList],
            },
        });
    },
    deleteMessages ({ commit, state, rootState }, messages) {
        let conversationID = rootState.conversation.currentConversation.conversationID;
        if (!conversationID) {
            conversationID = idsGetConversationID(messages[0]);
        }

        const obj = state.historyMessageMap[conversationID];
        const tmpList = obj.messageList;
        messages.forEach((v) => {
            const idx = tmpList.findIndex(j => j.clientMsgID === v.clientMsgID);
            if (idx !== -1) {
                tmpList.splice(idx, 1);
            }
        });
        // commit('SET_HISTORY_MESSAGE_MAP', {
        //     conversationID,
        //     key: 'messageList',
        //     value: [...tmpList]
        // });
        commit('SET_HISTORY_MESSAGE_MAP', {
            ...state.historyMessageMap,
            [conversationID]: {
                ...obj,
                messageList: [...tmpList],
            },
        });
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

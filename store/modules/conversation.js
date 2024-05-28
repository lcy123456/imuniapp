import { v4 as uuidv4 } from 'uuid';
import IMSDK from 'openim-uniapp-polyfill';
import { apiConversationFolder } from '@/api/conversation';
import { sortByChinesePinyin } from '@/util/common';

const state = {
    conversationList: [],
    currentConversation: {},
    unReadCount: 0,
    conversationUnread: 0,
    isScrollWay: false,
    currentGroup: {},
    currentMemberInGroup: {},
    conversationMediaList: [],
    lastConversation: {},
    conversationFolder: []
};

const mutations = {
    SET_CONVERSATION_UNREAD(state, number) {
        state.conversationUnread = number;
    },
    SET_IS_SCROLL_WAY(state, boo) {
        state.isScrollWay = boo;
    },
    SET_CONVERSATION_LIST(state, list) {
        list = list.map(item => {
            return {
                ...item,
                key: `${item.conversationID}-${+new Date()}`
            };
        });
        state.conversationList = [...list];
    },
    SET_LAST_CONVERSATION(state, obj) {
        state.lastConversation = obj;
    },
    SET_CONVERSATION(state, list) {
        state.conversationList = [...list];
    },
    SET_CONVERSATION_MEDIA_LIST(state, list) {
        state.conversationMediaList = [...list];
    },
    SET_CURRENT_CONVERSATION(state, conversation) {
        state.currentConversation = {
            ...conversation
        };
    },
    SET_UNREAD_COUNT(state, count) {
        if (count) {
            uni.setTabBarBadge({
                index: 0,
                text: count < 99 ? count + '' : '99+'
            });
        } else {
            uni.removeTabBarBadge({
                index: 0
            });
        }
        plus.runtime.setBadgeNumber(count || 0);
        state.unReadCount = count;
    },
    SET_CURRENT_GROUP(state, group) {
        state.currentGroup = {
            ...group
        };
    },
    SET_CURRENT_MEMBER_IN_GROUP(state, member) {
        state.currentMemberInGroup = {
            ...member
        };
    },
    SET_CONVERSATION_FOLDER(state, list) {
        state.conversationFolder = list;
    }
};

let isGetConversationListLoading = false;
let conversationTimer;
const actions = {
    async getConversationList({ state, commit, dispatch }, isFirstPage = true) {
        try {
            if (!isFirstPage && isGetConversationListLoading) return;
            isFirstPage && clearTimeout(conversationTimer);
            isGetConversationListLoading = true;
            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetConversationListSplit,
                uuidv4(),
                {
                    offset: isFirstPage ? 0 : state.conversationList.length,
                    count: 20
                }
            );
            // console.log('getConversationList', data);
            commit('SET_CONVERSATION_LIST', [
                ...(isFirstPage ? [] : state.conversationList),
                ...data
            ]);
            if (data.length !== 0) {
                conversationTimer = setTimeout(() => {
                    dispatch('getConversationList', false);
                }, 2000);
            }
            return [...data];
        } catch (e) {
            commit('SET_CONVERSATION_LIST', []);
            return [];
        } finally {
            setTimeout(() => {
                isGetConversationListLoading = false;
            }, 0);
        }
    },
    delConversationByCID({ state, commit }, conversationID) {
        const tmpList = [...state.conversationList];
        const idx = tmpList.findIndex(
            conversation => conversation.conversationID === conversationID
        );
        if (idx > -1) {
            tmpList.splice(idx, 1);
            commit('SET_CONVERSATION_LIST', tmpList);
        }
    },
    getCurrentGroup({ commit }, groupID) {
        IMSDK.asyncApi(IMSDK.IMMethods.GetSpecifiedGroupsInfo, uuidv4(), [
            groupID
        ]).then(({ data }) => {
            commit('SET_CURRENT_GROUP', data[0] ?? {});
        });
    },
    getCurrentMemberInGroup({ commit, rootState }, groupID) {
        IMSDK.asyncApi(IMSDK.IMMethods.GetSpecifiedGroupMembersInfo, uuidv4(), {
            groupID,
            userIDList: [rootState.user.selfInfo.userID]
        }).then(({ data }) => {
            commit('SET_CURRENT_MEMBER_IN_GROUP', data[0] ?? {});
        });
    },
    getUnReadCount({ commit }) {
        IMSDK.asyncApi(IMSDK.IMMethods.GetTotalUnreadMsgCount, uuidv4()).then(
            res => {
                commit('SET_UNREAD_COUNT', res.data);
            }
        );
    },
    updateCurrentMemberInGroup({ commit, state }, memberInfo) {
        if (
            memberInfo.groupID === state.currentMemberInGroup.groupID &&
            memberInfo.userID === state.currentMemberInGroup.userID
        ) {
            commit('SET_CURRENT_MEMBER_IN_GROUP', memberInfo);
        }
    },
    resetConversationState({ commit }) {
        commit('SET_CURRENT_MEMBER_IN_GROUP', {});
        commit('SET_CURRENT_GROUP', {});
        commit('SET_CURRENT_CONVERSATION', {});
    },
    getConversationFolder: async ({ commit }) => {
        const res = await apiConversationFolder({
            pagination: {
                pageNumber: 1,
                showNumber: 100
            }
        });
        commit(
            'SET_CONVERSATION_FOLDER',
            sortByChinesePinyin(res.list || [], 'name')
        );
    },
    updateConversationFolder: ({ commit, state }, item) => {
        const tmpList = [...state.conversationFolder];
        const isRemove = item.state === -1;
        const idx = tmpList.findIndex(f => f.id === item.id);
        if (idx < 0) {
            tmpList.push(item);
        } else if (isRemove) {
            tmpList.splice(idx, 1);
        } else {
            tmpList[idx] = { ...item };
        }
        commit('SET_CONVERSATION_FOLDER', sortByChinesePinyin(tmpList, 'name'));
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
};

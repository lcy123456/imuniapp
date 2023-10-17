import Vue from "vue";
import Vuex from "vuex";
import user from "./modules/user";
import base from "./modules/base";
import contact from "./modules/contact";
import conversation from "./modules/conversation";
import message from "./modules/message";
import getters from "./getters";
import createPersistedState from "vuex-persistedstate";

const vuexPersisted = createPersistedState({
    storage: {
        getItem: (key) => uni.getStorageSync(key),
        setItem: (key, value) => uni.setStorageSync(key, value),
        removeItem: (key) => uni.removeStorageSync(key)
    },
    reducer (state) {
        const { user, conversation, contact } = state;
        const { authData, isProd, selfInfo, userList } = user;
        const { conversationList } = conversation;
        const { friendList, blackList, groupList} = contact;
        return {
            user: {
                authData,
                isProd,
                selfInfo,
                userList
            },
            conversation: {
                conversationList
            },
            contact: {
                friendList,
                blackList,
                groupList
            }
        };
    }
});

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        user,
        base,
        contact,
        conversation,
        message,
    },
    getters,
    plugins: [vuexPersisted]
});

export default store;

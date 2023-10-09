import Vue from "vue";
import Vuex from "vuex";
import user from "./modules/user";
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
        const { user, conversation } = state;
        const { authData, isProd, selfInfo } = user;
        const { conversationList } = conversation;
        return {
            user: {
                authData,
                isProd,
                selfInfo
            },
            conversation: {
                conversationList
            }
        };
    }
});

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        user,
        contact,
        conversation,
        message,
    },
    getters,
    plugins: [vuexPersisted]
});

export default store;

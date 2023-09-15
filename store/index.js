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
        const { user } = state;
        const { authData, isProd } = user;
        return {
            user: {
                authData,
                isProd
            },
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

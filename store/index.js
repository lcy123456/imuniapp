import Vue from "vue";
import Vuex from "vuex";
import user from "./modules/user";
import contact from "./modules/contact";
import conversation from "./modules/conversation";
import message from "./modules/message";
import getters from "./getters";
// import createPersistedState from "vuex-persistedstate";

// const vuexPersisted = createPersistedState({
//     storage: {
//         getItem: (key) => uni.getStorageSync(key),
//         setItem: (key, value) => uni.setStorageSync(key, value),
//         removeItem: (key) => uni.removeStorageSync(key)
//     },
//     reducer (state) {
//         const { message } = state;
//         const { accessToken, tokenOptions, userInfo, i18nLang, theme, chartTheme, MTPushId, isOpened } = base;
//         const { marketfavorList, historySearch } = quote;
//         return {
//             base: {
//                 accessToken,
//                 tokenOptions,
//                 i18nLang,
//                 theme,
//                 chartTheme,
//                 MTPushId,
//                 isOpened,
//                 userInfo: process.env.NODE_ENV === 'development' ? userInfo : {}
//             },
//             quote: {
//                 marketfavorList,
//                 historySearch
//             }
//         };
//     }
// });

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        user,
        contact,
        conversation,
        message,
    },
    getters
});

export default store;

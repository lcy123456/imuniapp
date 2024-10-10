import App from './App';
import Vue from 'vue';
import MyPlugin from './plugins/index';
import i18n from '@/locale/index';
import { setTabBarItem } from '@/util/common';

// vuex
import store from './store';

// 引入全局uView
import uView from '@/uni_modules/uview-ui';
Vue.use(uView);

// 全局组件
import Page from '@/components/Page';
Vue.component('Page', Page);

Vue.prototype.$store = store;
Vue.use(MyPlugin);

Vue.config.productionTip = false;
App.mpType = 'app';
const lang = uni.getStorageSync('lang') || 'ko';
i18n.locale = lang;
console.log('uni.getLocale()---uni.getLocale()', uni.getLocale(), lang);
if (uni.getLocale() !== lang) {
    setTimeout(() => {
        uni.setLocale(lang);
    }, 200);
}
const app = new Vue({
    store,
    i18n,
    ...App
});
setTabBarItem();
// 引入请求封装
require('./util/request/index')(app);

app.$mount();

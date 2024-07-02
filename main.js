import App from './App';
import Vue from 'vue';
import MyPlugin from './plugins/index';

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
const app = new Vue({
    store,
    ...App
});

// 引入请求封装
require('./util/request/index')(app);

app.$mount();

import { showToast, showLoading } from '@/util/unisdk';

const MyPlugin = {};

MyPlugin.install = (Vue) => {
    // 弹框
    Vue.prototype.$showToast = showToast;
    Vue.prototype.$toast = (title, duration) => showToast({title, duration});
    Vue.prototype.$showLoading = showLoading;
    Vue.prototype.$loading = (title, duration) => showLoading({title, duration});
    Vue.prototype.$hideLoading = uni.hideLoading;
};


export default MyPlugin;
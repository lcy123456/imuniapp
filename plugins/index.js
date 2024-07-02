import { showToast, showLoading } from '@/util/unisdk';

const MyPlugin = {};

MyPlugin.install = Vue => {
    // 弹框
    Vue.prototype.$showToast = showToast;
    Vue.prototype.$toast = (title, duration) => showToast({ title, duration });
    Vue.prototype.$showLoading = showLoading;
    Vue.prototype.$loading = title => showLoading({ title });
    Vue.prototype.$hideLoading = uni.hideLoading;
    Date.prototype.Format = function (fmt) {
        let o = {
            'M+': this.getMonth() + 1,
            'd+': this.getDate(),
            'h+': this.getHours(),
            'm+': this.getMinutes(),
            's+': this.getSeconds(),
            'q+': Math.floor((this.getMonth() + 3) / 3),
            S: this.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, this.getFullYear() + '');
        }
        for (let k in o) {
            if (new RegExp('(' + k + ')').test(fmt))
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1
                        ? o[k]
                        : ('00' + o[k]).substr(('' + o[k]).length)
                );
        }
        return fmt;
    };
};

export default MyPlugin;

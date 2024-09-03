import Vue from 'vue';
import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

import en from '@/locale/uni-app.en.json';
import ja from '@/locale/uni-app.ja-JP.json';
import ko from '@/locale/uni-app.ko.json';
import zh from '@/locale/uni-app.zh-Hans.json';
const lang = uni.getStorageSync('lang');
const i18n = new VueI18n({
    // 默认语言
    locale: lang || 'jp',
    // locale: 'zh',
    // 引入语言文件
    silentTranslationWarn: true,
    messages: {
        en,
        jp: ja,
        ko,
        zh
    }
});
export default i18n;

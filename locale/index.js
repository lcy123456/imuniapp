import Vue from 'vue';
import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

import en from '@/locale/en.json';
import jp from '@/locale/jp.json';
import ko from '@/locale/ko.json';
import zh from '@/locale/zh.json';
const lang = uni.getStorageSync('lang');
const i18n = new VueI18n({
    // 默认语言
    locale: lang || 'jp',
    // locale: 'zh',
    // 引入语言文件
    silentTranslationWarn: true,
    messages: {
        en,
        jp,
        ko,
        zh
    }
});
export default i18n;

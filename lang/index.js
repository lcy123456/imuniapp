import Vue from 'vue';
import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

import store from '@/store';
import en from '@/lang/en.json';
import jp from '@/lang/jp.json';
import ko from '@/lang/ko.json';
import zh from '@/lang/zh.json';
const i18n = new VueI18n({
    // 默认语言
    locale: store.state.base.lang || 'jp',
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

import appConfig from '@/common/config';
import { v4 as uuidV4 } from 'uuid';
/**
 * 请求拦截
 * @param {Object} http
 */
module.exports = () => {
    uni.$u.http.interceptors.request.use(
        config => {
            // 可使用async await 做异步操作
            // 初始化请求拦截器时，会执行此方法，此时data为undefined，赋予默认{}
            config.data = config.data || {};
            if (config.custom.isIMApi) {
                config.baseURL = appConfig.getApiUrl();
            } else if (config.custom.isConfigApi) {
                config.baseURL = appConfig.getConfigUrl();
            } else if (config.custom.isPgyerApi) {
                config.baseURL = 'https://www.pgyer.com';
            } else if (config.custom.isGiphy) {
                config.baseURL = 'https://api.giphy.com';
            } else {
                config.baseURL = appConfig.getRegisterUrl();
            }
            config.header = {
                ...config.header,
                operationID: uuidV4()
            };
            if (
                ![
                    '/user/get_users_online_status',
                    '/msg/get_unread_msg_count',
                    '/third/config',
                    '/auth/get_pc_login_platform'
                ].includes(config.url)
            ) {
                console.log('http request：', config);
            }
            // 可以在此通过vm引用vuex中的变量，具体值在vm.$store.state中
            return config;
        },
        (
            config // 可使用async await 做异步操作
        ) => Promise.reject(config)
    );
};

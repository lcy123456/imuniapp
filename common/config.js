import store from '@/store';
// https+域名形式   nginx配置可参考(https://doc.rentsoft.cn/#/v2/server_deploy/easy_deploy_new?id=%e4%ba%94%e3%80%81nginx%e9%85%8d%e7%bd%ae%e5%8f%82%e8%80%83)
// const registerUrl = 'https://web.rentsoft.cn/chat'
// const configUrl = 'https://web.rentsoft.cn/complete_admin'
// const apiUrl = 'https://web.rentsoft.cn/api'
// const wsUrl = 'wss://web.rentsoft.cn/msg_gateway'
function getUrl () {
    let registerUrl = 'http://192.168.2.244:10008';
    let configUrl = 'http://192.168.2.244:10009';
    let apiUrl = 'http://192.168.2.244:10002';
    let wsUrl = 'ws://192.168.2.244:10001';
    
    if (store.getters.storeIsProd) {
        registerUrl = 'https://imlogic.qncjkeusoge.cfd';
        configUrl = 'https://imcms.qncjkeusoge.cfd';
        apiUrl = 'https://imapi.qncjkeusoge.cfd';
        wsUrl = 'wss://imws.qncjkeusoge.cfd';
    }
    return {
        registerUrl,
        configUrl,
        apiUrl,
        wsUrl,
    };
}
const getRegisterUrl = () => getUrl().registerUrl;
const getConfigUrl = () => getUrl().configUrl;
const getApiUrl = () => getUrl().apiUrl;
const getWsUrl = () => getUrl().wsUrl;

module.exports = {
    getRegisterUrl,
    getConfigUrl,
    getApiUrl,
    getWsUrl,
};
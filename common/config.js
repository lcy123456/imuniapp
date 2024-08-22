import store from '@/store';
// https+域名形式   nginx配置可参考(https://doc.rentsoft.cn/#/v2/server_deploy/easy_deploy_new?id=%e4%ba%94%e3%80%81nginx%e9%85%8d%e7%bd%ae%e5%8f%82%e8%80%83)
// const registerUrl = 'https://web.rentsoft.cn/chat'
// const configUrl = 'https://web.rentsoft.cn/complete_admin'
// const apiUrl = 'https://web.rentsoft.cn/api'
// const wsUrl = 'wss://web.rentsoft.cn/msg_gateway'
function getUrl() {
    // let registerUrl = 'https://www.qncjkeusoge.cfd/chat';
    // let apiUrl = 'https://www.qncjkeusoge.cfd/api';
    // let wsUrl = 'wss://www.qncjkeusoge.cfd/msg_gateway';
    let registerUrl = 'https://api.sumi.chat/im-logic';
    let apiUrl = 'https://api.sumi.chat/open-im';
    let wsUrl = 'wss://api.sumi.chat/open-im-ws';

    if (store.getters.storeIsProd) {
        registerUrl = 'https://api.sumi.chat/im-logic';
        apiUrl = 'https://api.sumi.chat/open-im';
        wsUrl = 'wss://api.sumi.chat/open-im-ws';
        // registerUrl = 'https://imlogic.qncjkeusoge.cfd';
        // apiUrl = 'https://imapi.qncjkeusoge.cfd';
        // wsUrl = 'wss://imws.qncjkeusoge.cfd';
    }
    return {
        registerUrl,
        apiUrl,
        wsUrl
    };
}
const getRegisterUrl = () => getUrl().registerUrl;
const getApiUrl = () => getUrl().apiUrl;
const getWsUrl = () => getUrl().wsUrl;

module.exports = {
    getRegisterUrl,
    getApiUrl,
    getWsUrl
};

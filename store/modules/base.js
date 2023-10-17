import { pinList } from '@/api/pinToTop';
const state = {
    pinList: []
};

const mutations = {
    SET_PIN_LIST (state, list) {
        state.pinList = list;
    }
};

const actions = {
    async pinList ({
        commit
    }, conversationID) {
        try {
            const data = await pinList({
                conversationID,
                pagination: {
                    pageNumber: 1,
                    showNumber: 200
                }
            });
            console.log(data.list, 'pinListpinListpinListpinList', conversationID);
            commit('SET_PIN_LIST', data.list || []);
        } catch (e) {
            console.log(e, '获取置顶列表失败');
        }
    }
};


export default {
    namespaced: true,
    state,
    mutations,
    actions,
};

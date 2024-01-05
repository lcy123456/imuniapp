<template>
    <Page>
        <view class="conversation_container" @click="closeAllSwipe">
            <CustomNavBar title="已归档对话" is-bg-color2 />
            <view class="px-20 pt-10 pb-20 bg-grey" @click="handleToSearch">
                <uni-search-bar
                    v-model="keyword"
                    bg-color="#fff"
                    class="h-70"
                    placeholder="搜索"
                    readonly
                />
            </view>
            <scroll-view
                class="scroll_view"
                :scroll-with-animation="true"
                scroll-y
                :upper-threshold="0"
            >
                <uni-swipe-action ref="swipeWrapperRef" class="swipe_wrapper">
                    <ConversationItem
                        v-for="(item, index) in showConversationList"
                        :key="index"
                        :source="item"
                        :is-disabled="isDisabledSwipe"
                        @closeAllSwipe="closeAllSwipe"
                    />
                </uni-swipe-action>
            </scroll-view>
        </view>
    </Page>
</template>

<script>
import { mapGetters } from 'vuex';
import ConversationItem from './components/ConversationItem.vue';
import CustomNavBar from '@/components/CustomNavBar/index.vue';

export default {
    components: {
        CustomNavBar,
        ConversationItem
    },
    data() {
        return {
            keyword: '',
            refreshing: false,
            platformID: 0,
            isDisabledSwipe: false
        };
    },
    computed: {
        ...mapGetters([
            'storeConversationList',
            'storeIsSyncing',
            'storeSelfInfo',
            'storeUserID',
            'storeCurrentConversationID'
        ]),
        showConversationList() {
            const isArchvistList = [];
            this.storeConversationList.forEach(item => {
                try {
                    const attachedInfo = JSON.parse(item.attachedInfo);
                    if (attachedInfo.archvist === 1) {
                        isArchvistList.push(item);
                    }
                } catch (err) {
                    //
                }
            });
            return isArchvistList;
        }
    },
    methods: {
        handleToSearch() {
            uni.$u.route(
                '/pages/common/searchRecord/index?searchType=archvist'
            );
        },
        closeAllSwipe() {
            this.$refs.swipeWrapperRef.closeAll();
        }
    }
};
</script>

<style lang="scss" scoped>
.conversation_container {
    @include colBox(false);
    height: 100vh;
    overflow-y: hidden;
}

.z-paging-content {
    flex: 1;
}

.loading_wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.scroll_view {
    flex: 1;
    overflow: hidden;
}
</style>

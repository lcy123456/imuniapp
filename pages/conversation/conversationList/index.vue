<template>
    <view
        class="conversation_container"
        @click="closeAllSwipe"
    >
        <chat-header ref="chatHeaderRef" />
        <view
            class="px-20 pb-20 pt-10 bg-grey"
            @click="handleToSearch"
        >
            <uni-search-bar
                v-model="keyword"
                bg-color="#fff"
                class="h-70"
                placeholder="搜索"
                readonly
            />
        </view>
        <!-- v-if="!storeIsSyncing" -->
        <z-paging
            ref="paging"
            :fixed="false"
            :auto="false"
            default-page-size="20"
            :show-loading-more-no-more-view="false"
            :refresher-enabled="!storeIsSyncing"
            @query="queryList"
            @refresherTouchmove="refresherTouchmove"
            @refresherTouchend="refresherTouchend"
        >
            <u-swipe-action
                ref="swipeWrapperRef"
                class="swipe_wrapper"
            >
                <ConversationItem
                    v-for="item in showConversationList"
                    :key="item.conversationID"
                    :source="item"
                    :is-disabled="isDisabledSwipe"
                    @closeAllSwipe="closeAllSwipe"
                />
            </u-swipe-action>
        </z-paging>

        <!-- <view
            v-else
            class="loading_wrap"
        >
            <u-loading-icon text="同步中" />
        </view> -->
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import ChatHeader from './components/ChatHeader.vue';
import ConversationItem from './components/ConversationItem.vue';

export default {
    components: {
        ChatHeader,
        ConversationItem,
    },
    data () {
        return {
            keyword: '',
            refreshing: false,
            isDisabledSwipe: false
        };
    },
    computed: {
        ...mapGetters(['storeConversationList', 'storeIsSyncing']),
        showConversationList () {
            return this.storeConversationList.filter(v => {
                return v.showName.includes(this.keyword);
            });
        }
    },
    onReady () {
        this.$nextTick(() => plus.navigator.closeSplashscreen());
    },
    watch: {
        showConversationList (val) {
            this.$nextTick(() => {
                this.$refs.paging.complete([...val]);
            });
        }
    },
    methods: {
        handleToSearch () {
            uni.$u.route('/pages/common/searchRecord/index');
        },
        refresherTouchmove () {
            this.isDisabledSwipe = true;
        },
        refresherTouchend () {
            setTimeout(() => {
                this.isDisabledSwipe = false;
            }, 500);
        },
        async queryList (pageNo) {
            const data = await this.$store.dispatch(
                'conversation/getConversationList',
                pageNo === 1
            );
            console.log('xxx', data);
        },
        closeAllSwipe () {
            this.$refs.swipeWrapperRef.closeAll();
        },
    },
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

.swipe_wrapper {
    @include colBox(false);
    flex: 1;
    width: 100%;
    overflow-y: auto;
}

.conversation_list {
    flex: 1;
    width: 100%;
    // position: relative;
    // z-index: -1;
}

.loading_wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/deep/.u-swipe-action-item__right__button__wrapper__text {
    -webkit-line-clamp: 2 !important;
    max-width: 32px;
}
</style>

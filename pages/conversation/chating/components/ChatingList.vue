<template>
    <scroll-view
        id="scroll_view"
        :scroll-with-animation="withAnimation"
        :scroll-top="scrollTop"
        scroll-y
        :scroll-into-view="scrollIntoView"
        upper-threshold="250"
        @touchstart="handleTouchstart"
        @scroll="throttleScroll"
        @scrolltoupper="scrolltoupper"
        @scrolltolower="isRecvToBottom = true"
    >
        <view id="scroll_wrap">
            <u-loadmore
                nomore-text=""
                :status="loadMoreStatus"
            />
            <view
                v-for="item in storeHistoryMessageList"
                :key="item.clientMsgID"
            >
                <MessageItemRender
                    :menu-outside-flag="menuOutsideFlag"
                    :source="item"
                    :is-sender="item.sendID === storeCurrentUserID"
                    :is-show-menu-flag="isShowMenuFlag"
                    :is-multiple-msg="isMultipleMsg"
                    :is-checked="checkedMsgIds.includes(item.clientMsgID)"
                    @menuRect="menuRect"
                />
                <!-- @messageItemRender="messageItemRender" -->
            </view>
            <view
                id="auchormessage_bottom_item"
                style="visibility: hidden; height: 12px"
            />
        </view>
        <view style="height: 0">
            <transition name="fade">
                <MessageMenu
                    v-if="menuState.visible"
                    :message="menuState.message"
                    :pater-rect="menuState.paterRect"
                    @close="menuState.visible = false"
                />
            </transition>
        </view>
    </scroll-view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import MessageItemRender from './MessageItem/index.vue';
import MessageMenu from './MessageMenu.vue';
import { PageEvents } from "@/constant";

export default {
    name: 'ChatingList',
    components: {
        MessageItemRender,
        MessageMenu,
    },
    props: {
        menuOutsideFlag: {
            required: true,
            type: Number,
        },
        isMultipleMsg: {
            type: Boolean,
            default: false,
        },
        checkedMsgIds: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            scrollIntoView: '',
            scrollTop: 0,
            withAnimation: true,
            isRecvToBottom: true,
            hasNewMessage: false,
            messageLoadState: {
                lastMinSeq: 0,
                loading: false,
            },
            isShowMenuFlag: false,
            menuState: {
                visible: false,
                paterRect: {},
                message: {}
            },
            checkedMessage: []
        };
    },
    computed: {
        ...mapGetters([
            'storeCurrentConversation',
            'storeHistoryMessageList',
            'storeHasMoreMessage',
            'storeCurrentUserID',
        ]),
        loadMoreStatus () {
            if (!this.storeHasMoreMessage) {
                return 'nomore';
            }
            return this.messageLoadState.loading ? 'loading' : 'loadmore';
        },
    },
    watch: {
        menuOutsideFlag () {
            if (this.menuState.visible) {
                this.menuState.visible = false;
            }
        },
    },
    created () {
        uni.$on(PageEvents.ScrollToBottom, this.scrollToBottom);
        this.loadMessageList();
    },
    beforeDestroy () {
        uni.$off(PageEvents.ScrollToBottom, this.scrollToBottom);
    },
    methods: {
        ...mapActions('message', ['getHistoryMesageList']),
        async loadMessageList (isLoadMore = false) {
            this.messageLoadState.loading = true;
            const lastMsgID = this.storeHistoryMessageList[0]?.clientMsgID;
            const options = {
                conversationID: this.storeCurrentConversation.conversationID,
                userID: '',
                groupID: '',
                count: 20,
                startClientMsgID: this.storeHistoryMessageList[0]?.clientMsgID ?? '',
                lastMinSeq: this.messageLoadState.lastMinSeq,
            };
            try {
                const { lastMinSeq } = await this.getHistoryMesageList(options);
                this.messageLoadState.lastMinSeq = lastMinSeq;
                if (isLoadMore) {
                    lastMsgID && this.scrollToAnchor(`auchor${lastMsgID}`);
                } else {
                    this.scrollToBottom({ isInit: true });
                }
                this.messageLoadState.loading = false;
            } catch (e) {
                console.log(e);
            }
        },
        handleTouchstart () {
            this.isShowMenuFlag = true;
            this.$emit('touchstart');
        },
        onScroll (event) {
            const { scrollTop, scrollHeight } = event.target;
            this.isRecvToBottom = scrollHeight - scrollTop - uni.getWindowInfo().windowHeight < 80;
            this.isShowMenuFlag = false;
            if (this.menuState.visible) {
                this.menuState.visible = false;
            }
        },
        throttleScroll (event) {
            uni.$u.throttle(() => this.onScroll(event), 200);
        },
        scrolltoupper () {
            if (!this.messageLoadState.loading && this.storeHasMoreMessage) {
                this.loadMessageList(true);
            }
        },
        scrollToAnchor (auchor) {
            this.$nextTick(function () {
                this.scrollIntoView = auchor;
            });
        },
        async scrollToBottom ({isInit = false, isRecv = false}) {
            await this.$nextTick();
            setTimeout(() => {

                if (isInit) {
                    this.withAnimation = false;
                    setTimeout(() => (this.withAnimation = true), 500);
                } else if (isRecv && !this.isRecvToBottom) {
                    this.hasNewMessage = true;
                    return;
                }
                
                uni.createSelectorQuery()
                    .in(this)
                    .select('#scroll_wrap')
                    .boundingClientRect((res) => {
                        this.scrollTop = res.height + Math.random();
                        isInit && this.$emit('initSuccess');
                    })
                    .exec();
            }, 100);
        },
        menuRect (res) {
            // console.log('menuRect', res);
            this.menuState.paterRect = {
                ...res,
                message: undefined
            };
            this.menuState.message = res.message;
            this.menuState.visible = true;
        }
    },
};
</script>

<style lang="scss" scoped>
#scroll_view {
    flex: 1;
    overflow: hidden;

    #scroll_wrap {
        min-height: 100%;
        overflow: hidden;
        padding: 0 30rpx;
    }

    .fade-leave,
    .fade-enter-to {
        opacity: 1;
    }

    .fade-leave-active,
    .fade-enter-active {
        transition: all 0.5s;
    }

    .fade-leave-to,
    .fade-enter {
        opacity: 0;
    }
}
</style>

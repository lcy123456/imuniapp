<template>
    <scroll-view
        id="scroll_view"
        :class="{isrotate: isReverse}"
        :scroll-with-animation="withAnimation"
        :scroll-top="scrollTop"
        :scroll-into-view="scrollIntoView"
        scroll-y
        :upper-threshold="250"
        @touchstart="handleTouchstart"
        @scroll="throttleScroll"
        @scrolltoupper="scrolltoupper"
        @scrolltolower="scrolltolower"
    >
        <view>
            <view
                id="scroll_wrap"
            >
                <view
                    id="auchormessage_bottom_item"
                    style="visibility: hidden; height: 12px"
                />
                <view
                    v-for="item in messageList"
                    :key="`auchor${item.clientMsgID}`"
                    :class="{isrotate: isReverse}"
                >
                    <MessageItemRender
                        :menu-outside-flag="menuOutsideFlag"
                        :source="item"
                        :is-sender="item.sendID === storeCurrentUserID"
                        :is-show-menu-flag="isShowMenuFlag"
                        :is-multiple-msg="isMultipleMsg"
                        :is-checked="checkedMsgIds.includes(item.clientMsgID)"
                        :position-msg-i-d="positionMsgID"
                        @menuRect="menuRect"
                    />
                    <!-- @messageItemRender="messageItemRender" -->
                </view>
                <u-loadmore
                    :class="{isrotate: isReverse}"
                    nomore-text=""
                    :status="loadMoreStatus"
                />
            </view>
            <view
                :class="{isrotate: isReverse}"
                style="height: 0"
            >
                <transition name="fade">
                    <MessageMenu
                        v-if="menuState.visible"
                        :message="menuState.message"
                        :pater-rect="menuState.paterRect"
                        @close="menuState.visible = false"
                    />
                </transition>
            </view>
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
        },
        positionMsgID: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            isReverse: true,
            ua: uni.getSystemInfoSync().platform,
            scrollIntoView: '',
            scrollTop: 0,
            withAnimation: true,
            isRecvToBottom: true,
            hasNewMessage: false,
            messageLoadState: {
                loading: false,
            },
            isShowMenuFlag: false,
            positionMsgIDFlag: true,
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
        messageList () {
            return this.isReverse ? (JSON.parse(JSON.stringify(this.storeHistoryMessageList))).reverse() : this.storeHistoryMessageList;
        }
    },
    watch: {
        menuOutsideFlag () {
            if (this.menuState.visible) {
                this.menuState.visible = false;
            }
        },
    },
    mounted () {
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
            };
            try {
                if (isLoadMore) {
                    await this.getHistoryMesageList(options);
                    if (this.positionMsgID && this.positionMsgIDFlag) {
                        this.handlePositionMsgID();
                    } else {
                        lastMsgID && this.scrollToAnchor(`auchor${lastMsgID}`, false);
                    }
                } else {
                    await this.getHistoryMesageList({
                        ...options,
                        isInit: true
                    });
                    this.scrollToBottom({ initPage: true });
                    this.positionMsgID && this.handlePositionMsgID();
                }
            } catch (e) {
                console.log(e);
            }
            setTimeout(() => {
                this.messageLoadState.loading = false;
            }, 1000);
        },
        handleTouchstart () {
            this.isShowMenuFlag = true;
            this.$emit('touchstart');
        },
        onScroll (event) {
            const { scrollHeight } = event.target;
            this.isRecvToBottom = scrollHeight - uni.getWindowInfo().windowHeight < 80;
            this.isShowMenuFlag = false;
            if (this.menuState.visible) {
                this.menuState.visible = false;
            }
        },
        throttleScroll (event) {
            uni.$u.throttle(() => this.onScroll(event), 200);
        },
        scrolltoupper () {
            if (!this.isReverse) {
                if (!this.messageLoadState.loading && this.storeHasMoreMessage) {
                    this.loadMessageList(true);
                }
            } else {
                this.isRecvToBottom = true;
            }
        },
        scrolltolower () {
            if (this.isReverse) {
                if (!this.messageLoadState.loading && this.storeHasMoreMessage) {
                    this.loadMessageList(true);
                }
            } else {
                this.isRecvToBottom = true;
            }
        },
        scrollToAnchor (auchor, isAnimation = true) {
            console.log('滚动id', auchor);
            !isAnimation && this.closeScrollAnimation();
            this.$nextTick(() => {
                this.scrollIntoView = this.isReverse ? '' : auchor;
            });
        },
        async scrollToBottom ({initPage = false, isRecv = false} = {}) {
            await this.$nextTick();
            setTimeout(() => {
                // console.log('scrollToBottom');
                if (initPage) {
                    this.closeScrollAnimation();
                } else if (isRecv && !this.isRecvToBottom) {
                    this.hasNewMessage = true;
                    return;
                }
                uni.createSelectorQuery()
                    .in(this)
                    .select('#scroll_wrap')
                    .boundingClientRect((res) => {
                        this.scrollTop = this.isReverse ? '' : res.height + Math.random();
                        initPage && this.$emit('initSuccess');
                    })
                    .exec();
            }, 100);
        },
        closeScrollAnimation () {
            this.withAnimation = false;
            setTimeout(() => (this.withAnimation = true), 500);
        },
        handlePositionMsgID () {
            setTimeout(() => {
                const ids = this.storeHistoryMessageList.map(v => v.clientMsgID);
                if (ids.includes(this.positionMsgID)) {
                    this.scrollToAnchor(`auchor${this.positionMsgID}`);
                    this.positionMsgIDFlag = false;
                } else {
                    this.messageLoadState.loading = false;
                    this.loadMessageList(true);
                }
            }, 300);
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
.isrotate {
    transform-style: preserve-3d;
    transform:rotateX(180deg);
    -ms-transform:rotateX(180deg);
    -moz-transform:rotateX(180deg);
    -webkit-transform:rotateX(180deg);
    -o-transform:rotateX(180deg);
}
#scroll_view {
    flex: 1;
    overflow: hidden;

    #scroll_wrap {
        min-height: 100%;
        overflow: hidden;
        // padding: 0 30rpx;
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

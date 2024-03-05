<template>
    <scroll-view
        id="scroll_view"
        :class="{ isrotate: isReverse }"
        :scroll-with-animation="animation"
        :scroll-top="scrollTop"
        :scroll-into-view="scrollIntoView"
        scroll-y
        :upper-threshold="0"
        @touchstart="handleTouchstart"
        @touchend="$emit('touchend')"
        @scroll="throttleScroll"
        @scrolltoupper="scrolltoupper"
        @scrolltolower="scrolltolower"
    >
        <view>
            <view id="scroll_wrap">
                <view
                    v-if="isReverse"
                    id="auchormessage_bottom_item"
                    style="visibility: hidden; height: 12px"
                />
                <u-loadmore
                    v-if="!isReverse"
                    :class="{ isrotate: isReverse }"
                    nomore-text=""
                    :status="loadMoreStatus"
                />
                <view
                    v-for="(item, index) in messageList"
                    :id="`auchor-${item.clientMsgID}`"
                    :key="
                        !showMediaRender(item)
                            ? `auchor-${index}-${item.clientMsgID}`
                            : `auchor-${item.clientMsgID}`
                    "
                    :class="{ isrotate: isReverse }"
                >
                    <BetweenTime
                        :key="
                            !showMediaRender(item)
                                ? `auchor-${index}-${item.clientMsgID}-BetweenTime`
                                : `auchor-${item.clientMsgID}-BetweenTime`
                        "
                        :msg-before="isReverse ? item : messageList[index - 1]"
                        :msg-after="isReverse ? messageList[index + 1] : item"
                        :is-reverse="isReverse"
                        :type="
                            (!isReverse && index === 0) ||
                            (isReverse && index === messageList.length - 1)
                                ? 'first'
                                : ''
                        "
                    />
                    <MessageItemRender
                        :key="
                            !showMediaRender(item)
                                ? `auchor-${index}-${item.clientMsgID}-MessageItemRender`
                                : `auchor-${item.clientMsgID}-MessageItemRender`
                        "
                        :source="item"
                        :is-sender="item.sendID === storeCurrentUserID"
                        :is-show-menu-flag="isShowMenuFlag"
                        :is-multiple-msg="isMultipleMsg"
                        :is-checked="checkedMsgIds.includes(item.clientMsgID)"
                        :position-msg-i-d="positionMsgID"
                        @menuRect="menuRect"
                    />
                </view>
                <view
                    v-if="!isReverse"
                    id="auchormessage_bottom_item"
                    style="visibility: hidden; height: 12px"
                />
                <u-loadmore
                    v-if="isReverse"
                    :class="{ isrotate: isReverse }"
                    nomore-text=""
                    :status="loadMoreStatus"
                />
            </view>
        </view>
    </scroll-view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import MessageItemRender from './MessageItem/index.vue';
import BetweenTime from './BetweenTime.vue';
import { PageEvents, TextRenderTypes, MediaRenderTypes } from '@/constant';

export default {
    name: 'ChatingList',
    components: {
        MessageItemRender,
        BetweenTime
    },
    props: {
        isMultipleMsg: {
            type: Boolean,
            default: false
        },
        checkedMsgIds: {
            type: Array,
            default: () => []
        },
        clientMsgID: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            positionMsgID: '',
            conversationID: '',
            animation: true,
            isReverse: true,
            isInReverse: false,
            ua: uni.getSystemInfoSync().platform,
            scrollIntoView: '',
            scrollTop: 0,
            seq: 0,
            isRecvToBottom: true,
            hasNewMessage: false,
            messageLoadState: {
                loading: false
            },
            isShowMenuFlag: false,
            positionMsgIDFlag: true,
            checkedMessage: []
        };
    },
    computed: {
        ...mapGetters([
            'storeCurrentConversation',
            'storeHistoryMessageList',
            'storeHistoryMessageListReverse',
            'storeHasMoreMessage',
            'storeHasMoreAfterMessage',
            'storeIsShowSetEnd',
            'storeCurrentUserID'
        ]),
        loadMoreStatus() {
            if (!this.storeHasMoreMessage) {
                return 'nomore';
            }
            return this.messageLoadState.loading ? 'loading' : 'loadmore';
        },
        messageList() {
            return this.isReverse
                ? this.storeHistoryMessageListReverse
                : this.storeHistoryMessageList;
        }
    },
    mounted() {
        this.conversationID = this.storeCurrentConversation.conversationID;
        this.positionMsgID = this.clientMsgID;
        uni.$on(PageEvents.ScrollToBottom, this.scrollToBottom);
        uni.$on('reloadMore', this.reloadMore);
        this.init();
    },
    beforeDestroy() {
        this.init();
        uni.$off(PageEvents.ScrollToBottom, this.scrollToBottom);
        uni.$off('reloadMore', this.reloadMore);
    },
    methods: {
        ...mapActions('message', [
            'getHistoryMesageList',
            'getHistoryMesageListReverse',
            'setLessMessageList'
        ]),
        showTextRender(message) {
            return TextRenderTypes.includes(message.contentType);
        },
        showMediaRender(message) {
            return MediaRenderTypes.includes(message.contentType);
        },
        init() {
            this.$store.commit('conversation/SET_IS_SCROLL_WAY', false);
            this.loadMessageList({});
        },
        setPositionMsgID(positionMsgID, seq) {
            this.positionMsgID = positionMsgID;
            this.seq = seq;
        },
        async loadMessageList({
            isLoadMore = false,
            isReverse = false,
            isSyncing = false
        }) {
            this.messageLoadState.loading = true;
            const count = 40;
            const options = {
                conversationID: this.conversationID,
                userID: '',
                groupID: '',
                count,
                isSyncing
            };
            try {
                if (isLoadMore) {
                    await this[
                        !isReverse
                            ? 'getHistoryMesageList'
                            : 'getHistoryMesageListReverse'
                    ](options);
                } else {
                    const data = await this[
                        !isReverse
                            ? 'getHistoryMesageList'
                            : 'getHistoryMesageListReverse'
                    ]({
                        ...options,
                        positionMsgID: this.positionMsgID,
                        isInit: true,
                        seq: this.seq,
                        count: this.positionMsgID ? parseInt(count / 2) : count
                    });
                    if (!data || !data.length) return;
                    if (this.positionMsgID) {
                        const map =
                            this.storeHistoryMessageList[
                                this.storeHistoryMessageList.length - 1
                            ];
                        let positionMsgID = map.clientMsgID;
                        let seq = map.seq;
                        await this[
                            isReverse
                                ? 'getHistoryMesageList'
                                : 'getHistoryMesageListReverse'
                        ]({
                            ...options,
                            positionMsgID,
                            seq,
                            isInit: true,
                            count: parseInt(count / 2)
                        });
                        this.scrollToAnchor(`auchor-${positionMsgID}`);
                    } else {
                        this.scrollToBottom({ initPage: true });
                    }
                }
            } catch (e) {
                console.log(e);
            }
            setTimeout(() => {
                this.messageLoadState.loading = false;
            }, 500);
        },
        handleTouchstart() {
            this.isShowMenuFlag = true;
            this.$emit('touchstart');
        },
        onScroll(event) {
            const { scrollHeight, scrollTop } = event.target;
            const height =
                scrollHeight +
                200 -
                scrollTop -
                uni.getWindowInfo().windowHeight;
            const isScrollWay =
                (!this.isReverse && height > 700) ||
                (this.isReverse && scrollTop > 700);
            this.$store.commit('conversation/SET_IS_SCROLL_WAY', isScrollWay);
            this.isRecvToBottom =
                scrollHeight - uni.getWindowInfo().windowHeight < 80;
            this.isShowMenuFlag = false;
            this.$emit('scroll');
        },
        throttleScroll(event) {
            uni.$u.throttle(() => this.onScroll(event), 200);
        },
        scrolltoupper() {
            if (!this.isReverse) {
                if (
                    !this.messageLoadState.loading &&
                    this.storeHasMoreMessage
                ) {
                    this.isReverse = true;
                    this.scrollToTop();
                    this.isInReverse = true;
                    setTimeout(() => {
                        this.loadMessageList({ isLoadMore: true });
                        this.isInReverse = false;
                    }, 500);
                }
            } else {
                if (
                    !this.messageLoadState.loading &&
                    this.storeHasMoreAfterMessage
                ) {
                    this.isReverse = false;
                    this.scrollToBottom({
                        changeRotate: true
                    });
                    this.isInReverse = true;
                    setTimeout(() => {
                        this.loadMessageList({
                            isLoadMore: true,
                            isReverse: true
                        });
                        this.isInReverse = false;
                    }, 500);
                }
            }
        },
        scrolltolower() {
            if (this.isInReverse) return;
            if (this.isReverse) {
                if (
                    !this.messageLoadState.loading &&
                    this.storeHasMoreMessage
                ) {
                    this.loadMessageList({ isLoadMore: true });
                }
            } else {
                if (
                    !this.messageLoadState.loading &&
                    this.storeHasMoreAfterMessage
                ) {
                    this.loadMessageList({
                        isLoadMore: true,
                        isReverse: true
                    });
                }
            }
        },
        reloadMore() {
            this.loadMessageList({
                isLoadMore: false,
                isReverse: false,
                isSyncing: true
            });
        },
        async scrollToAnchor(auchor) {
            this.isReverse = false;
            await this.$nextTick();
            setTimeout(() => {
                this.scrollIntoView = auchor;
            }, 500);
        },
        async scrollToTop({ initPage = false } = {}) {
            initPage && this.$emit('initSuccess');
            setTimeout(() => {
                uni.createSelectorQuery()
                    .in(this)
                    .select('#scroll_wrap')
                    .boundingClientRect(res => {
                        this.scrollTop = this.isReverse
                            ? res.height + Math.random()
                            : initPage
                              ? 0
                              : Math.random();
                    })
                    .exec();
            }, 200);
        },
        async scrollToBottom({ initPage = false, changeRotate = false } = {}) {
            initPage && this.$emit('initSuccess');
            await this.$nextTick();
            setTimeout(() => {
                uni.createSelectorQuery()
                    .in(this)
                    .select('#scroll_wrap')
                    .boundingClientRect(res => {
                        this.scrollTop = this.isReverse
                            ? Math.random()
                            : res.height + (initPage ? 0 : Math.random());
                        setTimeout(() => {
                            !changeRotate && this.setMessageList();
                        }, 500);
                    })
                    .exec();
            }, 200);
        },
        setMessageList() {
            this.setLessMessageList({
                conversationID: this.conversationID
            });
        },
        menuRect(res) {
            this.$emit('menuRect', res);
        }
    }
};
</script>

<style lang="scss" scoped>
.isrotate {
    // transform-style: preserve-3d;
    transform: rotateX(180deg);
    -ms-transform: rotateX(180deg);
    -moz-transform: rotateX(180deg);
    -webkit-transform: rotateX(180deg);
    -o-transform: rotateX(180deg);
}
#scroll_view {
    flex: 1;
    overflow: hidden;
    #scroll_wrap {
        min-height: 100%;
        overflow: hidden;
        // padding: 0 30rpx;
    }
}
</style>

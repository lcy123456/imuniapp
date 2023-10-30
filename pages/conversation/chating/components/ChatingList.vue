<template>
    <scroll-view
        id="scroll_view"
        :class="{isrotate: isReverse}"
        :scroll-with-animation="true"
        :scroll-top="scrollTop"
        :scroll-into-view="scrollIntoView"
        scroll-y
        :upper-threshold="0"
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
                    v-if="isReverse"
                    id="auchormessage_bottom_item"
                    style="visibility: hidden; height: 12px"
                />
                <u-loadmore
                    v-else
                    :class="{isrotate: isReverse}"
                    nomore-text=""
                    :status="loadMoreStatus"
                />
                <view
                    v-for="(item, index) in messageList"
                    :key="`auchor${item.clientMsgID}`"
                    :class="{isrotate: isReverse}"
                >
                    <BetweenTime
                        :msg-before="isReverse ? item : messageList[index - 1]"
                        :msg-after="isReverse ? messageList[index + 1]: item"
                        :is-reverse="isReverse"
                        :type="(!isReverse && index === 0) || (isReverse && index === messageList.length - 1) ? 'first' : ''"
                    />
                    <MessageItemRender
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
                <view
                    v-if="!isReverse"
                    id="auchormessage_bottom_item"
                    style="visibility: hidden; height: 12px"
                />
                <u-loadmore
                    v-else
                    :class="{isrotate: isReverse}"
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
import { PageEvents } from "@/constant";

export default {
    name: 'ChatingList',
    components: {
        MessageItemRender,
        BetweenTime
    },
    props: {
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
            isReverse: false,
            isInReverse: false,
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
            'storeCurrentUserID',
        ]),
        loadMoreStatus () {
            if (!this.storeHasMoreMessage) {
                return 'nomore';
            }
            return this.messageLoadState.loading ? 'loading' : 'loadmore';
        },
        messageList () {
            return this.isReverse ? this.storeHistoryMessageListReverse : this.storeHistoryMessageList;
        }
    },
    mounted () {
        uni.$on(PageEvents.ScrollToBottom, this.scrollToBottom);
        this.loadMessageList({});
    },
    beforeDestroy () {
        uni.$off(PageEvents.ScrollToBottom, this.scrollToBottom);
    },
    methods: {
        ...mapActions('message', ['getHistoryMesageList', 'getHistoryMesageListReverse']),
        async loadMessageList ({isLoadMore = false, isReverse = false}) {
            this.messageLoadState.loading = true;
            // const lastMsgID = this.storeHistoryMessageList[0]?.clientMsgID;
            const options = {
                conversationID: this.storeCurrentConversation.conversationID,
                userID: '',
                groupID: '',
                count: 40
            };
            try {
                if (isLoadMore) {
                    await this[!isReverse ? 'getHistoryMesageList' : 'getHistoryMesageListReverse'](options);
                    // if (this.positionMsgID && this.positionMsgIDFlag) {
                    //     this.handlePositionMsgID();
                    // } else {
                    //     lastMsgID && this.scrollToAnchor(`auchor${lastMsgID}`, false);
                    // }
                } else {
                    await this[!isReverse ? 'getHistoryMesageList' : 'getHistoryMesageListReverse']({
                        ...options,
                        positionMsgID: this.positionMsgID,
                        isInit: true,
                        count: this.positionMsgID ? 20 : 40
                    });
                    if (this.positionMsgID) {
                        let positionMsgID = this.storeHistoryMessageList[this.storeHistoryMessageList.length - 1].clientMsgID;
                        await this[isReverse ? 'getHistoryMesageList' : 'getHistoryMesageListReverse']({
                            ...options,
                            positionMsgID: positionMsgID,
                            count: 20
                        });
                        this.scrollToAnchor(`auchor${positionMsgID}`, false);
                    } else {
                        this.scrollToBottom({ initPage: true });
                    }
                    // this.positionMsgID && this.handlePositionMsgID();
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
            const { scrollHeight, scrollTop } = event.target;
            const height = (scrollHeight + 200) - scrollTop - uni.getWindowInfo().windowHeight;
            const isScrollWay = (!this.isReverse && (height > 700))
                || (this.isReverse && (scrollTop > 700));
            this.$store.commit('conversation/SET_IS_SCROLL_WAY', isScrollWay);
            this.isRecvToBottom = scrollHeight - uni.getWindowInfo().windowHeight < 80;
            this.isShowMenuFlag = false;
            this.$emit('scroll');
        },
        throttleScroll (event) {
            uni.$u.throttle(() => this.onScroll(event), 200);
        },
        scrolltoupper () {
            if (!this.isReverse) {
                if (!this.messageLoadState.loading && this.storeHasMoreMessage) {
                    this.isReverse = true;
                    this.scrollToTop();
                    this.isInReverse = true;
                    setTimeout(() => {
                        this.loadMessageList({ isLoadMore: true });
                        this.isInReverse = false;
                    }, 500);
                }
            } else {
                // this.isRecvToBottom = true;
                if (!this.messageLoadState.loading && this.storeHasMoreAfterMessage) {
                    this.isReverse = false;
                    this.scrollToBottom();
                    this.isInReverse = true;
                    setTimeout(() => {
                        this.loadMessageList({ isLoadMore: true, isReverse: true });
                        this.isInReverse = false;
                    }, 500);
                }
            }
        },
        scrolltolower () {
            if (this.isInReverse) return;
            if (this.isReverse) {
                if (!this.messageLoadState.loading && this.storeHasMoreMessage) {
                    this.loadMessageList({ isLoadMore: true });
                }
            } else {
                // this.isRecvToBottom = true;
                if (!this.messageLoadState.loading && this.storeHasMoreAfterMessage) {
                    this.loadMessageList({ isLoadMore: true, isReverse: true });
                }
            }
        },
        scrollToAnchor (auchor, isAnimation = true) {
            !isAnimation && this.closeScrollAnimation();
            this.$nextTick(() => {
                setTimeout(() => {
                    this.scrollIntoView = auchor;
                }, 100);
            });
        },
        async scrollToTop ({initPage = false} = {}) {
            initPage && this.$emit('initSuccess');
            setTimeout(() => {
                uni.createSelectorQuery()
                    .in(this)
                    .select('#scroll_wrap')
                    .boundingClientRect((res) => {
                        this.scrollTop = this.isReverse ? res.height + Math.random() : 0;
                    })
                    .exec();
            }, 200);
        },
        async scrollToBottom ({initPage = false} = {}) {
            initPage && this.$emit('initSuccess');
            setTimeout(() => {
                uni.createSelectorQuery()
                    .in(this)
                    .select('#scroll_wrap')
                    .boundingClientRect((res) => {
                        this.scrollTop = this.isReverse ? 0 : res.height + Math.random();
                    })
                    .exec();
            }, 200);
        },
        closeScrollAnimation () {
            this.withAnimation = false;
            setTimeout(() => (this.withAnimation = true), 500);
        },
        // handlePositionMsgID () {
        //     setTimeout(() => {
        //         const ids = this.storeHistoryMessageList.map(v => v.clientMsgID);
        //         if (ids.includes(this.positionMsgID)) {
        //             this.scrollToAnchor(`auchor${this.positionMsgID}`);
        //             this.positionMsgIDFlag = false;
        //         } else {
        //             this.messageLoadState.loading = false;
        //             this.loadMessageList({ isLoadMore: true, positionMsgID: this.positionMsgID });
        //         }
        //     }, 300);
        // },
        menuRect (res) {
            this.$emit('menuRect', res);
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
}
</style>

<template>
    <scroll-view
        id="scroll_view"
        :scroll-with-animation="withAnimation"
        :style="{height:'1px'}"
        :scroll-top="scrollTop"
        scroll-y
        :scroll-into-view="scrollIntoView"
        upper-threshold="250"
        @click="click"
        @scroll="throttleScroll"
        @scrolltoupper="scrolltoupper"
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
                <message-item-render
                    :menu-outside-flag="menuOutsideFlag"
                    :source="item"
                    :is-sender="item.sendID === storeCurrentUserID"
                    @messageItemRender="messageItemRender"
                />
            </view>
            <view
                id="auchormessage_bottom_item"
                style="visibility: hidden;height: 12px;"
            />
        </view>
    </scroll-view>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import MessageItemRender from './MessageItem/index.vue';

export default {
    name: "ChatingList",
    components: {
        MessageItemRender
    },
    props: {
        menuOutsideFlag: {
            required: true,
            type: Number
        },
    },
    data () {
        return {
            scrollIntoView: '',
            scrollWithAnimation: false,
            scrollTop: 0,
            // old: {
            // 	scrollTop: 0
            // },
            initFlag: true,
            isOverflow: false,
            needScoll: true,
            withAnimation: false,
            messageLoadState: {
                lastMinSeq: 0,
                loading: false
            },
        };
    },
    computed: {
        ...mapGetters(['storeCurrentConversation', 'storeHistoryMessageList', 'storeHasMoreMessage',
            'storeCurrentUserID'
        ]),
        loadMoreStatus () {
            console.log(this.storeHistoryMessageList);
            if (!this.storeHasMoreMessage) {
                return 'nomore';
            }
            return this.messageLoadState.loading ? 'loading' : 'loadmore';
        },
    },
    mounted () {
        this.loadMessageList();
    },
    methods: {
        ...mapActions('message', ['getHistoryMesageList']),
        messageItemRender (clientMsgID) {
            if (this.initFlag && clientMsgID === this.storeHistoryMessageList[this.storeHistoryMessageList
                .length - 1]
                .clientMsgID) {
                this.initFlag = false;
                setTimeout(() => this.scrollToBottom(true), 200);
            }
        },
        async loadMessageList (isLoadMore = false) {
            this.messageLoadState.loading = true;
            const lastMsgID = this.storeHistoryMessageList[0]?.clientMsgID;
            const options = {
                conversationID: this.storeCurrentConversation.conversationID,
                userID: "",
                groupID: "",
                count: 20,
                startClientMsgID: this.storeHistoryMessageList[0]?.clientMsgID ?? "",
                lastMinSeq: this.messageLoadState.lastMinSeq,
            };
            try {
                const {
                    emptyFlag,
                    lastMinSeq
                } = await this.getHistoryMesageList(options);
                this.messageLoadState.lastMinSeq = lastMinSeq;
                if (emptyFlag) {
                    this.$emit('initSuccess');
                }
            } catch (e) {
                console.log(e);
            }
            this.$nextTick(function () {
                if (isLoadMore && lastMsgID) {
                    this.scrollToAnchor(`auchor${lastMsgID}`);
                }
                this.messageLoadState.loading = false;
            });
        },
        click (e) {
            this.$emit('click', e);
        },
        onScroll (event) {
            const {
                scrollHeight,
                scrollTop
            } = event.target;
            this.needScoll = (scrollHeight - scrollTop) < uni.getWindowInfo().windowHeight * 1.2;
        },
        throttleScroll (event) {
            uni.$u.throttle(() => this.onScroll(event), 200);
        },
        scrolltoupper () {
            if (!this.messageLoadState.loading && this.storeHasMoreMessage) {
                this.loadMessageList(true);
            }
        },
        scrollToBottom (isInit = false, isRecv = false) {
            if (isRecv && !this.needScoll) {
                return;
            }

            if (!isInit) {
                this.withAnimation = true;
                setTimeout(() => this.withAnimation = false, 100);
            }

            this.$nextTick(() => {
                uni.createSelectorQuery().in(this).select('#scroll_wrap').boundingClientRect((res) => {
                    // let top = res.height - this.scrollViewHeight;
                    // if (top > 0) {
                    this.scrollTop = res.height;
                    if (isInit) {
                        this.$emit('initSuccess');
                    }
                    // }
                }).exec();
            });
        },
        scrollToAnchor (auchor) {
            this.$nextTick(function () {
                this.scrollIntoView = auchor;
            });
        },
    }
};
</script>

<style lang="scss" scoped>
	#scroll_view {
		flex: 1;
        
        .uni-scroll-view {
            position: relative;
        }

        #scroll_wrap {
            overflow: hidden;
            padding: 0 30rpx;
        }
	}

</style>

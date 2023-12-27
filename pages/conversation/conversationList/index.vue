<template>
    <Page>
        <view
            class="conversation_container"
            @click="closeAllSwipe"
        >
            <chat-header ref="chatHeaderRef" />
            <view
                class="px-20 pt-10 pb-20 bg-grey"
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
            <PcLoginTip
                v-if="platformID !== 0"
                :platform-i-d="platformID"
            />
            <!-- v-if="!storeIsSyncing" -->
            <!-- <z-paging
                ref="paging"
                :fixed="false"
                :auto="false"
                default-page-size="20"
                :show-loading-more-no-more-view="false"
                :refresher-enabled="!storeIsSyncing"
                @query="queryList"
> -->
            <scroll-view
                class="scroll_view"
                :scroll-with-animation="true"
                scroll-y
                :upper-threshold="0"
                @scrolltolower="queryList"
            >
                <!-- @refresherTouchmove="refresherTouchmove"
                @refresherTouchend="refresherTouchend" -->
                <u-swipe-action
                    ref="swipeWrapperRef"
                    class="swipe_wrapper"
                >
                    <ConversationItem
                        v-for="item in showConversationList"
                        :key="`${(item.conversationID)}-ConversationItem`"
                        :source="item"
                        :is-disabled="isDisabledSwipe"
                        @closeAllSwipe="closeAllSwipe"
                    />
                </u-swipe-action>
            </scroll-view>
            <!-- </z-paging> -->

        <!-- <view
            v-else
            class="loading_wrap"
        >
            <u-loading-icon text="同步中" />
        </view> -->
        </view>
    </Page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ChatHeader from './components/ChatHeader.vue';
import PcLoginTip from './components/PcLoginTip.vue';
import ConversationItem from './components/ConversationItem.vue';
import { prepareConversationState } from '@/util/imCommon';
import { PageEvents } from "@/constant";
import { videoGetToken, videoGetOfflineInfo } from '@/api/incoming';
import { authGetPcLoginPlatform } from '@/api/login';
import { AudioVideoType, AudioVideoStatus } from '@/enum';

export default {
    components: {
        ChatHeader,
        ConversationItem,
        PcLoginTip
    },
    data () {
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
        showConversationList () {
            return this.storeConversationList;
        },
    },
    onReady () {
        this.$nextTick(() => plus.navigator.closeSplashscreen());
    },
    watch: {
        // showConversationList (val) {
        //     this.$nextTick(() => {
        //         this.$refs.paging.complete([...val]);
        //     });
        // }
    },
    onLoad () {
        this.timer = setInterval(() => {
            this.authGetPcLoginPlatform();
        }, 3000);
        this.getCall();
        uni.$on(PageEvents.ClickPushMessage, this.handlePushConversation);
    },
    onUnload () {
        clearInterval(this.timer);
        uni.$off(PageEvents.ClickPushMessage, this.handlePushConversation);
    },
    methods: {
        ...mapActions('incomingCall', ['appearLoadingCall']),
        async authGetPcLoginPlatform () {
            try {
                const { platformID } = await authGetPcLoginPlatform();
                this.platformID = platformID;
            } catch (err) {
                console.log(err);
            }
        },
        async getCall () {
            try {
                const { sendID, room, type } = await videoGetOfflineInfo({
                    recvID: this.storeUserID
                });
                if (!room) {
                    return;
                }
                const newServerMsg = {
                    contentType: 110,
                    customElem: {
                        data: JSON.stringify({
                            type,
                            status: AudioVideoStatus.Send
                        })
                    },
                    groupID: '',
                    sendID,
                    recvID: this.storeUserID,
                    sessionType: 1,
                    type: type === AudioVideoType.Video ? 'video' : 'audio'
                };
                const { token } = await videoGetToken({
                    recvID: this.storeUserID,
                    conversationID: room
                });
                this.$store.commit('incomingCall/SET_INCOMING_CALL_TOKEN', token);
                this.appearLoadingCall(newServerMsg);
            } catch (err) {
                console.log('-------11', err);
            }
        },
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
        async queryList () {
            await this.$store.dispatch(
                'conversation/getConversationList',
                false
            );
        },
        closeAllSwipe () {
            this.$refs.swipeWrapperRef.closeAll();
        },
        handlePushConversation (conversationID) {
            const source = this.storeConversationList.find(v => v.conversationID === conversationID);
            if (!source) return;
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            const page = currentPage.route;
            if (page === `pages/conversation/chating/index` && conversationID === this.storeCurrentConversationID) return;
            setTimeout(() => {
                prepareConversationState(source);
            }, 300);
        }
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
    // @include colBox(false);
    // flex: 1;
    // width: 100%;
    // overflow-y: auto;
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

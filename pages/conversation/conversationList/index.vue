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
            <!-- v-if="!storeIsSyncing" -->
            <z-paging
                ref="paging"
                :fixed="false"
                :auto="false"
                default-page-size="20"
                :show-loading-more-no-more-view="false"
                :refresher-enabled="!storeIsSyncing"
                @query="queryList"
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
            </z-paging>

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
import ConversationItem from './components/ConversationItem.vue';
import { prepareConversationState } from '@/util/imCommon';
import { PageEvents } from "@/constant";
import { videoGetToken, videoGetOfflineInfo, videoGetLivekitUrl } from '@/api/incoming';
import { AudioVideoType, AudioVideoStatus } from '@/enum';

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
        showConversationList (val) {
            this.$nextTick(() => {
                this.$refs.paging.complete([...val]);
            });
        }
    },
    onLoad () {
        this.videoGetLivekitUrl();
        this.getCall();
        uni.$on(PageEvents.ClickPushMessage, this.handlePushConversation);
    },
    onUnload () {
        uni.$off(PageEvents.ClickPushMessage, this.handlePushConversation);
    },
    methods: {
        ...mapActions('incomingCall', ['appearLoadingCall']),
        async videoGetLivekitUrl () {
            try {
                const { url } = await videoGetLivekitUrl();
                console.log('urlurlurlurlurlurl', url);
                this.$store.commit('incomingCall/SET_WSURL', url);
            } catch (err) {
                console.log('url---', err);
            }
        },
        async getCall () {
            try {
                const { sendID, room, type } = await videoGetOfflineInfo({
                    recvID: this.storeUserID
                });
                if (!room) {
                    console.log('-------------------------没人请求通话');
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
                console.log(token);
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
        async queryList (pageNo) {
            await this.$store.dispatch(
                'conversation/getConversationList',
                pageNo === 1
            );
            // console.log('xxx', data);
        },
        closeAllSwipe () {
            this.$refs.swipeWrapperRef.closeAll();
        },
        handlePushConversation (conversationID) {
            console.log(PageEvents.ClickPushMessage, conversationID);
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
</style>

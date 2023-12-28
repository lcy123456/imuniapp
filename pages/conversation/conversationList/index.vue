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
                    :key="key"
                    ref="swipeWrapperRef"
                    class="swipe_wrapper"
                >
                    <ConversationItem
                        v-for="(item) in showConversationList"
                        :key="`${(item.conversationID)}-ConversationItem`"
                        :source="item"
                        :is-disabled="item.isArchvistItem"
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
            key: '',
            keyword: '',
            refreshing: false,
            platformID: 0,
            isDisabledSwipe: false,
            isArchvistItem: {
                isArchvistItem: true,
                unreadCount: 0,
                groupAtType: 0,
                isPrivateChat: false,
                groupID: '',
                isNotInGroup: false,
                draftText: '',
                userID: '',
                latestMsgSendTime: 0,
                maxSeq: 0,
                showName: '归档信息',
                conversationID: '',
                conversationType: 0,
                isPinned: false,
                attachedInfo: JSON.stringify({
                    archvist: 1
                }),
                ex: '',
                hasReadSeq: 0,
                updateUnreadCountTime: 0,
                recvMsgOpt: 0,
                draftTextTime: 0,
                burnDuration: 0,
                minSeq: 0,
                faceURL: "/static/images/archive.png",
                msgDestructTime: 0,
                isMsgDestruct: false,
            }
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
            const isArchvistList = [];
            let conversationList = [];
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
            if (isArchvistList.length) {
                const conversationIsArchvistIdList = isArchvistList.map(conversation => conversation.conversationID);
                conversationList = [
                    {
                        ...this.isArchvistItem,
                        unreadCount: isArchvistList.filter(item => item.unreadCount).length,
                        latestMsg: JSON.stringify({
                            contentType: 101,
                            textElem: {
                                content: isArchvistList.map(item => item.showName).join(',')
                            }
                        }),
                    },
                    ...this.storeConversationList.filter(item => !conversationIsArchvistIdList.includes(item.conversationID))
                ];
            }
            return conversationList.length ? conversationList : this.storeConversationList;
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
        async queryList () {
            await this.$store.dispatch(
                'conversation/getConversationList',
                false
            );
        },
        closeAllSwipe () {
            // this.key = +new Date();
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

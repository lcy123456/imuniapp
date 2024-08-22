<template>
    <Page>
        <view
            id="conversation_container"
            class="conversation_container"
            @click="closeAllSwipe"
        >
            <chat-header ref="chatHeaderRef" />
            <view class="px-20 pt-10 pb-20 bg-grey" @click="handleToSearch">
                <uni-search-bar
                    v-model="keyword"
                    bg-color="#fff"
                    class="h-70"
                    :placeholder="$t('Search')"
                    readonly
                />
            </view>
            <PcLoginTip v-if="platformID !== 0" :platform-i-d="platformID" />
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
            >
                <!-- @scrolltolower="queryList" -->
                <!-- @refresherTouchmove="refresherTouchmove"
                @refresherTouchend="refresherTouchend" -->
                <uni-swipe-action ref="swipeWrapperRef" class="swipe_wrapper">
                    <ConversationItem
                        v-for="(item, index) in showConversationList"
                        :key="index"
                        :source="item"
                        :is-disabled="
                            item.isArchvistItem && !item.isGroupSwiper
                        "
                        @closeAllSwipe="closeAllSwipe"
                    />
                </uni-swipe-action>
            </scroll-view>
            <!-- </z-paging> -->

            <!-- <view
            v-else
            class="loading_wrap"
        >
            <u-loading-icon text="同步中" />
        </view> -->
            <DeleteArchiveModal
                :isShowModal="isShowArchiveModal"
            ></DeleteArchiveModal>
        </view>
    </Page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ChatHeader from './components/ChatHeader.vue';
import { isNeedRestart } from '@/util/common';
import PcLoginTip from './components/PcLoginTip.vue';
import ConversationItem from './components/ConversationItem.vue';
import DeleteArchiveModal from './components/DeleteArchiveModal.vue';
import { prepareConversationState } from '@/util/imCommon';
import { PageEvents } from '@/constant';
import { videoGetToken, videoGetOfflineInfo } from '@/api/incoming';
import { authGetPcLoginPlatform } from '@/api/login';
import { AudioVideoType, AudioVideoStatus } from '@/enum';
import { MessageReceiveOptType } from 'openim-uniapp-polyfill';

export let archiveConversation = {
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
    showName: this.$t('My_group1'),
    conversationID: '',
    conversationType: 0,
    isPinned: false,
    attachedInfo: '{}',
    ex: '',
    hasReadSeq: 0,
    updateUnreadCountTime: 0,
    recvMsgOpt: 0,
    draftTextTime: 0,
    burnDuration: 0,
    minSeq: 0,
    faceURL: '',
    msgDestructTime: 0,
    isMsgDestruct: false
};

export default {
    components: {
        ChatHeader,
        ConversationItem,
        PcLoginTip,
        DeleteArchiveModal
    },
    data() {
        return {
            key: '',
            keyword: '',
            refreshing: false,
            platformID: 0,
            isDisabledSwipe: false,
            isShowArchiveModal: true
        };
    },
    computed: {
        ...mapGetters([
            'storeConversationList',
            'storeIsSyncing',
            'storeSelfInfo',
            'storeUserID',
            'storeCurrentConversationID',
            'storeConversationFolder'
        ]),
        showConversationList() {
            if (this.storeConversationFolder.length === 0) {
                return this.storeConversationList;
            }
            const archiveIds = this.storeConversationFolder.map(v => v.id);
            const archiveList = [];
            const notArchiveList = [];
            this.storeConversationList.forEach(v => {
                const tempAttachedInfo = JSON.parse(v.attachedInfo || '{}');
                if (archiveIds.includes(tempAttachedInfo.archive_id)) {
                    archiveList.push(v);
                } else {
                    notArchiveList.push(v);
                }
            });
            const unreadCount = archiveList
                .filter(v => v.recvMsgOpt === MessageReceiveOptType.Nomal)
                .reduce((count, item) => {
                    return item.unreadCount + count;
                }, 0);
            let _archiveConversation = { ...archiveConversation };
            _archiveConversation.unreadCount = unreadCount;
            if (this.storeConversationFolder.length > 1) {
                _archiveConversation = {
                    ..._archiveConversation,
                    faceURL: '/static/images/archive_more.png',
                    showName: this.$t('My_group1'),
                    latestMsg: JSON.stringify({
                        contentType: 101,
                        textElem: {
                            content: this.storeConversationFolder
                                .map(item => item.name)
                                .join(',')
                        }
                    }),
                    isGroupSwiper: false
                };
            } else {
                _archiveConversation = {
                    ..._archiveConversation,
                    faceURL: '/static/images/archive.png',
                    showName: this.storeConversationFolder[0].name,
                    archive_id: this.storeConversationFolder[0].id,
                    latestMsg: JSON.stringify({
                        contentType: 101,
                        textElem: {
                            content: archiveList
                                .map(item => item.showName)
                                .join(',')
                        }
                    }),
                    isGroupSwiper: true
                };
            }
            return [_archiveConversation, ...notArchiveList];
        }
    },
    onReady() {
        this.$nextTick(() => plus.navigator.closeSplashscreen());
    },
    watch: {
        // showConversationList (val) {
        //     this.$nextTick(() => {
        //         this.$refs.paging.complete([...val]);
        //     });
        // }
    },
    onLoad() {
        this.timer = setInterval(() => {
            this.authGetPcLoginPlatform();
        }, 3000);
        this.getCall();
        uni.$on(PageEvents.ClickPushMessage, this.handlePushConversation);
        uni.$on('app_show', this.handleRestart);
    },
    onUnload() {
        clearInterval(this.timer);
        uni.$off(PageEvents.ClickPushMessage, this.handlePushConversation);
        uni.$off('app_show', this.handleRestart);
    },
    onShow() {
        this.isShowArchiveModal = true;
        if (!this.storeUserID) return;
        this.getConversationFolder();
    },
    onHide() {
        this.isShowArchiveModal = false;
    },
    methods: {
        ...mapActions('incomingCall', ['appearLoadingCall']),
        ...mapActions('conversation', ['getConversationFolder']),
        handleRestart() {
            isNeedRestart.call(this, '#conversation_container');
        },
        async authGetPcLoginPlatform() {
            if (!this.storeUserID) return;
            try {
                const { platformID } = await authGetPcLoginPlatform();
                this.platformID = platformID;
            } catch (err) {
                console.log(err);
            }
        },
        async getCall() {
            if (!this.storeUserID) return;
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
                this.$store.commit(
                    'incomingCall/SET_INCOMING_CALL_TOKEN',
                    token
                );
                this.appearLoadingCall(newServerMsg);
            } catch (err) {
                console.log('-------11', err);
            }
        },
        handleToSearch() {
            uni.$u.route('/pages/common/searchRecord/index');
        },
        // async queryList() {
        //     await this.$store.dispatch(
        //         'conversation/getConversationList',
        //         false
        //     );
        // },
        closeAllSwipe() {
            this.key = +new Date();
            this.$refs.swipeWrapperRef.closeAll();
        },
        handlePushConversation(conversationID) {
            const source = this.storeConversationList.find(
                v => v.conversationID === conversationID
            );
            if (!source) return;
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            const page = currentPage.route;
            if (
                page === `pages/conversation/chating/index` &&
                conversationID === this.storeCurrentConversationID
            )
                return;
            setTimeout(() => {
                prepareConversationState(source);
            }, 300);
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

<template>
    <view
        id="chating_container"
        class="chating_container"
        :style="{ height: height, transition: transition }"
        @touchstart="handleHideMenu"
    >
        <!-- <video id="screenshare-video" autoplay playsinline></video> -->
        <chating-header
            :is-multiple-msg="isMultipleMsg"
            :checked-msg-ids="checkedMsgIds"
        />
        <PinToTop
            ref="pin"
            :list="storePinList"
            @setPositionMsgID="setPositionMsgID"
        />
        <JoinGroupCall />
        <chating-list
            :key="updateChatKey"
            ref="chatingListRef"
            :menu-outside-flag="menuOutsideFlag"
            :is-multiple-msg="isMultipleMsg"
            :checked-msg-ids="checkedMsgIds"
            :client-msg-i-d="clientMsgID"
            @scroll="scroll"
            @touchstart="chatingTouchStart"
            @touchend="chatingTouchEnd"
            @initSuccess="initSuccess"
            @menuRect="menuRect"
        />
        <chating-footer
            ref="chatingFooterRef"
            :is-multiple-msg="isMultipleMsg"
            :footer-outside-flag="footerOutsideFlag"
            :checked-msg-ids="checkedMsgIds"
            @sendInit="setPositionMsgID('')"
        />
        <SetEnd v-show="storeIsShowSetEnd" />
        <!-- <u-loading-page :loading="initLoading" /> -->
        <view style="height: 0">
            <transition name="fade">
                <MessageMenu
                    v-show="menuState.visible"
                    :message="menuState.message"
                    :pater-rect="menuState.paterRect"
                    :visible="menuState.visible"
                    @updatePin="updatePin"
                    @close="menuState.visible = false"
                />
            </transition>
        </view>
        <Notification
            v-model="isShowNotification"
            :text="notificationText"
            :icon="notificationIcon"
        />
        <Page />
    </view>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ChatingHeader from './components/ChatingHeader.vue';
import ChatingFooter from './components/ChatingFooter/index.vue';
import SetEnd from './components/SetEnd.vue';
import ChatingList from './components/ChatingList.vue';
import MessageMenu from './components/MessageMenu';
import { markConversationAsRead } from '@/util/imCommon';
// import { isNeedRestart } from '@/util/common';
import { MessageMenuTypes } from '@/constant';
import IMSDK, {
    IMMethods,
    MessageType,
    SessionType
} from 'openim-uniapp-polyfill';
import { collect } from '@/api/message';
import PinToTop from './components/pinToTop.vue';
import JoinGroupCall from './components/JoinGroupCall.vue';
import { PageEvents } from '@/constant';
import { MediaRenderTypes } from '@/constant';
export default {
    components: {
        ChatingHeader,
        ChatingFooter,
        ChatingList,
        MessageMenu,
        SetEnd,
        PinToTop,
        JoinGroupCall
    },
    data() {
        return {
            test: false,
            isShowNotification: false,
            height: uni.getSystemInfoSync().windowHeight + 'px',
            notificationText: '',
            notificationIcon: '',
            updateChatKey: '',
            updatePinKey: '',
            transition: '',
            clientMsgID: '',
            listHeight: 0,
            isHide: false,
            footerOutsideFlag: 0,
            menuOutsideFlag: 0,
            initLoading: true,
            back2Tab: false,
            positionMsgID: '',
            isMultipleMsg: false,
            checkedMsgIds: [],
            isShowkeyBoard: false,
            menuState: {
                visible: false,
                paterRect: {},
                message: {}
            },
            imgList: []
        };
    },
    computed: {
        ...mapGetters([
            'storeCurrentConversation',
            'storeSelfInfo',
            'storeHistoryMessageList',
            'storeIsScrollWay',
            'storeIsShowSetEnd',
            'storePinList',
            'storeHasMoreAfterMessage',
            'storeKeyBoardHeight',
            'storeIsShowkeyBoard'
        ]),
        checkedMsg() {
            return this.storeHistoryMessageList.filter(v =>
                this.checkedMsgIds.includes(v.clientMsgID)
            );
        },
        isWorkingGroup() {
            return (
                this.storeCurrentConversation.conversationType ===
                SessionType.WorkingGroup
            );
        }
    },
    onLoad(options) {
        const { back2Tab, clientMsgID } = options;
        this.back2Tab = !!JSON.parse(back2Tab);
        this.clientMsgID = clientMsgID;
        uni.$on('multiple_message', this.handleMultipleMessage);
        uni.$on('forward_finish', this.hideMultipleMsg);
        uni.$on('deleteMsg', this.handleMsgDel);
        uni.$on('reloadChatingList', this.reloadChatingList);
        uni.$on('setPositionMsgID', this.setPositionMsgID);
        uni.$on('inputBlur', this.inputBlur);
        uni.$on('inputFocus', this.inputFocus);
        uni.$on('getSearchRecordMedia', this.getSearchRecordMedia);
        uni.$on('handleFavorite', this.handleFavorite);
        uni.$on('app_show', this.handleRestart);
        this.$store.commit('conversation/SET_CONVERSATION_UNREAD', 0);
        this.getSearchRecordMedia();
        this.getPinList();
    },
    onUnload() {
        markConversationAsRead(
            {
                ...this.$store.getters.storeCurrentConversation
            },
            true
        );
        this.resetConversationState();
        this.resetMessageState();
        uni.$off('multiple_message', this.handleMultipleMessage);
        uni.$off('forward_finish', this.hideMultipleMsg);
        uni.$off('deleteMsg', this.handleMsgDel);
        uni.$off('reloadChatingList', this.reloadChatingList);
        uni.$off('setPositionMsgID', this.setPositionMsgID);
        uni.$off('inputBlur', this.inputBlur);
        uni.$off('inputFocus', this.inputFocus);
        uni.$off('getSearchRecordMedia', this.getSearchRecordMedia);
        uni.$off('handleFavorite', this.handleFavorite);
        uni.$off('app_show', this.handleRestart);
        this.$store.commit('base/SET_PIN_LIST', []);
    },
    onHide() {
        this.isHide = true;
        this.isShowkeyBoard = this.storeIsShowkeyBoard;
        if (this.storeIsShowkeyBoard) {
            uni.$emit('inputFocus');
        }
    },
    onShow() {
        this.isHide = false;
        if (this.isShowkeyBoard) {
            uni.$emit('setInputFocus');
        }
    },
    methods: {
        ...mapActions('message', ['resetMessageState']),
        ...mapActions('conversation', ['resetConversationState']),
        ...mapActions('base', ['pinList']),
        getCheckUsers(userList, type) {
            if (type === 'initWebrtc') {
                uni.$emit('createGroupRoom', userList, type);
            }
        },
        handleRestart() {
            setTimeout(() => {
                isNeedRestart.call(this, '#chating_container');
            }, 300);
        },
        inputBlur() {
            if (this.isHide) return;
            this.transition = 'all 0.2s';
            this.height = '100%';
        },
        inputFocus() {
            if (uni.$u.os() !== 'ios') return;
            this.transition = 'all 0.239s';
            this.height = this.storeKeyBoardHeight
                ? uni.getSystemInfoSync().windowHeight -
                  this.storeKeyBoardHeight +
                  'px'
                : '100%';
        },
        async handleHideMenu() {
            if (!this.storeIsShowSetEnd) {
                this.$store.commit('conversation/SET_CONVERSATION_UNREAD', 0);
            }
            this.menuState.visible = false;
        },
        async getPinList() {
            let conversationID = this.storeCurrentConversation.conversationID;
            this.pinList(conversationID);
        },
        scroll() {
            this.handleHideMenu();
            // uni.hideKeyboard();
        },
        setPositionMsgID(positionMsgID, seq) {
            this.positionMsgID = positionMsgID;
            this.$refs.chatingListRef.setPositionMsgID(this.positionMsgID, seq);
            if (
                !this.storeHasMoreAfterMessage &&
                !this.positionMsgID &&
                this.storeHistoryMessageList.length <= 120
            ) {
                uni.$emit(PageEvents.ScrollToBottom);
            } else {
                const index = this.storeHistoryMessageList.findIndex(
                    item => item.clientMsgID === positionMsgID
                );
                if (this.positionMsgID && index > -1) {
                    this.$refs.chatingListRef.scrollToAnchor(
                        `auchor-${positionMsgID}`
                    );
                } else {
                    this.reloadChatingList();
                }
            }
        },
        reloadChatingList() {
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            const page = currentPage.route;
            if (page === `pages/conversation/chating/index`) {
                this.$refs.chatingListRef.init();
            }
        },
        updatePin(map) {
            this.notificationText = map.text;
            this.notificationIcon = map.icon;
            this.isShowNotification = true;
            this.getPinList();
        },
        async getSearchRecordMedia(list) {
            let imgList = list;
            if (!list) {
                let conversationID =
                    this.storeCurrentConversation.conversationID;
                const params = {
                    conversationID,
                    keywordList: [],
                    messageTypeList: MediaRenderTypes,
                    searchTimePosition: 0,
                    searchTimePeriod: 0,
                    pageIndex: 1,
                    count: 999
                };
                const { data } = await IMSDK.asyncApi(
                    IMMethods.SearchLocalMessages,
                    IMSDK.uuid(),
                    params
                );
                imgList = data.searchResultItems?.[0]?.messageList || [];
            }
            uni.$emit('setMediaList', imgList, list ? '' : 'reverse');
        },
        chatingTouchStart() {
            this.footerOutsideFlag += 1;
        },
        chatingTouchEnd() {
            // uni.$emit("inputBlur");
            // uni.hideKeyboard();
        },
        chatingTouchMove() {
            // uni.hideKeyboard();
        },
        getEl(el) {
            return new Promise(resolve => {
                const query = uni.createSelectorQuery().in(this);
                query
                    .select(el)
                    .boundingClientRect(data => {
                        resolve(data);
                    })
                    .exec();
            });
        },
        initSuccess() {
            this.initLoading = false;
        },
        menuRect(res) {
            this.menuState.paterRect = {
                ...res,
                message: undefined
            };
            this.menuState.message = res.message;
            this.menuState.visible = true;
            // uni.hideKeyboard();
        },
        async handleMultipleMessage({ show, message, type = '' }) {
            this.chatingTouchStart();
            this.isMultipleMsg = show;
            switch (type) {
                case MessageMenuTypes.Init:
                    this.checkedMsgIds = [message.clientMsgID];
                    break;
                case MessageMenuTypes.Checked:
                    const index = this.checkedMsgIds.indexOf(
                        message.clientMsgID
                    );
                    if (index > -1) {
                        this.checkedMsgIds.splice(index, 1);
                    } else {
                        this.checkedMsgIds.push(message.clientMsgID);
                    }
                    break;
                case MessageMenuTypes.DelAll:
                    if (this.checkedMsg.length === 0) return;
                    if (this.isWorkingGroup) {
                        let isAllMyMsg = true;
                        this.checkedMsg.forEach(msg => {
                            if (msg.sendID !== this.storeSelfInfo.userID) {
                                isAllMyMsg = false;
                            }
                        });
                        if (!isAllMyMsg) {
                            uni.$u.toast('无法删除其他人的消息');
                            break;
                        }
                    }
                    this.handleMsgDel(this.checkedMsg);
                    break;
                case MessageMenuTypes.Del:
                    this.handleMsgDel([message]);
                    break;
                case MessageMenuTypes.Favorite:
                    this.handleMultipleFavorite();
                    break;
                case MessageMenuTypes.ForwardAll:
                    if (this.checkedMsg.length === 0) return;
                    const res = await IMSDK.asyncApi(
                        IMMethods.CreateMergerMessage,
                        IMSDK.uuid(),
                        {
                            messageList: this.checkedMsg,
                            title:
                                (this.isWorkingGroup
                                    ? ''
                                    : `${this.storeSelfInfo.nickname}与`) +
                                `${this.storeCurrentConversation.showName}的聊天记录`,
                            summaryList: []
                        }
                    );
                    this.handleForward(res);
                    break;
            }
        },
        async handleFavorite(message) {
            try {
                await collect({
                    content: JSON.stringify(message),
                    senderNickname:
                        message.contentType === MessageType.MergeMessage
                            ? this.storeCurrentConversation.showName
                            : message.senderNickname
                });
                uni.$u.toast('收藏成功');
            } catch (err) {
                console.log(err);
                uni.$u.toast('收藏失败，请重试');
            }
        },
        async handleMultipleFavorite() {
            const message = await IMSDK.asyncApi(
                IMMethods.CreateMergerMessage,
                IMSDK.uuid(),
                {
                    messageList: this.checkedMsg,
                    title:
                        (this.isWorkingGroup
                            ? ''
                            : `${this.storeSelfInfo.nickname}与`) +
                        `${this.storeCurrentConversation.showName}的聊天记录`,
                    summaryList: []
                }
            );
            this.handleFavorite(message);
        },
        async handleMsgDel(msgArr) {
            try {
                // this.$loading('删除中');
                for (let i = 0; i < msgArr.length; i++) {
                    const message = msgArr[i];
                    await IMSDK.asyncApi(
                        IMMethods.DeleteMessage,
                        IMSDK.uuid(),
                        {
                            conversationID:
                                this.storeCurrentConversation.conversationID,
                            clientMsgID: message.clientMsgID
                        }
                    );
                }
                // uni.$u.toast('删除成功');
            } catch (err) {
                console.log(err);
                // uni.$u.toast('删除失败');
            }
        },
        async handleForward(msg) {
            let temp = JSON.parse(JSON.stringify(msg));
            temp.mergeElem.multiMessage.forEach(v => {
                if (v.contentType === MessageType.QuoteMessage) {
                    v.quoteElem.quoteMessage = undefined;
                }
            });
            uni.$u.route('/pages/common/msgForward/index', {
                message: encodeURIComponent(JSON.stringify(temp))
            });
        },
        hideMultipleMsg() {
            this.isMultipleMsg = false;
        },
        goPerson({ id }) {
            uni.$u.route(`/pages/common/userCard/index?sourceID=${id}`);
        },
        goLink({ url }) {
            plus.runtime.openURL(url);
        }
    }
};
</script>

<script module="chatRender" lang="renderjs">
export default {
    mounted () {
        this.bindEvent();
    },
    methods: {
        bindEvent () {
            document.querySelector(`.chating_container`).addEventListener('click', (event) => {
                const target = event.target;
                if (target.getAttribute('data-url')) {
                    this.$ownerInstance.callMethod('goLink', {
                        url: target.getAttribute('data-url')
                    });
                }
                if (target.getAttribute('data-at') && target.getAttribute('data-at') !== '999999999') {
                    this.$ownerInstance.callMethod('goPerson', {
                        id: target.getAttribute('data-at')
                    });
                }
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.chating_container {
    @include colBox(false);
    // height: 100%;
    overflow: hidden;
    background: url('/static/images/chat-bg.png') no-repeat;
    background-size: cover;
    transition: all 0.139s;
    #screenshare-video {
        width: 400px;
        height: 400px;
        border: 1px solid red;
    }
    .mutiple_action_container {
        display: flex;
        border-top: 1px solid #eaeaea;

        .action_item {
            @include centerBox();
            flex-direction: column;
            flex: 1;
            padding: 48rpx 0;
            font-size: 24rpx;
            color: #898989;

            .u-icon {
                margin-bottom: 6rpx;
            }
        }
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

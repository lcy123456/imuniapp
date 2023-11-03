<template>
    <view
        id="chating_container"
        class="chating_container"
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
            @setPositionMsgID="getPositionMsgID"
        />
        <JoinGroupCall />
        <chating-list
            :key="updateChatKey"
            ref="chatingListRef"
            :menu-outside-flag="menuOutsideFlag"
            :is-multiple-msg="isMultipleMsg"
            :checked-msg-ids="checkedMsgIds"
            :position-msg-i-d="positionMsgID"
            @scroll="handleHideMenu"
            @touchstart="chatListClick"
            @initSuccess="initSuccess"
            @menuRect="menuRect"
        />
        <chating-footer
            ref="chatingFooterRef"
            :is-multiple-msg="isMultipleMsg"
            :footer-outside-flag="footerOutsideFlag"
            :checked-msg-ids="checkedMsgIds"
            @sendInit="getPositionMsgID('')"
        />
        <view
            v-show="storeIsShowSetEnd"
            class="set-end"
            @click="getPositionMsgID('')"
        >
            <view
                v-if="conversationUnread"
                class="unread"
            >
                {{ conversationUnread < 100 ? conversationUnread : '99' }}
            </view>
            <image
                src="/static/images/set-end.png"
            />
        </view>
        <!-- <u-loading-page :loading="initLoading" /> -->
        <view style="height: 0">
            <transition name="fade">
                <MessageMenu
                    v-if="menuState.visible"
                    :message="menuState.message"
                    :pater-rect="menuState.paterRect"
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
import ChatingList from './components/ChatingList.vue';
import MessageMenu from './components/MessageMenu.vue';
import { markConversationAsRead } from '@/util/imCommon';
import { getEl } from '@/util/common';
import { MessageMenuTypes } from '@/constant';
import IMSDK, { IMMethods, MessageType } from 'openim-uniapp-polyfill';
import PinToTop from './components/pinToTop.vue';
import JoinGroupCall from './components/JoinGroupCall.vue';
import {
    MediaRenderTypes,
} from '@/constant';
export default {
    components: {
        ChatingHeader,
        ChatingFooter,
        ChatingList,
        MessageMenu,
        PinToTop,
        JoinGroupCall
    },
    provide () {
        return {
            getSearchRecord: this.getSearchRecord
        };
    },
    data () {
        return {
            isShowNotification: false,
            notificationText: '',
            notificationIcon: '',
            updateChatKey: '',
            updatePinKey: '',
            listHeight: 0,
            footerOutsideFlag: 0,
            menuOutsideFlag: 0,
            initLoading: true,
            back2Tab: false,
            positionMsgID: '',
            isMultipleMsg: false,
            checkedMsgIds: [],
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
            'conversationUnread'
        ]),
        checkedMsg () {
            return this.storeHistoryMessageList.filter((v) =>
                this.checkedMsgIds.includes(v.clientMsgID)
            );
        },
    },
    onLoad (options) {
        const { back2Tab, clientMsgID } = options;
        this.back2Tab = !!JSON.parse(back2Tab);
        this.positionMsgID = clientMsgID;
        uni.$on('multiple_message', this.handleMultipleMessage);
        uni.$on('forward_finish', this.hideMultipleMsg);
        this.$store.commit('conversation/SET_CONVERSATION_UNREAD', 0);
        this.getSearchRecord();
        this.getPinList();
    },
    onUnload () {
        console.log('unload');
        markConversationAsRead(
            {
                ...this.$store.getters.storeCurrentConversation,
            },
            true
        );
        this.resetConversationState();
        this.resetMessageState();
        uni.$off('multiple_message', this.handleMultipleMessage);
        uni.$off('forward_finish', this.hideMultipleMsg);
    },
    methods: {
        ...mapActions('message', ['resetMessageState', 'deleteMessages']),
        ...mapActions('conversation', ['resetConversationState']),
        ...mapActions('base', ['pinList']),
        async handleHideMenu () {
            if (!this.storeIsShowSetEnd) {
                this.$store.commit('conversation/SET_CONVERSATION_UNREAD', 0);
            }
            const res = await getEl.call(this, '.message_menu_container');
            if (res) {
                this.menuState.visible = false;
            }
        },
        async getPinList () {
            let conversationID = this.storeCurrentConversation.conversationID;
            this.pinList(conversationID);
            
        },
        getPositionMsgID (positionMsgID) {
            this.positionMsgID = positionMsgID;
            this.updateChatKey = +new Date();
        },
        updatePin (map) {
            this.notificationText = map.text;
            this.notificationIcon = map.icon;
            this.isShowNotification = true;
            this.getPinList();
        },
        async getSearchRecord () {
            let conversationID = this.storeCurrentConversation.conversationID;
            const params = {
                conversationID: conversationID,
                keywordList: [],
                messageTypeList: MediaRenderTypes,
                searchTimePosition: 0,
                searchTimePeriod: 0,
                pageIndex: 1,
                count: 999,
            };
            const { data } = await IMSDK.asyncApi(
                IMMethods.SearchLocalMessages,
                IMSDK.uuid(),
                params
            );
            let imgList = data.searchResultItems?.[0]?.messageList || [];
            console.log(imgList, 'imgListimgListimgList');
            this.imgList = imgList.map((v) => {
                const { contentType, pictureElem, videoElem } = v;
                const isVideo = contentType === MessageType.VideoMessage;
                let map = {
                    url: pictureElem?.sourcePicture.url,
                    poster: [pictureElem?.sourcePicture.url, pictureElem?.sourcePath],
                    type: 'image',
                };
                if (isVideo) {
                    map = {
                        url: videoElem.videoUrl,
                        poster: [videoElem?.snapshotUrl],
                        type: 'video',
                    };
                }
                return map;
            });
            this.imgList.reverse();
            console.log(this.imgList, '--------------------imgListimgListimgList');
            this.$store.commit('conversation/SET_CONVERSATION_MEDIA_LIST', this.imgList);
        },
        chatListClick () {
            this.footerOutsideFlag += 1;
            uni.hideKeyboard();
        },
        getEl (el) {
            return new Promise((resolve) => {
                const query = uni.createSelectorQuery().in(this);
                query
                    .select(el)
                    .boundingClientRect((data) => {
                        resolve(data);
                    })
                    .exec();
            });
        },
        initSuccess () {
            // console.log('initSuccess');
            this.initLoading = false;
        },
        menuRect (res) {
            // console.log('menuRect', res);
            this.menuState.paterRect = {
                ...res,
                message: undefined
            };
            this.menuState.message = res.message;
            this.menuState.visible = true;
        },
        async handleMultipleMessage ({ show, message, type = '' }) {
            // console.log('开启多选', show, message);
            this.chatListClick();
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
                this.handleMsgDel(this.checkedMsg);
                break;
            case MessageMenuTypes.Del:
                this.handleMsgDel([message]);
                break;
            case MessageMenuTypes.ForwardAll:
                if (this.checkedMsg.length === 0) return;
                const res = await IMSDK.asyncApi(
                    IMMethods.CreateMergerMessage,
                    IMSDK.uuid(),
                    {
                        messageList: this.checkedMsg,
                        title: `${this.storeSelfInfo.nickname}与${this.storeCurrentConversation.showName}的聊天记录`,
                        summaryList: [],
                    }
                );
                this.handleForward(res);
                break;
            }
        },
        async handleMsgDel (msgArr) {
            try {
                this.$loading('删除中');
                for (let i = 0; i < msgArr.length; i++) {
                    console.log(msgArr[i]);
                    const message = msgArr[i];
                    await IMSDK.asyncApi(
                        IMMethods.DeleteMessage,
                        IMSDK.uuid(),
                        {
                            conversationID:
                                this.storeCurrentConversation.conversationID,
                            clientMsgID: message.clientMsgID,
                        }
                    );
                    this.deleteMessages([message]);
                }
                uni.$u.toast('删除成功');
            } catch (err) {
                console.log(err);
                uni.$u.toast('删除失败');
            }
        },
        async handleForward (msg) {
            let temp = JSON.parse(JSON.stringify(msg));
            temp.mergeElem.multiMessage.forEach(v => {
                if (v.contentType === MessageType.QuoteMessage) {
                    v.quoteElem.quoteMessage = undefined;
                }
            });
            console.log(temp);
            uni.$u.route('/pages/common/msgForward/index', {
                message: encodeURIComponent(JSON.stringify(temp)),
            });
        },
        hideMultipleMsg () {
            this.isMultipleMsg = false;
        },
    },
    onBackPress () {
        // if (this.back2Tab) {
        uni.switchTab({
            url: '/pages/conversation/conversationList/index',
        });
        return true;
        // }

        // return false;
    },
};
</script>

<style lang="scss" scoped>
.chating_container {
    @include colBox(false);
    height: 100%;
    overflow: hidden;
    background: url('/static/images/chat-bg.png') no-repeat;
    background-size: cover;
    #screenshare-video {
        width: 400px;
        height: 400px;
        border: 1px solid red;
    }
    .set-end {
        position: fixed;
        bottom: 130px;
        right: 20px;
        uni-image {
            width: 100rpx;
            height: 100rpx;
        }
        .unread {
            width: 60rpx;
            height: 60rpx;
            line-height: 60rpx;
            text-align: center;
            background: rgba(0, 141, 255, 1);
            color: #fff;
            border-radius: 50%;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: -40rpx;
            z-index: 9;
            font-size: 12px;
        }
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

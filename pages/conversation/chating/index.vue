<template>
    <view
        class="chating_container"
        @touchstart="handleHideMenu"
    >
        <chating-header
            :is-multiple-msg="isMultipleMsg"
            :checked-msg-ids="checkedMsgIds"
        />
        <chating-list
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
        />
        <!-- <u-loading-page :loading="initLoading" /> -->
        <view style="height: 0">
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

export default {
    components: {
        ChatingHeader,
        ChatingFooter,
        ChatingList,
        MessageMenu,
    },
    data () {
        return {
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
        };
    },
    computed: {
        ...mapGetters([
            'storeCurrentConversation',
            'storeSelfInfo',
            'storeHistoryMessageList',
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
        async handleHideMenu () {
            const res = await getEl.call(this, '.message_menu_container');
            if (res) {
                this.menuState.visible = false;
            }
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
        if (this.back2Tab) {
            uni.switchTab({
                url: '/pages/conversation/conversationList/index',
            });
            return true;
        }

        return false;
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

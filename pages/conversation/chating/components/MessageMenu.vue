<template>
    <view
        class="message_menu_container"
        :style="{
            width: menuWidth + 'px',
            left: getLeft + 'px',
            top: getTop + 'px'
        }"
    >
        <view
            v-for="item in menuList"
            :key="item.idx"
            class="message_menu_item"
            :style="{height: menuItemHight + 'px'}"
            @click="menuClick(item)"
            @touchstart.stop
        >
            <text>{{ item.title }}</text>
            <image
                :src="item.icon"
                alt=""
                srcset=""
            />
        </view>
    </view>
    <!-- <u-modal :show="show" :title="title" :content='content'></u-modal> -->
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { MessageMenuTypes } from '@/constant';
import IMSDK, { MessageType } from 'openim-uniapp-polyfill';

import { DecryptoAES } from '@/util/crypto';

const canCopyTypes = [
    MessageType.TextMessage,
    MessageType.AtTextMessage,
    MessageType.QuoteMessage,
];

export default {
    components: {},
    props: {
        message: {
            required: true,
            type: Object,
        },
        paterRect: {
            type: Object,
            required: true,
        }
    },
    data () {
        return {
            menuWidth: 200,
            menuItemHight: 40,
        };
    },
    computed: {
        ...mapGetters(['storeCurrentMemberInGroup', 'storeCurrentUserID']),
        isSender () {
            return this.paterRect.left > 50;
        },
        getLeft () {
            const { left, right } = this.paterRect;
            if (this.isSender) return right - 200;
            return left;
        },
        getTop () {
            const { top, bottom } = this.paterRect;
            const menuHight = this.menuItemHight * this.menuList.length;
            if (top - menuHight < 100) {
                return bottom + 10;
            } else {
                return top - menuHight - 10;
            }
        },
        menuList () {
            return [
                {
                    idx: 0,
                    type: MessageMenuTypes.Forward,
                    title: '转发',
                    icon: '/static/images/chating_message_forward.png',
                    visible: true,
                },
                {
                    idx: 1,
                    type: MessageMenuTypes.Reply,
                    title: '回复',
                    icon: '/static/images/chating_message_reply.png',
                    visible: true,
                },
                {
                    idx: 2,
                    type: MessageMenuTypes.Copy,
                    title: '复制',
                    icon: '/static/images/chating_message_copy.png',
                    visible: canCopyTypes.includes(this.message.contentType),
                },
                {
                    idx: 3,
                    type: MessageMenuTypes.Revoke,
                    title: '撤回',
                    icon: '/static/images/chating_message_revoke.png',
                    visible: this.isSender,
                },
                {
                    idx: 4,
                    type: MessageMenuTypes.Multiple,
                    title: '多选',
                    icon: '/static/images/chating_message_multiple.png',
                    visible: true,
                },
                {
                    idx: 5,
                    type: MessageMenuTypes.Del,
                    title: '删除',
                    icon: '/static/images/chating_message_del.png',
                    visible: true,
                },
            ].filter((v) => v.visible);
        },
    },
    methods: {
        ...mapActions('message', ['deleteMessages', 'updateOneMessage']),
        async menuClick ({ type }) {
            switch (type) {
            case MessageMenuTypes.Forward:
                uni.$u.route('/pages/common/msgForward/index', {
                    message: encodeURIComponent(JSON.stringify(this.message))
                });
                break;
            case MessageMenuTypes.Reply:
                await this.handleQuote();
                break;
            case MessageMenuTypes.Copy:
                await this.handleCopy();
                break;
            case MessageMenuTypes.Revoke:
                await this.handleRevoke();
                break;
            case MessageMenuTypes.Multiple:
                await this.handleMultiple();
                break;
            case MessageMenuTypes.Del:
                await this.handleDel();
                break;
            }
            this.$emit('close');
        },
        handleQuote () {
            uni.$emit('quote_message', this.message);
        },
        handleCopy () {
            return new Promise((resolve, reject) => {
                uni.setClipboardData({
                    data: this.getCopyText(),
                    success: () => {
                        uni.$u.toast('复制成功');
                        resolve();
                    },
                    fail: () => {
                        reject();
                        uni.$u.toast('复制失败');
                    }
                });
            });
        },
        async handleRevoke () {
            try {
                this.$loading('撤回中');
                await IMSDK.asyncApi(
                    IMSDK.IMMethods.RevokeMessage,
                    IMSDK.uuid(),
                    {
                        conversationID:
                                this.$store.getters.storeCurrentConversation
                                    .conversationID,
                        clientMsgID: this.message.clientMsgID,
                    }
                );
                this.$hideLoading();
                this.updateOneMessage({
                    message: {
                        ...this.message,
                        contentType: MessageType.RevokeMessage,
                        notificationElem: {
                            detail: JSON.stringify({
                                clientMsgID: this.message.clientMsgID,
                                revokeTime: Date.now(),
                                revokerID: this.storeCurrentUserID,
                                revokerNickname: '你',
                                revokerRole: 0,
                                seq: this.message.seq,
                                sessionType: this.message.sessionType,
                                sourceMessageSendID: this.message.sendID,
                                sourceMessageSendTime: this.message.sendTime,
                                sourceMessageSenderNickname: this.message.senderNickname,
                            }),
                        },
                    }
                });
            } catch {
                uni.$u.toast('撤回失败');
            }
        },
        handleMultiple () {
            uni.$emit('multiple_message', {
                show: true,
                message: this.message,
                type: MessageMenuTypes.Init
            });
        },
        // TODO: 可以移动到chating统一处理
        async handleDel () {
            try {
                this.$loading('删除中');
                await IMSDK.asyncApi(
                    IMSDK.IMMethods.DeleteMessage,
                    IMSDK.uuid(),
                    {
                        conversationID:
                                this.$store.getters.storeCurrentConversation
                                    .conversationID,
                        clientMsgID: this.message.clientMsgID,
                    }
                );
                uni.$u.toast('删除成功');
                this.deleteMessages([this.message]);
            } catch {
                uni.$u.toast('删除失败');
            }
        },
        getCopyText () {
            const { contentType, atTextElem, quoteElem, textElem } = this.message;
            if (contentType === MessageType.AtTextMessage) {
                return atTextElem.text;
            }
            if (contentType === MessageType.QuoteMessage) {
                return DecryptoAES(quoteElem.text);
            }
            return DecryptoAES(textElem.content);
        },
    },
};
</script>

<style scoped lang="scss">
.message_menu_container {
    // width: 200px;
    background-color: rgba($uni-bg-color-inverse, 0.6);
    border-radius: 15px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9;
    color: $uni-text-color-inverse;

    .message_menu_item {
        // height: 80rpx;
        padding: 0 15px;
        @include btwBox();
        border-bottom: 1px solid $uni-border-color;

        image {
            width: 19px;
            height: 19px;
        }
    }
}
</style>

<template>
    <view
        :style="{
            left: getLeft,
            right: getRight,
        }"
        class="message_menu_container"
        :class="{ message_menu_container_bottom: isBottom }"
    >
        <view
            v-for="item in menuList"
            :key="item.idx"
            class="message_menu_item"
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
        isBottom: {
            type: Boolean,
            default: true,
        },
        isSender: Boolean,
        paterWidth: {
            required: true,
            type: Number,
        },
    },
    data () {
        return {};
    },
    computed: {
        ...mapGetters(['storeCurrentMemberInGroup', 'storeCurrentUserID']),
        getLeft () {
            if (this.isSender) return 'auto';
            return 0;
        },
        getRight () {
            if (this.isSender) return '0';
            return 'auto';
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
            case MessageMenuTypes.Copy:
                await this.handleCopy();
                break;
            case MessageMenuTypes.Revoke:
                await this.handleRevoke();
                break;
            case MessageMenuTypes.Del:
                await this.handleDel();
                break;
            }
            this.$emit('close');
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
            if (this.message.contentType === MessageType.AtTextMessage) {
                return this.message.atTextElem.text;
            }
            if (this.message.contentType === MessageType.QuoteMessage) {
                return this.message.quoteElem.text;
            }
            return DecryptoAES(this.message.textElem.content);
        },
    },
};
</script>

<style scoped lang="scss">
.message_menu_container {
    width: 428rpx;
    background-color: rgba($uni-bg-color-inverse, 0.6);
    border-radius: 30rpx;
    position: absolute;
    top: 0;
    transform: translateY(-110%);
    z-index: 9;
    color: $uni-text-color-inverse;

    &_bottom {
        top: inherit;
        bottom: 0;
        transform: translateY(110%);
    }

    .message_menu_item {
        height: 80rpx;
        padding: 0 30rpx;
        @include btwBox();
        border-bottom: 2rpx solid $uni-border-color;

        image {
            width: 38rpx;
            height: 38rpx;
        }
    }
}
</style>

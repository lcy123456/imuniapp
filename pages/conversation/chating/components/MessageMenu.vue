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
            :key="item.title"
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
import { html2Text } from '@/util/common';
import { parseAt, parseEmoji } from "@/util/imCommon";
import { mapGetters, mapActions } from 'vuex';
import { pin, pinCancel } from '@/api/pinToTop';
import IMSDK, { IMMethods, MessageType } from 'openim-uniapp-polyfill';
import { DecryptoAES } from '@/util/crypto';
import { 
    MessageMenuTypes,
    TextRenderTypes,
    MediaRenderTypes,
    FileRenderTypes
} from '@/constant';

const notPinTypes = [
    MessageType.CustomMessage,
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
            systemInfo: uni.getSystemInfoSync()
        };
    },
    computed: {
        ...mapGetters(['storeCurrentMemberInGroup', 'storeCurrentUserID']),
        isSender () {
            return this.paterRect.right > uni.getWindowInfo().windowWidth - 30;
        },
        getLeft () {
            const { left, right } = this.paterRect;
            if (this.isSender) return right - 200;
            return left;
        },
        getTop () {
            const { top, bottom } = this.paterRect;
            const { windowHeight } = uni.getSystemInfoSync();
            const menuHight = this.menuItemHight * this.menuList.length;
            const minTop = 0;
            const maxTop = windowHeight - menuHight - 100;
            let t = 0;
            if (top - menuHight < 100) {
                t = bottom + 10;
            } else {
                t = top - menuHight - 10;
            }
            t = t > minTop ? t : minTop;
            t = t < maxTop ? t : maxTop;
            return t;
        },
        menuList () {
            return [
                {
                    type: MessageMenuTypes.Forward,
                    title: '转发',
                    icon: '/static/images/chating_message_forward.png',
                    visible: true,
                },
                {
                    type: MessageMenuTypes.Pin,
                    title: '置顶',
                    icon: '/static/images/pin.png',
                    visible: !this.message.pinMap && !notPinTypes.includes(this.message.contentType),
                },
                {
                    type: MessageMenuTypes.PinCancel,
                    title: '取消置顶',
                    icon: '/static/images/cancel-pin.png',
                    visible: this.message.pinMap && !notPinTypes.includes(this.message.contentType),
                },
                {
                    type: MessageMenuTypes.Reply,
                    title: '回复',
                    icon: '/static/images/chating_message_reply.png',
                    visible: true,
                },
                {
                    type: MessageMenuTypes.Edit,
                    title: '编辑',
                    icon: '/static/images/chating_message_reply.png',
                    visible: TextRenderTypes.includes(this.message.contentType),
                },
                {
                    type: MessageMenuTypes.Copy,
                    title: '复制',
                    icon: '/static/images/chating_message_copy.png',
                    visible: TextRenderTypes.includes(this.message.contentType),
                },
                {
                    type: MessageMenuTypes.Revoke,
                    title: '撤回',
                    icon: '/static/images/chating_message_revoke.png',
                    visible: this.isSender,
                },
                {
                    type: MessageMenuTypes.Multiple,
                    title: '多选',
                    icon: '/static/images/chating_message_multiple.png',
                    visible: true,
                },
                {
                    type: MessageMenuTypes.Del,
                    title: '删除',
                    icon: '/static/images/chating_message_del.png',
                    visible: true,
                },
            ].filter((v) => v.visible);
        },
        showTextRender () {
            return TextRenderTypes.includes(this.message.contentType);
        },
        showMediaRender () {
            return MediaRenderTypes.includes(this.message.contentType);
        },
        showFileRender () {
            return FileRenderTypes.includes(this.message.contentType);
        },
    },
    methods: {
        ...mapActions('message', ['deleteMessages', 'updateOneMessage']),
        async menuClick ({ type }) {
            switch (type) {
            case MessageMenuTypes.Pin:
                await this.pin();
                break;
            case MessageMenuTypes.PinCancel:
                await this.PinCancel();
                break;
            case MessageMenuTypes.Forward:
                this.handleForward();
                break;
            case MessageMenuTypes.Reply:
                uni.$emit('active_message', {
                    message: this.message,
                    type: "quote_message"
                });
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
            case MessageMenuTypes.Edit:
                uni.$emit('active_message', {
                    message: this.message,
                    type: "edit_message"
                });
                break;
            }
            this.$emit('close');
        },
        getContent () {
            let text = '';
            const { contentType, quoteElem, atTextElem, textElem } = this.message;
            // TODO：解密文本
            if (contentType === MessageType.QuoteMessage) {
                text = DecryptoAES(quoteElem?.text);
            } else if (contentType === MessageType.AtTextMessage) {
                text = parseAt(atTextElem);
            } else {
                text = DecryptoAES(textElem?.content);
            }
            return text;
        },
        async pin () {
            console.log(this.message);
            try {
                const { pictureElem, videoElem, fileElem, contentType } = this.message;
                let content = '';
                if (this.showTextRender) {
                    content = html2Text(this.getContent());
                } else if (this.showMediaRender) {
                    content = contentType === MessageType.VideoMessage ? videoElem?.snapshotUrl : pictureElem?.sourcePicture.url;
                } else if (this.showFileRender) {
                    content = fileElem?.fileName;
                }
                await pin({
                    ...this.message,
                    content: content,
                    conversationID: this.$store.getters.storeCurrentConversation.conversationID
                });
                this.$emit('updatePin', {
                    type: 'success',
                    icon: `/static/images/pin.png`,
                    text: '消息内容已置顶'
                });
            } catch (err) {
                //
                console.log('置顶失败', err);
                uni.$u.toast('置顶失败');
            }
        },
        async PinCancel () {
            console.log(this.message);
            try {
                await pinCancel({
                    id: this.message?.pinMap?.id
                });
                this.$emit('updatePin', {
                    type: 'fail',
                    icon: `/static/images/cancel-pin.png`,
                    text: '已取消置顶'
                });
            } catch (err) {
                console.log('取消置顶失败', err);
                uni.$u.toast('取消置顶失败');
            }
        },
        async handleForward () {
            const message = await IMSDK.asyncApi(IMMethods.CreateForwardMessage, IMSDK.uuid(), this.message);
            if (message.quoteElem) {
                message.quoteElem.quoteMessage = undefined;
            }
            console.log('CreateForwardMessage', message);
            uni.$u.route('/pages/common/msgForward/index', {
                message: encodeURIComponent(JSON.stringify(message))
            });
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

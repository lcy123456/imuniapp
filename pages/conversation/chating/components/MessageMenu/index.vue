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
            v-if="steps === 'first'"
        >
            <view
                v-for="item in menuList"
                :key="item.title"
                :style="{height: menuItemHight + 'px'}"
                class="message_menu_item"
                @click="menuClick(item)"
                @touchstart.stop
                @touchend.prevent="menuClick(item)"
            >
                <view
                    v-if="!item.template"
                    class="base-box"
                >
                    <text>{{ item.title }}</text>
                    <image
                        :src="item.icon"
                        alt=""
                        srcset=""
                    />
                </view>
                <template v-if="item.template === 'readCount'">
                    <view
                        class="readCount"
                    >
                        <image
                            class="read"
                            :src="attachedInfo.groupHasReadInfo.hasReadCount ? `/static/images/read.svg` : `/static/images/unread.svg`"
                        />
                        <text v-if="attachedInfo.groupHasReadInfo.hasReadCount">
                            {{ attachedInfo.groupHasReadInfo.hasReadCount }}人已读
                        </text>
                        <text v-else>
                            暂无已读
                        </text>
                        <view class="read-img-list">
                            <my-avatar
                                v-for="user of userList.slice(0, 3)"
                                :key="user.userID"
                                :desc="user.nickname"
                                :src="user.faceURL"
                                :font-size="12"
                                size="24"
                                shape="circle"
                                :class="['avatar']"
                            />
                        </view>
                    </view>
                </template>
            </view>
        </view>
        <view
            v-else
        >
            <view
                :style="{height: menuItemHight + 'px'}"
                class="message_menu_item back"
                @touchstart.stop
                @touchend.prevent.stop="back('first')"
            >
                <image src="@/static/images/back.png" />
                <text>返回</text>
            </view>
            <view v-if="secondTemplate === 'readCount'">
                <ReadUserList
                    :user-list="userList"
                />
            </view>
        </view>
    </view>
    <!-- <u-modal :show="show" :title="title" :content='content'></u-modal> -->
</template>

<script>
import MyAvatar from "@/components/MyAvatar/index.vue";
import ReadUserList from "./ReadUserList.vue";
import { getMsgID } from '@/api/message';
import { html2Text } from '@/util/common';
import { parseAt, getUserListInfo } from "@/util/imCommon";
import { mapGetters, mapActions } from 'vuex';
import { pin, pinCancel } from '@/api/pinToTop';
import IMSDK, { IMMethods, MessageType, SessionType } from 'openim-uniapp-polyfill';
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
    components: {
        MyAvatar,
        ReadUserList
    },
    props: {
        message: {
            required: true,
            type: Object,
        },
        paterRect: {
            type: Object,
            required: true,
        },
        visible: {
            type: Boolean,
            default: false,
        }
    },
    data () {
        return {
            steps: 'first',
            secondTemplate: '',
            menuWidth: 200,
            menuItemHight: 40,
            attachedInfo: {
                groupHasReadInfo: {},
                hasReadUids: []
            },
            userList: [],
            systemInfo: uni.getSystemInfoSync()
        };
    },
    computed: {
        ...mapGetters([
            'storeCurrentMemberInGroup',
            'storeCurrentUserID',
            'storeKeyBoardHeight',
            'storeIsShowkeyBoard'
        ]),
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
            const maxTop = windowHeight - menuHight - 50 - (this.storeIsShowkeyBoard ? this.storeKeyBoardHeight : 0);
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
        isGroup () {
            return this.message.sessionType === SessionType.WorkingGroup;
        },
        menuList () {
            return [
                {
                    type: MessageMenuTypes.ReadCount,
                    title: '',
                    icon: '/static/images/chating_message_gif.png',
                    visible: this.isSender && this.isGroup,
                    template: 'readCount'
                },
                {
                    type: MessageMenuTypes.AddEmoticons,
                    title: '添加到表情',
                    icon: '/static/images/chating_message_gif.png',
                    visible: this.showMediaRender,
                },
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
                    icon: '/static/images/chating_message_edit.png',
                    visible: TextRenderTypes.includes(this.message.contentType) && this.isMyMsg,
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
                    type: MessageMenuTypes.Favorite,
                    title: '收藏',
                    icon: '/static/images/chating_message_favorite.svg',
                    visible: true,
                },
                {
                    type: MessageMenuTypes.Del,
                    title: '删除',
                    icon: '/static/images/chating_message_del.png',
                    visible: this.isMyMsg || this.isSingle,
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
        isMyMsg () {
            return this.message.sendID === this.storeCurrentUserID;
        },
        isSingle () {
            return this.message.sessionType === SessionType.Single;
        }
    },
    watch: {
        visible: {
            handler () {
                if (this.visible) {
                    this.getMsgID();
                } else {
                    setTimeout(() => {
                        this.steps = 'first';
                    }, 0);
                }
            },
            deep: true
        }
    },
    methods: {
        ...mapActions('message', ['deleteMessages', 'updateOneMessage']),
        back (steps) {
            this.steps = steps;
        },
        async getMsgID () {
            try {
                this.userList = [];
                const { chatLogs } = await getMsgID({
                    clientMsgID: this.message.clientMsgID,
                    groupID: this.message.groupID,
                    sendID: this.message.sendID,
                    sessionType: this.message.sessionType,
                });
                if (chatLogs && chatLogs[0] && chatLogs[0].attachedInfo) {
                    this.attachedInfo = JSON.parse(chatLogs[0].attachedInfo);
                }
                if (!this.attachedInfo.groupHasReadInfo.hasReadUids) return;
                this.userList = await getUserListInfo(this.attachedInfo.groupHasReadInfo.hasReadUids);
                this.userList = this.userList.map(user => user.publicInfo);
            } catch (err) {
                console.log(err);
            }
        },
        showAllRead () {
            this.steps = 'second';
            this.secondTemplate = 'readCount';
        },
        async menuClick ({ type }) {
            switch (type) {
            case MessageMenuTypes.ReadCount:
                this.showAllRead();
                return;
            case MessageMenuTypes.AddEmoticons:
                this.addEmoticons();
                break;
            case MessageMenuTypes.Pin:
                await this.pin();
                break;
            case MessageMenuTypes.PinCancel:
                await this.PinCancel();
                break;
            case MessageMenuTypes.Forward:
                this.handleForward();
                break;
            case MessageMenuTypes.Favorite:
                this.handleFavorite();
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
                await uni.$emit('deleteMsg', [this.message]);
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
        handleFavorite () {
            console.log('handleFavorite-handleFavorite');
        },
        addEmoticons () {
            const { pictureElem, videoElem } = this.message;
            let filePath = pictureElem?.sourcePath;
            if (this.isVideo) {
                filePath = videoElem?.snapshotPath;
            }
            // filePath = localEx || filePath;
            uni.getFileInfo({
                filePath,
                success: () => {
                    this.saveEmoticons(filePath);
                },
                fail: () => {
                    filePath = pictureElem?.sourcePicture.url;
                    if (this.isVideo) {
                        filePath = videoElem?.snapshotUrl;
                    }
                    this.saveEmoticons(filePath);
                }
            });
        },
        saveEmoticons (filePath) {
            let list = uni.getStorageSync('emoticonsList');
            list = list ? JSON.parse(list) : [];
            if (list.length >= 200) {
                uni.$u.toast('表情添加上限，请删除后添加');
                return;
            }
            list.push(filePath);
            uni.setStorageSync('emoticonsList', JSON.stringify(list));
            uni.$u.toast('添加成功');
            uni.$emit('undateEmoticons');
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
                uni.$u.toast('置顶失败');
            }
        },
        async PinCancel () {
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
                uni.$u.toast('取消置顶失败');
            }
        },
        async handleForward () {
            const message = await IMSDK.asyncApi(IMMethods.CreateForwardMessage, IMSDK.uuid(), this.message);
            if (message.quoteElem) {
                message.quoteElem.quoteMessage = undefined;
            }
            uni.$u.route('/pages/common/msgForward/index', {
                message: encodeURIComponent(JSON.stringify(message))
            });
            uni.hideKeyboard();
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
            uni.$emit('inputBlur');
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
    z-index: 999999;
    color: $uni-text-color-inverse;

    .message_menu_item {
        width: 100%;
        // height: 80rpx;
        padding: 0 15px;
        @include btwBox();
        border-bottom: 1px solid $uni-border-color;
        &.back {
            justify-content: left;
            uni-text {
                margin-left: 20rpx;
            }
        }

        image {
            width: 19px;
            height: 19px;
        }
        .base-box {
            width: 100%;
            @include btwBox();
        }
        .readCount {
            width: 100%;
            position: relative;
            display: flex;
            align-items: center;
            .read {
                width: 26rpx;
                height: 18rpx;
                margin: 0 10rpx 0 0;
            }
            .read-img-list {
                display: flex;
                position: absolute;
                right: 0;
                top: 0;
                .avatar {
                    border: 1px solid #fff;
                    position: absolute;
                    top: 0;
                    right: 0;
                    &:nth-child(1) {
                        right: 0;
                        z-index: 1;
                    }
                    &:nth-child(2) {
                        right: calc(12px * 1);
                        z-index: 2;
                    }
                    &:nth-child(3) {
                        right: calc(12px * 2);
                        z-index: 3;
                    }
                }
            }
        }
    }
}
</style>

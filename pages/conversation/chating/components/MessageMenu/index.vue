<template>
    <view
        class="message_menu_container"
        :style="{
            width: getWidth + 'px',
            left: getLeft + 'px',
            top: getTop + 'px'
        }"
    >
        <Like @like="like" />
        <view
            v-if="attachedInfo.groupHasReadInfo.hasReadCount"
            class="read-box"
            @touchstart.stop
            @touchend.prevent.stop="showAllRead"
        >
            <view class="left">
                <image src="/static/images/read_white.svg" />
                <text>
                    {{ attachedInfo.groupHasReadInfo.hasReadCount }}人已读
                </text>
            </view>
            <view class="right">
                <view class="read-img-list">
                    <my-avatar
                        v-for="user of userList.slice(0, 3)"
                        :key="user.userID"
                        :desc="user.nickname"
                        :src="user.faceURL"
                        :font-size="8"
                        size="24"
                        shape="circle"
                        :class="['avatar']"
                    />
                </view>
                <image
                    :class="{
                        rotate:
                            steps !== 'first' && secondTemplate === 'readCount'
                    }"
                    src="/static/images/read-down.svg"
                />
            </view>
        </view>
        <view v-if="steps === 'first'" class="message_menu">
            <view
                v-for="item in menuList"
                :key="item.title"
                :style="{ height: menuItemHight + 'px' }"
                class="message_menu_item"
                @click="menuClick(item)"
                @touchstart.stop
                @touchend.prevent="menuClick(item)"
            >
                <view v-if="!item.template" class="base-box">
                    <image :src="item.icon" alt="" srcset="" />
                    <text>{{ item.title }}</text>
                </view>
            </view>
        </view>
        <view v-else>
            <view v-if="secondTemplate === 'readCount'">
                <ReadUserList :user-list="userList" :message="message" />
            </view>
        </view>
    </view>
</template>

<script>
import MyAvatar from '@/components/MyAvatar/index.vue';
import ReadUserList from './ReadUserList.vue';
import Like from './Like.vue';
import { getMsgID, giveLikeEmoji } from '@/api/message';
import { html2Text } from '@/util/common';
import {
    parseAt,
    getUserListInfo,
    isPin,
    formatFileUrl
} from '@/util/imCommon';
import { mapGetters, mapActions } from 'vuex';
import { pin, pinCancel } from '@/api/pinToTop';
import { emojiCollect } from '@/api/emoji';
import IMSDK, {
    IMMethods,
    MessageType,
    SessionType
} from 'openim-uniapp-polyfill';
import { DecryptoAES } from '@/util/crypto';
import {
    MessageMenuTypes,
    TextRenderTypes,
    MediaRenderTypes,
    FileRenderTypes
} from '@/constant';

const notPinTypes = [MessageType.CustomMessage];

export default {
    components: {
        ReadUserList,
        Like,
        MyAvatar
    },
    props: {
        message: {
            required: true,
            type: Object
        },
        paterRect: {
            type: Object,
            required: true
        },
        visible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            steps: 'first',
            secondTemplate: '',
            menuWidth: 200,
            menuItemHight: 80,
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
            'storeIsShowkeyBoard',
            'storeUserID'
        ]),
        isSender() {
            return this.message.sendID === this.storeUserID;
            // return this.paterRect.right > uni.getWindowInfo().windowWidth - 30;
        },
        getWidth() {
            const { windowWidth } = uni.getSystemInfoSync();
            return windowWidth * 0.9;
        },
        getLeft() {
            // const { left, right } = this.paterRect;
            // if (this.isSender) return right - 200;
            // return left;
            const { windowWidth } = uni.getSystemInfoSync();
            return (windowWidth - this.getWidth) / 2;
        },
        getTop() {
            const { top, bottom } = this.paterRect;
            const { windowHeight } = uni.getSystemInfoSync();
            const menuHight =
                this.menuItemHight * Math.ceil(this.menuList.length / 5) +
                uni.upx2px(100 + 20) +
                (this.attachedInfo.groupHasReadInfo.hasReadCount
                    ? uni.upx2px(100 + 20)
                    : 0);
            const minTop = 50;
            const maxTop =
                windowHeight -
                menuHight -
                50 -
                (this.storeIsShowkeyBoard ? this.storeKeyBoardHeight : 0);
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
        isGroup() {
            return this.message.sessionType === SessionType.WorkingGroup;
        },
        menuList() {
            return [
                {
                    type: MessageMenuTypes.AddEmoticons,
                    title: '添加到表情',
                    icon: '/static/images/chating_message_gif.svg',
                    visible: this.showMediaRender
                },
                {
                    type: MessageMenuTypes.Forward,
                    title: '转发',
                    icon: '/static/images/chating_message_forward.svg',
                    visible: true
                },
                {
                    type: MessageMenuTypes.Pin,
                    title: '置顶',
                    icon: '/static/images/pin.svg',
                    visible:
                        !this.message.pinMap &&
                        !notPinTypes.includes(this.message.contentType)
                },
                {
                    type: MessageMenuTypes.PinCancel,
                    title: '取消置顶',
                    icon: '/static/images/cancel-pin.svg',
                    visible:
                        this.message.pinMap &&
                        !notPinTypes.includes(this.message.contentType)
                },
                {
                    type: MessageMenuTypes.Reply,
                    title: '回复',
                    icon: '/static/images/chating_message_reply.svg',
                    visible: true
                },
                {
                    type: MessageMenuTypes.Edit,
                    title: '编辑',
                    icon: '/static/images/chating_message_edit.svg',
                    visible:
                        TextRenderTypes.includes(this.message.contentType) &&
                        this.isMyMsg &&
                        this.message.contentType !== 117
                },
                {
                    type: MessageMenuTypes.Copy,
                    title: '复制',
                    icon: '/static/images/chating_message_copy.svg',
                    visible: TextRenderTypes.includes(this.message.contentType)
                },
                {
                    type: MessageMenuTypes.Revoke,
                    title: '撤回',
                    icon: '/static/images/chating_message_revoke.svg',
                    visible: this.isSender
                },
                {
                    type: MessageMenuTypes.Multiple,
                    title: '多选',
                    icon: '/static/images/chating_message_multiple.svg',
                    visible: true
                },
                {
                    type: MessageMenuTypes.Favorite,
                    title: '收藏',
                    icon: '/static/images/chating_message_favorite.svg',
                    visible: true
                },
                {
                    type: MessageMenuTypes.Del,
                    title: '删除',
                    icon: '/static/images/chating_message_del.svg',
                    visible: this.isMyMsg || this.isSingle
                },
                {
                    type: MessageMenuTypes.Save,
                    title: '保存',
                    icon: '/static/images/chating_message_save.svg',
                    visible: this.showMediaRender
                }
            ].filter(v => v.visible);
        },
        showTextRender() {
            return TextRenderTypes.includes(this.message.contentType);
        },
        showMediaRender() {
            return MediaRenderTypes.includes(this.message.contentType);
        },
        showFileRender() {
            return FileRenderTypes.includes(this.message.contentType);
        },
        isMyMsg() {
            return this.message.sendID === this.storeCurrentUserID;
        },
        isVideo() {
            return this.message.contentType === MessageType.VideoMessage;
        },
        isSingle() {
            return this.message.sessionType === SessionType.Single;
        }
    },
    watch: {
        visible: {
            handler() {
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
        back(steps) {
            this.steps = steps;
        },
        async getMsgID() {
            try {
                this.userList = [];
                const { chatLogs } = await getMsgID({
                    clientMsgID: this.message.clientMsgID,
                    groupID: this.message.groupID,
                    sendID: this.message.sendID,
                    sessionType: this.message.sessionType
                });
                if (chatLogs && chatLogs[0] && chatLogs[0].attachedInfo) {
                    this.attachedInfo = JSON.parse(chatLogs[0].attachedInfo);
                }
                if (!this.attachedInfo.groupHasReadInfo.hasReadUids) return;
                this.userList = await getUserListInfo(
                    this.attachedInfo.groupHasReadInfo.hasReadUids
                );
                this.userList = this.userList.map(user => user.publicInfo);
            } catch (err) {
                console.log(err);
            }
        },
        showAllRead() {
            this.steps = this.steps === 'second' ? 'first' : 'second';
            this.secondTemplate = 'readCount';
        },
        async menuClick({ type }) {
            switch (type) {
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
                    this.handleFavorite(this.message);
                    break;
                case MessageMenuTypes.Save:
                    this.handleSave(this.message);
                    break;
                case MessageMenuTypes.Reply:
                    uni.$emit('active_message', {
                        message: this.message,
                        type: 'quote_message'
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
                        type: 'edit_message'
                    });
                    break;
            }
            this.$emit('close');
        },
        async handleFavorite(message) {
            uni.$emit('handleFavorite', message);
        },
        handleSave(message) {
            const { pictureElem, videoElem } = message;
            let filePath = pictureElem?.sourcePicture?.url;
            if (this.isVideo) {
                filePath = videoElem.videoUrl;
            }
            function fail() {
                uni.hideLoading();
                uni.showToast({
                    title: '保存失败，请稍后重试',
                    icon: 'none'
                });
            }
            uni.showLoading();
            uni.downloadFile({
                url: formatFileUrl(filePath),
                success: res => {
                    if (res.statusCode === 200) {
                        uni.saveImageToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: () => {
                                uni.hideLoading();
                                uni.showToast({
                                    title: '保存成功',
                                    icon: 'success'
                                });
                            },
                            fail: () => {
                                fail();
                            }
                        });
                    } else {
                        fail();
                    }
                },
                fail: () => {
                    fail();
                }
            });
        },
        addEmoticons() {
            const { pictureElem, videoElem } = this.message;
            let filePath = pictureElem?.sourcePicture.url;
            if (this.isVideo) {
                filePath = videoElem?.snapshotUrl;
            }
            this.saveEmoticons(filePath);
            // filePath = localEx || filePath;
            // uni.getFileInfo({
            //     filePath,
            //     success: () => {
            //         this.saveEmoticons(filePath);
            //     },
            //     fail: () => {
            //         filePath = pictureElem?.sourcePicture.url;
            //         if (this.isVideo) {
            //             filePath = videoElem?.snapshotUrl;
            //         }
            //         this.saveEmoticons(filePath);
            //     }
            // });
        },
        async saveEmoticons(filePath) {
            try {
                await emojiCollect({
                    url: filePath
                });
                uni.$u.toast('添加成功');
                uni.$emit('undateEmoticons', 'init');
            } catch (err) {
                const { errCode } = err;
                console.log('err---err', err);
                if (errCode === 222) {
                    uni.$u.toast('重复添加');
                    return;
                }
                uni.$u.toast('添加失败');
            }
        },
        getContent() {
            let text = '';
            const { contentType, quoteElem, atTextElem, textElem } =
                this.message;
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
        async pin() {
            try {
                const { pictureElem, videoElem, fileElem, contentType } =
                    this.message;
                let content = '';
                if (this.showTextRender) {
                    content = html2Text(this.getContent());
                } else if (this.showMediaRender) {
                    content =
                        contentType === MessageType.VideoMessage
                            ? videoElem?.snapshotUrl
                            : pictureElem?.sourcePicture.url;
                } else if (this.showFileRender) {
                    content = fileElem?.fileName;
                }
                await pin({
                    ...this.message,
                    content: content,
                    conversationID:
                        this.$store.getters.storeCurrentConversation
                            .conversationID
                });
                this.$emit('updatePin', {
                    type: 'success',
                    icon: `/static/images/pin.svg`,
                    text: '消息内容已置顶'
                });
            } catch (err) {
                //
                uni.$u.toast('置顶失败');
            }
        },
        async PinCancel() {
            try {
                await pinCancel({
                    id: this.message?.pinMap?.id
                });
                this.$emit('updatePin', {
                    type: 'fail',
                    icon: `/static/images/cancel-pin.svg`,
                    text: '已取消置顶'
                });
            } catch (err) {
                uni.$u.toast('取消置顶失败');
            }
        },
        async handleForward() {
            const message = await IMSDK.asyncApi(
                IMMethods.CreateForwardMessage,
                IMSDK.uuid(),
                this.message
            );
            message.ex = undefined;
            if (message.quoteElem) {
                message.quoteElem.quoteMessage = undefined;
            }
            uni.$u.route('/pages/common/msgForward/index', {
                message: encodeURIComponent(JSON.stringify(message))
            });
            uni.hideKeyboard();
        },
        handleCopy() {
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
        async handleRevoke() {
            try {
                this.$loading('撤回中');
                await IMSDK.asyncApi(
                    IMSDK.IMMethods.RevokeMessage,
                    IMSDK.uuid(),
                    {
                        conversationID:
                            this.$store.getters.storeCurrentConversation
                                .conversationID,
                        clientMsgID: this.message.clientMsgID
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
                                sourceMessageSenderNickname:
                                    this.message.senderNickname
                            })
                        }
                    }
                });
            } catch {
                uni.$u.toast('撤回失败');
            }
        },
        handleMultiple() {
            uni.$emit('multiple_message', {
                show: true,
                message: this.message,
                type: MessageMenuTypes.Init
            });
            uni.$emit('inputBlur');
        },
        getCopyText() {
            const { contentType, atTextElem, quoteElem, textElem } =
                this.message;
            if (contentType === MessageType.AtTextMessage) {
                return atTextElem.text;
            }
            if (contentType === MessageType.QuoteMessage) {
                return DecryptoAES(quoteElem.text);
            }
            return DecryptoAES(textElem.content);
        },
        async like(emoji) {
            try {
                const { clientMsgID, serverMsgID, sendID, recvID, groupID } =
                    this.message;
                await giveLikeEmoji({
                    clientMsgID,
                    serverMsgID,
                    sendID,
                    recvID,
                    groupID,
                    emoji
                });
                this.$emit('close');
            } catch (err) {
                console.log('err-err', err);
                uni.$u.toast('点赞失败');
            }
        }
    }
};
</script>

<style scoped lang="scss">
.message_menu_container {
    // width: 200px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999999;
    color: $uni-text-color-inverse;
    .read-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 45rpx;
        background: rgba(0, 0, 0, 0.6);
        height: 100rpx;
        padding: 20rpx;
        margin-top: 20rpx;
        .left {
            display: flex;
            align-items: center;
            uni-image {
                width: 38rpx;
                height: 24rpx;
            }
            uni-text {
                color: #fff;
                margin-left: 20rpx;
            }
        }
        .right {
            display: flex;
            align-items: center;
            uni-image {
                width: 50rpx;
                height: 50rpx;
            }
            .rotate {
                transform: rotate(180deg);
            }
            .read-img-list {
                display: flex;
                position: relative;
                align-items: center;
                margin-right: 20rpx;
                height: 50rpx;
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
    .message_menu {
        display: flex;
        flex-wrap: wrap;
        padding: 0 20rpx;
        background-color: rgba($uni-bg-color-inverse, 0.6);
        margin-top: 20rpx;
        border-radius: 15px;
    }

    .message_menu_item {
        width: 20%;
        // height: 80rpx;
        padding: 30rpx 10rpx;
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
            uni-image {
                width: 38rpx;
                height: 38rpx;
                display: block;
                margin: 0 auto;
            }
            uni-text {
                display: block;
                margin: 0 auto;
                margin-top: 10rpx;
                text-align: center;
            }
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
        }
    }
}
</style>

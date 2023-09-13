<!-- eslint-disable vue/attribute-hyphenation -->
<template>
    <view
        :snapFlag="snapFlag"
        :change:snapFlag="snap.getSnapFlagUpdate"
        :style="{ 'pointer-events': 'auto' }"
        class="bg-color"
    >
        <view class="chat_footer">
            <view
                v-if="isMultipleMsg"
                class="h-110 flex justify-between align-center px-36"
            >
                <image
                    :src="`/static/images/chating_message_del_${checkedMsgIds.length === 0 ? 'grey' : 'active'}.png`"
                    class="w-44 h-44"
                    @click="handleMultiple(MessageMenuTypes.DelAll)"
                />
                <image
                    :src="`/static/images/chating_message_forward_${checkedMsgIds.length === 0 ? 'grey' : 'active'}.png`"
                    class="w-44 h-44"
                    @click="handleMultiple(MessageMenuTypes.ForwardAll)"
                />
            </view>
            <template v-else>
                <view
                    v-if="quoteMessage"
                    class="quote_box"
                >
                    <view class="icon_box">
                        <image
                            src="/static/images/chating_footer_quote_reply.png"
                            class="w-38 h-38"
                        />
                    </view>
                    <view class="message_box">
                        <view class="primary title">
                            回复 {{ quoteMessage.senderNickname }}
                        </view>
                        <ChatQuote :message="quoteMessage" />
                    </view>
                    <image
                        src="/static/images/chating_footer_quote_close.png"
                        class="w-30 h-30 ml-40"
                        @click="quoteMessage = null"
                    />
                </view>
                <view class="send_box">
                    <view class="flex align-center">
                        <image
                            class="w-48 h-48 mr-20"
                            src="/static/images/chating_footer_emoji.png"
                            @click="updateEmojiBar"
                        />
                        <image
                            class="w-48 h-48"
                            src="/static/images/chating_footer_add.png"
                            @click.prevent="updateActionBar"
                        />
                    </view>
                    <view class="input_content">
                        <CustomEditor
                            ref="customEditor"
                            class="custom_editor"
                            @ready="editorReady"
                            @focus="editorFocus"
                            @blur="editorBlur"
                            @input="editorInput"
                        />
                    </view>
                    <image
                        v-show="hasContent"
                        src="/static/images/chating_footer_send.png"
                        class="w-80 h-80 ml-20"
                        @touchend.prevent="sendTextMessage"
                    />
                    <!-- <view class="flex align-center">
                    </view> -->
                </view>
            </template>
        </view>
        <ChatingActionBar
            v-show="actionBarVisible"
            @prepareMediaMessage="prepareMediaMessage"
            @prepareFileMessage="prepareFileMessage"
        />
        <ChatingEmojiBar
            v-show="emojiBarVisible"
            @emojiClick="emojiClick"
        />
        <u-action-sheet
            :safe-area-inset-bottom="true"
            round="12"
            :actions="actionSheetMenu"
            :close-on-click-overlay="true"
            :close-on-click-action="true"
            :show="showActionSheet"
            @select="selectClick"
            @close="showActionSheet = false"
        />
    </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { base64ToPath } from 'image-tools';
import { formatInputHtml, getPurePath, html2Text } from '@/util/common';
import { offlinePushInfo } from '@/util/imCommon';
import {
    ChatingFooterActionTypes,
    UpdateMessageTypes,
    ImageType,
    VideoType,
    MessageMenuTypes,
    PageEvents
} from '@/constant';
import IMSDK, {
    IMMethods,
    MessageStatus,
    MessageType,
} from 'openim-uniapp-polyfill';
import CustomEditor from './CustomEditor.vue';
import ChatingActionBar from './ChatingActionBar.vue';
import ChatingEmojiBar from './ChatingEmojiBar.vue';
import ChatQuote from '@/components/ChatQuote';
import { EncryptoAES } from '@/util/crypto';
import { chooseFile } from '@/util/unisdk';

const needClearTypes = [
    MessageType.TextMessage,
    MessageType.AtTextMessage,
    MessageType.QuoteMessage,
];

const albumChoose = [
    {
        name: '图片',
        type: ChatingFooterActionTypes.Album,
        idx: 0,
    },
    {
        name: '视频',
        type: ChatingFooterActionTypes.Album,
        idx: 1,
    },
];
const cameraChoose = [
    {
        name: '拍照',
        type: ChatingFooterActionTypes.Camera,
        idx: 0,
    },
    {
        name: '录制',
        type: ChatingFooterActionTypes.Camera,
        idx: 1,
    },
];

export default {
    components: {
        CustomEditor,
        ChatingActionBar,
        ChatingEmojiBar,
        ChatQuote
    },
    props: {
        footerOutsideFlag: {
            required: true,
            type: Number,
        },
        isMultipleMsg: {
            type: Boolean,
            default: false,
        },
        checkedMsgIds: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            MessageMenuTypes: Object.freeze(MessageMenuTypes),
            customEditorCtx: null,
            inputHtml: '',
            oldText: '',
            actionBarVisible: false,
            emojiBarVisible: false,
            isInputFocus: false,
            actionSheetMenu: [],
            showActionSheet: false,
            snapFlag: null,
            quoteMessage: null
        };
    },
    computed: {
        ...mapGetters(['storeCurrentConversation']),
        hasContent () {
            return html2Text(this.inputHtml) !== '';
        },
    },
    watch: {
        footerOutsideFlag () {
            this.onClickActionBarOutside();
            this.onClickEmojiBarOutside();
        },
    },
    mounted () {
        this.setSendMessageListener();
        this.setKeyboardListener();
        uni.$on('quote_message', this.handleQuoteListener);
    },
    beforeDestroy () {
        this.disposeSendMessageListener();
        this.disposeKeyboardListener();
        uni.$off('quote_message', this.handleQuoteListener);
    },
    methods: {
        ...mapActions('message', ['pushNewMessage', 'updateOneMessage']),
        async createTextMessage () {
            let message = '';
            const { text } = formatInputHtml(this.inputHtml);
            // TODO：加密文本
            if (this.quoteMessage) {
                message = await IMSDK.asyncApi(
                    IMMethods.CreateQuoteMessage,
                    IMSDK.uuid(),
                    {
                        text: EncryptoAES(text),
                        message: this.quoteMessage
                    }
                );
                this.quoteMessage = null;
            } else {
                message = await IMSDK.asyncApi(
                    IMMethods.CreateTextMessage,
                    IMSDK.uuid(),
                    EncryptoAES(text)
                );
            }
            return message;
        },
        async sendTextMessage () {
            const message = await this.createTextMessage();
            this.sendMessage(message);
        },
        async sendMessage (message) {
            console.log('消息创建成功', message);
            this.pushNewMessage(message);
            uni.$emit(PageEvents.ScrollToBottom);
            if (needClearTypes.includes(message.contentType)) {
                this.customEditorCtx.clear();
            }
            try {
                const { data } = await IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
                    recvID: this.storeCurrentConversation.userID,
                    groupID: this.storeCurrentConversation.groupID,
                    message,
                    offlinePushInfo,
                });
                console.log('消息发送成功', data);
                this.updateOneMessage({
                    message: data,
                    isSuccess: true,
                });
            } catch ({ data, errCode }) {
                this.updateOneMessage({
                    message: data,
                    type: UpdateMessageTypes.KeyWords,
                    keyWords: [
                        {
                            key: 'status',
                            value: MessageStatus.Failed,
                        },
                        {
                            key: 'errCode',
                            value: errCode,
                        },
                    ],
                });
            }
        },

        // action
        onClickActionBarOutside () {
            if (this.actionBarVisible) {
                this.actionBarVisible = false;
            }
        },
        onClickEmojiBarOutside () {
            if (this.emojiBarVisible) {
                this.emojiBarVisible = false;
            }
        },
        updateActionBar () {
            this.onClickEmojiBarOutside();
            this.actionBarVisible = !this.actionBarVisible;
        },
        updateEmojiBar () {
            this.onClickActionBarOutside();
            this.emojiBarVisible = !this.emojiBarVisible;
        },
        editorReady (e) {
            this.customEditorCtx = e.context;
            this.customEditorCtx.clear();
        },
        editorFocus () {
            // #ifdef APP-IOS
            setTimeout(() => {
                uni.$emit(PageEvents.ScrollToBottom);
            }, 500);
            // #endif
            // #ifndef APP-IOS
            uni.$emit(PageEvents.ScrollToBottom);
            // #endif
            this.isInputFocus = true;
        },
        editorBlur () {
            this.isInputFocus = false;
        },
        editorInput (e) {
            const newText = html2Text(e.detail.html);
            // if (
            //     this.$store.getters.storeCurrentConversation.groupID &&
            //     this.oldText.length < newText.length &&
            //     newText.endsWith('@')
            // ) {
            //     uni.$u.route('/pages/conversation/groupMemberList/index', {
            //         type: GroupMemberListTypes.ChooseAt,
            //         groupID:
            //             this.$store.getters.storeCurrentConversation.groupID,
            //     });
            // }
            this.inputHtml = e.detail.html;
            this.oldText = newText;
        },
        prepareMediaMessage (type) {
            if (type === ChatingFooterActionTypes.Album) {
                this.actionSheetMenu = [...albumChoose];
            } else {
                this.actionSheetMenu = [...cameraChoose];
            }
            this.showActionSheet = true;
        },
        async prepareFileMessage () {
            const { fileType, filePath, fileName } = await chooseFile();
            if (ImageType.includes(fileType)) {
                this.batchCreateImageMesage([filePath]);
            } else if (VideoType.includes(fileType)) {
                uni.getVideoInfo({
                    src: filePath,
                    success: (res) => {
                        this.snapFlag = {
                            path: filePath,
                            videoType: fileType,
                            duration: res.duration
                        };
                    },
                    fail: (err) => {
                        console.log(err);
                    }
                });
            } else {
                this.batchCreateFileMesage({
                    path: filePath,
                    name: fileName
                });
            }
        },
        // from comp
        emojiClick (emoji) {
            const options = {
                src: emoji.src,
                width: '24px',
                height: '18px',
                data: {
                    emojiText: emoji.context,
                },
                extClass: 'emoji_el',
            };
            this.$refs.customEditor.insertImage(options);
        },
        batchCreateImageMesage (paths) {
            paths.forEach(async path => {
                const message = await IMSDK.asyncApi(
                    IMMethods.CreateImageMessageFromFullPath,
                    IMSDK.uuid(),
                    getPurePath(path)
                );
                if (!message) {
                    return;
                }
                this.sendMessage(message);
            });
        },
        async receiveSnapBase64 ({ base64, path, duration, videoType }) {
            const snapRelativePath = await base64ToPath(base64);
            const absolutePath = plus.io.convertLocalFileSystemURL(snapRelativePath);
            const message = await IMSDK.asyncApi(
                IMMethods.CreateVideoMessageFromFullPath,
                IMSDK.uuid(),
                {
                    videoPath: getPurePath(path),
                    videoType: videoType,
                    duration: Number(duration.toFixed()),
                    snapshotPath: absolutePath,
                }
            );

            this.sendMessage(message);
        },
        async batchCreateFileMesage ({ path, name }) {
            const message = await IMSDK.asyncApi(
                IMMethods.CreateFileMessageFromFullPath,
                IMSDK.uuid(),
                {
                    filePath: getPurePath(path),
                    fileName: name
                }
            );
            console.log('xxx', path, message);
            this.sendMessage(message);
        },
        selectClick ({ idx }) {
            if (idx === 0) {
                if (
                    this.actionSheetMenu[0].type ===
                    ChatingFooterActionTypes.Album
                ) {
                    this.chooseOrShotImage(['album']).then((paths) =>
                        this.batchCreateImageMesage(paths)
                    );
                } else {
                    this.chooseOrShotImage(['camera']).then((paths) =>
                        this.batchCreateImageMesage(paths)
                    );
                }
            } else {
                const whenGetFile = (data) => {
                    this.snapFlag = data;
                };
                if (
                    this.actionSheetMenu[0].type ===
                    ChatingFooterActionTypes.Album
                ) {
                    this.chooseOrShotVideo(['album']).then(whenGetFile);
                } else {
                    this.chooseOrShotVideo(['camera']).then(whenGetFile);
                }
            }
        },
        chooseOrShotImage (sourceType) {
            return new Promise((resolve, reject) => {
                uni.chooseImage({
                    count: 9,
                    sizeType: ['compressed'],
                    sourceType,
                    success: function ({ tempFilePaths }) {
                        resolve(tempFilePaths);
                    },
                    fail: function (err) {
                        console.log(err);
                        reject(err);
                    },
                });
            });
        },
        chooseOrShotVideo (sourceType) {
            return new Promise((resolve, reject) => {
                uni.chooseVideo({
                    compressed: true,
                    sourceType,
                    extension: ['mp4'],
                    success: function ({ tempFilePath, duration }) {
                        const idx = tempFilePath.lastIndexOf('.');
                        const videoType = tempFilePath.slice(idx + 1);
                        console.log(tempFilePath);
                        if (tempFilePath.includes('_doc/')) {
                            tempFilePath = `file://${plus.io.convertLocalFileSystemURL(
                                tempFilePath
                            )}`;
                        }
                        resolve({
                            path: tempFilePath,
                            videoType,
                            duration,
                        });
                    },
                    fail: function (err) {
                        console.log(err);
                        reject(err);
                    },
                });
            });
        },
        handleMultiple (type) {
            uni.$emit('multiple_message', {
                show: true,
                type
            });
        },

        // message status
        sendProgressHandler ({ data: { progress, message } }) {
            this.updateOneMessage({
                message,
                type: UpdateMessageTypes.KeyWords,
                keyWords: {
                    key: 'uploadProgress',
                    value: progress,
                },
            });
        },
        setSendMessageListener () {
            IMSDK.subscribe(
                IMSDK.IMEvents.SendMessageProgress,
                this.sendProgressHandler
            );
        },
        disposeSendMessageListener () {
            IMSDK.unsubscribe(
                IMSDK.IMEvents.SendMessageProgress,
                this.sendProgressHandler
            );
        },
        // keyboard
        keyboardChangeHander (data) {
            const { height } = data;
            if (height > 0) {
                if (this.emojiBarVisible) {
                    this.emojiBarVisible = false;
                }
                if (this.actionBarVisible) {
                    this.actionBarVisible = false;
                }
            }
            uni.$emit('keyboardChange', data);
        },
        setKeyboardListener () {
            uni.onKeyboardHeightChange(this.keyboardChangeHander);
        },
        disposeKeyboardListener () {
            uni.offKeyboardHeightChange(this.keyboardChangeHander);
        },
        handleQuoteListener (val) {
            console.log('引用', val);
            this.$refs.customEditor.editorCtx.insertText({text: ''});
            this.quoteMessage = val;
        }
    },
};
</script>

<script module="snap" lang="renderjs">
export default {
	methods: {
		getSnapFlagUpdate(newValue, oldValue, ownerVm, vm) {
			if (newValue === null) {
				return;
			}
			const {
				path
			} = newValue
			this.getVideoSnshot(path).then(base64 => {
				ownerVm.callMethod('receiveSnapBase64', {
					...newValue,
					base64
				})
			})
		},
		getVideoSnshot(item) {
			return new Promise((reslove, reject) => {
				var video = document.createElement("VIDEO");
				video.style.display = 'none';
				video.setAttribute('crossOrigin', 'anonymous');
				video.setAttribute("autoplay", "autoplay");
				video.setAttribute("muted", "muted");
				video.innerHTML = "<source src=" + item + ' type="audio/mp4">';
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext("2d");
				video.addEventListener("canplay", function() {
					var anw = document.createAttribute("width");
					anw.nodeValue = video.videoWidth;
					var anh = document.createAttribute("height");
					anh.nodeValue = video.videoHeight;
					canvas.setAttributeNode(anw);
					canvas.setAttributeNode(anh);
					ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
					var base64 = canvas.toDataURL("image/png");
					video.pause();
					reslove(base64);
				});
			});
		},
	},
}
</script>

<style lang="scss" scoped>
.custom_editor {
    img {
        vertical-align: sub;
    }
}

.chat_footer {
    .quote_box {
        height: 100rpx;
        @include vCenterBox();
        padding: 10rpx 20rpx;
        border-bottom: 2rpx solid $uni-color-thinGrey;
        .icon_box {
            height: 100%;
            padding-right: 40rpx;
            @include vCenterBox();
            border-right: 4rpx solid $uni-color-primary;
            margin-right: 10rpx;
        }
        .message_box {
            flex: 1;
            overflow: hidden;
            font-size: 28rpx;
            .title {
                @include nomalEllipsis();
            }
        }
    }
    .send_box {
        display: flex;
        align-items: center;
        padding: 30rpx 20rpx;
    
        .input_content {
            flex: 1;
            margin-left: 20rpx;
            border-radius: 8rpx;
            position: relative;
            overflow: hidden;
    
            .record_btn {
                background-color: #3c9cff;
                height: 30px;
                font-size: 24rpx;
            }
        }
    }
}
</style>

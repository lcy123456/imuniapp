<!-- eslint-disable vue/attribute-hyphenation -->
<template>
    <view
        :snapFlag="snapFlag"
        :change:snapFlag="snap.getSnapFlagUpdate"
        :style="{ 'pointer-events': 'auto' }"
        class="pb-50 bg-color"
    >
        <view class="chat_footer">
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
            <view class="flex align-center">
                <image
                    v-show="hasContent"
                    src="/static/images/chating_footer_send.png"
                    class="w-80 h-80"
                    @touchend.prevent="sendTextMessage"
                />
            </view>
        </view>
        <ChatingActionBar
            v-show="actionBarVisible"
            ref="ChatingActionBarRef"
            @sendMessage="sendMessage"
            @prepareMediaMessage="prepareMediaMessage"
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
    GroupMemberListTypes,
} from '@/constant';
import IMSDK, {
    IMMethods,
    MessageStatus,
    MessageType,
} from 'openim-uniapp-polyfill';
import CustomEditor from './CustomEditor.vue';
import ChatingActionBar from './ChatingActionBar.vue';
import ChatingEmojiBar from './ChatingEmojiBar.vue';
import { EncryptoAES } from '@/util/crypto';

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
    },
    props: {
        footerOutsideFlag: {
            required: true,
            type: Number,
        },
    },
    data () {
        return {
            customEditorCtx: null,
            inputHtml: '',
            oldText: '',
            actionBarVisible: false,
            emojiBarVisible: false,
            isInputFocus: false,
            actionSheetMenu: [],
            showActionSheet: false,
            snapFlag: null,
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
        actionBarVisible (val) {
            const fn = val ? 'show' : 'hide';
            this.$nextTick(() => {
                this.$refs.ChatingActionBarRef.checkFileLayout(fn);
            });
        },
        showActionSheet (val) {
            const fn = val ? 'hide' : 'show';
            this.$nextTick(() => {
                this.$refs.ChatingActionBarRef.checkFileLayout(fn);
            });
        }
    },
    mounted () {
        this.setSendMessageListener();
        this.setKeyboardListener();
    },
    beforeDestroy () {
        this.disposeSendMessageListener();
        this.disposeKeyboardListener();
    },
    methods: {
        ...mapActions('message', ['pushNewMessage', 'updateOneMessage']),
        async createTextMessage () {
            let message = '';
            const { text } = formatInputHtml(this.inputHtml);
            // TODO：加密文本
            message = await IMSDK.asyncApi(
                IMMethods.CreateTextMessage,
                IMSDK.uuid(),
                EncryptoAES(text)
            );
            console.log('xxx', message);
            return message;
        },
        async sendTextMessage () {
            if (!this.hasContent) return;
            const message = await this.createTextMessage();
            this.sendMessage(message);
        },
        sendMessage (message) {
            this.pushNewMessage(message);
            if (needClearTypes.includes(message.contentType)) {
                this.customEditorCtx.clear();
            }
            this.$emit('scrollToBottom');
            IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
                recvID: this.storeCurrentConversation.userID,
                groupID: this.storeCurrentConversation.groupID,
                message,
                offlinePushInfo,
            })
                .then(({ data }) => {
                    console.log('xxx', data);
                    this.updateOneMessage({
                        message: data,
                        isSuccess: true,
                    });
                })
                .catch(({ data, errCode }) => {
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
                });
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
            this.isInputFocus = true;
            this.$emit('scrollToBottom');
        },
        editorBlur () {
            this.isInputFocus = false;
        },
        editorInput (e) {
            const newText = html2Text(e.detail.html);
            if (
                this.$store.getters.storeCurrentConversation.groupID &&
                this.oldText.length < newText.length &&
                newText.endsWith('@')
            ) {
                uni.$u.route('/pages/conversation/groupMemberList/index', {
                    type: GroupMemberListTypes.ChooseAt,
                    groupID:
                        this.$store.getters.storeCurrentConversation.groupID,
                });
            }
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
        async prepareFileMessage ({type, files}) {
            console.log('xxx', type, files);
            for (let i = 0; i < files.length; i++) {
                const relPath = await this.base64ToPath(files[0].base64);
                const path = plus.io.convertLocalFileSystemURL(relPath);
                console.log(relPath, path);
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
            paths.forEach(async (path, index) => {
                const message = await IMSDK.asyncApi(
                    IMMethods.CreateImageMessageFromFullPath,
                    IMSDK.uuid(),
                    getPurePath(path)
                );
                if (!message) {
                    return;
                }
                console.log('xxx', path, index, message);
                this.sendMessage(message);
            });
        },
        receiveSnapBase64 ({ base64, path, duration, videoType }) {
            base64ToPath(base64).then(async (snapRelativePath) => {
                const absolutePath =
                    plus.io.convertLocalFileSystemURL(snapRelativePath);
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
            });
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
        keyboardChangeHander ({ height }) {
            if (height > 0) {
                if (this.emojiBarVisible) {
                    this.emojiBarVisible = false;
                }
                if (this.actionBarVisible) {
                    this.actionBarVisible = false;
                }
            }
        },
        setKeyboardListener () {
            uni.onKeyboardHeightChange(this.keyboardChangeHander);
        },
        disposeKeyboardListener () {
            uni.offKeyboardHeightChange(this.keyboardChangeHander);
        },
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
    display: flex;
    align-items: center;
    // height: 50px;
    max-height: 300rpx;
    padding: 30rpx 20rpx;

    .input_content {
        flex: 1;
        margin: 0 20rpx;
        border-radius: 8rpx;
        position: relative;
        overflow: hidden;

        .record_btn {
            background-color: #3c9cff;
            height: 30px;
            font-size: 24rpx;
        }
    }

    .quote_message {
        @include vCenterBox();
        justify-content: space-between;
        margin-top: 12rpx;
        padding: 8rpx;
        // padding-top: 20rpx;
        border-radius: 6rpx;
        background-color: #fff;
        color: #666;

        .content {
            /deep/ uni-view {
                @include ellipsisWithLine(2);
            }
        }
    }
}
</style>

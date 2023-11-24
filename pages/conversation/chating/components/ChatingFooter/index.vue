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
                class="flex justify-between h-110 align-center px-36"
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
                    v-if="activeMessageShow"
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
                            {{ activeMessageType === "quote_message" ? `回复 ${activeMessage.senderNickname}` : "编辑消息" }}
                        </view>
                        <ChatQuote :message="activeMessage" />
                    </view>
                    <image
                        src="/static/images/chating_footer_quote_close.png"
                        class="ml-40 w-30 h-30"
                        @click="activeMessageShow = false"
                    />
                </view>
                <view class="send_box">
                    <view class="flex align-center">
                        <image
                            class="w-48 h-48"
                            src="/static/images/chating_footer_emoji.png"
                            @click="updateEmojiBar"
                        />
                        <image
                            class="w-48 h-48 mx-20"
                            src="/static/images/chating_footer_add.png"
                            @click.prevent="updateActionBar"
                        />
                        <image
                            class="w-48 h-48"
                            :src="`/static/images/${recordVisible ? 
                                'chating_footer_audio'
                                :
                                'chating_footer_audio_recording'}.png`"
                            @click="updateRecordBar"
                        />
                    </view>
                    <view class="input_content">
                        <div
                            v-if="recordVisible"
                            class="record_btn"
                            @touchstart="handleRecorderStart"
                            @touchend="handleRecorderEnd"
                            @touchmove="handleRecordMove"
                        >
                            按住说话
                        </div>
                        <CustomEditor
                            v-else
                            ref="customEditor"
                            class="custom_editor"
                            @ready="editorReady"
                            @focus="editorFocus"
                            @blur="editorBlur"
                            @input="editorInput"
                        />
                    </view>
                    <image
                        v-show="hasContent && !recordVisible"
                        src="/static/images/chating_footer_send.png"
                        class="ml-20 w-80 h-80"
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
            @sendGif="handleSendGif"
        />
        <ChatingRecordBar v-show="isRecordStart" />
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
        <Notification
            v-model="isShowNotification"
            text="消息已发出，但对方拒收了！"
        />
    </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { base64ToPath } from 'image-tools';
import { formatInputHtml, getPurePath, html2Text, getEl } from '@/util/common';
import { offlinePushInfo, getMessageContent } from '@/util/imCommon';
import { AudioVideoStatus, AudioVideoType } from '@/enum';
import {
    ChatingFooterActionTypes,
    UpdateMessageTypes,
    ImageType,
    VideoType,
    MessageMenuTypes,
    PageEvents,
    TextRenderTypes
} from '@/constant';
import IMSDK, {
    IMMethods,
    MessageStatus,
    MessageType,
    SessionType,
    GroupMemberFilter
} from 'openim-uniapp-polyfill';
import CustomEditor from './CustomEditor.vue';
import ChatingActionBar from './ChatingActionBar.vue';
import ChatingEmojiBar from './ChatingEmojiBar.vue';
import ChatingRecordBar from './ChatingRecordBar.vue';
import ChatQuote from '@/components/ChatQuote';
import { EncryptoAES } from '@/util/crypto';
import { chooseFile, recordVoiceManager } from '@/util/unisdk';
import { videoCreateRoomAndGetToken } from '@/api/incoming';

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
const callChoose = [
    {
        name: '视频通话',
        type: ChatingFooterActionTypes.Call,
        idx: 0,
    },
    {
        name: '语音通话',
        type: ChatingFooterActionTypes.Call,
        idx: 1,
    },
];

export default {
    components: {
        CustomEditor,
        ChatingActionBar,
        ChatingEmojiBar,
        ChatingRecordBar,
        ChatQuote,
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
            isShowNotification: false,
            inputHtml: '',
            oldText: '',
            actionBarVisible: false,
            emojiBarVisible: false,
            recordVisible: false,
            isInputFocus: false,
            actionSheetMenu: [],
            showActionSheet: false,
            snapFlag: null,
            activeMessageShow: false,
            activeMessageType: false,
            activeMessage: null,
            isRecordStart: false,
            isRecordCancel: false,
            recordCancelBtnInfo: {},
        };
    },
    computed: {
        ...mapGetters([
            'storeCurrentConversation',
            'storeHasMoreAfterMessage',
            'storeIsIncomingCallLoading',
            'storeIsIncomingCallIng',
            'storeIncomingIsGroupChat'
        ]),
        hasContent () {
            return html2Text(this.inputHtml) !== '';
        },
    },
    watch: {
        footerOutsideFlag () {
            this.actionBarVisible = false;
            this.emojiBarVisible = false;
        },
    },
    mounted () {
        this.setSendMessageListener();
        // this.setKeyboardListener();
        uni.$on('active_message', this.handleMessageListener);
        uni.$on('initWebrtc', this.initWebrtc);
        uni.$on('sendMessage', this.sendMessage);
    },
    beforeDestroy () {
        this.disposeSendMessageListener();
        // this.disposeKeyboardListener();
        uni.$off('active_message', this.handleMessageListener);
        uni.$off('initWebrtc', this.initWebrtc);
        uni.$off('sendMessage', this.sendMessage);
        clearInterval(this.timer);
        uni.hideLoading();
    },
    methods: {
        ...mapActions('message', ['pushNewMessage', 'updateOneMessage']),
        ...mapActions('incomingCall', ['onThrowCall', 'reviewPermission']),
        async createTextMessage () {
            let message = '';
            const { text } = formatInputHtml(this.inputHtml, 1);
            if (this.activeMessageShow) {
                if (this.activeMessageType === "quote_message") {
                    message = await IMSDK.asyncApi(
                        IMMethods.CreateQuoteMessage,
                        IMSDK.uuid(),
                        {
                            text: EncryptoAES(text),
                            message: this.activeMessage
                        }
                    );
                } else if (this.activeMessageType === "edit_message") {
                    // TODO：编辑消息
                    const { contentType, quoteElem, atTextElem, textElem, ex } = this.activeMessage;
                    if (contentType === MessageType.QuoteMessage) {
                        quoteElem.text = EncryptoAES(text);
                    } else if (contentType === MessageType.AtTextMessage) {
                        atTextElem.text = EncryptoAES(text);
                    } else {
                        textElem.content = EncryptoAES(text);
                    }
                    const _ex = ex ? JSON.parse(ex) : {};
                    message = {
                        ...this.activeMessage,
                        ex: JSON.stringify({
                            ..._ex,
                            isEdit: true
                        })
                    };
                }
                this.activeMessageShow = false;
            } else {
                message = await IMSDK.asyncApi(
                    IMMethods.CreateTextMessage,
                    IMSDK.uuid(),
                    EncryptoAES(text)
                );
            }
            console.log(message, '-----messagemessagemessagemessagemessagemessage');
            return message;
        },
        async getGroupMemberList () {
            const { userID, groupID } = this.storeCurrentConversation;
            if (groupID) {
                const data = await IMSDK.asyncApi(
                    IMMethods.GetGroupMemberList,
                    IMSDK.uuid(),
                    {
                        groupID,
                        filter: GroupMemberFilter.All,
                        offset: 0,
                        count: 100
                    }
                );
                console.log(data, 'getGroupMemberList()  GetGroupMemberList===');
            } else {
                const data = await IMSDK.asyncApi(IMMethods.GetUsersInfo, IMSDK.uuid(),
                    [userID]
                );
                console.log(data);
            }
        },
        async createCustomMessage (data) {
            let message = await IMSDK.asyncApi(
                IMMethods.CreateCustomMessage,
                IMSDK.uuid(),
                {...data}
            );
            return message;
        },
        async sendCustomMessage (type) {
            this.isLoadingCreateRoom = true;
            try {
                const message = await this.createCustomMessage({
                    data: JSON.stringify({
                        type: type === 'video' ? AudioVideoType.Video : AudioVideoType.Audio,
                        status: AudioVideoStatus.Send
                    }),
                    extension: '',
                    description: ''
                });
                return this.sendAudioVideoMessage(message, type);
            } catch (err) {
                uni.$u.toast('网络异常，请稍后重试');
                return false;
            }
        },
        async sendBusyMessage (type) {
            const message = await this.createCustomMessage({
                data: JSON.stringify({
                    type: type === 'video' ? AudioVideoType.Video : AudioVideoType.Audio,
                    status: AudioVideoStatus.Busy
                }),
                extension: '',
                description: ''
            });
            return this.sendMessage(message, type);
        },
        async sendAudioVideoMessage (message, type) {
            const { userID, groupID, conversationID } = this.storeCurrentConversation;
            try {
                // 创建聊天获取token
                const { token } = await videoCreateRoomAndGetToken({
                    sendID: message.sendID,
                    conversationID,
                    recvID: userID,
                    groupID,
                    type: type === 'video' ? AudioVideoType.Video : AudioVideoType.Audio
                });
                console.log('tokenDatatokenDatatokenDatatokenDatatokenData', token);
                if (token) {
                    this.$store.commit('incomingCall/SET_INCOMING_CALL_TOKEN', token);
                }
            } catch (err) {
                const { errCode } = err;
                if (errCode === 1655) {
                    // 占线发送占线消息
                    const { userID, groupID, conversationID } = this.storeCurrentConversation;
                    console.log('userID, groupID, conversationID ', userID, groupID, conversationID, message.sendID);
                    // uni.$u.toast('对方忙线中');
                    this.sendBusyMessage(type);
                } else {
                    uni.$u.toast('网络异常，请稍后重试');
                }
                return false;
            }
            return {
                ...message,
                recvID: userID,
                groupID: groupID,
                sessionType: groupID ? 3 : 1
            };
            // return this.sendMessage(message);
        },
        async sendTextMessage () {
            const message = await this.createTextMessage();
            this.sendMessage(message);
        },
        async sendMessage (message) {
            console.log('消息创建成功', message);
            if (this.storeHasMoreAfterMessage) {
                console.log('发送信息。。。。需要重新new');
                await this.$emit('sendInit');
            }
            const { userID, groupID } = this.storeCurrentConversation;
            this.pushNewMessage({
                ...message,
                recvID: userID,
                groupID,
                sessionType: userID ? SessionType.Single : SessionType.WorkingGroup
            });
            uni.$emit(PageEvents.ScrollToBottom);
            if (TextRenderTypes.includes(message.contentType)) {
                this.customEditorCtx.clear();
            }
            try {
                const { data } = await IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
                    recvID: userID,
                    groupID,
                    message,
                    offlinePushInfo,
                });
                uni.$emit('play_audio', '/static/audio/send_tip.mp3', 'ambient');
                console.log('消息发送成功', data);
                this.updateOneMessage({
                    message: data,
                    isSuccess: true,
                });
                this.isLoadingCreateRoom = false;
                return data;
            } catch ({ data, errCode }) {
                console.log('发送失败', data, errCode);
                if (errCode === 1302) {
                    console.log('被拉黑了');
                    this.isShowNotification = true;
                }
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
                this.isLoadingCreateRoom = false;
            }
        },

        // action
        updateActionBar () {
            this.actionBarVisible = !this.actionBarVisible;
            this.emojiBarVisible = false;
            this.recordVisible = false;
        },
        updateEmojiBar () {
            this.emojiBarVisible = !this.emojiBarVisible;
            this.actionBarVisible = false;
            this.recordVisible = false;
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
            this.emojiBarVisible = false;
            this.actionBarVisible = false;
        },
        editorBlur () {
            this.isInputFocus = false;
        },
        async editorInput (e) {
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
            this.sendTypingMessage('正在输入中...');
        },
        async sendTypingMessage (msgTip) {
            const { userID } = this.storeCurrentConversation;
            const message = await IMSDK.asyncApi(
                IMMethods.TypingStatusUpdate,
                IMSDK.uuid(),
                {
                    recvID: userID,
                    msgTip
                }
            );
            return message;
        },
        prepareMediaMessage (type) {
            if (type === ChatingFooterActionTypes.Album) {
                this.actionSheetMenu = [...albumChoose];
            } else if (type === ChatingFooterActionTypes.Camera) {
                this.actionSheetMenu = [...cameraChoose];
            } else if (type === ChatingFooterActionTypes.Call) {
                this.actionSheetMenu = [...callChoose];
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
        async handleSendGif (original) {
            this.$loading("加载中");
            uni.downloadFile({
                url: original.url, // webp
                success: (res) => {
                    if (res.statusCode === 200) {
                        this.batchCreateImageMesage([res.tempFilePath]);
                    }
                },
                fail: () => {
                    this.$hideLoading();
                },
                complete: () => {
                    this.$hideLoading();
                }
            });
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
            this.sendMessage(message);
        },
        async batchCreateSoundMesage ({ path, duration }) {
            const message = await IMSDK.asyncApi(
                IMMethods.CreateSoundMessageFromFullPath,
                IMSDK.uuid(),
                {
                    soundPath: getPurePath(path),
                    duration: duration
                }
            );
            this.sendMessage(message);
        },
        async selectClick ({ idx }) {
            const [{type}] = this.actionSheetMenu;
            if (idx === 0) {
                if (type === ChatingFooterActionTypes.Album) {
                    let permissions = await this.$store.dispatch('base/hasCameraPermissions');
                    if (!permissions) return;
                    this.chooseOrShotImage(['album']).then((paths) =>
                        this.batchCreateImageMesage(paths)
                    );
                } else if (type === ChatingFooterActionTypes.Camera) {
                    let permissions = await this.$store.dispatch('base/hasCameraPermissions');
                    if (!permissions) return;
                    this.chooseOrShotImage(['camera']).then((paths) =>
                        this.batchCreateImageMesage(paths)
                    );
                } else if (type === ChatingFooterActionTypes.Call) {
                    // 发起视频通话
                    this.initWebrtc('video');
                }
            } else if (idx === 1) {
                const whenGetFile = (data) => {
                    this.snapFlag = data;
                };
                if (type === ChatingFooterActionTypes.Album) {
                    this.chooseOrShotVideo(['album']).then(whenGetFile);
                } else if (type === ChatingFooterActionTypes.Camera) {
                    this.chooseOrShotVideo(['camera']).then(whenGetFile);
                } else if (type === ChatingFooterActionTypes.Call) {
                    // 发起语音通话x
                    this.initWebrtc('audio');
                }
            }
        },
        async initWebrtc (type) {
            uni.showLoading();
            const { groupID } = this.storeCurrentConversation;
            console.log('isGroupChatisGroupChatisGroupChat', this.storeIncomingIsGroupChat);
            if (groupID && this.storeIncomingIsGroupChat) {
                uni.hideLoading();
                return uni.$u.toast('群通话正在进行中');
            }
            if (this.storeIsIncomingCallLoading || this.storeIsIncomingCallIng) {
                uni.hideLoading();
                return uni.$u.toast('通话正在进行中');
            }
            const hasPermission  = await this.reviewPermission();
            if (hasPermission) {
                try {
                    await this.getGroupMemberList();
                    const data = await this.sendCustomMessage(type);
                    console.log(data, '======sendCustomMessagesendCustomMessagesendCustomMessage');
                    if (typeof data === 'boolean' && !data) {
                        // uni.$u.toast('网络异常，请稍后重试');
                        uni.hideLoading();
                        return;
                    }
                    await this.onThrowCall({
                        ...data,
                        type
                    });
                    uni.hideLoading();
                    uni.navigateTo({url: `/pages/conversation/webrtc/index`});
                } catch (err) {
                    uni.$u.toast('网络异常，请稍后重试');
                    uni.hideLoading();
                    return;
                }
            }
            uni.hideLoading();
        },
        chooseOrShotImage (sourceType) {
            return new Promise((resolve, reject) => {
                const permissions = this.$store.dispatch('base/hasCameraPermissions');
                if (!permissions) return;
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
        // keyboardChangeHander (data) {
        //     const { height } = data;
        //     if (height > 0) {
        //         this.emojiBarVisible = false;
        //         this.actionBarVisible = false;
        //     }
        //     uni.$emit('keyboardChange', data);
        // },
        // setKeyboardListener () {
        //     uni.onKeyboardHeightChange(this.keyboardChangeHander);
        // },
        // disposeKeyboardListener () {
        //     uni.offKeyboardHeightChange(this.keyboardChangeHander);
        // },
        handleMessageListener (data) {
            const { message, type } = data;
            console.log('操作消息item', data);
            this.$refs.customEditor.editorCtx.insertText({text: getMessageContent(message)});
            this.activeMessage = message;
            this.activeMessageShow = true;
            this.activeMessageType = type;
        },
        updateRecordBar () {
            this.recordVisible = !this.recordVisible;
            this.emojiBarVisible = false;
            this.actionBarVisible = false;
        },
        async handleRecorderStart () {
            const {start} = recordVoiceManager();
            start();
            this.isRecordStart = true;
            await this.$nextTick();
            this.recordCancelBtnInfo = await getEl.call(this, ".chating_record_cancel");
            this.timer = setInterval(() => {
                this.sendTypingMessage('正在说话中...');
            }, 1000);
        },
        handleRecordMove (e) {
            const { left, right, top, bottom } = this.recordCancelBtnInfo;
            const {pageX, pageY} = e.touches[0];
            this.isRecordCancel = pageX >= left && pageX <= right && pageY >= top && pageY <= bottom;
        },
        async handleRecorderEnd () {
            clearInterval(this.timer);
            const {getPath, stop} = recordVoiceManager();
            if (this.isRecordCancel) {
                stop();
            } else {
                const res = await getPath();
                if (res.duration >= 2) {
                    this.batchCreateSoundMesage({
                        path: res.path,
                        duration: res.duration
                    });
                } else {
                    uni.$u.toast("语音时长不小于2s");
                }
            }
            this.isRecordStart = false;
            this.isRecordCancel = false;
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
                background-color: $uni-bg-color-grey;
                height: 90rpx;
                line-height: 90rpx;
                text-align: center;
                &:active {
                    box-shadow: inset 0 2px 23px 0 rgba(10,16,23,.4);
                }
            }
        }
    }
}
</style>

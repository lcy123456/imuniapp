<template>
    <view class="message_content_wrap">
        <view class="message_content_container">
            <TextMessageRender
                v-if="showTextRender"
                :message="message"
                :is-success-message="isSuccessMessage"
                :is-sender="isSender"
            />
            <MediaMessageRender
                v-if="showMediaRender"
                :message="message"
                :is-success-message="isSuccessMessage"
                :is-sender="isSender"
            />
            <FileMessageRender
                v-if="showFileRender"
                :message="message"
                :is-success-message="isSuccessMessage"
                :is-sender="isSender"
            />
            <MergeMessageRender
                v-if="showMergeRender"
                :message="message"
                :is-success-message="isSuccessMessage"
                :is-sender="isSender"
            />
            <AudioVideoMessageRender
                v-if="showAudioVideoRender"
                :message="message"
                :is-multiple-msg="isMultipleMsg"
                :is-success-message="isSuccessMessage"
                :is-sender="isSender"
            />
            <VoiceMessageRender
                v-if="showVoiceMessageRender"
                :message="message"
                :is-sender="isSender"
            />
            <ErrorMessageRender
                v-if="showErrorRender"
                :message="message"
                :is-success-message="isSuccessMessage"
                :is-sender="isSender"
            />
            <MessageReadState
                v-if="showMediaRender || showFileRender || showMergeRender"
                class="read-state"
                :is-sender="isSender"
                :message="message"
            />
            <ChatQuote
                v-if="getQuoteElem && getQuoteElem.quoteMessage"
                :message="getQuoteElem.quoteMessage"
                show-detail
                @click.native="setPositionMsgID(getQuoteElem.quoteMessage)"
            />
        </view>
    </view>
</template>

<script>
import { MessageType } from 'openim-uniapp-polyfill';
import TextMessageRender from './TextMessageRender.vue';
import AudioVideoMessageRender from './AudioVideoMessageRender.vue';
import MediaMessageRender from './MediaMessageRender.vue';
import FileMessageRender from './FileMessageRender.vue';
import MergeMessageRender from './MergeMessageRender.vue';
import VoiceMessageRender from './VoiceMessageRender.vue';
import ErrorMessageRender from './ErrorMessageRender.vue';
import MessageReadState from './MessageReadState.vue';
import ChatQuote from '@/components/ChatQuote';
import {
    TextRenderTypes,
    MediaRenderTypes,
    FileRenderTypes,
    MergeRenderTypes,
    AudioVideoRenderTypes
} from '@/constant';
import { AudioVideoType } from '@/enum';

export default {
    components: {
        MessageReadState,
        TextMessageRender,
        AudioVideoMessageRender,
        MediaMessageRender,
        FileMessageRender,
        MergeMessageRender,
        VoiceMessageRender,
        ErrorMessageRender,
        ChatQuote
    },

    props: {
        isMultipleMsg: {
            type: Boolean,
            default: false
        },
        message: {
            type: Object,
            default: () => ({})
        },
        isSender: {
            type: Boolean,
            default: false
        },
        isSuccessMessage: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            MessageType: Object.freeze(MessageType)
        };
    },
    computed: {
        showAudioVideoRender() {
            let data = {};
            try {
                const customElemData = this.message.customElem.data;
                data = JSON.parse(customElemData);
            } catch (err) {
                // console.log('err---err', this.message);
                return false;
            }
            return (
                AudioVideoRenderTypes.includes(this.message.contentType) &&
                data.type &&
                [AudioVideoType.Video, AudioVideoType.Audio].includes(data.type)
            );
        },
        showErrorRender() {
            return (
                !this.showTextRender &&
                !this.showMediaRender &&
                !this.showFileRender &&
                !this.showMergeRender &&
                !this.showAudioVideoRender &&
                !this.showVoiceMessageRender
            );
        },
        showVoiceMessageRender() {
            return this.message.contentType === MessageType.VoiceMessage;
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
        showMergeRender() {
            return MergeRenderTypes.includes(this.message.contentType);
        },
        getQuoteElem() {
            if (this.message.contentType === MessageType.QuoteMessage) {
                return this.message.quoteElem;
            }
            if (this.message.contentType === MessageType.AtTextMessage) {
                return this.message.atTextElem;
            }
            return false;
        }
    },

    mounted() {},

    methods: {
        setPositionMsgID(message) {
            uni.$emit('setPositionMsgID', message.clientMsgID);
        }
    }
};
</script>

<style lang="scss" scoped>
.message_content_wrap {
    max-width: 100%;
    .message_content_container {
        // @include vCenterBox();
        // @include ellipsisWithLine(10);
        color: $uni-text-color;
        width: fit-content;
        max-width: 100%;
        border-radius: 16rpx;
        overflow: hidden;
        position: relative;
    }
    .read-state {
        position: absolute;
        right: 20rpx;
        bottom: 10rpx;
    }
    .bg_container {
        box-sizing: border-box;
        padding: 20rpx;
        border-radius: 16rpx;
        background-color: $uni-bg-color;
    }
}
</style>

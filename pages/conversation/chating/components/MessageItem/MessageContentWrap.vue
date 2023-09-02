<template>
    <view class="message_content_wrap">
        <TextMessageRender
            v-if="showTextRender"
            :message="message"
        />
        <MediaMessageRender
            v-else-if="showMediaRender"
            :message="message"
        />
        <FileMessageRender
            v-else-if="showFileRender"
            :message="message"
        />
        <ErrorMessageRender v-else />
    </view>
</template>

<script>
import { MessageType } from 'openim-uniapp-polyfill';
import TextMessageRender from './TextMessageRender.vue';
import MediaMessageRender from './MediaMessageRender.vue';
import FileMessageRender from './FileMessageRender.vue';
import ErrorMessageRender from './ErrorMessageRender.vue';

const textRenderTypes = [
    MessageType.TextMessage,
    MessageType.AtTextMessage,
    MessageType.QuoteMessage,
];

const mediaRenderTypes = [MessageType.VideoMessage, MessageType.PictureMessage];
const FileRenderTypes = [MessageType.FileMessage];

export default {
    components: {
        TextMessageRender,
        MediaMessageRender,
        FileMessageRender,
        ErrorMessageRender,
    },

    props: {
        message: {
            type: Object,
            default: () => ({})
        }
    },

    data () {
        return {
            
        };
    },
    computed: {
        showTextRender () {
            return textRenderTypes.includes(this.message.contentType);
        },
        showMediaRender () {
            return mediaRenderTypes.includes(this.message.contentType);
        },
        showFileRender () {
            return FileRenderTypes.includes(this.message.contentType);
        },
    },

    mounted () {
        
    },

    methods: {
        
    },
};
</script>

<style lang="scss" scoped>
.message_content_wrap {
    @include vCenterBox();
    @include ellipsisWithLine(10);
    color: $uni-text-color;
    width: fit-content;
    max-width: 100%;

    .bg_container {
        padding: 20rpx;
        border-radius: 16rpx;
        background-color: $uni-bg-color;
    }
}
</style>
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
        <MergeMessageRender
            v-else-if="showMergeRender"
            :message="message"
        />
        <ErrorMessageRender v-else />
        <ChatQuote
            v-if="getQuoteElem && getQuoteElem.quoteMessage"
            :message="getQuoteElem.quoteMessage"
            show-detail
        />
    </view>
</template>

<script>
import { MessageType } from 'openim-uniapp-polyfill';
import TextMessageRender from './TextMessageRender.vue';
import MediaMessageRender from './MediaMessageRender.vue';
import FileMessageRender from './FileMessageRender.vue';
import MergeMessageRender from './MergeMessageRender.vue';
import ErrorMessageRender from './ErrorMessageRender.vue';
import ChatQuote from '@/components/ChatQuote';
import { 
    TextRenderTypes,
    MediaRenderTypes,
    FileRenderTypes,
    MergeRenderTypes
} from '@/constant';


export default {
    components: {
        TextMessageRender,
        MediaMessageRender,
        FileMessageRender,
        MergeMessageRender,
        ErrorMessageRender,
        ChatQuote,
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
            return TextRenderTypes.includes(this.message.contentType);
        },
        showMediaRender () {
            return MediaRenderTypes.includes(this.message.contentType);
        },
        showFileRender () {
            return FileRenderTypes.includes(this.message.contentType);
        },
        showMergeRender () {
            return MergeRenderTypes.includes(this.message.contentType);
        },
        getQuoteElem () {
            if (this.message.contentType === MessageType.QuoteMessage) {
                return this.message.quoteElem;
            }
            return false;
        }
    },

    mounted () {
        
    },

    methods: {
        
    },
};
</script>

<style lang="scss" scoped>
.message_content_wrap {
    // @include vCenterBox();
    // @include ellipsisWithLine(10);
    color: $uni-text-color;
    width: fit-content;
    max-width: 100%;
    border-radius: 16rpx;
    overflow: hidden;

    .bg_container {
        padding: 20rpx;
        border-radius: 16rpx;
        background-color: $uni-bg-color;
    }
}
</style>
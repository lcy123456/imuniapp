<template>
    <view
        :class="[
            'text_message_container',
            'bg_container',
            'text_message_container_' + message.clientMsgID
        ]"
        :message="message"
        :change:message="getMessage"
        :text="text"
        :change:text="getText"
    >
        <!-- <mp-html
            :selectable="true"
            :preview-img="false"
            :show-img-menu="false"
            :lazy-load="false"
            :content="getContent"
        /> -->
        <view v-html="getContent" />
        <MessageReadState
            v-if="isShowTime"
            :id="`MessageReadState-${message.clientMsgID}`"
            class="read-content"
            :message="message"
            :is-sender="isSender"
            @getReadWidth="getReadWidth"
        />
    </view>
</template>

<script>
import { parseAt, parseEmoji, parseLink } from '@/util/imCommon';
import { MessageType } from 'openim-uniapp-polyfill';
import { DecryptoAES } from '@/util/crypto';
import MessageReadState from './MessageReadState.vue';
import { SessionType } from 'openim-uniapp-polyfill';

export default {
    name: 'TextMessageRender',
    components: {
        MessageReadState
    },
    props: {
        message: {
            type: Object,
            default: () => ({})
        },
        showNickname: {
            type: Boolean,
            default: false
        },
        isSender: {
            type: Boolean,
            default: false
        },
        isSuccessMessage: {
            type: Boolean,
            default: false
        },
        isShowTime: {
            type: Boolean,
            default: true
        },
        isQuote: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            readWidth: 0
        };
    },
    computed: {
        clientMsgID() {
            return this.message.clientMsgID;
        },
        isEdit() {
            try {
                const ex = JSON.parse(this.message.ex);
                return ex.type === 'edit';
            } catch (err) {
                return false;
            }
        },
        isGroupRead() {
            try {
                return (
                    this.message.sessionType !== SessionType.Single &&
                    this.message.attachedInfoElem.groupHasReadInfo.hasReadCount
                );
            } catch (err) {
                return false;
            }
        },
        text() {
            const { contentType, quoteElem, atTextElem, textElem } =
                this.message;
            let text = '';
            // TODO：解密文本
            if (contentType === MessageType.QuoteMessage) {
                text = parseLink(parseEmoji(DecryptoAES(quoteElem?.text)));
            } else if (contentType === MessageType.AtTextMessage) {
                text = parseLink(parseEmoji(parseAt(atTextElem)));
            } else {
                text = parseLink(parseEmoji(DecryptoAES(textElem?.content)));
            }
            text = text.replace(/\n/g, '<br>');
            return text;
        },
        getContent() {
            const { senderNickname } = this.message;
            const baseText = !this.isQuote
                ? `
            <view class="base-box hide-css" style="width: ${this.readWidth}px"></view>
            `
                : ``;
            let text = this.text;
            if (this.showNickname) {
                text = senderNickname + '：' + text;
            }
            return `${text}${baseText}`;
        }
    },
    created() {},
    mounted() {
        this.getReadWidth();
    },
    methods: {
        getReadWidth() {
            uni.createSelectorQuery()
                .in(this)
                .select('.read-state-css')
                .boundingClientRect(res => {
                    if (res) {
                        this.readWidth = res.width;
                    }
                })
                .exec();
        }
    }
};
</script>

<style lang="scss" scoped>
/deep/.hide-css {
    visibility: hidden;
}
.text_message_container {
    overflow: hidden;
    word-break: break-all;
    display: flex;
    align-items: flex-end;
    user-select: none;
    -webkit-user-select: none;
    position: relative;
}
/deep/.read-content {
    position: absolute;
    right: 20rpx;
    bottom: 20rpx;
}

/deep/.base-box {
    width: max-content;
    display: inline-flex;
    align-items: center;
    .read_state {
        // font-size: 26rpx;
        font-size: 12px;
        color: #43d100 !important;
        margin-left: 20rpx;
        min-width: 50rpx;
        &.notisSender {
            color: #ccc !important;
        }
        &.isPin {
            margin-left: 0;
        }
    }
    .text {
        width: max-content;
        font-size: 12px;
        color: #43d100 !important;
    }
    .read {
        width: 26rpx;
        height: 18rpx;
        margin: 0 10rpx;
        width: 30rpx;
    }
    .pined {
        width: 27rpx;
        height: 27rpx;
        margin: 0 5px;
        margin-left: 20rpx;
    }
}
</style>

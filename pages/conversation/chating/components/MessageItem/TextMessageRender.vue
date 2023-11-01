<template>
    <view class="text_message_container bg_container">
        <mp-html
            :selectable="true"
            :preview-img="false"
            :show-img-menu="false"
            :lazy-load="false"
            :content="getContent"
        />
        <MessageReadState
            :message="message"
            :is-sender="isSender"
        />
    </view>
</template>

<script>
import { parseAt, parseEmoji } from "@/util/imCommon";
import { MessageType } from "openim-uniapp-polyfill";
import { DecryptoAES } from '@/util/crypto';
import MessageReadState from './MessageReadState.vue';

export default {
    name: "TextMessageRender",
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
        }
    },
    data () {
        return {};
    },
    computed: {
        getContent () {
            let text = '';
            const { contentType, quoteElem, atTextElem, textElem, senderNickname } = this.message;
            // TODO：解密文本
            if (contentType === MessageType.QuoteMessage) {
                text = parseEmoji(DecryptoAES(quoteElem?.text));
            } else if (contentType === MessageType.AtTextMessage) {
                text = parseEmoji(parseAt(atTextElem));
            } else {
                text = parseEmoji(DecryptoAES(textElem?.content));
            }
            if (contentType === MessageType.TextMessage) {
                // text = text.replace(/\n/g, '<br>');
            }
            if (this.showNickname) {
                text = senderNickname + '：' + text;
            }
            return text;
        },
    },
    methods: {
    
    },
};
</script>

<style lang="scss" scoped>
.text_message_container {
    word-break: break-all;
    display: flex;
    align-items: flex-end;
    user-select: none;
    -webkit-user-select: none;
}
</style>

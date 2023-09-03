<template>
    <view class="text_message_container bg_container">
        <mp-html
            :preview-img="false"
            :show-img-menu="false"
            :lazy-load="false"
            :content="getContent"
        />
    </view>
</template>

<script>
import { parseAt, parseEmoji } from "@/util/imCommon";
import { MessageType } from "openim-uniapp-polyfill";
import { DecryptoAES } from '@/util/crypto';

export default {
    name: "TextMessageRender",
    components: {
    },
    props: {
        message: {
            type: Object,
            default: () => ({})
        },
        showNickname: {
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

<style lang="scss" scoped></style>

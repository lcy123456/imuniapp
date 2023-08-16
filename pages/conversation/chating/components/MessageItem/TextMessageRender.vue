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
    components: {},
    props: {
        message: Object,
    },
    data () {
        return {};
    },
    computed: {
        getContent () {
            // TODO：解密文本
            // console.log('getContent', this.message.textElem)
            if (this.message.contentType === MessageType.QuoteMessage) {
                return parseEmoji(this.message.quoteElem.text);
            }
            if (this.message.contentType === MessageType.AtTextMessage) {
                return parseEmoji(parseAt(this.message.atTextElem));
            }

            return parseEmoji(DecryptoAES(this.message.textElem?.content));
        },
    },
    methods: {
    
    },
};
</script>

<style lang="scss" scoped></style>

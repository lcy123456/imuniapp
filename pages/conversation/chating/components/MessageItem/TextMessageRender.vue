<template>
  <view class="text_message_container bg_container">
    <mp-html
      :previewImg="false"
      :showImgMenu="false"
      :lazyLoad="false"
      :content="getContent"
    />
  </view>
</template>

<script>
import { parseAt, parseEmoji } from "@/util/imCommon";
import { MessageType } from "openim-uniapp-polyfill";

export default {
  name: "TextMessageRender",
  components: {},
  props: {
    message: Object,
  },
  computed: {
    getContent() {
      // TODO：解密文本
      // console.log('getContent', this.message.textElem)
      if (this.message.contentType === MessageType.QuoteMessage) {
        return parseEmoji(this.message.quoteElem.text);
      }
      if (this.message.contentType === MessageType.AtTextMessage) {
        return parseEmoji(parseAt(this.message.atTextElem));
      }

      return parseEmoji(this.message.textElem?.content);
    },
  },
  data() {
    return {};
  },
  methods: {
    
  },
};
</script>

<style lang="scss" scoped></style>

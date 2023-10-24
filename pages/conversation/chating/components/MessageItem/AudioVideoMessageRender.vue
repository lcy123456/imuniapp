<template>
    <view
        class="audio_video_message_container bg_container"
        @click="goWebrtc"
    >
        <view class="main">
            <text>{{ getContent }}</text>
            <image
                v-if="isVideo"
                class="video-icon"
                src="/static/images/video.png"
            />
            <image
                v-else
                class="phone-icon"
                src="/static/images/phone.png"
            />
        </view>
        <MessageReadState
            :message="message"
            :is-sender="isSender"
        />
    </view>
</template>

<script>
// import { parseAt, parseEmoji } from "@/util/imCommon";
// import { MessageType } from "openim-uniapp-polyfill";
// import { DecryptoAES } from '@/util/crypto';
import { AudioVideoStatus, AudioVideoType } from '@/enum';
import MessageReadState from './MessageReadState.vue';

export default {
    name: "AudioVideoMessageRender",
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
            const { contentType, customElem, senderNickname } = this.message;
            
            if (contentType === AudioVideoStatus.Reject) {
                text = `[已拒绝]`;
            } else if (contentType === AudioVideoStatus.Cancel) {
                text = `[已取消]`;
            } else if (contentType === AudioVideoStatus.NotAnswered) {
                text = `[未应答]`;
            } else if (contentType === AudioVideoStatus.Busy) {
                text = `[忙线中]`;
            } else if (contentType === AudioVideoStatus.Done) {
                text = `[通话时间长]`;
            } else {
                text = `[测试通话]`;
            }
            return text;
        },
        isVideo () {
            const { data } = this.message.customElem;
            const res = JSON.parse(data); 
            return res.type === AudioVideoType.Video;
        }
    },
    methods: {
        goWebrtc () {
            uni.$emit('goWebrtc', this.isVideo ? 'video' : 'audio');
        }
    },
};
</script>

<style lang="scss" scoped>
.audio_video_message_container {
    word-break: break-all;
    display: flex;
    align-items: end;
    .main {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .phone-icon {
        width: 45rpx;
        height: 19rpx;
        margin-left: 10rpx;
    }
    .video-icon {
        width: 44rpx;
        height: 30rpx;
        margin-left: 10rpx;
    }
}
</style>

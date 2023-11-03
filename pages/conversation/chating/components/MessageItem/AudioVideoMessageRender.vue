<template>
    <view
        class="audio_video_message_container bg_container"
        @click="initWebrtc"
    >
        <view class="main">
            <text
                v-if="isSender"
            >
                {{ getContent }}
            </text>
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
            <text
                v-if="!isSender"
            >
                {{ getContent }}
            </text>
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
            const { data } = this.message.customElem;
            const res = JSON.parse(data); 
            switch (res.status) {
            case AudioVideoStatus.Reject:
                return this.isSender ? `[对方已拒绝]` : `[已拒绝]`;
            case AudioVideoStatus.Cancel:
                return `[已取消]`;
            case AudioVideoStatus.NotAnswered:
                return this.isSender ? `[对方未应答]` : `[未应答]`;
            case AudioVideoStatus.Busy:
                return this.isSender ? `[对方忙线中]` : `[忙线中]`;
            case AudioVideoStatus.Done:
                const t = new Date(new Date().Format('yyyy/MM/dd') +  ' 00:00:00').getTime();
                let time = new Date(t + res.duration).Format(res.duration >= 1000 * 60 * 60 ? 'hh:mm:ss' : 'mm:ss');
                return `[通话时长]${time}`;
            default:
                return this.isVideo ? `[发起视频通话]` : `[发起语音通话]`;
            }
        },
        isVideo () {
            const { data } = this.message.customElem;
            const res = JSON.parse(data); 
            return res.type === AudioVideoType.Video;
        }
    },
    methods: {
        initWebrtc () {
            uni.$emit('initWebrtc', this.isVideo ? 'video' : 'audio');
        }
    },
};
</script>

<style lang="scss" scoped>
.audio_video_message_container {
    word-break: break-all;
    display: flex;
    align-items: flex-end;
    .main {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .phone-icon {
        width: 45rpx;
        height: 19rpx;
        margin: 0 10rpx;
    }
    .video-icon {
        width: 44rpx;
        height: 30rpx;
        margin: 0 10rpx;
    }
}
</style>

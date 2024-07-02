<template>
    <view class="voice_message_container" @click="handlePlay">
        <view v-if="isSender" class="voice-box" :style="{ width: voiceWidth }">
            <!-- <view>语音时长：{{ durationText }} s</view> -->
            <!-- <view>播放中：{{ playing }}</view> -->
            <text>{{ durationText }}''</text>
            <image
                v-if="!playing"
                class="w-48 h-48 isrotate"
                src="/static/images/audio_play_left.svg"
            />
            <image
                v-if="playing"
                class="w-48 h-48 isrotate"
                src="/static/images/voice.gif"
            />
        </view>
        <view
            v-if="!isSender"
            class="voice-box left"
            :style="{ width: voiceWidth }"
        >
            <image
                v-if="!playing"
                class="w-48 h-48"
                src="/static/images/audio_play_left.svg"
            />
            <image
                v-if="playing"
                class="w-48 h-48"
                src="/static/images/voice.gif"
            />
            <text>{{ durationText }}''</text>
        </view>
        <MessageReadState
            v-if="!onlyMessage"
            :class="['message-read', !isSender ? 'left' : '']"
            :message="message"
            :is-sender="isSender"
        />
    </view>
</template>

<script>
import { secFormat, formatFileUrl } from '@/util/imCommon';
import MessageReadState from './MessageReadState.vue';

let timer = null;

export default {
    name: 'VoiceMessageRender',
    components: {
        MessageReadState
    },
    props: {
        message: {
            type: Object,
            default: () => ({})
        },
        isSender: {
            type: Boolean,
            default: false
        },
        onlyMessage: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            playing: false,
            nextSrc: ''
        };
    },

    computed: {
        voiceWidth() {
            const w = 350 * (this.durationText / 60) + 50;
            return (w > 400 ? 400 : w) + 'px';
        },
        soundElem() {
            return this.message.soundElem || {};
        },
        sourceUrl() {
            return formatFileUrl(this.soundElem.sourceUrl);
        },
        durationText() {
            const second = this.soundElem.duration || 0;
            if (second > 60) {
                return secFormat(this.soundElem.duration || 0);
            } else {
                return second;
            }
        }
    },

    created() {
        uni.$on('play_audio', this.handlePlaying);
    },
    beforeDestroy() {
        uni.$off('play_audio', this.handlePlaying);
        if (this.playing) {
            uni.$emit('stop_audio', this.sourceUrl);
        }
    },

    methods: {
        secFormat,
        handlePlay() {
            clearTimeout(timer);
            uni.$emit('play_audio', this.sourceUrl);
        },
        handlePlaying(src) {
            if (!src) return;
            this.playing = false;
            if (this.nextSrc === src) {
                this.nextSrc = '';
                return;
            }
            this.nextSrc = src;
            if (src === this.sourceUrl) {
                this.playing = !this.playing;
                timer = setTimeout(
                    () => {
                        this.playing = false;
                        this.nextSrc = '';
                    },
                    (this.soundElem.duration + 1) * 1000
                );
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.isrotate {
    transform-style: preserve-3d;
    transform: rotateY(180deg);
    -ms-transform: rotateY(180deg);
    -moz-transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    -o-transform: rotateY(180deg);
}
.voice_message_container {
    .voice-box {
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: right;
        height: 80rpx;
        border-radius: 5px;
        padding: 20rpx;
        uni-image {
            width: 30rpx;
            height: 30rpx;
        }
        uni-text {
            margin: 0 5rpx;
        }
        &.left {
            justify-content: left;
        }
        &:active {
            box-shadow: inset 0 2px 13px 0 rgba(10, 16, 23, 0.1);
        }
    }
    .message-read {
        width: 100%;
        display: flex;
        justify-content: end;
        &.left {
            justify-content: left;
        }
    }
}
</style>

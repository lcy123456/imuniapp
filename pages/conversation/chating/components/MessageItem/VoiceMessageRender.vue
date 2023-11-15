<template>
    <div
        class="voice_message_container bg_container"
        @click="handlePlay"
    >
        <div>
            <div>语音时长：{{ durationText }} s</div>
            <div>播放中：{{ playing }}</div>
            <image
                class="w-48 h-48"
                src="/static/images/chating_footer_recording.png"
            />
        </div>
        <MessageReadState
            :message="message"
            :is-sender="isSender"
        />
    </div>
</template>

<script>
import { secFormat } from "@/util/imCommon";
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
    },

    data () {
        return {
            playing: false
        };
    },

    computed: {
        soundElem () {
            return this.message.soundElem || {};
        },
        durationText () {
            const second = this.soundElem.duration || 0;
            if (second > 60) {
                return secFormat(this.soundElem.duration || 0);
            } else {
                return second;
            }
        }
    },

    created () {
        uni.$on("play_audio", this.handlePlaying);
    },
    beforeDestroy () {
        uni.$off("play_audio", this.handlePlaying);
    },

    methods: {
        secFormat,
        handlePlay () {
            clearTimeout(timer);
            uni.$emit("play_audio", this.soundElem.sourceUrl);
        },
        handlePlaying (src) {
            this.playing = false;
            if (src === this.soundElem.sourceUrl) {
                this.playing = true;
                timer = setTimeout(() => {
                    this.playing = false;
                }, (this.soundElem.duration + 1) * 1000);
            }
        }
    },
};
</script>

<style lang="scss" scoped>

</style>
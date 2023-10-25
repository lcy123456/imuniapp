<template>
    <view
        v-if="shouldShow"
        :class="['top_dialog_container', 
                 shouldFadeIn && 'top_dialog_in',
                 shouldFadeOut && 'top_dialog_out']"
        @touchstart="onTouchstart($event)"
        @touchend="onTouchend($event)"
    >
        <view
            class="flex ml-40 align-center"
            @click="openPhone"
        >
            <MyAvatar
                :src="faceURL"
                :desc="nickname"
                size="80rpx"
            />
            <view class="flex ml-16 flex-column">
                <text class="fz-28 text-inverse ff-bold">
                    {{ nickname }}
                </text>
                <text class="fz-28 text-grey">
                    邀请你视频通话
                </text>
            </view>
        </view>
        <view class="call_icon_panel">
            <u-button
                class="danger_btn"
                @click="dangerClick"
            >
                <image
                    :src="incomingCallIcon"
                    class="call_icon"
                />
            </u-button>
            <u-button
                class="success_btn"
                @click="successClick"
            >
                <image
                    :src="incomingCallIcon"
                    class="call_icon"
                />
            </u-button>
        </view>
    </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import store from "@/store";
import MyAvatar from '@/components/MyAvatar/index.vue';
import incomingCallIcon from '@/static/images/incoming_call_icon.png';
let innerAudioContext = null;
export default {
    name: "TopDialog",
    components: {
        MyAvatar,
    },
    data () {
        return {
            incomingCallIcon,
            shouldFadeIn: false,
            shouldFadeOut: false,
            startPageY: 0,
        };
    },
    computed: {
        ...mapGetters([
            'storeIsIncomingCallTop',
            'storeIsCallOrAnswer',
            'storeIncomingCallUserInfo',
            'storeIncomingCallMessage'
        ]),
        shouldShow () {
            return this.storeIsIncomingCallTop;
        },
        faceURL () {
            const {faceURL} = this.storeIncomingCallUserInfo;
            return this.storeIsCallOrAnswer ? faceURL : '';
        },
        nickname () {
            const {nickname} = this.storeIncomingCallUserInfo;
            return this.storeIsCallOrAnswer ? nickname : '未知';
        },
    },
    created () {
        this.shouldFadeIn = !this.storeIsIncomingCallTop;
    },
    mounted () {
        // setTimeout(()=> {
        //     this.startMusic();
        // }, 2000);
    },
    methods: {
        ...mapActions('incomingCall', ['onSmall', 'onDangerCall', 'onSuccessCall']),

        // 手指落下时触发
        onTouchstart (event) {
            const [touches] = event.touches;
            const {pageY} = touches;
            this.startPageY = pageY;
        },
        // 手指抬起时
        onTouchend (event) {
            const [touches] = event.changedTouches;
            const {pageY} = touches;
            const moveY = this.startPageY - pageY;
            if (moveY > 45) {
                this.visibleHandle();
                setTimeout(()=> {
                    this.onSmall();
                }, 400);
            }
        },
        // 唤起铃声
        startMusic () {
            if (!this.storeIsIncomingCallTop) return;
            // 避免重复唤起铃声
            if (innerAudioContext != null) return;

            innerAudioContext = uni.createInnerAudioContext();
            innerAudioContext.autoplay = true;
            innerAudioContext.loop = true;
            innerAudioContext.src = '/static/audio/incoming_call_music.mp3';
        },
        // 销毁铃声
        stopMusic () {
            if (innerAudioContext == null) return;
            innerAudioContext.stop();
            innerAudioContext.destroy();
        },
        visibleHandle () {
            this.shouldFadeOut = true;

            // 动画0.4s 等待css动画结束
            setTimeout(()=> {
                store.commit('incomingCall/SET_INCOMING_CALL_TOP', false);
            }, 400);

            this.stopMusic();
        },
        openPhone () {
            this.visibleHandle();
            uni.navigateTo({
                url: '/pages/conversation/webrtc/index',
            });
        },
        async dangerClick () {
            this.visibleHandle();
            setTimeout(()=> {
                this.onDangerCall();
            }, 400);
        },
        async successClick () {
            this.visibleHandle();
            await this.onSuccessCall();
            uni.navigateTo({
                url: '/pages/conversation/webrtc/index',
            });
        },
    }
};
</script>

<style lang="scss" scoped>
.top_dialog_container {
  position: fixed;
  top: 5vh;
  left: 0;
  right: 0;
  width: 94%;
  padding: 70rpx 0;
  margin: 0 auto;
  border-radius: 20rpx;
  background-image: linear-gradient(to right, #484C58, #3F3939);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 999;
}
.top_dialog_in {
  animation: fadeIn 0.4s .1s ease both;
}
.top_dialog_out {
  animation: fadeOut 0.4s .1s ease both;
}
.call_icon_panel {
  display: flex;
  align-items: center;
  /deep/ .u-button {
    border-radius: 100%;
    width: 80rpx;
    height: 80rpx;
    border: none;
  }
  .danger_btn{
    background-color: #F45955;
    margin-right: 40rpx;
    .call_icon {
      transform: rotate(135deg);
    }
  }
  .success_btn {
    background-color: #58BE6B;
    margin-right: 50rpx;
  }
  .call_icon {
    width: 24rpx;
    height: 24rpx;
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-100rpx)
  }
  100% {
    opacity: 1;
    transform: translateY(0)
  }
}
@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: translateY(0)
  }
  100% {
    opacity: 0;
    transform: translateY(-100rpx)
  }
}
</style>
<template>
    <view
        v-if="shouldShow"
        :class="['top_dialog_container',
                 shouldFadeIn && 'top_dialog_in',
                 shouldFadeOut && 'top_dialog_out']"
        @touchstart="onTouchstart($event)"
        @touchend="onTouchend($event)"
    >
        <view class="flex ml-40 align-center">
            <MyAvatar
                :src="faceURL"
                :desc="nickname"
                :is-group="isGroupMessage"
                size="80rpx"
            />
            <view class="flex ml-16 flex-column">
                <text class="fz-28 text-inverse ff-bold">
                    {{ nickname }}
                </text>
                <template v-if="isGroupMessage">
                    <text class="fz-28 text-grey">
                        邀请你加入群聊
                    </text>
                </template>
                <template v-else>
                    <text class="fz-28 text-grey">
                        邀请你{{ isVideo ? '视频通话' : '语音通话' }}
                    </text>
                </template>
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
import { AudioVideoType } from '@/enum';
import { videoSingleChatRefused } from '@/api/incoming';
import { idsGetConversationID } from '@/util/imCommon';
import {
    PageEvents
} from '@/constant';
export default {
    name: "TopDialog",
    components: {
        MyAvatar,
    },
    data () {
        return {
            incomingCallIcon,
            shouldShow: false,
            shouldFadeIn: false,
            shouldFadeOut: false,
            startPageY: 0,
        };
    },
    computed: {
        ...mapGetters([
            'storeIsIncomingCallTop',
            'storeIncomingCallUserInfo',
            'storeIncomingCallMessage',
            'storeIsIncomingConversation'
        ]),
        faceURL () {
            const {faceURL} = this.storeIncomingCallUserInfo;
            return faceURL;
        },
        nickname () {
            const {nickname} = this.storeIncomingCallUserInfo;
            return nickname;
        },
        isVideo () {
            const { data } = this.storeIncomingCallMessage.customElem;
            const res = JSON.parse(data); 
            return res.type === AudioVideoType.Video;
        },
        isGroupMessage () {
            return this.storeIncomingCallMessage.sessionType === 3;
        }
    },
    watch: {
        storeIsIncomingCallTop: {
            handler (val) {
                if (val) {
                    this.shouldShow = true;
                    this.shouldFadeOut = false;
                    this.shouldFadeIn = true;
                } else {
                    setTimeout(()=> {
                        this.shouldShow = false;
                    }, 400);
                    this.shouldFadeOut = true;
                    this.shouldFadeIn = false;
                }
            }
        }
    },
    mounted () {
        if (this.storeIsIncomingCallTop) {
            this.shouldShow = true;
            this.shouldFadeOut = false;
            this.shouldFadeIn = false;
        }
    },
    methods: {
        ...mapActions('incomingCall', ['onSmall', 'onDangerCall', 'onSuccessCall', 'onThrowCall']),
        ...mapActions('message', ['pushNewMessage', 'updateOneMessage']),
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
        visibleHandle () {
            this.shouldFadeOut = true;

            // 动画0.4s 等待css动画结束
            setTimeout(()=> {
                store.commit('incomingCall/SET_INCOMING_CALL_TOP', false);
            }, 400);
        },
        openPhone () {
            this.visibleHandle();
            uni.navigateTo({
                url: '/pages/conversation/webrtc/index',
            });
        },
        async dangerClick () {
            this.visibleHandle();
            this.onDangerCall();
            const { sendID, sessionType } = this.storeIncomingCallMessage;
            if (sessionType === 3) return;
            videoSingleChatRefused({
                sendID,
                conversationID: idsGetConversationID(this.storeIncomingCallMessage)
            });
            uni.$emit(PageEvents.ScrollToBottom);
        },
        async successClick () {
            this.visibleHandle();
            await this.onSuccessCall();
            await this.goWebrtc();
        },
        async goWebrtc () {
            const hasPermission  = await this.$store.dispatch('incomingCall/reviewPermission');
            const type = this.isVideo ? 'video' : 'audio';
            if (hasPermission) {
                this.$store.commit('incomingCall/SET_IS_INCOMING_CALL_MESSAGE', {
                    ...this.storeIncomingCallMessage,
                    type
                });
                uni.navigateTo({url: `/pages/conversation/webrtc/index`});
            }
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
  height: 210rpx;
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
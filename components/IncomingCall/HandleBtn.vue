<template>
    <!--  麦克风/扬声器/摄像头按钮组件  -->
    <view>
        <view
            v-if="shouldVideoBtnFine"
            class="handle_btn"
        >
            <view class="cell">
                <image
                    :src="micImage"
                    class="handle_icon"
                    @click="handleSwitch('isActiveMic')"
                />
                <text class="fz-28 text-inverse mt-20">
                    {{ micText }}
                </text>
            </view>
            <view class="cell">
                <image
                    :src="speakImage"
                    class="handle_icon"
                    @click="handleSwitch('isActiveSpeak')"
                />
                <text class="fz-28 text-inverse mt-20">
                    {{ speakText }}
                </text>
            </view>
            <view class="cell">
                <image
                    :src="camImage"
                    class="handle_icon"
                    @click="handleSwitch('isActiveCam')"
                />
                <text class="fz-28 text-inverse mt-20">
                    {{ camText }}
                </text>
            </view>
        </view>
        <view
            v-else-if="shouldVideoBtnGrey"
            class="handle_btn"
        >
            <view class="cell">
                <image
                    :src="overturnImage"
                    class="handle_icon"
                    @click="handleSwitch('isActiveOverturn')"
                />
                <text class="fz-28 text-inverse mt-20">
                    {{ overturnText }}
                </text>
            </view>
            <view class="cell">
                <image
                    :src="camImage"
                    class="handle_icon"
                    @click="handleSwitch('isActiveCam')"
                />
                <text class="fz-28 text-inverse mt-20">
                    {{ camText }}
                </text>
            </view>
        </view>
    </view>
</template>

<script>
import incomingCallHandleMic1 from '@/static/images/incoming_call_handle_mic_1.png';
import incomingCallHandleMic2 from '@/static/images/incoming_call_handle_mic_2.png';
import incomingCallHandleSpeak1 from '@/static/images/incoming_call_handle_speak_1.png';
import incomingCallHandleSpeak2 from '@/static/images/incoming_call_handle_speak_2.png';
import incomingCallHandleCam1 from '@/static/images/incoming_call_handle_cam_1.png';
import incomingCallHandleCam2 from '@/static/images/incoming_call_handle_cam_2.png';
import incomingCallHandleOverturn1 from '@/static/images/incoming_call_handle_overturn_1.png';
import incomingCallHandleOverturn2 from '@/static/images/incoming_call_handle_overturn_2.png';
import store from "@/store";
import { mapGetters } from 'vuex';
export default {
    name: "HandleBtn",
    data () {
        return {
        };
    },
    computed: {
        ...mapGetters(['storeIncomingCallThrow', 'storeIncomingCallCatch', 'storeIsVideoCall', 'storeHandleAttr', 'storeIsIncomingCallIng']),
        
        micImage () {
            const {isActiveMic} = this.storeHandleAttr;
            return isActiveMic ? incomingCallHandleMic1 : incomingCallHandleMic2;
        },
        micText () {
            const {isActiveMic} = this.storeHandleAttr;
            return isActiveMic ? '麦克风打开' : '麦克风关闭';
        },
        speakImage () {
            const {isActiveSpeak} = this.storeHandleAttr;
            return isActiveSpeak ? incomingCallHandleSpeak1 : incomingCallHandleSpeak2;
        },
        speakText () {
            const {isActiveSpeak} = this.storeHandleAttr;
            return isActiveSpeak ? '扬声器打开' : '扬声器关闭';
        },
        camImage () {
            const {isActiveCam} = this.storeHandleAttr;
            return isActiveCam ? incomingCallHandleCam1 : incomingCallHandleCam2;
        },
        camText () {
            const {isActiveCam} = this.storeHandleAttr;
            return isActiveCam ? '摄像头打开' : '摄像头关闭';
        },
        overturnImage () {
            return incomingCallHandleOverturn1;
        },
        overturnText () {
            return '翻转';
        },
      
        // 视频通话 && 通话中
        shouldVideoBtnFine () {
            return this.storeIsVideoCall && this.storeIsIncomingCallIng;
        },
        // 视频通话
        shouldVideoBtnGrey () {
            return this.storeIsVideoCall;
        }
    },
    methods: {
        handleSwitch (key) {
            this.$store.dispatch('incomingCall/onHandleAttr', key);
        }
    }
};
</script>

<style lang="scss" scoped>
.handle_btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .cell{
     display: flex;
     align-items: center;
     flex-direction: column;
  }
  .handle_icon {
    width: 140rpx;
    height: 140rpx;
  }
}
</style>
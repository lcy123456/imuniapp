<template>
    <!--  麦克风/扬声器/摄像头按钮组件  -->
    <view
        v-show="shouldShow"
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
        <!--        <view class="cell">
            <image
                :src="camImage"
                class="handle_icon"
                @click="handleSwitch('isActiveCam')"
            />
            <text class="fz-28 text-inverse mt-20">
                {{ camText }}
            </text>
        </view>-->
    </view>
</template>

<script>
import incomingCallHandleMic1 from '@/static/images/incoming_call_handle_mic_1.png';
import incomingCallHandleMic2 from '@/static/images/incoming_call_handle_mic_2.png';
import incomingCallHandleSpeak1 from '@/static/images/incoming_call_handle_speak_1.png';
import incomingCallHandleSpeak2 from '@/static/images/incoming_call_handle_speak_2.png';
import incomingCallHandleCam1 from '@/static/images/incoming_call_handle_cam_1.png';
import incomingCallHandleCam2 from '@/static/images/incoming_call_handle_cam_2.png';
import store from "@/store";
import { mapGetters } from 'vuex';
export default {
    name: "HandleBtn",
    data () {
        return {
            isActiveMic: true,
            isActiveSpeak: true,
            isActiveCam: true,
        };
    },
    computed: {
        ...mapGetters(['storeIncomingCallThrow', 'storeIsIncomingCallIng']),
      
        micImage () {
            return this.isActiveMic ? incomingCallHandleMic1 : incomingCallHandleMic2;
        },
        micText () {
            return this.isActiveMic ? '麦克风打开' : '麦克风关闭';
        },
        speakImage () {
            return this.isActiveSpeak ? incomingCallHandleSpeak1 : incomingCallHandleSpeak2;
        },
        speakText () {
            return this.isActiveSpeak ? '扬声器打开' : '扬声器关闭';
        },
        camImage () {
            return this.isActiveCam ? incomingCallHandleCam1 : incomingCallHandleCam2;
        },
        camText () {
            return this.isActiveCam ? '摄像头打开' : '摄像头关闭';
        },
      
        // 主动拨打电话 || 通话中
        shouldShow () {
            return this.storeIncomingCallThrow || this.storeIsIncomingCallIng;
        }
    },
    watch: {
        isActiveMic: {
            handler (val) {
                if (val) plus.device.setVolume(0.6); // 开启声音，0 - 1
                else  plus.device.setVolume(0);  // 静音
                // plus.device.getVolume() // 获取当前音量
            },
            immediate: true
        },
    },
    methods: {
        handleSwitch (key) {
            this[key] = !this[key];
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
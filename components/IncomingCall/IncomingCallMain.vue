<template>
    <view
        v-if="shouldShow"
        :class="['incoming_call_main animate__animated',
                 animateFadeIn && 'animate__fadeIn',
                 animateFadeOut && 'animate__fadeOut'
        ]"
        :style="style"
    >
        <image
            class="page_back"
            :src="incomingCallMainBack"
        />
        <view class="z_index_999">
            <view class="header_panel">
                <image
                    class="right_icon"
                    :src="incomingCallMainReduce"
                    @click="onSmaller"
                />
                <template v-if="storeIsIncomingCallIng">
                    <text class="fz-32 text-inverse">
                        {{ timeText }}
                    </text>
                </template>
            </view>

            <view class="avatar_panel">
                <MyAvatar
                    :src="faceURL"
                    :desc="nickname"
                    size="184rpx"
                />
                <text class="fz-42 text-inverse mt-30">
                    {{ nickname }}
                </text>
                <text class="fz-36 text-inverse mt-180">
                    邀请你视频通话
                </text>
            </view>

            <view class="btn_panel">
                <u-button
                    class="danger_btn"
                    @click="dangerClick"
                >
                    <image
                        :src="incomingCallIcon"
                        class="call_icon"
                    />
                </u-button>
                <template v-if="!storeIsIncomingCallIng">
                    <u-button
                        class="success_btn"
                        @click="successClick"
                    >
                        <image
                            :src="incomingCallIcon"
                            class="call_icon"
                        />
                    </u-button>
                </template>
            </view>
        </view>
    </view>
</template>

<script>
import incomingCallMainBack from '@/static/images/incoming_call_main_back.png';
import incomingCallMainReduce from '@/static/images/incoming_call_main_reduce.png';
import incomingCallIcon from '@/static/images/incoming_call_icon.png';
import MyAvatar from '@/components/MyAvatar/index.vue';
import store from "@/store";
import { mapGetters } from 'vuex';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
export default {
    name: "IncomingCallMain",
    components: {
        MyAvatar,
    },
    props: {
    //
    // 需要改用为vuex传递
    //
        faceURL: String,
        nickname: {
            type: String,
            default: '未知'
        }
    },
    data () {
        return {
            incomingCallMainBack,
            incomingCallMainReduce,
            incomingCallIcon,
            timeStart: 0,
            timeText: '00:00',
            animateFadeIn: false,
            animateFadeOut: false,
            style: {},
        };
    },
    watch: {
        shouldShow (val) {
            if (val) {
                this.animateFadeIn = true;
            }
        },
        storeIsIncomingCallIng (val) {
            if (val) this.intervalHandle();
        },
        storeIncomingCallLoading (val) {
            this.timeText = val ? '等待接听' : '00:00';
        },
    },
    computed: {
        ...mapGetters(['storeIsIncomingCallIng', 'storeIsIncomingCallMain']),

        shouldShow () {
            return this.storeIsIncomingCallMain;
        }
    },
    mounted () {
        console.log('mounted()');
    },
    methods: {
        // 计时器
        interval (func, delay) {
            let timer = null;
            const _this = this;
            const interFunc = function () {
                if (timer && !_this.storeIsIncomingCallIng) {
                    timer = null;
                    clearTimeout(timer);
                    console.log('&&&&&&清空通话中计时器&&&&&&');
                    return;
                }
                func.call(null);
                timer = setTimeout(interFunc, delay); // 递归调用
            };
            interFunc();
        // return function () {
        //     timer = setTimeout(interFunc, delay); // 递归调用
        // }();
        },
        intervalHandle () {
            this.timeStart = dayjs();
            const oneHour = 3600;
            this.interval(()=> {
                const secondsDiff = dayjs().diff(this.timeStart, 'second');
                const format = secondsDiff > oneHour ? 'HH:mm:ss' : 'mm:ss';
                this.timeText = dayjs.duration(secondsDiff, 'seconds').format(format);
            }, 1000);
        },
        async onSmaller () {
            // 向左上角偏移，消失
            this.style =  {
                transform: 'translate(-100%, -80%) scale(0.1)'
            };
  
            setTimeout(()=> {
                // 延时等待动画执行完毕
                store.commit('incomingCall/SET_IS_INCOMING_CALL_MAIN', false);
                store.commit('incomingCall/SET_IS_INCOMING_CALL_SMALL', true);
                // 清除向左上角偏移，避免下次不生效
                this.style = {
                    transform: 'none'
                };
            }, 500);
        },
        async dangerClick () {
            this.animateFadeOut = true;
            
            setTimeout(()=> {
                // 延时等待动画执行完毕
                store.commit('incomingCall/SET_IS_INCOMING_CALL_ING', false);
                store.commit('incomingCall/SET_INCOMING_CALL_LOADING', false);
                store.commit('incomingCall/SET_IS_INCOMING_CALL_MAIN', false);
                this.$emit('onDanger');
            }, 500);
        },
        successClick () {
            store.commit('incomingCall/SET_IS_INCOMING_CALL_ING', true);
            store.commit('incomingCall/SET_INCOMING_CALL_LOADING', false);
            this.$emit('onSuccess');
        },
    }
};
</script>

<style lang="scss" scoped>

.z_index_999 {
  z-index: 999;
}

.incoming_call_main {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  transition: all 0.8s;
  z-index: 998;
}
.page_back {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
.header_panel {
  position: absolute;
  top: 10vh;
  left: 0;
  width: 100%;
  text-align: center;
}
.right_icon {
  position: absolute;
  left: 56rpx;
  width: 44rpx;
  height: 44rpx;
  z-index: 999;
}
.avatar_panel {
  position: fixed;
  width: 100%;
  top: calc(30vh);
  left: 0;
  right: 0;
  margin: 0 auto;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.btn_panel {
  position: fixed;
  width: 90%;
  top: calc(80vh);
  left: 0;
  right: 0;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /deep/ .u-button {
    border-radius: 100%;
    width: 140rpx;
    height: 140rpx;
    border: none;
  }
  .danger_btn{
    background-color: #F45955;
    .call_icon {
      transform: rotate(135deg);
    }
  }
  .success_btn {
    background-color: #58BE6B;
  }
  .call_icon {
    width: 60rpx;
    height: 60rpx;
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
</style>
<template>
    <view
        v-show="shouldShow"
        :class="['incoming_call_main animate__animated',
                 animateFadeIn && 'animate__fadeIn',
                 animateFadeOut && 'animate__fadeOut'
        ]"
        :style="style"
    >
        <view
            id="my-box"
            class="page_back_img"
        />
        <image
            class="page_back_img"
            style="z-index: 997"
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

            <template v-if="storeIsVideoCall">
                <view class="avatar_panel avatar_video_panel">
                    <MyAvatar
                        :src="faceURL"
                        :desc="nickname"
                        size="140rpx"
                    />
                    <text class="fz-42 text-inverse mt-14">
                        {{ nickname }}
                    </text>
                </view>
            </template>
            <template v-else>
                <view class="avatar_panel">
                    <MyAvatar
                        :src="faceURL"
                        :desc="nickname"
                        size="184rpx"
                    />
                    <text class="fz-42 text-inverse mt-30">
                        {{ nickname }}
                    </text>
                </view>
            </template>

            <view class="tips_text">
                {{ tipsText }}
            </view>

            <view class="btn_nav">
                <view class="mb-66">
                    <HandleBtn @onHandle="onHandle" />
                </view>
                <AnswerBtn
                    :animate-fade-out.sync="animateFadeOut"
                    @onDanger="onDanger"
                    @onSuccess="onSuccess"
                />
            </view>
        </view>
    </view>
</template>

<script>
import incomingCallMainBack from '@/static/images/incoming_call_main_back.png';
import incomingCallMainReduce from '@/static/images/incoming_call_main_reduce.png';
import MyAvatar from '@/components/MyAvatar/index.vue';
import HandleBtn from "./HandleBtn.vue";
import AnswerBtn from "./AnswerBtn.vue";
import store from "@/store";
import { mapGetters } from 'vuex';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export default {
    name: "IncomingCallMain",
    components: {
        MyAvatar,
        HandleBtn,
        AnswerBtn,
    },
    data () {
        return {
            incomingCallMainBack,
            incomingCallMainReduce,
            timeStart: 0,
            timeText: '00:00',
            animateFadeIn: false,
            animateFadeOut: false,
            style: {},
        };
    },
    computed: {
        ...mapGetters([
            'storeIncomingCallCatch', 
            'storeIncomingCallThrow', 
            'storeIncomingCallCatchUser', 
            'storeIncomingCallThrowUser', 
            'storeIsIncomingCallIng', 
            'storeIsIncomingCallMain',
            'storeIsVideoCall'
        ]),

        shouldShow () {
            return this.storeIsIncomingCallMain;
        },
        faceURL () {
            const {faceURL: catchUser} = this.storeIncomingCallCatchUser;
            const {faceURL: throwUser} = this.storeIncomingCallThrowUser;
            return this.storeIncomingCallThrow ? catchUser : throwUser;
        },
        nickname () {
            const {nickname: catchUser} = this.storeIncomingCallCatchUser;
            const {nickname: throwUser} = this.storeIncomingCallThrowUser;
            return this.storeIncomingCallThrow ? catchUser : throwUser;
        },
        tipsText () {
            if (this.storeIncomingCallThrow) return '等待对方接受邀请';
            else if (this.storeIncomingCallCatch) return '邀请你视频通话';
            else return '';
        }
    },
    watch: {
        shouldShow (val) {
            if (val) {
                this.animateFadeIn = true;
                // 还原偏移位置
                this.style = {
                    transform: 'none'
                };
            }
        },
        storeIsIncomingCallIng (val) {
            if (val) this.intervalHandle();
        },
        storeIncomingCallCatch (val) {
            this.timeText = val ? '等待接听' : '00:00';
        },
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
            }, 500);
        },
        onHandle ({key, value}) {
            this.$emit('onHandle', {key, value});
        },
        onDanger () {
            this.$emit('onDanger');
        },
        onSuccess () {
            this.$store.dispatch('incomingCall/onCatchCall');
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
  display: flex;
  flex-direction: column;
  transition: all 0.5s;
  z-index: 998;
}
.page_back_img {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 998;
}
.header_panel {
  position: relative;
  margin-top: 10vh;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  z-index: 999;
}
.right_icon {
  position: absolute;
  top: 0;
  left: 56rpx;
  width: 44rpx;
  height: 44rpx;
}

.avatar_panel {
  margin-top: 15vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.avatar_video_panel {
  margin-top: 12vh;
}

.tips_text {
  font-size: 36rpx;
  color: #FFFFFF;
  margin-top: 160rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
}

.btn_nav {
  position: fixed;
  width: 86%;
  bottom: 10vh;
  left: 0;
  right: 0;
  margin: 0 auto;
}
</style>
<template>
    <view
        v-if="shouldShow"
        class="small_popup_container"
        :style="style"
        @touchstart="onTouchstart($event)"
        @touchmove="onTouchmove($event)"
        @touchend="onTouchend($event)"
        @click="openPhone"
    >
        <image :src="incomingCallSmallSIcon" />
        <text class="fz-26 text_time">
            {{ timeText }}
        </text>
    </view>
</template>

<script>
import incomingCallSmallSIcon from '@/static/images/incoming_call_small_s_icon.png';
import incomingCallSmallNIcon from '@/static/images/incoming_call_small_n_icon.png';
import { mapGetters } from 'vuex';
import store from "@/store";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
export default {
    name: "SmallPopup",
    data () {
        return {
            incomingCallSmallSIcon,
            incomingCallSmallNIcon,
            containerRect: {
                width: 0,
                height: 0
            },
            timeStart: 0,
            timeText: '00:00',
            windowWidth: 0,
            windowHeight: 0,
            style: {}
        };
    },
    watch: {
        storeIsIncomingCallIng: {
            handler (val) {
                if (val) {
                    this.intervalHandle();
                } else {
                    this.timeText = '等待接听';
                }
            },
            immediate: true
        },
    },
    computed: {
        ...mapGetters(['storeIsIncomingCallSmall', 'storeIsIncomingCallIng']),

        // 悬浮缩小
        shouldShow () {
            return this.storeIsIncomingCallSmall;
        }
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
        // 初始化页面宽高度、dom元素宽高度
        initContainerHeight () {
            const { windowHeight, windowWidth } = uni.getSystemInfoSync();
            this.windowWidth = windowWidth;
            this.windowHeight = windowHeight;

            const query = uni.createSelectorQuery().in(this);
            query.select('.small_popup_container').boundingClientRect(data => {
                this.containerRect = data;
            }).exec();
        },
        // 手指落下时触发
        onTouchstart () {
            if (!this.windowWidth) this.initContainerHeight();
        },
        // 手指移动时触发
        onTouchmove (event) {
            const [touches] = event.touches;
            const {pageX, pageY} = touches;
            let moveX = pageX;
            let moveY = pageY;
            const { windowHeight, windowWidth } = this;
            const { width: domWidth, height: domHeight } = this.containerRect;
            const halfDomWidth = domWidth / 2;
            const halfDomHeight = domHeight / 2;
            const padding = 12;

            console.log(moveX, moveY);
            // 控制范围：在元素 被拖拽的过程中 判断 元素的定位值 是否到达边界 如果到了 就不能在走了
            //左边界
            if (moveX <= halfDomWidth) moveX = halfDomWidth + padding;
            // 上边界
            if (moveY <= halfDomWidth) moveY = halfDomHeight + padding;
            // 右边界  页面宽度 - 拖动元素宽度
            if (moveX >= windowWidth - this.containerRect.width) 
                moveX = windowWidth - halfDomWidth - padding;
            // 下边界  页面高度 - 拖动元素高度
            if (moveY >= windowHeight - this.containerRect.height)
                moveY = windowHeight - halfDomHeight - padding;

            // 减一半元素宽高，定位到中心点
            moveX = moveX - halfDomWidth;
            moveY = moveY - halfDomHeight;
            this.style = {
                transform: `translate(${moveX}px, ${moveY}px)`
            };
        },
        throttleTouchmove (event) {
            uni.$u.throttle(() => {
                this.onTouchmove(event);
            }, 30);
        },
        // 手指抬起时
        onTouchend () {
        },
        openPhone () {
            store.commit('incomingCall/SET_IS_INCOMING_CALL_SMALL', false);
            uni.navigateTo({
                url: '/pages/conversation/webrtc/index',
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.small_popup_container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translate(14rpx, 15vh);
  transition: all 0.1s;
  width: 140rpx;
  height: 140rpx;
  border-radius: 20rpx;
  box-shadow: 0 0 4rpx rgba(0, 0, 0, 0.25);
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  flex-direction: column;
  z-index: 999;
  image {
    width: 40rpx;
    height: 40rpx;
    margin: 28rpx 0;
  }
  .text_time {
    color: #58BE6B;
  }
}
</style>
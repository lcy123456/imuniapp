<template>
    <view class="pc_login_tip" @click="goScanLogin">
        <view class="flex box">
            <image src="/static/images/scan-login-icon.png" />
            <text
                >已在{{
                    PlatformMap[platformID] || '客户'
                }}端登录，手机通知已关闭</text
            >
        </view>
    </view>
</template>

<script>
import { PlatformMap } from '@/enum';
export default {
    name: 'ChatHeader',
    components: {},
    props: {
        platformID: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            PlatformMap
        };
    },
    computed: {},
    methods: {
        goScanLogin() {
            uni.navigateTo({
                url: `/pages/login/scanLogin/index?platformID=${this.platformID}`
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.pc_login_tip {
    background: $uni-bg-color-grey;
    .box {
        display: flex;
        align-items: center;
        padding: 40rpx 60rpx;
        uni-image {
            width: 50rpx;
            height: 50rpx;
        }
        uni-text {
            margin-left: 30rpx;
        }
    }
}
</style>

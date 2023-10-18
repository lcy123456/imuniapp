<template>
    <view class="scan-login">
        <view class="top">
            <image
                src="/static/images/scan-login-icon.png"
            />
            <text>登录WEB端</text>
        </view>
        <view class="btns">
            <view
                class="submit"
                @click="accountScan"
            >
                登录
            </view>
            <view
                class="cancel"
                @click="back"
            >
                取消登录
            </view>
        </view>
    </view>
</template>

<script>

import { accountScan } from '@/api/login';
export default {
    components: {
    },
    data () {
        return {
        };
    },
    computed: {
    },
    onLoad (options) {
        this.code = options.code;
    },
    methods: {
        async accountScan () {
            await accountScan({
                code: this.code
            });
            this.back();
        },
        back () {
            uni.navigateBack();
        }
    },
};
</script>
<style lang="scss" scoped>
.scan-login {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    
    .top {
        uni-image {
            display: block;
            margin: 0 auto;
            width: 200rpx;
            height: 157.3rpx;
        }
        uni-text {
            display: block;
            text-align: center;
            margin-top: 30rpx;
        }
    }
    .btns {
        margin: 209rpx auto;
        .submit {
            display: block;
            margin: 0 auto;
            font-size: 32rpx;
            width: 356rpx;
            height: 92rpx;
            line-height: 92rpx;
            text-align: center;
            border-radius: 16rpx;
            background: rgba(88, 190, 107, 1);
            color: #fff;
        }
        .cancel {
            display: block;
            margin: 92rpx auto;
            text-align: center;
            font-size: 28rpx;
            color: rgba(97, 101, 153, 1);
        }
    }
}
</style>

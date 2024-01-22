<template>
    <view class="scan-login">
        <view class="top">
            <image src="/static/images/scan-login-icon.png" />
            <text
                >{{ platformID ? '' : '登录'
                }}{{ PlatformMap[platformID] || '客户' }}端</text
            >
        </view>
        <view v-if="platformID" class="btns">
            <view class="submit" @click="authForceLogout"> 退出登录 </view>
            <view class="cancel" @click="back"> 取消 </view>
        </view>
        <view v-else class="btns">
            <view class="submit" @click="accountScan"> 登录 </view>
            <view class="cancel" @click="back"> 取消登录 </view>
        </view>
    </view>
</template>

<script>
import { accountScan } from '@/api/login';
import { authForceLogout } from '@/api/login';
import { PlatformMap } from '@/enum';
export default {
    components: {},
    data() {
        return {
            platformID: '',
            code: '',
            PlatformMap
        };
    },
    computed: {},
    onLoad(options) {
        this.code = options.code;
        this.platformID = Number(options.platformID);
    },
    methods: {
        async accountScan() {
            await accountScan({
                code: this.code
            });
            this.back();
        },
        async authForceLogout() {
            try {
                await authForceLogout({
                    platformID: this.platformID,
                    userID: this.$store.state.user.selfInfo.userID
                });
                this.back();
            } catch (err) {
                uni.$u.toast('网络异常请重试');
            }
        },
        back() {
            uni.navigateBack();
        }
    }
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

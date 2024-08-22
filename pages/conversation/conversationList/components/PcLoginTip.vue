<template>
    <view class="pc_login_tip" @click="goScanLogin">
        <view class="flex box">
            <image src="/static/images/scan-login-icon.png" />
            <text>{{ loginTips }}</text>
        </view>
    </view>
</template>

<script>
import { PlatformMap } from '@/enum';
export default {
    name: 'PcLoginTip',
    components: {},
    props: {
        platformID: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            PlatformMap
        };
    },
    computed: {
        loginTips() {
            return (
                {
                    1: this.$t(
                        'Logged_in_on_iOS_mobile_notifications_are_turned_off'
                    ),
                    2: this.$t(
                        'Logged_in_on_Android_mobile_notifications_are_turned_off'
                    ),
                    3: this.$t(
                        'Logged_in_on_client_mobile_notifications_are_turned_off'
                    ),
                    4: this.$t(
                        'Logged_in_on_iOS_mobile_notifications_are_turned_off'
                    ),
                    5: this.$t(
                        'Logged_in_on_PC_mobile_notifications_are_turned_off'
                    )
                }[this.platformID] ||
                this.$t(
                    'Logged_in_on_client_mobile_notifications_are_turned_off'
                )
            );
        }
    },
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

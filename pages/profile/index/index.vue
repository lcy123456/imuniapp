<template>
    <view class="page_container">
        <view class="status-bar-height" />
        <view class="self_info_row">
            <MyAvatar
                :src="selfInfo.faceURL"
                :desc="selfInfo.nickname"
                size="190rpx"
            />
            <text class="nickname">
                {{ selfInfo.nickname }}
            </text>
            <view class="id_row">
                <text>{{ selfInfo.userID }}</text>
                <image
                    class="w-32 h-32 ml-20"
                    src="/static/images/profile_copy.png"
                    @click="copyID"
                />
            </view>
            <image
                class="qrCode w-38 h-38"
                src="/static/images/profile_top_qr.png"
                @click="toSelfQr"
            />
        </view>

        <view class="px-40">
            <view
                v-for="item in profileMenus"
                :key="item.idx"
                class="profile_menu_item"
                @click="profileMenuClick(item)"
            >
                <view class="menu_left">
                    <image
                        class="w-38 h-38"
                        :src="item.icon"
                        mode=""
                    />
                    <text>{{ item.title }}</text>
                </view>
                <u-icon
                    class="text-grey"
                    name="arrow-right"
                    size="20rpx"
                />
            </view>
        </view>

        <u-modal
            width="500rpx"
            show-cancel-button
            :show="showComfirm"
            content="确定要退出当前账号吗？"
            async-close
            @confirm="logoutConfirm"
            @cancel="closeModal"
        />
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import IMSDK from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';

export default {
    components: {
        MyAvatar,
    },
    data () {
        return {
            showComfirm: false,
            profileMenus: [
                {
                    idx: 0,
                    title: '我的信息',
                    icon: require('static/images/profile_menu_info.png'),
                },
                {
                    idx: 2,
                    title: '账号设置',
                    icon: require('static/images/profile_menu_account.png'),
                },
                {
                    idx: 3,
                    title: '关于我们',
                    icon: require('static/images/profile_menu_about.png'),
                },
                {
                    idx: 4,
                    title: '退出登录',
                    icon: require('static/images/profile_menu_logout.png'),
                },
            ],
        };
    },
    computed: {
        ...mapGetters({
            selfInfo: 'storeSelfInfo'
        }),
    },
    methods: {
        toSelfQr () {
            uni.navigateTo({
                url: `/pages/common/userOrGroupQrCode/index`,
            });
        },
        copyID () {
            uni.setClipboardData({
                data: this.selfInfo.userID,
                success: () => {
                    uni.hideToast();
                    this.$nextTick(() => {
                        uni.$u.toast('复制成功');
                    });
                }
            });
        },
        profileMenuClick ({ idx }) {
            switch (idx) {
            case 0:
                uni.navigateTo({
                    url: '/pages/profile/selfInfo/index',
                });
                break;
            case 1:
                uni.navigateTo({
                    url: '/pages/profile/messageNotification/index',
                });
                break;
            case 2:
                uni.navigateTo({
                    url: '/pages/profile/accountSetting/index',
                });
                break;
            case 3:
                uni.navigateTo({
                    url: '/pages/profile/about/index',
                });
                break;
            case 4:
                this.showComfirm = true;
                break;
            default:
                break;
            }
        },
        logoutConfirm () {
            IMSDK.asyncApi(IMSDK.IMMethods.Logout, IMSDK.uuid())
                .then(() => {
                    uni.removeStorage({
                        key: 'IMToken',
                    });
                    uni.removeStorage({
                        key: 'BusinessToken',
                    });
                })
                .catch((err) => console.log(err))
                .finally(() => {
                    this.showComfirm = false;
                    uni.reLaunch({
                        url: '/pages/login/index'
                    });
                });
        },
        closeModal () {
            this.showComfirm = false;
        },
    },
};
</script>

<style lang="scss" scoped>
.page_container {
    height: 100vh;
    background-color: $uni-bg-color-grey;

    .self_info_row {
        margin-top: 20rpx;
        padding-top: 60rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 50rpx;
        position: relative;

        .u-avatar {
            border-radius: 60rpx;
            overflow: hidden;
        }

        .nickname {
            @include nomalEllipsis();
            max-width: 400rpx;
            margin-top: 20rpx;
            font-size: 50rpx;
        }

        .id_row {
            @include vCenterBox();
            font-size: 36rpx;
            color: $uni-text-color-grey;
        }

        .qrCode {
            position: absolute;
            top: 6rpx;
            right: 30rpx;
        }
    }

    .profile_menu_item {
        @include btwBox();
        height: 130rpx;
        padding: 0 44rpx;
        background-color: $uni-bg-color;
        border-radius: 30rpx;
        margin-bottom: 20rpx;

        .menu_left {
            @include vCenterBox();
            color: $uni-text-color;

            image {
                margin-right: 24rpx;
            }
        }
    }
}
</style>

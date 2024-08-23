<template>
    <Page>
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
                        <image class="w-38 h-38" :src="item.icon" mode="" />
                        <text>{{ item.title }}</text>
                    </view>
                    <view class="flex align-center">
                        <view
                            v-if="item.idx === 2 && unreadMap.count"
                            class="base-count"
                        >
                            {{ unreadMap.count > 99 ? `99+` : unreadMap.count }}
                        </view>
                        <u-icon
                            class="text-grey"
                            name="arrow-right"
                            size="20rpx"
                        />
                    </view>
                </view>
            </view>

            <u-modal
                width="500rpx"
                show-cancel-button
                :show="showComfirm"
                :confirm-text="$t('Sure')"
                :cancel-text="$t('Cancel')"
                :content="
                    $t(
                        'Are_you_sure_you_want_to_log_out_of_the_current_account'
                    )
                "
                async-close
                @confirm="logoutConfirm"
                @cancel="closeModal"
            />
        </view>
    </Page>
</template>

<script>
import { mapGetters } from 'vuex';
import IMSDK from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';

export default {
    components: {
        MyAvatar
    },
    data() {
        return {
            showComfirm: false,
            profileMenus: [
                {
                    idx: 0,
                    title: this.$t('My_information'),
                    icon: require('static/images/profile_menu_info.svg')
                },
                {
                    idx: 2,
                    title: this.$t('Account_settings'),
                    icon: require('static/images/profile_menu_account.svg')
                },
                {
                    idx: 3,
                    title: this.$t('My_favorites'),
                    icon: require('static/images/profile_menu_favorite.svg')
                },
                {
                    idx: 4,
                    title: this.$t('About_us'),
                    icon: require('static/images/profile_menu_about.svg')
                },
                {
                    idx: 5,
                    title: this.$t('Log_out1'),
                    icon: require('static/images/profile_menu_logout.svg')
                }
            ]
        };
    },
    computed: {
        ...mapGetters({
            selfInfo: 'storeSelfInfo',
            unreadMap: 'storeUnreadMap'
        })
    },
    methods: {
        toSelfQr() {
            uni.navigateTo({
                url: `/pages/common/userOrGroupQrCode/index`
            });
        },
        copyID() {
            uni.setClipboardData({
                data: this.selfInfo.userID,
                success: () => {
                    uni.hideToast();
                    this.$nextTick(() => {
                        uni.$u.toast(this.$t('Copy_successfully'));
                    });
                }
            });
        },
        profileMenuClick({ idx }) {
            switch (idx) {
                case 0:
                    uni.navigateTo({
                        url: '/pages/profile/selfInfo/index'
                    });
                    break;
                case 1:
                    uni.navigateTo({
                        url: '/pages/profile/messageNotification/index'
                    });
                    break;
                case 2:
                    uni.navigateTo({
                        url: '/pages/profile/accountSetting/index'
                    });
                    break;
                case 3:
                    uni.navigateTo({
                        url: '/pages/profile/favorite/index'
                    });
                    break;
                case 4:
                    uni.navigateTo({
                        url: '/pages/profile/about/index'
                    });
                    break;
                case 5:
                    this.showComfirm = true;
                    break;
                default:
                    break;
            }
        },
        async logoutConfirm() {
            await IMSDK.asyncApi(IMSDK.IMMethods.Logout, IMSDK.uuid());
            this.$store.commit('user/SET_AUTH_DATA', {});
            this.$store.commit('conversation/SET_CONVERSATION_FOLDER', []);
            this.showComfirm = false;
            uni.reLaunch({
                url: '/pages/login/index'
            });
        },
        closeModal() {
            this.showComfirm = false;
        }
    }
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

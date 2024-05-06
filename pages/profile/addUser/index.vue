<template>
    <view class="add-user">
        <view slot="content">
            <view class="ul">
                <view v-for="item of storeUserList" :key="item.userID">
                    <u-swipe-action-item
                        v-if="storeUserID !== item.userID"
                        :threshold="50"
                        :options="options"
                        @click="clickConversationMenu(item)"
                    >
                        <view class="li" @click="checkUser(item)">
                            <view class="left">
                                <MyAvatar
                                    shape="circle"
                                    :src="item.faceURL"
                                    :desc="item.nickname"
                                    size="80rpx"
                                />
                                <text>{{ item.nickname }}</text>
                            </view>
                            <view class="right">
                                <text
                                    v-if="getUnreadCount(item.userID)"
                                    class="base-count"
                                >
                                    {{ getUnreadCount(item.userID) }}
                                </text>
                            </view>
                        </view>
                    </u-swipe-action-item>
                </view>
                <view
                    :class="[
                        'li',
                        'add',
                        storeUserList.length === 1 ? 'empty' : ''
                    ]"
                    @click="goLogin('')"
                >
                    <image src="/static/images/add_user.png" />
                    <text>添加账号</text>
                    <u-loading-icon v-if="addUserLoading" />
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import defaultAvatars from '@/common/defaultAvatars.js';
import { mapGetters, mapActions } from 'vuex';
import { login } from '@/util/imCommon';
import MyAvatar from '@/components/MyAvatar/index.vue';

export default {
    components: {
        MyAvatar
    },
    data() {
        return {
            addUserLoading: false,
            show: false,
            options: [
                {
                    icon: '/static/images/chating_message_del.png'
                }
            ]
        };
    },
    computed: {
        ...mapGetters(['storeUserList', 'storeUserID', 'storeUnreadMap'])
    },
    methods: {
        ...mapActions('incomingCall', ['onDangerCall']),
        getUnreadCount(userID) {
            const map = this.storeUnreadMap[userID];
            if (map && map.count) {
                return map.count > 99 ? '99+' : map.count;
            }
            return '';
        },
        getAvatarUrl(src) {
            return defaultAvatars[src] ?? src;
        },
        clickConversationMenu(item) {
            this.$store.commit('user/SET_DEL_USER_LIST', item);
        },
        async goLogin(type) {
            this.onDangerCall();
            try {
                !type &&
                    uni.reLaunch({
                        url: '/pages/login/index'
                    });
            } catch (err) {
                console.log(err);
                uni.$u.toast('网络异常，请重试');
            }
        },
        async checkUser(requestMap) {
            uni.showLoading({
                mask: true
            });
            try {
                await this.goLogin('reset');
                let data = await login(requestMap);
                if (!data) {
                    uni.hideLoading();
                }
            } catch (err) {
                uni.hideLoading();
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.add-user {
    margin: 20rpx 40rpx;
    flex: 1;
    overflow: auto;
    border-radius: 30rpx;
    .ul {
        background-color: $uni-bg-color;
        border-radius: 30rpx;
        .li {
            height: 130rpx;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 40rpx;
            .left {
                display: flex;
                align-items: center;
            }
            .right {
                display: flex;
                align-items: center;
                .base-count {
                    height: fit-content;
                }
            }
            uni-image {
                width: 80rpx;
                height: 80rpx;
                border-radius: 50%;
            }
            uni-text {
                margin-left: 20rpx;
            }
            &.add {
                padding: 0 60rpx;
                justify-content: left;
                uni-image {
                    width: 30rpx;
                    height: 30rpx;
                }
                uni-text {
                    color: #008dff;
                    margin-left: 50rpx;
                }
                &.empty {
                    justify-content: center;
                    uni-text {
                        margin-left: 20rpx;
                    }
                }
            }
            .avatar {
                background: #008dff;
                width: 80rpx;
                height: 80rpx;
                border-radius: 50%;
                text-align: center;
                line-height: 80rpx;
                color: #fff;
                font-size: 12px;
            }
        }
    }
}
</style>

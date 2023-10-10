<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
    <view class="page_container">
        <CustomNavBar
            title="账号设置"
            is-bg-color2
        />

        <view class="info_wrap">
            <SettingItem
                title="通讯录黑名单"
                show-arrow
                @click="toBlockList"
            />
            <SettingItem
                :loading="loading"
                title="勿扰模式"
                :switch-value="globalOptEnable"
                show-switch
                @switch="switchGlobalOpt"
            />
        </view>
        <view class="add-user">
            <view slot="content">
                <view class="ul">
                    <u-swipe-action-item
                        v-for="item of storeUserList"
                        v-if="storeSelfInfo.userID !== item.userID"
                        :key="item.userID"
                        :threshold="50"
                        :options="options"
                        @click="clickConversationMenu(item)"
                    >
                        <view
                            class="li"
                            @click="checkUser(item)"
                        >
                            <image
                                v-if="item.faceURL"
                                :src="item.faceURL"
                            />
                            <view
                                v-else
                                class="avatar"
                            >
                                {{ item.nickname.slice(item.nickname.length - 2, item.nickname.length) }}
                            </view>
                            <text>{{ item.nickname }}</text>
                            <u-loading-icon v-if="checkUserLoading" />
                        </view>
                    </u-swipe-action-item>
                    <view
                        :class="['li', 'add', storeUserList.length === 1 ? 'empty' : '']"
                        @click="goLogin('')"
                    >
                        <image
                            src="/static/images/add_user.png"
                        />
                        <text>添加账号</text>
                        <u-loading-icon v-if="addUserLoading" />
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import IMSDK, { MessageReceiveOptType } from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import SettingItem from '@/components/SettingItem/index.vue';
import { mapGetters } from 'vuex';
import { login } from '@/util/imCommon';

export default {
    components: {
        CustomNavBar,
        SettingItem
    },
    data () {
        return {
            loading: false,
            addUserLoading: false,
            checkUserLoading: false,
            options: [{
                icon: '/static/images/chating_message_del.png',
                style: {
                    backgroundColor: '#f00',
                }
            }]
        };
    },
    computed: {
        ...mapGetters([
            "storeUserList",
            "storeIMToken",
            "storeConversationList",
            "storeCurrentConversation",
            "storeCurrentUserID",
            "storeSelfInfo",
            "storeRecvFriendApplications",
            "storeRecvGroupApplications",
            "storeHistoryMessageList",
            "storeIsSyncing",
        ]),
        globalOptEnable () {
            return this.$store.getters.storeSelfInfo.globalRecvMsgOpt !== MessageReceiveOptType.Nomal;
        }
    },
    methods: {
        clickConversationMenu (item) {
            console.log(item);
            this.$store.commit('user/SET_DEL_USER_LIST', item);
        },
        async goLogin (type) {
            !type ? (this.addUserLoading = true) : (uni.showLoading({title: ''}));
            try {
                let data = await IMSDK.asyncApi(IMSDK.IMMethods.Logout, IMSDK.uuid());
                !type ? (this.addUserLoading = false) : (uni.hideLoading());
                console.log('----IMSDK.IMMethods.Logout', data);
                this.$store.commit('user/SET_AUTH_DATA', {});
                !type && (uni.$u.route('/pages/login/index'));
            } catch (err) {
                console.log(err);
                // !type ? (this.addUserLoading = false) : (this.$hideLoading());
                uni.$u.toast('网络异常，请重试');
            }
        },
        async checkUser (requestMap) {
            await this.goLogin('reset');
            login(requestMap);
        },
        toBlockList () {
            uni.navigateTo({
                url: '/pages/profile/blockList/index'
            });
        },
        switchGlobalOpt (flag) {
            this.loading = true;
            IMSDK.asyncApi(
                IMSDK.IMMethods.SetGlobalRecvMessageOpt, 
                IMSDK.uuid(), 
                flag ? MessageReceiveOptType.NotNotify : MessageReceiveOptType.Nomal
            ).finally(() => {
                this.loading = false;
            }).catch(() => {
                uni.$u.toast('设置失败');
            });
        }
    }
};
</script>

<style lang="scss" scoped>
	.page_container {
		background-color: $uni-bg-color-grey;

		.info_wrap {
			background-color: $uni-bg-color;
			margin: 40rpx;
            border-radius: 30rpx;
		}
        .add-user {
            margin: 20rpx;
			background-color: $uni-bg-color;
            border-radius: 30rpx;
            .ul {
                .li {
                    height: 130rpx;
                    line-height: 130rpx;
                    display: flex;
                    align-items: center;
                    padding: 0 40rpx;
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
                        uni-image {
                            width: 30rpx;
                            height: 30rpx;
                        }
                        uni-text {
                            color: #008DFF;
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
                        background: #008DFF;
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
	}
</style>

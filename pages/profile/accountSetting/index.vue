<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
    <Page>
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
                <SettingItem
                    title="消息提示音"
                    show-arrow
                    @click="checkoutVoice"
                />
            </view>
            <view class="add-user">
                <view slot="content">
                    <view class="ul">
                        <u-swipe-action-item
                            v-for="item of storeUserList"
                            v-if="storeUserID !== item.userID"
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
                                    :src="getAvatarUrl(item.faceURL)"
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
        <u-picker
            :show="show"
            :key-name="'label'"
            :columns="columns"
            :default-index="defaultIndex"
            @confirm="confirm"
            @change="changeHandler"
            @cancel="show = false;"
        />
    </Page>
</template>

<script>
import defaultAvatars from '@/common/defaultAvatars.js';
import MyAvatar from "@/components/MyAvatar/index.vue";
import IMSDK, { MessageReceiveOptType } from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import SettingItem from '@/components/SettingItem/index.vue';
import { mapGetters } from 'vuex';
import { login } from '@/util/imCommon';

export default {
    components: {
        CustomNavBar,
        SettingItem,
        MyAvatar
    },
    data () {
        return {
            loading: false,
            addUserLoading: false,
            checkUserLoading: false,
            show: false,
            defaultIndex: [],
            columns: [[
                {
                    id: 1,
                    label: '提示声一',
                    value: '/static/audio/voice1.mp3'
                },
                {
                    id: 2,
                    label: '提示声二',
                    value: '/static/audio/voice2.mp3'
                },
                {
                    id: 3,
                    label: '提示声三',
                    value: '/static/audio/voice3.mp3'
                },
                {
                    id: 4,
                    label: '提示声四',
                    value: '/static/audio/voice4.mp3'
                },
            ]],
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
            "storeUserID"
        ]),
        globalOptEnable () {
            return this.$store.getters.storeSelfInfo.globalRecvMsgOpt !== MessageReceiveOptType.Nomal;
        }
    },
    created () {
    },
    methods: {
        setDefaultIndex () {
            const index = this.columns[0].findIndex(item => item.value === uni.getStorageSync('voice'));
            this.defaultIndex = index === -1 ? [0] : [index];
        },
        changeHandler (e) {
            const {
                value
            } = e;
            const item = value[0];
            uni.$emit('play_audio', item.value);
        },
        confirm (e) {
            const {
                value
            } = e;
            const item = value[0];
            uni.setStorageSync('voice', item.value);
            this.show = false;
            uni.$u.toast('设置成功');
        },
        checkoutVoice () {
            this.setDefaultIndex();
            this.show = true;
            this.$nextTick(() => {
                const item = this.columns[0][this.defaultIndex[0]];
                uni.$emit('play_audio', item.value);
            });
        },
        getAvatarUrl (src) {
            return defaultAvatars[src] ?? src;
        },
        clickConversationMenu (item) {
            console.log(item);
            this.$store.commit('user/SET_DEL_USER_LIST', item);
        },
        async goLogin (type) {
            try {
                !type && (uni.$u.route('/pages/login/index'));
            } catch (err) {
                console.log(err);
                uni.$u.toast('网络异常，请重试');
            }
        },
        async checkUser (requestMap) {
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
            margin: 20rpx 40rpx;
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

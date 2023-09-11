<template>
    <view class="user_card_container">
        <CustomNavBar
            title=""
            is-bg-color2
        />

        <view class="base_info">
            <MyAvatar
                :src="sourceUserInfo.faceURL"
                :desc="sourceUserInfo.remark || sourceUserInfo.nickname"
                size="190rpx"
            />
            <text class="nickname">
                {{ getShowName }}
            </text>
            <view class="id_row">
                ID：<text>{{ sourceID }}</text>
                <image
                    class="w-32 h-32 ml-20"
                    src="/static/images/profile_copy.png"
                    @click="copyID"
                />
            </view>
        </view>

        <view v-if="isFriend">
            <view class="flex justify-between mb-30">
                <view
                    v-for="item in infoMenus"
                    :key="item.idx"
                    class="w-210 h-130 bg-color br-30 flex flex-column justify-evenly align-center"
                    @click="infoMenusClick(item)"
                >
                    <image
                        class="w-54 h-54"
                        :src="item.icon"
                    />
                    <view class="fz-26">
                        {{ item.title }}
                    </view>
                </view>
            </view>
            <SettingItem
                class="info-row"
                title="查找聊天记录"
                show-arrow
                @click="handleRecord"
            />
            <SettingItem
                class="info-row"
                title="加入黑名单"
                show-switch
                :loading="blackLoading"
                :switch-value="isBlacked"
                @switch="blackChange"
            />
            <view 
                class="info-row flex justify-center align-center error"
                @click="()=>showConfirm=true"
            >
                解除好友关系
            </view>
        </view>
        <!-- <SettingItem
            class="info-row"
            :title="infoMenus[1].title"
            show-arrow
            @click="infoMenusClick(infoMenus[1])"
        /> -->

        <view class="action_row">
            <view
                v-if="showSendMessage"
                class="action_item"
                @click="toDesignatedConversation"
            >
                <img
                    src="static/images/user_card_message.png"
                    alt=""
                >
                <text>发消息</text>
            </view>
            <view
                v-if="!isFriend"
                class="action_item"
                @click="toAddFriend"
            >
                <img
                    src="static/images/user_card_add.png"
                    alt=""
                >
                <text>添加好友</text>
            </view>
        </view>
        
        <u-modal
            :content="`确定要解除与${sourceUserInfo.nickname}的好友关系吗？`"
            async-close
            :show="showConfirm"
            show-cancel-button
            @confirm="confirmRemove"
            @cancel="() => showConfirm = false"
        />
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import { CommonIsAllow, CustomMarkType, RecordFormMap } from '@/constant';
import {
    getSourceUserInfo,
    getDesignatedUserOnlineState,
    navigateToDesignatedConversation,
} from '@/util/imCommon';
import IMSDK, { SessionType } from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import SettingItem from '@/components/SettingItem/index.vue';
import { checkLoginError } from '@/util/common';

export default {
    components: {
        CustomNavBar,
        MyAvatar,
        SettingItem,
    },
    data () {
        return {
            sourceID: '',
            sourceUserInfo: {},
            from: '',
            onlineStr: '离线',
            isOnline: false,
            infoMenus: [
                {
                    idx: 0,
                    title: '备注',
                    icon: require('static/images/profile_menu_info.png'),
                },
                {
                    idx: 1,
                    title: '更多资料',
                    icon: require('static/images/profile_menu_account.png'),
                },
                {
                    idx: 2,
                    title: '创建群聊',
                    icon: require('static/images/user_card_group.png'),
                },
            ],
            blackLoading: false,
            showConfirm: false,
        };
    },
    computed: {
        ...mapGetters([
            'storeFriendList',
            'storeBlackList',
            'storeAppConfig',
        ]),
        isFriend () {
            return (
                this.storeFriendList.findIndex(
                    (friend) => friend.userID === this.sourceID
                ) !== -1
            );
        },
        getShowName () {
            let suffix = '';
            if (this.sourceUserInfo.remark) {
                suffix = `(${this.sourceUserInfo.remark})`;
            }
            return this.sourceUserInfo.nickname + suffix;
        },
        isBlacked () {
            return this.storeBlackList.some(black => black.userID === this.sourceID);
        },
        showSendMessage () {
            const businessAllow =
                this.storeAppConfig.allowSendMsgNotFriend ===
                CommonIsAllow.Allow;
            return businessAllow ? businessAllow : this.isFriend;
        },
    },
    onLoad (options) {
        const { sourceID, sourceInfo, from } = options;
        if (sourceID) {
            this.sourceID = sourceID;
            this.handleGetUserInfo();
        } else {
            const info = JSON.parse(sourceInfo);
            this.sourceID = info.userID;
            this.sourceUserInfo = info;
        }
        this.from = from;
        this.getOnlineState();
        this.setIMListener();
    },
    onUnload () {
        this.disposeIMListener();
    },
    methods: {
        async handleGetUserInfo () {
            const res = await getSourceUserInfo(this.sourceID);
            this.sourceUserInfo = res;
        },
        async getOnlineState () {
            getDesignatedUserOnlineState(this.sourceID)
                .then((str) => {
                    this.isOnline = str !== '离线';
                    this.onlineStr = str;
                })
                .catch(() => (this.isOnline = false));
        },
        toAddFriend () {
            uni.$u.route('/pages/common/sendAddRequest/index', {
                isGroup: false,
                sourceID: this.sourceID,
                isScan: false,
                notNeedVerification: false,
            });
        },
        toDesignatedConversation () {
            if (this.from === 'chating') {
                uni.navigateBack();
            } else {
                navigateToDesignatedConversation(
                    this.sourceID,
                    SessionType.Single
                ).catch(() => uni.$u.toast('获取会话信息失败'));
            }
        },
        copyID () {
            uni.setClipboardData({
                data: this.sourceID,
                success: () => {
                    uni.$u.toast('复制成功');
                },
            });
        },
        infoMenusClick ({ idx }) {
            const sourceInfo = JSON.stringify(this.sourceUserInfo);
            let url = '';
            switch (idx) {
            case 0:
                url = `/pages/common/markOrIDPage/index?type=${CustomMarkType.Remark}&sourceInfo=${sourceInfo}`;
                break;
            case 1:
                url = `/pages/common/detailsFileds/index?sourceInfo=${sourceInfo}`;
                break;
            case 2:
                const checkedMemberList = JSON.stringify([
                    {
                        userID: this.sourceID,
                        faceURL: this.sourceUserInfo.faceURL,
                        nickname: this.sourceUserInfo.nickname,
                    },
                ]);
                url = `/pages/common/createGroup/index?checkedMemberList=${checkedMemberList}`;
                break;
            }
            uni.navigateTo({ url });
        },
        async handleRecord () {
            try {
                const { data } = await IMSDK.asyncApi(
                    IMSDK.IMMethods.GetOneConversation,
                    IMSDK.uuid(),
                    {
                        sessionType: SessionType.Single,
                        sourceID: this.sourceID,
                    }
                );
                uni.$u.route('/pages/common/searchRecord/recordDetail/index', {
                    conversation: encodeURIComponent(JSON.stringify(data)),
                    from: RecordFormMap.Contact,
                });
            } catch {
                uni.$u.toast('获取会话信息失败');
            }
        },
        async blackChange (isBlack) {
            this.blackLoading = true;
            try {
                const funcName = isBlack ? IMSDK.IMMethods.AddBlack : IMSDK.IMMethods.RemoveBlack;
                await IMSDK.asyncApi(funcName, IMSDK.uuid(), this.sourceID);
                this.$toast('操作成功');
                this.$store.dispatch('contact/getBlacklist');
            } catch (err) {
                console.log(err);
                this.$toast(checkLoginError(err));
            }
            this.blackLoading = false;
        },
        async confirmRemove () {
            try {
                await IMSDK.asyncApi(IMSDK.IMMethods.DeleteFriend, IMSDK.uuid(), this.sourceID);
                this.$store.dispatch('contact/getFriendList');
                this.$toast('操作成功');
            } catch (err) {
                console.log(err);
                this.$toast(checkLoginError(err));
            }
            this.showConfirm = false;
        },
        friendInfoChangeHandler ({ data }) {
            if (data.userID === this.sourceID) {
                this.sourceUserInfo = {
                    ...this.sourceUserInfo,
                    ...data,
                };
            }
        },
        setIMListener () {
            IMSDK.subscribe(
                IMSDK.IMEvents.OnFriendInfoChanged,
                this.friendInfoChangeHandler
            );
        },
        disposeIMListener () {
            IMSDK.unsubscribe(
                IMSDK.IMEvents.OnFriendInfoChanged,
                this.friendInfoChangeHandler
            );
        },
    },
};
</script>

<style lang="scss" scoped>
.user_card_container {
    height: 100vh;
    background-color: $uni-bg-color-grey;
    padding: 0 30rpx;

    .base_info {
        margin-top: 20rpx;
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
    }

    .info-row {
        height: 130rpx;
        background-color: $uni-bg-color;
        border-radius: 30rpx;
        margin-bottom: 30rpx;
    }

    .mute_right {
        display: flex;
        align-items: center;
    }

    .company_row {
        padding: 20rpx 0;

        .desc_title {
            padding-left: 44rpx;
        }
        /deep/.title {
            width: 200rpx;
            color: #999 !important;
        }
    }

    .action_row {
        @include vCenterBox();
        justify-content: space-around;
        margin: 44rpx;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;

        .action_item {
            @include colBox(false);
            align-items: center;
            color: $u-primary;

            img {
                width: 100rpx;
                height: 100rpx;
                margin-bottom: 12rpx;
            }
        }
    }

    .online_state {
        @include vCenterBox();
        margin-left: 24rpx;
        font-size: 24rpx;
        color: #999;

        .dot {
            background-color: #10cc64;
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;
            margin-right: 12rpx;
        }

        .online_str {
            @include nomalEllipsis();
            max-width: 280rpx;
        }
    }
}
</style>

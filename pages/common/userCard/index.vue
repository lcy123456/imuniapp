<template>
    <Page>
        <view class="user_card_container" @click="closeAll">
            <CustomNavBar title="" is-bg-color2 />

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
                        class="flex feat-item w-210 h-130 bg-color br-30 flex-column justify-evenly align-center"
                        @click.stop="infoMenusClick(item)"
                    >
                        <view class="w-50 h-54">
                            <image
                                :class="[
                                    'w-' + (item.w || 50),
                                    'h-' + (item.h || 54)
                                ]"
                                :src="item.icon"
                            />
                        </view>
                        <view class="fz-26">
                            {{ item.title }}
                        </view>
                        <view v-if="item.idx === 2">
                            <more-feat
                                ref="moreFeat"
                                :options="[
                                    // {
                                    //     icon: '/static/images/user_card_group.png',
                                    //     text: '建立群组',
                                    //     id: 1
                                    // }
                                ]"
                                :source-i-d="sourceID"
                                @callBack="callBack"
                            />
                        </view>
                    </view>
                </view>
                <SettingItem
                    class="info-row"
                    :title="$t('Find_chat_history')"
                    show-arrow
                    @click="handleRecord"
                />
                <SettingItem
                    class="info-row"
                    :title="$t('Add_to_blacklist')"
                    show-switch
                    :loading="blackLoading"
                    :switch-value="isBlacked"
                    @switch="blackChange"
                />
                <view
                    class="flex justify-center h-130 bg-color br-30 align-center error"
                    @click="() => (showConfirm = true)"
                >
                    {{ $t('Remove_friend_relationship') }}
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
                    <img src="static/images/send_message.svg" alt="" />
                    <text>{{ $t('Send_message') }}</text>
                </view>
                <view v-if="!isFriend" class="action_item" @click="toAddFriend">
                    <img src="static/images/add_friend.svg" alt="" />
                    <text>{{ $t('Add_friends') }}</text>
                </view>
            </view>

            <u-modal
                :content="
                    $t(
                        'Are_you_sure_you_want_to_remove_friend_relationship_with_{value}',
                        { value: sourceUserInfo.nickname }
                    )
                "
                :confirm-text="$t('Sure')"
                :cancel-text="$t('Cancel')"
                async-close
                :show="showConfirm"
                show-cancel-button
                @confirm="confirmRemove"
                @cancel="() => (showConfirm = false)"
            />
        </view>
    </Page>
</template>

<script>
import { mapGetters } from 'vuex';
import { CustomMarkType, RecordFormMap } from '@/constant';
import {
    getSourceUserInfo,
    getDesignatedUserOnlineState,
    navigateToDesignatedConversation
} from '@/util/imCommon';
import IMSDK, { SessionType } from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import SettingItem from '@/components/SettingItem/index.vue';
import MoreFeat from '@/pages/common/moreFeat/index.vue';
import { checkLoginError } from '@/util/common';
import { addBlack, removeBlack } from '@/api/imApi';

export default {
    components: {
        CustomNavBar,
        MyAvatar,
        SettingItem,
        MoreFeat
    },
    data() {
        return {
            moreIndex: 0,
            sourceID: '',
            sourceUserInfo: {},
            from: '',
            onlineStr: this.$t('Offline'),
            isOnline: false,
            infoMenus: [
                {
                    idx: 0,
                    title: this.$t('Notes'),
                    icon: '/static/images/profile_menu_info.svg'
                },
                {
                    idx: 1,
                    title: this.$t('More_information'),
                    icon: '/static/images/profile_menu_account.svg'
                },
                {
                    idx: 2,
                    title: this.$t('More'),
                    icon: '/static/images/common_more_active.svg',
                    w: 42,
                    h: 10
                }
            ],
            timeMenus: [
                {
                    title: this.$t('One_day'),
                    time: 60 * 60 * 24
                },
                {
                    title: this.$t('One_week'),
                    time: 60 * 60 * 24 * 7
                },
                {
                    title: this.$t('One_month'),
                    time: 60 * 60 * 24 * 30
                },
                {
                    title: this.$t('Others'),
                    time: 'other'
                },
                {
                    title: this.$t('Deactivate'),
                    time: 60 * 60 * 24 * 30 * 12 * 100,
                    style: {
                        color: '#EC4B37'
                    }
                }
            ],
            blackLoading: false,
            showConfirm: false
        };
    },
    computed: {
        ...mapGetters([
            'storeFriendList',
            'storeBlackList',
            'storeAppConfig',
            'storeUserID'
        ]),
        isFriend() {
            return (
                this.storeFriendList.findIndex(
                    friend => friend.userID === this.sourceID
                ) !== -1
            );
        },
        getShowName() {
            let suffix = '';
            if (this.sourceUserInfo.remark) {
                suffix = `(${this.sourceUserInfo.remark})`;
            }
            return this.sourceUserInfo.nickname
                ? this.sourceUserInfo.nickname + suffix
                : '';
        },
        isBlacked() {
            return this.storeBlackList.some(
                black => black.userID === this.sourceID
            );
        },
        showSendMessage() {
            // const businessAllow =
            //     this.storeAppConfig.allowSendMsgNotFriend ===
            //     CommonIsAllow.Allow;
            // return businessAllow ? businessAllow : this.isFriend;
            return true;
        }
    },
    onLoad(options) {
        const { sourceID, sourceInfo, from } = options;
        if (sourceID) {
            try {
                const info = JSON.parse(sourceInfo);
                this.sourceUserInfo = info;
            } catch (err) {
                //
            }
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
    onUnload() {
        this.disposeIMListener();
    },
    methods: {
        closeAll() {
            this.$refs.moreFeat[0].setMoreIndex(0);
        },
        callBack(item) {
            if (item.id === 1) {
                this.createGroup();
            }
        },
        async handleGetUserInfo() {
            const res = await getSourceUserInfo(this.sourceID);
            this.sourceUserInfo = res;
        },
        async getOnlineState() {
            getDesignatedUserOnlineState(this.sourceID)
                .then(res => {
                    const { onlineStr, status } = res;
                    this.isOnline = status === 'online';
                    this.onlineStr = onlineStr;
                })
                .catch(() => (this.isOnline = false));
        },
        toAddFriend() {
            uni.$u.route('/pages/common/sendAddRequest/index', {
                isGroup: false,
                sourceID: this.sourceID,
                isScan: false,
                notNeedVerification: false
            });
        },
        toDesignatedConversation() {
            if (this.from === 'chating') {
                uni.navigateBack();
            } else {
                navigateToDesignatedConversation(
                    this.sourceID,
                    SessionType.Single
                ).catch(() =>
                    uni.$u.toast(this.$t('Failed_to_get_session_information'))
                );
            }
        },
        copyID() {
            uni.setClipboardData({
                data: this.sourceID,
                success: () => {
                    uni.$u.toast(this.$t('Copy_successfully'));
                }
            });
        },
        infoMenusClick({ idx }) {
            const sourceInfo = JSON.stringify(this.sourceUserInfo);
            let url = '';
            switch (idx) {
                case 0:
                    url = `/pages/common/markOrIDPage/index?type=${CustomMarkType.Remark}&sourceInfo=${sourceInfo}`;
                    uni.navigateTo({ url });
                    break;
                case 1:
                    url = `/pages/common/detailsFileds/index?sourceInfo=${sourceInfo}`;
                    uni.navigateTo({ url });
                    break;
                case 2:
                    this.moreIndex =
                        this.$refs.moreFeat[0].moreIndex === 1 ? 0 : 1;
                    this.$refs.moreFeat[0].setMoreIndex(this.moreIndex);
                    break;
            }
        },
        createGroup() {
            const checkedMemberList = JSON.stringify([
                {
                    userID: this.sourceID,
                    faceURL: this.sourceUserInfo.faceURL,
                    nickname: this.sourceUserInfo.nickname
                }
            ]);
            const url = `/pages/common/createGroup/index?checkedMemberList=${checkedMemberList}`;
            uni.navigateTo({ url });
        },
        async handleRecord() {
            try {
                const { data } = await IMSDK.asyncApi(
                    IMSDK.IMMethods.GetOneConversation,
                    IMSDK.uuid(),
                    {
                        sessionType: SessionType.Single,
                        sourceID: this.sourceID
                    }
                );
                uni.$u.route('/pages/common/searchRecord/recordDetail/index', {
                    conversation: encodeURIComponent(JSON.stringify(data)),
                    from: RecordFormMap.Contact
                });
            } catch {
                uni.$u.toast(this.$t('Failed_to_get_session_information'));
            }
        },
        async blackChange(isBlack) {
            this.blackLoading = true;
            try {
                const funcName = isBlack ? addBlack : removeBlack;
                await funcName({
                    blackUserID: this.sourceID,
                    ownerUserID: this.storeUserID
                });
                this.$toast(this.$t('Operation_successful'));
                this.$store.dispatch('contact/getBlacklist');
            } catch (err) {
                console.log(err);
                this.$toast(checkLoginError(err));
            }
            this.blackLoading = false;
        },
        async confirmRemove() {
            try {
                await IMSDK.asyncApi(
                    IMSDK.IMMethods.DeleteFriend,
                    IMSDK.uuid(),
                    this.sourceID
                );
                this.$store.dispatch('contact/getFriendList');
                this.$toast(this.$t('Operation_successful'));
            } catch (err) {
                console.log(err);
                this.$toast(checkLoginError(err));
            }
            this.showConfirm = false;
        },
        friendInfoChangeHandler({ data }) {
            if (data.userID === this.sourceID) {
                this.sourceUserInfo = {
                    ...this.sourceUserInfo,
                    ...data
                };
            }
        },
        setIMListener() {
            IMSDK.subscribe(
                IMSDK.IMEvents.OnFriendInfoChanged,
                this.friendInfoChangeHandler
            );
        },
        disposeIMListener() {
            IMSDK.unsubscribe(
                IMSDK.IMEvents.OnFriendInfoChanged,
                this.friendInfoChangeHandler
            );
        }
    }
};
</script>

<style lang="scss" scoped>
.user_card_container {
    height: 100vh;
    background-color: $uni-bg-color-grey;
    padding: 0 30rpx;
    .feat-item {
        position: relative;
    }
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

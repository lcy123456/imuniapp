<template>
    <Page>
        <view class="page_container">
            <custom-nav-bar
                :title="
                    isGroupApplication
                        ? $t('Group_notification')
                        : $t('Friend_request')
                "
            />

            <view class="application_item">
                <view class="base_info_row">
                    <view class="base_info_left" @click="toSourceDetails">
                        <my-avatar
                            :src="getSourceFaceURL"
                            :desc="getSourceName"
                        />
                        <view class="base_info_details">
                            <text class="nickname">
                                {{ getSourceName }}
                            </text>
                            <view class="online_state">
                                <view
                                    class="dot"
                                    :style="{
                                        backgroundColor: isOnline
                                            ? '#10CC64'
                                            : '#999'
                                    }"
                                />
                                <text>{{ onlineStr }}</text>
                            </view>
                        </view>
                    </view>

                    <u-icon name="arrow-right" size="18" color="#999" />
                </view>

                <view class="request_message">
                    <view v-if="isGroupApplication" class="title">
                        <text>{{ $t('Apply_to_join') }} </text>
                        <text class="group_name">
                            {{ currentApplication.groupName }}
                        </text>
                    </view>
                    <text v-else>
                        {{ `${getSourceName}：` }}
                    </text>
                    <text>{{ currentApplication.reqMsg }}</text>
                </view>
            </view>

            <view class="action_row">
                <u-button
                    :loading="loadingState.accept"
                    type="primary"
                    :plain="true"
                    :text="`${
                        isGroupApplication
                            ? $t('Apply_for_group_entry')
                            : $t('Apply_for_friend_entry')
                    }`"
                    @click="acceptAplication"
                />
            </view>

            <view class="action_row">
                <u-button
                    :loading="loadingState.refuse"
                    type="primary"
                    :plain="true"
                    :text="`${
                        isGroupApplication
                            ? $t('Reject_group_entry')
                            : $t('Reject_friend_entry')
                    }`"
                    @click="refuseAplication"
                />
            </view>
        </view>
    </Page>
</template>

<script>
import { getDesignatedUserOnlineState } from '@/util/imCommon';
import IMSDK, { GroupJoinSource } from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
export default {
    components: {
        CustomNavBar,
        MyAvatar
    },
    data() {
        return {
            currentApplication: {},
            onlineStr: this.$t('Offline'),
            isOnline: false,
            loadingState: {
                accept: false,
                refuse: false
            }
        };
    },
    computed: {
        isGroupApplication() {
            return this.currentApplication.groupID !== undefined;
        },
        getSourceID() {
            return (
                this.currentApplication.fromUserID ??
                this.currentApplication.userID
            );
        },
        getSourceName() {
            return (
                this.currentApplication.fromNickname ??
                this.currentApplication.nickname
            );
        },
        getSourceFaceURL() {
            return (
                this.currentApplication.fromFaceURL ??
                this.currentApplication.faceURL
            );
        }
    },
    onLoad(options) {
        const { application } = options;
        this.currentApplication = JSON.parse(application);
    },
    methods: {
        getOnlineState() {
            getDesignatedUserOnlineState(this.sourceID)
                .then(res => {
                    const { onlineStr, status } = res;
                    this.isOnline = status === 'online';
                    this.onlineStr = onlineStr;
                })
                .catch(() => (this.isOnline = false));
        },
        toSourceDetails() {
            uni.navigateTo({
                url: `/pages/common/userCard/index?sourceID=${this.getSourceID}`
            });
        },
        acceptAplication() {
            this.loadingState.accept = true;
            let func;
            if (this.isGroupApplication) {
                func = IMSDK.asyncApi(
                    IMSDK.IMMethods.AcceptGroupApplication,
                    IMSDK.uuid(),
                    {
                        groupID: this.currentApplication.groupID,
                        fromUserID: this.currentApplication.userID,
                        handleMsg: ''
                    }
                );
            } else {
                console.log(this.currentApplication);
                func = IMSDK.asyncApi(
                    IMSDK.IMMethods.AcceptFriendApplication,
                    IMSDK.uuid(),
                    {
                        toUserID: this.currentApplication.fromUserID,
                        handleMsg: ''
                    }
                );
            }
            func.then(() => {
                uni.$u.toast(this.$t('Operation_successful'));
                setTimeout(() => uni.navigateBack(), 500);
            })
                .catch(e => {
                    console.log(e);
                    uni.$u.toast(this.$t('Operation_failed'));
                })
                .finally(() => (this.loadingState.accept = false));
        },
        refuseAplication() {
            this.loadingState.refuse = true;
            let func;
            if (this.isGroupApplication) {
                func = IMSDK.asyncApi(
                    IMSDK.IMMethods.RefuseGroupApplication,
                    IMSDK.uuid(),
                    {
                        groupID: this.currentApplication.groupID,
                        fromUserID: this.currentApplication.userID,
                        handleMsg: ''
                    }
                );
            } else {
                func = IMSDK.asyncApi(
                    IMSDK.IMMethods.RefuseFriendApplication,
                    IMSDK.uuid(),
                    {
                        toUserID: this.currentApplication.fromUserID,
                        handleMsg: ''
                    }
                );
            }
            func.then(() => {
                uni.$u.toast(this.$t('Operation_successful'));
                setTimeout(() => uni.navigateBack(), 250);
            })
                .catch(() => uni.$u.toast(this.$t('Operation_failed')))
                .finally(() => (this.loadingState.refuse = false));
        }
    }
};
</script>

<style lang="scss" scoped>
.page_container {
    background-color: #f8f8f8;

    .application_item {
        padding: 72rpx 44rpx 24rpx;
        background-color: #fff;

        .base_info_row {
            @include btwBox();

            .base_info_left {
                @include vCenterBox();
            }

            .base_info_details {
                margin-left: 24rpx;

                .nickname {
                    @include nomalEllipsis();
                    max-width: 600rpx;
                }

                .online_state {
                    @include vCenterBox();
                    flex-direction: row;
                    font-size: 24rpx;
                    color: #999;
                    margin-top: 6rpx;

                    .dot {
                        background-color: #10cc64;
                        width: 12rpx;
                        height: 12rpx;
                        border-radius: 50%;
                        margin-right: 12rpx;
                    }
                }
            }
        }

        .request_message {
            background-color: #eee;
            margin-top: 48rpx;
            padding: 24rpx 36rpx;
            border-radius: 12rpx;
            font-size: 28rpx;
            color: #666;
            min-height: 240rpx;

            .title {
                margin-bottom: 12rpx;
                color: $uni-text-color;

                .group_name {
                    @nomalEllipsis();
                    max-width: 400rpx;
                    color: $uni-color-primary;
                    margin-left: 12rpx;
                }
            }
        }

        .join_source {
            margin-top: 20rpx;
            font-size: 24rpx;
            color: #666;
            text-align: right;
        }
    }

    .action_row {
        margin-top: 24rpx;

        .u-button {
            border: none;
        }

        &:last-child {
            .u-button {
                color: #999 !important;
            }
        }
    }
}
</style>

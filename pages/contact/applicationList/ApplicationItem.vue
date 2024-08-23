<template>
    <view class="application_item" @click="clickItem">
        <MyAvatar
            :src="getAvatarUrl"
            :is-group="isGroupApplication"
            :desc="application[isRecv ? 'fromNickname' : 'toNickname']"
            size="110rpx"
        />
        <view class="application_item_details">
            <view class="content">
                <text class="user_name">
                    {{ getShowName }}
                </text>

                <view v-if="isGroupApplication" class="title">
                    {{ $t('Apply_to_join') }}
                    <text class="group_name">
                        {{ application.groupName }}
                    </text>
                </view>
                <text class="req_message">
                    {{ application.reqMsg }}
                </text>
            </view>

            <view class="application_action">
                <text v-if="showStateStr" class="status_tip">
                    {{ getStateStr }}
                </text>
                <!-- <text
                    v-if="showGreet"
                    class="status_tip greet"
                    @tap.stop="greetToUser"
                >
                    打招呼
                </text> -->
                <button
                    v-if="showGreet"
                    type="primary"
                    class="access_btn"
                    :plain="true"
                    size="mini"
                    @tap.stop="greetToUser"
                >
                    {{ $t('Say_hello') }}
                </button>
                <button
                    v-if="showAccept"
                    :loading="accessLoading"
                    class="access_btn"
                    type="primary"
                    :plain="true"
                    size="mini"
                    @tap.stop="acceptApplication"
                >
                    {{ isGroupApplication ? $t('Agree1') : $t('Accept') }}
                </button>
            </view>

            <view class="bottom_line" />
        </view>
    </view>
</template>

<script>
import { navigateToDesignatedConversation } from '@/util/imCommon';
import IMSDK, { SessionType } from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';
export default {
    name: 'ApplicationItem',
    components: {
        MyAvatar
    },
    props: {
        application: Object,
        isRecv: Boolean
    },
    data() {
        return {
            accessLoading: false
        };
    },
    computed: {
        isGroupApplication() {
            return this.application.groupID !== undefined;
        },
        getShowName() {
            if (this.isRecv) {
                return this.application[
                    this.isGroupApplication ? 'nickname' : 'fromNickname'
                ];
            }
            return this.application[
                this.isGroupApplication ? 'groupName' : 'toNickname'
            ];
        },
        showGreet() {
            // 打招呼
            return (
                !this.isGroupApplication && this.application.handleResult === 1
            );
        },
        showAccept() {
            // 收到入群或好友请求，等待处理
            return this.application.handleResult === 0 && this.isRecv;
        },
        showStateStr() {
            // 其他
            if (this.showAccept || this.showGreet) {
                return false;
            }
            return true;
        },
        getStateStr() {
            if (this.application.handleResult === -1) {
                return this.$t('Rejected');
            }
            if (this.application.handleResult === 0) {
                return this.$t('Processing');
            }
            return this.$t('Agree2');
        },
        getAvatarUrl() {
            if (this.isGroupApplication) {
                return this.application.groupFaceURL;
            }
            return this.application[this.isRecv ? 'fromFaceURL' : 'toFaceURL'];
        }
    },
    methods: {
        clickItem() {
            if (this.showAccept) {
                uni.navigateTo({
                    url: `/pages/contact/applicationDetails/index?application=${JSON.stringify(
                        this.application
                    )}`
                });
            } else {
                let sourceID =
                    this.application.groupID ??
                    (this.isRecv
                        ? this.application.fromUserID
                        : this.application.toUserID);
                let cardType = this.isGroupApplication
                    ? 'groupCard'
                    : 'userCard';
                const url = `/pages/common/${cardType}/index?sourceID=${sourceID}`;
                uni.navigateTo({
                    url
                });
            }
        },
        acceptApplication() {
            this.accessLoading = true;
            let func;
            if (this.isGroupApplication) {
                func = IMSDK.asyncApi(
                    IMSDK.IMMethods.AcceptGroupApplication,
                    IMSDK.uuid(),
                    {
                        groupID: this.application.groupID,
                        fromUserID: this.application.userID,
                        handleMsg: ''
                    }
                );
            } else {
                func = IMSDK.asyncApi(
                    IMSDK.IMMethods.AcceptFriendApplication,
                    IMSDK.uuid(),
                    {
                        toUserID: this.application.fromUserID,
                        handleMsg: ''
                    }
                );
            }
            func.then(() => uni.$u.toast(this.$t('Operation_successful')))
                .catch(() => uni.$u.toast(this.$t('Operation_failed')))
                .finally(() => (this.accessLoading = false));
        },
        greetToUser() {
            navigateToDesignatedConversation(
                this.application[this.isRecv ? 'fromUserID' : 'toUserID'],
                SessionType.Single
            ).catch(() =>
                uni.$u.toast(this.$t('Failed_to_get_session_information'))
            );
        }
    }
};
</script>

<style lang="scss" scoped>
.application_item {
    height: 150rpx;
    display: flex;
    justify-content: flex-start;
    padding: 20rpx;
    color: $uni-text-color;
    background-color: #fff;

    /deep/.u-avatar {
        border-radius: 30rpx;
        overflow: hidden;
    }

    &_details {
        @include vCenterBox();
        margin-left: 24rpx;
        width: 100%;
        position: relative;

        .content {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            font-size: 24rpx;
            width: 100%;

            .user_name {
                @include nomalEllipsis();
                max-width: 400rpx;
                font-size: 32rpx;
                color: $uni-text-color;
                font-family: MiSans-Medium;
            }

            .title {
                // margin-top: 10rpx;

                .group_name {
                    margin-left: 12rpx;
                    color: $uni-color-primary;
                }
            }

            .req_message {
                // margin-top: 10rpx;
                @include ellipsisWithLine(2);
                max-width: 80%;
                color: $uni-text-color-grey;
            }
        }

        .application_action {
            position: absolute;
            right: 0;

            .status_tip {
                font-size: 28rpx;
                color: #666;
            }

            .access_btn {
                padding: 0 12rpx;
                height: 48rpx;
                line-height: 48rpx;
            }
        }

        .bottom_line {
            height: 1px;
            width: 100%;
            background-color: #f0f0f0;
            position: absolute;
            bottom: -24rpx;
        }
    }
}

.u-list-item:last-child {
    .bottom_line {
        height: 0;
    }
}
</style>

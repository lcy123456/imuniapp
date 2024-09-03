<template>
    <Page>
        <view class="request_join_container">
            <custom-nav-bar
                :title="
                    isGroup
                        ? $t('Group_chat_verification')
                        : $t('Friend_verification')
                "
            >
                <view slot="more" class="top_right_btn">
                    <u-button
                        :text="$t('Send')"
                        type="primary"
                        @click="sendRequest"
                    />
                </view>
            </custom-nav-bar>

            <text class="title">
                {{
                    `${
                        isGroup
                            ? $t('Send_group_application')
                            : $t('Send_friend_application')
                    }`
                }}
            </text>

            <view class="input_container">
                <u--textarea
                    v-model="reason"
                    height="120"
                    border="none"
                    :placeholder="$t('Please_enter_content')"
                    maxlength="200"
                    count
                />
            </view>
        </view>
    </Page>
</template>

<script>
import IMSDK, { GroupJoinSource } from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import { navigateToDesignatedConversation } from '@/util/imCommon';

export default {
    components: {
        CustomNavBar
    },
    data() {
        return {
            reason: '',
            sourceID: '',
            isGroup: false,
            isScan: false,
            notNeedVerification: false,
            sessionType: 0
        };
    },
    onLoad(options) {
        const { isGroup, sourceID, isScan, notNeedVerification, sessionType } =
            options;
        this.isGroup = JSON.parse(isGroup);
        this.isScan = JSON.parse(isScan);
        this.sourceID = sourceID;
        this.notNeedVerification = JSON.parse(notNeedVerification);
        this.sessionType = sessionType ?? 0;
    },
    methods: {
        sendRequest() {
            let func;
            if (this.isGroup) {
                const joinSource = this.isScan
                    ? GroupJoinSource.QrCode
                    : GroupJoinSource.Search;
                const opid = IMSDK.uuid();
                console.log(opid);
                func = IMSDK.asyncApi(IMSDK.IMMethods.JoinGroup, opid, {
                    groupID: this.sourceID,
                    reqMsg: this.reason,
                    joinSource: 3
                });
            } else {
                func = IMSDK.asyncApi(IMSDK.IMMethods.AddFriend, IMSDK.uuid(), {
                    toUserID: this.sourceID,
                    reqMsg: this.reason
                });
            }
            func.then(() => {
                uni.$u.toast(
                    this.notNeedVerification
                        ? this.$t('You_have_joined_the_group')
                        : this.$t('Send_successfully')
                );
                setTimeout(() => {
                    if (this.notNeedVerification) {
                        navigateToDesignatedConversation(
                            this.sourceID,
                            Number(this.sessionType)
                        ).catch(() =>
                            this.showToast(
                                this.$t('Failed_to_get_session_information')
                            )
                        );
                    } else {
                        uni.navigateBack();
                    }
                }, 1000);
            }).catch(err => {
                console.log(err);
                uni.$u.toast(this.$t('Send_failed'));
            });
        },
        showToast(message) {
            this.$refs.uToast.show({
                message
            });
        }
    }
};
</script>

<style lang="scss">
.request_join_container {
    @include colBox(false);
    height: 100vh;
    background-color: #f6f6f6;

    .top_right_btn {
        margin-right: 44rpx;

        .u-button {
            height: 48rpx;
        }
    }

    .title {
        font-size: 28rpx;
        color: #999;
        margin: 24rpx 44rpx;
    }

    .input_container {
        /deep/.u-textarea {
            padding: 24rpx 44rpx !important;
        }
    }
}
</style>

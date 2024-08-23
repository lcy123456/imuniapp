<template>
    <Page>
        <view class="group_settings_container" @click="closeAll">
            <CustomNavBar title="" is-bg-color2 />
            <view class="base_info">
                <MyAvatar
                    :src="currentGroup.faceURL"
                    :is-group="true"
                    size="190rpx"
                    @click="updateAvatar"
                />
                <view class="flex mt-30 flex-center align-center">
                    <text class="nickname">
                        {{ currentGroup.groupName }}
                    </text>
                    <image
                        class="w-24 ml-20 h-28"
                        src="/static/images/group_setting_edit.png"
                        @click="editGroupName"
                    />
                </view>
                <view class="id_row">
                    ID：<text>{{ currentGroup.groupID }}</text>
                    <image
                        class="w-32 h-32 ml-20"
                        src="/static/images/profile_copy.png"
                        @click="copyGroupID"
                    />
                </view>
            </view>
            <view class="flex mb-30">
                <SettingItem
                    class="flex-grow"
                    :title="$t('Find_userchat_history')"
                    show-arrow
                    @click="handleRecord"
                />
                <view
                    class="flex justify-center more-box w-210 ml-30 bg-color br-30 flex-column align-center"
                    @click.stop="showMore"
                >
                    <image
                        class="h-10 my-20 w-42"
                        src="/static/images/common_more_active.png"
                    />
                    <text class="fz-26">{{ $t('More') }}</text>
                    <more-feat
                        ref="moreFeat"
                        :options="[
                            {
                                icon: '/static/images/group_out.png',
                                text: isOwner
                                    ? $t('Disband_group_chat')
                                    : $t('Exit_group_chat'),
                                style: {
                                    color: '#EC4B37'
                                },
                                id: 1
                            }
                        ]"
                        :source-i-d="currentGroup.groupID"
                        :session-type="3"
                        @callBack="callBack"
                    />
                </view>
            </view>
            <view class="member_row_box">
                <view class="member_title">
                    <view class="member_desc" @click="inviteMember">
                        <image
                            src="/static/images/contact_add_search_user.svg"
                            class="w-44 h-44"
                        />
                        <text class="ml-20 primary">{{
                            $t('Invite_new_member')
                        }}</text>
                    </view>
                    <text class="text-grey">
                        {{
                            $t('{value}_members').replace(
                                '{value}',
                                currentGroup.memberCount
                            )
                        }}
                    </text>
                </view>
                <GroupMemberSwipe
                    :is-owner="isOwner"
                    :is-admin="isAdmin"
                    :list="groupMemberList"
                    :group-i-d="currentGroup.groupID"
                    @change="handleMemberChange"
                />
            </view>
            <!-- <view class="mt-30">
            <u-button
                type="error"
                plain
                size="large"
                :text="isOwner ? '解散群聊' : '退出群聊'"
                @click="() => (confirmType = isOwner ? 'Dismiss' : 'Quit')"
            />
            <u-modal
                :title="isOwner ? '解散群聊' : '退出群聊'"
                :content="getConfirmContent"
                :confirm-text="$t('Sure')"
                :cancel-text="$t('Cancel')"
                async-close
                :show="confirmType !== null"
                show-cancel-button
                @confirm="confirm"
                @cancel="() => (confirmType = null)"
            />
        </view> -->
        </view>
    </Page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import IMSDK, {
    GroupMemberRole,
    GroupMemberFilter,
    IMMethods
} from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import GroupMemberSwipe from './components/GroupMemberSwipe.vue';
import SettingItem from '@/components/SettingItem/index.vue';
import MoreFeat from '@/pages/common/moreFeat/index.vue';
import { checkLoginError } from '@/util/common';
import { chooseImage } from '@/util/unisdk';
import { uploadFile } from '@/util/imCommon';
import { CustomMarkType, RecordFormMap, ContactChooseTypes } from '@/constant';

const ConfirmTypes = {
    Dismiss: 'Dismiss',
    Quit: 'Quit'
};

export default {
    components: {
        CustomNavBar,
        MyAvatar,
        SettingItem,
        GroupMemberSwipe,
        MoreFeat
    },
    props: {},
    data() {
        return {
            groupMemberList: [],
            confirmType: null,
            sourceID: ''
        };
    },
    computed: {
        ...mapGetters({
            conversation: 'storeCurrentConversation',
            memberInGroup: 'storeCurrentMemberInGroup',
            currentGroup: 'storeCurrentGroup'
        }),
        getConfirmContent() {
            if (this.confirmType === ConfirmTypes.Quit) {
                return this.$t(
                    'Are_you_sure_you_want_to_exit_the_current_group_chat'
                );
            }
            if (this.confirmType === ConfirmTypes.Dismiss) {
                return this.$t(
                    'Are_you_sure_you_want_to_disband_the_current_group_chat'
                );
            }
            return '';
        },
        isOwner() {
            return this.memberInGroup.roleLevel === GroupMemberRole.Owner;
        },
        isAdmin() {
            return this.memberInGroup.roleLevel === GroupMemberRole.Admin;
        }
    },
    mounted() {
        this.getGroupMemberList();
    },
    methods: {
        ...mapActions('conversation', ['getCurrentGroup']),
        closeAll() {
            this.$refs.moreFeat.setMoreIndex(0);
        },
        async updateAvatar() {
            const permissions = await this.$store.dispatch(
                'base/hasCameraPermissions'
            );
            if (!permissions) return;
            const paths = await chooseImage();
            const url = await uploadFile(paths[0]);
            this.updateGroupInfo({ faceURL: url });
        },
        async updateGroupInfo(data) {
            try {
                await IMSDK.asyncApi(IMMethods.SetGroupInfo, IMSDK.uuid(), {
                    groupID: this.currentGroup.groupID,
                    ...data
                });
                this.$toast(this.$t('Change_successfully'));
                this.getCurrentGroup(this.currentGroup.groupID);
            } catch (err) {
                console.log(err);
                this.$toast(checkLoginError(err));
            }
        },
        callBack(item) {
            if (item.id === 1) {
                this.confirmType = this.isOwner ? 'Dismiss' : 'Quit';
                this.confirm();
            }
        },
        showMore() {
            let moreIndex = this.$refs.moreFeat.moreIndex === 1 ? 0 : 1;
            this.$refs.moreFeat.setMoreIndex(moreIndex);
        },
        editGroupName() {
            uni.$u.route('/pages/common/markOrIDPage/index', {
                type: CustomMarkType.GroupName,
                sourceInfo: JSON.stringify(this.currentGroup)
            });
        },
        copyGroupID() {
            uni.setClipboardData({
                data: this.currentGroup.groupID,
                success: () => {
                    uni.$u.toast(this.$t('Copy_successfully'));
                }
            });
        },
        async handleRecord() {
            uni.$u.route('/pages/common/searchRecord/recordDetail/index', {
                conversation: encodeURIComponent(
                    JSON.stringify(this.conversation)
                ),
                from: RecordFormMap.Group,
                groupID: this.currentGroup.groupID
            });
        },
        getGroupMemberList() {
            IMSDK.asyncApi(IMSDK.IMMethods.GetGroupMemberList, IMSDK.uuid(), {
                groupID: this.currentGroup.groupID,
                filter: GroupMemberFilter.All,
                offset: 0,
                count: 999
            })
                .then(({ data }) => {
                    this.groupMemberList = [...data];
                })
                .catch(err => {
                    console.log(err);
                    this.$toast(checkLoginError(err));
                });
        },
        inviteMember() {
            uni.$u.route('/pages/common/contactChoose/index', {
                type: ContactChooseTypes.Invite,
                groupID: this.currentGroup.groupID
            });
        },
        async getCheckUsers(data) {
            try {
                await IMSDK.asyncApi(
                    IMSDK.IMMethods.InviteUserToGroup,
                    IMSDK.uuid(),
                    {
                        groupID: this.currentGroup.groupID,
                        reason: '',
                        userIDList: data.map(user => user.userID)
                    }
                );
                this.$toast(this.$t('Operation_successful'));
                this.getGroupMemberList();
                this.getCurrentGroup(this.currentGroup.groupID);
            } catch (err) {
                this.$toast(checkLoginError(err));
            }
        },
        handleMemberChange() {
            this.getGroupMemberList();
            this.getCurrentGroup(this.currentGroup.groupID);
        },
        confirm() {
            let funcName = '';
            let sourceID = this.currentGroup.groupID;
            this.sourceID = sourceID;
            if (this.confirmType === ConfirmTypes.Quit) {
                funcName = IMSDK.IMMethods.QuitGroup;
            }
            if (this.confirmType === ConfirmTypes.Dismiss) {
                funcName = IMSDK.IMMethods.DismissGroup;
            }
            IMSDK.asyncApi(funcName, IMSDK.uuid(), sourceID)
                .then(() => {
                    uni.$u.toast(this.$t('Operation_successful'));
                    if (this.confirmType === ConfirmTypes.Clear) {
                        this.$store.commit(
                            'message/SET_HISTORY_MESSAGE_LIST',
                            []
                        );
                    } else {
                        setTimeout(
                            () =>
                                uni.switchTab({
                                    url: '/pages/conversation/conversationList/index'
                                }),
                            250
                        );
                    }
                })
                .catch(() => uni.$u.toast(this.$t('Operation_failed')))
                .finally(() => (this.confirmType = null));
        }
    }
};
</script>

<style lang="scss" scoped>
.group_settings_container {
    height: 100vh;
    background-color: $uni-bg-color-grey;
    padding: 0 40rpx 40rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .more-box {
        position: relative;
    }
    .base_info {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 20rpx 0 50rpx;
        position: relative;

        .u-avatar {
            border-radius: 60rpx;
            overflow: hidden;
        }

        .nickname {
            display: block;
            // @include nomalEllipsis();
            max-width: 400rpx;
            font-size: 50rpx;
            word-wrap: break-word;
        }

        .id_row {
            @include vCenterBox();
            font-size: 36rpx;
            color: $uni-text-color-grey;
        }
    }

    .member_row_box {
        @include colBox(false);
        background-color: $uni-bg-color;
        border-radius: 30rpx;
        overflow: hidden;

        .member_title {
            @include btwBox();
            padding: 30rpx 20rpx;

            .member_desc {
                @include vCenterBox();
            }
        }
    }

    .u-button {
        border: 0;
        border-radius: 30rpx;
    }
}
</style>

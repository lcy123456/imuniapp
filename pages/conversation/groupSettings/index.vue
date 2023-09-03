<template>
    <view class="group_settings_container">
        <CustomNavBar
            title=""
            is-bg-color2
        />
        <view class="base_info">
            <MyAvatar
                :src="currentGroup.faceURL"
                :is-group="true"
                size="190rpx"
                @click="updateAvatar"
            />
            <view class="mt-30">
                <text class="nickname">
                    {{ currentGroup.groupName }}
                </text>
                <image
                    class="w-24 h-28 ml-20"
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
        <GroupMemberRow
            :is-owner="isOwner"
            :is-admin="isAdmin"
            :group-i-d="currentGroup.groupID"
            :member-count="currentGroup.memberCount"
            :list="groupMemberList"
            @kick="handleKick"
        />
        <view class="mt-30">
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
                async-close
                :show="confirmType !== null"
                show-cancel-button
                @confirm="confirm"
                @cancel="() => (confirmType = null)"
            />
            <u-modal
                title="删除成员"
                :content="`确定删除成员${kickModal.member.nickname}吗？`"
                async-close
                :show="kickModal.show"
                show-cancel-button
                @confirm="kickConfirm"
                @cancel="() => (kickModal.show = false)"
            />
        </view>
    </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import IMSDK, { GroupMemberRole, GroupMemberFilter, IMMethods } from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import GroupMemberRow from './components/GroupMemberRow.vue';
import { checkLoginError } from '@/util/common';
import { chooseImage } from '@/util/unisdk';
import { uploadFile } from '@/util/imCommon';
import { CustomMarkType } from '@/constant';

const ConfirmTypes = {
    Dismiss: 'Dismiss',
    Quit: 'Quit',
};

export default {
    components: {
        CustomNavBar,
        MyAvatar,
        GroupMemberRow,
    },
    props: {},
    data () {
        return {
            groupMemberList: [],
            kickModal: {
                member: {},
                content: '',
                show: false
            },
            confirmType: null,
        };
    },
    computed: {
        ...mapGetters({
            conversation: 'storeCurrentConversation',
            memberInGroup: 'storeCurrentMemberInGroup',
            currentGroup: 'storeCurrentGroup',
        }),
        getConfirmContent () {
            if (this.confirmType === ConfirmTypes.Quit) {
                return '确定要退出当前群聊吗？';
            }
            if (this.confirmType === ConfirmTypes.Dismiss) {
                return '确定要解散当前群聊吗？';
            }
            return '';
        },
        isOwner () {
            return this.memberInGroup.roleLevel === GroupMemberRole.Owner;
        },
        isAdmin () {
            return this.memberInGroup.roleLevel === GroupMemberRole.Admin;
        },
    },
    mounted () {
        this.getGroupMemberList();
    },
    methods: {
        ...mapActions('conversation', ['getCurrentGroup']),
        async updateAvatar () {
            const paths = await chooseImage();
            const url = await uploadFile(paths[0]);
            this.updateGroupInfo({ faceURL: url, });
        },
        async updateGroupInfo (data) {
            try {
                await IMSDK.asyncApi(IMMethods.SetGroupInfo, IMSDK.uuid(), {
                    groupID: this.currentGroup.groupID,
                    ...data
                });
                this.$toast('修改成功');
                this.getCurrentGroup(this.currentGroup.groupID);
            } catch (err) {
                console.log(err);
                this.$toast(checkLoginError(err));
            }
        },
        editGroupName () {
            uni.$u.route('/pages/common/markOrIDPage/index', {
                type: CustomMarkType.GroupName,
                sourceInfo: JSON.stringify(this.currentGroup)
            });
        },
        copyGroupID () {
            uni.setClipboardData({
                data: this.currentGroup.groupID,
                success: () => {
                    uni.$u.toast('复制成功');
                },
            });
        },
        getGroupMemberList () {
            IMSDK.asyncApi(IMSDK.IMMethods.GetGroupMemberList, IMSDK.uuid(), {
                groupID: this.currentGroup.groupID,
                filter: GroupMemberFilter.All,
                offset: 0,
                count: 999,
            }).then(({ data }) => {
                this.groupMemberList = [...data];
            }).catch((err) => {
                console.log(err);
                this.$toast(checkLoginError(err));
            });
        },
        async getCheckUsers (data) {
            try {
                await IMSDK.asyncApi(IMSDK.IMMethods.InviteUserToGroup, IMSDK.uuid(), {
                    groupID: this.currentGroup.groupID,
                    reason: '',
                    userIDList: data.map((user) => user.userID),
                });
                this.$toast('操作成功');
                this.getGroupMemberList();
                this.getCurrentGroup(this.currentGroup.groupID);
            } catch (err) {
                this.$toast(checkLoginError(err));
            }
        },
        handleKick (member) {
            this.kickModal.member = member;
            this.kickModal.show = true;
        },
        async kickConfirm () {
            const {member} = this.kickModal;
            try {
                await IMSDK.asyncApi(IMSDK.IMMethods.KickGroupMember, IMSDK.uuid(), {
                    groupID: this.currentGroup.groupID,
                    reason: "",
                    userIDList: [member.userID],
                });
                this.$toast('操作成功');
                this.getGroupMemberList();
                this.getCurrentGroup(this.currentGroup.groupID);
            } catch (err) {
                this.$toast(checkLoginError(err));
            }
            this.kickModal.show = false;
        },
        confirm () {
            let funcName = '';
            let sourceID = this.currentGroup.groupID;
            if (this.confirmType === ConfirmTypes.Quit) {
                funcName = IMSDK.IMMethods.QuitGroup;
            }
            if (this.confirmType === ConfirmTypes.Dismiss) {
                funcName = IMSDK.IMMethods.DismissGroup;
            }
            IMSDK.asyncApi(funcName, IMSDK.uuid(), sourceID)
                .then(() => {
                    uni.$u.toast('操作成功');
                    if (this.confirmType === ConfirmTypes.Clear) {
                        this.$store.commit(
                            'message/SET_HISTORY_MESSAGE_LIST',
                            []
                        );
                    } else {
                        setTimeout(
                            () =>
                                uni.switchTab({
                                    url: '/pages/conversation/conversationList/index',
                                }),
                            250
                        );
                    }
                })
                .catch(() => uni.$u.toast('操作失败'))
                .finally(() => (this.confirmType = null));
        },
    },
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
            font-size: 50rpx;
        }

        .id_row {
            @include vCenterBox();
            font-size: 36rpx;
            color: $uni-text-color-grey;
        }
    }

    .u-button {
        border: 0;
        border-radius: 30rpx;
    }
}
</style>

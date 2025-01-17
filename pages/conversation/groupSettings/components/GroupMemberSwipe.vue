<template>
    <u-swipe-action ref="swipeActionRef" class="member_list">
        <u-swipe-action-item
            v-for="v in list"
            :key="v.userID"
            :options="getSwipOptions(v)"
            :disabled="getDisabled(v)"
            @click="swipeClick($event, v)"
        >
            <UserItem :item="v" light-self @itemClick="userClick" />
        </u-swipe-action-item>
        <view>
            <u-modal
                title="删除成员"
                :content="`确定删除成员${curMember.nickname}吗？`"
                async-close
                :show="kickModal.show"
                show-cancel-button
                @confirm="kickConfirm"
                @cancel="() => (kickModal.show = false)"
            />
        </view>
    </u-swipe-action>
</template>

<script>
import { mapGetters } from 'vuex';
import UserItem from '@/components/UserItem/index.vue';
import IMSDK, { IMMethods, GroupMemberRole } from 'openim-uniapp-polyfill';
import { checkLoginError } from '@/util/common';

export default {
    name: '',
    components: {
        UserItem
    },
    props: {
        list: {
            type: Array,
            default: () => []
        },
        groupID: {
            type: String,
            default: ''
        },
        isOwner: {
            type: Boolean,
            default: false
        },
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            kickModal: {
                content: '',
                show: false
            },
            curMember: {}
        };
    },
    computed: {
        ...mapGetters(['storeCurrentUserID']),
        isNormal() {
            return !this.isOwner && !this.isAdmin;
        }
    },
    methods: {
        getDisabled(v) {
            if (v.roleLevel === GroupMemberRole.Owner) {
                return true;
            } else if (GroupMemberRole.Admin === v.roleLevel && this.isAdmin) {
                return true;
            } else if (this.isNormal) {
                return true;
            }
            return false;
        },
        getSwipOptions(v) {
            const swipeOptions = [
                {
                    text: '设置管理员',
                    style: {
                        backgroundColor: '#37abec'
                    }
                },
                {
                    text: '删除',
                    style: {
                        backgroundColor: '#ec4b37'
                    }
                }
            ];
            if (this.isOwner) {
                swipeOptions[0].text = `${
                    GroupMemberRole.Admin === v.roleLevel ? '取消' : '设置'
                }管理员`;
            } else if (this.isAdmin) {
                swipeOptions.shift();
            }
            return swipeOptions;
        },
        swipeClick({ index }, v) {
            this.curMember = v;
            let temp = index;
            if (!this.isOwner) temp += 1;
            switch (temp) {
                case 0:
                    this.handleAdmin();
                    break;
                case 1:
                    this.kickModal.show = true;
                    break;
            }

            this.$refs.swipeActionRef.closeAll();
        },
        userClick(member) {
            const sourceInfo = {
                nickname: member.nickname,
                faceURL: member.faceURL
            };
            let url = `/pages/common/userCard/index?sourceInfo=${JSON.stringify(
                sourceInfo
            )}`;
            if (this.storeCurrentUserID === member.userID) {
                url = '/pages/profile/selfInfo/index';
            }
            uni.$u.route(url, {
                sourceID: member.userID
            });
        },
        async kickConfirm() {
            try {
                await IMSDK.asyncApi(IMMethods.KickGroupMember, IMSDK.uuid(), {
                    groupID: this.groupID,
                    reason: '',
                    userIDList: [this.curMember.userID]
                });
                this.$toast('操作成功');
                this.$emit('change');
            } catch (err) {
                this.$toast(checkLoginError(err));
            }
            this.kickModal.show = false;
        },
        async handleAdmin() {
            const v = this.curMember;
            try {
                await IMSDK.asyncApi(
                    IMMethods.SetGroupMemberRoleLevel,
                    IMSDK.uuid(),
                    {
                        groupID: this.groupID,
                        userID: v.userID,
                        roleLevel:
                            GroupMemberRole.Admin === v.roleLevel
                                ? GroupMemberRole.Nomal
                                : GroupMemberRole.Admin
                    }
                );
                this.$toast('操作成功');
                this.$emit('change');
            } catch (err) {
                this.$toast(checkLoginError(err));
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.member_list {
    flex: 1;
    overflow-y: auto;
}
</style>

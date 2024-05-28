<template>
    <Page>
        <view class="create_group_container">
            <CustomNavBar :title="navbarTitle" is-bg-color2 />

            <view class="group_base_info">
                <image
                    v-if="isArchive"
                    class="w-124 h-124"
                    style="border-radius: 100%"
                    src="/static/images/archive_active.svg"
                ></image>
                <MyAvatar
                    v-else
                    :is-group="true"
                    :src="groupFaceUrl"
                    size="62"
                    @click="chooseImage"
                />
                <u--input
                    v-model="groupName"
                    :placeholder="`取个${isArchive ? '组' : '群'}名`"
                    border="none"
                />
            </view>

            <!-- <view
            class="member_row"
            @click="toChooseMember"
        >
            <view class="desc_title">
                <text>群成员</text>
                <text>{{ `${checkedMemberList.length}人` }}</text>
            </view>
            <view class="member_list">
                <view
                    v-for="member in checkedMemberList.slice(0, 20)"
                    :key="member.userID"
                    class="member_item"
                >
                    <MyAvatar
                        :src="member.faceURL"
                        :desc="member.nickname"
                        size="42"
                    />
                    <text class="member_name">
                        {{ member.nickname }}
                    </text>
                </view>
            </view>
        </view> -->

            <view class="my-30">
                <u-button
                    :loading="createLoading"
                    :disabled="disabledNext"
                    type="primary"
                    text="下一步"
                    shape="circle"
                    size="large"
                    @click="toChooseMember"
                />
            </view>
            <u-toast ref="uToast" />
        </view>
    </Page>
</template>

<script>
import { ContactChooseTypes } from '@/constant';
import IMSDK, {
    GroupType,
    IMMethods,
    SessionType
} from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import { navigateToDesignatedConversation } from '@/util/imCommon';
import { getPurePath } from '@/util/common';
import {
    apiConversationFolderCreate,
    apiConversationFolderUpdate,
    setConversations
} from '@/api/conversation';
import { mapActions, mapGetters } from 'vuex';

export default {
    components: {
        CustomNavBar,
        MyAvatar
    },
    data() {
        return {
            type: '',
            params: {},
            groupName: '',
            groupFaceUrl: '',
            oldMemberList: [],
            checkedMemberList: [],
            fileList: [],
            createLoading: false
        };
    },
    computed: {
        ...mapGetters(['storeConversationList', 'storeCurrentUserID']),
        disabledNext() {
            return !this.groupName;
        },
        checkedIDList() {
            return this.checkedMemberList.map(v => v.userID);
        },
        isArchive() {
            return [
                ContactChooseTypes.Archive,
                ContactChooseTypes.EditArchive
            ].includes(this.type);
        },
        navbarTitle() {
            switch (this.type) {
                case ContactChooseTypes.Archive:
                    return '创建分组';
                    break;
                case ContactChooseTypes.EditArchive:
                    return '编辑分组';
                    break;
            }
            return '发起群聊';
        }
    },
    onLoad(options) {
        const { checkedMemberList, type, params } = options;
        this.oldMemberList = this.checkedMemberList = checkedMemberList
            ? JSON.parse(checkedMemberList)
            : [];
        this.type = type;
        this.params = JSON.parse(params || '{}');
        this.groupName = this.params.groupName || '';
    },
    methods: {
        ...mapActions('conversation', ['updateConversationFolder']),
        toChooseMember() {
            uni.$u.route('/pages/common/contactChoose/index', {
                type: this.type || ContactChooseTypes.GetList,
                checkUserIDList: JSON.stringify(this.checkedIDList)
            });
        },
        async complateCreate() {
            this.createLoading = true;
            if (this.type === ContactChooseTypes.Archive) {
                await this.handleArchive();
            } else if (this.type === ContactChooseTypes.EditArchive) {
                await this.handleArchive(true);
            } else {
                await this.handleCreateGroup();
            }

            this.createLoading = false;
        },
        async handleCreateGroup() {
            const options = {
                adminUserIDs: [],
                memberUserIDs: this.checkedIDList,
                groupInfo: {
                    groupType: GroupType.WorkingGroup,
                    groupName: this.groupName,
                    faceURL: this.groupFaceUrl
                }
            };
            try {
                const { data } = await IMSDK.asyncApi(
                    IMSDK.IMMethods.CreateGroup,
                    IMSDK.uuid(),
                    options
                );
                this.$toast('创建成功');
                await navigateToDesignatedConversation(
                    data.groupID,
                    SessionType.WorkingGroup,
                    true
                );
            } catch (err) {
                this.$toast('创建失败');
            }
        },
        async handleArchive(isUpdate = false) {
            try {
                // 文件夹
                let folderItem;
                if (isUpdate) {
                    const params = {
                        ...this.params,
                        name: this.groupName
                    };
                    await apiConversationFolderUpdate(params);
                    folderItem = params;
                } else {
                    const res = await apiConversationFolderCreate({
                        name: this.groupName
                    });
                    folderItem = res;
                }
                this.updateConversationFolder(folderItem);
                // 分组
                const ids = this.checkedMemberList.map(
                    v => v.conversationID || v.groupID || v.userID || ''
                );
                let newConversationList = this.storeConversationList.filter(v =>
                    ids.find(j => v.conversationID.includes(j))
                );
                let notConversationList = [];
                if (isUpdate) {
                    const oldIds = this.oldMemberList.map(v => v.userID);
                    const archiveList = this.storeConversationList.filter(v =>
                        oldIds.find(j => v.conversationID.includes(j))
                    );
                    const archiveIds = archiveList.map(v => v.conversationID);
                    newConversationList = newConversationList.filter(
                        v => !archiveIds.includes(v.conversationID)
                    );
                    notConversationList = archiveList.filter(
                        v => !ids.find(j => v.conversationID.includes(j))
                    );
                }
                // console.log("xxx", newConversationList, notConversationList);
                newConversationList.length > 0 &&
                    (await this.handleSetConversition(
                        folderItem.id,
                        newConversationList
                    ));
                notConversationList.length > 0 &&
                    (await this.handleSetConversition(-1, notConversationList));
                this.$toast('设置分组成功');
                setTimeout(() => {
                    uni.navigateBack({
                        delta: isUpdate ? 1 : 2
                    });
                }, 1000);
            } catch (err) {
                console.log(err);
                this.$toast('设置分组失败');
            } finally {
            }
        },
        async handleSetConversition(archive_id, conversations) {
            const promiseArr = conversations.map(conversation => {
                const tempAttachedInfo = JSON.parse(
                    conversation.attachedInfo || '{}'
                );
                return setConversations({
                    userIDs: [this.storeCurrentUserID],
                    conversation: {
                        conversationID: conversation.conversationID,
                        conversationType: conversation.conversationType,
                        groupID: conversation.groupID,
                        attachedInfo: JSON.stringify({
                            ...tempAttachedInfo,
                            archive_id
                        })
                    }
                });
            });
            await Promise.all(promiseArr);
        },
        getCheckUsers(list) {
            this.checkedMemberList = [...list];
            setTimeout(this.complateCreate, 500);
        },
        async chooseImage() {
            const permissions = await this.$store.dispatch(
                'base/hasCameraPermissions'
            );
            if (!permissions) return;
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                success: async ({ tempFilePaths }) => {
                    const path = tempFilePaths[0];
                    const nameIdx = path.lastIndexOf('/') + 1;
                    const typeIdx = path.lastIndexOf('.') + 1;
                    const fileName = path.slice(nameIdx);
                    const fileType = `image/${path.slice(typeIdx)}`;

                    try {
                        const {
                            data: { url }
                        } = await IMSDK.asyncApi(
                            IMMethods.UploadFile,
                            IMSDK.uuid(),
                            {
                                filepath: getPurePath(tempFilePaths[0]),
                                name: fileName,
                                contentType: `image/${fileType}`,
                                uuid: IMSDK.uuid()
                            }
                        );
                        this.groupFaceUrl = url;
                    } catch (error) {
                        this.showToast('上传失败');
                    }
                },
                fail: function () {
                    this.showToast('上传失败');
                }
            });
        },
        showToast(message, complete = null) {
            this.$refs.uToast.show({
                message,
                duration: 1000,
                complete
            });
        }
    }
};
</script>

<style lang="scss">
.create_group_container {
    height: 100vh;
    background-color: $uni-bg-color-grey;
    padding: 0 20rpx;
    display: flex;
    flex-direction: column;

    .group_base_info {
        height: 176rpx;
        @include vCenterBox();
        background-color: $uni-bg-color;
        margin: 10rpx 0 120rpx;
        padding: 0 44rpx;
        border-radius: 20rpx;

        /deep/.u-avatar {
            border-radius: 50%;
            overflow: hidden;
        }

        .u-input {
            margin-left: 56rpx;
        }
    }

    .member_row {
        flex: 1;
        padding: 40rpx;
        border-radius: 20rpx;
        background-color: #fff;
        color: $uni-text-color-grey;

        .desc_title {
            @include vCenterBox();
            justify-content: space-between;
        }

        .member_list {
            display: flex;
            flex-wrap: wrap;
            margin-top: 30rpx;

            .member_item {
                @include colBox(false);
                align-items: center;
                margin: 0 20rpx 20rpx 0;

                .member_name {
                    @include nomalEllipsis();
                    max-width: 42px;
                    margin-top: 12rpx;
                }
            }
        }
    }
}
</style>

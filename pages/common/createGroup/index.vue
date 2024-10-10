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
                    :placeholder="$t('Give_a_group_name')"
                    border="none"
                />
            </view>

            <!-- <view
            class="member_row"
            @click="toChooseMember"
        >
            <view class="desc_title">
                <text>群成员</text>
                <text>{{ `${checkedMemberList.length}${$t('People')}` }}</text>
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
                    v-if="isArchive"
                    :disabled="disabledNext"
                    type="primary"
                    :text="archiveBtnText"
                    shape="circle"
                    size="large"
                    class="mb-40"
                    @click="complateCreate"
                />
                <u-button
                    :disabled="disabledNext"
                    type="primary"
                    :text="isArchive ? $t('Add_friends') : $t('Next')"
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
            checkedConversation: [],
            fileList: []
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
                    return this.$t('Create_a_group');
                case ContactChooseTypes.EditArchive:
                    return this.$t('Edit_group');
            }
            return this.$t('Start_a_group_chat');
        },
        archiveBtnText() {
            switch (this.type) {
                case ContactChooseTypes.Archive:
                    return this.$t('Create_a_group');
                case ContactChooseTypes.EditArchive:
                    return this.$t('Complete');
            }
            return '';
        }
    },
    onLoad(options) {
        const { checkedMemberList, type, params, checkedConversation } =
            options;

        this.type = type;
        this.params = JSON.parse(params || '{}');
        this.groupName = this.params.groupName || '';
        if (checkedConversation) {
            this.checkedConversation = JSON.parse(
                decodeURIComponent(checkedConversation)
            );
            this.checkedMemberList = this.checkedConversation
                .filter(v => v.userID)
                .map(v => ({
                    userID: v.userID,
                    faceURL: v.faceURL,
                    nickname: v.nickname
                }));
        } else {
            this.checkedMemberList = JSON.parse(checkedMemberList || '[]');
        }
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
            this.$loading('加载中');
            if (this.type === ContactChooseTypes.Archive) {
                await this.handleArchive();
            } else if (this.type === ContactChooseTypes.EditArchive) {
                await this.handleArchive(true);
            } else {
                await this.handleCreateGroup();
            }
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
                this.$toast(this.$t('Create_successfully'));
                await navigateToDesignatedConversation(
                    data.groupID,
                    SessionType.WorkingGroup,
                    true
                );
            } catch (err) {
                this.$toast(this.$t('Create_failed'));
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
                const ids = [
                    ...this.checkedMemberList,
                    ...this.checkedConversation.filter(v => !v.userID)
                ].map(v => v.conversationID || v.groupID || v.userID || '');
                let newConversationList = this.storeConversationList.filter(v =>
                    ids.find(j => v.conversationID.includes(j))
                );
                let notConversationList = [];
                if (isUpdate) {
                    const archiveIds = this.checkedConversation.map(
                        v => v.conversationID
                    );
                    newConversationList = newConversationList.filter(
                        v => !archiveIds.includes(v.conversationID)
                    );
                    notConversationList = this.checkedConversation.filter(
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
                this.$toast(this.$t('Set_group_successfully'));
                setTimeout(() => {
                    uni.navigateBack({
                        delta: isUpdate ? 1 : 2
                    });
                }, 1000);
            } catch (err) {
                console.log(err);
                this.$toast(this.$t('Set_group_failed'));
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
                        this.showToast(this.$t('Upload_failed'));
                    }
                },
                fail: function () {
                    this.showToast(this.$t('Upload_failed'));
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

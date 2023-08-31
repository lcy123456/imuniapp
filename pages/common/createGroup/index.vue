<template>
    <view class="create_group_container">
        <CustomNavBar
            title="发起群聊"
            is-bg-color2
        />

        <view class="group_base_info">
            <MyAvatar
                :is-group="true"
                :src="groupFaceUrl"
                size="44"
                @click="chooseImage"
            />
            <u--input
                v-model="groupName"
                placeholder="取个群名"
                border="none"
            />
        </view>

        <view
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
                        :src="member.userID"
                        :desc="member.nickname"
                        size="42"
                    />
                    <text class="member_name">
                        {{ member.nickname }}
                    </text>
                </view>
            </view>
        </view>

        <view class="my-30">
            <u-button
                :loading="createLoading"
                :disabled="disabledCreate"
                type="primary"
                text="完成创建"
                shape="circle"
                size="large"
                @click="complateCreate"
            />
        </view>
        <u-toast ref="uToast" />
    </view>
</template>

<script>
import { ContactChooseTypes } from '@/constant';
import IMSDK, {
    GroupType,
    IMMethods,
    SessionType,
} from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import { navigateToDesignatedConversation } from '@/util/imCommon';
import { getPurePath } from '@/util/common';
export default {
    components: {
        CustomNavBar,
        MyAvatar,
    },
    data () {
        return {
            groupName: '',
            groupFaceUrl: '',
            checkedMemberList: [],
            fileList: [],
            createLoading: false,
        };
    },
    computed: {
        disabledCreate () {
            return !this.groupName || this.checkedMemberList.length === 0;
        },
    },
    onLoad (options) {
        const { checkedMemberList } = options;
        this.checkedMemberList = checkedMemberList
            ? JSON.parse(checkedMemberList)
            : [];
    },
    methods: {
        toChooseMember () {
            const checkedIDList = this.checkedMemberList.map(
                (member) => member.userID
            );
            uni.navigateTo({
                url: `/pages/common/contactChoose/index?type=${
                    ContactChooseTypes.GetList
                }&checkedUserIDList=${JSON.stringify(checkedIDList)}`,
            });
        },
        async complateCreate () {
            this.createLoading = true;
            const options = {
                adminUserIDs: [],
                memberUserIDs: this.checkedMemberList.map(
                    (member) => member.userID
                ),
                groupInfo: {
                    groupType: GroupType.WorkingGroup,
                    groupName: this.groupName,
                    faceURL: this.groupFaceUrl,
                },
            };
            try {
                const {data} = await IMSDK.asyncApi(IMSDK.IMMethods.CreateGroup, IMSDK.uuid(), options);
                this.$toast('创建成功');
                await navigateToDesignatedConversation(
                    data.groupID,
                    SessionType.WorkingGroup,
                    true
                );
            } catch (err) {
                this.$toast('创建失败');
            }
            this.createLoading = false;
        },
        getCheckedUsers (list) {
            this.checkedMemberList = [...list];
        },
        chooseImage () {
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
                            data: { url },
                        } = await IMSDK.asyncApi(
                            IMMethods.UploadFile,
                            IMSDK.uuid(),
                            {
                                filepath: getPurePath(tempFilePaths[0]),
                                name: fileName,
                                contentType: `image/${fileType}`,
                                uuid: IMSDK.uuid(),
                            }
                        );
                        this.groupFaceUrl = url;
                    } catch (error) {
                        this.showToast('上传失败');
                    }
                },
                fail: function () {
                    this.showToast('上传失败');
                },
            });
        },
        showToast (message, complete = null) {
            this.$refs.uToast.show({
                message,
                duration: 1000,
                complete,
            });
        },
    },
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
        @include vCenterBox();
        padding: 40rpx;
        background-color: $uni-bg-color;
        margin: 10rpx 0 30rpx;
        border-radius: 20rpx;

        .u-input {
            margin-left: 48rpx;
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

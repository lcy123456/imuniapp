<template>
    <Page>
        <view class="page_container">
            <CustomNavBar title="选择分组" is-bg-color2>
                <template slot="more">
                    <text class="text-grey mr-30 fz-32" @click="handleCreate"
                        >新建分组</text
                    >
                </template>
            </CustomNavBar>
            <div
                v-if="storeConversationFolder.length === 0"
                class="primary pt-40 text-center"
                @click="handleCreate"
                >暂无分组，请新建分组</div
            >
            <view class="folder_container py-15">
                <div
                    class="folder_item mx-10 px-30 py-15"
                    v-for="v in storeConversationFolder"
                    :key="v.id"
                    @click="handleArchive(v)"
                >
                    <image
                        class="w-78 h-78 mr-25"
                        src="/static/images/archive_active.svg"
                    ></image>
                    <text>{{ v.name }}</text>
                </div>
            </view>
        </view>
    </Page>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import { mapActions, mapGetters } from 'vuex';
import UserItem from '@/components/UserItem/index.vue';
import { setConversations } from '@/api/conversation';
import { ContactChooseTypes } from '@/constant';

export default {
    name: 'ArchiveFolderList',
    components: {
        CustomNavBar,
        UserItem
    },
    data() {
        return {
            conversation: null
        };
    },
    computed: {
        ...mapGetters(['storeConversationFolder', 'storeCurrentUserID']),
        tempAttachedInfo() {
            return JSON.parse(this.conversation?.attachedInfo || '{}');
        }
    },
    onLoad(option) {
        const { conversation } = option;
        this.conversation = JSON.parse(decodeURIComponent(conversation));
    },
    methods: {
        async handleArchive(v) {
            try {
                this.$loading('');
                await setConversations({
                    userIDs: [this.storeCurrentUserID],
                    conversation: {
                        conversationID: this.conversation.conversationID,
                        conversationType: this.conversation.conversationType,
                        groupID: this.conversation.groupID,
                        attachedInfo: JSON.stringify({
                            ...this.tempAttachedInfo,
                            archive_id: v.id
                        })
                    }
                });
                this.$toast('设置分组成功');
                setTimeout(() => {
                    uni.navigateBack();
                }, 1000);
            } catch (err) {
                this.$toast('设置分组失败');
                console.log(err);
            }
        },
        handleCreate() {
            const checkedConversation = encodeURIComponent(
                JSON.stringify([this.conversation])
            );
            uni.$u.route('/pages/common/createGroup/index', {
                type: ContactChooseTypes.Archive,
                checkedConversation
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.folder_container {
    flex: 1;
    overflow: auto;
    .folder_item {
        @include vCenterBox();
        border-bottom: 2rpx solid $uni-color-thinGrey;
    }
}
</style>

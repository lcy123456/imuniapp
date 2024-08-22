<template>
    <div>
        <u-modal
            async-close
            show-cancel-button
            :show="showConfirm"
            :content="`${$t('Confirm_to_delete_group')} ${
                operationFolder.name
            } ？`"
            @confirm="tryDeleteArchive"
            @cancel="() => (showConfirm = false)"
        />
    </div>
</template>

<script>
import { handleDeleteArchive } from '@/util/imCommon';
import { mapGetters, mapActions } from 'vuex';
import {
    apiConversationFolderUpdate,
    setConversations
} from '@/api/conversation';

export default {
    props: {
        isShowModal: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            showConfirm: false,
            operationFolder: {}
        };
    },
    computed: {
        ...mapGetters([
            'storeConversationFolder',
            'storeCurrentUserID',
            'storeConversationList'
        ])
    },
    created() {
        uni.$on('deleteArchive', this.deleteArchive);
    },
    beforeDestroy() {
        uni.$off('deleteArchive', this.deleteArchive);
    },
    methods: {
        ...mapActions('conversation', ['updateConversationFolder']),
        deleteArchive(item) {
            if (!this.isShowModal) return;
            this.showConfirm = true;
            this.operationFolder = this.storeConversationFolder.find(
                v => v.id === item.archive_id
            );
        },
        async tryDeleteArchive() {
            try {
                const params = {
                    ...this.operationFolder,
                    state: -1
                };
                await apiConversationFolderUpdate(params);
                this.updateConversationFolder(params);

                const conversations = this.storeConversationList.filter(v => {
                    const tempAttachedInfo = JSON.parse(v.attachedInfo || '{}');
                    return tempAttachedInfo.archive_id === params.id;
                });
                const promiseArr = conversations.map(v => {
                    const tempAttachedInfo = JSON.parse(v.attachedInfo || '{}');
                    return setConversations({
                        userIDs: [this.storeCurrentUserID],
                        conversation: {
                            conversationID: v.conversationID,
                            conversationType: v.conversationType,
                            groupID: v.groupID,
                            attachedInfo: JSON.stringify({
                                ...tempAttachedInfo,
                                archive_id: -1
                            })
                        }
                    });
                });
                await Promise.all(promiseArr);
                this.$toast(this.$t('Delete_group_successfully'));
            } catch (err) {
                console.log(err);
                this.$toast(this.$t('Delete_group_failed'));
            } finally {
                this.showConfirm = false;
            }
        }
    }
};
</script>

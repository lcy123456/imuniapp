<template>
    <Page>
        <view class="archive_container" @click="closeAllSwipe">
            <CustomNavBar :title="navbarTitle" is-bg-color2 />
            <view class="px-20 pt-10 pb-20 bg-grey" @click="handleToSearch">
                <uni-search-bar
                    v-model="keyword"
                    bg-color="#fff"
                    class="h-70"
                    placeholder="搜索"
                    readonly
                />
            </view>
            <z-paging
                ref="paging"
                use-virtual-list
                :force-close-inner-list="true"
                :fixed="false"
                preload-page="20"
            >
                <uni-swipe-action ref="swipeWrapperRef" class="swipe_wrapper">
                    <ConversationItem
                        v-for="(item, index) in showConversationList"
                        :id="`zp-id-${index}`"
                        :key="index"
                        :source="item"
                        @closeAllSwipe="closeAllSwipe"
                    />
                </uni-swipe-action>
            </z-paging>
            <!-- <scroll-view
                class="scroll_view"
                :scroll-with-animation="true"
                scroll-y
                :upper-threshold="0"
            >
                <uni-swipe-action ref="swipeWrapperRef" class="swipe_wrapper">
                    <ConversationItem
                        v-for="(item, index) in showConversationList"
                        :key="index"
                        :source="item"
                        @closeAllSwipe="closeAllSwipe"
                    />
                </uni-swipe-action>
            </scroll-view> -->
            <DeleteArchiveModal></DeleteArchiveModal>
        </view>
    </Page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ConversationItem from './components/ConversationItem.vue';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import { archiveConversation } from './index.vue';
import { MessageReceiveOptType } from 'openim-uniapp-polyfill';
import DeleteArchiveModal from './components/DeleteArchiveModal.vue';

export default {
    components: {
        CustomNavBar,
        ConversationItem,
        DeleteArchiveModal
    },
    data() {
        return {
            keyword: '',
            refreshing: false,
            platformID: 0,
            archive_id: 0
        };
    },
    computed: {
        ...mapGetters(['storeConversationList', 'storeConversationFolder']),
        navbarTitle() {
            return this.currentConversationFolder?.name || '分组列表';
        },
        currentConversationFolder() {
            return this.storeConversationFolder.find(
                v => v.id === this.archive_id
            );
        },
        showConversationList() {
            if (this.archive_id) {
                return this.storeConversationList.filter(v => {
                    const tempAttachedInfo = JSON.parse(v.attachedInfo || '{}');
                    return tempAttachedInfo.archive_id === this.archive_id;
                });
            }
            const map = {};
            this.storeConversationList.forEach(v => {
                const tempAttachedInfo = JSON.parse(v.attachedInfo || '{}');
                const archive_id = tempAttachedInfo.archive_id;
                if (!map[archive_id]) {
                    map[archive_id] = [];
                }
                map[archive_id].push(v);
            });
            return this.storeConversationFolder.map(v => {
                if (!map[v.id]) {
                    map[v.id] = [];
                }
                const unreadCount = map[v.id]
                    .filter(v => v.recvMsgOpt === MessageReceiveOptType.Nomal)
                    .reduce((count, item) => {
                        return item.unreadCount + count;
                    }, 0);
                let _archiveConversation = {
                    ...archiveConversation,
                    archive_id: v.id,
                    faceURL: '/static/images/archive.png',
                    showName: v.name,
                    unreadCount,
                    latestMsg: JSON.stringify({
                        contentType: 101,
                        textElem: {
                            content: map[v.id]
                                .map(item => item.showName)
                                .join(',')
                        }
                    }),
                    isGroupSwiper: true
                };
                return _archiveConversation;
            });
        }
    },
    onLoad(option) {
        const { archive_id } = option;
        this.archive_id = Number(archive_id || 0);
    },
    methods: {
        ...mapActions('conversation', ['updateConversationFolder']),
        handleToSearch() {
            uni.$u.route('/pages/common/searchRecord/index', {
                searchType: 'archivist',
                archive_id: this.archive_id
            });
        },
        closeAllSwipe() {
            this.$refs.swipeWrapperRef.closeAll();
        }
    }
};
</script>

<style lang="scss" scoped>
.archive_container {
    @include colBox(false);
    height: 100vh;
    overflow-y: hidden;
}

.z-paging-content {
    flex: 1;
}
.scroll_view {
    flex: 1;
    overflow: hidden;
}
</style>

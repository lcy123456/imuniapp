<template>
    <Page>
        <view class="search_record_container page_container">
            <view class="status-bar-height" />
            <view class="px-20 pt-10 pb-20">
                <uni-search-bar
                    v-model="keyword"
                    bg-color="#fff"
                    class="h-70"
                    focus
                    placeholder="搜索"
                    @cancel="handleCancel"
                />
            </view>
            <Empty v-if="!keyword || showList.length === 0" />
            <view
                v-else
                key="list"
                class="record_container"
                @touchstart="touchstart"
            >
                <view
                    v-for="v in showList"
                    :key="v.type"
                    class="mb-20 record_box px-30"
                >
                    <view v-show="!moreType" class="title_box">
                        {{ v.title }}
                    </view>
                    <RecordItem
                        v-for="j in v.list.slice(0, moreType ? undefined : 3)"
                        :key="j.userID || j.groupID || j.conversationID"
                        :source="j"
                        :keyword="keyword"
                        :type="v.type"
                        @click.native="handleItemClick(v.type, j)"
                    />
                    <view
                        v-if="v.list.length > 3 && !moreType"
                        class="more_box"
                        @click="handleMore(v.type)"
                    >
                        更多{{ v.title }}
                    </view>
                </view>
            </view>
        </view>
    </Page>
</template>

<script>
import { mapGetters } from 'vuex';
import IMSDK, { IMMethods, SessionType } from 'openim-uniapp-polyfill';
import RecordItem from './components/RecordItem.vue';
import { navigateToDesignatedConversation } from '@/util/imCommon';
import { RecordFormMap, RecordTypeMap, TextRenderTypes } from '@/constant';

export default {
    components: {
        RecordItem
    },
    data() {
        return {
            moreType: '',
            keyword: '',
            searchType: '',
            conversationID: '',
            recordList: [],
            showList: []
        };
    },
    computed: {
        ...mapGetters([
            'storeFriendList',
            'storeGroupList',
            'storeConversationList'
        ]),
        isArchvistList() {
            const isArchvistList = [];
            this.storeConversationList.forEach(item => {
                try {
                    const attachedInfo = JSON.parse(item.attachedInfo);
                    if (attachedInfo.archvist === 1) {
                        isArchvistList.push(item);
                    }
                } catch (err) {
                    //
                }
            });
            return isArchvistList;
        },
        isArchvist() {
            return this.searchType === 'archvist';
        },
        showFriendList() {
            if (this.isArchvist) {
                return this.isArchvistList.filter(
                    v => !v.groupID && v.showName.includes(this.keyword)
                );
            }
            return this.storeFriendList.filter(
                v =>
                    v.nickname.includes(this.keyword) ||
                    v.remark.includes(this.keyword)
            );
        },
        showGroupList() {
            if (this.isArchvist) {
                return this.isArchvistList.filter(
                    v => v.groupID && v.showName.includes(this.keyword)
                );
            }
            return this.storeGroupList.filter(v =>
                v.groupName.includes(this.keyword)
            );
        }
    },
    watch: {
        keyword() {
            if (!this.keyword) {
                this.showList = [];
            }
            uni.$u.debounce(this.throttleSearchRecord, 300);
        }
    },

    onLoad(options) {
        const { type = '', keyword = '', searchType = '' } = options;
        this.moreType = type;
        this.keyword = keyword;
        this.searchType = searchType;
    },

    methods: {
        handleCancel() {
            uni.navigateBack();
        },
        async getSearchRecord(item, index, length) {
            try {
                const params = {
                    conversationID: item
                        ? item.conversationID
                        : this.conversationID,
                    keywordList: [this.keyword],
                    messageTypeList: TextRenderTypes,
                    searchTimePosition: 0,
                    searchTimePeriod: 0,
                    pageIndex: 1,
                    // count: this.moreType ? 999 : 3,
                    count: 999
                };
                const { data } = await IMSDK.asyncApi(
                    IMMethods.SearchLocalMessages,
                    IMSDK.uuid(),
                    params
                );
                if (length) {
                    this.recordList = (data.searchResultItems || []).concat(
                        this.recordList
                    );
                } else {
                    this.recordList = data.searchResultItems || [];
                }
                if ((length && length - 1 === index) || !length) {
                    this.handleData();
                }
            } catch (err) {
                console.log('getSearchRecord-err', err);
            }
        },
        throttleSearchRecord() {
            if (this.isArchvist) {
                this.recordList = [];
                this.isArchvistList.forEach((item, index) => {
                    this.getSearchRecord(
                        item,
                        index,
                        this.isArchvistList.length
                    );
                });
            } else {
                this.getSearchRecord();
            }
        },
        handleData() {
            let _list = [];
            this.showFriendList.length !== 0 &&
                _list.push({
                    title: '联系人',
                    list: this.showFriendList,
                    type: RecordTypeMap.Contact
                });
            this.showGroupList.length !== 0 &&
                _list.push({
                    title: '群聊',
                    list: this.showGroupList,
                    type: RecordTypeMap.Group
                });
            this.recordList.length !== 0 &&
                _list.push({
                    title: '聊天记录',
                    list: this.recordList,
                    type: RecordTypeMap.Record
                });
            this.showList = _list.filter(v =>
                this.moreType ? v.type === this.moreType : true
            );
        },
        handleMore(type) {
            uni.$u.route('/pages/common/searchRecord/index', {
                type,
                keyword: this.keyword,
                searchType: this.searchType
            });
        },
        handleItemClick(type, v) {
            if ([RecordTypeMap.Contact, RecordTypeMap.Group].includes(type)) {
                const params = {
                    id: v.userID,
                    sessionType: SessionType.Single
                };
                if (type === RecordTypeMap.Group) {
                    params.id = v.groupID;
                    params.sessionType = SessionType.WorkingGroup;
                }
                navigateToDesignatedConversation(
                    params.id,
                    params.sessionType
                ).catch(() => uni.$u.toast('获取会话信息失败'));
            } else if (RecordTypeMap.Record === type) {
                uni.$u.route('/pages/common/searchRecord/recordDetail/index', {
                    conversation: encodeURIComponent(
                        JSON.stringify({
                            ...v,
                            messageList: undefined
                        })
                    ),
                    keyword: this.keyword,
                    form: RecordFormMap.All
                });
            }
        },
        touchstart() {
            uni.hideKeyboard();
        }
    }
};
</script>

<style lang="scss" scoped>
.search_record_container {
    background-color: $uni-bg-color-grey;
    /deep/.uni-searchbar {
        .uni-searchbar__cancel {
            color: $uni-color-primary;
        }
    }
    .empty_icon {
        width: 360rpx;
        height: 260rpx;
    }
    .record_container {
        overflow: auto;
        .record_box {
            background-color: $uni-bg-color;
            .title_box {
                height: 70rpx;
                line-height: 70rpx;
                border-bottom: 2rpx solid $uni-color-thinGrey;
                padding-left: 20rpx;
                color: $uni-text-color-grey;
                font-size: 28rpx;
            }
            .more_box {
                height: 80rpx;
                line-height: 80rpx;
                color: $uni-text-color-grey;
                padding-left: 10rpx;
            }
        }
    }
}
</style>

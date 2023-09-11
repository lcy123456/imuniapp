<template>
    <view class="search_record_container page_container">
        <view class="status-bar-height" />
        <view class="px-20 pb-20 pt-10">
            <uni-search-bar
                v-model="keyword"
                bg-color="#fff"
                class="h-70"
                focus
                placeholder="搜索"
                @cancel="handleCancel"
            />
        </view>
        <view
            v-if="!keyword || showList.length === 0"
            key="empty"
            class="flex-grow flex justify-center pt-186 bg-color"
        >
            <image
                src="/static/images/search_record_empty.png"
                class="empty_icon"
            />
        </view>
        <view
            v-else
            key="list"
            class="record_container"
            @touchstart="touchstart"
        >
            <view
                v-for="v in showList"
                :key="v.type"
                class="record_box mb-20 px-30"
            >
                <view
                    v-show="!moreType"
                    class="title_box"
                >
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
</template>

<script>
import { mapGetters } from 'vuex';
import IMSDK, { IMMethods, SessionType } from 'openim-uniapp-polyfill';
import RecordItem from './components/RecordItem.vue';
import { navigateToDesignatedConversation } from '@/util/imCommon';
import { RecordFormMap, RecordTypeMap } from '@/constant';

export default {
    components: {
        RecordItem,
    },
    data () {
        return {
            moreType: '',
            keyword: '',
            conversationID: '',
            recordList: [],
            showList: []
        };
    },
    computed: {
        ...mapGetters(['storeFriendList', 'storeGroupList']),
        showFriendList () {
            return this.storeFriendList.filter(
                (v) =>
                    v.nickname.includes(this.keyword) ||
                    v.remark.includes(this.keyword)
            );
        },
        showGroupList () {
            return this.storeGroupList.filter((v) =>
                v.groupName.includes(this.keyword)
            );
        },
    },
    watch: {
        keyword () {
            this.throttleSearchRecord();
        },
    },

    onLoad (options) {
        const { type = '', keyword = '' } = options;
        this.moreType = type;
        this.keyword = keyword;
    },

    methods: {
        handleCancel () {
            uni.navigateBack();
        },
        async getSearchRecord () {
            const params = {
                conversationID: this.conversationID,
                keywordList: [this.keyword],
                messageTypeList: [],
                searchTimePosition: 0,
                searchTimePeriod: 0,
                pageIndex: 1,
                // count: this.moreType ? 999 : 3,
                count: 0,
            };
            const { data } = await IMSDK.asyncApi(
                IMMethods.SearchLocalMessages,
                IMSDK.uuid(),
                params
            );
            this.recordList = data.searchResultItems || [];
            this.handleData();
        },
        throttleSearchRecord () {
            uni.$u.debounce(this.getSearchRecord, 300);
        },
        handleData () {
            let _list = [];
            this.showFriendList.length !== 0 &&
                _list.push({
                    title: '联系人',
                    list: this.showFriendList,
                    type: RecordTypeMap.Contact,
                });
            this.showGroupList.length !== 0 &&
                _list.push({
                    title: '群聊',
                    list: this.showGroupList,
                    type: RecordTypeMap.Group,
                });
            this.recordList.length !== 0 &&
                _list.push({
                    title: '聊天记录',
                    list: this.recordList,
                    type: RecordTypeMap.Record,
                });
            this.showList = _list.filter((v) =>
                this.moreType ? v.type === this.moreType : true
            );
            // console.log('show', this.showList);
        },
        handleMore (type) {
            uni.$u.route('/pages/common/searchRecord/index', {
                type,
                keyword: this.keyword,
            });
        },
        handleItemClick (type, v) {
            if ([RecordTypeMap.Contact, RecordTypeMap.Group].includes(type)) {
                const params = {
                    id: v.userID,
                    sessionType: SessionType.Single,
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
                            messageList: undefined,
                        })
                    ),
                    keyword: this.keyword,
                    form: RecordFormMap.All
                });
            }
        },
        touchstart () {
            uni.hideKeyboard();
        },
    },
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

<template>
    <view class="record_detail_container page_container">
        <view class="status-bar-height" />
        <view class="px-20 pb-20 pt-10">
            <uni-search-bar
                v-model="keyword"
                bg-color="#fff"
                class="h-70"
                focus
                placeholder="搜索"
                @cancel="handleCancel"
            >
                <view
                    slot="searchIcon"
                    class="flex align-center"
                >
                    <u-icon
                        name="search"
                        size="18"
                    />
                    <text class="primary">
                        {{ conversation.showName }}
                    </text>
                </view>
            </uni-search-bar>
        </view>
        <view class="bg-color mb-20 px-30">
            <RecordItem
                :source="conversation"
                :keyword="keyword"
                :type="RecordTypeMap.Contact"
                show-icon
                @click.native="handleItemClick()"
            />
        </view>
        <view class="scroll_box bg-color flex-grow over-hide flex flex-column px-30">
            <view class="title_box">
                相关聊天记录
            </view>
            <view>
                <RecordItem
                    v-for="v in messageList"
                    :key="v.clientMsgID"
                    :source="v"
                    :keyword="keyword"
                    :type="RecordTypeMap.Message"
                    @click.native="handleItemClick(v)"
                />
            </view>
        </view>
    </view>
</template>

<script>
import RecordItem from '../components/RecordItem.vue';
import IMSDK, { IMMethods } from 'openim-uniapp-polyfill';
import { RecordTypeMap } from '@/constant';
import { recordToDesignatedConversation } from '@/util/imCommon';

export default {
    components: {
        RecordItem
    },
    data () {
        return {
            RecordTypeMap: Object.freeze(RecordTypeMap),
            keyword: '',
            conversation: {},
            messageList: []
        };
    },
    watch: {
        keyword () {
            this.throttleSearchRecord();
        },
    },

    onLoad (options) {
        console.log(options);
        const { conversation, keyword } = options;
        this.conversation = JSON.parse(decodeURIComponent(conversation));
        this.keyword = keyword;
    },

    methods: {
        handleCancel () {
            uni.navigateBack();
        },
        async getSearchRecord () {
            const params = {
                conversationID: this.conversation.conversationID,
                keywordList: [this.keyword],
                messageTypeList: [],
                searchTimePosition: 0,
                searchTimePeriod: 0,
                pageIndex: 1,
                count: 999,
            };
            const { data } = await IMSDK.asyncApi(
                IMMethods.SearchLocalMessages,
                IMSDK.uuid(),
                params
            );
            this.messageList = data.searchResultItems?.[0]?.messageList || [];
            // console.log('xxx', data);
        },
        throttleSearchRecord () {
            uni.$u.debounce(this.getSearchRecord, 300);
        },
        handleItemClick (v) {
            recordToDesignatedConversation(this.conversation.conversationID, false, v?.clientMsgID);
        }
    },
};
</script>

<style lang="scss" scoped>
.record_detail_container {
    background-color: $uni-bg-color-grey;
    .title_box {
        height: 70rpx;
        line-height: 70rpx;
        border-bottom: 2rpx solid $uni-color-thinGrey;
        padding-left: 20rpx;
        color: $uni-text-color-grey;
        font-size: 28rpx;
    }
    .scroll_box {
        overflow: auto;
    }
}
</style>
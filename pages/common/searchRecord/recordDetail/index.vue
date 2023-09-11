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
                    v-if="form === RecordFormMap.All"
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
        <view
            v-if="form === RecordFormMap.All"
            class="bg-color mb-20 px-30"
        >
            <RecordItem
                :source="conversation"
                :keyword="keyword"
                :type="RecordTypeMap.Contact"
                show-icon
                @click.native="handleItemClick()"
            />
        </view>
        <view
            class="bg-color flex-grow flex flex-column px-30 pb-20 over-auto"
            @touchstart="touchstart"
        >
            <view class="title_box">
                {{ tabActive.label }}
            </view>
            <template v-if="tabActive.value === TextRenderTypes">
                <RecordItem
                    v-for="v in messageList"
                    :key="v.clientMsgID"
                    :source="v"
                    :keyword="keyword"
                    :type="RecordTypeMap.Message"
                    @click.native="handleItemClick(v)"
                />
            </template>
            <view
                v-else-if="tabActive.value === MediaRenderTypes"
                class="flex flex-wrap"
            >
                <MediaRender
                    v-for="(v, i) in messageList"
                    :key="v.clientMsgID"
                    :message="v"
                    :size="boxWidth / 3"
                    @click="handleMediaClick(i)"
                />
            </view>
            <template v-else-if="tabActive.value === FileRenderTypes">
                <FileRender
                    v-for="(v, i) in messageList"
                    :key="v.clientMsgID"
                    :message="v"
                    @click="handleMediaClick(i)"
                />
            </template>
        </view>
        <MyTabs
            v-if="form !== RecordFormMap.All"
            class="myTabs"
            :list="tabList"
            @change="handleTabChange"
        />
    </view>
</template>

<script>
import RecordItem from '../components/RecordItem.vue';
import IMSDK, { IMMethods, MessageType } from 'openim-uniapp-polyfill';
import { 
    RecordFormMap, 
    RecordTypeMap, 
    TextRenderTypes, 
    MediaRenderTypes,
    FileRenderTypes
} from '@/constant';
import { recordToDesignatedConversation } from '@/util/imCommon';
import MyTabs from '@/components/MyTabs';
import MediaRender from '../components/MediaRender.vue';
import FileRender from '../components/FileRender.vue';

export default {
    components: {
        RecordItem,
        MyTabs,
        MediaRender,
        FileRender
    },
    data () {
        return {
            RecordFormMap: Object.freeze(RecordFormMap),
            RecordTypeMap: Object.freeze(RecordTypeMap),
            TextRenderTypes: Object.freeze(TextRenderTypes),
            MediaRenderTypes: Object.freeze(MediaRenderTypes),
            FileRenderTypes: Object.freeze(FileRenderTypes),
            boxWidth: 0,
            keyword: '',
            conversation: {},
            form: '',
            messageList: [],
            tabActive: {}
        };
    },
    computed: {
        tabList () {
            const arr = [
                { label: '聊天记录', value: this.TextRenderTypes },
                { label: '媒体', value: this.MediaRenderTypes },
                { label: '文件', value: this.FileRenderTypes },
            ];
            if (this.form === RecordFormMap.Group) {
                arr.push({ label: '用户', value: 3 });
            }
            return arr;
        },
    },
    watch: {
        keyword () {
            this.throttleSearchRecord();
        },
    },

    onLoad (options) {
        console.log(options);
        const { conversation, keyword, form } = options;
        this.conversation = JSON.parse(decodeURIComponent(conversation));
        this.keyword = keyword || '';
        this.form = form;
        this.tabActive = this.tabList[0];

        this.boxWidth = (uni.getWindowInfo().windowWidth - 30);
    },

    methods: {
        handleCancel () {
            uni.navigateBack();
        },
        async getSearchRecord () {
            const params = {
                conversationID: this.conversation.conversationID,
                keywordList: this.tabActive.value === TextRenderTypes ? [this.keyword] : [],
                messageTypeList: this.tabActive.value,
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
            console.log('xxx', data);
        },
        throttleSearchRecord () {
            uni.$u.debounce(this.getSearchRecord, 300);
        },
        handleItemClick (v) {
            recordToDesignatedConversation(this.conversation.conversationID, false, v?.clientMsgID);
        },
        handleMediaClick (index) {
            const list = this.messageList.map(v => {
                const { contentType, pictureElem, videoElem} = v;
                const isVideo = contentType === MessageType.VideoMessage;
                let map = {
                    url: pictureElem?.sourcePicture.url,
                    type: 'image'
                };
                if (isVideo) {
                    map = {
                        url: videoElem.videoUrl,
                        poster: videoElem.snapshotUrl,
                        type: 'video'
                    };
                }
                return map;
            });
            uni.$u.route('/pages/common/previewMedia/index', {
                list: encodeURIComponent(JSON.stringify(list)),
                current: index
            });
        },
        handleTabChange (v) {
            this.tabActive = v;
            this.getSearchRecord();
        },
        touchstart () {
            uni.hideKeyboard();
        },
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
    .myTabs {
        flex-shrink: 0;
        background-color: $uni-bg-color-hover;
        margin: 30rpx 20rpx;
    }
}
</style>
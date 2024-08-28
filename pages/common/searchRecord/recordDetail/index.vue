<template>
    <Page>
        <view class="record_detail_container page_container">
            <view class="status-bar-height" />
            <view class="px-20 pt-10 pb-20">
                <uni-search-bar
                    v-model="keyword"
                    bg-color="#fff"
                    class="h-70"
                    focus
                    :placeholder="$t('Search')"
                    :cancel-text="$t('Cancel')"
                    @cancel="handleCancel"
                >
                    <view
                        v-if="from === RecordFormMap.All"
                        slot="searchIcon"
                        class="flex align-center"
                    >
                        <u-icon name="search" size="18" />
                        <text class="primary">
                            {{ conversation.showName }}
                        </text>
                    </view>
                </uni-search-bar>
            </view>
            <view
                v-if="from === RecordFormMap.All"
                class="mb-20 bg-color px-30"
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
                class="flex flex-grow pb-20 bg-color flex-column px-30 over-auto"
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
                <template v-else-if="tabActive.value === MediaRenderTypes">
                    <div v-for="(j, k) in mediaMessage" :key="k">
                        <div class="time_label">{{ j.label }}</div>
                        <div class="flex flex-wrap">
                            <MediaRender
                                v-for="v in j.value"
                                :key="v.clientMsgID"
                                :message="v"
                                :size="boxWidth / 3"
                                @click="handleMediaClick(v.clientMsgID)"
                            />
                        </div>
                    </div>
                </template>
                <template v-else-if="tabActive.value === FileRenderTypes">
                    <FileRender
                        v-for="v in messageList"
                        :key="v.clientMsgID"
                        :message="v"
                    />
                </template>
                <GroupMemberSwipe
                    v-else-if="tabActive.value === UserRenderTypes"
                    :is-owner="
                        selfGroupInfo.roleLevel === GroupMemberRole.Owner
                    "
                    :is-admin="
                        selfGroupInfo.roleLevel === GroupMemberRole.Admin
                    "
                    :list="showMemberList"
                    :group-i-d="groupID"
                    @change="handleMemberChange"
                />
            </view>
            <MyTabs
                v-if="from !== RecordFormMap.All"
                class="myTabs"
                :list="tabList"
                @change="handleTabChange"
            />
        </view>
    </Page>
</template>

<script>
import { mapGetters } from 'vuex';
import RecordItem from '../components/RecordItem.vue';
import IMSDK, {
    IMMethods,
    MessageType,
    GroupMemberFilter,
    GroupMemberRole
} from 'openim-uniapp-polyfill';
import {
    RecordFormMap,
    RecordTypeMap,
    TextRenderTypes,
    MediaRenderTypes,
    FileRenderTypes
} from '@/constant';
import { recordToDesignatedConversation, formatFileUrl } from '@/util/imCommon';
import MyTabs from '@/components/MyTabs';
import MediaRender from '../components/MediaRender.vue';
import FileRender from '../components/FileRender.vue';
import GroupMemberSwipe from '@/pages/conversation/groupSettings/components/GroupMemberSwipe.vue';
import { checkLoginError } from '@/util/common';
import dayjs from 'dayjs';

const UserRenderTypes = [3];

export default {
    components: {
        RecordItem,
        MyTabs,
        MediaRender,
        FileRender,
        GroupMemberSwipe
    },
    data() {
        return {
            RecordFormMap: Object.freeze(RecordFormMap),
            RecordTypeMap: Object.freeze(RecordTypeMap),
            TextRenderTypes: Object.freeze(TextRenderTypes),
            MediaRenderTypes: Object.freeze(MediaRenderTypes),
            FileRenderTypes: Object.freeze(FileRenderTypes),
            UserRenderTypes: Object.freeze(UserRenderTypes),
            GroupMemberRole: Object.freeze(GroupMemberRole),
            boxWidth: 0,
            messageList: [],
            tabActive: {},
            keyword: '',
            conversation: {},
            from: '',
            groupID: '',
            selfGroupInfo: {},
            groupMemberList: []
        };
    },
    computed: {
        ...mapGetters(['storeCurrentUserID', 'storeCurrentConversationID']),
        tabList() {
            const arr = [
                { label: this.$t('Chat_history'), value: this.TextRenderTypes },
                { label: this.$t('Media'), value: this.MediaRenderTypes },
                { label: this.$t('File'), value: this.FileRenderTypes },
                ...(this.from === RecordFormMap.Group
                    ? [{ label: this.$t('User'), value: UserRenderTypes }]
                    : [])
            ];
            return arr;
        },
        showMemberList() {
            const res = this.groupMemberList.filter(v => {
                return v.nickname.includes(this.keyword || '');
            });
            return res;
        },
        mediaMessage() {
            const temp = [
                {
                    label: this.$t('This_week'),
                    value: [],
                    time: dayjs().startOf('week').valueOf()
                },
                {
                    label: this.$t('This_month'),
                    value: [],
                    time: dayjs().startOf('month').valueOf()
                },
                {
                    label: this.$t('This_year'),
                    value: [],
                    time: dayjs().startOf('year').valueOf()
                }
            ];
            const len = temp.length;
            this.messageList.forEach(v => {
                const sendTime = v.sendTime;
                let isOtherYear = true;
                for (let j = 0; j < len; j++) {
                    if (sendTime > temp[j].time) {
                        temp[j].value.push(v);
                        isOtherYear = false;
                        break;
                    }
                }
                if (isOtherYear) {
                    const year = dayjs(sendTime).format('YYYY');
                    const index = temp.findIndex(j => j.label === year);
                    if (index === -1) {
                        temp[temp.length] = {
                            label: year,
                            value: [v]
                        };
                    } else {
                        temp[index].value.push(v);
                    }
                }
            });
            return temp.filter(v => v.value.length !== 0);
        }
    },
    watch: {
        keyword() {
            this.throttleSearchRecord();
        }
    },

    onLoad(options) {
        const { conversation, keyword, from, groupID } = options;
        this.conversation = JSON.parse(decodeURIComponent(conversation));
        this.keyword = keyword || '';
        this.from = from;
        this.groupID = groupID;

        this.tabActive = this.tabList[0];
        this.boxWidth = uni.getWindowInfo().windowWidth - 30;
    },

    methods: {
        handleCancel() {
            uni.navigateBack();
        },
        async getSearchRecord() {
            if (this.tabActive.value === UserRenderTypes) return;
            if (this.tabActive.value === TextRenderTypes && !this.keyword) {
                this.messageList = [];
                return;
            }
            const params = {
                conversationID: this.conversation.conversationID,
                keywordList:
                    this.tabActive.value === MediaRenderTypes
                        ? []
                        : [this.keyword],
                messageTypeList: this.tabActive.value,
                searchTimePosition: 0,
                searchTimePeriod: 0,
                pageIndex: 1,
                count: 999
            };
            const { data } = await IMSDK.asyncApi(
                IMMethods.SearchLocalMessages,
                IMSDK.uuid(),
                params
            );
            this.messageList = data.searchResultItems?.[0]?.messageList || [];
            // console.log('xxx', data);
        },
        throttleSearchRecord() {
            uni.$u.debounce(this.getSearchRecord, 300);
        },
        handleItemClick(v) {
            // console.log('xxx', v);
            if (this.storeCurrentConversationID) {
                // let pages = getCurrentPages();
                // let prevPage = pages[pages.length - 3];
                // prevPage.$vm.setPositionMsgID(v?.clientMsgID);
                // console.log('pagespages-----pages', v?.clientMsgID);
                uni.navigateBack({
                    delta: 2
                });
                uni.$emit('setPositionMsgID', v?.clientMsgID, v.seq);
            } else {
                recordToDesignatedConversation(
                    this.conversation.conversationID,
                    false,
                    v?.clientMsgID,
                    v.seq
                );
            }
        },
        handleMediaClick(clientMsgID) {
            const index = this.messageList.findIndex(
                v => v.clientMsgID === clientMsgID
            );
            const list = this.messageList.map(v => {
                const { contentType, pictureElem, videoElem } = v;
                const isVideo = contentType === MessageType.VideoMessage;
                let map = {
                    url: formatFileUrl(pictureElem?.sourcePicture.url),
                    type: 'image'
                };
                if (isVideo) {
                    map = {
                        url: formatFileUrl(videoElem.videoUrl),
                        poster: formatFileUrl(videoElem.snapshotUrl),
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
        handleMemberChange() {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            prevPage.$vm.handleMemberChange();
            this.getGroupMemberList();
        },
        handleTabChange(v) {
            this.messageList = [];
            this.tabActive = v;
            if (v.value === UserRenderTypes) {
                this.getSelfGroupInfo();
                this.getGroupMemberList();
            } else {
                this.getSearchRecord();
            }
        },
        async getSelfGroupInfo() {
            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetSpecifiedGroupMembersInfo,
                IMSDK.uuid(),
                {
                    groupID: this.groupID,
                    userIDList: [this.storeCurrentUserID]
                }
            );
            this.selfGroupInfo = data[0];
        },
        async getGroupMemberList() {
            try {
                const { data } = await IMSDK.asyncApi(
                    IMSDK.IMMethods.GetGroupMemberList,
                    IMSDK.uuid(),
                    {
                        groupID: this.groupID,
                        filter: GroupMemberFilter.All,
                        offset: 0,
                        count: 999
                    }
                );
                this.groupMemberList = [...data];
            } catch (err) {
                console.log(err);
                this.$toast(checkLoginError(err));
            }
        },
        touchstart() {
            uni.hideKeyboard();
        }
    }
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
    .time_label {
        color: $uni-text-color-grey;
        font-size: 28rpx;
        margin-top: 20rpx;
    }
}
</style>

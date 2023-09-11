<template>
    <CustomNavBar
        class="chating_header"
        bg-color="rgba(255,255,255, .8)"
        :route="!isMultipleMsg"
    >
        <view
            v-if="isMultipleMsg"
            slot="left"
            :class="['ml-30', checkedMsgIds.length === 0 ? 'text-grey' : 'primary']"
            @click="handleMultipleDelAll"
        >
            全部删除
        </view>
        <template slot="center">
            <view
                v-if="isMultipleMsg"
                class="ff-bold"
            >
                已选中{{ checkedMsgIds.length }}条
            </view>
            <view
                v-else
                class="conversation_info"
            >
                <view class="title">
                    {{ storeCurrentConversation.showName }}
                </view>
                <view
                    v-if="isSingle"
                    class="fz-24 text-grey flex align-center justify-center"
                >
                    <view :class="['w-12', 'h-12', 'br-12', isOnline ? 'bg-primary' : 'bg-inverse']" />
                    <text class="ml-10">
                        {{ onlineStr }}
                    </text>
                </view>
                <view
                    v-else-if="isWorkingGroup"
                    class="fz-24 text-grey"
                >
                    {{ groupMemberCount }}
                </view>
            </view>
        </template>
        <view
            slot="more" 
            class="right_action"
        >
            <view
                v-if="isMultipleMsg"
                class="primary"
                @click="handleMultiple"
            >
                取消
            </view>
            <MyAvatar
                v-else-if="isSingle"
                :src="storeCurrentConversation.faceURL"
                :desc="storeCurrentConversation.showName"
                size="60rpx"
                shape="circle"
                @click="showInfo"
            />
            <u-icon
                v-else-if="isWorkingGroup"
                class="action_item"
                name="more-dot-fill"
                size="23"
                color="#333"
                @click="goSetting"
            />
        </view>
    </CustomNavBar>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar';
import { mapGetters } from "vuex";
import { SessionType } from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';
import { getDesignatedUserOnlineState } from "@/util/imCommon";
import { MessageMenuTypes } from '@/constant';

export default {
    name: 'ChatingHeader',
    components: {
        CustomNavBar,
        MyAvatar
    },
    props: {
        isMultipleMsg: {
            type: Boolean,
            default: false,
        },
        checkedMsgIds: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            isOnline: false,
            onlineStr: "离线",
        };
    },
    computed: {
        ...mapGetters([
            'storeCurrentConversation', 
            'storeCurrentConversationID', 
            'storeCurrentGroup', 
            'storeCurrentMemberInGroup'
        ]),
        userID () {
            return this.storeCurrentConversation.userID;
        },
        isSingle () {
            return this.storeCurrentConversation.conversationType === SessionType.Single;
        },
        isWorkingGroup () {
            return this.storeCurrentConversation.conversationType === SessionType.WorkingGroup;
        },
        isNotify () {
            return this.storeCurrentConversation.conversationType === SessionType.Notification;
        },
        groupMemberCount () {
            return `${this.storeCurrentGroup?.memberCount ?? 0}位成员`;
        },
    },
    methods: {
        async getOnlineState () {
            try {
                const res = await getDesignatedUserOnlineState(this.userID);
                this.isOnline = res !== "离线";
                this.onlineStr = res;
            } catch {
                this.isOnline = false;
            }
        },
        showInfo () {
            uni.$u.route(`/pages/common/userCard/index?sourceID=${this.userID}&from=chating`);
        },
        goSetting () {
            uni.$u.route('/pages/conversation/groupSettings/index');
        },
        handleMultipleDelAll () {
            uni.$emit('multiple_message', {
                show: true,
                type: MessageMenuTypes.DelAll
            });
        },
        handleMultiple () {
            uni.$emit('multiple_message', {
                show: false
            });
        }
    }
};
</script>

<style lang="scss" scoped>
	.chating_header {
        padding: 0 30rpx;
		.conversation_info {
			text-align: center;

			.title {
				@include nomalEllipsis();
				max-width: 280rpx;
				font-size: 34rpx;
				font-weight: 500;
				font-family: MiSans-Medium;
			}
		}

		.right_action {
            margin-right: 30rpx;
			@include vCenterBox();

			// .action_item {
			// 	padding: 12rpx;
			// }

			// .u-icon {
			// 	margin-left: 12rpx;
			// }
		}
	}
</style>

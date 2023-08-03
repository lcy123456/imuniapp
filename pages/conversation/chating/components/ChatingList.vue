<template>
	<scroll-view :scroll-with-animation="withAnimation" @click="click" id="scroll_view" :style="{height:'1px'}"
		@scroll="throttleScroll" :scroll-top="scrollTop" scroll-y :scroll-into-view="scrollIntoView"
		upper-threshold="250" @scrolltoupper="scrolltoupper">
		<view id="scroll_wrap">
			<u-loadmore nomoreText="" :status="loadMoreStatus" />
			<view v-for="(item,index) in storeHistoryMessageList" :key="item.clientMsgID">
				<message-item-render :menuOutsideFlag="menuOutsideFlag"
					@messageItemRender="messageItemRender" :source="item" :isSender="item.sendID === storeCurrentUserID" />
			</view>
			<view style="visibility: hidden;height: 12px;" id="auchormessage_bottom_item"></view>
		</view>
	</scroll-view>
</template>

<script>
	import {
		mapGetters,
		mapActions
	} from "vuex";
	import dayjs from 'dayjs'
	import {
		SendMessageFailedType
	} from "@/constant";
	import MessageItemRender from './MessageItem/index.vue'
	import { MessageStatus } from "openim-uniapp-polyfill";

	export default {
		name: "",
		components: {
			MessageItemRender
		},
		props: {
			menuOutsideFlag: Number,
		},
		data() {
			return {
				scrollIntoView: '',
				scrollWithAnimation: false,
				scrollTop: 0,
				// old: {
				// 	scrollTop: 0
				// },
				initFlag: true,
				isOverflow: false,
				needScoll: true,
				withAnimation: false,
				messageLoadState: {
					lastMinSeq: 0,
					loading: false
				},
			}
		},
		computed: {
			...mapGetters(['storeCurrentConversation', 'storeHistoryMessageList', 'storeHasMoreMessage',
				'storeCurrentUserID'
			]),
			loadMoreStatus() {
				console.log(this.storeHistoryMessageList);
				if (!this.storeHasMoreMessage) {
					return 'nomore'
				}
				return this.messageLoadState.loading ? 'loading' : 'loadmore'
			},
		},
		mounted() {
			this.loadMessageList();
		},
		methods: {
			...mapActions('message', ['getHistoryMesageList']),
			messageItemRender(clientMsgID) {
				if (this.initFlag && clientMsgID === this.storeHistoryMessageList[this.storeHistoryMessageList
						.length - 1]
					.clientMsgID) {
					this.initFlag = false;
					setTimeout(() => this.scrollToBottom(true), 200)
				}
			},
			async loadMessageList(isLoadMore = false) {
				this.messageLoadState.loading = true
				const lastMsgID = this.storeHistoryMessageList[0]?.clientMsgID
				const options = {
					conversationID: this.storeCurrentConversation.conversationID,
					userID: "",
					groupID: "",
					count: 20,
					startClientMsgID: this.storeHistoryMessageList[0]?.clientMsgID ?? "",
					lastMinSeq: this.messageLoadState.lastMinSeq,
				}
				try {
					const {
						emptyFlag,
						lastMinSeq
					} = await this.getHistoryMesageList(options)
					this.messageLoadState.lastMinSeq = lastMinSeq
					if (emptyFlag) {
						this.$emit('initSuccess')
					}
				} catch (e) {
					console.log(e);
				}
				this.$nextTick(function() {
					if (isLoadMore && lastMsgID) {
						this.scrollToAnchor(`auchor${lastMsgID}`)
					}
					this.messageLoadState.loading = false
				})
			},
			click(e) {
				this.$emit('click', e)
			},
			onScroll(event) {
				const {
					scrollHeight,
					scrollTop
				} = event.target
				this.needScoll = (scrollHeight - scrollTop) < uni.getWindowInfo().windowHeight * 1.2
			},
			throttleScroll(event) {
				uni.$u.throttle(() => this.onScroll(event), 200)
			},
			scrolltoupper() {
				if (!this.messageLoadState.loading && this.storeHasMoreMessage) {
					this.loadMessageList(true)
				}
			},
			scrollToBottom(isInit = false, isRecv = false) {
				if (isRecv && !this.needScoll) {
					return;
				}

				if (!isInit) {
					this.withAnimation = true
					setTimeout(() => this.withAnimation = false, 100)
				}

				this.$nextTick(() => {
					uni.createSelectorQuery().in(this).select('#scroll_wrap').boundingClientRect((res) => {
						// let top = res.height - this.scrollViewHeight;
						// if (top > 0) {
						this.scrollTop = res.height;
						if (isInit) {
							this.$emit('initSuccess')
						}
						// }
					}).exec()
				})
			},
			scrollToAnchor(auchor) {
				this.$nextTick(function() {
					this.scrollIntoView = auchor
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	#scroll_view {
		flex: 1;
		background-repeat: no-repeat;
	}

	.uni-scroll-view {
		position: relative;
	}

	.new_message_flag {
		position: sticky;
		background: #FFFFFF;
		box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.1);
		border-radius: 14px;
		padding: 4px 8px;
		display: flex;
		justify-content: center;
		align-items: center;
		bottom: 12px;
		left: 50%;
		transform: translateX(-50%);
		width: fit-content;
		font-size: 24rpx;
		color: #006AFF;

	}

	.time_gap_line {
		padding: 0 10vw 12rpx;
		text-align: center;
		// font-size: 24rpx;
		font-size: 0.93rem;
		color: #999;
	}

	.fade-leave,
	.fade-enter-to {
		opacity: 1;
	}

	.fade-leave-active,
	.fade-enter-active {
		transition: all 0.3s;
	}

	.fade-leave-to,
	.fade-enter {
		opacity: 0;
	}
</style>

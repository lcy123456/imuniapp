<template>
	<view class="page_container">
		<view class="self_info_row">
			<my-avatar :src="selfInfo.faceURL" :desc="selfInfo.nickname" size='73' />
			<text class="nickname">{{selfInfo.nickname}}</text>
			<view class="id_row">
				<text>ID: {{selfInfo.userID}}</text>
				<img @click="toSelfQr" src="static/images/profile_top_qr.png" alt="" />
			</view>
		</view>

		<view @click="profileMenuClick(item)" class="profile_menu_item" v-for="item in profileMenus" :key="item.idx">
			<view class="menu_left">
				<image :style="{'width':item.size[0],'height':item.size[1]}" :src="item.icon" mode="" />
				<text>{{item.title}}</text>
			</view>
			<u-icon name="arrow-right" size="16" color="#999"></u-icon>
		</view>

		<u-modal width="500rpx" showCancelButton :show="showComfirm" @confirm="logoutConfirm" @cancel="closeModal"
			content="确定要退出当前账号吗？" asyncClose></u-modal>
	</view>
</template>

<script>
	import IMSDK from 'openim-uniapp-polyfill'
	import MyAvatar from '@/components/MyAvatar/index.vue'
	export default {
		components: {
			MyAvatar,
		},
		data() {
			return {
				showComfirm: false,
				profileMenus: [{
						idx: 0,
						title: "我的信息",
						icon: require("static/images/profile_menu_info.png"),
						size: ['22px', '22px']
					}, {
						idx: 2,
						title: "账号设置",
						icon: require("static/images/profile_menu_account.png"),
						size: ['20px', '23px']
					}, {
						idx: 3,
						title: "关于我们",
						icon: require("static/images/profile_menu_about.png"),
						size: ['22px', '22px']
					}, {
						idx: 4,
						title: "退出登录",
						icon: require("static/images/profile_menu_logout.png"),
						size: ['22px', '22px']
					}
				]
			};
		},
		computed: {
			selfInfo() {
				return this.$store.getters.storeSelfInfo
			}
		},
		methods: {
			profileMenuClick({
				idx
			}) {
				switch (idx) {
					case 0:
						uni.navigateTo({
							url: "/pages/profile/selfInfo/index"
						})
						break;
					case 1:
						uni.navigateTo({
							url: "/pages/profile/messageNotification/index"
						})
						break;
					case 2:
						uni.navigateTo({
							url: "/pages/profile/accountSetting/index"
						})
						break;
					case 3:
						uni.navigateTo({
							url: "/pages/profile/about/index"
						})
						break;
					case 4:
						this.showComfirm = true
						break;
					default:
						break;
				}
			},
			logoutConfirm() {
				IMSDK.asyncApi(IMSDK.IMMethods.Logout, IMSDK.uuid())
					.then(() => {
						uni.removeStorage({
							key: 'IMToken'
						})
						uni.removeStorage({
							key: 'BusinessToken'
						})
					}).catch((err) => console.log(err)).finally(() => {
						this.showComfirm = false;
						uni.$u.route('/pages/login/index')
					})
			},
			closeModal() {
				this.showComfirm = false
			},
			toSelfQr() {
				uni.navigateTo({
					url: `/pages/common/userOrGroupQrCode/index`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_container {
		.self_info_row {
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			align-items: center;
			width: 100%;
			height: 220px;
			padding-top: var(--status-bar-height);
			margin-bottom: 24rpx;
			background-image: url("@/static/images/profile_top_bg.png");
			background-repeat: round;
			color: #fff;

			.nickname {
				@include nomalEllipsis();
				max-width: 400rpx;
				margin-top: 24rpx;
				font-size: 40rpx;
			}

			.id_row {
				@include vCenterBox();
				margin: 20rpx 0 36rpx;
				font-size: 28rpx;

				img {
					width: 18px;
					height: 18px;
					margin-left: 16rpx;
				}
			}
		}

		.profile_menu_item {
			@include btwBox();
			padding: 24rpx 44rpx;

			.menu_left {
				@include vCenterBox();
				color: $uni-text-color;

				image {
					margin-right: 24rpx;
				}
			}
		}
	}
</style>

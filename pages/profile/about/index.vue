<template>
	<view class="page_container">
		<custom-nav-bar title="关于我们" />
		<view class="logo_area">
			<image src="@/static/images/about_logo.png" mode=""></image>
			<view>{{`Open IM Uniapp v${appVersion}`}}</view>
		</view>
	</view>
</template>

<script>
	import CustomNavBar from '@/components/CustomNavBar/index.vue'
	export default {
		components: {
			CustomNavBar
		},
		data() {
			return {
				appVersion: '',
				loading: false
			};
		},
		onLoad() {
			this.getAppVersion();
		},
		methods: {
			getAppVersion() {
				plus.runtime.getProperty(plus.runtime.appid, ({
					version
				}) => this.appVersion = version)
			},
		}
	}
</script>

<style lang="scss">
	.page_container {
		background-color: #f8f8f8;

		.logo_area {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 100%;
			padding: 48rpx 0;

			image {
				width: 72px;
				height: 72px;
				margin-bottom: 24rpx;
			}
		}

		.btn_row {
			padding: 0 44rpx;
		}
	}
</style>

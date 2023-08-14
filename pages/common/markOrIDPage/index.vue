<template>
    <view class="mark_id_container">
        <CustomNavBar :title="getTitle">
            <template slot="more">
                <text
                    class="primary mr-30 fz-32"
                    @click="saveOrCopy"
                >
                    完成
                </text>
            </template>
        </CustomNavBar>

        <view class="py-40 px-60 bg-color">
            <u-input
                v-model="content"
                maxlength="20"
                placeholder="请输入您的信息"
                border="none"
                clearable
            />
        </view>
    </view>
</template>

<script>
import IMSDK from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import { businessInfoUpdate } from '@/api/login';

export default {
    components: {
        CustomNavBar
    },
    props: {

    },
    data () {
        return {
            content: '',
            isRemark: false,
            isSelfNickname: false,
            sourceInfo: {},
        };
    },
    computed: {
        getTitle () {
            if (this.isRemark) {
                return '设置备注';
            }
            if (this.isSelfNickname) {
                return '修改姓名';
            }
            return '';
        }
    },
    onLoad (options) {
        const {
            isRemark,
            isSelfNickname,
            sourceInfo
        } = options;
        this.sourceInfo = JSON.parse(sourceInfo);
        this.isRemark = !!isRemark;
        if (this.isRemark) {
            this.content = this.sourceInfo.remark;
        }
        this.isSelfNickname = !!isSelfNickname;
        if (this.isSelfNickname) {
            this.content = this.sourceInfo.nickname;
        }
    },
    methods: {
        async saveOrCopy () {
            uni.showLoading({
                title: '加载中'
            });
            if (this.isRemark) {
                IMSDK.asyncApi(IMSDK.IMMethods.SetFriendRemark, IMSDK.uuid(), {
                    toUserID: this.sourceInfo.userID,
                    remark: this.content
                }).then(() => {
                    uni.$u.toast('设置成功');
                    setTimeout(() => uni.navigateBack(), 1000);
                }).catch((error) => {
                    console.log(error);
                    uni.$u.toast('设置失败');
                });
            } else if (this.isSelfNickname) {
                try {
                    await businessInfoUpdate({
                        userID: this.sourceInfo.userID,
                        nickname: this.content,
                    });
                    await this.$store.dispatch('user/updateBusinessInfo');
                    uni.$u.toast('修改成功');
                    setTimeout(() => uni.navigateBack(), 1000);
                } catch (e) {
                    console.log(e);
                    uni.$u.toast('修改失败');
                }
            }
        }
    }
};
</script>

<style lang="scss" scoped>
	.mark_id_container {
		@include colBox(false);
        height: 100vh;
        background-color: $uni-bg-color-grey;
	}
</style>

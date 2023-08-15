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
import IMSDK, {IMMethods} from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import { businessInfoUpdate } from '@/api/login';
import { CustomMarkType } from '@/constant';
import { checkLoginError } from '@/util/common';

export default {
    components: {
        CustomNavBar
    },
    props: {

    },
    data () {
        return {
            content: '',
            type: '',
            sourceInfo: {},
        };
    },
    computed: {
        getTitle () {
            // if (this.isRemark) {
            //     return '设置备注';
            // }
            // if (this.isSelfNickname) {
            //     return '修改姓名';
            // }
            switch (this.type) {
            case CustomMarkType.Remark:
                return '设置备注';
            case CustomMarkType.SelfNickname:
                return '修改姓名';
            case CustomMarkType.GroupName:
                return '修改组名';
            default: 
                return '';
            }
        }
    },
    onLoad (options) {
        const {
            type,
            sourceInfo
        } = options;
        this.type = type;
        this.sourceInfo = JSON.parse(sourceInfo);
        switch (type) {
        case CustomMarkType.Remark:
            this.content = this.sourceInfo.remark;
            break;
        case CustomMarkType.SelfNickname:
            this.content = this.sourceInfo.nickname;
            break;
        case CustomMarkType.GroupName:
            this.content = this.sourceInfo.groupName;
            break;
        }
    },
    methods: {
        async saveOrCopy () {
            uni.showLoading({
                title: '加载中'
            });
            switch (this.type) {
            case CustomMarkType.Remark:
                IMSDK.asyncApi(IMMethods.SetFriendRemark, IMSDK.uuid(), {
                    toUserID: this.sourceInfo.userID,
                    remark: this.content
                }).then(() => {
                    uni.$u.toast('设置成功');
                    setTimeout(() => uni.navigateBack(), 1000);
                }).catch((err) => {
                    console.log(err);
                    uni.$u.toast(checkLoginError(err));
                });
                break;
            case CustomMarkType.SelfNickname:
                try {
                    await businessInfoUpdate({
                        userID: this.sourceInfo.userID,
                        nickname: this.content,
                    });
                    await this.$store.dispatch('user/updateBusinessInfo');
                    uni.$u.toast('修改成功');
                    setTimeout(() => uni.navigateBack(), 1000);
                } catch (err) {
                    console.log(err);
                    uni.$u.toast(checkLoginError(err));
                }
                break;
            case CustomMarkType.GroupName:
                try {
                    await IMSDK.asyncApi(IMMethods.SetGroupInfo, IMSDK.uuid(), {
                        groupID: this.sourceInfo.groupID,
                        groupName: this.content
                    });
                    this.$toast('修改成功');
                    this.$store.dispatch("conversation/getCurrentGroup", this.sourceInfo.groupID);
                    setTimeout(() => uni.navigateBack(), 1000);
                } catch (err) {
                    console.log(err);
                    this.$toast(checkLoginError(err));
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

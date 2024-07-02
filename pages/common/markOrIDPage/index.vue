<template>
    <Page>
        <view class="mark_id_container">
            <CustomNavBar :title="getTitle">
                <template slot="more">
                    <text class="primary mr-30 fz-32" @click="saveOrCopy">
                        完成
                    </text>
                </template>
            </CustomNavBar>

            <view class="py-40 px-60 bg-color">
                <u-input
                    v-model="content"
                    maxlength="20"
                    :placeholder="getPlaceholder"
                    border="none"
                    clearable
                    :password="type === CustomMarkType.AccountCancel && !eying"
                >
                    <u-icon
                        v-if="type === CustomMarkType.AccountCancel"
                        slot="suffix"
                        :name="eying ? 'eye-off' : 'eye'"
                        @click="eying = !eying"
                    />
                </u-input>
            </view>
            <text
                v-if="type === CustomMarkType.AccountCancel"
                class="fz-28 text-grey"
            >
                请谨慎操作，注销后将对账号和数据进行清空！
            </text>

            <u-modal
                :content="`确定要注销账户${sourceInfo.nickname}吗？`"
                async-close
                :show="showConfirm"
                show-cancel-button
                @confirm="confirm"
                @cancel="() => (showConfirm = false)"
            />
        </view>
    </Page>
</template>

<script>
import IMSDK, { IMMethods } from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import { businessInfoUpdate, businessCancellation } from '@/api/login';
import { CustomMarkType } from '@/constant';
import { checkLoginError } from '@/util/common';
import md5 from 'md5';

export default {
    components: {
        CustomNavBar
    },
    props: {},
    data() {
        return {
            CustomMarkType: Object.freeze(CustomMarkType),
            content: '',
            type: '',
            sourceInfo: {},
            eying: false,
            showConfirm: false
        };
    },
    computed: {
        getTitle() {
            switch (this.type) {
                case CustomMarkType.Remark:
                    return '设置备注';
                case CustomMarkType.SelfNickname:
                    return '修改姓名';
                case CustomMarkType.GroupName:
                    return '修改组名';
                case CustomMarkType.AccountCancel:
                    return '注销账户';
                default:
                    return '';
            }
        },
        getPlaceholder() {
            let str = '请输入您的';
            switch (this.type) {
                case CustomMarkType.AccountCancel:
                    return str + '密码';
                default:
                    return str + '信息';
            }
        }
    },
    onLoad(options) {
        const { type, sourceInfo } = options;
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
        async saveOrCopy() {
            if (!this.content) return;
            uni.showLoading({
                title: '加载中'
            });
            try {
                switch (this.type) {
                    case CustomMarkType.Remark:
                        await IMSDK.asyncApi(
                            IMMethods.SetFriendRemark,
                            IMSDK.uuid(),
                            {
                                toUserID: this.sourceInfo.userID,
                                remark: this.content
                            }
                        );
                        uni.$u.toast('设置成功');
                        setTimeout(() => uni.navigateBack(), 1000);
                        break;
                    case CustomMarkType.SelfNickname:
                        await businessInfoUpdate({
                            userID: this.sourceInfo.userID,
                            nickname: this.content
                        });
                        await this.$store.dispatch('user/updateBusinessInfo');
                        uni.$u.toast('修改成功');
                        setTimeout(() => uni.navigateBack(), 1000);
                        break;
                    case CustomMarkType.GroupName:
                        await IMSDK.asyncApi(
                            IMMethods.SetGroupInfo,
                            IMSDK.uuid(),
                            {
                                groupID: this.sourceInfo.groupID,
                                groupName: this.content
                            }
                        );
                        this.$toast('修改成功');
                        this.$store.dispatch(
                            'conversation/getCurrentGroup',
                            this.sourceInfo.groupID
                        );
                        setTimeout(() => uni.navigateBack(), 1000);
                        break;
                    case CustomMarkType.AccountCancel:
                        uni.hideLoading();
                        this.showConfirm = true;
                        break;
                }
            } catch (err) {
                console.log(err);
                uni.$u.toast(checkLoginError(err));
            }
        },
        async confirm() {
            this.showConfirm = false;
            uni.showLoading({
                title: '加载中'
            });
            try {
                await businessCancellation({
                    userID: this.sourceInfo.userID,
                    password: md5(this.content)
                });
                this.$toast('注销成功');
                uni.clearStorage();
                uni.reLaunch({
                    url: '/pages/login/index'
                });
            } catch (err) {
                console.log(err);
                uni.$u.toast(checkLoginError(err));
            }
        },
        back() {
            setTimeout(() => uni.navigateBack(), 1000);
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

<template>
    <Page>
        <view class="mark_id_container">
            <CustomNavBar :title="getTitle">
                <template slot="more">
                    <text class="primary mr-30 fz-32" @click="saveOrCopy">
                        {{ $t('Complete') }}
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
                {{
                    $t(
                        'Please_be_careful_the_account_and_data_will_be_cleared_after_logout'
                    )
                }}
            </text>

            <u-modal
                :content="`${$t('Confirm_to_logout')}: ${
                    sourceInfo.nickname
                }？`"
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
                    return this.$t('Set_notes');
                case CustomMarkType.SelfNickname:
                    return this.$t('Change_name');
                case CustomMarkType.GroupName:
                    return this.$t('Change_group_name');
                case CustomMarkType.AccountCancel:
                    return this.$t('Logout_account');
                default:
                    return '';
            }
        },
        getPlaceholder() {
            switch (this.type) {
                case CustomMarkType.AccountCancel:
                    return this.$t('Please_enter_your_password');
                default:
                    return this.$t('Please_enter_your_information');
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
                title: this.$t('Loading')
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
                        uni.$u.toast(this.$t('Set_up_successfully'));
                        setTimeout(() => uni.navigateBack(), 1000);
                        break;
                    case CustomMarkType.SelfNickname:
                        await businessInfoUpdate({
                            userID: this.sourceInfo.userID,
                            nickname: this.content
                        });
                        await this.$store.dispatch('user/updateBusinessInfo');
                        uni.$u.toast(this.$t('Change_successfully'));
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
                        this.$toast(this.$t('Change_successfully'));
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
                title: this.$t('Loading')
            });
            try {
                await businessCancellation({
                    userID: this.sourceInfo.userID,
                    password: md5(this.content)
                });
                this.$toast(this.$t('Logout_successfully'));
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

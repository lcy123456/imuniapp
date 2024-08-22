<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
    <Page>
        <view class="page_container">
            <CustomNavBar :title="$t('Account_settings')" is-bg-color2 />

            <view class="info_wrap">
                <SettingItem
                    :title="$t('Address_book_blacklist')"
                    show-arrow
                    @click="toBlockList"
                />
                <SettingItem
                    :loading="loading"
                    :title="$t('Do_not_disturb_mode')"
                    :switch-value="globalOptEnable"
                    show-switch
                    @switch="switchGlobalOpt"
                />
                <SettingItem
                    :title="$t('Message_alert_tone')"
                    show-arrow
                    @click="checkoutVoice"
                />
                <!-- <SettingItem
                    v-if="isIos"
                    title="兼容模式"
                    show-arrow
                    @click="checkoutModel"
                >
                    <view slot="icon">
                        <u-icon
                            name="info-circle"
                            color="#ccc"
                            size="22"
                            @click.native.stop="showTip"
                        ></u-icon>
                    </view>
                </SettingItem> -->
            </view>
            <add-user />
        </view>
        <u-picker
            :show="show"
            :key-name="'label'"
            :columns="columns"
            :default-index="defaultIndex"
            @confirm="confirm"
            @change="changeHandler"
            @cancel="show = false"
        />
        <u-picker
            :show="showModel"
            :key-name="'label'"
            :columns="columnsModel"
            :default-index="defaultIndexModel"
            @confirm="confirmModel"
            @cancel="showModel = false"
        />
        <u-modal
            :show="showModal"
            :title="title"
            :content="content"
            :close-on-click-overlay="true"
            @confirm="showModal = false"
        ></u-modal>
    </Page>
</template>

<script>
import IMSDK, { MessageReceiveOptType } from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import SettingItem from '@/components/SettingItem/index.vue';
import { mapGetters } from 'vuex';
import addUser from '../addUser';

export default {
    components: {
        CustomNavBar,
        SettingItem,
        addUser
    },
    data() {
        return {
            loading: false,
            show: false,
            showModal: false,
            showModel: false,
            defaultIndex: [],
            defaultIndexModel: [],
            title: this.$t('Compatibility_Mode'),
            content: this.$t('IOS_SYS_TIPS'),
            columns: [
                [
                    {
                        id: 1,
                        label: this.$t('Prompt_sound_1'),
                        value: '/static/audio/voice1.mp3'
                    },
                    {
                        id: 2,
                        label: this.$t('Prompt_sound_2'),
                        value: '/static/audio/voice2.mp3'
                    },
                    {
                        id: 3,
                        label: this.$t('Prompt_sound_3'),
                        value: '/static/audio/voice3.mp3'
                    },
                    {
                        id: 4,
                        label: this.$t('Prompt_sound_4'),
                        value: '/static/audio/voice4.mp3'
                    }
                ]
            ],
            columnsModel: [
                [
                    {
                        id: 1,
                        label: this.$t('On'),
                        value: '1'
                    },
                    {
                        id: 2,
                        label: this.$t('Off'),
                        value: '2'
                    }
                ]
            ],
            options: [
                {
                    icon: '/static/images/chating_message_del.png',
                    style: {
                        backgroundColor: '#f00'
                    }
                }
            ]
        };
    },
    computed: {
        ...mapGetters(['storeSelfInfo']),
        globalOptEnable() {
            return (
                this.storeSelfInfo.globalRecvMsgOpt !==
                MessageReceiveOptType.Nomal
            );
        },
        isIos() {
            return uni.$u.os() === 'ios';
        }
    },
    created() {},
    methods: {
        showTip() {
            this.showModal = true;
        },
        setDefaultIndex() {
            const index = this.columns[0].findIndex(
                item => item.value === uni.getStorageSync('voice')
            );
            this.defaultIndex = index === -1 ? [0] : [index];
        },
        changeHandler(e) {
            const { value } = e;
            const item = value[0];
            uni.$emit('play_audio', item.value);
        },
        confirm(e) {
            const { value } = e;
            const item = value[0];
            uni.setStorageSync('voice', item.value);
            this.show = false;
            uni.$u.toast(this.$t('Set_up_successfully'));
        },
        confirmModel(e) {
            const { value } = e;
            const item = value[0];
            uni.setStorageSync('model', item.value);
            this.showModel = false;
            uni.$u.toast(this.$t('Set_up_successfully'));
        },
        checkoutModel() {
            const index = this.columnsModel[0].findIndex(
                item => item.value === uni.getStorageSync('model')
            );
            this.defaultIndexModel = index === -1 ? [0] : [index];
            this.showModel = true;
        },
        checkoutVoice() {
            this.setDefaultIndex();
            this.show = true;
            this.$nextTick(() => {
                const item = this.columns[0][this.defaultIndex[0]];
                uni.$emit('play_audio', item.value);
            });
        },
        toBlockList() {
            uni.navigateTo({
                url: '/pages/profile/blockList/index'
            });
        },
        switchGlobalOpt(flag) {
            this.loading = true;
            IMSDK.asyncApi(
                IMSDK.IMMethods.SetGlobalRecvMessageOpt,
                IMSDK.uuid(),
                flag
                    ? MessageReceiveOptType.NotNotify
                    : MessageReceiveOptType.Nomal
            )
                .finally(() => {
                    this.loading = false;
                })
                .catch(() => {
                    uni.$u.toast(this.$t('Set_up_failed'));
                });
        }
    }
};
</script>

<style lang="scss" scoped>
.page_container {
    background-color: $uni-bg-color-grey;

    .info_wrap {
        background-color: $uni-bg-color;
        margin: 40rpx;
        border-radius: 30rpx;
    }
}
</style>

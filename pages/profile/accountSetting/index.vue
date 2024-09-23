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
                <SettingItem
                    :title="$t('language')"
                    show-arrow
                    @click="checkLang"
                />
                <SettingItem
                    :title="$t('Change_login_password')"
                    show-arrow
                    @click="goSetPwd"
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
            :confirm-text="$t('Sure')"
            :cancel-text="$t('Cancel')"
            @confirm="confirm"
            @change="changeHandler"
            @cancel="show = false"
        />
        <u-picker
            :show="showLang"
            :key-name="'label'"
            :columns="columnsLang"
            :default-index="defaultIndexLang"
            :confirm-text="$t('Sure')"
            :cancel-text="$t('Cancel')"
            @confirm="confirmLang"
            @cancel="showLang = false"
        />
        <u-picker
            :show="showModel"
            :key-name="'label'"
            :columns="columnsModel"
            :default-index="defaultIndexModel"
            :confirm-text="$t('Sure')"
            :cancel-text="$t('Cancel')"
            @confirm="confirmModel"
            @cancel="showModel = false"
        />
        <u-modal
            :show="showModal"
            :confirm-text="$t('Sure')"
            :cancel-text="$t('Cancel')"
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
import { setTabBarItem } from '@/util/common';

export default {
    components: {
        CustomNavBar,
        SettingItem,
        addUser
    },
    data() {
        return {
            showLang: false,
            loading: false,
            show: false,
            showModal: false,
            showModel: false,
            defaultIndex: [],
            defaultIndexModel: [],
            defaultIndexLang: [],
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
            columnsLang: [
                [
                    {
                        id: 1,
                        label: '日本語',
                        value: 'jp'
                    },
                    // {
                    //     id: 2,
                    //     label: '中文',
                    //     value: 'zh'
                    // },
                    {
                        id: 3,
                        label: 'English',
                        value: 'en'
                    },
                    {
                        id: 4,
                        label: '한국인',
                        value: 'ko'
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
        ...mapGetters(['storeSelfInfo', 'storeBaseLang']),
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
        setLangDefaultIndex() {
            const index = this.columnsLang[0].findIndex(
                item => item.value === this.storeBaseLang
            );
            this.defaultIndexLang = index === -1 ? [0] : [index];
        },
        goSetPwd() {
            uni.navigateTo({
                url: `/pages/common/setPwd/index`
            });
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
        confirmLang(e) {
            const { value } = e;
            const item = value[0];
            this.$store.commit('base/SET_LANG_DATA', item.value);
            this.$i18n.locale = item.value;
            this.showLang = false;
            setTabBarItem();
            uni.$u.toast(this.$t('Set_up_successfully'));
            setTimeout(() => {
                plus.runtime.restart();
            }, 2000);
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
        checkLang() {
            this.setLangDefaultIndex();
            this.showLang = true;
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

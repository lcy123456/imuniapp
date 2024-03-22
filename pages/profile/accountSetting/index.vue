<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
    <Page>
        <view class="page_container">
            <CustomNavBar title="账号设置" is-bg-color2 />

            <view class="info_wrap">
                <SettingItem
                    title="通讯录黑名单"
                    show-arrow
                    @click="toBlockList"
                />
                <SettingItem
                    :loading="loading"
                    title="勿扰模式"
                    :switch-value="globalOptEnable"
                    show-switch
                    @switch="switchGlobalOpt"
                />
                <SettingItem
                    title="消息提示音"
                    show-arrow
                    @click="checkoutVoice"
                />
                <SettingItem
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
                </SettingItem>
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
            title: '兼容模式',
            content:
                'IOS系统下少数手机会在程序后台运行时出现卡死、闪退等问题，可尝试打开此模式，使程序在一定时间内自动关闭后台程序。',
            columns: [
                [
                    {
                        id: 1,
                        label: '提示声一',
                        value: '/static/audio/voice1.mp3'
                    },
                    {
                        id: 2,
                        label: '提示声二',
                        value: '/static/audio/voice2.mp3'
                    },
                    {
                        id: 3,
                        label: '提示声三',
                        value: '/static/audio/voice3.mp3'
                    },
                    {
                        id: 4,
                        label: '提示声四',
                        value: '/static/audio/voice4.mp3'
                    }
                ]
            ],
            columnsModel: [
                [
                    {
                        id: 1,
                        label: '关闭',
                        value: '1'
                    },
                    {
                        id: 2,
                        label: '开启',
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
            uni.$u.toast('设置成功');
        },
        confirmModel(e) {
            const { value } = e;
            const item = value[0];
            uni.setStorageSync('model', item.value);
            this.showModel = false;
            uni.$u.toast('设置成功');
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
                    uni.$u.toast('设置失败');
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

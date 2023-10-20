<template>
    <view
        class="contact_container"
    >
        <!-- :update="update"
        :change:update="updateData" -->
        <CustomNavBar
            :show-left="false" 
            is-bg-color2
            title="通讯录"
        >
            <view
                slot="more"
                class="mr-30"
                @click="contactAddClick"
            >
                <image
                    src="@/static/images/common_circle_add.png"
                    class="w-44 h-44"
                />
            </view>
        </CustomNavBar>
        <view
            class="px-20 pt-10 pb-20"
            @click="handleToSearch"
        >
            <uni-search-bar
                v-model="keyword"
                bg-color="#fff"
                class="h-70"
                placeholder="搜索"
                readonly
            />
        </view>
        <ContactMenus />

        <view class="list_title">
            <text>常用联系人</text>
        </view>

        <u-list
            class="user_list"
        >
            <u-list-item
                v-for="user in frequentContacts"
                :key="user.userID"
            >
                <UserItem
                    :item="user"
                    @itemClick="userClick"
                />
            </u-list-item>
        </u-list>
    </view>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import ContactMenus from './components/ContactMenus.vue';
import UserItem from "@/components/UserItem/index.vue";
export default {
    components: {
        CustomNavBar,
        ContactMenus,
        UserItem
    },
    data () {
        return {
            keyword: '',
            update: '',
            frequentContacts: []
        };
    },
    onShow () {
        this.getFrequentContacts();
        setTimeout(() => {
            this.update = +new Date();
        }, 100);
    },
    methods: {
        handleToSearch () {
            uni.$u.route('/pages/common/searchRecord/index');
        },
        contactAddClick () {
            uni.navigateTo({
                url: "/pages/contact/contactAdd/index"
            });
        },
        getFrequentContacts () {
            const tmpData = uni.getStorageSync(`${this.$store.getters.storeCurrentUserID}_frequentContacts`) || [];
            this.frequentContacts = [...tmpData].sort((a, b) => b - a);
        },
        userClick (item) {
            uni.navigateTo({
                url: `/pages/common/userCard/index?sourceID=${item.userID}`
            });
        },
    }
};
</script>

<!-- <script module="roomModule" lang="renderjs">
import {
    Participant,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
} from 'livekit-client';
export default {
    data () {
        return {
            room: null
        }
    },
    methods: {
        updateData () {
            window.console.log(11111111111111111);
            this.testOpenRoom();
        },
        toggleAudio: async () => {
            if (!this.room) return;
            const enabled = this.room.localParticipant.isMicrophoneEnabled;
            setButtonDisabled('toggle-audio-button', true);
            if (enabled) {
            appendLog('disabling audio');
            } else {
            appendLog('enabling audio');
            }
            await this.room.localParticipant.setMicrophoneEnabled(!enabled);
            setButtonDisabled('toggle-audio-button', false);
            updateButtonsForPublishState();
        },

        toggleVideo: async () => {
            if (!this.room) return;
            setButtonDisabled('toggle-video-button', true);
            const enabled = this.room.localParticipant.isCameraEnabled;
            if (enabled) {
            appendLog('disabling video');
            } else {
            appendLog('enabling video');
            }
            await this.room.localParticipant.setCameraEnabled(!enabled);
            setButtonDisabled('toggle-video-button', false);
            renderParticipant(this.room.localParticipant);

            // update display
            updateButtonsForPublishState();
        },
        async testOpenRoom () {
            const wsURL = `ws://192.168.2.20:7880`;
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAzMDM2NDIsImlzcyI6IkFQSVZWQ3BETGtaTHZSViIsIm5iZiI6MTY5NzcxMTY0Miwic3ViIjoicGFydGljaXBhbnRJZGVudGl0eTEiLCJ2aWRlbyI6eyJyb29tIjoiTVVTSyIsInJvb21Kb2luIjp0cnVlfX0._-3jkKTw-wBFJVI6BCN2bBdbEQKujeUwHVazttNCNCE`;
            this.room = new Room({
                // automatically manage subscribed video quality
                adaptiveStream: true,

                // optimize publishing bandwidth and CPU for published tracks
                dynacast: true
            });
            try {
                await this.room.connect(wsURL, token);
                window.console.log('connected to room----', this.room.name);
            } catch (err) {
                window.console.log('fail -----connected to room----', err);
            }
            const p = this.room.localParticipant;
            await p.enableCameraAndMicrophone();
            // await p.setCameraEnabled(true);
            await p.setMicrophoneEnabled(true);
            const videoElm = document.getElementById('screenshare-video');
            const element = RemoteTrack.attach();
            window.console.log(element, 'elementelement');
            videoElm.appendChild(element);
            // console.log(RemoteTrack.Source, '=======');
            // const screenSharePub = p.getTrack(RemoteTrack.Source.ScreenShare);
            // console.log(screenSharePub, '====999===');
            // screenSharePub.videoTrack?.attach(videoElm);
            // this.room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
            // console.log(this.room.canPlaybackAudio, 'this.room.canPlaybackAudiothis.room.canPlaybackAudio');
            // console.log(button, 'this.room.canPlaybackAudiothis.room.canPlaybackAudio');
            // this.room.startAudio();
            // if (!this.room.canPlaybackAudio) {
            //     button.onclick = () => {
            //         // startAudio *must* be called in an click/tap handler.
            //         this.room.startAudio().then(() => {
            //             // successful, UI can be removed now
            //             button.remove();
            //         });
            //     }
            // }
            // });
        },
        beforeDestroy () {
            this.room && this.room.disconnect();
        }
    }
}
</script> -->
<style lang="scss" scoped>
	.contact_container {
		@include colBox(false);
		height: 100vh;
		background-color: $uni-bg-color-grey;

		.list_title {
			font-size: 24rpx;
			color: $uni-text-color-grey;
			margin-left: 30rpx;
		}

		.user_list {
			flex: 1;
            overflow: hidden;
			margin-top: 24rpx;
			background-color: $uni-bg-color;
		}
	}
</style>

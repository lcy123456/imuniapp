<template>
    <view
        class="contact_container"
        :update="update"
        :change:update="updateData"
    >
        <div
            id="video"
        />
        <div
            id="my-video"
        />
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
            videoelm: null,
            keyword: '',
            update: '',
            frequentContacts: []
        };
    },
    onShow () {
        this.getFrequentContacts();
        // setTimeout(() => {
        //     this.update = +new Date();
        // }, 100);
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

<script module="roomModule" lang="renderjs">
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
            trackList: [],
            room: null
        }
    },
    // onShow () {
    //     window.console.log(11111111111111111);
    //     this.testOpenRoom();
    // },
    methods: {
        updateData () {
            window.console.log(11111111111111111);
            this.testOpenRoom();
        },
        // toggleAudio: async () => {
        //     if (!this.room) return;
        //     const enabled = this.room.localParticipant.isMicrophoneEnabled;
        //     setButtonDisabled('toggle-audio-button', true);
        //     if (enabled) {
        //     appendLog('disabling audio');
        //     } else {
        //     appendLog('enabling audio');
        //     }
        //     await this.room.localParticipant.setMicrophoneEnabled(!enabled);
        //     setButtonDisabled('toggle-audio-button', false);
        //     updateButtonsForPublishState();
        // },

        // toggleVideo: async () => {
        //     if (!this.room) return;
        //     setButtonDisabled('toggle-video-button', true);
        //     const enabled = this.room.localParticipant.isCameraEnabled;
        //     if (enabled) {
        //     appendLog('disabling video');
        //     } else {
        //     appendLog('enabling video');
        //     }
        //     await this.room.localParticipant.setCameraEnabled(!enabled);
        //     setButtonDisabled('toggle-video-button', false);
        //     renderParticipant(this.room.localParticipant);

        //     // update display
        //     updateButtonsForPublishState();
        // },
        async testOpenRoom () {
            const wsURL = `ws://192.168.2.20:7880`;
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAzMDM2NDIsImlzcyI6IkFQSVZWQ3BETGtaTHZSViIsIm5iZiI6MTY5NzcxMTY0Miwic3ViIjoicGFydGljaXBhbnRJZGVudGl0eTEiLCJ2aWRlbyI6eyJyb29tIjoiTVVTSyIsInJvb21Kb2luIjp0cnVlfX0._-3jkKTw-wBFJVI6BCN2bBdbEQKujeUwHVazttNCNCE`;
            this.room = new Room();
            this.trackList = [];
            try {
                await this.room.connect(wsURL, token);
                console.log('connected to room----', this.room.name);
                const p = this.room.localParticipant;
                await p.setCameraEnabled(true);
                await p.setMicrophoneEnabled(true);
                await p.enableCameraAndMicrophone();
                const cameraTrack = p.getTrack(RemoteTrack.Source.Camera);
                const myVideo = cameraTrack?.track?.attach();
                const myVideoDiv = document.getElementById('my-video');
                const videoDiv = document.getElementById('video');
                this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    const { identity } = participant;
                    const element = track.attach();
                    const type = `${identity}-${track.kind}`;
                    console.log(this.trackList, 'trackListtrackListtrackListtrackListtrackListtrackListtrackList----');
                    if (this.trackList.includes(type)) {
                        const dom = document.getElementById(type);
                        console.log(dom, '要删除的dom');
                        videoDiv.removeChild(dom);
                    }
                    element.style.width = "300px";
                    element.style.height = "300px";
                    element.id = type;
                    videoDiv.appendChild(element);
                    this.trackList.push(type);
                    console.log(track, 'tracktracktrack');
                    console.log('tracktracktrack', participant);
                    console.log(publication);
                })
                if (!myVideoDiv.children[0]) {
                    myVideo.style.width = "300px";
                    myVideo.style.height = "300px";
                    myVideo.id = 'myVideo';
                    myVideoDiv.appendChild(myVideo);
                }
            } catch (err) {
                console.log('fail -----connected to room----', err);
                setTimeout(async () => {
                    await this.room.connect(wsURL, token);
                }, 1000);
            }
            // console.log(uni.createVideoContext('screenshare-video'), 'tracktracktrack');
            // window.console.log(videoElement, 'elementelement');
            // videoelm.appendChild(element);
            // console.log(RemoteTrack.Source, '=======');
            // const screenSharePub = p.getTrack(RemoteTrack.Source.ScreenShare);
            // console.log(screenSharePub, '====999===');
            // screenSharePub.videoTrack?.attach(videoelm);
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
            this.myVideo = null;
            this.trackList = [];
        }
    }
}
</script>
<style lang="scss" scoped>

    .screenshare-video {
        width: 400px;
        height: 400px;
        border: 1px solid red;
    }
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

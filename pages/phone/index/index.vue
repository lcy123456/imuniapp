<template>
    <Page>
        <view
            :wsurl="storeIncomingCallWSURL"
            :token="storeIncomingCallTOKEN"
            :handleattr="storeHandleAttr"
            :change:wsurl="renderScript.onChangeWSURL"
            :change:token="renderScript.onChangeToken"
            :change:handleattr="renderScript.onChangeHandleAttr"
        />
        <view id="video" />
    </Page>
</template>

<script>
import { mapGetters } from 'vuex';
import store from '@/store';

export default {
    components: {
    },
    data () {
        return {
        };
    },
    computed: {
        ...mapGetters([
            'storeConversationList',
            'storeIsSyncing',
            'storeIncomingCallWSURL',
            'storeIncomingCallTOKEN',
            'storeIncomingCallTOKEN',
            'storeHandleAttr',
        ]),
    },
    onLoad () {
        console.log('phone/index/index.vue  onLoad');

        // 等待接电话
        // store.commit('incomingCall/SET_INCOMING_CALL_CATCH', true);
        // store.commit('incomingCall/SET_IS_INCOMING_CALL_MAIN', true);
        // store.commit('incomingCall/SET_IS_VIDEO_CALL', true);

        // 主动拨打电话
        // store.commit('incomingCall/SET_INCOMING_CALL_THROW', true);
        // store.commit('incomingCall/SET_IS_INCOMING_CALL_MAIN', true);
        // store.commit('incomingCall/SET_IS_VIDEO_CALL', true);

    },
    methods: {
    }
};
</script>


<script module="renderScript" lang="renderjs">
import {
    Participant,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    RemoteAudioTrack,
    Room,
    RoomEvent,
} from 'livekit-client';

export default {
    data () {
        return {
            room: null,
            renderWSURL: '',
            renderToken: '',
        };
    },
    methods: {
        onChangeWSURL(newValue, oldValue, ownerVm, vm) {
          this.renderWSURL = newValue
        },
        onChangeToken(newValue, oldValue, ownerVm, vm) {
          this.renderToken = newValue
          if(!this.renderToken) return

          this.onJoinRoom()
        },
        onChangeHandleAttr(newValue, oldValue, ownerVm, vm) {
          // isActiveMic: false, // 麦克风
          // isActiveSpeak: false, // 扬声器
          // isActiveCam: true, // 摄像头
          // isActiveOverturn: false, // 翻转

          // oldValue第一次是空值
          if(!oldValue) oldValue = newValue
          const {isActiveMic, isActiveSpeak, isActiveCam, isActiveOverturn} = newValue
          const {isActiveMic: isActiveMicOld, isActiveSpeak: isActiveSpeakOld, isActiveCam: isActiveCamOld, isActiveOverturn: isActiveOverturnOld} = oldValue

          const keys = Object.keys(newValue)
          if(isActiveMic != isActiveMicOld)
            this.setLocalTrackMicrophone(isActiveMic)
          else if(isActiveSpeak != isActiveSpeakOld)
            this.setVolume()
          else if(isActiveCam != isActiveCamOld)
            console.log()
          else if(isActiveOverturn != isActiveOverturnOld)
          this.onSwitchActiveDevice(isActiveCam)
        },

        // 麦克风
        setLocalTrackMicrophone(shouldOpen){
            const local_participant = this.room.localParticipant;
            console.log('setLocalTrackMicrophone()===', local_participant)
            if(shouldOpen){
              local_participant.setMicrophoneEnabled(true)
            } else {
              local_participant.setMicrophoneEnabled(false)
            }
        },

        // 扬声器
        setVolume(has) {
          // console.log('setVolume()====', RemoteAudioTrack)
          // const volumeNum = RemoteAudioTrack.getVolume()
        },

        // 翻转摄像头
        async onSwitchActiveDevice(has) {

        },
        onJoinRoom() {
          // 传递参数给普通js
          // ownerVm.callMethod('onSuccess', 123)

          console.log('renderjs   onJoinRoom  准备加入房间')
          this.testOpenRoom()
        },
        async testOpenRoom () {
            const wsURL = `ws://192.168.2.20:7880`;
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAzNzY2ODAsImlzcyI6IkFQSVZWQ3BETGtaTHZSViIsIm5iZiI6MTY5Nzc4NDY4MCwic3ViIjoicGFydGljaXBhbnRJZGVudGl0eTMiLCJ2aWRlbyI6eyJyb29tIjoiTVVTSyIsInJvb21Kb2luIjp0cnVlfX0.Ca0sYNhNTdOHkwNk1mJeDQq9XWhjC0ska1j-rX1y9QA`;
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
                // incomingCallMainMeVideo标签定义在IncomingCall/IncomingCallMain.vue
                const myVideoDiv = document.getElementById('incomingCallMainMeVideo');
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
                    // myVideo.style.width = "300px";
                    // myVideo.style.height = "300px";
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
    }
};
</script>

<style lang="scss" scoped></style>

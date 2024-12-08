const APP_ID = 'YOUR_APP_ID'; // Replace with your Agora App ID
const CHANNEL = 'test'; // Replace with your channel name
const TOKEN = null; // Replace with a token if using token-based authentication

let client;
let localTrack;
let remoteUsers = {};

const joinBtn = document.getElementById('join');
const leaveBtn = document.getElementById('leave');
const videoContainer = document.getElementById('video-container');

// Initialize Agora client
async function initializeAgora() {
    client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Subscribe to remote users
    client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack;
            const videoBox = document.createElement('div');
            videoBox.id = `user-${user.uid}`;
            videoBox.className = 'video-box';
            videoContainer.appendChild(videoBox);
            remoteVideoTrack.play(videoBox);
        }
    });

    // Remove user on leave
    client.on('user-unpublished', (user) => {
        const videoBox = document.getElementById(`user-${user.uid}`);
        if (videoBox) videoBox.remove();
    });

    // Join the channel
    await client.join(APP_ID, CHANNEL, TOKEN, null);

    // Publish local track
    localTrack = await AgoraRTC.createMicrophoneAndCameraTracks();
    const localVideoBox = document.createElement('div');
    localVideoBox.id = 'local-user';
    localVideoBox.className = 'video-box';
    videoContainer.appendChild(localVideoBox);
    localTrack[1].play(localVideoBox);

    await client.publish(localTrack);
}

// Join button functionality
joinBtn.addEventListener('click', async () => {
    joinBtn.disabled = true;
    leaveBtn.disabled = false;
    await initializeAgora();
});

// Leave button functionality
leaveBtn.addEventListener('click', async () => {
    leaveBtn.disabled = true;
    joinBtn.disabled = false;
    if (localTrack) {
        localTrack[0].close();
        localTrack[1].close();
    }
    await client.leave();
    videoContainer.innerHTML = '';
});

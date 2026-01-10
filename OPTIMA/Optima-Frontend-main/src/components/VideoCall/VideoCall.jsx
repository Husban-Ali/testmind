import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiX, FiPhone } from 'react-icons/fi';
import { getSocket } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';
import Peer from 'simple-peer';
import './VideoCall.css';

function VideoCall() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  const urlParams = new URLSearchParams(location.search);
  const callType = urlParams.get('type') || 'video'; // 'audio' or 'video'
  
  console.log('VideoCall component loaded');
  console.log('Channel ID:', channelId);
  console.log('Call Type:', callType);
  console.log('User:', user);
  
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(callType === 'video');
  const [screenSharing, setScreenSharing] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [originalVideoTrack, setOriginalVideoTrack] = useState(null);

  const localVideoRef = useRef(null);
  const peersRef = useRef([]);
  const socket = getSocket();
  const isCleaningUpRef = useRef(false);
  const localStreamRef = useRef(null); // Store stream in ref for event handlers

  console.log('Socket status:', socket?.connected ? 'Connected' : 'Disconnected');

  useEffect(() => {
    console.log('useEffect triggered - Socket:', socket?.connected);
    if (!socket) {
      console.error('Socket not connected');
      alert('Socket connection lost. Please refresh the page.');
      navigate(-1);
      return;
    }
    
    startCall();

    return () => {
      console.log('VideoCall component unmounting - isCleaningUp:', isCleaningUpRef.current);
      // Only cleanup when truly unmounting (user leaves the page)
      if (isCleaningUpRef.current) {
        cleanupCall();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCall = async () => {
    try {
      console.log('Starting call, type:', callType);
      console.log('Requesting media permissions...');
      
      // Get user media based on call type
      let stream = null;
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      console.log('Media constraints:', constraints);
      
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        // Fallback: Try with lower constraints if high quality fails
        if (callType === 'video' && error.name === 'OverconstrainedError') {
          console.warn('High quality video failed, trying lower quality...');
          constraints.video = {
            width: { ideal: 640 },
            height: { ideal: 480 }
          };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } else {
          throw error;
        }
      }
      
      console.log('Got media stream:', stream);
      console.log('Stream ID:', stream.id);
      console.log('Audio tracks:', stream.getAudioTracks().length);
      console.log('Video tracks:', stream.getVideoTracks().length);
      
      // Log each track
      stream.getTracks().forEach(track => {
        console.log(`Track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}, label: ${track.label}`);
      });

      // Store in both state and ref
      setLocalStream(stream);
      localStreamRef.current = stream;
      console.log('✅ Stream stored in ref:', !!localStreamRef.current);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('Set stream to video element');
        
        // Force play for local video
        localVideoRef.current.play().catch(err => {
          console.error('Error playing local video:', err);
        });
      }
      
      // Store original video track for screen sharing
      if (callType === 'video') {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          setOriginalVideoTrack(videoTrack.clone());
        }
      }
      
      setCallStarted(true);
      console.log('Call started, setting up socket listeners...');

      // Setup socket listeners
      socket.on('user:joined-call', handleUserJoinedCall);
      socket.on('webrtc:offer', handleReceiveOffer);
      socket.on('webrtc:answer', handleReceiveAnswer);
      socket.on('webrtc:ice-candidate', handleReceiveIceCandidate);
      socket.on('call:ended', handleCallEnded);
      socket.on('user:left-call', handleUserLeftCall);
      
      console.log('Socket listeners set up, emitting call:join...');
      // Notify others that we joined - IMPORTANT: Pass the stream in a ref so handlers can access it
      setTimeout(() => {
        socket.emit('call:join', { channelId, callType });
        console.log('Emitted call:join for channel:', channelId);
      }, 100); // Small delay to ensure stream is fully set
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Could not access camera/microphone. Please check permissions.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permission denied. Please allow access to camera/microphone in your browser settings and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found. Please connect a device and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is already in use by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera/microphone does not meet the requirements. Please check your device.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Access denied due to security restrictions. Please use HTTPS or localhost.';
      }
      
      alert(errorMessage);
      navigate(-1);
    }
  };



  // Handle when a new user joins the call
  const handleUserJoinedCall = ({ userId, socketId, username }) => {
    console.log('🔔 User joined call:', username, 'userId:', userId, 'socketId:', socketId);
    console.log('📡 Local stream ref available:', !!localStreamRef.current);
    console.log('👥 Current peers count:', peersRef.current.length);
    
    if (!localStreamRef.current) {
      console.error('❌ No local stream in ref yet!');
      return;
    }
    
    // Check if peer already exists
    const existingPeer = peersRef.current.find(p => p.peerID === socketId);
    if (existingPeer) {
      console.log('⚠️ Peer already exists, skipping:', socketId);
      return;
    }
    
    console.log('✅ Creating peer connection as initiator for:', socketId);
    // Create peer connection as initiator using ref
    const peer = createPeer(socketId, localStreamRef.current);
    
    peersRef.current.push({
      peerID: socketId,
      userId: userId,
      peer
    });
    
    setPeers(prevPeers => [...prevPeers, { peerID: socketId, userId, peer }]);
    console.log('📊 Updated peers count:', peersRef.current.length);
  };

  // Create a peer connection as the initiator
  const createPeer = (socketId, stream) => {
    console.log('🔧 Creating peer (initiator) for socketId:', socketId);
    console.log('🔧 Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
    
    const peer = new Peer({
      initiator: true,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          // Public TURN servers for better connectivity
          { 
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          { 
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ],
        sdpSemantics: 'unified-plan'
      },
      offerOptions: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video'
      }
    });

    peer.on('signal', signal => {
      console.log('📤 Sending offer to:', socketId, 'Signal type:', signal.type);
      socket.emit('webrtc:offer', {
        channelId,
        offer: signal,
        peerId: socketId
      });
    });

    peer.on('stream', stream => {
      console.log('🎥 Received stream from peer:', socketId);
      console.log('🎥 Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
    });

    peer.on('error', err => {
      console.error('❌ Peer error:', err);
      console.error('❌ Error message:', err.message);
    });

    peer.on('close', () => {
      console.log('🔌 Peer connection closed:', socketId);
    });

    peer.on('connect', () => {
      console.log('✅ Peer connected:', socketId);
    });
    
    // Monitor ICE connection state
    if (peer._pc) {
      peer._pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state (${socketId}):`, peer._pc.iceConnectionState);
      };
      
      peer._pc.onconnectionstatechange = () => {
        console.log(`Connection state (${socketId}):`, peer._pc.connectionState);
      };
      
      peer._pc.onicegatheringstatechange = () => {
        console.log(`ICE gathering state (${socketId}):`, peer._pc.iceGatheringState);
      };
    }

    return peer;
  };

  // Handle receiving an offer from another peer
  const handleReceiveOffer = ({ offer, peerId, userId }) => {
    console.log('📥 Received offer from peerId:', peerId, 'userId:', userId);
    console.log('📡 Offer type:', offer.type);
    console.log('📡 Local stream ref available:', !!localStreamRef.current);
    
    if (!localStreamRef.current) {
      console.error('❌ Cannot accept offer - no local stream in ref!');
      return;
    }
    
    // Check if peer already exists
    const existingPeer = peersRef.current.find(p => p.peerID === peerId);
    if (existingPeer) {
      console.log('⚠️ Peer already exists for offer, skipping:', peerId);
      return;
    }
    
    console.log('✅ Creating peer connection as receiver for:', peerId);
    const peer = addPeer(offer, peerId, localStreamRef.current);
    
    peersRef.current.push({
      peerID: peerId,
      userId: userId,
      peer
    });

    setPeers(prevPeers => [...prevPeers, { peerID: peerId, userId, peer }]);
    console.log('📊 Updated peers count:', peersRef.current.length);
  };

  // Create a peer connection as the receiver
  const addPeer = (incomingSignal, callerID, stream) => {
    console.log('🔧 Creating peer (receiver) for callerID:', callerID);
    console.log('🔧 Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
    
    const peer = new Peer({
      initiator: false,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          // Public TURN servers for better connectivity
          { 
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          { 
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ],
        sdpSemantics: 'unified-plan'
      },
      answerOptions: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video'
      }
    });

    peer.on('signal', signal => {
      console.log('📤 Sending answer to:', callerID, 'Signal type:', signal.type);
      socket.emit('webrtc:answer', {
        channelId,
        answer: signal,
        peerId: callerID
      });
    });

    peer.on('stream', stream => {
      console.log('🎥 Received stream from peer:', callerID);
      console.log('🎥 Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
    });

    peer.on('error', err => {
      console.error('❌ Peer error:', err);
      console.error('❌ Error message:', err.message);
    });

    peer.on('close', () => {
      console.log('🔌 Peer connection closed:', callerID);
    });

    peer.on('connect', () => {
      console.log('✅ Peer connected:', callerID);
    });
    
    // Monitor ICE connection state
    if (peer._pc) {
      peer._pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state (${callerID}):`, peer._pc.iceConnectionState);
      };
      
      peer._pc.onconnectionstatechange = () => {
        console.log(`Connection state (${callerID}):`, peer._pc.connectionState);
      };
      
      peer._pc.onicegatheringstatechange = () => {
        console.log(`ICE gathering state (${callerID}):`, peer._pc.iceGatheringState);
      };
    }

    console.log('📥 Signaling incoming offer to peer...');
    peer.signal(incomingSignal);

    return peer;
  };

  // Handle receiving an answer
  const handleReceiveAnswer = ({ answer, peerId }) => {
    console.log('📥 Received answer from peerId:', peerId);
    console.log('📡 Answer type:', answer.type);
    const item = peersRef.current.find(p => p.peerID === peerId);
    if (item) {
      console.log('✅ Found peer, signaling answer');
      item.peer.signal(answer);
    } else {
      console.error('❌ Peer not found for answer:', peerId);
      console.log('Current peers:', peersRef.current.map(p => p.peerID));
    }
  };

  // Handle receiving ICE candidate
  const handleReceiveIceCandidate = ({ candidate, peerId }) => {
    const item = peersRef.current.find(p => p.peerID === peerId);
    if (item && candidate) {
      item.peer.signal(candidate);
    }
  };

  // Handle when a user leaves the call
  const handleUserLeftCall = ({ socketId }) => {
    console.log('User left call:', socketId);
    const peerObj = peersRef.current.find(p => p.peerID === socketId);
    if (peerObj) {
      peerObj.peer.destroy();
    }
    peersRef.current = peersRef.current.filter(p => p.peerID !== socketId);
    setPeers(prevPeers => prevPeers.filter(p => p.peerID !== socketId));
  };

  const handleCallEnded = () => {
    endCall();
  };

  const toggleAudio = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always'
          },
          audio: false
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            localStream.removeTrack(videoTrack);
            videoTrack.stop();
          }
          localStream.addTrack(screenTrack);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }

          // Update all peer connections
          peersRef.current.forEach(({ peer }) => {
            const sender = peer._pc?.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
              sender.replaceTrack(screenTrack);
            }
          });

          screenTrack.onended = () => {
            stopScreenShare();
          };

          setScreenSharing(true);
          socket.emit('screen:share-start', { channelId });
        }
      } catch (error) {
        console.error('Error sharing screen:', error);
        if (error.name !== 'NotAllowedError') {
          alert('Failed to share screen. Please try again.');
        }
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    try {
      if (localStream && callType === 'video') {
        // Stop current screen track
        const screenTrack = localStream.getVideoTracks()[0];
        if (screenTrack) {
          screenTrack.stop();
          localStream.removeTrack(screenTrack);
        }

        // Get new camera stream
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          } 
        });
        const videoTrack = videoStream.getVideoTracks()[0];

        localStream.addTrack(videoTrack);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Update all peer connections
        peersRef.current.forEach(({ peer }) => {
          const sender = peer._pc?.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        setScreenSharing(false);
        socket.emit('screen:share-stop', { channelId });
      }
    } catch (error) {
      console.error('Error stopping screen share:', error);
      alert('Failed to restore camera. Please refresh the call.');
    }
  };

  const cleanupCall = () => {
    console.log('Cleaning up call resources...');
    
    // Clean up local stream
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
      localStreamRef.current = null;
    }

    // Clean up original video track
    if (originalVideoTrack) {
      originalVideoTrack.stop();
      setOriginalVideoTrack(null);
    }

    // Clean up peer connections
    peersRef.current.forEach(({ peer }) => {
      if (peer) {
        peer.destroy();
      }
    });
    peersRef.current = [];
    setPeers([]);

    // Clean up socket listeners
    if (socket) {
      socket.emit('call:end', { channelId });
      socket.off('user:joined-call', handleUserJoinedCall);
      socket.off('webrtc:offer', handleReceiveOffer);
      socket.off('webrtc:answer', handleReceiveAnswer);
      socket.off('webrtc:ice-candidate', handleReceiveIceCandidate);
      socket.off('call:ended', handleCallEnded);
      socket.off('user:left-call', handleUserLeftCall);
    }
  };

  const endCall = () => {
    console.log('Ending call and navigating back...');
    isCleaningUpRef.current = true;
    cleanupCall();
    navigate(-1);
  };

  return (
    <div className="video-call">
      <div className="video-call-header">
        <h2>{callType === 'audio' ? 'Voice Call' : 'Video Call'}</h2>
        <button className="close-call-btn" onClick={endCall}>
          <FiX /> Leave Call
        </button>
      </div>

      <div className="video-grid">
        {callType === 'video' && (
          <div className="video-container local-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="video-element"
            />
            <div className="video-label">You {screenSharing && '(Sharing Screen)'}</div>
            {!videoEnabled && (
              <div className="video-disabled-overlay">
                <FiVideoOff size={48} />
                <span>Camera Off</span>
              </div>
            )}
          </div>
        )}
        
        {callType === 'audio' && (
          <div className="audio-call-container">
            <div className="audio-avatar">
              <FiPhone size={64} />
              <p className="audio-status">
                {audioEnabled ? 'Microphone On' : 'Muted'}
              </p>
            </div>
          </div>
        )}

        {peers.map(({ peerID, peer }, index) => (
          <VideoPlayer key={peerID} peer={peer} index={index} callType={callType} />
        ))}
        
        {peers.length === 0 && callStarted && (
          <div className="waiting-container">
            <p>Waiting for others to join...</p>
          </div>
        )}
      </div>

      <div className="video-controls">
        <button
          className={`control-btn ${!audioEnabled ? 'disabled' : ''}`}
          onClick={toggleAudio}
          title={audioEnabled ? 'Mute' : 'Unmute'}
        >
          {audioEnabled ? <FiMic /> : <FiMicOff />}
        </button>

        {callType === 'video' && (
          <>
            <button
              className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
              onClick={toggleVideo}
              title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {videoEnabled ? <FiVideo /> : <FiVideoOff />}
            </button>

            <button
              className={`control-btn ${screenSharing ? 'active' : ''}`}
              onClick={toggleScreenShare}
              title={screenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <FiMonitor />
            </button>
          </>
        )}

        <button
          className="control-btn end-call"
          onClick={endCall}
          title="End call"
        >
          <FiPhone />
        </button>
      </div>
    </div>
  );
}

function VideoPlayer({ peer, index, callType }) {
  const ref = useRef();
  const audioRef = useRef(); // Separate ref for audio element
  const [hasStream, setHasStream] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    const videoElement = ref.current;
    const audioElement = audioRef.current;
    
    const handleStream = (stream) => {
      console.log('VideoPlayer received stream, callType:', callType);
      console.log('Stream ID:', stream.id);
      console.log('Stream has audio tracks:', stream.getAudioTracks().length);
      console.log('Stream has video tracks:', stream.getVideoTracks().length);
      
      // Log track details
      stream.getTracks().forEach(track => {
        console.log(`Track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
      });
      
      setRemoteStream(stream);
      setHasStream(true);
      
      if (callType === 'audio' && audioElement) {
        // For audio calls, use audio element
        audioElement.srcObject = stream;
        console.log('✅ Audio stream set to audio element');
        
        // Force play to overcome autoplay policies
        audioElement.play().catch(err => {
          console.error('Error playing audio:', err);
        });
      } else if (callType === 'video' && videoElement) {
        // For video calls, use video element  
        videoElement.srcObject = stream;
        console.log('✅ Video stream set to video element');
        
        // Force play to overcome autoplay policies
        videoElement.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
    };
    
    peer.on('stream', handleStream);

    // Check if stream already exists (race condition)
    if (peer.streams && peer.streams.length > 0) {
      console.log('Stream already exists on peer, setting it now');
      handleStream(peer.streams[0]);
    }

    return () => {
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
      }
      if (audioElement && audioElement.srcObject) {
        audioElement.srcObject.getTracks().forEach(track => track.stop());
        audioElement.srcObject = null;
      }
    };
  }, [peer, callType]);

  if (callType === 'audio') {
    return (
      <div className="audio-participant">
        {/* Audio element to play the remote audio - NOT muted so we can hear */}
        <audio 
          ref={audioRef} 
          autoPlay 
          playsInline
        />
        <div className="audio-avatar">
          <FiPhone size={48} />
          <p>Participant {index + 1}</p>
          {hasStream && (
            <p style={{ fontSize: '0.8rem', color: '#2eb67d', marginTop: '10px' }}>
              🔊 Connected
            </p>
          )}
          {!hasStream && (
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
              Connecting...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="video-container">
      <video 
        ref={ref} 
        autoPlay 
        playsInline 
        className="video-element"
      />
      <div className="video-label">Participant {index + 1}</div>
      {!hasStream && (
        <div className="video-loading">
          <p>Connecting...</p>
        </div>
      )}
      {hasStream && remoteStream && (
        <div className="stream-info">
          <small style={{ fontSize: '0.7rem', color: '#2eb67d' }}>
            🟢 Live
          </small>
        </div>
      )}
    </div>
  );
}

export default VideoCall;

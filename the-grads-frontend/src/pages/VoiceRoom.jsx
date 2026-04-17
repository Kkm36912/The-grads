import React, { useEffect, useRef, useState, useMemo, useCallback, useContext } from "react";
import * as mediasoupClient from "mediasoup-client";
import { AuthContext } from "../context/AuthContext";
import { getVoiceSocket } from "../lib/socket";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Radio } from 'lucide-react';

const ROOM_ID = "global-voice";
const SPEAKER_HOLD = 800;

const PeerTile = React.memo(({ peer, isActiveSpeaker, onClick }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video && !audio) return;

    const videoTracks = peer.stream.getVideoTracks();
    const audioTracks = peer.stream.getAudioTracks();

    if (video) {
      video.srcObject = new MediaStream(videoTracks);
      video.play().catch(() => {});
    }
    if (audio) {
      audio.srcObject = new MediaStream(audioTracks);
      setTimeout(() => audio.play().catch(() => {}), 100);
    }
  }, [peer.stream, peer.username]);

  const videoTrack = peer.stream.getVideoTracks();
  const isVideoTrackLive = !!videoTrack && videoTrack.readyState === "live";
  const shouldShowVideo = peer.hasVideo && peer.videoEnabled !== false && isVideoTrackLive;

  return (
    <div 
      onClick={onClick} 
      className={`relative bg-[#040a0f]/80 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
        isActiveSpeaker 
        ? "ring-2 ring-grads-cyan shadow-[0_0_20px_rgba(14,165,233,0.3)] scale-[1.02]" 
        : "border border-white/10 hover:border-white/20"
      }`}
    >
      {!peer.isSelf && <audio ref={audioRef} autoPlay playsInline />}
      
      {shouldShowVideo ? (
        <video ref={videoRef} data-socket-id={peer.socketId} autoPlay playsInline muted className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-gradient-to-b from-white/5 to-transparent">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-3 transition-all ${
            isActiveSpeaker ? "bg-grads-cyan/20 text-grads-cyan border-2 border-grads-cyan shadow-[0_0_15px_rgba(14,165,233,0.5)]" : "bg-white/5 text-slate-300 border border-white/10"
          }`}>
            {peer.username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Status Badges */}
      <div className="absolute top-3 right-3 flex gap-2">
        {peer.audioEnabled === false && (
          <div className="bg-red-500/20 text-red-400 border border-red-500/30 p-1.5 rounded-lg backdrop-blur-md">
            <MicOff className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Name Tag */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 shadow-lg">
        {isActiveSpeaker && <div className="w-2 h-2 rounded-full bg-grads-cyan animate-pulse"></div>}
        {peer.username} {peer.isSelf ? <span className="text-grads-cyan text-xs font-bold">(You)</span> : ""}
      </div>
    </div>
  );
}, (prev, next) => (
  prev.peer.stream === next.peer.stream &&
  prev.peer.hasAudio === next.peer.hasAudio &&
  prev.peer.hasVideo === next.peer.hasVideo &&
  prev.peer.audioEnabled === next.peer.audioEnabled &&
  prev.peer.videoEnabled === next.peer.videoEnabled &&
  prev.isActiveSpeaker === next.isActiveSpeaker
));

export default function VoiceRoom({ switchTab }) {
  const { user } = useContext(AuthContext);

  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState("gallery");

  const [allUsers, setAllUsers] = useState([]);
  const [peers, setPeers] = useState({});

  const PAGE_SIZE = mode === "focus" ? 6 : 16;

  const socketRef = useRef(null);
  const deviceRef = useRef(null);
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);
  const audioProducerRef = useRef(null);
  const videoProducerRef = useRef(null);
  const localStreamRef = useRef(null);
  const joiningRef = useRef(false);
  const manuallyLeftRef = useRef(false);

  const consumedSetRef = useRef(new Set());
  const consumerMapRef = useRef(new Map());
  const producerOwnerMapRef = useRef(new Map());
  const lastSpeakerRef = useRef(null);
  const lastSpeakerAtRef = useRef(0);

  const orderedUsers = useMemo(() => {
    const ids = allUsers.map((u) => u.socketId);
    if (!activeSpeaker || !ids.includes(activeSpeaker)) return ids;
    return [activeSpeaker, ...ids.filter((id) => id !== activeSpeaker)];
  }, [allUsers, activeSpeaker]);

  const finalVisibleUsers = useMemo(() => {
    const start = page * PAGE_SIZE;
    const end = (page + 1) * PAGE_SIZE;
    let visible = orderedUsers.slice(start, end);
    if (activeSpeaker && !visible.includes(activeSpeaker) && orderedUsers.includes(activeSpeaker)) {
      visible = [activeSpeaker, ...visible.slice(0, PAGE_SIZE - 1)];
    }
    return visible;
  }, [orderedUsers, page, PAGE_SIZE, activeSpeaker]);

  const totalUsers = allUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  useEffect(() => { if (page >= totalPages) setPage(Math.max(0, totalPages - 1)); }, [page, totalPages]);
  useEffect(() => { setPage(0); }, [mode]);

  const visiblePeers = useMemo(() => {
    return Object.values(peers)
      .filter((peer) => finalVisibleUsers.includes(peer.socketId) || peer.isSelf)
      .sort((a, b) => (a.socketId === activeSpeaker ? -1 : b.socketId === activeSpeaker ? 1 : 0));
  }, [peers, finalVisibleUsers, activeSpeaker]);

  useEffect(() => {
    if (!socketRef.current || !joined) return;
    socketRef.current.emit("voice:updateVisible", { visibleUsers: finalVisibleUsers, mode });
  }, [finalVisibleUsers, mode, joined]);

  const upsertPeerTrack = useCallback((socketId, username, track, isSelf = false) => {
    setPeers((prev) => {
      const existing = prev[socketId];
      let newStream;
      if (existing) {
        const existingTracks = existing.stream.getTracks().filter((t) => t.kind !== track.kind);
        newStream = new MediaStream([...existingTracks, track]);
      } else {
        newStream = new MediaStream([track]);
      }
      return {
        ...prev,
        [socketId]: {
          socketId, username, stream: newStream, isSelf,
          hasAudio: newStream.getAudioTracks().length > 0,
          hasVideo: newStream.getVideoTracks().length > 0,
          audioEnabled: existing?.audioEnabled ?? true,
          videoEnabled: existing?.videoEnabled ?? true,
        },
      };
    });
  }, []);

  const removePeerTrack = useCallback((socketId, kind) => {
    setPeers((prev) => {
      const peer = prev[socketId];
      if (!peer) return prev;
      const remainingTracks = peer.stream.getTracks().filter((t) => t.kind !== kind);
      if (remainingTracks.length === 0 && !peer.isSelf) {
        const clone = { ...prev };
        delete clone[socketId];
        return clone;
      }
      return {
        ...prev,
        [socketId]: {
          ...peer, stream: new MediaStream(remainingTracks),
          hasAudio: remainingTracks.some(t => t.kind === 'audio'),
          hasVideo: remainingTracks.some(t => t.kind === 'video'),
        },
      };
    });
  }, []);

  const removePeerCompletely = useCallback((socketId) => {
    setPeers((prev) => { const clone = { ...prev }; delete clone[socketId]; return clone; });
    setAllUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    for (const [producerId, meta] of producerOwnerMapRef.current.entries()) {
      if (meta.socketId === socketId) {
        const consumer = consumerMapRef.current.get(producerId);
        if (consumer) { try { consumer.close(); } catch {} consumerMapRef.current.delete(producerId); }
        producerOwnerMapRef.current.delete(producerId);
        consumedSetRef.current.delete(producerId);
      }
    }
    if (activeSpeaker === socketId) { setActiveSpeaker(null); lastSpeakerRef.current = null; }
  }, [activeSpeaker]);

  const updatePeerMediaState = useCallback((socketId, next) => {
    setPeers((prev) => {
      const peer = prev[socketId];
      if (!peer) return prev;
      return { ...prev, [socketId]: { ...peer, audioEnabled: next.audio ?? peer.audioEnabled, videoEnabled: next.video ?? peer.videoEnabled } };
    });
  }, []);

  const cleanupEverything = useCallback((options) => {
    const keepSocketAlive = options?.keepSocketAlive ?? false;
    try { audioProducerRef.current?.close(); } catch {}
    try { videoProducerRef.current?.close(); } catch {}
    try { sendTransportRef.current?.close(); } catch {}
    try { recvTransportRef.current?.close(); } catch {}
    localStreamRef.current?.getTracks().forEach((t) => { try { t.stop(); } catch {} });
    consumerMapRef.current.forEach((consumer) => { try { consumer.close(); } catch {} });
    consumerMapRef.current.clear(); producerOwnerMapRef.current.clear(); consumedSetRef.current.clear();
    if (!keepSocketAlive && socketRef.current) { try { socketRef.current.removeAllListeners(); socketRef.current.disconnect(); } catch {} }
    if (!keepSocketAlive) socketRef.current = null;
    deviceRef.current = null; sendTransportRef.current = null; recvTransportRef.current = null;
    audioProducerRef.current = null; videoProducerRef.current = null; localStreamRef.current = null;
    joiningRef.current = false;
    setPeers({}); setAllUsers([]); setJoined(false); setMuted(false); setCameraOff(true); setActiveSpeaker(null); setPage(0);
  }, []);

  useEffect(() => { return () => { manuallyLeftRef.current = true; cleanupEverything(); }; }, [cleanupEverything]);

  const leaveVoice = useCallback(() => {
    manuallyLeftRef.current = true;
    if (socketRef.current) { try { socketRef.current.emit("voice:leaveRoom"); } catch {} }
    cleanupEverything();
  }, [cleanupEverything]);

  const consume = useCallback(async (producerId, username, socketId, kind) => {
    const socket = socketRef.current;
    const device = deviceRef.current;
    const recvTransport = recvTransportRef.current;
    if (!socket || socket.id === socketId || !device || !recvTransport) return;

    try {
      const data = await new Promise((res) => socket.emit("voice:consume", { producerId, rtpCapabilities: device.rtpCapabilities }, res));
      if (!data || data.error) { consumedSetRef.current.delete(producerId); return; }
      const consumer = await recvTransport.consume({ id: data.id, producerId: data.producerId, kind: data.kind, rtpParameters: data.rtpParameters });
      await consumer.resume?.();
      consumerMapRef.current.set(producerId, consumer);
      producerOwnerMapRef.current.set(producerId, { socketId, kind });
      upsertPeerTrack(socketId, username, consumer.track, false);

      const cleanup = () => { removePeerTrack(socketId, consumer.kind); consumerMapRef.current.delete(producerId); producerOwnerMapRef.current.delete(producerId); consumedSetRef.current.delete(producerId); };
      consumer.on("trackended", cleanup); consumer.on("transportclose", cleanup); consumer.on("producerclose", cleanup);
    } catch (err) { consumedSetRef.current.delete(producerId); }
  }, [removePeerTrack, upsertPeerTrack]);

  useEffect(() => {
    if (!joined) return;
    const run = async () => {
      for (const user of allUsers) {
        for (const producer of Object.values(user.producers)) {
          if (producer.kind === "video" && !finalVisibleUsers.includes(user.socketId)) continue;
          if (consumedSetRef.current.has(producer.producerId)) continue;
          consumedSetRef.current.add(producer.producerId);
          await consume(producer.producerId, user.username, user.socketId, producer.kind);
        }
      }
    };
    run();
  }, [allUsers, consume, finalVisibleUsers, joined]);

  const joinVoice = useCallback(async () => {
    if (joiningRef.current || joined) return;
    joiningRef.current = true;
    manuallyLeftRef.current = false;

    try {
      if (socketRef.current) { try { socketRef.current.removeAllListeners(); socketRef.current.disconnect(); } catch {} socketRef.current = null; }
      await new Promise((res) => setTimeout(res, 50));
      if (!user?.username) { joiningRef.current = false; return; }

      const socket = getVoiceSocket();
      socketRef.current = socket;
      const device = new mediasoupClient.Device();
      deviceRef.current = device;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true },
        video: false
      });
      localStreamRef.current = stream;

      socket.on("voice:existingProducers", (producers) => {
        const map = new Map();
        producers.forEach((p) => {
          if (!map.has(p.socketId)) map.set(p.socketId, { socketId: p.socketId, username: p.username, producers: {} });
          map.get(p.socketId).producers[p.kind] = p;
        });
        setAllUsers([...map.values()]);
      });

      socket.on("voice:newProducer", (producer) => {
        setAllUsers((prev) => {
          const existing = prev.find((p) => p.socketId === producer.socketId);
          if (existing) return prev.map((p) => p.socketId === producer.socketId ? { ...p, producers: { ...p.producers, [producer.kind]: producer } } : p);
          return [...prev, { socketId: producer.socketId, username: producer.username, producers: { [producer.kind]: producer } }];
        });
      });

      socket.on("voice:peerLeft", ({ socketId }) => removePeerCompletely(socketId));
      socket.on("voice:mediaState", ({ socketId, audio, video }) => updatePeerMediaState(socketId, { audio, video }));
      socket.on("voice:activeSpeaker", ({ socketId }) => {
        if (!socketId) { setActiveSpeaker(null); return; }
        setActiveSpeaker(socketId);
      });

      if (!socket.connected) await new Promise((resolve) => socket.once("connect", resolve));
      await new Promise((res) => socket.emit("voice:joinRoom", { roomId: ROOM_ID, username: user.username }, res));
      const rtpCapabilities = await new Promise((res) => socket.emit("voice:getRtpCapabilities", null, res));
      await device.load({ routerRtpCapabilities: rtpCapabilities });

      const sendParams = await new Promise((res) => socket.emit("voice:createTransport", { type: "send" }, res));
      const sendTransport = device.createSendTransport({ ...sendParams, iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      sendTransportRef.current = sendTransport;

      sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
        socket.emit("voice:connectTransport", { type: "send", dtlsParameters }, (response) => { if (response?.error) errback(); else callback(); });
      });
      sendTransport.on("produce", ({ kind, rtpParameters }, callback, errback) => {
        socket.emit("voice:produce", { kind, rtpParameters }, (response) => { if (response?.error) errback(); else callback({ id: response.id }); });
      });

      const recvParams = await new Promise((res) => socket.emit("voice:createTransport", { type: "recv" }, res));
      const recvTransport = device.createRecvTransport({ ...recvParams, iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      recvTransportRef.current = recvTransport;
      recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
        socket.emit("voice:connectTransport", { type: "recv", dtlsParameters }, (response) => { if (response?.error) errback(); else callback(); });
      });

      const audioTrack = stream.getAudioTracks();
      if (audioTrack) audioProducerRef.current = await sendTransport.produce({ track: audioTrack, codecOptions: { opusDtx: true } });

      setPeers((prev) => ({
        ...prev,
        [socket.id]: { socketId: socket.id, username: user.username, stream: new MediaStream([audioTrack].filter(Boolean)), isSelf: true, hasAudio: !!audioTrack, hasVideo: false, audioEnabled: true, videoEnabled: false }
      }));

      socket.emit("voice:mediaState", { audio: true, video: false });
      socket.emit("voice:getProducers");
      setJoined(true);
    } catch (err) {
      console.warn(err); leaveVoice();
    } finally {
      joiningRef.current = false;
    }
  }, [joined, leaveVoice, user, removePeerCompletely, updatePeerMediaState]);

  const toggleMute = useCallback(async () => {
    if (!audioProducerRef.current) return;
    if (muted) {
      await audioProducerRef.current.resume();
      localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = true));
    } else {
      await audioProducerRef.current.pause();
      localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = false));
    }
    socketRef.current?.emit("voice:mediaState", { audio: muted, video: !cameraOff });
    setPeers((prev) => ({ ...prev, [socketRef.current?.id]: { ...prev[socketRef.current?.id], audioEnabled: muted } }));
    setMuted(!muted);
  }, [muted, cameraOff]);

  const toggleCamera = useCallback(async () => {
    if (!sendTransportRef.current) return;
    if (!cameraOff) {
      try { videoProducerRef.current?.close(); } catch {}
      videoProducerRef.current = null;
      localStreamRef.current?.getVideoTracks().forEach((t) => { try { t.stop(); } catch {} });
      setPeers((prev) => {
        const self = prev[socketRef.current?.id];
        if (!self) return prev;
        return { ...prev, [self.socketId]: { ...self, stream: new MediaStream(localStreamRef.current.getAudioTracks()), hasVideo: false, videoEnabled: false } };
      });
      socketRef.current?.emit("voice:mediaState", { audio: !muted, video: false });
      setCameraOff(true);
    } else {
      const freshStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } } });
      const freshVideoTrack = freshStream.getVideoTracks();
      localStreamRef.current = new MediaStream([...localStreamRef.current.getAudioTracks(), freshVideoTrack]);
      videoProducerRef.current = await sendTransportRef.current.produce({ track: freshVideoTrack, codecOptions: { videoGoogleStartBitrate: 400 } });
      setPeers((prev) => {
        const self = prev[socketRef.current?.id];
        if (!self) return prev;
        return { ...prev, [self.socketId]: { ...self, stream: new MediaStream(localStreamRef.current.getTracks()), hasVideo: true, videoEnabled: true } };
      });
      socketRef.current?.emit("voice:mediaState", { audio: !muted, video: true });
      setTimeout(() => { socketRef.current?.emit("voice:getProducers"); }, 100);
      setCameraOff(false);
    }
  }, [cameraOff, muted]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="p-4 md:px-8 bg-white/5 border border-white/10 rounded-t-3xl backdrop-blur-md flex flex-wrap justify-between items-center gap-4 z-10 shadow-lg mt-2 mx-2 md:mx-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-grads-magenta/10 rounded-lg">
            <Radio className="w-5 h-5 text-grads-magenta animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-wide text-sm">Global Audio Channel</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest">{totalUsers} ONLINE</p>
            </div>
          </div>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
          <button onClick={() => setMode("focus")} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mode === "focus" ? "bg-grads-magenta text-white shadow-md" : "text-slate-400 hover:text-white"}`}>Focus</button>
          <button onClick={() => setMode("gallery")} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mode === "gallery" ? "bg-grads-magenta text-white shadow-md" : "text-slate-400 hover:text-white"}`}>Gallery</button>
        </div>

        <button 
          onClick={() => switchTab('chat')}
          className="text-[10px] font-mono px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-full hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest"
        >
          Return to Chat
        </button>
      </div>

      {/* MAIN ARENA */}
      <div className="flex-1 bg-[#040a0f]/60 backdrop-blur-2xl border-x border-white/10 mx-2 md:mx-4 relative overflow-hidden flex flex-col">
        {!joined ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20">
            <div className="w-24 h-24 bg-grads-magenta/10 border border-grads-magenta/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(217,70,239,0.15)]">
              <Mic className="w-10 h-10 text-grads-magenta" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Join the Stream</h3>
            <p className="text-slate-400 text-sm max-w-md mb-8">Connect your microphone to collaborate and discuss challenges with other Grads in real-time.</p>
            <button onClick={joinVoice} className="px-8 py-4 bg-grads-magenta hover:bg-grads-magenta/80 text-white rounded-2xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.4)]">
              Establish Connection
            </button>
          </div>
        ) : (
          <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar grid gap-4 ${mode === "focus" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"} auto-rows-max`}>
            {visiblePeers.map((peer) => (
              <PeerTile key={peer.socketId} peer={peer} isActiveSpeaker={activeSpeaker === peer.socketId} onClick={() => { setMode("focus"); setActiveSpeaker(peer.socketId); }} />
            ))}
          </div>
        )}
      </div>

      {/* CONTROL BAR */}
      {joined && (
        <div className="p-4 md:px-8 bg-white/5 border border-white/10 rounded-b-3xl backdrop-blur-md flex flex-wrap justify-center items-center gap-4 z-10 shadow-lg mb-2 mx-2 md:mx-4">
          <button onClick={toggleMute} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${muted ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" : "bg-white/10 text-white border border-white/10 hover:bg-white/20"}`}>
            {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {muted ? "Unmuted" : "Mute Mic"}
          </button>
          
          <button onClick={toggleCamera} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${cameraOff ? "bg-white/10 text-white border border-white/10 hover:bg-white/20" : "bg-grads-cyan/20 text-grads-cyan border border-grads-cyan/30 hover:bg-grads-cyan/30"}`}>
            {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            {cameraOff ? "Enable Video" : "Disable Video"}
          </button>

          <button onClick={leaveVoice} className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)] ml-auto">
            <PhoneOff className="w-5 h-5" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
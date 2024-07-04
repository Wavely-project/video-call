/* eslint-disable no-promise-executor-return */
/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
import './Tile.css';
import { DailyVideo, useVideoTrack, useLocalSessionId, useAudioTrack } from '@daily-co/daily-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// eslint-disable-next-line
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import RecordRTC from 'recordrtc';
import io from 'socket.io-client';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// eslint-disable-next-line camelcase
import hand_landmarker_task from '../../hand_landmarker.task';
import Username from '../Username/Username';

const socket = io.connect('http://localhost:3005');

export default function Tile({ id, isScreenShare, isLocal, isAlone, isDeaf }) {
  const videoState = useVideoTrack(id);
  const localSessionId = useLocalSessionId();
  const localAudio = useAudioTrack(localSessionId);
  const mutedAudio = localAudio.isOff;
  const [roomId, setRoomId] = useState(null);
  const [messageReceived, setMessageReceived] = useState([]);

  const removeWords = () => {
    setMessageReceived((prevTranscript) => {
      const wordCount = prevTranscript.length;
      let wordsToRemove = 1; // Default number of words to remove

      // Customize logic to determine how many words to remove based on word count
      if (wordCount > 50) {
        wordsToRemove = 5;
      } else if (wordCount > 30) {
        wordsToRemove = 3;
      } else if (wordCount > 10) {
        wordsToRemove = 2;
      }

      return prevTranscript.slice(wordsToRemove);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (messageReceived.length > 0) {
        removeWords();
      }
    }, 6000); // Check and remove words every 6 seconds

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [messageReceived]);

  if (messageReceived !== '') {
    // console.log('messageReceived', messageReceived);
  }
  const joinRoom = (roomid) => {
    if (roomid !== '') {
      console.log('joinRoom', id, roomid);
      socket.emit('joinRoom', roomid);
    }
  };

  useEffect(() => {
    const url = window.location.href;

    const getRoomId = (url) => {
      const urlParams = new URLSearchParams(new URL(url).search);
      const roomUrl = urlParams.get('roomUrl');
      const regex = /\/([a-zA-Z0-9]+)$/;
      const match = roomUrl.match(regex);
      return match ? match[1] : null;
    };
    joinRoom(getRoomId(url));
    setRoomId(getRoomId(url));
  }, []);

  const sendMessage = (message) => {
    console.log('sendMessage socket', message, roomId);
    socket.emit('message', { message, roomId, id });
  };

  useEffect(() => {
    socket.on('message', (message) => {
      console.log('message reccc', message.message, message.id, id);
      if (message.id !== id) {
        // Don't understand why this is not working as expected
        console.log('returning same user');
        return;
      }
      setMessageReceived((prevMessages) => [...prevMessages, message.message]);
    });
    return () => {
      socket.off('message');
    };
  }, []);

  let containerCssClasses = isScreenShare ? 'tile-screenshare' : 'tile-video';
  // const mediaTrack = useMediaTrack(id, "video");

  const [blob, setBlob] = useState(null);
  const refVideo = useRef(null);
  const recorderRef = useRef(null);

  const [blobsx, setblobsx] = useState([]);
  const [numberOfdones, setNumberOfDones] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [handPresence, setHandPresence] = useState(null);
  const handsTimestampsRef = useRef([]);
  const [handsTimestamps, setHandsTimestamps] = useState([]);

  useEffect(() => {
    // console.log('handsTimestamps effect', handsTimestamps);
    handsTimestampsRef.current = handsTimestamps;
  }, [handsTimestamps]);

  const checkHandPresence = useCallback(
    (xx) => {
      // console.log('checkHandPresence', 'checkHandPresence', handsTimestampsRef.current);
      const fourSecondsAgo = new Date().getTime() - 4000;
      const last4SecondsData = xx.filter((item) => item.timestamp > fourSecondsAgo);
      const last40 = last4SecondsData.slice(-40);
      // console.log('last40', last40);
      const trueCount = last40.filter((item) => item.handPresence).length;
      return trueCount > 2;
    },
    [handsTimestamps, handsTimestampsRef],
  ); // Use handsTimestamps instead of handsTimestamps.length

  const handleRecording = async () => {
    // const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },

        // facingMode: "user",
        frameRate: 12,
      },

      audio: false,
    });

    // setStream(mediaStream);
    recorderRef.current = new RecordRTC(mediaStream, {
      type: 'video',
      mimeType: 'video/webm;codecs=vp9',
      timeSlice: 3000,
      ondataavailable(blob) {
        console.log('ondataavailable xxxx', blobsx);
        setblobsx((blobsx) => {
          const updatedBlobs = [...blobsx, blob]; // Use the blob parameter directly
          if (numberOfdones === 0) {
            setNumberOfDones((numberOfdones) => numberOfdones + 1);
          }
          return updatedBlobs;
        });
      },
    });
    recorderRef.current.startRecording();
  };

  const handlereddd = useCallback(
    async (blob) => {
      console.log('ondataavailable blobsxblobsx', blobsx);
      setBlob(blob);

      if (blob) {
        // console.log('checkHandPresence', handsTimestamps);
        console.log('checkHandPresence', checkHandPresence(handsTimestampsRef.current));
        if (checkHandPresence(handsTimestampsRef.current)) {
          setblobsx((blobsx) => {
            const updatedBlobs = [...blobsx, blob];
            return updatedBlobs;
          });
        }
      }
      if (blobsx.length === 1) {
        sendBlobsToServer(blobsx[0]);
      }
    },
    [recorderRef, setBlob, handsTimestamps, checkHandPresence, setblobsx, blobsx],
  );
  // console.log('blobsx', blobsx);

  const sendBlobsToServer = useCallback(
    async (bolb) => {
      console.log('isDeaf', isDeaf, 'Seding to the server !!!');
      if (isDeaf !== 'yes') {
        return;
      }
      console.log('Sending blobs to server', bolb);
      const formData = new FormData();
      const blob = new Blob([bolb], { type: 'video/webm;codecs=vp9' });
      formData.append('videofile', blob, `recorded-${blob.size}.webm`);

      const response = await fetch('http://192.168.1.3:3006/', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data) {
        console.log('Data sent from the server', data?.prediction?.[0]);
        sendMessage(data?.prediction?.[0]);
        setNumberOfDones((numberOfdones) => numberOfdones + 1);
        setblobsx((blobsx) => {
          const updatedBlobs = blobsx.slice(1);
          return updatedBlobs;
        });
      }
    },
    [isDeaf],
  );

  // useEffect(() => {
  //   if (blobsx.length > 0) {
  //     sendBlobsToServer(blobsx[0]);
  //     console.log('numberOfdones', numberOfdones);
  //     console.log('blobsx from use effect that sends many time', blobsx);
  //   }
  // }, [numberOfdones, isDeaf]);

  useEffect(() => {
    if (blobsx.length === 1 || blobsx.length > 0) {
      console.log('numberOfdones', numberOfdones);
      console.log('blobsx from use effect that sends many time', blobsx);
      // sendBlobsToServer(blobsx[0]);
    }
  }, [numberOfdones, isDeaf]);

  if (isDeaf === 'yes') {
    containerCssClasses += ' deaf';
  }

  if (isLocal) {
    containerCssClasses += ' self-view';
    if (isAlone) {
      containerCssClasses += ' alone';
    }
  }

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [transcriptTosend, setTransTouse] = useState('');
  useEffect(() => {
    if (interimTranscript !== '') {
      setTransTouse(interimTranscript);
    }
  }, [interimTranscript]);

  useEffect(() => {
    if (interimTranscript === '') {
      sendMessage(transcriptTosend);

      setTransTouse('');
    }
  }, [finalTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn&apos;t support speech recognition.</span>;
  }

  useEffect(() => {
    console.log(transcript);
  }, [transcript]);

  useEffect(() => {
    console.log('isDeaf', isDeaf);
    async function record() {
      await handleRecording();
    }

    if (isDeaf === 'yes') {
      record();
      console.log('Recording started');
    }
    if (isDeaf === 'no' && !mutedAudio) {
      console.log('Recording sound started xx');
      SpeechRecognition.startListening({
        continuous: true,
      });
    }
  }, [isDeaf]);

  useEffect(() => {
    if (mutedAudio) {
      SpeechRecognition.stopListening();
    } else if (!mutedAudio) {
      SpeechRecognition.startListening({
        continuous: true,
      });
    }
  }, [mutedAudio]);
  // console.log('isLocal', isLocal, 'isAlone', !isAlone);
  // console.log('vid is off?', videoState.isOff);

  useEffect(() => {
    let handLandmarker;
    let animationFrameId;

    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: hand_landmarker_task },
          numHands: 2,
          runningMode: 'video',
        });
        detectHands();
      } catch (error) {
        console.error('Error initializing hand detection:', error);
      }
    };

    const drawLandmarks = (landmarksArray) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';

      landmarksArray.forEach((landmarks) => {
        landmarks.forEach((landmark) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI); // Draw a circle for each landmark
          ctx.fill();
        });
      });
    };

    const detectHands = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const detections = handLandmarker.detectForVideo(videoRef.current, performance.now());
        setHandPresence(detections.handednesses.length > 0);

        // Assuming detections.landmarks is an array of landmark objects
        if (detections.landmarks) {
          drawLandmarks(detections.landmarks);
        }
      }
      requestAnimationFrame(detectHands);
    };

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
        await initializeHandDetection();
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (handLandmarker) {
        handLandmarker.close();
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const [tf, setTf] = useState(false);
  // Function to store handPresence and timestamp
  const storeHandPresence = useMemo(async () => {
    const timestamp = new Date().getTime();
    // console.log('storeHandPresence xx', handPresence, timestamp);
    if (isDeaf) {
      setHandsTimestamps((prevState) => [...prevState, { handPresence, timestamp }]);
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
    setTf(!tf);
    // await storeHandPresence();
  }, [handPresence, setHandsTimestamps, tf]);

  // Function to check handPresence in the last 4 seconds
  // console.log('checkHandPresence', handsTimestamps);
  // console.log('checkHandPresence', handsTimestamps);
  // useEffect(() => {
  //   if (isDeaf) {
  //     storeHandPresence();
  //   }
  // }, [isDeaf]);
  const [videoUrls, setVideoUrls] = useState([]);

  useEffect(() => {
    // Create a URL for each blob and store it in state
    const urls = blobsx.map((blob) => URL.createObjectURL(blob));
    setVideoUrls(urls);

    // Cleanup function to revoke the blob URLs
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobsx]);
  return (
    <div className={containerCssClasses}>
      {/* <h1>Is there a Hand? {handPresence ? 'Yes' : 'No'}</h1>
      <h1>Is there a Hand? {handPresence ? 'Yes' : 'No'}</h1> */}

      <DailyVideo
        ref={videoRef}
        automirror
        sessionId={id}
        type={isScreenShare ? 'screenVideo' : 'video'}
      />
      <canvas
        ref={canvasRef}
        style={{ backgroundColor: 'black', width: '600px', height: '480px', display: 'none' }}
      />
      <div className=" absolute w-10/12 transpciptWrapper">
        {!isLocal && <div className="transpcipt">{messageReceived.join(' ')}</div>}
      </div>
      {!isScreenShare && <Username id={id} isLocal={isLocal} />}

      {videoUrls.map((url, index) => (
        <video key={index} src={url} style={{ width: '100%', height: 'auto' }} controls autoPlay />
      ))}
    </div>
  );
}

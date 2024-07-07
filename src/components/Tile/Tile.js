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

  const scrambleWords = async (x) => {
    try {
      // Assuming your Express server is running on localhost:3000
      const wordsQueryParam = x.join(',');

      const response = await fetch(
        `http://localhost:3005/scrambled-sentence?words=${encodeURIComponent(wordsQueryParam)}`,
        {
          method: 'GET', // Optional: Explicitly specifying the method for clarity
        },
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Scrambled words:', data, data.sentence);
      return data.sentence;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

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
    }, 10000); // Check and remove words every 6 seconds

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
    const fromType = isDeaf === 'yes' ? 'deaf' : 'notDeaf';
    socket.emit('message', { message, roomId, id, fromType });
  };

  const [textTobeSign, setTextTobeSign] = useState([]);
  const [textSom, setTextntText] = useState(false);

  const [deafState, setIsDeafState] = useState('inknow');

  useEffect(() => {
    if (textSom === false || isDeaf === 'yes' || isDeaf === 'no') {
      setIsDeafState(isDeaf);
      setIsDeafState((prev) => isDeaf);
      setTextntText(true);
    }
  }, [isDeaf]);

  const [predectedText, setPredectedText] = useState([]);

  useEffect(() => {
    console.log('predectedText', predectedText);
    const smtmt = async () => {
      if (predectedText.length === 3) {
        const x = await scrambleWords(predectedText);
        console.log('scrambleWords', x);

        setMessageReceived((prevTranscript) => [...prevTranscript.slice(0, -3), x]);
        setPredectedText((prevTexts) => prevTexts.slice(3));
      }
    };
    smtmt();
  }, [predectedText]);

  useEffect(() => {
    console.log('messageReceived', messageReceived);
  }, [messageReceived]);
  useEffect(() => {
    socket.on('message', (message) => {
      console.log('message ', message);

      if (deafState === 'yes' && message.fromType === 'notDeaf') {
        console.log('message added on deaf', deafState === 'yes' && message.fromType === 'notDeaf');
        setTextTobeSign((prevMessages) => [...prevMessages, message.message]);
        setMessageReceived((prevMessages) => [...prevMessages, message.message]);
      }
      if (deafState === 'no' && message.fromType === 'deaf') {
        console.log('message added on notDeaf', deafState === 'no' && message.fromType === 'deaf');
        if (message.message !== undefined) {
          setPredectedText((prevMessages) => [...prevMessages, message.message]);

          setMessageReceived((prevMessages) => [...prevMessages, message.message]);
        }
      }
      // if (message.id !== id) {
      //   // Don't understand why this is not working as expected
      //   console.log('returning same user');
      //   return;
      // }
      // if (message.id === id) {
      //   console.log('returning the other user!!!!!!!!! user');

      //   setMessageReceived((prevMessages) => [...prevMessages, message.message]);
      // }

      // setTextTobeSign((prevMessages) => [...prevMessages, message.message]);
    });
    return () => {
      socket.off('message');
    };
  }, [deafState]);

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
      //   bitsPerSecond
    });
    recorderRef.current.startRecording();
  };

  const handleStop = useCallback(async () => {
    recorderRef.current.stopRecording(() => {
      setBlob(recorderRef.current.getBlob());

      if (recorderRef.current.getBlob()) {
        // console.log('checkHandPresence', handsTimestamps);
        // console.log('checkHandPresence', checkHandPresence(handsTimestampsRef.current));
        if (checkHandPresence(handsTimestampsRef.current)) {
          setblobsx((blobsx) => {
            const updatedBlobs = [...blobsx, recorderRef.current.getBlob()];
            return updatedBlobs;
          });
        }
      }
      if (blobsx.length === 1) {
        sendBlobsToServer(blobsx[0]);
      }
    });
  }, [recorderRef, setBlob, handsTimestamps, checkHandPresence, setblobsx, blobsx]);
  // console.log('blobsx', blobsx);

  async function record() {
    await handleRecording();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await handleStop();

    // console.log('blobsx inside recored', blobsx);
    if (blobsx && blobsx.length === 5) {
      // console.log('blobsx end');
      return;
    }

    record();
  }

  const sendBlobsToServer = useCallback(
    async (bolb) => {
      // console.log('isDeaf', isDeaf, 'Seding to the server !!!');
      if (isDeaf !== 'yes') {
        return;
      }
      // console.log('Sending blobs to server', bolb);
      const formData = new FormData();
      const blob = new Blob([bolb], { type: 'video/webm' });
      formData.append('videofile', blob, `recorded-${blob.size}.webm`);

      const response = await fetch('http://192.168.1.3:3006/', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data) {
        // console.log('Data sent from the server', data?.prediction?.[0]);
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

  useEffect(() => {
    if (blobsx.length > 0) {
      sendBlobsToServer(blobsx[0]);
    }
  }, [numberOfdones, isDeaf]);

  useEffect(() => {
    if (blobsx.length === 1) {
      sendBlobsToServer(blobsx[0]);
    }
  }, [blobsx]);

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

  useEffect(() => {
    console.log('transcript', transcript);
  }, [transcript]);

  const [transcriptTosend, setTransTouse] = useState('');
  useEffect(() => {
    if (interimTranscript !== '') {
      setTransTouse(interimTranscript);
    }
  }, [interimTranscript]);

  useEffect(() => {
    console.log('finalTranscript', finalTranscript);
    if (interimTranscript === '') {
      console.log('interimTranscript', interimTranscript);
      console.log('transcriptTosend', transcriptTosend);

      if (isLocal) {
        sendMessage(transcriptTosend);
      }

      setTransTouse('');
    }
  }, [finalTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn&apos;t support speech recognition.</span>;
  }

  useEffect(() => {
    console.log(transcript, transcript);
  }, [transcript]);

  useEffect(() => {
    // console.log('isDeaf', isDeaf);
    if (isDeaf === 'yes') {
      record();
      // console.log('Recording started');
    }
    console.log('check recording', isDeaf === 'no' && !mutedAudio);

    if (isDeaf === 'no' && !mutedAudio) {
      console.log('Recording sound started xx', isDeaf === 'no' && !mutedAudio);
      // console.log('Recording sound started xx');
      console.log('listening before', listening);

      SpeechRecognition.startListening({
        continuous: true,
      });
      console.log('listening after', listening);
    }
  }, [isDeaf]);

  useEffect(() => {
    console.log('listening in useeffect', listening);
  }, [listening]);

  useEffect(() => {
    if (isDeaf === 'no') {
      if (mutedAudio) {
        SpeechRecognition.stopListening();
      } else if (!mutedAudio) {
        SpeechRecognition.startListening({
          continuous: true,
        });
      }
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
  const [currentIndex, setCurrentIndex] = useState(0);

  const texttosign = async (text) => {
    if (!isLocal) {
      return;
    }
    // e.preventDefault();

    const formData = new FormData();
    formData.append('sentence', text);

    try {
      const response = await fetch('http://127.0.0.1:5000/process_sentence', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Video not found');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrls((prevState) => [...prevState, url]);
    } catch (error) {
      console.error('Error fetching video:', error);
    }
  };

  useEffect(() => {
    // textTobeSign
    if (isDeaf === 'yes') {
      console.log('textTobeSign before', textTobeSign);
      if (textTobeSign.length > 0) {
        const text = textTobeSign[0];
        texttosign(text);
        setTextTobeSign((prevMessages) => prevMessages.slice(1));
        console.log('textTobeSign after', textTobeSign);
      }
    }
  }, [textTobeSign]);

  const handleVideoEnd = () => {
    if (videoUrls.length === 0) return;
    // Remove the current video URL from the array
    setVideoUrls((prevState) => prevState.filter((_, index) => index !== currentIndex));
    // Automatically move to the next video, or reset if at the end of the array
    setCurrentIndex((prevState) => {
      if (prevState < videoUrls.length - 1) {
        return prevState + 1;
      }
      return 0;
    });
  };

  return (
    <>
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
        {/* <button type="button" onClick={texttosign}>
        Send video
      </button> */}
      </div>

      {isLocal && (
        <div className=" w-full max-h-auto max-w-[480px] bg-black h-[360px]">
          {videoUrls.length > 0 && (
            <video
              className=" w-full h-auto"
              src={videoUrls[currentIndex]}
              onEnded={handleVideoEnd}
              key={currentIndex} // Key helps React identify video changes
              autoPlay
            />
          )}
        </div>
      )}
    </>
  );
}

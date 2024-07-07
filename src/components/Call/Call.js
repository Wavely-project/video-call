/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react';
import {
  useParticipantIds,
  useScreenShare,
  useDailyEvent,
  useLocalSessionId,
} from '@daily-co/daily-react';

import './Call.css';
import Tile from '../Tile/Tile';
import UserMediaError from '../UserMediaError/UserMediaError';

function EarOff() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-ear-off">
      <path d="M6 18.5a3.5 3.5 0 1 0 7 0c0-1.57.92-2.52 2.04-3.46" />
      <path d="M6 8.5c0-.75.13-1.47.36-2.14" />
      <path d="M8.8 3.15A6.5 6.5 0 0 1 19 8.5c0 1.63-.44 2.81-1.09 3.76" />
      <path d="M12.5 6A2.5 2.5 0 0 1 15 8.5M10 13a2 2 0 0 0 1.82-1.18" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function EarOn() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-ear">
      <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0" />
      <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4" />
    </svg>
  );
}
export default function Call() {
  /* If a participant runs into a getUserMedia() error, we need to warn them. */
  const [getUserMediaError, setGetUserMediaError] = useState(false);

  /* We can use the useDailyEvent() hook to listen for daily-js events. Here's a full list
   * of all events: https://docs.daily.co/reference/daily-js/events */
  useDailyEvent(
    'camera-error',
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );

  /* This is for displaying remote participants: this includes other humans, but also screen shares. */
  const { screens } = useScreenShare();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });

  /* This is for displaying our self-view. */
  const localSessionId = useLocalSessionId();
  const isAlone = remoteParticipantIds.length < 1 || screens.length < 1;

  const [isDeaf, setIsDeaf] = useState(null);
  const [dialoug, setDialoug] = useState(true);
  const handleSelectChange = (event) => {
    setIsDeaf(event.target.value);
  };

  const handleSetisDeafTure = () => {
    setIsDeaf('yes');
    setDialoug(false);
  };

  const handleSetisDeafFalse = () => {
    setIsDeaf('no');
    setDialoug(false);
  };

  console.log('isDeaf', isDeaf);
  const renderCallScreen = () => (
    <>
      {dialoug ? (
        <div className=" deafornorm pt-9">
          <p className="mb-5">You are ...?</p>
          <div className=" flex gap-5">
            <button
              type="button"
              onClick={handleSetisDeafTure}
              className=" flex justify-center items-center align-middle flex-col bg-slate-900 text-slate-50 p-5 px-12 rounded-md border border-slate-700 hover:bg-slate-950">
              <p className="pt-0 mt-0 text-xl mb-3">Deaf</p>
              <EarOff />
            </button>

            <button
              type="button"
              onClick={handleSetisDeafFalse}
              className=" flex flex-col justify-center items-center align-middle bg-slate-900 text-slate-50 p-5 px-8 rounded-md border border-slate-700 hover:bg-slate-950">
              <p className="pt-0 mt-0 text-xl mb-3">Not Deaf</p>
              <EarOn />
            </button>
          </div>
        </div>
      ) : null}

      <div className={screens.length > 0 ? 'is-screenshare' : 'call'}>
        {/* <div>
        <label htmlFor="deafSelect">Are you deaf?</label>
        <select id="deafSelect" onChange={handleSelectChange}>
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div> */}
        {/* Your self view */}
        {localSessionId && <Tile id={localSessionId} isLocal isAlone={isAlone} isDeaf={isDeaf} />}
        {/* Videos of remote participants and screen shares */}
        {remoteParticipantIds.length > 0 || screens.length > 0 ? (
          <>
            {remoteParticipantIds.map((id) => (
              <Tile key={id} id={id} isDeaf={isDeaf} />
            ))}
            {screens.map((screen) => (
              <Tile key={screen.screenId} id={screen.session_id} isScreenShare />
            ))}
          </>
        ) : (
          // When there are no remote participants or screen shares
          <div className="info-box">
            <h1>Waiting for others</h1>
            <p>Invite someone by sharing this link:</p>
            <span className="room-url">{window.location.href}</span>
          </div>
        )}
      </div>
    </>
  );

  return getUserMediaError ? <UserMediaError /> : renderCallScreen();
}

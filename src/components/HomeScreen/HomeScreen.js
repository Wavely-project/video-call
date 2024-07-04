import React from 'react';
import './HomeScreen.css';

export default function HomeScreen({ createCall, startHairCheck }) {
  const startDemo = () => {
    createCall().then((url) => {
      startHairCheck(url);
    });
  };

  return (
    <div className="home-screen mt-14">
      <svg
        width="64"
        height="63"
        viewBox="0 0 64 63"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_8_1448)">
          <path
            d="M42.9512 27.0571L57.2404 12.8035L50.9563 6.53206L36.4461 21.0095V0H27.5572V21.0028L13.0471 6.52872L6.76292 12.8002L21.0521 27.0538H0V36.1452H8.44361C11.9791 36.1452 15.3706 34.7586 18.2465 32.1291L22.3545 28.3702L22.4449 28.29C22.86 27.9091 23.2919 27.555 23.7305 27.2309C24.9458 26.3221 26.2582 25.6171 27.6275 25.1393C28.6654 24.7751 29.7368 24.5412 30.8048 24.4443C31.6116 24.3741 32.4118 24.3775 33.1885 24.4543C34.2632 24.5612 35.3346 24.8018 36.3658 25.1727C37.6983 25.6538 38.9738 26.3454 40.159 27.2309C40.5675 27.5282 40.9893 27.8757 41.4447 28.2867L45.6464 32.1291C48.5189 34.7553 51.9071 36.1452 55.4459 36.1452H63.9966V27.0538H42.9479L42.9512 27.0571Z"
            fill="#F3F4F6"
          />
          <path
            d="M42.9512 27.0571L57.2404 12.8035L50.9563 6.53206L36.4461 21.0095V0H27.5572V21.0028L13.0471 6.52872L6.76292 12.8002L21.0521 27.0538H0V36.1452H8.44361C11.9791 36.1452 15.3706 34.7586 18.2465 32.1291L22.3545 28.3702L22.4449 28.29C22.86 27.9091 23.2919 27.555 23.7305 27.2309C24.9458 26.3221 26.2582 25.6171 27.6275 25.1393C28.6654 24.7751 29.7368 24.5412 30.8048 24.4443C31.6116 24.3741 32.4118 24.3775 33.1885 24.4543C34.2632 24.5612 35.3346 24.8018 36.3658 25.1727C37.6983 25.6538 38.9738 26.3454 40.159 27.2309C40.5675 27.5282 40.9893 27.8757 41.4447 28.2867L45.6464 32.1291C48.5189 34.7553 51.9071 36.1452 55.4459 36.1452H63.9966V27.0538H42.9479L42.9512 27.0571Z"
            fill="url(#paint0_linear_8_1448)"
            fillOpacity="0.03"
          />
          <path
            d="M52.406 54.876L34.424 39.2926C32.9777 38.0397 30.8316 38.0397 29.3853 39.2926L11.4033 54.876L5.57446 48.1769L22.7463 33.2952C27.9992 28.7444 35.8067 28.7444 41.0597 33.2952L58.2315 48.1769L52.4027 54.876H52.406Z"
            fill="#F3F4F6"
          />
          <path
            d="M52.406 54.876L34.424 39.2926C32.9777 38.0397 30.8316 38.0397 29.3853 39.2926L11.4033 54.876L5.57446 48.1769L22.7463 33.2952C27.9992 28.7444 35.8067 28.7444 41.0597 33.2952L58.2315 48.1769L52.4027 54.876H52.406Z"
            fill="url(#paint1_linear_8_1448)"
            fillOpacity="0.03"
          />
          <path
            d="M36.3523 62.7613H27.4634V51.4246C27.4634 48.9755 29.4521 46.9908 31.9061 46.9908C34.3602 46.9908 36.3489 48.9755 36.3489 51.4246V62.7613H36.3523Z"
            fill="#F3F4F6"
          />
          <path
            d="M36.3523 62.7613H27.4634V51.4246C27.4634 48.9755 29.4521 46.9908 31.9061 46.9908C34.3602 46.9908 36.3489 48.9755 36.3489 51.4246V62.7613H36.3523Z"
            fill="url(#paint2_linear_8_1448)"
            fillOpacity="0.03"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_8_1448"
            x1="31.9983"
            y1="0"
            x2="31.9983"
            y2="36.1452"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#030712" stopOpacity="0" />
            <stop offset="1" stopColor="#030712" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_8_1448"
            x1="31.903"
            y1="29.8821"
            x2="31.903"
            y2="54.876"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#030712" stopOpacity="0" />
            <stop offset="1" stopColor="#030712" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_8_1448"
            x1="31.9078"
            y1="46.9908"
            x2="31.9078"
            y2="62.7613"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#030712" stopOpacity="0" />
            <stop offset="1" stopColor="#030712" />
          </linearGradient>
          <clipPath id="clip0_8_1448">
            <rect width="64" height="62.7613" fill="white" />
          </clipPath>
        </defs>
      </svg>

      <h1 className="mt-3 text-xl">Wavely</h1>

      {/* <p>Start the demo with a new unique room by clicking the button below.</p> */}
      <button
        onClick={startDemo}
        type="button"
        className=" px-4 py-2 text-slate-100 bg-gray-900 hover:bg-gray-700 mt-4 mb-3">
        Click to start a call
      </button>
      <p className="small">Select “Allow” to use your camera and mic for this call if prompted</p>
    </div>
  );
}

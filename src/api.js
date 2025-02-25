/*
  We'll add a 30-min expiry (exp) so rooms won't linger too long on your account.
  See other available options at https://docs.daily.co/reference#create-room
 */
async function createRoom() {
  const exp = Math.round(Date.now() / 1000) + 60 * 30;
  const options = {
    properties: {
      exp,
    },
  };

  const isLocal =
    process.env.REACT_APP_ROOM_ENDPOINT && process.env.REACT_APP_ROOM_ENDPOINT === 'local';
  const endpoint = isLocal
    ? 'https://api.daily.co/v1/rooms/'
    : `${window.location.origin}/api/rooms`;

  /*
    No need to send the headers with the request when using the proxy option:
    netlify.toml takes care of that for us.
  */
  const headers = isLocal && {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer 1d29e0ccc5c3ed627d1bd3c8aef6e1de3d1e389f65d079907f157e113a849500`,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(options),
    ...headers,
  });

  return response.json();
}

export default { createRoom };

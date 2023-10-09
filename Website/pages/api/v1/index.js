// Ping pong the client!
export default function (req, res) {
  let response = {
    'ping': "pong"
  };
  let statusCode = 200;
  res.status(statusCode).json(response);
}
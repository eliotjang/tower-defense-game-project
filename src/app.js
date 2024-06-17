import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import config from './utils/configs.js';
import cors from 'cors';

const app = express();
const server = createServer(app);
const PORT = config.serverPort;

const corsOptions = {
  origin: '*',
  credentials: true,
};

app.use(cors(corsOptions));
// static file(html, css, js) serve middleware
app.use(express.static('public'));
// body parser middleware
app.use(express.json());
// content-type이 form인 경우, body data 가져옴
app.use(express.urlencoded({ extended: false }));

initSocket(server);

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});

## Live Video Broadcasting with NodeJs, Express, Socket.io and MongoDb

This project describes how to stream live video.

*Broadcaster*
- Create channel by giving channel name and token.

*Listeners*
- Can tune in the live broadcast published by Broadcaster by using the same token.

## Requirements

- node and npm 
- MongoDb

## Installation

1. Clone the repo: https://github.com/gagarwal-systango/live-stream.git
2. Go into folder: cd live-stream
3. Install dependencies: npm install
4. Create local MongoDB database called canvas (configured in config/server.js)
5. Start the app: npm start
6. View in browser at: https://localhost:3000
7. Broadcast Video!
## Live Video Broadcasting with NodeJs, Express, Socket.io and MongoDb

This project describes how to stream live video.

*Features*
- Create channel by giving channel name and token.
- Can tune in the live broadcast published by Broadcaster by using the same token.
- Both publisher and subscriber can view their video history.

## Requirements

- node and npm 
- MongoDb

## Installation

1. Clone the repo: https://github.com/gagarwal-systango/live-stream.git
2. Go into folder: cd live-stream
3. Install dependencies: npm install
4. Create local MongoDB database called Livestream (configured in config/server.js)
5. Start the app: NODE_ENV=development/production npm start
6. View in browser at: https://localhost:3000
7. Broadcast Video!

## Future Enhancements

- Play song on native spotify player and stream song informatiom along with video.
- Subscriber will watch video and also listen song on its native palyer from position it started watching video. 
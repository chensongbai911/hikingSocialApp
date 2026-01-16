#!/bin/bash
cd d:\\coze\\backend
npx tsx src/server.ts > server.log 2>&1 &
echo $! > server.pid
sleep 3
echo "Server started with PID $(cat server.pid)"
tail -f server.log

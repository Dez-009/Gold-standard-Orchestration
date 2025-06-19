#!/bin/bash
# Simple script to run backend and frontend together in development

uvicorn main:app --reload &
BACK_PID=$!

cd frontend && npm run dev &
FRONT_PID=$!

trap "kill $BACK_PID $FRONT_PID" EXIT
wait $BACK_PID $FRONT_PID

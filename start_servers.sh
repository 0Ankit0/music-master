#!/bin/bash
# tmux is required for this to work

tmux new-session -d -s music_master 'cd backend && source .venv/bin/activate && task dev'
tmux split-window -h -t music_master 'cd frontend && bun run dev'
tmux attach -t music_master
#!/usr/bin/env bash
set -euo pipefail

# Absolute paths
BASE_DIR="/home/akshay/Desktop/quiz"
VENV_DIR="$BASE_DIR/.venv"
PYTHON="$VENV_DIR/bin/python"
PIP="$VENV_DIR/bin/pip"
REQUIREMENTS="$BASE_DIR/requirements-simple.txt"
APP="$BASE_DIR/server-simple.py"
PID_FILE="$BASE_DIR/.server.pid"
LOG_DIR="$BASE_DIR/logs"
LOG_FILE="$LOG_DIR/server.log"
PORT=5000

bootstrap() {
    if [ ! -x "$PYTHON" ]; then
        echo "[bootstrap] Creating venv at $VENV_DIR"
        python3 -m venv "$VENV_DIR"
    fi
    echo "[bootstrap] Ensuring pip tooling is up to date"
    "$PIP" install -U pip setuptools wheel >/dev/null
    echo "[bootstrap] Installing requirements from $REQUIREMENTS"
    "$PIP" install -r "$REQUIREMENTS" >/dev/null
}

is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid
        pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
        if [ -n "$pid" ] && ps -p "$pid" >/dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

start() {
    if is_running; then
        echo "Server already running (PID $(cat "$PID_FILE"))"
        exit 0
    fi
    mkdir -p "$LOG_DIR"
    bootstrap
    echo "Starting server..."
    nohup "$PYTHON" "$APP" >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    sleep 1
    if is_running; then
        echo "Started. Logs: $LOG_FILE"
    else
        echo "Failed to start server. See logs: $LOG_FILE" >&2
        exit 1
    fi
}

stop() {
    local had_pid=false
    if is_running; then
        had_pid=true
        local pid
        pid=$(cat "$PID_FILE")
        echo "Stopping server (PID $pid)..."
        kill "$pid" || true
        sleep 1 || true
        if ps -p "$pid" >/dev/null 2>&1; then
            echo "Force killing (PID $pid)"
            kill -9 "$pid" || true
        fi
        rm -f "$PID_FILE"
    fi

    # As a fallback, free the port if still occupied
    if ss -ltnp 2>/dev/null | grep -q ":$PORT"; then
        if command -v fuser >/dev/null 2>&1; then
            echo "Killing any process using :$PORT"
            fuser -k "$PORT"/tcp || true
        fi
    fi
    if [ "$had_pid" = true ]; then
        echo "Stopped."
    else
        echo "Not running."
    fi
}

status() {
    if is_running; then
        echo "Running (PID $(cat "$PID_FILE"))"
    else
        echo "Not running"
    fi
}

restart() {
    stop
    start
}

logs() {
    mkdir -p "$LOG_DIR"
    touch "$LOG_FILE"
    echo "Tailing logs at $LOG_FILE (Ctrl+C to exit)"
    tail -n 200 -f "$LOG_FILE"
}

health() {
    curl -fsS "http://127.0.0.1:$PORT/api/status" || true
}

usage() {
    echo "Usage: $0 {start|stop|restart|status|logs|health}" >&2
}

cmd="${1:-}" || true
case "$cmd" in
    start) start ;;
    stop) stop ;;
    restart) restart ;;
    status) status ;;
    logs) logs ;;
    health) health ;;
    *) usage; exit 1 ;;
esac



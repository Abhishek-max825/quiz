# Quiz Admin + Client System (Flask)

A modern quiz administration system built with Python Flask and vanilla JavaScript. Includes an admin dashboard to start/reset quizzes and export results, and a client UI for participants.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.x-green.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## Features

- Real-time admin control: start/reset quiz for all connected clients
- Multi-client support and live status counts
- Results export to Excel (XLSX)
- Modern, responsive UIs for admin and clients
- Works via HTTP polling (no WebSocket setup needed)

## Project Structure

```
quiz/
├── server-simple.py           # Flask server
├── requirements-simple.txt    # Python dependencies
├── server.sh                  # Helper script to run server (optional)
├── sample-quiz.json           # Sample quiz JSON (fallback)
├── uploads/                   # Stores uploaded quiz.json at runtime
├── admin-panel/               # Admin UI (vanilla JS)
│   ├── index.html             # Dashboard + controls
│   ├── bot.html               # Optional bot runner UI
│   └── bot.js                 # Bot helper (for testing)
├── client-system/             # Client UI
│   ├── login.html             # Join + connect page
│   ├── question.html          # Quiz interface
│   └── Result.html            # Results UI
└── assets/                    # Shared images/icons
```

Notes:
- The server automatically loads `uploads/quiz.json` if present; otherwise it falls back to `sample-quiz.json`.
- Admin overlay password is `admin1234@` (hardcoded in `admin-panel/index.html`). Change before production use.

## Quick Start

Requirements: Python 3.8+ and pip

1) Install dependencies
```bash
pip install -r requirements-simple.txt
```

2) Run the server
```bash
python server-simple.py
```

3) Open in your browser
- Admin Panel: http://localhost:5000/
- Client System: http://localhost:5000/client

## Using the System

Admin
- Go to the Admin Panel and authenticate with password `admin1234@`.
- If no quiz is loaded, upload a quiz JSON via the API (see below) or place `quiz.json` in `uploads/` and restart the server.
- Start the quiz; monitor clients and download results.

Client
- Go to Client System, enter team name, click Start Quiz.
- The quiz automatically appears once the admin starts it.

## Quiz JSON Schema

Minimal schema validated by the server:
```json
{
  "title": "General Knowledge Quiz",
  "timeLimit": 600,
  "questions": [
    {
      "id": 1,
      "question": "Which …?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 2,
      "points": 5
    }
  ]
}
```

Tips
- `correctAnswer` is a 0-based index into `options`.
- Provide at least 2 options per question.

## REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Server and quiz status |
| `/api/quiz` | GET | Current quiz JSON |
| `/api/quiz/upload` | POST | Upload quiz JSON file (multipart form `file`) |
| `/api/quiz/start` | POST | Start quiz |
| `/api/quiz/reset` | POST | Reset quiz and clear clients |
| `/api/clients` | GET | List connected clients |
| `/api/client/connect` | POST | Register a client `{name}` |
| `/api/client/submit` | POST | Submit answers `{clientId, answers, timeTaken, questionTimes}` |
| `/api/results` | GET | Leaderboard/results |
| `/api/results/download` | GET | Download Excel (XLSX) of results |

Upload Example (PowerShell / curl):
```bash
curl -F "file=@sample-quiz.json" http://localhost:5000/api/quiz/upload
```

## Configuration

- Port/host: edit at the bottom of `server-simple.py` (default `0.0.0.0:5000`).
- Admin password: update in `admin-panel/index.html` (search for `correctPassword`).

## Troubleshooting

Port already in use (Windows):
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Pip/Dependencies:
```bash
python -m pip install --upgrade pip
pip install -r requirements-simple.txt --force-reinstall
```

## License

MIT – see [LICENSE](LICENSE).

## Credits

- Contributors: Abhishek-max825, Sayeem3051, AKSHAY355-a
- Tech: Flask, OpenPyXL
- UI: Material Icons, Google Fonts

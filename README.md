# 🎯 Quiz Admin Panel

A modern, real-time quiz administration system built with Python Flask and vanilla JavaScript. Perfect for conducting online quizzes, tests, and assessments with multiple clients.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

- **🚀 Real-time Quiz Control**: Start/stop quizzes instantly across all connected clients
- **👥 Multi-Client Support**: Handle unlimited client connections simultaneously
- **📊 Live Results Monitoring**: Real-time tracking of quiz progress and scores
- **📥 Excel Export**: Download comprehensive results in Excel format
- **🎨 Modern UI**: Clean, responsive interface for both admin and clients
- **⚡ HTTP Polling**: Reliable communication without WebSocket complexity
- **📱 Mobile Friendly**: Responsive design works on all devices

## 🏗️ Architecture

```
Quiz Admin Panel/
├── server-simple.py          # Main Flask server
├── requirements-simple.txt   # Python dependencies
├── start.py                 # Startup script
├── admin-panel/             # Admin interface
│   ├── index.html          # Admin dashboard
│   └── styles.css          # Admin styling
├── client-system/           # Client interface
│   ├── index.html          # Client quiz interface
│   ├── client.js           # Client logic
│   ├── quiz.js             # Quiz management
│   └── styles.css          # Client styling
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhishek-max825/quiz.git
   cd quiz
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements-simple.txt
   ```

3. **Run the server**
   ```bash
   python start.py
   ```

4. **Access the system**
   - **Admin Panel**: http://localhost:5000/
   - **Client System**: http://localhost:5000/client

## 📖 How to Use

### For Administrators

1. **Open Admin Panel**: Navigate to http://localhost:5000/
2. **Monitor Clients**: View connected clients in real-time
3. **Start Quiz**: Click "Start Quiz" to begin the session
4. **Track Progress**: Monitor live results and completion status
5. **Download Results**: Export final results to Excel format

### For Participants

1. **Connect**: Open http://localhost:5000/client
2. **Wait for Start**: Wait for administrator to start the quiz
3. **Take Quiz**: Answer questions within the time limit
4. **Submit**: Automatically submit when time expires
5. **View Results**: See your score and performance

## 🔧 Configuration

### Quiz Questions
Quiz questions are currently hardcoded in `server-simple.py`. To customize:

1. Edit the `quiz_data` variable in `server-simple.py`
2. Modify questions, options, correct answers, and points
3. Restart the server

### Server Settings
- **Port**: Default 5000 (change in `server-simple.py`)
- **Host**: Default 0.0.0.0 (accessible from any IP)
- **Debug**: Enabled for development

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Get server and quiz status |
| `/api/results` | GET | Get quiz results |
| `/api/quiz/start` | POST | Start the quiz |
| `/api/quiz/reset` | POST | Reset the quiz |
| `/api/client/connect` | POST | Client connection |
| `/api/client/submit` | POST | Submit quiz answers |
| `/api/results/download` | GET | Download Excel results |

## 🎨 Customization

### Adding New Questions
```python
{
    "id": 3,
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2,  # 0-based index
    "points": 10
}
```

### Styling
- Modify CSS files in respective directories
- Responsive design with mobile-first approach
- Easy color scheme customization

## 🚀 Deployment

### Local Development
```bash
python server-simple.py
```

### Production Deployment
1. Use a production WSGI server (Gunicorn, uWSGI)
2. Set up reverse proxy (Nginx, Apache)
3. Configure SSL certificates
4. Set environment variables for security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/)
- Styled with modern CSS3
- Icons from [Material Design](https://material.io/)

## 📞 Support

If you encounter any issues or have questions:
- Create an issue on GitHub
- Check the troubleshooting section below
- Review the code comments for guidance

## 🔍 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process
taskkill /PID <PID> /F
```

**Python Version Issues**
```bash
# Check Python version
python --version
# Should be 3.8 or higher
```

**Dependencies Issues**
```bash
# Upgrade pip
python -m pip install --upgrade pip
# Reinstall requirements
pip install -r requirements-simple.txt --force-reinstall
```

---

**Made with cursor Ai by BCA III 'A' & 'B' **

*Star this repository if you find it helpful! ⭐*

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import io from 'socket.io-client';
import axios from 'axios';

function App() {
  const [socket, setSocket] = useState(null);
  const [connectedClients, setConnectedClients] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [quizInProgress, setQuizInProgress] = useState(false);
  const [quizResults, setQuizResults] = useState([]);
  const [completedClients, setCompletedClients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('clientConnected', (data) => {
      setConnectedClients(data.clients);
      setTotalClients(data.totalClients);
    });

    newSocket.on('clientDisconnected', (data) => {
      setConnectedClients(data.clients);
      setTotalClients(data.totalClients);
    });

    newSocket.on('clientStatusUpdate', (data) => {
      setConnectedClients(data.clients);
      setTotalClients(data.totalClients);
    });

    newSocket.on('quizResultReceived', (data) => {
      setCompletedClients(data.completedClients);
      setConnectedClients(data.clients);
    });

    // Load initial data
    loadServerStatus();
    loadResults();

    return () => newSocket.close();
  }, []);

  const loadServerStatus = async () => {
    try {
      const response = await axios.get('/api/status');
      setQuizInProgress(response.data.quizInProgress);
      setTotalClients(response.data.totalClients);
      setCompletedClients(response.data.completedClients);
    } catch (error) {
      console.error('Error loading server status:', error);
    }
  };

  const loadResults = async () => {
    try {
      const response = await axios.get('/api/results');
      setQuizResults(response.data.results);
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    try {
      await axios.post('/api/quiz/start');
      setQuizInProgress(true);
      setMessage({ type: 'success', text: 'Quiz started successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to start quiz' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = async () => {
    setLoading(true);
    try {
      await axios.post('/api/quiz/reset');
      setQuizInProgress(false);
      setQuizResults([]);
      setCompletedClients(0);
      setMessage({ type: 'success', text: 'Quiz reset successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset quiz' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = async () => {
    try {
      const response = await axios.get('/api/results/download', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'quiz-results.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Results downloaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download results' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const getClientStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'default';
      case 'ready': return 'info';
      case 'quiz-active': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  // Function to format time in a user-friendly way
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')} minutes`;
    }
  };

  // Test the time formatting function
  console.log('React Admin Panel - Time formatting examples:');
  console.log('25 seconds ->', formatTime(25));
  console.log('60 seconds ->', formatTime(60));
  console.log('90 seconds ->', formatTime(90));
  console.log('125 seconds ->', formatTime(125));

  // Add test function to browser console for debugging
  window.testReactTimeFormatting = function(seconds) {
    console.log(`${seconds} seconds -> "${formatTime(seconds)}"`);
    return formatTime(seconds);
  };

  const getClientStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Waiting';
      case 'ready': return 'Ready';
      case 'quiz-active': return 'Taking Quiz';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <AssessmentIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quiz Admin Panel
          </Typography>
          <Chip 
            label={`${totalClients} Clients Connected`}
            color="secondary"
            icon={<PeopleIcon />}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Control Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom>
                Quiz Control
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  fullWidth
                  startIcon={<PlayIcon />}
                  onClick={startQuiz}
                  disabled={quizInProgress || loading || totalClients === 0}
                  sx={{ mb: 2 }}
                >
                  Start Quiz
                </Button>
                
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  fullWidth
                  startIcon={<StopIcon />}
                  onClick={resetQuiz}
                  disabled={!quizInProgress || loading}
                >
                  Reset Quiz
                </Button>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="medium"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={downloadResults}
                  disabled={quizResults.length === 0}
                >
                  Download Results
                </Button>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  size="medium"
                  fullWidth
                  startIcon={<RefreshIcon />}
                  onClick={loadResults}
                >
                  Refresh Results
                </Button>
              </Box>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Status Overview */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="textSecondary" gutterBottom>
                        Total Clients
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {totalClients}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="textSecondary" gutterBottom>
                        Quiz Status
                      </Typography>
                      <Chip 
                        label={quizInProgress ? 'Active' : 'Inactive'}
                        color={quizInProgress ? 'success' : 'default'}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="textSecondary" gutterBottom>
                        Completed
                      </Typography>
                      <Typography variant="h4" color="success">
                        {completedClients}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="textSecondary" gutterBottom>
                        Pending
                      </Typography>
                      <Typography variant="h4" color="warning">
                        {totalClients - completedClients}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Connected Clients */}
              <Typography variant="h6" gutterBottom>
                Connected Clients
              </Typography>
              
              <Grid container spacing={1}>
                {connectedClients.map((client) => (
                  <Grid item xs={12} sm={6} md={4} key={client.id}>
                    <Card variant="outlined">
                      <CardContent sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" noWrap>
                            {client.name}
                          </Typography>
                          <Chip
                            label={getClientStatusText(client.status)}
                            color={getClientStatusColor(client.status)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          Connected: {new Date(client.connectedAt).toLocaleTimeString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Results Table */}
          {quizResults.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quiz Results
                </Typography>
                
                <Grid container spacing={2}>
                  {quizResults.map((result, index) => (
                    <Grid item xs={12} sm={6} md={4} key={result.clientId}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" color="primary">
                              #{index + 1}
                            </Typography>
                            <Chip 
                              label={`${result.percentage}%`}
                              color={result.percentage >= 80 ? 'success' : result.percentage >= 60 ? 'warning' : 'error'}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="subtitle1" gutterBottom>
                            {result.clientName}
                          </Typography>
                          
                          <Typography variant="body2" color="textSecondary">
                            Score: {result.score}/{result.maxScore}
                          </Typography>
                          
                          <Typography variant="body2" color="textSecondary">
                            Time: {formatTime(Math.round(result.timeTaken))}
                          </Typography>
                          
                          <Typography variant="caption" color="textSecondary">
                            Completed: {new Date(result.completedAt).toLocaleTimeString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { InputAdornment, IconButton, InputLabel, OutlinedInput, FormControl, Divider, Box, Grid, Grow, Paper, Typography, Tooltip } from '@mui/material';
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppBadIcon from '@mui/icons-material/GppBad';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';

const socket = io('http://localhost:3000');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    //Evento connect de socket.io
    socket.on('connect', () => {
      setIsConnected(true);
    });

    //Evento disconnect de socket.io
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    //Evento send_message (para escuchar el evento que viene del back)
    socket.on('send_message', (data) => {
      setMessages(messages => [...messages, data]);
    });

    //Esto es importante para evitar eventos duplicados
    return () => {
      socket.off('connect');
      socket.off('send_message')
    };

  }, []);

  //Emito un evento send_message al servidor de socket.io
  const sendMessage = () => {
    if (newMessage) {
      socket.emit('send_message', {
        user: socket.id,
        message: newMessage,
        date: new Date().toLocaleString('es-ES', { hour: 'numeric', minute: 'numeric', hour12: true, weekday: 'long' })
      });
    };
    setNewMessage('');
  };

  return (
    <>
      <Grid container justifyContent='center' alignItems='center' spacing={1}>
        <Grid item>
          <Typography>Web socket: {isConnected ? 'Connect' : 'Disconnect'}</Typography>
        </Grid>
        <Grid item>
          {isConnected ? <GppGoodIcon sx={{ color: 'green' }} /> : <GppBadIcon sx={{ color: 'red' }} />}
        </Grid>
      </Grid>
      <Grid container justifyContent='center' alignItems='center' sx={{ height: '90vh' }}>
        <Paper sx={{ p: 2, height: 650 }} elevation={3}>
          <Box sx={{ height: '10%' }}>
            <Grid container spacing={1} alignItems='center'>
              <Grid item container direction='row' xs={6} sm={6} md={6} xl={6} justifyContent='flex-start'>
                <ChatIcon sx={{ color: '#1565C0', mr: 1 }} />
                <Typography sx={{ fontWeight: 'bold' }}>Sala de chat</Typography>
              </Grid>
              <Grid item container xs={6} sm={6} md={6} xl={6} justifyContent='flex-end'>
                <Tooltip title='Borrar mensajes'>
                <IconButton onClick={()=>setMessages([])} >
                  <DeleteIcon sx={{color:'red'}}/>
                </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <Divider sx={{ mb: 2, mt: 1 }} />
          </Box>
          <Box sx={{ height: '80%', overflow: 'auto' }}>
            <Grid sx={{ mb: 6 }}>
              {messages.length > 0 ?
                messages.map((element, index) => (
                  <Grow in={true} key={index}>
                    <Grid item container sx={{ mb: 1.5 }} alignItems='flex-end'>
                      <Paper elevation={1} sx={{ p: 1, mr: 1, backgroundColor: '#EFEFEF' }}>
                        <Typography sx={{ fontSize: 13 }}>{element.message}</Typography>
                      </Paper>
                      <Typography sx={{ fontSize: 11 }}>{element.date}</Typography>
                    </Grid>
                  </Grow>
                ))
                :
                <Grid container justifyContent='center' alignItems='center' sx={{ height: 400, color: '#757575' }}>
                  <Typography>Aun no hay mensajes</Typography>
                </Grid>
              }
            </Grid>
          </Box>
          <Grid container sx={{ height: '10%' }} alignItems='flex-end' justifyContent='flex-end'>
            <FormControl sx={{ width: '60vw' }} variant="outlined" size='small'>
              <OutlinedInput
                id="outlined-adornment-password"
                type='text'
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={sendMessage}
                      edge="end"
                    >
                      <SendIcon sx={{ color: '#1565C0' }} />
                    </IconButton>
                  </InputAdornment>
                }
                placeholder="Escribe un mensaje"
              />
            </FormControl>
          </Grid>
        </Paper>
      </Grid>
    </>
  );
};

export default App

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const httpServer = createServer(app);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());

  // API Route for Stripe Checkout Simulation
  app.post('/api/checkout', (req, res) => {
    // In a real app with keys:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({...})
    setTimeout(() => {
      res.json({ success: true, paymentId: 'pi_' + Math.random().toString(36).substring(2) });
    }, 1500);
  });

  // API Route for WhatsApp Notification Simulation
  app.post('/api/whatsapp/notify', (req, res) => {
    // In a real app with Twilio keys:
    // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({ ... });
    setTimeout(() => {
      res.json({ success: true });
    }, 1000);
  });

  // Basic in-memory state for Users
  let usersConnected = 0;

  io.on('connection', (socket) => {
    usersConnected++;
    
    // Broadcast active users
    io.emit('users-changed', usersConnected);

    socket.on('draw-action', (data) => {
      socket.broadcast.emit('draw-action', data);
    });

    socket.on('clear-canvas', () => {
      io.emit('clear-canvas');
    });

    socket.on('disconnect', () => {
      usersConnected = Math.max(0, usersConnected - 1);
      io.emit('users-changed', usersConnected);
    });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(resolve(__dirname, 'client')));
    app.get('*', (req, res) => {
      res.sendFile(resolve(__dirname, 'client/index.html'));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.log('Vite not found, assuming production mode');
    }
  }

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);

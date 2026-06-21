import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      stripeClient = new Stripe(key);
    }
  }
  return stripeClient;
}

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

  // API Route for Stripe Checkout Simulation / Real
  app.post('/api/checkout', async (req, res) => {
    const { teamId, teamName } = req.body;
    const stripe = getStripe();
    if (!stripe) {
      // Return a simulated success if no key is provided during preview
      setTimeout(() => {
        res.json({ success: true, paymentId: 'pi_' + Math.random().toString(36).substring(2), url: null });
      }, 1500);
      return;
    }

    try {
      const origin = req.headers.origin || req.headers.referer || `http://localhost:${PORT}`;
      // Clean up origin (remove trailing slash if present)
      const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${teamName || 'Team'} Registration Fee`,
                description: 'All Pakistan Open Volleyball Tournament Entry',
              },
              unit_amount: 5000, // $50 amount just for payment gateway demo
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${cleanOrigin}/?success=true&teamId=${teamId}`,
        cancel_url: `${cleanOrigin}/?canceled=true&teamId=${teamId}`,
      });

      res.json({ success: true, url: session.url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route for Stripe Checkout Simulation / Real for Tickets
  app.post('/api/checkout-ticket', async (req, res) => {
    const { ticketId, name, price, desc } = req.body;
    const stripe = getStripe();
    if (!stripe) {
      // Return a simulated success if no key is provided during preview
      setTimeout(() => {
        res.json({ success: true, paymentId: 'pi_' + Math.random().toString(36).substring(2), url: null });
      }, 1500);
      return;
    }

    try {
      const origin = req.headers.origin || req.headers.referer || `http://localhost:${PORT}`;
      // Clean up origin (remove trailing slash if present)
      const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd', // using USD for testing
              product_data: {
                name: `${name} Ticket`,
                description: desc,
              },
              unit_amount: price * 100, // amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${cleanOrigin}/?ticketSuccess=true&ticketId=${ticketId}`,
        cancel_url: `${cleanOrigin}/?ticketCanceled=true&ticketId=${ticketId}`,
      });

      res.json({ success: true, url: session.url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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

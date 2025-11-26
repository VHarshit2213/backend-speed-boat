import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import errorHandler from './middlewares/error.js';
import { notFound } from './middlewares/notFound.js';
import path from "path";



const app = express();


app.use("/uploads", express.static("uploads"));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// security & perf
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());

// parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// logs & rate limit
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 60_000, max: 300 }), routes);

// simple root page
app.get('/', (req, res) => {
  res.type('text/html').send(`
    <html>
      <head><title>API Status</title></head>
      <body style="font-family:system-ui; padding:24px">
        <p>speedBoat Backend is running</p>
        <p>Try <code>/api/health</code> for JSON health.</p>
      </body>
    </html>
  `);
});

// fallbacks
app.use(notFound);
app.use(errorHandler);

export default app;

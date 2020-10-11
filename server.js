if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express = require('express');
const middlewares = require('./middlewares/middlewares');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(morgan('common'));
app.use(helmet());
app.use(cors());

app.use('/api/listings', require('./routes/listings'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inquiry', require('./routes/inquiry'));
app.use('/api/realtors', require('./routes/realtors'));

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

if (process.env.NODE_ENV !== 'production') app.listen(process.env.PORT, () => console.log(`App is running at port ${process.env.PORT}`));
else app.listen(process.env.PORT);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const groupRoutes = require('./routes/groupRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/group', groupRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected',mongoose.connection.name))
.catch(err => console.error('MongoDB Connection Error:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const connectDB = require('./config/database');
const routes = require('./routes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable All CORS Requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Kết nối đến cơ sở dữ liệu MongoDB
connectDB();

// Cấu hình các route và middleware khác ở đây
app.use(express.json());
app.use('/api', routes);


app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

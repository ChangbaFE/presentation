const express = require('express');
var path = require('path');

const hostname = 'localhost';
const port = 3002;

// 首先需要初始化 express 实例
const app = express();

// 设置静态文件服务器
app.use(express.static(path.join(__dirname, '../public')));

function loggingMiddleware(req, res, next) {
  const time = new Date();
  console.log(`[${time.toLocaleString()}] ${req.method} ${req.url}`);
  next();
}

app.use(loggingMiddleware);

app.get('/', (req, res) => {
  res.sendFile('/example1/index.html', {root: 'public'});
});

app.get('/example2/error', (req, res) => {
  res.status(500).send('Something broke!');
});


app.use('*', (req, res) => {
  res.status(404).send('404');
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

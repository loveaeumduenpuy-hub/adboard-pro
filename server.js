const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/pages',   require('./routes/pages'));
app.use('/api/skus',    require('./routes/skus'));
app.use('/api/sales',   require('./routes/sales'));
app.use('/api/tests',   require('./routes/tests'));
app.use('/api/returns', require('./routes/returns'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AdBoard Pro running on port ${PORT}`));

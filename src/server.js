const { createApp } = require('./app');

const port = process.env.PORT || 3000;
const server = createApp().listen(port, () => console.log(`listening on ${port}`));

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
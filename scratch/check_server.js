const { Client } = require('ssh2');

const config = {
  host: '212.95.40.164',
  port: 22,
  username: 'vollu',
  password: 'sQzotTDULI7ITGwWxcH3'
};

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  
  const cmd = `
    echo "Current user: $(whoami)"
    echo "Working directory: $(pwd)"
    echo "Directory content:"
    ls -la /home/vollu/htdocs/vollu.app
    echo "PM2 status:"
    pm2 list
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect(config);

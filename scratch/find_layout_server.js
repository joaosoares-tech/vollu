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
  const cmd = `find /home/vollu -name "layout.tsx"`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect(config);

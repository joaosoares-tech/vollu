const { Client } = require('ssh2');
const fs = require('fs');

const config = {
  host: '212.95.40.164',
  port: 22,
  username: 'vollu',
  password: 'sQzotTDULI7ITGwWxcH3'
};

const appPath = '/home/vollu/htdocs/vollu.app';
const homeTarPath = '/home/vollu/vollu_nextjs_source.tar.gz';
const remoteTarPath = '/home/vollu/htdocs/vollu_nextjs_source.tar.gz';
const localTarPath = '/tmp/vollu_nextjs_source.tar.gz';

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  
  // Step 1: Upload to home directory
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP :: ready');
    
    const readStream = fs.createReadStream(localTarPath);
    const writeStream = sftp.createWriteStream(homeTarPath);
    
    writeStream.on('close', () => {
      console.log('Upload to home complete');
      
      // Step 2: Move, Extract and Deploy
      const cmd = `
        mv ${homeTarPath} ${remoteTarPath} || cp ${homeTarPath} ${remoteTarPath}
        echo "Extracting..."
        tar -xzf ${remoteTarPath} -C ${appPath}
        cd ${appPath}
        echo "Starting PM2..."
        pm2 stop vollu.app || true
        pm2 delete vollu.app || true
        pm2 start npm --name "vollu.app" -- start -- -p 3011
        pm2 save
        echo "Deployment finished successfully!"
        pm2 list
      `;
      
      conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Deployment stream closed with code ' + code);
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      });
    });
    
    readStream.pipe(writeStream);
  });
}).connect(config);

const CHANNEL_LIST = require('./channels');
const PORT = process.env.PORT || 3000;

const express = require('express');
const app = express();
const http = require('http');
const request = require('request');
const icy = require('icy');
const lame = require('lame');
const log = require('./lib/log');

function icyHeaders(req, res, next) {
  let headers = {
    'content-type': 'audio/mpeg',
    'connection': 'close',
  };

  if (req.icy) {
    Object.assign(headers, {
      'icy-metaint': '8192',
      'icy-name': 'GooX DI.fm Restreamer',
      'icy-br': '128',
      'icy-sr': '44100',
      'icy-url': 'https://www.sceon.am',
      'icy-pub': '1',
      'icy-notice1': '<BR>This stream requires <a href="http://www.winamp.com">Winamp</a><BR>',
      'icy-notice2': 'SHOUTcast DNAS/posix(linux x64) v2.5.5.733<BR>'
    });
  }

  res.writeHead(200, headers);

  next();
}

app.disable('x-powered-by');

app.use((req, res, next) => {
  req.icy = !!req.headers['icy-metadata'];
  next();
});

let currentSong = 'N/A';

function createStream(channel, res) {
  if (CHANNEL_LIST[channel] == undefined) {
    res.end();
    return;
  }

  let encoder = new lame.Encoder({ channels: 2, bitDepth: 16, sampleRate: 44100 });
  let decoder = new lame.Decoder();

  encoder.on('data', chunk => {
    if (res instanceof icy.Writer) {
      res.queue({ StreamTitle: currentSong });
    }

    res.write(chunk);
  });

  decoder.on('format', () => {
    decoder.pipe(encoder);
  });

  icy.get(CHANNEL_LIST[channel], function(chan) {
    log.info('Connected to underlying stream (channel: ' + channel + ')');

    chan.on('metadata', metadata => {
      metadata = icy.parse(metadata);
      currentSong = metadata.StreamTitle;
    });

    chan.pipe(decoder);
  });

  return decoder;
}

app.get('/listen.mp3', icyHeaders, (req, res, next) => {
  if (req.icy) {
    res = new icy.Writer(8192, res);
  }

  let stream = createStream(req.query.c || 'default', res)

  log.info(`Client connected (UA: ${req.headers['user-agent']})`);

  req.connection.on('close', () => {
    stream.end();
    log.info(`Client disconnected (UA: ${req.headers['user-agent']})`);
  });
});

app.listen(PORT, () => log.info('icy-proxy listening on port ' + PORT + '!'));

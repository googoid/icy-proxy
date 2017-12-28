# icy-proxy
Icy re-encoder proxy server


## Channels
Create a `channels.js` which exports a standard JS object with keys as channel names and values icy mp3 channels.

**NOTE** For each request to `/listen.mp3` a new stream is created, this server does not do multiplexing.


## Background
Recently I bought an [Amazon Alexa](https://www.amazon.com/s/?field-keywords=alexa) device and wanted to listen to [DI.fm](https://www.di.fm).

Alexa API requires any URL to use SSL, eg. `https://`, but DI.fm streams are plain HTTP. So this proxy is used also as an SSL-icy gateway.

It seems that Alexa only supports MP3 streams (and it has to be kinda like 128kbps or so) and because DI.fm Premium offers only 320kbps streams I needed a way to re-encode the stream.

It is totally possible to multiplex the stream (eg. have the proxy stream to multiple clients but maintain only one connection to underlying stream). *I'm pretty sure this scenario would have been illegal in case of paid service like DI.fm.* Anyway I was not going to implement multiplexing because I respect DI.fm and I pay for one account and I only have single client at a time listening to a single stream.


### TODO

1. Refactoring

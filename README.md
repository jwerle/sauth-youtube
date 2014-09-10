sauth-youtube
=============

Youtube [sauth](https://github.com/jwerle/sauth) strategy

## install

```sh
$ npm i sauth-youtube
```

## usage

Command line arguments:

```sh
$ sauth youtube \
  --client-id=CONSUMER_ID \
  --client-secret=CONSUMER_SECRET \
  --port=PORT
```

Possible JSON configuration:

```sh
$ sauth youtube -c conf.json
```

conf.json

```json
{
  "client_id": "CLIENT_KEY",
  "client_secret": "CLIENT_SECRET",
  "port": 9999
}
```

## license

MIT


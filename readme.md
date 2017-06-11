# FizBot

Simple boilerplate for making a facebook (for now) chatbot. Checkout the [post]() on how it works.

## Setup

```
$ npm install -g wt-cli
$ npm install #for the local node packages
$ wt init
```

## Development and Deployment

- `express.js` has the boilerplate stuff, it's the entry point for the webtask.

- `convo.js` is the starting point of your conversational interface, you can create other functions that help with the flow of conversation and import them there.

- Local development: `wt serve express --bundle --secret PAGE_ACCESS_TOKEN=<token from fb>`

- Deployment: `wt create express --bundle --secret PAGE_ACCESS_TOKEN=<token from fb>`

## Known issues

- I suspect that if many people are talking to it, it may send too many requests. If so, a queue may be needed to honor the 1s limit Webtask has.

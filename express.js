/**** BOILERPLATE CODE FOR TALKING TO FACEBOOK  ****/
const express = require('express');
const webtask = require('webtask-tools');
const app = express();
const request = require('request')
const convo = require('./convo');

app.use(require('body-parser').json());

//This has to match the string you entered when setting up a webhook
const VERIFY_TOKEN = 'I am the big cheese'

app.post('/webhook', (req, res) => {
  const secrets = req.webtaskContext.data;
  const data = req.body;
  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      const pageID = entry.id;
      const timeOfEvent = entry.time;
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event, secrets);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
    // Assume all went well.
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedMessage(event, secrets) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;
  console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  const messageId = message.mid;

  const messageText = message.text;
  const messageAttachments = message.attachments;

  if (messageText) {
    sendTextMessage(senderID, convo(messageText, event), secrets);
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}
function sendTextMessage(recipientId, messageText, secrets) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  callSendAPI(messageData, secrets);
}
function callSendAPI(messageData, secrets) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: secrets.PAGE_ACCESS_TOKEN
    },
    method: 'POST',
    json: messageData
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      const recipientId = body.recipient_id;
      const messageId = body.message_id;
      console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      // console.error(response);
      // console.error(error);
    }
  });
}

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});
// expose this express app as a webtask-compatible function

module.exports = webtask.fromExpress(app);

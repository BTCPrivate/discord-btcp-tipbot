var Discordie = require("discordie");
var Events = Discordie.Events;
var config = require('./config.json');
//log_in(config.username, config.password);
var fs = require('fs'),
  coin = require('node-altcoin');

var coin = coin({
  host: "127.0.0.1",
  port: "8232",
  user: "bitcoin",
  pass: "local321"
});

var client = new Discordie();
client.connect({
  token: config.connect_token
}); //discord bot auth token

client.Dispatcher.on(Events.GATEWAY_READY, e => {
  console.log("Connected as: " + client.User.username);
});

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
  if (e.message.content == "ping")
    e.message.channel.sendMessage("pong");

  if (e.message.content == "bal")
    coin.getBalance(function(err, balance) {
      if (err) {
        console.log('Could not connect to %s RPC API! ', "zcl", err);
        process.exit(1);
        return;
      }

      var balance = typeof(balance) == 'object' ? balance.result : balance;
      console.log('Connected to JSON RPC API. Current total balance is %d ' + "zcl", balance);
      e.message.channel.sendMessage("Your current zcl tip balance is: " + balance);
    });


  if (e.message.content == "diff")
    coin.getDifficulty(function(err, diff) {
      e.message.channel.sendMessage(diff);
    });

  if (e.message.content == "info")
    coin.getinfo(function(err, info) {
      e.message.channel.sendMessage(info);
    });

  if (e.message.content == "newAddress")
    coin.getNewAddress(function(err, address) {
      e.message.channel.sendMessage(address);
    });
  if (e.message.content == "hashrate")
    coin.gethashespersec(function(err, hash) {
      e.message.channel.sendMessage(hash);
    });

});

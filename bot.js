var Discordie = require("discordie");
var Events = Discordie.Events;
var config = require('./config.json');
//log_in(config.username, config.password);
var fs = require('fs'),
  coin = require('node-altcoin');
var user_prefix = config.user_cmd_prefix;
var bot_user = config.bot_user;

var coin = coin({
  host: config.daemon_ip,
  port: config.daemon_port,
  user: config.daemon_rpcuser,
  pass: config.daemon_rpcpassword
});

//todo add address balance lookup via:
//https://explorer.btcprivate.org/api/addr/b16CX1xECayDxrbnBCcycNRe6VG2xPqna19/balance

var client = new Discordie();
client.connect({
  token: config.connect_token
}); //discord bot auth token
console.log("Connected to daemon as: " + config.daemon_rpcuser);

client.Dispatcher.on(Events.GATEWAY_READY, e => {
  console.log("Connected to discord as: " + client.User.username);
});

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
  bot = e.message.channel;
  msg = e.message.content.toLowerCase();
  channel = e.message.channel;
  mention = e.message.author.nickMention;
  full_user = e.message.author.username + "#" + e.message.author.discriminator;
  var channelId = (e.message.channel_id);
  var msgId = (e.message.id);
  var msgTxt = (e.message.content);
  var guildId = (e.message.channel.guild_id);



  if (msg.startsWith(user_prefix) && msg == "bal"){
    coin.getBalance(function(err, balance) {
      if (err) {
        console.log('Could not connect to %s RPC API! ', "btcp", err);
        process.exit(1);
        return;
      }

      var balance = typeof(balance) == 'object' ? balance.result : balance;
      console.log('Connected to JSON RPC API. Current total balance is %d ' + "btcp", balance);
      e.message.channel.sendMessage("Your current btcp tip balance is: " + balance);
    });

  }



  if (e.message.content == "diff")
    coin.getDifficulty(function(err, diff) {
      e.message.channel.sendMessage(diff);
    });

  if (e.message.content == "getinfo")
    coin.getinfo(function(err, info) {
      const strData = JSON.stringify(info);
      var jsonData = JSON.parse(strData);
      //console.log(strData);
      var version = jsonData.version;
      var blocks = jsonData.blocks;
      var conn = jsonData.connections;
      var diff = jsonData.difficulty;


      console.log('Daemon version: ' + version + '\nBlock Height: ' + blocks + '\nConnections: ' + conn + '\nNetwork Difficulty: ' + diff);

      e.message.channel.sendMessage('Daemon version: ' + version + '\nBlock Height: ' + blocks + '\nConnections: ' + conn + '\nNetwork Difficulty: ' + diff);
    });

  if (e.message.content == "newAddress")
    coin.getNewAddress(function(err, address) {
      e.message.channel.sendMessage(address);
    });
  if (e.message.content == "hashrate")
    coin.getnetworkhashps(function(err, hash) {
      e.message.channel.sendMessage(hash);
    });

});

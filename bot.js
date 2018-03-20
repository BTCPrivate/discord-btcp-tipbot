var Discordie = require("discordie");
var Events = Discordie.Events;
var config = require('./config.json');
const request = require("request");
//log_in(config.username, config.password);
var fs = require('fs'),
  coin = require('node-altcoin');
user_prefix = config.user_cmd_prefix;
bot_user = config.bot_user;
//console.log('user_prefix: ' + user_prefix);
//console.log('bot_user: ' + bot_user);

var coin = coin({
  host: config.daemon_ip,
  port: config.daemon_port,
  user: config.daemon_rpcuser,
  pass: config.daemon_rpcpassword
});

//todo add address balance lookup via:
//https://explorer.btcprivate.org/api/addr/b16CX1xECayDxrbnBCcycNRe6VG2xPqna19/balance

function insertDecimal(num) {
  return (num / 100).toFixed(8);
}


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
  //console.log(msg);
  channel = e.message.channel;
  mention = e.message.author.nickMention;
  full_user = e.message.author.username + "#" + e.message.author.discriminator;
  channelId = e.message.channel_id;
  msgId = e.message.id;
  msgTxt = e.message.content;
  guildId = e.message.channel.guild_id;

/*
  if (full_user !== bot_user && (msg.startsWith(user_prefix) && msg == "!bal")) {
    //console.log('balance cmd');
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
*/

//!bal command only works in DM's to BOT
  if (guildId === null && full_user !== bot_user && (msg.startsWith(user_prefix) && msg.startsWith("!bal"))) {
    balReqChannel = e.message.channel_id;
    console.log('channelid: ' + balReqChannel);
    //todo add address balance lookup via:
    //https://explorer.btcprivate.org/api/addr/b16CX1xECayDxrbnBCcycNRe6VG2xPqna19/balance
    //var fullmsgTxt = e.message.content.toLowerCase();
    var fullTxt = e.message.content.split(" ");
    var lookupAddress = (fullTxt[1]);
    console.log('lookupaddress: ' + lookupAddress);
    const options = {
      url: 'https://explorer.btcprivate.org/api/addr/' + lookupAddress + '/balance',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'User-Agent': 'discord-btcp-tipbot'
      }
    };

    request(options, function(err, res, body) {
      //let json = JSON.parse(body);
      //var userBalance = json.circulating_supply;
      returnedBalance = body / 100000000;
      console.log(returnedBalance);
      console.log('channel :' + channel);
      channel.sendMessage("The current balance of: " + lookupAddress + " is: " + returnedBalance + " BTCP");

    });

  }

  if (full_user !== bot_user && (msg.startsWith(user_prefix) && msg.includes("diff"))) {
    coin.getDifficulty(function(err, diff) {
      e.message.channel.sendMessage(diff);
    });
  }

  if (full_user !== bot_user && (msg.startsWith(user_prefix) && msg.includes("getinfo"))) {
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
  }

  if (full_user !== bot_user && (msg.startsWith(user_prefix) && msg.includes("newaddress"))) {
    coin.getNewAddress(function(err, address) {
      e.message.channel.sendMessage(address);
    });
  }

  if (full_user !== bot_user && (msg.startsWith(user_prefix) && msg.includes("hashrate"))) {
    coin.getnetworkhashps(function(err, hash) {
      e.message.channel.sendMessage(hash);
    });
  }
});

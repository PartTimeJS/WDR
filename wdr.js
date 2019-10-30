//------------------------------------------------------------------------------
//  PACKAGE REQUIREMENTS
//------------------------------------------------------------------------------
const fs = require("fs");
const os = require("os");
const ini = require("ini");
const express = require("express");
const cluster = require("cluster");
const bodyParser = require("body-parser");
const config = ini.parse(fs.readFileSync("./config/config.ini", "utf-8"));

var avg_objs, objs = [], requests = 0;

//------------------------------------------------------------------------------
//  MASTER PROCESS
//------------------------------------------------------------------------------
if (cluster.isMaster) {
  let cpu_count = "";
  if(config.Child_Processes){
    cpu_count = config.Child_Processes;
  } else {
    cpu_count = 4;
  }
  console.info("[wdr.js] Now Listening on port "+config.LISTENING_PORT+".");

  // SPAWN A FORK FOR EACH CORE/THREAD AVAILABLE
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpu_count; i++) {
    cluster.fork({ "fork": i });
  }

  // RESTART FORK ON EXIT
  cluster.on("exit", (worker, code, signal) => {
    console.error("[wdr.js] Worker Died. Respawning...",worker);
    process.exit(1);
  });

//------------------------------------------------------------------------------
//  CHILD PROCESSES
//------------------------------------------------------------------------------
} else {

  if(config.DEBUG.Webhook_Load){
    Start_Intervals();
  }

  // LOAD MAIN FOR EACH PROCESS (MANDATORY)
  const MAIN = require("./modules/base/bot.js");

  // DEFINE THE EXPRESS SERVER
  var server = express().use(express.json({ limit: "1mb" }));

  // CATCH REQUESTS AND SEND FOR PARSING
  server.post("/", async (webhook, resolve) => {
    requests++;
    if(objs.length < 20){
      objs.push(webhook.body.length);
    } else {
      objs.slice(1);
      objs.push(webhook.body.length);
    }
    return MAIN.webhookParse(webhook.body);
  });

  // LISTEN TO THE SPECIFIED PORT FOR TRAFFIC
  server.listen(config.LISTENING_PORT);
}

function Start_Intervals(){
  setInterval( async function() {
    let total = 0;
    await objs.forEach((data,index) => { total = total + data; });
    avg_objs = total / objs.length;
  }, 60000 * 1);
  setInterval(function() {
    console.log("[wdr.js] Process: "+process.env.fork+" | Requests: "+requests+" | Avg Objects: "+avg_objs);
    requests = 0;
  }, 60000 * 15);
}

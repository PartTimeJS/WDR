exports.Load = function(WDR) {
  return new Promise(async resolve => {
    // SET ONTIME FUNCTIONS
    var ontime_servers = [],
      ontime_times = [];
    WDR.Discords.forEach(function(server) {
      let server_purge = WDR.Moment(),
        timezone = WDR.GeoTz(server.geofence[0][0][1], server.geofence[0][0][0]);
      server_purge = WDR.Moment.tz(server_purge, timezone[0]).set({
        hour: 23,
        minute: 55,
        second: 0,
        millisecond: 0
      });
      server_purge = WDR.Moment.tz(server_purge, WDR.Config.TIMEZONE).format("HH:mm:ss");
      ontime_times.push(server_purge);
      ontime_servers.push(server);
    });

    //------------------------------------------------------------------------------
    //  ONTIME DATABASE WDRTENANCE
    //------------------------------------------------------------------------------
    WDR.Ontime({
      cycle: ontime_times
    }, function(ot) {
      WDR.Purge_Channels();
      return ot.done();
    });

    // CHECK DATABASE FOR UPGRADED OR REMOVED POKESTOPS
    let check_time = WDR.Moment();

    // GET CHANNELS FOR PURGING
    WDR.Purge_Channels = (command) => {

      function clear_channel(channel_id) {
        return new Promise(async resolve => {
          let channel = await Bot.channels.cache.get(channel_id);
          if (!channel) {
           return resolve(false);
            return WDR.Console.error(WDR, "[load_ontime.js] [" + WDR.Time(null, "log") + "] Could not find a channel with ID: " + channel_id);
          }
          channel.fetchMessages({
            limit: 99
          }).then(messages => {
            channel.bulkDelete(messages).then(deleted => {
              if (messages.size > 0) {
                clear_channel(channel_id).then(result => {
                 return resolve(true);
                });
              } else {
                WDR.Console.info(WDR, "[load_ontime.js] [" + WDR.Time(null, "log") + "] Purged all messages in " + channel.name + " (" + channel.id + ")");
               return resolve(true);
              }
            }).catch(console.error);
          });
         return resolve(true);
        });
      }

      let now = WDR.Moment().format("HH:mm") + ":00";
      ontime_servers.forEach(function(server) {
        if (server.purge_channels == "ENABLED") {
          let purge_time = WDR.Moment(),
            timezone = WDR.GeoTz(server.geofence[0][1][1], server.geofence[0][1][0]);
          purge_time = WDR.Moment.tz(purge_time, timezone[0]).set({
            hour: 23,
            minute: 50,
            second: 0,
            millisecond: 0
          });
          purge_time = WDR.Moment.tz(purge_time, WDR.Config.TIMEZONE).format("HH:mm:ss");
          if (now == purge_time || command == "purge") {
            for (var i = 0; i < server.channels_to_purge.length; i++) {
              clear_channel(server.channels_to_purge[i]);
            }
          }
        }
      });
      return;
    }
   return resolve(WDR);
  });
}
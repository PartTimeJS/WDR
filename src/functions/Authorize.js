/* eslint-disable no-async-promise-executor */
module.exports = (WDR, guild_id, user_id, allowedRoles) => {
    return new Promise(async resolve => {
        try {

            const members = await WDR.Bot.guilds.cache
                .get(guild_id)
                .members
                .fetch();

            if (members) {
                const member = members.get(user_id);
                if (member) {

                    let foundRole = false;

                    const roles = member.roles.cache
                        // eslint-disable-next-line no-undef
                        .filter(x => BigInt(x.id).toString())
                        .keyArray();

                    for (let r = 0, rlen = allowedRoles.length; r < rlen; r++) {
                        if (roles.includes(allowedRoles[r])) {
                            foundRole = true;
                            break;
                        }
                        if (member.roles.cache.has(allowedRoles[r])) {
                            foundRole = true;
                            break;
                        }
                    }
                    return resolve(foundRole);

                } else {
                    return resolve(false);
                }

            } else {
                WDR.Console.error(WDR, '[Authorize.js] No Members returned for guild: ' + guild_id);
                return resolve(false);
            }

        } catch (e) {
            WDR.Console.error(WDR, '[Authorize.js] Failed to fetch Member & Roles', [e]);
            return resolve(false);
        }
    });
};

// module.exports = (member, roleList) => {
//   return new Promise(resolve => {
//     console.log("--------Start--------\n", roleList)
//     for (let r = 0, rlen = roleList.length; r < rlen; r++) {
//       console.log(r + " list", roleList[r])
//       console.log("hasrole", subMember.roles.cache.has("277658037982986240"))
//       if (subMember.roles.cache.has(role => role.id === roleList[r])) {
//         console.log(true);
//        return resolve(true);
//       } else {
//         console.log(false);
//       }
//     }
//     console.log("------Geting here------")
//    return resolve(false);
//   });
// }
/* eslint-disable no-async-promise-executor */
module.exports = (WDR, guild_id, user_id, allowedRoles) => {
    return new Promise(async resolve => {
        async function getUserRoles() {
            try {
                const members = await WDR.Bot.guilds.cache
                    .get(guild_id)
                    .members
                    .fetch();
                const member = members.get(user_id);
                if(!member){
                    if (WDR.Config.DEBUG.Authorization == 'ENABLED') {
                        WDR.Console.log(WDR, '[DEBUG] [Authorize.js] user ' + user_id + 'is not a member of guild ' + guild_id);
                    }
                    return [];
                } else {
                    const roles = member.roles.cache
                        // eslint-disable-next-line no-undef
                        .filter(x => BigInt(x.id).toString())
                        .keyArray();
                    return roles;
                }
            } catch (e) {
                console.error('Failed to get roles in guild', guild_id, 'for user', user_id);
                console.error(e);
            }
            return [];
        }

        let foundRole = false;

        const userRoles = await getUserRoles();
        for (let r = 0, rlen = userRoles.length; r < rlen; r++) {
            if (allowedRoles.includes(userRoles[r])) {
                foundRole = true;
                return resolve(true);
            }
        }

        if (foundRole == false && WDR.Config.DEBUG.Authorization == 'ENABLED') {
            WDR.Console.log(WDR, '[DEBUG] [Authorize.js] User does not have require roles to receive a sub.', 'allowedRoles:', allowedRoles, 'userRoles:', userRoles);
        }
    });
};

// try {

//     const members = await WDR.Bot.guilds.cache
//         .get(guild_id)
//         .members
//         .fetch();

//     if (members) {
//         const member = members.get(user_id);
//         if (member) {

            

//             const roles = member.roles.cache
//                 // eslint-disable-next-line no-undef
//                 .filter(x => BigInt(x.id).toString())
//                 .keyArray();

//             for (let r = 0, rlen = allowedRoles.length; r < rlen; r++) {
//                 if (roles.includes(allowedRoles[r])) {
//                     foundRole = true;
//                     break;
//                 }
//                 if (member.roles.cache.has(allowedRoles[r])) {
//                     foundRole = true;
//                     break;
//                 }
//             }
//             if (foundRole == false && WDR.Config.DEBUG.Authorization == 'ENABLED') {
//                 WDR.Console.log(WDR, '[DEBUG] [Authorize.js] User does not have require roles to receive a sub.', 'allowedRoles:', allowedRoles, 'userRoles:', roles);
//             }
//             return resolve(foundRole);

//         } else {
//             if (WDR.Config.DEBUG.Authorization == 'ENABLED') {
//                 WDR.Console.log(WDR, '[DEBUG] [Authorize.js] user ' + user_id + 'is not a member of guild ' + guild_id);
//             }
//             return resolve(false);
//         }

//     } else {
//         WDR.Console.error(WDR, '[Authorize.js] No Members returned for guild: ' + guild_id);
//         return resolve(false);
//     }

// } catch (e) {
//     WDR.Console.error(WDR, '[Authorize.js] Failed to fetch Member & Roles', [e]);
//     return resolve(false);
// }
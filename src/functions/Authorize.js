/* eslint-disable no-async-promise-executor */
module.exports = (WDR, guild_id, user_id, allowedRoles) => {
    return new Promise(async resolve => {

        const user = await WDR.Bot.users.fetch(user_id);
        if(!user){
            WDR.Console.error(WDR, '[Authorize.js] Bad user ID found in the database.','user_id:', user_id, 'guild_id:', guild_id);
        }

        const guild = await WDR.Bot.guilds.cache.get(guild_id);

        async function getUserRoles() {
            const members = await guild.members.fetch();
            if(members){

                const member = members.get(user_id);
                if(member){

                    const roles = member.roles.cache
                    // eslint-disable-next-line no-undef
                        .filter(x => BigInt(x.id).toString())
                        .keyArray();
                    return roles;

                } else {
                    if (WDR.Config.DEBUG.Authorization == 'ENABLED') {
                        WDR.Console.info(WDR, `[DEBUG] [Authorize.js] ${user.username} (${user_id}) is NOT a member of ${guild.name} (${guild_id})`);
                    }
                    return false;

                }
            } else {
                WDR.Console.error(WDR, `[Authorize.js] Failed to fetch members for ${guild.name} (${guild_id})`);
                return false;
            }
        }

        if(guild){

            let foundRole = false;

            const userRoles = await getUserRoles();
            if(!userRoles){
                return resolve(false);
            } else {
                for (let r = 0, rlen = userRoles.length; r < rlen; r++) {
                    if (allowedRoles.includes(userRoles[r])) {
                        if (WDR.Config.DEBUG.Authorization == 'ENABLED') {
                            WDR.Console.log(WDR, `[DEBUG] [Authorize.js] ${user.username} (${user_id}) is authorized for ${guild.name} (${guild_id})`);
                        }
                        foundRole = true;
                        return resolve(true);
                    }
                }
                if (foundRole == false && WDR.Config.DEBUG.Authorization == 'ENABLED') {
                    WDR.Console.info(WDR, `[DEBUG] [Authorize.js] ${user.username} ${user_id} does not have require roles to receive a DM for ${guild.name} (${guild_id}).`);
                    console.info('allowedRoles:', allowedRoles.toString());
                    console.info('userRoles:', userRoles.toString());
                }
                return resolve(false);
            }
        } else {
            WDR.Console.error(WDR, `[Authorize.js] Failed to fetch guild ${guild_id}`);
            return false;
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
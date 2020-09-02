module.exports = (userRoles, roleList) => {
  return new Promise(resolve => {
    let foundRole = false;
    for (let r = 0, rlen = roleList.length; r < rlen; r++) {
      if (userRoles.includes(roleList[r])) {
        foundRole = true;
        break;
      }
    }
    return resolve(foundRole);
  });
}

// module.exports = (member, roleList) => {
//   return new Promise(resolve => {
//     console.log("--------Start--------\n", roleList)
//     for (let r = 0, rlen = roleList.length; r < rlen; r++) {
//       console.log(r + " list", roleList[r])
//       console.log("hasrole", member.roles.cache.has("277658037982986240"))
//       if (member.roles.cache.has(role => role.id === roleList[r])) {
//         console.log(true);
//         return resolve(true);
//       } else {
//         console.log(false);
//       }
//     }
//     console.log("------Geting here------")
//     return resolve(false);
//   });
// }
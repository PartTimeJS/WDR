module.exports = (userRoles, roleList) => {
  return new Promise(resolve => {
    for (let r = 0, rlen = roleList.length; r < rlen; r++) {
      if (userRoles.includes(roleList[r])) {
        return resolve(true);
      }
    }
    return resolve(false);
  });
}
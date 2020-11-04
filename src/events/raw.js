module.exports = (BOT, event) => {
    if (!event.d || !event.t) {
        return;
    }
    let config = BOT.Configs.get(event.d.guild_id);
    if (!config) {
        return;
    }
    switch (true) {
        case event.t == null:
            return;
        case event.d.user_id == BOT.ID:
            return;
        case event.t == 'MESSAGE_REACTION_ADD':
            return BOT.emit('messageReactionAdd', event);
        case event.t == 'MESSAGE_REACTION_REMOVE':
            return BOT.emit('messageReactionRemove', event);
        default:
            return;
    }
};
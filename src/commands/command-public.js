module.exports = (WDR, Message) => {
    let command = Message.content.split(' ')[0].slice(1);
    try {
        switch(command){
            case 'event':
                command = 'events'; break;
        }
        if (WDR.Fs.existsSync(WDR.Dir + '/src/commands/public/' + command.toLowerCase() + '.js')) {
            let Cmd = require(WDR.Dir + '/src/commands/public/' + command.toLowerCase() + '.js');
            Cmd(WDR, Message);
        } else {
            console.log(WDR.Dir + '/src/commands/public/' + command.toLowerCase() + '.js does not exist');
        }
    } catch (error) {
        console.error(error);
    }
};
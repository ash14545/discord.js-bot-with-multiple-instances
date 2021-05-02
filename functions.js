const fs = require("fs");
const path = require("path");

module.exports = client => {
    function walk(dir, callback) {
        fs.readdir(dir, function (err, files) {
            if (err) throw err;
            files.forEach(function (file) {
                var filepath = path.join(dir, file);
                fs.stat(filepath, function (err, stats) {
                    if (stats.isDirectory()) {
                        walk(filepath, callback);
                    } else if (stats.isFile() && file.endsWith(".js")) {
                        let props = require(`./${filepath}`);
                        client.commands.set(props.name, props);
                        props.aliases.forEach(alias => {
                            client.aliases.set(alias, props.name);
                        });
                    }
                });
            });
        });
    }
    walk(`./commands/`);

    fs.readdirSync('./handlers' + '/').forEach(function (file) {
        if (file.match(/\.js$/) !== null && file !== 'index.js') {
            var name = file.replace('.js', '');
            exports[name] = require('./handlers/' + file)(client);
        };
    });
};

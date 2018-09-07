const Command = require('../../base');
const Warehouse = require('warehouse.ai-api-client');
const columns = require('cli-columns');
const chalk = require('chalk');

class PackagesCommand extends Command {

  /**
   * Runs the get:packages command
   *
   * @async
   * @returns {Promise} The result or error
   */
  async run() {
    const { flags, args } = this.parse(PackagesCommand);
    const { host, auth } = this.mergeConfig(flags);

    const wrhs = new Warehouse(`https://${auth.user}:${auth.pass}@${host}`);

    return new Promise((resolve, reject) => {
      wrhs.packages.get({ pkg: args.package }, (err, pkg) => {
        if (err) {
          if(err.message.includes('Package not found')) {
            console.log(`${chalk.green.bold(args.package)} does not exist in warehouse.`);
            console.log('');
            return reject('Package not found');
          }

          this.renderError('packages', args.package, err);
          return reject(err);
        }

        pkg = !pkg.length ? [pkg.name] : pkg.map(pkgObj => pkgObj.name);

        if (flags.json) {
          console.log(JSON.stringify(pkg));
          return resolve(JSON.stringify(pkg));
        }

        console.log(columns(pkg));
        resolve(pkg);
      });
    });
  }
}

PackagesCommand.description = `Gets information about packages that exist in warehouse.`;

PackagesCommand.args = [{
  name: 'package',
  description: 'An individual package'
}];

PackagesCommand.flags = Command.flags;

module.exports = PackagesCommand;

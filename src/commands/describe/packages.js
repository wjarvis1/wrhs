const Command = require('../../base');
const Warehouse = require('warehouse.ai-api-client');
const columns = require('cli-columns');
const chalk = require('chalk');

class PackagesCommand extends Command {

  /**
   * Runs the describe:packages command
   *
   * @async
   * @returns {Promise} The result or error
   */
  async run() {
    const { flags, args } = this.parse(PackagesCommand);
    const { host, auth } = this.mergeConfig(flags);

    const wrhs = new Warehouse(`https://${auth.user}:${auth.pass}@${host}`);

    return new Promise((resolve, reject) => {
      wrhs.packages.get({ pkg: args.package }, (err, pkgs) => {
        if (err) {
          if(err.message.includes('Package not found')) {
            console.log(`${chalk.green.bold(args.package)} does not exist in warehouse.`);
            console.log('');
            return reject('Package not found');
          }

          this.renderError('packages', args.package, err);
          return reject(err);
        }
        
        if (flags.json) {
          console.log(JSON.stringify(pkgs));
          return resolve(JSON.stringify(pkgs));
        }
        
        pkgs = !pkgs.length ? [pkgs] : pkgs;

        pkgs.forEach(pkg => {
          const numDeps = Object.keys(pkg.dependencies || {}).length;
          const deps = Object.entries(pkg.dependencies || {}).map(dep => `${chalk.yellow(dep[0])}: ${dep[1]}`);

          console.log('');
          console.log(`${chalk.green.bold(pkg.name)}@${chalk.green.bold(pkg.version)} | ${chalk.green(pkg.extended.license)} | deps: ${numDeps ? chalk.cyan(numDeps) : chalk.green('none')} | SHA: ${chalk.yellow(pkg.gitHead)}`);
          console.log(pkg.description);
          console.log('');
          console.log(`keywords: ${pkg.keywords.map(k => chalk.yellow(k)).join(', ')}`);
          if(pkg.extended.bin) {
            console.log('');
            console.log(`bin: ${chalk.yellow(Object.keys(pkg.extended.bin).join(', '))}`);
          }

          const maxDeps = 24;
          console.log('');
          console.log('dependencies:');
          console.log(columns(deps.slice(0, maxDeps), {padding: 1}));
          if (deps.length > maxDeps) {
            console.log(`(...and ${deps.length - maxDeps} more.)`);
          }

          if(pkg.extended.contributors && pkg.extended.contributors.length) {
            console.log('');
            console.log('maintainers:');
            pkg.extended.contributors.forEach(contrib => console.log(`- ${chalk.yellow(contrib.name)} <${chalk.cyan(contrib.email)}>`));
          }

          console.log('');
          console.log('dist-tags:')
          console.log(columns(Object.entries(pkg.distTags).map(
            tag => `${chalk.green.bold(tag[0])}: ${tag[1]}`
          )));
        });
          
        // console.log(columns(pkg));
        resolve(pkgs);
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

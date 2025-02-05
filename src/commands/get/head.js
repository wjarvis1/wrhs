const Command = require('../../base');
const chalk = require('chalk');

class HeadCommand extends Command {

  /**
   * Runs the get:head command
   *
   * @async
   * @returns {Promise} The result or error
   */
  async run() {
    const { flags, args } = this.parse(HeadCommand);
    const { env /* , locale*/ } = args; // package is reserved so we don't try to destructure it
    const { wrhsHost, auth } = this.mergeConfig(flags);

    if (!wrhsHost) {
      this.error(this.missingHostError());
    }

    const wrhs = this.wrhs(auth, { wrhsHost });

    // Get build for environment for a given package name
    return new Promise((resolve, reject) => {
      wrhs.builds.heads({ env, pkg: args.package /* , locale*/ }, (err, response) => {
        if (err) {
          this.renderError('build head', args.package, err);
          return reject(err);
        }

        if (flags.json) {
          this.log(JSON.stringify(response));
          return resolve(JSON.stringify(response));
        }

        response.forEach(build => {
          const titleText = ` ${chalk.green.bold(build.name)} | ${chalk.green(build.env)} | ${build.version} | ${build.locale} `;
          const width = Math.max((process.stdout.columns || 150) - titleText.length, 10);
          const titleBar = chalk.bgWhite(new Array(Math.floor(width / 2)).fill(' ').join(''));

          this.log(titleBar + titleText + titleBar);

          this.renderBuild(build);
        });

        resolve(response);
      });
    });
  }
}

HeadCommand.description = `Shows information about the head build for the given package in the given environment.
Accepts an optional locale.
`;

HeadCommand.args = [{
  name: 'package',
  required: true,
  description: 'The package to get the head build for'
}, {
  name: 'env',
  required: true,
  description: 'The environment to get the head build for'
}];
// , {
//   name: 'locale',
//   description: 'The locale to get'
// }];

HeadCommand.flags = Command.flags;

module.exports = HeadCommand;

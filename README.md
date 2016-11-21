## AeroGear Node.js Sync Server 

[![Build Status](https://api.travis-ci.org/aerogear/aerogear-nodejs-sync-server.svg?branch=master)](https://travis-ci.org/aerogear/aerogear-nodejs-sync-server)
[![Coverage Status](https://coveralls.io/repos/github/aerogear/aerogear-nodejs-sync-server/badge.svg?branch=master)](https://coveralls.io/github/aerogear/aerogear-nodejs-sync-server?branch=master)

This project in an implementation of Google's [Differential Synchonrization](http://research.google.com/pubs/pub35605.html) 
by Neil Fraser, that can be used by AeroGear's client libraries.

## Project Info

|                 | Project Info  |
| --------------- | ------------- |
| License:        | Apache License, Version 2.0  |
| Build:          | NPM  |
| Documentation:  | http://aerogear.org/sync/  |
| Issue tracker:  | https://issues.jboss.org/browse/AGSYNC  |
| Mailing lists:  | [aerogear-users](http://aerogear-users.1116366.n5.nabble.com/) ([subscribe](https://lists.jboss.org/mailman/listinfo/aerogear-users))  |
|                 | [aerogear-dev](http://aerogear-dev.1069024.n5.nabble.com/) ([subscribe](https://lists.jboss.org/mailman/listinfo/aerogear-dev))  |

## Building

### Installing Build Dependencies
To install the dependencies of the project run the following command:

    $ npm install

This will install the versions of the dependencies declared in package.json. This is only required to be done once before
building the first time, or if the dependencies in package.json have been updated.


### Starting the server

    $ npm start

## Documentation

For more details about the current release, please consult [our documentation](http://aerogear.org/sync).

### Resources
* [Differential Synchronization presentation](https://www.youtube.com/watch?v=S2Hp_1jqpY8)
* [Differential Synchronization paper](http://research.google.com/pubs/pub35605.html)
* [Differential Synchronization step by step keynote presentation](https://www.icloud.com/iw/#keynote/BAKHgqmqd5ETPe9ebKyBhSINoBo1QHaNPYeF/diffsync)

## Development

### Running tests

    $ npm test

To run a single test you can use:

    $ node test/sync-engine-test.js | node_modules/tap-spec/bin/cmd.js

### Debugging
If you are using Node 7.x you can use the `--inspect --debug-brk` command line options to debug code, for example:

    $ node --inspect --debug-brk test/sync-engine-test.js | node_modules/tap-spec/bin/cmd.js
    Debugger listening on port 9229.
    Warning: This is an experimental feature and could change at any time.
    To start debugging, open the following URL in Chrome:
    chrome-devtools://devtools/remote/serve_file/@60cd6e859b9f557d2312f5bf532f6aec5f284980/inspector.html?experiments=true&v8only=true&ws=localhost:9229/9840e0cc-0603-47e1-a817-14989ab71f57

> On previous version of Node, use [devtool](https://www.npmjs.com/package/devtool):
> devtool test/sync-engine-test.js

#### Enable debug logging
Logging can be enable by setting the `NODE_DEBUG` environment variable to the name of the JavaScript source file you want to enable logging for. For example:

    $ env NODE_DEBUG=sync-engine node index.js

### Running ESlint

    $ npm run lint

To automatically fix issues you can use:

    $ $ npm run lint -- --fix


Multiple JavaScript files can be added if you are interested in more than one by comma separating them.

If you would like to help develop AeroGear you can join our [developer's mailing list](https://lists.jboss.org/mailman/listinfo/aerogear-dev), join #aerogear on Freenode, or shout at us on Twitter @aerogears.

Also takes some time and skim the [contributor guide](http://aerogear.org/docs/guides/Contributing/)

## Questions?

Join our [user mailing list](https://lists.jboss.org/mailman/listinfo/aerogear-users) for any questions or help! We really hope you enjoy app development with AeroGear!

## Found a bug?

If you found a bug please create a ticket for us on [Jira](https://issues.jboss.org/browse/AGSYNC) with some steps to reproduce it.


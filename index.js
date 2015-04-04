//
//  Copyright (C) 2015 Seth Holladay.
//
//  This Source Code Form is subject to the terms of the Mozilla Public
//  License, v. 2.0. If a copy of the MPL was not distributed with this
//  file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict';

var pkg = require('./package.json');

module.exports = require('./lib');

// Let our users access our package data easily,
// without forcing them to find it with code.
module.exports.pkg     = pkg;
// Let our users access the package version easily.
module.exports.version = pkg.version;

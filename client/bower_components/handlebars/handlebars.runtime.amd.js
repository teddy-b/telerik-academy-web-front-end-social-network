'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!

 handlebars v4.0.5

Copyright (C) 2011-2015 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
define('handlebars/utils', ['exports'], function (exports) {
  'use strict';

  exports.__esModule = true;
  exports.extend = extend;
  exports.indexOf = indexOf;
  exports.escapeExpression = escapeExpression;
  exports.isEmpty = isEmpty;
  exports.createFrame = createFrame;
  exports.blockParams = blockParams;
  exports.appendContextPath = appendContextPath;
  var escape = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  var badChars = /[&<>"'`=]/g,
      possible = /[&<>"'`=]/;

  function escapeChar(chr) {
    return escape[chr];
  }

  function extend(obj /* , ...source */) {
    for (var i = 1; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          obj[key] = arguments[i][key];
        }
      }
    }

    return obj;
  }

  var toString = Object.prototype.toString;

  exports.toString = toString;
  // Sourced from lodash
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  /* eslint-disable func-style */
  var isFunction = function isFunction(value) {
    return typeof value === 'function';
  };
  // fallback for older versions of Chrome and Safari
  /* istanbul ignore next */
  if (isFunction(/x/)) {
    exports.isFunction = isFunction = function isFunction(value) {
      return typeof value === 'function' && toString.call(value) === '[object Function]';
    };
  }
  exports.isFunction = isFunction;

  /* eslint-enable func-style */

  /* istanbul ignore next */
  var isArray = Array.isArray || function (value) {
    return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? toString.call(value) === '[object Array]' : false;
  };

  exports.isArray = isArray;
  // Older IE versions do not directly support indexOf so we must implement our own, sadly.

  function indexOf(array, value) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i] === value) {
        return i;
      }
    }
    return -1;
  }

  function escapeExpression(string) {
    if (typeof string !== 'string') {
      // don't escape SafeStrings, since they're already safe
      if (string && string.toHTML) {
        return string.toHTML();
      } else if (string == null) {
        return '';
      } else if (!string) {
        return string + '';
      }

      // Force a string conversion as this will be done by the append regardless and
      // the regex test will do this transparently behind the scenes, causing issues if
      // an object's to string has escaped characters in it.
      string = '' + string;
    }

    if (!possible.test(string)) {
      return string;
    }
    return string.replace(badChars, escapeChar);
  }

  function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  function createFrame(object) {
    var frame = extend({}, object);
    frame._parent = object;
    return frame;
  }

  function blockParams(params, ids) {
    params.path = ids;
    return params;
  }

  function appendContextPath(contextPath, id) {
    return (contextPath ? contextPath + '.' : '') + id;
  }
});

;
define('handlebars/exception', ['exports', 'module'], function (exports, module) {
  'use strict';

  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  function Exception(message, node) {
    var loc = node && node.loc,
        line = undefined,
        column = undefined;
    if (loc) {
      line = loc.start.line;
      column = loc.start.column;

      message += ' - ' + line + ':' + column;
    }

    var tmp = Error.prototype.constructor.call(this, message);

    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }

    /* istanbul ignore else */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Exception);
    }

    if (loc) {
      this.lineNumber = line;
      this.column = column;
    }
  }

  Exception.prototype = new Error();

  module.exports = Exception;
});

;
define('handlebars/helpers/block-helper-missing', ['exports', 'module', '../utils'], function (exports, module, _utils) {
  'use strict';

  module.exports = function (instance) {
    instance.registerHelper('blockHelperMissing', function (context, options) {
      var inverse = options.inverse,
          fn = options.fn;

      if (context === true) {
        return fn(this);
      } else if (context === false || context == null) {
        return inverse(this);
      } else if (_utils.isArray(context)) {
        if (context.length > 0) {
          if (options.ids) {
            options.ids = [options.name];
          }

          return instance.helpers.each(context, options);
        } else {
          return inverse(this);
        }
      } else {
        if (options.data && options.ids) {
          var data = _utils.createFrame(options.data);
          data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
          options = { data: data };
        }

        return fn(context, options);
      }
    });
  };
});

;
define('handlebars/helpers/each', ['exports', 'module', '../utils', '../exception'], function (exports, module, _utils, _exception) {
  'use strict';

  // istanbul ignore next

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
  }

  var _Exception = _interopRequireDefault(_exception);

  module.exports = function (instance) {
    instance.registerHelper('each', function (context, options) {
      if (!options) {
        throw new _Exception['default']('Must pass iterator to #each');
      }

      var fn = options.fn,
          inverse = options.inverse,
          i = 0,
          ret = '',
          data = undefined,
          contextPath = undefined;

      if (options.data && options.ids) {
        contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
      }

      if (_utils.isFunction(context)) {
        context = context.call(this);
      }

      if (options.data) {
        data = _utils.createFrame(options.data);
      }

      function execIteration(field, index, last) {
        if (data) {
          data.key = field;
          data.index = index;
          data.first = index === 0;
          data.last = !!last;

          if (contextPath) {
            data.contextPath = contextPath + field;
          }
        }

        ret = ret + fn(context[field], {
          data: data,
          blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
        });
      }

      if (context && (typeof context === 'undefined' ? 'undefined' : _typeof(context)) === 'object') {
        if (_utils.isArray(context)) {
          for (var j = context.length; i < j; i++) {
            if (i in context) {
              execIteration(i, i, i === context.length - 1);
            }
          }
        } else {
          var priorKey = undefined;

          for (var key in context) {
            if (context.hasOwnProperty(key)) {
              // We're running the iterations one step out of sync so we can detect
              // the last iteration without have to scan the object twice and create
              // an itermediate keys array.
              if (priorKey !== undefined) {
                execIteration(priorKey, i - 1);
              }
              priorKey = key;
              i++;
            }
          }
          if (priorKey !== undefined) {
            execIteration(priorKey, i - 1, true);
          }
        }
      }

      if (i === 0) {
        ret = inverse(this);
      }

      return ret;
    });
  };
});

;
define('handlebars/helpers/helper-missing', ['exports', 'module', '../exception'], function (exports, module, _exception) {
  'use strict';

  // istanbul ignore next

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
  }

  var _Exception = _interopRequireDefault(_exception);

  module.exports = function (instance) {
    instance.registerHelper('helperMissing', function () /* [args, ]options */{
      if (arguments.length === 1) {
        // A missing field in a {{foo}} construct.
        return undefined;
      } else {
        // Someone is actually trying to call something, blow up.
        throw new _Exception['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
      }
    });
  };
});

;
define('handlebars/helpers/if', ['exports', 'module', '../utils'], function (exports, module, _utils) {
  'use strict';

  module.exports = function (instance) {
    instance.registerHelper('if', function (conditional, options) {
      if (_utils.isFunction(conditional)) {
        conditional = conditional.call(this);
      }

      // Default behavior is to render the positive path if the value is truthy and not empty.
      // The `includeZero` option may be set to treat the condtional as purely not empty based on the
      // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
      if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    });

    instance.registerHelper('unless', function (conditional, options) {
      return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
    });
  };
});

;
define('handlebars/helpers/log', ['exports', 'module'], function (exports, module) {
  'use strict';

  module.exports = function (instance) {
    instance.registerHelper('log', function () /* message, options */{
      var args = [undefined],
          options = arguments[arguments.length - 1];
      for (var i = 0; i < arguments.length - 1; i++) {
        args.push(arguments[i]);
      }

      var level = 1;
      if (options.hash.level != null) {
        level = options.hash.level;
      } else if (options.data && options.data.level != null) {
        level = options.data.level;
      }
      args[0] = level;

      instance.log.apply(instance, args);
    });
  };
});

;
define('handlebars/helpers/lookup', ['exports', 'module'], function (exports, module) {
  'use strict';

  module.exports = function (instance) {
    instance.registerHelper('lookup', function (obj, field) {
      return obj && obj[field];
    });
  };
});

;
define('handlebars/helpers/with', ['exports', 'module', '../utils'], function (exports, module, _utils) {
  'use strict';

  module.exports = function (instance) {
    instance.registerHelper('with', function (context, options) {
      if (_utils.isFunction(context)) {
        context = context.call(this);
      }

      var fn = options.fn;

      if (!_utils.isEmpty(context)) {
        var data = options.data;
        if (options.data && options.ids) {
          data = _utils.createFrame(options.data);
          data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
        }

        return fn(context, {
          data: data,
          blockParams: _utils.blockParams([context], [data && data.contextPath])
        });
      } else {
        return options.inverse(this);
      }
    });
  };
});

;
define('handlebars/helpers', ['exports', './helpers/block-helper-missing', './helpers/each', './helpers/helper-missing', './helpers/if', './helpers/log', './helpers/lookup', './helpers/with'], function (exports, _helpersBlockHelperMissing, _helpersEach, _helpersHelperMissing, _helpersIf, _helpersLog, _helpersLookup, _helpersWith) {
  'use strict';

  exports.__esModule = true;
  exports.registerDefaultHelpers = registerDefaultHelpers;
  // istanbul ignore next

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
  }

  var _registerBlockHelperMissing = _interopRequireDefault(_helpersBlockHelperMissing);

  var _registerEach = _interopRequireDefault(_helpersEach);

  var _registerHelperMissing = _interopRequireDefault(_helpersHelperMissing);

  var _registerIf = _interopRequireDefault(_helpersIf);

  var _registerLog = _interopRequireDefault(_helpersLog);

  var _registerLookup = _interopRequireDefault(_helpersLookup);

  var _registerWith = _interopRequireDefault(_helpersWith);

  function registerDefaultHelpers(instance) {
    _registerBlockHelperMissing['default'](instance);
    _registerEach['default'](instance);
    _registerHelperMissing['default'](instance);
    _registerIf['default'](instance);
    _registerLog['default'](instance);
    _registerLookup['default'](instance);
    _registerWith['default'](instance);
  }
});

;
define('handlebars/decorators/inline', ['exports', 'module', '../utils'], function (exports, module, _utils) {
  'use strict';

  module.exports = function (instance) {
    instance.registerDecorator('inline', function (fn, props, container, options) {
      var ret = fn;
      if (!props.partials) {
        props.partials = {};
        ret = function ret(context, options) {
          // Create a new partials stack frame prior to exec.
          var original = container.partials;
          container.partials = _utils.extend({}, original, props.partials);
          var ret = fn(context, options);
          container.partials = original;
          return ret;
        };
      }

      props.partials[options.args[0]] = options.fn;

      return ret;
    });
  };
});

;
define('handlebars/decorators', ['exports', './decorators/inline'], function (exports, _decoratorsInline) {
  'use strict';

  exports.__esModule = true;
  exports.registerDefaultDecorators = registerDefaultDecorators;
  // istanbul ignore next

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
  }

  var _registerInline = _interopRequireDefault(_decoratorsInline);

  function registerDefaultDecorators(instance) {
    _registerInline['default'](instance);
  }
});

;
define('handlebars/logger', ['exports', 'module', './utils'], function (exports, module, _utils) {
  'use strict';

  var logger = {
    methodMap: ['debug', 'info', 'warn', 'error'],
    level: 'info',

    // Maps a given level value to the `methodMap` indexes above.
    lookupLevel: function lookupLevel(level) {
      if (typeof level === 'string') {
        var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
        if (levelMap >= 0) {
          level = levelMap;
        } else {
          level = parseInt(level, 10);
        }
      }

      return level;
    },

    // Can be overridden in the host environment
    log: function log(level) {
      level = logger.lookupLevel(level);

      if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
        var method = logger.methodMap[level];
        if (!console[method]) {
          // eslint-disable-line no-console
          method = 'log';
        }

        for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          message[_key - 1] = arguments[_key];
        }

        console[method].apply(console, message); // eslint-disable-line no-console
      }
    }
  };

  module.exports = logger;
});

;
define('handlebars/base', ['exports', './utils', './exception', './helpers', './decorators', './logger'], function (exports, _utils, _exception, _helpers, _decorators, _logger) {
  'use strict';

  exports.__esModule = true;
  exports.HandlebarsEnvironment = HandlebarsEnvironment;
  // istanbul ignore next

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
  }

  var _Exception = _interopRequireDefault(_exception);

  var _logger2 = _interopRequireDefault(_logger);

  var VERSION = '4.0.5';
  exports.VERSION = VERSION;
  var COMPILER_REVISION = 7;

  exports.COMPILER_REVISION = COMPILER_REVISION;
  var REVISION_CHANGES = {
    1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '== 1.x.x',
    5: '== 2.0.0-alpha.x',
    6: '>= 2.0.0-beta.1',
    7: '>= 4.0.0'
  };

  exports.REVISION_CHANGES = REVISION_CHANGES;
  var objectType = '[object Object]';

  function HandlebarsEnvironment(helpers, partials, decorators) {
    this.helpers = helpers || {};
    this.partials = partials || {};
    this.decorators = decorators || {};

    _helpers.registerDefaultHelpers(this);
    _decorators.registerDefaultDecorators(this);
  }

  HandlebarsEnvironment.prototype = {
    constructor: HandlebarsEnvironment,

    logger: _logger2['default'],
    log: _logger2['default'].log,

    registerHelper: function registerHelper(name, fn) {
      if (_utils.toString.call(name) === objectType) {
        if (fn) {
          throw new _Exception['default']('Arg not supported with multiple helpers');
        }
        _utils.extend(this.helpers, name);
      } else {
        this.helpers[name] = fn;
      }
    },
    unregisterHelper: function unregisterHelper(name) {
      delete this.helpers[name];
    },

    registerPartial: function registerPartial(name, partial) {
      if (_utils.toString.call(name) === objectType) {
        _utils.extend(this.partials, name);
      } else {
        if (typeof partial === 'undefined') {
          throw new _Exception['default']('Attempting to register a partial called "' + name + '" as undefined');
        }
        this.partials[name] = partial;
      }
    },
    unregisterPartial: function unregisterPartial(name) {
      delete this.partials[name];
    },

    registerDecorator: function registerDecorator(name, fn) {
      if (_utils.toString.call(name) === objectType) {
        if (fn) {
          throw new _Exception['default']('Arg not supported with multiple decorators');
        }
        _utils.extend(this.decorators, name);
      } else {
        this.decorators[name] = fn;
      }
    },
    unregisterDecorator: function unregisterDecorator(name) {
      delete this.decorators[name];
    }
  };

  var log = _logger2['default'].log;

  exports.log = log;
  exports.createFrame = _utils.createFrame;
  exports.logger = _logger2['default'];
});

;
define('handlebars/safe-string', ['exports', 'module'], function (exports, module) {
  // Build out our basic SafeString type
  'use strict';

  function SafeString(string) {
    this.string = string;
  }

  SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
    return '' + this.string;
  };

  module.exports = SafeString;
});

;
define('handlebars/runtime', ['exports', './utils', './exception', './base'], function (exports, _utils, _exception, _base) {
  'use strict';

  exports.__esModule = true;
  exports.checkRevision = checkRevision;
  exports.template = template;
  exports.wrapProgram = wrapProgram;
  exports.resolvePartial = resolvePartial;
  exports.invokePartial = invokePartial;
  exports.noop = noop;
  // istanbul ignore next

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
  }

  var _Exception = _interopRequireDefault(_exception);

  function checkRevision(compilerInfo) {
    var compilerRevision = compilerInfo && compilerInfo[0] || 1,
        currentRevision = _base.COMPILER_REVISION;

    if (compilerRevision !== currentRevision) {
      if (compilerRevision < currentRevision) {
        var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
            compilerVersions = _base.REVISION_CHANGES[compilerRevision];
        throw new _Exception['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        throw new _Exception['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
      }
    }
  }

  function template(templateSpec, env) {
    /* istanbul ignore next */
    if (!env) {
      throw new _Exception['default']('No environment passed to template');
    }
    if (!templateSpec || !templateSpec.main) {
      throw new _Exception['default']('Unknown template object: ' + (typeof templateSpec === 'undefined' ? 'undefined' : _typeof(templateSpec)));
    }

    templateSpec.main.decorator = templateSpec.main_d;

    // Note: Using env.VM references rather than local var references throughout this section to allow
    // for external users to override these as psuedo-supported APIs.
    env.VM.checkRevision(templateSpec.compiler);

    function invokePartialWrapper(partial, context, options) {
      if (options.hash) {
        context = _utils.extend({}, context, options.hash);
        if (options.ids) {
          options.ids[0] = true;
        }
      }

      partial = env.VM.resolvePartial.call(this, partial, context, options);
      var result = env.VM.invokePartial.call(this, partial, context, options);

      if (result == null && env.compile) {
        options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
        result = options.partials[options.name](context, options);
      }
      if (result != null) {
        if (options.indent) {
          var lines = result.split('\n');
          for (var i = 0, l = lines.length; i < l; i++) {
            if (!lines[i] && i + 1 === l) {
              break;
            }

            lines[i] = options.indent + lines[i];
          }
          result = lines.join('\n');
        }
        return result;
      } else {
        throw new _Exception['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
      }
    }

    // Just add water
    var container = {
      strict: function strict(obj, name) {
        if (!(name in obj)) {
          throw new _Exception['default']('"' + name + '" not defined in ' + obj);
        }
        return obj[name];
      },
      lookup: function lookup(depths, name) {
        var len = depths.length;
        for (var i = 0; i < len; i++) {
          if (depths[i] && depths[i][name] != null) {
            return depths[i][name];
          }
        }
      },
      lambda: function lambda(current, context) {
        return typeof current === 'function' ? current.call(context) : current;
      },

      escapeExpression: _utils.escapeExpression,
      invokePartial: invokePartialWrapper,

      fn: function fn(i) {
        var ret = templateSpec[i];
        ret.decorator = templateSpec[i + '_d'];
        return ret;
      },

      programs: [],
      program: function program(i, data, declaredBlockParams, blockParams, depths) {
        var programWrapper = this.programs[i],
            fn = this.fn(i);
        if (data || depths || blockParams || declaredBlockParams) {
          programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = wrapProgram(this, i, fn);
        }
        return programWrapper;
      },

      data: function data(value, depth) {
        while (value && depth--) {
          value = value._parent;
        }
        return value;
      },
      merge: function merge(param, common) {
        var obj = param || common;

        if (param && common && param !== common) {
          obj = _utils.extend({}, common, param);
        }

        return obj;
      },

      noop: env.VM.noop,
      compilerInfo: templateSpec.compiler
    };

    function ret(context) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var data = options.data;

      ret._setup(options);
      if (!options.partial && templateSpec.useData) {
        data = initData(context, data);
      }
      var depths = undefined,
          blockParams = templateSpec.useBlockParams ? [] : undefined;
      if (templateSpec.useDepths) {
        if (options.depths) {
          depths = context !== options.depths[0] ? [context].concat(options.depths) : options.depths;
        } else {
          depths = [context];
        }
      }

      function main(context /*, options*/) {
        return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
      }
      main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
      return main(context, options);
    }
    ret.isTop = true;

    ret._setup = function (options) {
      if (!options.partial) {
        container.helpers = container.merge(options.helpers, env.helpers);

        if (templateSpec.usePartial) {
          container.partials = container.merge(options.partials, env.partials);
        }
        if (templateSpec.usePartial || templateSpec.useDecorators) {
          container.decorators = container.merge(options.decorators, env.decorators);
        }
      } else {
        container.helpers = options.helpers;
        container.partials = options.partials;
        container.decorators = options.decorators;
      }
    };

    ret._child = function (i, data, blockParams, depths) {
      if (templateSpec.useBlockParams && !blockParams) {
        throw new _Exception['default']('must pass block params');
      }
      if (templateSpec.useDepths && !depths) {
        throw new _Exception['default']('must pass parent depths');
      }

      return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
    };
    return ret;
  }

  function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
    function prog(context) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var currentDepths = depths;
      if (depths && context !== depths[0]) {
        currentDepths = [context].concat(depths);
      }

      return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
    }

    prog = executeDecorators(fn, prog, container, depths, data, blockParams);

    prog.program = i;
    prog.depth = depths ? depths.length : 0;
    prog.blockParams = declaredBlockParams || 0;
    return prog;
  }

  function resolvePartial(partial, context, options) {
    if (!partial) {
      if (options.name === '@partial-block') {
        partial = options.data['partial-block'];
      } else {
        partial = options.partials[options.name];
      }
    } else if (!partial.call && !options.name) {
      // This is a dynamic partial that returned a string
      options.name = partial;
      partial = options.partials[partial];
    }
    return partial;
  }

  function invokePartial(partial, context, options) {
    options.partial = true;
    if (options.ids) {
      options.data.contextPath = options.ids[0] || options.data.contextPath;
    }

    var partialBlock = undefined;
    if (options.fn && options.fn !== noop) {
      options.data = _base.createFrame(options.data);
      partialBlock = options.data['partial-block'] = options.fn;

      if (partialBlock.partials) {
        options.partials = _utils.extend({}, options.partials, partialBlock.partials);
      }
    }

    if (partial === undefined && partialBlock) {
      partial = partialBlock;
    }

    if (partial === undefined) {
      throw new _Exception['default']('The partial ' + options.name + ' could not be found');
    } else if (partial instanceof Function) {
      return partial(context, options);
    }
  }

  function noop() {
    return '';
  }

  function initData(context, data) {
    if (!data || !('root' in data)) {
      data = data ? _base.createFrame(data) : {};
      data.root = context;
    }
    return data;
  }

  function executeDecorators(fn, prog, container, depths, data, blockParams) {
    if (fn.decorator) {
      var props = {};
      prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
      _utils.extend(prog, props);
    }
    return prog;
  }
});

;
define('handlebars/no-conflict', ['exports', 'module'], function (exports, module) {
  /* global window */
  'use strict';

  module.exports = function (Handlebars) {
    /* istanbul ignore next */
    var root = typeof global !== 'undefined' ? global : window,
        $Handlebars = root.Handlebars;
    /* istanbul ignore next */
    Handlebars.noConflict = function () {
      if (root.Handlebars === Handlebars) {
        root.Handlebars = $Handlebars;
      }
      return Handlebars;
    };
  };
});

;
define('handlebars.runtime', ['exports', 'module', './handlebars/base', './handlebars/safe-string', './handlebars/exception', './handlebars/utils', './handlebars/runtime', './handlebars/no-conflict'], function (exports, module, _handlebarsBase, _handlebarsSafeString, _handlebarsException, _handlebarsUtils, _handlebarsRuntime, _handlebarsNoConflict) {
  'use strict';

  // istanbul ignore next

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
  }

  // Each of these augment the Handlebars object. No need to setup here.
  // (This is done to easily share code between commonjs and browse envs)

  var _SafeString = _interopRequireDefault(_handlebarsSafeString);

  var _Exception = _interopRequireDefault(_handlebarsException);

  var _noConflict = _interopRequireDefault(_handlebarsNoConflict);

  // For compatibility and usage outside of module systems, make the Handlebars object a namespace
  function create() {
    var hb = new _handlebarsBase.HandlebarsEnvironment();

    _handlebarsUtils.extend(hb, _handlebarsBase);
    hb.SafeString = _SafeString['default'];
    hb.Exception = _Exception['default'];
    hb.Utils = _handlebarsUtils;
    hb.escapeExpression = _handlebarsUtils.escapeExpression;

    hb.VM = _handlebarsRuntime;
    hb.template = function (spec) {
      return _handlebarsRuntime.template(spec, hb);
    };

    return hb;
  }

  var inst = create();
  inst.create = create;

  _noConflict['default'](inst);

  inst['default'] = inst;

  module.exports = inst;
});

;
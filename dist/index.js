'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultHandler = exports.UserError = exports.IsUserError = exports.Processed = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

exports.setDefaultHandler = setDefaultHandler;
exports.maskErrors = maskErrors;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mark field/type/schema
var Processed = exports.Processed = (0, _symbol2.default)();

// Used to identify UserErrors
var IsUserError = exports.IsUserError = (0, _symbol2.default)();

// UserErrors will be sent to the user

var UserError = exports.UserError = function (_Error) {
  (0, _inherits3.default)(UserError, _Error);

  function UserError() {
    var _ref;

    (0, _classCallCheck3.default)(this, UserError);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = (0, _possibleConstructorReturn3.default)(this, (_ref = UserError.__proto__ || (0, _getPrototypeOf2.default)(UserError)).call.apply(_ref, [this].concat(args)));

    _this.name = 'Error';
    _this.message = args[0];
    _this[IsUserError] = true;
    Error.captureStackTrace(_this, 'Error');
    return _this;
  }

  return UserError;
}(Error);

// Modifies errors before sending to the user


var defaultHandler = exports.defaultHandler = function defaultHandler(err) {
  if (err[IsUserError]) {
    return err;
  }
  var errId = _uuid2.default.v4();
  err.message = err.message + ': ' + errId;
  console.error(err && err.stack || err);
  err.message = 'Internal Error: ' + errId;
  return err;
};

// Changes the default error handler function
function setDefaultHandler(handlerFn) {
  exports.defaultHandler = defaultHandler = handlerFn;
}

// Masks graphql schemas, types or individual fields
function maskErrors(thing) {
  var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultHandler;

  if (thing instanceof _graphql.GraphQLSchema) {
    maskSchema(thing, fn);
  } else if (thing instanceof _graphql.GraphQLObjectType) {
    maskType(thing, fn);
  } else {
    maskField(thing, fn);
  }
}

function maskField(field, fn) {
  var resolveFn = field.resolve;
  if (field[Processed] || !resolveFn) {
    return;
  }

  field[Processed] = true;
  field.resolve = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var out;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              out = resolveFn.call.apply(resolveFn, [this].concat(args));
              _context.next = 4;
              return _promise2.default.resolve(out);

            case 4:
              return _context.abrupt('return', _context.sent);

            case 7:
              _context.prev = 7;
              _context.t0 = _context['catch'](0);
              throw fn(_context.t0, args);

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 7]]);
    }));

    return function () {
      return _ref2.apply(this, arguments);
    };
  }();

  // save the original resolve function
  field.resolve._resolveFn = resolveFn;
}

function maskType(type, fn) {
  if (type[Processed] || !type.getFields) {
    return;
  }

  var fields = type.getFields();
  for (var fieldName in fields) {
    if (!Object.hasOwnProperty.call(fields, fieldName)) {
      continue;
    }

    maskField(fields[fieldName], fn);
  }
}

function maskSchema(schema, fn) {
  var types = schema.getTypeMap();
  for (var typeName in types) {
    if (!Object.hasOwnProperty.call(types, typeName)) {
      continue;
    }

    maskType(types[typeName], fn);
  }
}
//# sourceMappingURL=index.js.map
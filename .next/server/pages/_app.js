module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/bootstrap/dist/css/bootstrap.min.css":
/*!***********************************************************!*\
  !*** ./node_modules/bootstrap/dist/css/bootstrap.min.css ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiIuL25vZGVfbW9kdWxlcy9ib290c3RyYXAvZGlzdC9jc3MvYm9vdHN0cmFwLm1pbi5jc3MuanMiLCJzb3VyY2VzQ29udGVudCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./node_modules/bootstrap/dist/css/bootstrap.min.css\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var bootstrap_dist_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bootstrap/dist/css/bootstrap.min.css */ \"./node_modules/bootstrap/dist/css/bootstrap.min.css\");\n/* harmony import */ var bootstrap_dist_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bootstrap_dist_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _styles_Map_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/Map.css */ \"./styles/Map.css\");\n/* harmony import */ var _styles_Map_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_Map_css__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @aws-amplify/core */ \"@aws-amplify/core\");\n/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_aws_amplify_core__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _aws_amplify_datastore__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @aws-amplify/datastore */ \"@aws-amplify/datastore\");\n/* harmony import */ var _aws_amplify_datastore__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_aws_amplify_datastore__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var _src_models__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../src/models */ \"./src/models/index.js\");\n\nvar _jsxFileName = \"/Users/davidondrich/dev/advocacy-maps/pages/_app.js\";\n\nfunction ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\n\n\n\n\n\n //import awsConfig from \"./aws-exports\";\n//Amplify.configure(awsConfig);\n\nasync function queryDatabase() {// setBil\n}\n\nfunction MyApp({\n  Component,\n  pageProps\n}) {\n  const {\n    0: bills,\n    1: setBills\n  } = Object(react__WEBPACK_IMPORTED_MODULE_4__[\"useState\"])([]);\n  return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(Component, _objectSpread({}, pageProps), void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 19,\n    columnNumber: 10\n  }, this);\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (MyApp);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9fYXBwLmpzP2Q1MzAiXSwibmFtZXMiOlsicXVlcnlEYXRhYmFzZSIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIiwiYmlsbHMiLCJzZXRCaWxscyIsInVzZVN0YXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0NBSUE7QUFDQTs7QUFFQSxlQUFlQSxhQUFmLEdBQStCLENBQzdCO0FBQ0Q7O0FBRUQsU0FBU0MsS0FBVCxDQUFlO0FBQUVDLFdBQUY7QUFBYUM7QUFBYixDQUFmLEVBQXlDO0FBQ3ZDLFFBQU07QUFBQSxPQUFDQyxLQUFEO0FBQUEsT0FBUUM7QUFBUixNQUFvQkMsc0RBQVEsQ0FBQyxFQUFELENBQWxDO0FBQ0Esc0JBQU8scUVBQUMsU0FBRCxvQkFBZUgsU0FBZjtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBQVA7QUFDRDs7QUFFY0Ysb0VBQWYiLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwiLi4vc3R5bGVzL2dsb2JhbHMuY3NzXCI7XG5pbXBvcnQgXCJib290c3RyYXAvZGlzdC9jc3MvYm9vdHN0cmFwLm1pbi5jc3NcIjtcbmltcG9ydCBcIi4uL3N0eWxlcy9NYXAuY3NzXCI7XG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IEFtcGxpZnkgZnJvbSBcIkBhd3MtYW1wbGlmeS9jb3JlXCI7XG5pbXBvcnQgeyBEYXRhU3RvcmUgfSBmcm9tIFwiQGF3cy1hbXBsaWZ5L2RhdGFzdG9yZVwiO1xuXG5pbXBvcnQgeyBCaWxsIH0gZnJvbSBcIi4uL3NyYy9tb2RlbHNcIjtcblxuLy9pbXBvcnQgYXdzQ29uZmlnIGZyb20gXCIuL2F3cy1leHBvcnRzXCI7XG4vL0FtcGxpZnkuY29uZmlndXJlKGF3c0NvbmZpZyk7XG5cbmFzeW5jIGZ1bmN0aW9uIHF1ZXJ5RGF0YWJhc2UoKSB7XG4gIC8vIHNldEJpbFxufVxuXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcbiAgY29uc3QgW2JpbGxzLCBzZXRCaWxsc10gPSB1c2VTdGF0ZShbXSk7XG4gIHJldHVybiA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+O1xufVxuXG5leHBvcnQgZGVmYXVsdCBNeUFwcDtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./src/models/index.js":
/*!*****************************!*\
  !*** ./src/models/index.js ***!
  \*****************************/
/*! exports provided: Bill */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Bill\", function() { return Bill; });\n/* harmony import */ var _aws_amplify_datastore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @aws-amplify/datastore */ \"@aws-amplify/datastore\");\n/* harmony import */ var _aws_amplify_datastore__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_aws_amplify_datastore__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _schema__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./schema */ \"./src/models/schema.js\");\n// @ts-check\n\n\nconst {\n  Bill\n} = Object(_aws_amplify_datastore__WEBPACK_IMPORTED_MODULE_0__[\"initSchema\"])(_schema__WEBPACK_IMPORTED_MODULE_1__[\"schema\"]);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvbW9kZWxzL2luZGV4LmpzPzNhMzQiXSwibmFtZXMiOlsiQmlsbCIsImluaXRTY2hlbWEiLCJzY2hlbWEiXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFJQSxNQUFNO0FBQUVBO0FBQUYsSUFBV0MseUVBQVUsQ0FBQ0MsOENBQUQsQ0FBM0IiLCJmaWxlIjoiLi9zcmMvbW9kZWxzL2luZGV4LmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWNoZWNrXG5pbXBvcnQgeyBpbml0U2NoZW1hIH0gZnJvbSAnQGF3cy1hbXBsaWZ5L2RhdGFzdG9yZSc7XG5pbXBvcnQgeyBzY2hlbWEgfSBmcm9tICcuL3NjaGVtYSc7XG5cblxuXG5jb25zdCB7IEJpbGwgfSA9IGluaXRTY2hlbWEoc2NoZW1hKTtcblxuZXhwb3J0IHtcbiAgQmlsbFxufTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/models/index.js\n");

/***/ }),

/***/ "./src/models/schema.js":
/*!******************************!*\
  !*** ./src/models/schema.js ***!
  \******************************/
/*! exports provided: schema */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"schema\", function() { return schema; });\nconst schema = {\n  \"models\": {\n    \"Bill\": {\n      \"name\": \"Bill\",\n      \"fields\": {\n        \"id\": {\n          \"name\": \"id\",\n          \"isArray\": false,\n          \"type\": \"ID\",\n          \"isRequired\": true,\n          \"attributes\": []\n        },\n        \"name\": {\n          \"name\": \"name\",\n          \"isArray\": false,\n          \"type\": \"String\",\n          \"isRequired\": true,\n          \"attributes\": []\n        },\n        \"description\": {\n          \"name\": \"description\",\n          \"isArray\": false,\n          \"type\": \"String\",\n          \"isRequired\": false,\n          \"attributes\": []\n        },\n        \"dateIntiated\": {\n          \"name\": \"dateIntiated\",\n          \"isArray\": false,\n          \"type\": \"AWSTimestamp\",\n          \"isRequired\": false,\n          \"attributes\": []\n        },\n        \"supporter\": {\n          \"name\": \"supporter\",\n          \"isArray\": false,\n          \"type\": \"AWSJSON\",\n          \"isRequired\": false,\n          \"attributes\": []\n        }\n      },\n      \"syncable\": true,\n      \"pluralName\": \"Bills\",\n      \"attributes\": [{\n        \"type\": \"model\",\n        \"properties\": {}\n      }, {\n        \"type\": \"auth\",\n        \"properties\": {\n          \"rules\": [{\n            \"allow\": \"public\",\n            \"operations\": [\"create\", \"update\", \"delete\", \"read\"]\n          }]\n        }\n      }]\n    }\n  },\n  \"enums\": {},\n  \"nonModels\": {},\n  \"version\": \"3a5b9d7f3a2c05b3ef073ba68314d512\"\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvbW9kZWxzL3NjaGVtYS5qcz9kYmI1Il0sIm5hbWVzIjpbInNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQTtBQUFPLE1BQU1BLE1BQU0sR0FBRztBQUNsQixZQUFVO0FBQ04sWUFBUTtBQUNKLGNBQVEsTUFESjtBQUVKLGdCQUFVO0FBQ04sY0FBTTtBQUNGLGtCQUFRLElBRE47QUFFRixxQkFBVyxLQUZUO0FBR0Ysa0JBQVEsSUFITjtBQUlGLHdCQUFjLElBSlo7QUFLRix3QkFBYztBQUxaLFNBREE7QUFRTixnQkFBUTtBQUNKLGtCQUFRLE1BREo7QUFFSixxQkFBVyxLQUZQO0FBR0osa0JBQVEsUUFISjtBQUlKLHdCQUFjLElBSlY7QUFLSix3QkFBYztBQUxWLFNBUkY7QUFlTix1QkFBZTtBQUNYLGtCQUFRLGFBREc7QUFFWCxxQkFBVyxLQUZBO0FBR1gsa0JBQVEsUUFIRztBQUlYLHdCQUFjLEtBSkg7QUFLWCx3QkFBYztBQUxILFNBZlQ7QUFzQk4sd0JBQWdCO0FBQ1osa0JBQVEsY0FESTtBQUVaLHFCQUFXLEtBRkM7QUFHWixrQkFBUSxjQUhJO0FBSVosd0JBQWMsS0FKRjtBQUtaLHdCQUFjO0FBTEYsU0F0QlY7QUE2Qk4scUJBQWE7QUFDVCxrQkFBUSxXQURDO0FBRVQscUJBQVcsS0FGRjtBQUdULGtCQUFRLFNBSEM7QUFJVCx3QkFBYyxLQUpMO0FBS1Qsd0JBQWM7QUFMTDtBQTdCUCxPQUZOO0FBdUNKLGtCQUFZLElBdkNSO0FBd0NKLG9CQUFjLE9BeENWO0FBeUNKLG9CQUFjLENBQ1Y7QUFDSSxnQkFBUSxPQURaO0FBRUksc0JBQWM7QUFGbEIsT0FEVSxFQUtWO0FBQ0ksZ0JBQVEsTUFEWjtBQUVJLHNCQUFjO0FBQ1YsbUJBQVMsQ0FDTDtBQUNJLHFCQUFTLFFBRGI7QUFFSSwwQkFBYyxDQUNWLFFBRFUsRUFFVixRQUZVLEVBR1YsUUFIVSxFQUlWLE1BSlU7QUFGbEIsV0FESztBQURDO0FBRmxCLE9BTFU7QUF6Q1Y7QUFERixHQURRO0FBbUVsQixXQUFTLEVBbkVTO0FBb0VsQixlQUFhLEVBcEVLO0FBcUVsQixhQUFXO0FBckVPLENBQWYiLCJmaWxlIjoiLi9zcmMvbW9kZWxzL3NjaGVtYS5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBzY2hlbWEgPSB7XG4gICAgXCJtb2RlbHNcIjoge1xuICAgICAgICBcIkJpbGxcIjoge1xuICAgICAgICAgICAgXCJuYW1lXCI6IFwiQmlsbFwiLFxuICAgICAgICAgICAgXCJmaWVsZHNcIjoge1xuICAgICAgICAgICAgICAgIFwiaWRcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJpZFwiLFxuICAgICAgICAgICAgICAgICAgICBcImlzQXJyYXlcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIklEXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiaXNSZXF1aXJlZFwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBcImF0dHJpYnV0ZXNcIjogW11cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwibmFtZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcIm5hbWVcIixcbiAgICAgICAgICAgICAgICAgICAgXCJpc0FycmF5XCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJTdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgXCJpc1JlcXVpcmVkXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlc1wiOiBbXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImRlc2NyaXB0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiaXNBcnJheVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiU3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiaXNSZXF1aXJlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVzXCI6IFtdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImRhdGVJbnRpYXRlZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImRhdGVJbnRpYXRlZFwiLFxuICAgICAgICAgICAgICAgICAgICBcImlzQXJyYXlcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcIkFXU1RpbWVzdGFtcFwiLFxuICAgICAgICAgICAgICAgICAgICBcImlzUmVxdWlyZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlc1wiOiBbXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJzdXBwb3J0ZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJzdXBwb3J0ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgXCJpc0FycmF5XCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJBV1NKU09OXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiaXNSZXF1aXJlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGVzXCI6IFtdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic3luY2FibGVcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwicGx1cmFsTmFtZVwiOiBcIkJpbGxzXCIsXG4gICAgICAgICAgICBcImF0dHJpYnV0ZXNcIjogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwibW9kZWxcIixcbiAgICAgICAgICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImF1dGhcIixcbiAgICAgICAgICAgICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicnVsZXNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGxvd1wiOiBcInB1YmxpY1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm9wZXJhdGlvbnNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjcmVhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidXBkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlbGV0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWFkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXCJlbnVtc1wiOiB7fSxcbiAgICBcIm5vbk1vZGVsc1wiOiB7fSxcbiAgICBcInZlcnNpb25cIjogXCIzYTViOWQ3ZjNhMmMwNWIzZWYwNzNiYTY4MzE0ZDUxMlwiXG59OyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/models/schema.js\n");

/***/ }),

/***/ "./styles/Map.css":
/*!************************!*\
  !*** ./styles/Map.css ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiIuL3N0eWxlcy9NYXAuY3NzLmpzIiwic291cmNlc0NvbnRlbnQiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./styles/Map.css\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiIuL3N0eWxlcy9nbG9iYWxzLmNzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./styles/globals.css\n");

/***/ }),

/***/ 0:
/*!****************************************!*\
  !*** multi private-next-pages/_app.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! private-next-pages/_app.js */"./pages/_app.js");


/***/ }),

/***/ "@aws-amplify/core":
/*!************************************!*\
  !*** external "@aws-amplify/core" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"@aws-amplify/core\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJAYXdzLWFtcGxpZnkvY29yZVwiPzk5YjciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoiQGF3cy1hbXBsaWZ5L2NvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAYXdzLWFtcGxpZnkvY29yZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///@aws-amplify/core\n");

/***/ }),

/***/ "@aws-amplify/datastore":
/*!*****************************************!*\
  !*** external "@aws-amplify/datastore" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"@aws-amplify/datastore\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJAYXdzLWFtcGxpZnkvZGF0YXN0b3JlXCI/ZGRiOCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJAYXdzLWFtcGxpZnkvZGF0YXN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGF3cy1hbXBsaWZ5L2RhdGFzdG9yZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///@aws-amplify/datastore\n");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdFwiPzU4OGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoicmVhY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWFjdFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///react\n");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react/jsx-dev-runtime\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdC9qc3gtZGV2LXJ1bnRpbWVcIj9jZDkwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6InJlYWN0L2pzeC1kZXYtcnVudGltZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlYWN0L2pzeC1kZXYtcnVudGltZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///react/jsx-dev-runtime\n");

/***/ })

/******/ });
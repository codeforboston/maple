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
/******/ 	return __webpack_require__(__webpack_require__.s = "./pages/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./components/Layout/Layout.js":
/*!*************************************!*\
  !*** ./components/Layout/Layout.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Layout; });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/head */ \"next/head\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../index */ \"./components/index.js\");\n/* harmony import */ var _Layout_module_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Layout.module.css */ \"./components/Layout/Layout.module.css\");\n/* harmony import */ var _Layout_module_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_Layout_module_css__WEBPACK_IMPORTED_MODULE_3__);\n\nvar _jsxFileName = \"/Users/davidondrich/dev/advocacy-maps/components/Layout/Layout.js\";\n\n\n\nfunction Layout({\n  pageTitle,\n  children,\n  title = \"Easy To Do Good\"\n}) {\n  return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n    className: _Layout_module_css__WEBPACK_IMPORTED_MODULE_3___default.a.container,\n    children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(next_head__WEBPACK_IMPORTED_MODULE_1___default.a, {\n      children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"title\", {\n        children: title\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 13,\n        columnNumber: 9\n      }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"link\", {\n        rel: \"icon\",\n        href: \"/favicon.ico\"\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 14,\n        columnNumber: 9\n      }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"meta\", {\n        charSet: \"utf-8\"\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 15,\n        columnNumber: 9\n      }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"meta\", {\n        name: \"viewport\",\n        content: \"initial-scale=1.0, width=device-width\"\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 16,\n        columnNumber: 9\n      }, this)]\n    }, void 0, true, {\n      fileName: _jsxFileName,\n      lineNumber: 12,\n      columnNumber: 7\n    }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(_index__WEBPACK_IMPORTED_MODULE_2__[\"NavBar\"], {\n      pageTitle: pageTitle\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 18,\n      columnNumber: 7\n    }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n      className: _Layout_module_css__WEBPACK_IMPORTED_MODULE_3___default.a[\"content-container\"],\n      children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"section\", {\n        className: _Layout_module_css__WEBPACK_IMPORTED_MODULE_3___default.a.content,\n        children: children\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 20,\n        columnNumber: 9\n      }, this)\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 19,\n      columnNumber: 7\n    }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"footer\", {\n      className: _Layout_module_css__WEBPACK_IMPORTED_MODULE_3___default.a.footer,\n      children: \"Powered by Democracy\"\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 23,\n      columnNumber: 7\n    }, this)]\n  }, void 0, true, {\n    fileName: _jsxFileName,\n    lineNumber: 11,\n    columnNumber: 5\n  }, this);\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL0xheW91dC9MYXlvdXQuanM/NDI4OCJdLCJuYW1lcyI6WyJMYXlvdXQiLCJwYWdlVGl0bGUiLCJjaGlsZHJlbiIsInRpdGxlIiwic3R5bGVzIiwiY29udGFpbmVyIiwiY29udGVudCIsImZvb3RlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFFZSxTQUFTQSxNQUFULENBQWdCO0FBQzdCQyxXQUQ2QjtBQUU3QkMsVUFGNkI7QUFHN0JDLE9BQUssR0FBRztBQUhxQixDQUFoQixFQUlaO0FBQ0Qsc0JBQ0U7QUFBSyxhQUFTLEVBQUVDLHlEQUFNLENBQUNDLFNBQXZCO0FBQUEsNEJBQ0UscUVBQUMsZ0RBQUQ7QUFBQSw4QkFDRTtBQUFBLGtCQUFRRjtBQUFSO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FERixlQUVFO0FBQU0sV0FBRyxFQUFDLE1BQVY7QUFBaUIsWUFBSSxFQUFDO0FBQXRCO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FGRixlQUdFO0FBQU0sZUFBTyxFQUFDO0FBQWQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQUhGLGVBSUU7QUFBTSxZQUFJLEVBQUMsVUFBWDtBQUFzQixlQUFPLEVBQUM7QUFBOUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQUpGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQURGLGVBT0UscUVBQUMsNkNBQUQ7QUFBUSxlQUFTLEVBQUVGO0FBQW5CO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFQRixlQVFFO0FBQUssZUFBUyxFQUFFRyx5REFBTSxDQUFDLG1CQUFELENBQXRCO0FBQUEsNkJBQ0U7QUFBUyxpQkFBUyxFQUFFQSx5REFBTSxDQUFDRSxPQUEzQjtBQUFBLGtCQUFxQ0o7QUFBckM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURGO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFSRixlQVlFO0FBQVEsZUFBUyxFQUFFRSx5REFBTSxDQUFDRyxNQUExQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQVpGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQURGO0FBZ0JEIiwiZmlsZSI6Ii4vY29tcG9uZW50cy9MYXlvdXQvTGF5b3V0LmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEhlYWQgZnJvbSBcIm5leHQvaGVhZFwiO1xuaW1wb3J0IHsgTmF2QmFyIH0gZnJvbSBcIi4uL2luZGV4XCI7XG5pbXBvcnQgc3R5bGVzIGZyb20gXCIuL0xheW91dC5tb2R1bGUuY3NzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExheW91dCh7XG4gIHBhZ2VUaXRsZSxcbiAgY2hpbGRyZW4sXG4gIHRpdGxlID0gXCJFYXN5IFRvIERvIEdvb2RcIixcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17c3R5bGVzLmNvbnRhaW5lcn0+XG4gICAgICA8SGVhZD5cbiAgICAgICAgPHRpdGxlPnt0aXRsZX08L3RpdGxlPlxuICAgICAgICA8bGluayByZWw9XCJpY29uXCIgaHJlZj1cIi9mYXZpY29uLmljb1wiIC8+XG4gICAgICAgIDxtZXRhIGNoYXJTZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJpbml0aWFsLXNjYWxlPTEuMCwgd2lkdGg9ZGV2aWNlLXdpZHRoXCIgLz5cbiAgICAgIDwvSGVhZD5cbiAgICAgIDxOYXZCYXIgcGFnZVRpdGxlPXtwYWdlVGl0bGV9PjwvTmF2QmFyPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlc1tcImNvbnRlbnQtY29udGFpbmVyXCJdfT5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPXtzdHlsZXMuY29udGVudH0+e2NoaWxkcmVufTwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8Zm9vdGVyIGNsYXNzTmFtZT17c3R5bGVzLmZvb3Rlcn0+UG93ZXJlZCBieSBEZW1vY3JhY3k8L2Zvb3Rlcj5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/Layout/Layout.js\n");

/***/ }),

/***/ "./components/Layout/Layout.module.css":
/*!*********************************************!*\
  !*** ./components/Layout/Layout.module.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Exports\nmodule.exports = {\n\t\"container\": \"Layout_container__259yc\",\n\t\"footer\": \"Layout_footer__3mkvi\",\n\t\"content-container\": \"Layout_content-container__3H-VG\",\n\t\"content\": \"Layout_content__22e7d\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL0xheW91dC9MYXlvdXQubW9kdWxlLmNzcz8zMzhiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Ii4vY29tcG9uZW50cy9MYXlvdXQvTGF5b3V0Lm1vZHVsZS5jc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBFeHBvcnRzXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJjb250YWluZXJcIjogXCJMYXlvdXRfY29udGFpbmVyX18yNTl5Y1wiLFxuXHRcImZvb3RlclwiOiBcIkxheW91dF9mb290ZXJfXzNta3ZpXCIsXG5cdFwiY29udGVudC1jb250YWluZXJcIjogXCJMYXlvdXRfY29udGVudC1jb250YWluZXJfXzNILVZHXCIsXG5cdFwiY29udGVudFwiOiBcIkxheW91dF9jb250ZW50X18yMmU3ZFwiXG59O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./components/Layout/Layout.module.css\n");

/***/ }),

/***/ "./components/NavBar/NavBar.js":
/*!*************************************!*\
  !*** ./components/NavBar/NavBar.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react_bootstrap_Navbar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap/Navbar */ \"react-bootstrap/Navbar\");\n/* harmony import */ var react_bootstrap_Navbar__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_bootstrap_Navbar__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react_bootstrap_Nav__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap/Nav */ \"react-bootstrap/Nav\");\n/* harmony import */ var react_bootstrap_Nav__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_bootstrap_Nav__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var react_bootstrap_NavDropdown__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap/NavDropdown */ \"react-bootstrap/NavDropdown\");\n/* harmony import */ var react_bootstrap_NavDropdown__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_bootstrap_NavDropdown__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _NavBar_module_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./NavBar.module.css */ \"./components/NavBar/NavBar.module.css\");\n/* harmony import */ var _NavBar_module_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_NavBar_module_css__WEBPACK_IMPORTED_MODULE_4__);\n\nvar _jsxFileName = \"/Users/davidondrich/dev/advocacy-maps/components/NavBar/NavBar.js\";\n\n\n\n\n\nfunction NavBar({\n  pageTitle = \"\"\n}) {\n  return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n    className: _NavBar_module_css__WEBPACK_IMPORTED_MODULE_4___default.a.container,\n    children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Navbar__WEBPACK_IMPORTED_MODULE_1___default.a, {\n      className: _NavBar_module_css__WEBPACK_IMPORTED_MODULE_4___default.a.navbarCustom,\n      bg: \"dark\",\n      expand: \"lg\",\n      variant: \"dark\",\n      children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Navbar__WEBPACK_IMPORTED_MODULE_1___default.a.Brand, {\n        href: \"/\",\n        children: [\"Good Governance Project\", /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n          children: \"Boston College Clough Center for Constitutional Democracy\"\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 17,\n          columnNumber: 11\n        }, this)]\n      }, void 0, true, {\n        fileName: _jsxFileName,\n        lineNumber: 15,\n        columnNumber: 9\n      }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Navbar__WEBPACK_IMPORTED_MODULE_1___default.a.Toggle, {\n        \"aria-controls\": \"basic-navbar-nav\"\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 19,\n        columnNumber: 9\n      }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Navbar__WEBPACK_IMPORTED_MODULE_1___default.a.Collapse, {\n        id: \"basic-navbar-nav\",\n        children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Nav__WEBPACK_IMPORTED_MODULE_2___default.a, {\n          className: \"mr-auto\"\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 21,\n          columnNumber: 11\n        }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Nav__WEBPACK_IMPORTED_MODULE_2___default.a, {\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Nav__WEBPACK_IMPORTED_MODULE_2___default.a.Link, {\n            href: \"/about\",\n            children: \"About GGP\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 23,\n            columnNumber: 13\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Nav__WEBPACK_IMPORTED_MODULE_2___default.a.Link, {\n            href: \"/democracy-in-ma\",\n            children: \"Democracy in MA - Overview\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 24,\n            columnNumber: 13\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_NavDropdown__WEBPACK_IMPORTED_MODULE_3___default.a, {\n            title: \"2021 Priorities\",\n            id: \"basic-nav-dropdown\",\n            children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_NavDropdown__WEBPACK_IMPORTED_MODULE_3___default.a.Item, {\n              href: \"/election-day-registration\",\n              children: \"Election Day Registration\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 28,\n              columnNumber: 15\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_NavDropdown__WEBPACK_IMPORTED_MODULE_3___default.a.Item, {\n              href: \"/campaign-finance\",\n              children: \"Campaign Finance - Constitutional Amendment\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 31,\n              columnNumber: 15\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_NavDropdown__WEBPACK_IMPORTED_MODULE_3___default.a.Item, {\n              href: \"/political-advertisements\",\n              children: \"Political Advertisement Disclosure\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 34,\n              columnNumber: 15\n            }, this)]\n          }, void 0, true, {\n            fileName: _jsxFileName,\n            lineNumber: 27,\n            columnNumber: 13\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Nav__WEBPACK_IMPORTED_MODULE_2___default.a.Link, {\n            href: \"/advocacy-maps\",\n            children: \"Advocacy Maps\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 38,\n            columnNumber: 13\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Nav__WEBPACK_IMPORTED_MODULE_2___default.a.Link, {\n            href: \"/contact\",\n            children: \"Contact Us\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 39,\n            columnNumber: 13\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Nav__WEBPACK_IMPORTED_MODULE_2___default.a.Link, {\n            href: \"/blog\",\n            children: \"GGP Blog\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 40,\n            columnNumber: 13\n          }, this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 22,\n          columnNumber: 11\n        }, this)]\n      }, void 0, true, {\n        fileName: _jsxFileName,\n        lineNumber: 20,\n        columnNumber: 9\n      }, this)]\n    }, void 0, true, {\n      fileName: _jsxFileName,\n      lineNumber: 9,\n      columnNumber: 7\n    }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"section\", {\n      className: _NavBar_module_css__WEBPACK_IMPORTED_MODULE_4___default.a.backgroundImg,\n      children: pageTitle\n    }, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 44,\n      columnNumber: 7\n    }, this)]\n  }, void 0, true, {\n    fileName: _jsxFileName,\n    lineNumber: 8,\n    columnNumber: 5\n  }, this);\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (NavBar);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL05hdkJhci9OYXZCYXIuanM/NDM1MCJdLCJuYW1lcyI6WyJOYXZCYXIiLCJwYWdlVGl0bGUiLCJzdHlsZXMiLCJjb250YWluZXIiLCJuYXZiYXJDdXN0b20iLCJiYWNrZ3JvdW5kSW1nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsTUFBVCxDQUFnQjtBQUFFQyxXQUFTLEdBQUc7QUFBZCxDQUFoQixFQUFvQztBQUNsQyxzQkFDRTtBQUFLLGFBQVMsRUFBRUMseURBQU0sQ0FBQ0MsU0FBdkI7QUFBQSw0QkFDRSxxRUFBQyw2REFBRDtBQUNFLGVBQVMsRUFBRUQseURBQU0sQ0FBQ0UsWUFEcEI7QUFFRSxRQUFFLEVBQUMsTUFGTDtBQUdFLFlBQU0sRUFBQyxJQUhUO0FBSUUsYUFBTyxFQUFDLE1BSlY7QUFBQSw4QkFNRSxxRUFBQyw2REFBRCxDQUFRLEtBQVI7QUFBYyxZQUFJLEVBQUMsR0FBbkI7QUFBQSwyREFFRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFGRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FORixlQVVFLHFFQUFDLDZEQUFELENBQVEsTUFBUjtBQUFlLHlCQUFjO0FBQTdCO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FWRixlQVdFLHFFQUFDLDZEQUFELENBQVEsUUFBUjtBQUFpQixVQUFFLEVBQUMsa0JBQXBCO0FBQUEsZ0NBQ0UscUVBQUMsMERBQUQ7QUFBSyxtQkFBUyxFQUFDO0FBQWY7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFERixlQUVFLHFFQUFDLDBEQUFEO0FBQUEsa0NBQ0UscUVBQUMsMERBQUQsQ0FBSyxJQUFMO0FBQVUsZ0JBQUksRUFBQyxRQUFmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQURGLGVBRUUscUVBQUMsMERBQUQsQ0FBSyxJQUFMO0FBQVUsZ0JBQUksRUFBQyxrQkFBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQkFGRixlQUtFLHFFQUFDLGtFQUFEO0FBQWEsaUJBQUssRUFBQyxpQkFBbkI7QUFBcUMsY0FBRSxFQUFDLG9CQUF4QztBQUFBLG9DQUNFLHFFQUFDLGtFQUFELENBQWEsSUFBYjtBQUFrQixrQkFBSSxFQUFDLDRCQUF2QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxvQkFERixlQUlFLHFFQUFDLGtFQUFELENBQWEsSUFBYjtBQUFrQixrQkFBSSxFQUFDLG1CQUF2QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxvQkFKRixlQU9FLHFFQUFDLGtFQUFELENBQWEsSUFBYjtBQUFrQixrQkFBSSxFQUFDLDJCQUF2QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxvQkFQRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBTEYsZUFnQkUscUVBQUMsMERBQUQsQ0FBSyxJQUFMO0FBQVUsZ0JBQUksRUFBQyxnQkFBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQkFoQkYsZUFpQkUscUVBQUMsMERBQUQsQ0FBSyxJQUFMO0FBQVUsZ0JBQUksRUFBQyxVQUFmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQWpCRixlQWtCRSxxRUFBQywwREFBRCxDQUFLLElBQUw7QUFBVSxnQkFBSSxFQUFDLE9BQWY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBbEJGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFGRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FYRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFERixlQW9DRTtBQUFTLGVBQVMsRUFBRUYseURBQU0sQ0FBQ0csYUFBM0I7QUFBQSxnQkFBMkNKO0FBQTNDO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFwQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBREY7QUF3Q0Q7O0FBRWNELHFFQUFmIiwiZmlsZSI6Ii4vY29tcG9uZW50cy9OYXZCYXIvTmF2QmFyLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5hdmJhciBmcm9tIFwicmVhY3QtYm9vdHN0cmFwL05hdmJhclwiO1xuaW1wb3J0IE5hdiBmcm9tIFwicmVhY3QtYm9vdHN0cmFwL05hdlwiO1xuaW1wb3J0IE5hdkRyb3Bkb3duIGZyb20gXCJyZWFjdC1ib290c3RyYXAvTmF2RHJvcGRvd25cIjtcbmltcG9ydCBzdHlsZXMgZnJvbSBcIi4vTmF2QmFyLm1vZHVsZS5jc3NcIjtcblxuZnVuY3Rpb24gTmF2QmFyKHsgcGFnZVRpdGxlID0gXCJcIiB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlcy5jb250YWluZXJ9PlxuICAgICAgPE5hdmJhclxuICAgICAgICBjbGFzc05hbWU9e3N0eWxlcy5uYXZiYXJDdXN0b219XG4gICAgICAgIGJnPVwiZGFya1wiXG4gICAgICAgIGV4cGFuZD1cImxnXCJcbiAgICAgICAgdmFyaWFudD1cImRhcmtcIlxuICAgICAgPlxuICAgICAgICA8TmF2YmFyLkJyYW5kIGhyZWY9XCIvXCI+XG4gICAgICAgICAgR29vZCBHb3Zlcm5hbmNlIFByb2plY3RcbiAgICAgICAgICA8ZGl2PkJvc3RvbiBDb2xsZWdlIENsb3VnaCBDZW50ZXIgZm9yIENvbnN0aXR1dGlvbmFsIERlbW9jcmFjeTwvZGl2PlxuICAgICAgICA8L05hdmJhci5CcmFuZD5cbiAgICAgICAgPE5hdmJhci5Ub2dnbGUgYXJpYS1jb250cm9scz1cImJhc2ljLW5hdmJhci1uYXZcIiAvPlxuICAgICAgICA8TmF2YmFyLkNvbGxhcHNlIGlkPVwiYmFzaWMtbmF2YmFyLW5hdlwiPlxuICAgICAgICAgIDxOYXYgY2xhc3NOYW1lPVwibXItYXV0b1wiPjwvTmF2PlxuICAgICAgICAgIDxOYXY+XG4gICAgICAgICAgICA8TmF2LkxpbmsgaHJlZj1cIi9hYm91dFwiPkFib3V0IEdHUDwvTmF2Lkxpbms+XG4gICAgICAgICAgICA8TmF2LkxpbmsgaHJlZj1cIi9kZW1vY3JhY3ktaW4tbWFcIj5cbiAgICAgICAgICAgICAgRGVtb2NyYWN5IGluIE1BIC0gT3ZlcnZpZXdcbiAgICAgICAgICAgIDwvTmF2Lkxpbms+XG4gICAgICAgICAgICA8TmF2RHJvcGRvd24gdGl0bGU9XCIyMDIxIFByaW9yaXRpZXNcIiBpZD1cImJhc2ljLW5hdi1kcm9wZG93blwiPlxuICAgICAgICAgICAgICA8TmF2RHJvcGRvd24uSXRlbSBocmVmPVwiL2VsZWN0aW9uLWRheS1yZWdpc3RyYXRpb25cIj5cbiAgICAgICAgICAgICAgICBFbGVjdGlvbiBEYXkgUmVnaXN0cmF0aW9uXG4gICAgICAgICAgICAgIDwvTmF2RHJvcGRvd24uSXRlbT5cbiAgICAgICAgICAgICAgPE5hdkRyb3Bkb3duLkl0ZW0gaHJlZj1cIi9jYW1wYWlnbi1maW5hbmNlXCI+XG4gICAgICAgICAgICAgICAgQ2FtcGFpZ24gRmluYW5jZSAtIENvbnN0aXR1dGlvbmFsIEFtZW5kbWVudFxuICAgICAgICAgICAgICA8L05hdkRyb3Bkb3duLkl0ZW0+XG4gICAgICAgICAgICAgIDxOYXZEcm9wZG93bi5JdGVtIGhyZWY9XCIvcG9saXRpY2FsLWFkdmVydGlzZW1lbnRzXCI+XG4gICAgICAgICAgICAgICAgUG9saXRpY2FsIEFkdmVydGlzZW1lbnQgRGlzY2xvc3VyZVxuICAgICAgICAgICAgICA8L05hdkRyb3Bkb3duLkl0ZW0+XG4gICAgICAgICAgICA8L05hdkRyb3Bkb3duPlxuICAgICAgICAgICAgPE5hdi5MaW5rIGhyZWY9XCIvYWR2b2NhY3ktbWFwc1wiPkFkdm9jYWN5IE1hcHM8L05hdi5MaW5rPlxuICAgICAgICAgICAgPE5hdi5MaW5rIGhyZWY9XCIvY29udGFjdFwiPkNvbnRhY3QgVXM8L05hdi5MaW5rPlxuICAgICAgICAgICAgPE5hdi5MaW5rIGhyZWY9XCIvYmxvZ1wiPkdHUCBCbG9nPC9OYXYuTGluaz5cbiAgICAgICAgICA8L05hdj5cbiAgICAgICAgPC9OYXZiYXIuQ29sbGFwc2U+XG4gICAgICA8L05hdmJhcj5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT17c3R5bGVzLmJhY2tncm91bmRJbWd9PntwYWdlVGl0bGV9PC9zZWN0aW9uPlxuICAgIDwvZGl2PlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBOYXZCYXI7XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./components/NavBar/NavBar.js\n");

/***/ }),

/***/ "./components/NavBar/NavBar.module.css":
/*!*********************************************!*\
  !*** ./components/NavBar/NavBar.module.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Exports\nmodule.exports = {\n\t\"container\": \"NavBar_container__5mbOc\",\n\t\"navbarCustom\": \"NavBar_navbarCustom__1Xnkf\",\n\t\"backgroundImg\": \"NavBar_backgroundImg__1kLnJ\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL05hdkJhci9OYXZCYXIubW9kdWxlLmNzcz80MWUwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiIuL2NvbXBvbmVudHMvTmF2QmFyL05hdkJhci5tb2R1bGUuY3NzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gRXhwb3J0c1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwiY29udGFpbmVyXCI6IFwiTmF2QmFyX2NvbnRhaW5lcl9fNW1iT2NcIixcblx0XCJuYXZiYXJDdXN0b21cIjogXCJOYXZCYXJfbmF2YmFyQ3VzdG9tX18xWG5rZlwiLFxuXHRcImJhY2tncm91bmRJbWdcIjogXCJOYXZCYXJfYmFja2dyb3VuZEltZ19fMWtMbkpcIlxufTtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/NavBar/NavBar.module.css\n");

/***/ }),

/***/ "./components/index.js":
/*!*****************************!*\
  !*** ./components/index.js ***!
  \*****************************/
/*! exports provided: NavBar, Layout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _NavBar_NavBar__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NavBar/NavBar */ \"./components/NavBar/NavBar.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"NavBar\", function() { return _NavBar_NavBar__WEBPACK_IMPORTED_MODULE_0__[\"default\"]; });\n\n/* harmony import */ var _Layout_Layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Layout/Layout */ \"./components/Layout/Layout.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"Layout\", function() { return _Layout_Layout__WEBPACK_IMPORTED_MODULE_1__[\"default\"]; });\n\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL2luZGV4LmpzPzdiZTciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBIiwiZmlsZSI6Ii4vY29tcG9uZW50cy9pbmRleC5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOYXZCYXIgZnJvbSBcIi4vTmF2QmFyL05hdkJhclwiO1xuaW1wb3J0IExheW91dCBmcm9tIFwiLi9MYXlvdXQvTGF5b3V0XCI7XG5cbmV4cG9ydCB7IE5hdkJhciwgTGF5b3V0IH07XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./components/index.js\n");

/***/ }),

/***/ "./pages/index.js":
/*!************************!*\
  !*** ./pages/index.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Home; });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components */ \"./components/index.js\");\n/* harmony import */ var _styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/Home.module.css */ \"./styles/Home.module.css\");\n/* harmony import */ var _styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2__);\n\nvar _jsxFileName = \"/Users/davidondrich/dev/advocacy-maps/pages/index.js\";\n\n\nfunction Home() {\n  return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(_components__WEBPACK_IMPORTED_MODULE_1__[\"Layout\"], {\n    pageTitle: \"The Good Governance Project\",\n    children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n      className: _styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2___default.a.container,\n      children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"span\", {\n        className: _styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2___default.a[\"quote-wrapper\"],\n        children: [\"We find \", /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"b\", {\n          children: \"common ground\"\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 9,\n          columnNumber: 19\n        }, this), \" in the desire to improve the quality of our democracy. Our political systems should be inclusive, transparent and responsive.\"]\n      }, void 0, true, {\n        fileName: _jsxFileName,\n        lineNumber: 8,\n        columnNumber: 9\n      }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"br\", {}, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 13,\n        columnNumber: 9\n      }, this), \"We are a group of students at Boston College Law School dedicated to studying democracy, and promoting it\\u2019s preservation and expansion. We advocate for faith in democracy, and for democratic structures worthy of faith.\", /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"br\", {}, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 18,\n        columnNumber: 9\n      }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"br\", {}, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 19,\n        columnNumber: 9\n      }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n        className: _styles_Home_module_css__WEBPACK_IMPORTED_MODULE_2___default.a.priorities,\n        children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"b\", {\n          children: \"Our 2021 Priorities\"\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 21,\n          columnNumber: 11\n        }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"ul\", {\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"li\", {\n            children: \"H3033 \\u2013 Election Day Registration\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 23,\n            columnNumber: 13\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"li\", {\n            children: \"H4603 \\u2013 Campaign Finance \\u2013 Constitutional Amendment\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 24,\n            columnNumber: 13\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"li\", {\n            children: \"H5055 \\u2013 Political Advertisement Disclosure\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 25,\n            columnNumber: 13\n          }, this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 22,\n          columnNumber: 11\n        }, this)]\n      }, void 0, true, {\n        fileName: _jsxFileName,\n        lineNumber: 20,\n        columnNumber: 9\n      }, this)]\n    }, void 0, true, {\n      fileName: _jsxFileName,\n      lineNumber: 7,\n      columnNumber: 7\n    }, this)\n  }, void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 6,\n    columnNumber: 5\n  }, this);\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9pbmRleC5qcz80NGQ4Il0sIm5hbWVzIjpbIkhvbWUiLCJzdHlsZXMiLCJjb250YWluZXIiLCJwcmlvcml0aWVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBRWUsU0FBU0EsSUFBVCxHQUFnQjtBQUM3QixzQkFDRSxxRUFBQyxrREFBRDtBQUFRLGFBQVMsRUFBQyw2QkFBbEI7QUFBQSwyQkFDRTtBQUFLLGVBQVMsRUFBRUMsOERBQU0sQ0FBQ0MsU0FBdkI7QUFBQSw4QkFDRTtBQUFNLGlCQUFTLEVBQUVELDhEQUFNLENBQUMsZUFBRCxDQUF2QjtBQUFBLDRDQUNVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGdCQURWO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQURGLGVBTUU7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQU5GLGtQQVdFO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FYRixlQVlFO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FaRixlQWFFO0FBQUssaUJBQVMsRUFBRUEsOERBQU0sQ0FBQ0UsVUFBdkI7QUFBQSxnQ0FDRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFERixlQUVFO0FBQUEsa0NBQ0U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBREYsZUFFRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQkFGRixlQUdFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQUhGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFGRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FiRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFERjtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBREY7QUEwQkQiLCJmaWxlIjoiLi9wYWdlcy9pbmRleC5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExheW91dCB9IGZyb20gXCIuLi9jb21wb25lbnRzXCI7XG5pbXBvcnQgc3R5bGVzIGZyb20gXCIuLi9zdHlsZXMvSG9tZS5tb2R1bGUuY3NzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEhvbWUoKSB7XG4gIHJldHVybiAoXG4gICAgPExheW91dCBwYWdlVGl0bGU9XCJUaGUgR29vZCBHb3Zlcm5hbmNlIFByb2plY3RcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtzdHlsZXMuY29udGFpbmVyfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtzdHlsZXNbXCJxdW90ZS13cmFwcGVyXCJdfT5cbiAgICAgICAgICBXZSBmaW5kIDxiPmNvbW1vbiBncm91bmQ8L2I+IGluIHRoZSBkZXNpcmUgdG8gaW1wcm92ZSB0aGUgcXVhbGl0eSBvZlxuICAgICAgICAgIG91ciBkZW1vY3JhY3kuIE91ciBwb2xpdGljYWwgc3lzdGVtcyBzaG91bGQgYmUgaW5jbHVzaXZlLCB0cmFuc3BhcmVudFxuICAgICAgICAgIGFuZCByZXNwb25zaXZlLlxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxiciAvPlxuICAgICAgICBXZSBhcmUgYSBncm91cCBvZiBzdHVkZW50cyBhdCBCb3N0b24gQ29sbGVnZSBMYXcgU2Nob29sIGRlZGljYXRlZCB0b1xuICAgICAgICBzdHVkeWluZyBkZW1vY3JhY3ksIGFuZCBwcm9tb3RpbmcgaXTigJlzIHByZXNlcnZhdGlvbiBhbmQgZXhwYW5zaW9uLiBXZVxuICAgICAgICBhZHZvY2F0ZSBmb3IgZmFpdGggaW4gZGVtb2NyYWN5LCBhbmQgZm9yIGRlbW9jcmF0aWMgc3RydWN0dXJlcyB3b3J0aHkgb2ZcbiAgICAgICAgZmFpdGguXG4gICAgICAgIDxiciAvPlxuICAgICAgICA8YnIgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlcy5wcmlvcml0aWVzfT5cbiAgICAgICAgICA8Yj5PdXIgMjAyMSBQcmlvcml0aWVzPC9iPlxuICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIDxsaT5IMzAzMyDigJMgRWxlY3Rpb24gRGF5IFJlZ2lzdHJhdGlvbjwvbGk+XG4gICAgICAgICAgICA8bGk+SDQ2MDMg4oCTIENhbXBhaWduIEZpbmFuY2Ug4oCTIENvbnN0aXR1dGlvbmFsIEFtZW5kbWVudDwvbGk+XG4gICAgICAgICAgICA8bGk+SDUwNTUg4oCTIFBvbGl0aWNhbCBBZHZlcnRpc2VtZW50IERpc2Nsb3N1cmU8L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9MYXlvdXQ+XG4gICk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/index.js\n");

/***/ }),

/***/ "./styles/Home.module.css":
/*!********************************!*\
  !*** ./styles/Home.module.css ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Exports\nmodule.exports = {\n\t\"container\": \"Home_container__1EcsU\",\n\t\"main\": \"Home_main__1x8gC\",\n\t\"quote-wrapper\": \"Home_quote-wrapper__9Vayv\",\n\t\"priorities\": \"Home_priorities__31MPk\",\n\t\"grid\": \"Home_grid__2Ei2F\"\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zdHlsZXMvSG9tZS5tb2R1bGUuY3NzPzRjM2IiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiIuL3N0eWxlcy9Ib21lLm1vZHVsZS5jc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBFeHBvcnRzXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJjb250YWluZXJcIjogXCJIb21lX2NvbnRhaW5lcl9fMUVjc1VcIixcblx0XCJtYWluXCI6IFwiSG9tZV9tYWluX18xeDhnQ1wiLFxuXHRcInF1b3RlLXdyYXBwZXJcIjogXCJIb21lX3F1b3RlLXdyYXBwZXJfXzlWYXl2XCIsXG5cdFwicHJpb3JpdGllc1wiOiBcIkhvbWVfcHJpb3JpdGllc19fMzFNUGtcIixcblx0XCJncmlkXCI6IFwiSG9tZV9ncmlkX18yRWkyRlwiXG59O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./styles/Home.module.css\n");

/***/ }),

/***/ "next/head":
/*!****************************!*\
  !*** external "next/head" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"next/head\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJuZXh0L2hlYWRcIj81ZWYyIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6Im5leHQvaGVhZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5leHQvaGVhZFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///next/head\n");

/***/ }),

/***/ "react-bootstrap/Nav":
/*!**************************************!*\
  !*** external "react-bootstrap/Nav" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react-bootstrap/Nav\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdC1ib290c3RyYXAvTmF2XCI/Yzk3NSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJyZWFjdC1ib290c3RyYXAvTmF2LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVhY3QtYm9vdHN0cmFwL05hdlwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///react-bootstrap/Nav\n");

/***/ }),

/***/ "react-bootstrap/NavDropdown":
/*!**********************************************!*\
  !*** external "react-bootstrap/NavDropdown" ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react-bootstrap/NavDropdown\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdC1ib290c3RyYXAvTmF2RHJvcGRvd25cIj9lNjNmIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6InJlYWN0LWJvb3RzdHJhcC9OYXZEcm9wZG93bi5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlYWN0LWJvb3RzdHJhcC9OYXZEcm9wZG93blwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///react-bootstrap/NavDropdown\n");

/***/ }),

/***/ "react-bootstrap/Navbar":
/*!*****************************************!*\
  !*** external "react-bootstrap/Navbar" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react-bootstrap/Navbar\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdC1ib290c3RyYXAvTmF2YmFyXCI/YWRmNCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJyZWFjdC1ib290c3RyYXAvTmF2YmFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVhY3QtYm9vdHN0cmFwL05hdmJhclwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///react-bootstrap/Navbar\n");

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
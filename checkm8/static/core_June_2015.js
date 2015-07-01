/**
http://ch2lb.checkm8.com/data/static/core_June_2015.js
 * Created by zrehmani on 1/17/14.
 */

//Object.create shim for prototypal inheritance
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

//Polyfill to support CustomEvent on IE9 and IE10
function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
}

CustomEvent.prototype = window.CustomEvent.prototype;
window.CustomEvent = CustomEvent;

//create base namespace for the library
var cm8js = window.cm8js || {};

/* simple cross-browser logger */
cm8js.log = function log(){
    if(this.console){
        console.log(Array.prototype.slice.call(arguments));
    } else {
        // alert(Array.prototype.join.call(arguments, ' '));
    }
};
//if not using another logger, make this logger available globally
window.log = window.log || cm8js.log;

/* cross-browser addEvent implementation by John Resig */
cm8js.addEvent = function addEvent(obj, type, fn) {
    'use strict';
    if (obj.addEventListener) {
        obj.addEventListener(type, fn, false);
    } else if (obj.attachEvent) {
        obj["e" + type + fn] = fn;
        obj[type + fn] = function() {
            obj["e" + type + fn](window.event);
        };
        obj.attachEvent("on" + type, obj[type + fn]);
    }
};

/* cross-browser removeEvent implementation by John Resig */
cm8js.removeEvent = function removeEvent(obj, type, fn) {
    'use strict';
    if (obj.removeEventListener) {
        obj.removeEventListener(type, fn, false);
    } else if (obj.detachEvent) {
        obj.detachEvent("on" + type, obj[type + fn]);
        obj[type + fn] = null;
        obj["e" + type + fn] = null;
    }
};

/**
 * Picked from video.js code... Stever Heffernan (based on John Resig's code)
 * Creates an element and applies properties.
 * @param  {String=} tagName    Name of tag to be created.
 * @param  {Object=} properties Element properties to be applied.
 * @return {Element}
 * @private
 */
cm8js.createEl = function(tagName, properties) {
    'use strict';
    var el, propName;

    el = document.createElement(tagName || 'div');

    for (propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            //el[propName] = properties[propName];
            // Not remembering why we were checking for dash
            // but using setAttribute means you have to use getAttribute

            // The check for dash checks for the aria-* attributes, like aria-label, aria-valuemin.
            // The additional check for "role" is because the default method for adding attributes does not
            // add the attribute "role". My guess is because it's not a valid attribute in some namespaces, although
            // browsers handle the attribute just fine. The W3C allows for aria-* attributes to be used in pre-HTML5 docs.
            // http://www.w3.org/TR/wai-aria-primer/#ariahtml. Using setAttribute gets around this problem.

            if (propName.indexOf('aria-') !== -1 || propName === 'role') {
                el.setAttribute(propName, properties[propName]);
            } else {
                el[propName] = properties[propName];
            }
        }
    }
    return el;
};

//loads a script
cm8js.loadScript = function loadScript(src) {
    'use strict';
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.defer = true;
    script.src = src;
    document.getElementsByTagName("head")[0].appendChild(script);
};

//checks if jquery exists otherwise loads it
cm8js.loadJquery = function loadJQuery() {
    'use strict';
    //ensure latest version
    var cdn = 'http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';

    if (window.jQuery || window.$ || window.parent.jQuery) {
        log("Publisher has jQuery - not loading jquery!");
    } else {
        log('Could not find jQuery -- loading from : ' + cdn);
        cm8js.loadScript(cdn);
    }
};

/* cross-browser fetch style property on any element */
cm8js.getStyle = function getStyle(el, styleProp) {
    'use strict';
    return (el.currentStyle) ? el.currentStyle[styleProp] //IE
        : (window.getComputedStyle)
        ? document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp) //FireFox
        : el.style[styleProp]; //inline style
};

cm8js.loadCss = function loadCss(cssURL){
    if(document.createStyleSheet) {
        document.createStyleSheet(cssURL);
    } else {
        var css;
        css         = document.createElement('link');
        css.rel     = 'stylesheet';
        css.type    = 'text/css';
        css.media   = "all";
        css.href    = cssURL;
        document.getElementsByTagName("head")[0].appendChild(css);
    }
};

cm8js.addCss = function addCss(css){
    var head = document.getElementsByTagName('head')[0];
    var styleElement = document.createElement('style');
    styleElement.setAttribute('type', 'text/css');
    if (styleElement.styleSheet) {   // IE
        styleElement.styleSheet.cssText = css;
    } else {                // the world
        styleElement.appendChild(document.createTextNode(css));
    }
    head.appendChild(styleElement);
};

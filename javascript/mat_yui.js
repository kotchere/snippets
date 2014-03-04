/*****************************************************************
Template: mat.js

Date created: 12/14/2006

Author: Kwaku Otchere kotchere@webworldtech.com

Type: Javascript

Description: Includes all mat js files as one include to improve load time

Related files:
	js/yui/build/yahoo/yahoo.js
	js/yui/build/dom/dom.js
	js/yui/build/event/event.js
	js/yui/build/animation/animation.js
	js/yui/build/container/container.js
	js/yui/build/logger/logger.js
	js/yui/build/connection/connection.js
	js/yui/build/calendar/calendar.js
	js/yui/build/dragdrop/dragdrop.js
	js/yui/build/slider/slider.js
	js/yui_ext/yui-ext.js
*****************************************************************/

// start includes

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 0.12.2
*/
/**
 * The YAHOO object is the single global object used by YUI Library.  It
 * contains utility function for setting up namespaces, inheritance, and
 * logging.  YAHOO.util, YAHOO.widget, and YAHOO.example are namespaces
 * created automatically for and used by the library.
 * @module yahoo
 * @title  YAHOO Global
 */

if (typeof YAHOO == "undefined") {
    /**
     * The YAHOO global namespace object
     * @class YAHOO
     * @static
     */
    var YAHOO = {};
}

/**
 * Returns the namespace specified and creates it if it doesn't exist
 * <pre>
 * YAHOO.namespace("property.package");
 * YAHOO.namespace("YAHOO.property.package");
 * </pre>
 * Either of the above would create YAHOO.property, then
 * YAHOO.property.package
 *
 * Be careful when naming packages. Reserved words may work in some browsers
 * and not others. For instance, the following will fail in Safari:
 * <pre>
 * YAHOO.namespace("really.long.nested.namespace");
 * </pre>
 * This fails because "long" is a future reserved word in ECMAScript
 *
 * @method namespace
 * @static
 * @param  {String*} arguments 1-n namespaces to create 
 * @return {Object}  A reference to the last namespace object created
 */
YAHOO.namespace = function() {
    var a=arguments, o=null, i, j, d;
    for (i=0; i<a.length; ++i) {
        d=a[i].split(".");
        o=YAHOO;

        // YAHOO is implied, so it is ignored if it is included
        for (j=(d[0] == "YAHOO") ? 1 : 0; j<d.length; ++j) {
            o[d[j]]=o[d[j]] || {};
            o=o[d[j]];
        }
    }

    return o;
};

/**
 * Uses YAHOO.widget.Logger to output a log message, if the widget is available.
 *
 * @method log
 * @static
 * @param  {String}  msg  The message to log.
 * @param  {String}  cat  The log category for the message.  Default
 *                        categories are "info", "warn", "error", time".
 *                        Custom categories can be used as well. (opt)
 * @param  {String}  src  The source of the the message (opt)
 * @return {Boolean}      True if the log operation was successful.
 */
YAHOO.log = function(msg, cat, src) {
    var l=YAHOO.widget.Logger;
    if(l && l.log) {
        return l.log(msg, cat, src);
    } else {
        return false;
    }
};

/**
 * Utility to set up the prototype, constructor and superclass properties to
 * support an inheritance strategy that can chain constructors and methods.
 *
 * @method extend
 * @static
 * @param {Function} subc   the object to modify
 * @param {Function} superc the object to inherit
 * @param {Object} overrides  additional properties/methods to add to the
 *                              subclass prototype.  These will override the
 *                              matching items obtained from the superclass 
 *                              if present.
 */
YAHOO.extend = function(subc, superc, overrides) {
    var F = function() {};
    F.prototype=superc.prototype;
    subc.prototype=new F();
    subc.prototype.constructor=subc;
    subc.superclass=superc.prototype;
    if (superc.prototype.constructor == Object.prototype.constructor) {
        superc.prototype.constructor=superc;
    }

    if (overrides) {
        for (var i in overrides) {
            subc.prototype[i]=overrides[i];
        }
    }
};

/**
 * Applies all prototype properties in the supplier to the receiver if the
 * receiver does not have these properties yet.  Optionally, one or more
 * methods/properties can be specified (as additional parameters).  This
 * option will overwrite the property if receiver has it already.
 *
 * @method augment
 * @static
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @param {String*}  arguments zero or more properties methods to augment the
 *                             receiver with.  If none specified, everything
 *                             in the supplier will be used unless it would
 *                             overwrite an existing property in the receiver
 */
YAHOO.augment = function(r, s) {
    var rp=r.prototype, sp=s.prototype, a=arguments, i, p;
    if (a[2]) {
        for (i=2; i<a.length; ++i) {
            rp[a[i]] = sp[a[i]];
        }
    } else {
        for (p in sp) { 
            if (!rp[p]) {
                rp[p] = sp[p];
            }
        }
    }
};

YAHOO.namespace("util", "widget", "example");
/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 0.12.2
*/
/**
 * The dom module provides helper methods for manipulating Dom elements.
 * @module dom
 *
 */

(function() {
    var Y = YAHOO.util,     // internal shorthand
        getStyle,           // for load time browser branching
        setStyle,           // ditto
        id_counter = 0,     // for use with generateId
        propertyCache = {}; // for faster hyphen converts
    
    // brower detection
    var ua = navigator.userAgent.toLowerCase(),
        isOpera = (ua.indexOf('opera') > -1),
        isSafari = (ua.indexOf('safari') > -1),
        isGecko = (!isOpera && !isSafari && ua.indexOf('gecko') > -1),
        isIE = (!isOpera && ua.indexOf('msie') > -1); 
    
    // regex cache
    var patterns = {
        HYPHEN: /(-[a-z])/i
    };

    
    var toCamel = function(property) {
        if ( !patterns.HYPHEN.test(property) ) {
            return property; // no hyphens
        }
        
        if (propertyCache[property]) { // already converted
            return propertyCache[property];
        }
        
        while( patterns.HYPHEN.exec(property) ) {
            property = property.replace(RegExp.$1,
                    RegExp.$1.substr(1).toUpperCase());
        }
        
        propertyCache[property] = property;
        return property;
        //return property.replace(/-([a-z])/gi, function(m0, m1) {return m1.toUpperCase()}) // cant use function as 2nd arg yet due to safari bug
    };
    
    // branching at load instead of runtime
    if (document.defaultView && document.defaultView.getComputedStyle) { // W3C DOM method
        getStyle = function(el, property) {
            var value = null;
            
            var computed = document.defaultView.getComputedStyle(el, '');
            if (computed) { // test computed before touching for safari
                value = computed[toCamel(property)];
            }
            
            return el.style[property] || value;
        };
    } else if (document.documentElement.currentStyle && isIE) { // IE method
        getStyle = function(el, property) {                         
            switch( toCamel(property) ) {
                case 'opacity' :// IE opacity uses filter
                    var val = 100;
                    try { // will error if no DXImageTransform
                        val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;

                    } catch(e) {
                        try { // make sure its in the document
                            val = el.filters('alpha').opacity;
                        } catch(e) {
                        }
                    }
                    return val / 100;
                    break;
                default: 
                    // test currentStyle before touching
                    var value = el.currentStyle ? el.currentStyle[property] : null;
                    return ( el.style[property] || value );
            }
        };
    } else { // default to inline only
        getStyle = function(el, property) { return el.style[property]; };
    }
    
    if (isIE) {
        setStyle = function(el, property, val) {
            switch (property) {
                case 'opacity':
                    if ( typeof el.style.filter == 'string' ) { // in case not appended
                        el.style.filter = 'alpha(opacity=' + val * 100 + ')';
                        
                        if (!el.currentStyle || !el.currentStyle.hasLayout) {
                            el.style.zoom = 1; // when no layout or cant tell
                        }
                    }
                    break;
                default:
                el.style[property] = val;
            }
        };
    } else {
        setStyle = function(el, property, val) {
            el.style[property] = val;
        };
    }
    
    /**
     * Provides helper methods for DOM elements.
     * @namespace YAHOO.util
     * @class Dom
     */
    YAHOO.util.Dom = {
        /**
         * Returns an HTMLElement reference.
         * @method get
         * @param {String | HTMLElement |Array} el Accepts a string to use as an ID for getting a DOM reference, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @return {HTMLElement | Array} A DOM reference to an HTML element or an array of HTMLElements.
         */
        get: function(el) {
            if (!el) { return null; } // nothing to work with
            
            if (typeof el != 'string' && !(el instanceof Array) ) { // assuming HTMLElement or HTMLCollection, so pass back as is
                return el;
            }
            
            if (typeof el == 'string') { // ID
                return document.getElementById(el);
            }
            else { // array of ID's and/or elements
                var collection = [];
                for (var i = 0, len = el.length; i < len; ++i) {
                    collection[collection.length] = Y.Dom.get(el[i]);
                }
                
                return collection;
            }

            return null; // safety, should never happen
        },
    
        /**
         * Normalizes currentStyle and ComputedStyle.
         * @method getStyle
         * @param {String | HTMLElement |Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {String} property The style property whose value is returned.
         * @return {String | Array} The current value of the style property for the element(s).
         */
        getStyle: function(el, property) {
            property = toCamel(property);
            
            var f = function(element) {
                return getStyle(element, property);
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
    
        /**
         * Wrapper for setting style properties of HTMLElements.  Normalizes "opacity" across modern browsers.
         * @method setStyle
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {String} property The style property to be set.
         * @param {String} val The value to apply to the given property.
         */
        setStyle: function(el, property, val) {
            property = toCamel(property);
            
            var f = function(element) {
                setStyle(element, property, val);
                
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current position of an element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getXY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {Array} The XY position of the element(s)
         */
        getXY: function(el) {
            var f = function(el) {
    
            // has to be part of document to have pageXY
                if (el.parentNode === null || el.offsetParent === null ||
                        this.getStyle(el, 'display') == 'none') {
                    return false;
                }
                
                var parentNode = null;
                var pos = [];
                var box;
                
                if (el.getBoundingClientRect) { // IE
                    box = el.getBoundingClientRect();
                    var doc = document;
                    if ( !this.inDocument(el) && parent.document != document) {// might be in a frame, need to get its scroll
                        doc = parent.document;

                        if ( !this.isAncestor(doc.documentElement, el) ) {
                            return false;                      
                        }

                    }

                    var scrollTop = Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
                    var scrollLeft = Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
                    
                    return [box.left + scrollLeft, box.top + scrollTop];
                }
                else { // safari, opera, & gecko
                    pos = [el.offsetLeft, el.offsetTop];
                    parentNode = el.offsetParent;
                    if (parentNode != el) {
                        while (parentNode) {
                            pos[0] += parentNode.offsetLeft;
                            pos[1] += parentNode.offsetTop;
                            parentNode = parentNode.offsetParent;
                        }
                    }
                    if (isSafari && this.getStyle(el, 'position') == 'absolute' ) { // safari doubles in some cases
                        pos[0] -= document.body.offsetLeft;
                        pos[1] -= document.body.offsetTop;
                    } 
                }
                
                if (el.parentNode) { parentNode = el.parentNode; }
                else { parentNode = null; }
        
                while (parentNode && parentNode.tagName.toUpperCase() != 'BODY' && parentNode.tagName.toUpperCase() != 'HTML') 
                { // account for any scrolled ancestors
                    if (Y.Dom.getStyle(parentNode, 'display') != 'inline') { // work around opera inline scrollLeft/Top bug
                        pos[0] -= parentNode.scrollLeft;
                        pos[1] -= parentNode.scrollTop;
                    }
                    
                    if (parentNode.parentNode) {
                        parentNode = parentNode.parentNode; 
                    } else { parentNode = null; }
                }
        
                
                return pos;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current X position of an element based on page coordinates.  The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getX
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {String | Array} The X position of the element(s)
         */
        getX: function(el) {
            var f = function(el) {
                return Y.Dom.getXY(el)[0];
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current Y position of an element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {String | Array} The Y position of the element(s)
         */
        getY: function(el) {
            var f = function(el) {
                return Y.Dom.getXY(el)[1];
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Set the position of an html element in page coordinates, regardless of how the element is positioned.
         * The element(s) must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setXY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @param {Array} pos Contains X & Y values for new position (coordinates are page-based)
         * @param {Boolean} noRetry By default we try and set the position a second time if the first fails
         */
        setXY: function(el, pos, noRetry) {
            var f = function(el) {
                var style_pos = this.getStyle(el, 'position');
                if (style_pos == 'static') { // default to relative
                    this.setStyle(el, 'position', 'relative');
                    style_pos = 'relative';
                }

                var pageXY = this.getXY(el);
                if (pageXY === false) { // has to be part of doc to have pageXY
                    return false; 
                }
                
                var delta = [ // assuming pixels; if not we will have to retry
                    parseInt( this.getStyle(el, 'left'), 10 ),
                    parseInt( this.getStyle(el, 'top'), 10 )
                ];
            
                if ( isNaN(delta[0]) ) {// in case of 'auto'
                    delta[0] = (style_pos == 'relative') ? 0 : el.offsetLeft;
                } 
                if ( isNaN(delta[1]) ) { // in case of 'auto'
                    delta[1] = (style_pos == 'relative') ? 0 : el.offsetTop;
                } 
        
                if (pos[0] !== null) { el.style.left = pos[0] - pageXY[0] + delta[0] + 'px'; }
                if (pos[1] !== null) { el.style.top = pos[1] - pageXY[1] + delta[1] + 'px'; }
              
                if (!noRetry) {
                    var newXY = this.getXY(el);

                    // if retry is true, try one more time if we miss 
                   if ( (pos[0] !== null && newXY[0] != pos[0]) || 
                        (pos[1] !== null && newXY[1] != pos[1]) ) {
                       this.setXY(el, pos, true);
                   }
                }        
        
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Set the X position of an html element in page coordinates, regardless of how the element is positioned.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setX
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {Int} x The value to use as the X coordinate for the element(s).
         */
        setX: function(el, x) {
            Y.Dom.setXY(el, [x, null]);
        },
        
        /**
         * Set the Y position of an html element in page coordinates, regardless of how the element is positioned.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {Int} x To use as the Y coordinate for the element(s).
         */
        setY: function(el, y) {
            Y.Dom.setXY(el, [null, y]);
        },
        
        /**
         * Returns the region position of the given element.
         * The element must be part of the DOM tree to have a region (display:none or elements not appended return false).
         * @method getRegion
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @return {Region | Array} A Region or array of Region instances containing "top, left, bottom, right" member data.
         */
        getRegion: function(el) {
            var f = function(el) {
                var region = new Y.Region.getRegion(el);
                return region;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Returns the width of the client (viewport).
         * @method getClientWidth
         * @deprecated Now using getViewportWidth.  This interface left intact for back compat.
         * @return {Int} The width of the viewable area of the page.
         */
        getClientWidth: function() {
            return Y.Dom.getViewportWidth();
        },
        
        /**
         * Returns the height of the client (viewport).
         * @method getClientHeight
         * @deprecated Now using getViewportHeight.  This interface left intact for back compat.
         * @return {Int} The height of the viewable area of the page.
         */
        getClientHeight: function() {
            return Y.Dom.getViewportHeight();
        },

        /**
         * Returns a array of HTMLElements with the given class.
         * For optimized performance, include a tag and/or root node when possible.
         * @method getElementsByClassName
         * @param {String} className The class name to match against
         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         * @return {Array} An array of elements that have the given class name
         */
        getElementsByClassName: function(className, tag, root) {
            var method = function(el) { return Y.Dom.hasClass(el, className); };
            return Y.Dom.getElementsBy(method, tag, root);
        },

        /**
         * Determines whether an HTMLElement has the given className.
         * @method hasClass
         * @param {String | HTMLElement | Array} el The element or collection to test
         * @param {String} className the class name to search for
         * @return {Boolean | Array} A boolean value or array of boolean values
         */
        hasClass: function(el, className) {
            var re = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
            
            var f = function(el) {
                return re.test(el['className']);
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
    
        /**
         * Adds a class name to a given element or collection of elements.
         * @method addClass         
         * @param {String | HTMLElement | Array} el The element or collection to add the class to
         * @param {String} className the class name to add to the class attribute
         */
        addClass: function(el, className) {
            var f = function(el) {
                if (this.hasClass(el, className)) { return; } // already present
                
                
                el['className'] = [el['className'], className].join(' ');
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
    
        /**
         * Removes a class name from a given element or collection of elements.
         * @method removeClass         
         * @param {String | HTMLElement | Array} el The element or collection to remove the class from
         * @param {String} className the class name to remove from the class attribute
         */
        removeClass: function(el, className) {
            var re = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)', 'g');

            var f = function(el) {
                if (!this.hasClass(el, className)) { return; } // not present
                
                
                var c = el['className'];
                el['className'] = c.replace(re, ' ');
                if ( this.hasClass(el, className) ) { // in case of multiple adjacent
                    this.removeClass(el, className);
                }
                
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Replace a class with another class for a given element or collection of elements.
         * If no oldClassName is present, the newClassName is simply added.
         * @method replaceClass  
         * @param {String | HTMLElement | Array} el The element or collection to remove the class from
         * @param {String} oldClassName the class name to be replaced
         * @param {String} newClassName the class name that will be replacing the old class name
         */
        replaceClass: function(el, oldClassName, newClassName) {
            if (oldClassName === newClassName) { // avoid infinite loop
                return false;
            }
            
            var re = new RegExp('(?:^|\\s+)' + oldClassName + '(?:\\s+|$)', 'g');

            var f = function(el) {
            
                if ( !this.hasClass(el, oldClassName) ) {
                    this.addClass(el, newClassName); // just add it if nothing to replace
                    return; // note return
                }
            
                el['className'] = el['className'].replace(re, ' ' + newClassName + ' ');

                if ( this.hasClass(el, oldClassName) ) { // in case of multiple adjacent
                    this.replaceClass(el, oldClassName, newClassName);
                }
            };
            
            Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Generates a unique ID
         * @method generateId  
         * @param {String | HTMLElement | Array} el (optional) An optional element array of elements to add an ID to (no ID is added if one is already present).
         * @param {String} prefix (optional) an optional prefix to use (defaults to "yui-gen").
         * @return {String | Array} The generated ID, or array of generated IDs (or original ID if already present on an element)
         */
        generateId: function(el, prefix) {
            prefix = prefix || 'yui-gen';
            el = el || {};
            
            var f = function(el) {
                if (el) {
                    el = Y.Dom.get(el);
                } else {
                    el = {}; // just generating ID in this case
                }
                
                if (!el.id) {
                    el.id = prefix + id_counter++; 
                } // dont override existing
                
                
                return el.id;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Determines whether an HTMLElement is an ancestor of another HTML element in the DOM hierarchy.
         * @method isAncestor
         * @param {String | HTMLElement} haystack The possible ancestor
         * @param {String | HTMLElement} needle The possible descendent
         * @return {Boolean} Whether or not the haystack is an ancestor of needle
         */
        isAncestor: function(haystack, needle) {
            haystack = Y.Dom.get(haystack);
            if (!haystack || !needle) { return false; }
            
            var f = function(needle) {
                if (haystack.contains && !isSafari) { // safari "contains" is broken
                    return haystack.contains(needle);
                }
                else if ( haystack.compareDocumentPosition ) {
                    return !!(haystack.compareDocumentPosition(needle) & 16);
                }
                else { // loop up and test each parent
                    var parent = needle.parentNode;
                    
                    while (parent) {
                        if (parent == haystack) {
                            return true;
                        }
                        else if (!parent.tagName || parent.tagName.toUpperCase() == 'HTML') {
                            return false;
                        }
                        
                        parent = parent.parentNode;
                    }
                    return false;
                }     
            };
            
            return Y.Dom.batch(needle, f, Y.Dom, true);      
        },
        
        /**
         * Determines whether an HTMLElement is present in the current document.
         * @method inDocument         
         * @param {String | HTMLElement} el The element to search for
         * @return {Boolean} Whether or not the element is present in the current document
         */
        inDocument: function(el) {
            var f = function(el) {
                return this.isAncestor(document.documentElement, el);
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Returns a array of HTMLElements that pass the test applied by supplied boolean method.
         * For optimized performance, include a tag and/or root node when possible.
         * @method getElementsBy
         * @param {Function} method - A boolean method for testing elements which receives the element as its only argument.

         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         */
        getElementsBy: function(method, tag, root) {
            tag = tag || '*';
            
            var nodes = [];
            
            if (root) {
                root = Y.Dom.get(root);
                if (!root) { // if no root node, then no children
                    return nodes;
                }
            } else {
                root = document;
            }
            
            var elements = root.getElementsByTagName(tag);
            
            if ( !elements.length && (tag == '*' && root.all) ) {
                elements = root.all; // IE < 6
            }
            
            for (var i = 0, len = elements.length; i < len; ++i) {
                if ( method(elements[i]) ) { nodes[nodes.length] = elements[i]; }
            }

            
            return nodes;
        },
        
        /**
         * Returns an array of elements that have had the supplied method applied.
         * The method is called with the element(s) as the first arg, and the optional param as the second ( method(el, o) ).
         * @method batch
         * @param {String | HTMLElement | Array} el (optional) An element or array of elements to apply the method to
         * @param {Function} method The method to apply to the element(s)
         * @param {Any} o (optional) An optional arg that is passed to the supplied method
         * @param {Boolean} override (optional) Whether or not to override the scope of "method" with "o"
         * @return {HTMLElement | Array} The element(s) with the method applied
         */
        batch: function(el, method, o, override) {
            var id = el;
            el = Y.Dom.get(el);
            
            var scope = (override) ? o : window;
            
            if (!el || el.tagName || !el.length) { // is null or not a collection (tagName for SELECT and others that can be both an element and a collection)
                if (!el) {
                    return false;
                }
                return method.call(scope, el, o);
            } 
            
            var collection = [];
            
            for (var i = 0, len = el.length; i < len; ++i) {
                if (!el[i]) {
                    id = el[i];
                }
                collection[collection.length] = method.call(scope, el[i], o);
            }
            
            return collection;
        },
        
        /**
         * Returns the height of the document.
         * @method getDocumentHeight
         * @return {Int} The height of the actual document (which includes the body and its margin).
         */
        getDocumentHeight: function() {
            var scrollHeight = (document.compatMode != 'CSS1Compat') ? document.body.scrollHeight : document.documentElement.scrollHeight;

            var h = Math.max(scrollHeight, Y.Dom.getViewportHeight());
            return h;
        },
        
        /**
         * Returns the width of the document.
         * @method getDocumentWidth
         * @return {Int} The width of the actual document (which includes the body and its margin).
         */
        getDocumentWidth: function() {
            var scrollWidth = (document.compatMode != 'CSS1Compat') ? document.body.scrollWidth : document.documentElement.scrollWidth;
            var w = Math.max(scrollWidth, Y.Dom.getViewportWidth());
            return w;
        },

        /**
         * Returns the current height of the viewport.
         * @method getViewportHeight
         * @return {Int} The height of the viewable area of the page (excludes scrollbars).
         */
        getViewportHeight: function() {
            var height = self.innerHeight; // Safari, Opera
            var mode = document.compatMode;
        
            if ( (mode || isIE) && !isOpera ) { // IE, Gecko
                height = (mode == 'CSS1Compat') ?
                        document.documentElement.clientHeight : // Standards
                        document.body.clientHeight; // Quirks
            }
        
            return height;
        },
        
        /**
         * Returns the current width of the viewport.
         * @method getViewportWidth
         * @return {Int} The width of the viewable area of the page (excludes scrollbars).
         */
        
        getViewportWidth: function() {
            var width = self.innerWidth;  // Safari
            var mode = document.compatMode;
            
            if (mode || isIE) { // IE, Gecko, Opera
                width = (mode == 'CSS1Compat') ?
                        document.documentElement.clientWidth : // Standards
                        document.body.clientWidth; // Quirks
            }
            return width;
        }
    };
})();
/**
 * A region is a representation of an object on a grid.  It is defined
 * by the top, right, bottom, left extents, so is rectangular by default.  If 
 * other shapes are required, this class could be extended to support it.
 * @namespace YAHOO.util
 * @class Region
 * @param {Int} t the top extent
 * @param {Int} r the right extent
 * @param {Int} b the bottom extent
 * @param {Int} l the left extent
 * @constructor
 */
YAHOO.util.Region = function(t, r, b, l) {

    /**
     * The region's top extent
     * @property top
     * @type Int
     */
    this.top = t;
    
    /**
     * The region's top extent as index, for symmetry with set/getXY
     * @property 1
     * @type Int
     */
    this[1] = t;

    /**
     * The region's right extent
     * @property right
     * @type int
     */
    this.right = r;

    /**
     * The region's bottom extent
     * @property bottom
     * @type Int
     */
    this.bottom = b;

    /**
     * The region's left extent
     * @property left
     * @type Int
     */
    this.left = l;
    
    /**
     * The region's left extent as index, for symmetry with set/getXY
     * @property 0
     * @type Int
     */
    this[0] = l;
};

/**
 * Returns true if this region contains the region passed in
 * @method contains
 * @param  {Region}  region The region to evaluate
 * @return {Boolean}        True if the region is contained with this region, 
 *                          else false
 */
YAHOO.util.Region.prototype.contains = function(region) {
    return ( region.left   >= this.left   && 
             region.right  <= this.right  && 
             region.top    >= this.top    && 
             region.bottom <= this.bottom    );

};

/**
 * Returns the area of the region
 * @method getArea
 * @return {Int} the region's area
 */
YAHOO.util.Region.prototype.getArea = function() {
    return ( (this.bottom - this.top) * (this.right - this.left) );
};

/**
 * Returns the region where the passed in region overlaps with this one
 * @method intersect
 * @param  {Region} region The region that intersects
 * @return {Region}        The overlap region, or null if there is no overlap
 */
YAHOO.util.Region.prototype.intersect = function(region) {
    var t = Math.max( this.top,    region.top    );
    var r = Math.min( this.right,  region.right  );
    var b = Math.min( this.bottom, region.bottom );
    var l = Math.max( this.left,   region.left   );
    
    if (b >= t && r >= l) {
        return new YAHOO.util.Region(t, r, b, l);
    } else {
        return null;
    }
};

/**
 * Returns the region representing the smallest region that can contain both
 * the passed in region and this region.
 * @method union
 * @param  {Region} region The region that to create the union with
 * @return {Region}        The union region
 */
YAHOO.util.Region.prototype.union = function(region) {
    var t = Math.min( this.top,    region.top    );
    var r = Math.max( this.right,  region.right  );
    var b = Math.max( this.bottom, region.bottom );
    var l = Math.min( this.left,   region.left   );

    return new YAHOO.util.Region(t, r, b, l);
};

/**
 * toString
 * @method toString
 * @return string the region properties
 */
YAHOO.util.Region.prototype.toString = function() {
    return ( "Region {"    +
             "top: "       + this.top    + 
             ", right: "   + this.right  + 
             ", bottom: "  + this.bottom + 
             ", left: "    + this.left   + 
             "}" );
};

/**
 * Returns a region that is occupied by the DOM element
 * @method getRegion
 * @param  {HTMLElement} el The element
 * @return {Region}         The region that the element occupies
 * @static
 */
YAHOO.util.Region.getRegion = function(el) {
    var p = YAHOO.util.Dom.getXY(el);

    var t = p[1];
    var r = p[0] + el.offsetWidth;
    var b = p[1] + el.offsetHeight;
    var l = p[0];

    return new YAHOO.util.Region(t, r, b, l);
};

/////////////////////////////////////////////////////////////////////////////

/**
 * A point is a region that is special in that it represents a single point on 
 * the grid.
 * @namespace YAHOO.util
 * @class Point
 * @param {Int} x The X position of the point
 * @param {Int} y The Y position of the point
 * @constructor
 * @extends YAHOO.util.Region
 */
YAHOO.util.Point = function(x, y) {
   if (x instanceof Array) { // accept output from Dom.getXY
      y = x[1];
      x = x[0];
   }
   
    /**
     * The X position of the point, which is also the right, left and index zero (for Dom.getXY symmetry)
     * @property x
     * @type Int
     */

    this.x = this.right = this.left = this[0] = x;
     
    /**
     * The Y position of the point, which is also the top, bottom and index one (for Dom.getXY symmetry)
     * @property y
     * @type Int
     */
    this.y = this.top = this.bottom = this[1] = y;
};

YAHOO.util.Point.prototype = new YAHOO.util.Region();

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 0.12.2
*/
/**
 * The CustomEvent class lets you define events for your application
 * that can be subscribed to by one or more independent component.
 *
 * @param {String}  type The type of event, which is passed to the callback
 *                  when the event fires
 * @param {Object}  oScope The context the event will fire from.  "this" will
 *                  refer to this object in the callback.  Default value: 
 *                  the window object.  The listener can override this.
 * @param {boolean} silent pass true to prevent the event from writing to
 *                  the debugsystem
 * @param {int}     signature the signature that the custom event subscriber
 *                  will receive. YAHOO.util.CustomEvent.LIST or 
 *                  YAHOO.util.CustomEvent.FLAT.  The default is
 *                  YAHOO.util.CustomEvent.LIST.
 * @namespace YAHOO.util
 * @class CustomEvent
 * @constructor
 */
YAHOO.util.CustomEvent = function(type, oScope, silent, signature) {

    /**
     * The type of event, returned to subscribers when the event fires
     * @property type
     * @type string
     */
    this.type = type;

    /**
     * The scope the the event will fire from by default.  Defaults to the window 
     * obj
     * @property scope
     * @type object
     */
    this.scope = oScope || window;

    /**
     * By default all custom events are logged in the debug build, set silent
     * to true to disable debug outpu for this event.
     * @property silent
     * @type boolean
     */
    this.silent = silent;

    /**
     * Custom events support two styles of arguments provided to the event
     * subscribers.  
     * <ul>
     * <li>YAHOO.util.CustomEvent.LIST: 
     *   <ul>
     *   <li>param1: event name</li>
     *   <li>param2: array of arguments sent to fire</li>
     *   <li>param3: <optional> a custom object supplied by the subscriber</li>
     *   </ul>
     * </li>
     * <li>YAHOO.util.CustomEvent.FLAT
     *   <ul>
     *   <li>param1: the first argument passed to fire.  If you need to
     *           pass multiple parameters, use and array or object literal</li>
     *   <li>param2: <optional> a custom object supplied by the subscriber</li>
     *   </ul>
     * </li>
     * </ul>
     *   @property signature
     *   @type int
     */
    this.signature = signature || YAHOO.util.CustomEvent.LIST;

    /**
     * The subscribers to this event
     * @property subscribers
     * @type Subscriber[]
     */
    this.subscribers = [];

    if (!this.silent) {
    }

    var onsubscribeType = "_YUICEOnSubscribe";

    // Only add subscribe events for events that are not generated by 
    // CustomEvent
    if (type !== onsubscribeType) {

        /**
         * Custom events provide a custom event that fires whenever there is
         * a new subscriber to the event.  This provides an opportunity to
         * handle the case where there is a non-repeating event that has
         * already fired has a new subscriber.  
         *
         * @event subscribeEvent
         * @type YAHOO.util.CustomEvent
         * @param {Function} fn The function to execute
         * @param {Object}   obj An object to be passed along when the event 
         *                       fires
         * @param {boolean|Object}  override If true, the obj passed in becomes 
         *                                   the execution scope of the listener.
         *                                   if an object, that object becomes the
         *                                   the execution scope.
         */
        this.subscribeEvent = 
                new YAHOO.util.CustomEvent(onsubscribeType, this, true);

    } 
};

/**
 * Subscriber listener sigature constant.  The LIST type returns three
 * parameters: the event type, the array of args passed to fire, and
 * the optional custom object
 * @property YAHOO.util.CustomEvent.LIST
 * @static
 * @type int
 */
YAHOO.util.CustomEvent.LIST = 0;

/**
 * Subscriber listener sigature constant.  The FLAT type returns two
 * parameters: the first argument passed to fire and the optional 
 * custom object
 * @property YAHOO.util.CustomEvent.FLAT
 * @static
 * @type int
 */
YAHOO.util.CustomEvent.FLAT = 1;

YAHOO.util.CustomEvent.prototype = {

    /**
     * Subscribes the caller to this event
     * @method subscribe
     * @param {Function} fn        The function to execute
     * @param {Object}   obj       An object to be passed along when the event 
     *                             fires
     * @param {boolean|Object}  override If true, the obj passed in becomes 
     *                                   the execution scope of the listener.
     *                                   if an object, that object becomes the
     *                                   the execution scope.
     */
    subscribe: function(fn, obj, override) {
        if (this.subscribeEvent) {
            this.subscribeEvent.fire(fn, obj, override);
        }

        this.subscribers.push( new YAHOO.util.Subscriber(fn, obj, override) );
    },

    /**
     * Unsubscribes the caller from this event
     * @method unsubscribe
     * @param {Function} fn  The function to execute
     * @param {Object}   obj  The custom object passed to subscribe (optional)
     * @return {boolean} True if the subscriber was found and detached.
     */
    unsubscribe: function(fn, obj) {
        var found = false;
        for (var i=0, len=this.subscribers.length; i<len; ++i) {
            var s = this.subscribers[i];
            if (s && s.contains(fn, obj)) {
                this._delete(i);
                found = true;
            }
        }

        return found;
    },

    /**
     * Notifies the subscribers.  The callback functions will be executed
     * from the scope specified when the event was created, and with the 
     * following parameters:
     *   <ul>
     *   <li>The type of event</li>
     *   <li>All of the arguments fire() was executed with as an array</li>
     *   <li>The custom object (if any) that was passed into the subscribe() 
     *       method</li>
     *   </ul>
     * @method fire 
     * @param {Object*} arguments an arbitrary set of parameters to pass to 
     *                            the handler.
     * @return {boolean} false if one of the subscribers returned false, 
     *                   true otherwise
     */
    fire: function() {
        var len=this.subscribers.length;
        if (!len && this.silent) {
            return true;
        }

        var args=[], ret=true, i;

        for (i=0; i<arguments.length; ++i) {
            args.push(arguments[i]);
        }

        var argslength = args.length;

        if (!this.silent) {
        }

        for (i=0; i<len; ++i) {
            var s = this.subscribers[i];
            if (s) {
                if (!this.silent) {
                }

                var scope = s.getScope(this.scope);

                if (this.signature == YAHOO.util.CustomEvent.FLAT) {
                    var param = null;
                    if (args.length > 0) {
                        param = args[0];
                    }
                    ret = s.fn.call(scope, param, s.obj);
                } else {
                    ret = s.fn.call(scope, this.type, args, s.obj);
                }
                if (false === ret) {
                    if (!this.silent) {
                    }

                    //break;
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * Removes all listeners
     * @method unsubscribeAll
     */
    unsubscribeAll: function() {
        for (var i=0, len=this.subscribers.length; i<len; ++i) {
            this._delete(len - 1 - i);
        }
    },


    /**
     * @method _delete
     * @private
     */
    _delete: function(index) {
        var s = this.subscribers[index];
        if (s) {
            delete s.fn;
            delete s.obj;
        }

        // delete this.subscribers[index];
        this.subscribers.splice(index, 1);
    },

    /**
     * @method toString
     */
    toString: function() {
         return "CustomEvent: " + "'" + this.type  + "', " + 
             "scope: " + this.scope;

    }
};

/////////////////////////////////////////////////////////////////////

/**
 * Stores the subscriber information to be used when the event fires.
 * @param {Function} fn       The function to execute
 * @param {Object}   obj      An object to be passed along when the event fires
 * @param {boolean}  override If true, the obj passed in becomes the execution
 *                            scope of the listener
 * @class Subscriber
 * @constructor
 */
YAHOO.util.Subscriber = function(fn, obj, override) {

    /**
     * The callback that will be execute when the event fires
     * @property fn
     * @type function
     */
    this.fn = fn;

    /**
     * An optional custom object that will passed to the callback when
     * the event fires
     * @property obj
     * @type object
     */
    this.obj = obj || null;

    /**
     * The default execution scope for the event listener is defined when the
     * event is created (usually the object which contains the event).
     * By setting override to true, the execution scope becomes the custom
     * object passed in by the subscriber.  If override is an object, that 
     * object becomes the scope.
     * @property override
     * @type boolean|object
     */
    this.override = override;

};

/**
 * Returns the execution scope for this listener.  If override was set to true
 * the custom obj will be the scope.  If override is an object, that is the
 * scope, otherwise the default scope will be used.
 * @method getScope
 * @param {Object} defaultScope the scope to use if this listener does not
 *                              override it.
 */
YAHOO.util.Subscriber.prototype.getScope = function(defaultScope) {
    if (this.override) {
        if (this.override === true) {
            return this.obj;
        } else {
            return this.override;
        }
    }
    return defaultScope;
};

/**
 * Returns true if the fn and obj match this objects properties.
 * Used by the unsubscribe method to match the right subscriber.
 *
 * @method contains
 * @param {Function} fn the function to execute
 * @param {Object} obj an object to be passed along when the event fires
 * @return {boolean} true if the supplied arguments match this 
 *                   subscriber's signature.
 */
YAHOO.util.Subscriber.prototype.contains = function(fn, obj) {
    if (obj) {
        return (this.fn == fn && this.obj == obj);
    } else {
        return (this.fn == fn);
    }
};

/**
 * @method toString
 */
YAHOO.util.Subscriber.prototype.toString = function() {
    return "Subscriber { obj: " + (this.obj || "")  + 
           ", override: " +  (this.override || "no") + " }";
};

/**
 * The Event Utility provides utilities for managing DOM Events and tools
 * for building event systems
 *
 * @module event
 * @title Event Utility
 * @namespace YAHOO.util
 * @requires yahoo
 */

// The first instance of Event will win if it is loaded more than once.
if (!YAHOO.util.Event) {

/**
 * The event utility provides functions to add and remove event listeners,
 * event cleansing.  It also tries to automatically remove listeners it
 * registers during the unload event.
 *
 * @class Event
 * @static
 */
    YAHOO.util.Event = function() {

        /**
         * True after the onload event has fired
         * @property loadComplete
         * @type boolean
         * @static
         * @private
         */
        var loadComplete =  false;

        /**
         * Cache of wrapped listeners
         * @property listeners
         * @type array
         * @static
         * @private
         */
        var listeners = [];

        /**
         * User-defined unload function that will be fired before all events
         * are detached
         * @property unloadListeners
         * @type array
         * @static
         * @private
         */
        var unloadListeners = [];

        /**
         * Cache of DOM0 event handlers to work around issues with DOM2 events
         * in Safari
         * @property legacyEvents
         * @static
         * @private
         */
        var legacyEvents = [];

        /**
         * Listener stack for DOM0 events
         * @property legacyHandlers
         * @static
         * @private
         */
        var legacyHandlers = [];

        /**
         * The number of times to poll after window.onload.  This number is
         * increased if additional late-bound handlers are requested after
         * the page load.
         * @property retryCount
         * @static
         * @private
         */
        var retryCount = 0;

        /**
         * onAvailable listeners
         * @property onAvailStack
         * @static
         * @private
         */
        var onAvailStack = [];

        /**
         * Lookup table for legacy events
         * @property legacyMap
         * @static
         * @private
         */
        var legacyMap = [];

        /**
         * Counter for auto id generation
         * @property counter
         * @static
         * @private
         */
        var counter = 0;

        return { // PREPROCESS

            /**
             * The number of times we should look for elements that are not
             * in the DOM at the time the event is requested after the document
             * has been loaded.  The default is 200@amp;50 ms, so it will poll
             * for 10 seconds or until all outstanding handlers are bound
             * (whichever comes first).
             * @property POLL_RETRYS
             * @type int
             * @static
             * @final
             */
            POLL_RETRYS: 200,

            /**
             * The poll interval in milliseconds
             * @property POLL_INTERVAL
             * @type int
             * @static
             * @final
             */
            POLL_INTERVAL: 20,

            /**
             * Element to bind, int constant
             * @property EL
             * @type int
             * @static
             * @final
             */
            EL: 0,

            /**
             * Type of event, int constant
             * @property TYPE
             * @type int
             * @static
             * @final
             */
            TYPE: 1,

            /**
             * Function to execute, int constant
             * @property FN
             * @type int
             * @static
             * @final
             */
            FN: 2,

            /**
             * Function wrapped for scope correction and cleanup, int constant
             * @property WFN
             * @type int
             * @static
             * @final
             */
            WFN: 3,

            /**
             * Object passed in by the user that will be returned as a 
             * parameter to the callback, int constant
             * @property OBJ
             * @type int
             * @static
             * @final
             */
            OBJ: 3,

            /**
             * Adjusted scope, either the element we are registering the event
             * on or the custom object passed in by the listener, int constant
             * @property ADJ_SCOPE
             * @type int
             * @static
             * @final
             */
            ADJ_SCOPE: 4,

            /**
             * Safari detection is necessary to work around the preventDefault
             * bug that makes it so you can't cancel a href click from the 
             * handler.  There is not a capabilities check we can use here.
             * @property isSafari
             * @private
             * @static
             */
            isSafari: (/Safari|Konqueror|KHTML/gi).test(navigator.userAgent),

            /**
             * IE detection needed to properly calculate pageX and pageY.  
             * capabilities checking didn't seem to work because another 
             * browser that does not provide the properties have the values 
             * calculated in a different manner than IE.
             * @property isIE
             * @private
             * @static
             */
            isIE: (!this.isSafari && !navigator.userAgent.match(/opera/gi) && 
                    navigator.userAgent.match(/msie/gi)),

            /**
             * poll handle
             * @property _interval
             * @private
             */
            _interval: null,

            /**
             * @method startInterval
             * @static
             * @private
             */
            startInterval: function() {
                if (!this._interval) {
                    var self = this;
                    var callback = function() { self._tryPreloadAttach(); };
                    this._interval = setInterval(callback, this.POLL_INTERVAL);
                    // this.timeout = setTimeout(callback, i);
                }
            },

            /**
             * Executes the supplied callback when the item with the supplied
             * id is found.  This is meant to be used to execute behavior as
             * soon as possible as the page loads.  If you use this after the
             * initial page load it will poll for a fixed time for the element.
             * The number of times it will poll and the frequency are
             * configurable.  By default it will poll for 10 seconds.
             *
             * @method onAvailable
             *
             * @param {string}   p_id the id of the element to look for.
             * @param {function} p_fn what to execute when the element is found.
             * @param {object}   p_obj an optional object to be passed back as
             *                   a parameter to p_fn.
             * @param {boolean}  p_override If set to true, p_fn will execute
             *                   in the scope of p_obj
             *
             * @static
             */
            onAvailable: function(p_id, p_fn, p_obj, p_override) {
                onAvailStack.push( { id:         p_id, 
                                     fn:         p_fn, 
                                     obj:        p_obj, 
                                     override:   p_override, 
                                     checkReady: false    } );

                retryCount = this.POLL_RETRYS;
                this.startInterval();
            },

            /**
             * Works the same way as onAvailable, but additionally checks the
             * state of sibling elements to determine if the content of the
             * available element is safe to modify.
             *
             * @method onContentReady
             *
             * @param {string}   p_id the id of the element to look for.
             * @param {function} p_fn what to execute when the element is ready.
             * @param {object}   p_obj an optional object to be passed back as
             *                   a parameter to p_fn.
             * @param {boolean}  p_override If set to true, p_fn will execute
             *                   in the scope of p_obj
             *
             * @static
             */
            onContentReady: function(p_id, p_fn, p_obj, p_override) {
                onAvailStack.push( { id:         p_id, 
                                     fn:         p_fn, 
                                     obj:        p_obj, 
                                     override:   p_override,
                                     checkReady: true      } );


                retryCount = this.POLL_RETRYS;
                this.startInterval();
            },

            /**
             * Appends an event handler
             *
             * @method addListener
             *
             * @param {Object}   el        The html element to assign the 
             *                             event to
             * @param {String}   sType     The type of event to append
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {boolean}  override  If true, the obj passed in becomes
             *                             the execution scope of the listener
             * @return {boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
             */
            addListener: function(el, sType, fn, obj, override) {

                if (!fn || !fn.call) {
                    return false;
                }

                // The el argument can be an array of elements or element ids.
                if ( this._isValidCollection(el)) {
                    var ok = true;
                    for (var i=0,len=el.length; i<len; ++i) {
                        ok = this.on(el[i], 
                                       sType, 
                                       fn, 
                                       obj, 
                                       override) && ok;
                    }
                    return ok;

                } else if (typeof el == "string") {
                    var oEl = this.getEl(el);
                    // If the el argument is a string, we assume it is 
                    // actually the id of the element.  If the page is loaded
                    // we convert el to the actual element, otherwise we 
                    // defer attaching the event until onload event fires

                    // check to see if we need to delay hooking up the event 
                    // until after the page loads.
                    if (oEl) {
                        el = oEl;
                    } else {
                        // defer adding the event until the element is available
                        this.onAvailable(el, function() {
                           YAHOO.util.Event.on(el, sType, fn, obj, override);
                        });

                        return true;
                    }
                }

                // Element should be an html element or an array if we get 
                // here.
                if (!el) {
                    return false;
                }

                // we need to make sure we fire registered unload events 
                // prior to automatically unhooking them.  So we hang on to 
                // these instead of attaching them to the window and fire the
                // handles explicitly during our one unload event.
                if ("unload" == sType && obj !== this) {
                    unloadListeners[unloadListeners.length] =
                            [el, sType, fn, obj, override];
                    return true;
                }


                // if the user chooses to override the scope, we use the custom
                // object passed in, otherwise the executing scope will be the
                // HTML element that the event is registered on
                var scope = el;
                if (override) {
                    if (override === true) {
                        scope = obj;
                    } else {
                        scope = override;
                    }
                }

                // wrap the function so we can return the obj object when
                // the event fires;
                var wrappedFn = function(e) {
                        return fn.call(scope, YAHOO.util.Event.getEvent(e), 
                                obj);
                    };

                var li = [el, sType, fn, wrappedFn, scope];
                var index = listeners.length;
                // cache the listener so we can try to automatically unload
                listeners[index] = li;

                if (this.useLegacyEvent(el, sType)) {
                    var legacyIndex = this.getLegacyIndex(el, sType);

                    // Add a new dom0 wrapper if one is not detected for this
                    // element
                    if ( legacyIndex == -1 || 
                                el != legacyEvents[legacyIndex][0] ) {

                        legacyIndex = legacyEvents.length;
                        legacyMap[el.id + sType] = legacyIndex;

                        // cache the signature for the DOM0 event, and 
                        // include the existing handler for the event, if any
                        legacyEvents[legacyIndex] = 
                            [el, sType, el["on" + sType]];
                        legacyHandlers[legacyIndex] = [];

                        el["on" + sType] = 
                            function(e) {
                                YAHOO.util.Event.fireLegacyEvent(
                                    YAHOO.util.Event.getEvent(e), legacyIndex);
                            };
                    }

                    // add a reference to the wrapped listener to our custom
                    // stack of events
                    //legacyHandlers[legacyIndex].push(index);
                    legacyHandlers[legacyIndex].push(li);

                } else {
                    try {
                        this._simpleAdd(el, sType, wrappedFn, false);
                    } catch(e) {
                        // handle an error trying to attach an event.  If it fails
                        // we need to clean up the cache
                        this.removeListener(el, sType, fn);
                        return false;
                    }
                }

                return true;
                
            },

            /**
             * When using legacy events, the handler is routed to this object
             * so we can fire our custom listener stack.
             * @method fireLegacyEvent
             * @static
             * @private
             */
            fireLegacyEvent: function(e, legacyIndex) {
                var ok = true;

                var le = legacyHandlers[legacyIndex];
                for (var i=0,len=le.length; i<len; ++i) {
                    var li = le[i];
                    if ( li && li[this.WFN] ) {
                        var scope = li[this.ADJ_SCOPE];
                        var ret = li[this.WFN].call(scope, e);
                        ok = (ok && ret);
                    }
                }

                return ok;
            },

            /**
             * Returns the legacy event index that matches the supplied 
             * signature
             * @method getLegacyIndex
             * @static
             * @private
             */
            getLegacyIndex: function(el, sType) {
                var key = this.generateId(el) + sType;
                if (typeof legacyMap[key] == "undefined") { 
                    return -1;
                } else {
                    return legacyMap[key];
                }
            },

            /**
             * Logic that determines when we should automatically use legacy
             * events instead of DOM2 events.
             * @method useLegacyEvent
             * @static
             * @private
             */
            useLegacyEvent: function(el, sType) {
                if (!el.addEventListener && !el.attachEvent) {
                    return true;
                } else if (this.isSafari) {
                    if ("click" == sType || "dblclick" == sType) {
                        return true;
                    }
                }
                return false;
            },
                    
            /**
             * Removes an event handler
             *
             * @method removeListener
             *
             * @param {Object} el the html element or the id of the element to 
             * assign the event to.
             * @param {String} sType the type of event to remove.
             * @param {Function} fn the method the event invokes.  If fn is
             * undefined, then all event handlers for the type of event are 
             * removed.
             * @return {boolean} true if the unbind was successful, false 
             * otherwise.
             * @static
             */
            removeListener: function(el, sType, fn) {
                var i, len;

                // The el argument can be a string
                if (typeof el == "string") {
                    el = this.getEl(el);
                // The el argument can be an array of elements or element ids.
                } else if ( this._isValidCollection(el)) {
                    var ok = true;
                    for (i=0,len=el.length; i<len; ++i) {
                        ok = ( this.removeListener(el[i], sType, fn) && ok );
                    }
                    return ok;
                }

                if (!fn || !fn.call) {
                    //return false;
                    return this.purgeElement(el, false, sType);
                }

                if ("unload" == sType) {

                    for (i=0, len=unloadListeners.length; i<len; i++) {
                        var li = unloadListeners[i];
                        if (li && 
                            li[0] == el && 
                            li[1] == sType && 
                            li[2] == fn) {
                                unloadListeners.splice(i, 1);
                                return true;
                        }
                    }

                    return false;
                }

                var cacheItem = null;

                // The index is a hidden parameter; needed to remove it from
                // the method signature because it was tempting users to
                // try and take advantage of it, which is not possible.
                var index = arguments[3];
  
                if ("undefined" == typeof index) {
                    index = this._getCacheIndex(el, sType, fn);
                }

                if (index >= 0) {
                    cacheItem = listeners[index];
                }

                if (!el || !cacheItem) {
                    return false;
                }


                if (this.useLegacyEvent(el, sType)) {
                    var legacyIndex = this.getLegacyIndex(el, sType);
                    var llist = legacyHandlers[legacyIndex];
                    if (llist) {
                        for (i=0, len=llist.length; i<len; ++i) {
                            li = llist[i];
                            if (li && 
                                li[this.EL] == el && 
                                li[this.TYPE] == sType && 
                                li[this.FN] == fn) {
                                    llist.splice(i, 1);
                                    break;
                            }
                        }
                    }

                } else {
                    try {
                        this._simpleRemove(el, sType, cacheItem[this.WFN], false);
                    } catch(e) {
                        return false;
                    }
                }

                // removed the wrapped handler
                delete listeners[index][this.WFN];
                delete listeners[index][this.FN];
                listeners.splice(index, 1);

                return true;

            },

            /**
             * Returns the event's target element
             * @method getTarget
             * @param {Event} ev the event
             * @param {boolean} resolveTextNode when set to true the target's
             *                  parent will be returned if the target is a 
             *                  text node.  @deprecated, the text node is
             *                  now resolved automatically
             * @return {HTMLElement} the event's target
             * @static
             */
            getTarget: function(ev, resolveTextNode) {
                var t = ev.target || ev.srcElement;
                return this.resolveTextNode(t);
            },

            /**
             * In some cases, some browsers will return a text node inside
             * the actual element that was targeted.  This normalizes the
             * return value for getTarget and getRelatedTarget.
             * @method resolveTextNode
             * @param {HTMLElement} node node to resolve
             * @return {HTMLElement} the normized node
             * @static
             */
            resolveTextNode: function(node) {
                // if (node && node.nodeName && 
                        // "#TEXT" == node.nodeName.toUpperCase()) {
                if (node && 3 == node.nodeType) {
                    return node.parentNode;
                } else {
                    return node;
                }
            },

            /**
             * Returns the event's pageX
             * @method getPageX
             * @param {Event} ev the event
             * @return {int} the event's pageX
             * @static
             */
            getPageX: function(ev) {
                var x = ev.pageX;
                if (!x && 0 !== x) {
                    x = ev.clientX || 0;

                    if ( this.isIE ) {
                        x += this._getScrollLeft();
                    }
                }

                return x;
            },

            /**
             * Returns the event's pageY
             * @method getPageY
             * @param {Event} ev the event
             * @return {int} the event's pageY
             * @static
             */
            getPageY: function(ev) {
                var y = ev.pageY;
                if (!y && 0 !== y) {
                    y = ev.clientY || 0;

                    if ( this.isIE ) {
                        y += this._getScrollTop();
                    }
                }

                return y;
            },

            /**
             * Returns the pageX and pageY properties as an indexed array.
             * @method getXY
             * @param {Event} ev the event
             * @return {[x, y]} the pageX and pageY properties of the event
             * @static
             */
            getXY: function(ev) {
                return [this.getPageX(ev), this.getPageY(ev)];
            },

            /**
             * Returns the event's related target 
             * @method getRelatedTarget
             * @param {Event} ev the event
             * @return {HTMLElement} the event's relatedTarget
             * @static
             */
            getRelatedTarget: function(ev) {
                var t = ev.relatedTarget;
                if (!t) {
                    if (ev.type == "mouseout") {
                        t = ev.toElement;
                    } else if (ev.type == "mouseover") {
                        t = ev.fromElement;
                    }
                }

                return this.resolveTextNode(t);
            },

            /**
             * Returns the time of the event.  If the time is not included, the
             * event is modified using the current time.
             * @method getTime
             * @param {Event} ev the event
             * @return {Date} the time of the event
             * @static
             */
            getTime: function(ev) {
                if (!ev.time) {
                    var t = new Date().getTime();
                    try {
                        ev.time = t;
                    } catch(e) { 
                        return t;
                    }
                }

                return ev.time;
            },

            /**
             * Convenience method for stopPropagation + preventDefault
             * @method stopEvent
             * @param {Event} ev the event
             * @static
             */
            stopEvent: function(ev) {
                this.stopPropagation(ev);
                this.preventDefault(ev);
            },

            /**
             * Stops event propagation
             * @method stopPropagation
             * @param {Event} ev the event
             * @static
             */
            stopPropagation: function(ev) {
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                } else {
                    ev.cancelBubble = true;
                }
            },

            /**
             * Prevents the default behavior of the event
             * @method preventDefault
             * @param {Event} ev the event
             * @static
             */
            preventDefault: function(ev) {
                if (ev.preventDefault) {
                    ev.preventDefault();
                } else {
                    ev.returnValue = false;
                }
            },
             
            /**
             * Finds the event in the window object, the caller's arguments, or
             * in the arguments of another method in the callstack.  This is
             * executed automatically for events registered through the event
             * manager, so the implementer should not normally need to execute
             * this function at all.
             * @method getEvent
             * @param {Event} e the event parameter from the handler
             * @return {Event} the event 
             * @static
             */
            getEvent: function(e) {
                var ev = e || window.event;

                if (!ev) {
                    var c = this.getEvent.caller;
                    while (c) {
                        ev = c.arguments[0];
                        if (ev && Event == ev.constructor) {
                            break;
                        }
                        c = c.caller;
                    }
                }

                return ev;
            },

            /**
             * Returns the charcode for an event
             * @method getCharCode
             * @param {Event} ev the event
             * @return {int} the event's charCode
             * @static
             */
            getCharCode: function(ev) {
                return ev.charCode || ev.keyCode || 0;
            },

            /**
             * Locating the saved event handler data by function ref
             *
             * @method _getCacheIndex
             * @static
             * @private
             */
            _getCacheIndex: function(el, sType, fn) {
                for (var i=0,len=listeners.length; i<len; ++i) {
                    var li = listeners[i];
                    if ( li                 && 
                         li[this.FN] == fn  && 
                         li[this.EL] == el  && 
                         li[this.TYPE] == sType ) {
                        return i;
                    }
                }

                return -1;
            },

            /**
             * Generates an unique ID for the element if it does not already 
             * have one.
             * @method generateId
             * @param el the element to create the id for
             * @return {string} the resulting id of the element
             * @static
             */
            generateId: function(el) {
                var id = el.id;

                if (!id) {
                    id = "yuievtautoid-" + counter;
                    ++counter;
                    el.id = id;
                }

                return id;
            },

            /**
             * We want to be able to use getElementsByTagName as a collection
             * to attach a group of events to.  Unfortunately, different 
             * browsers return different types of collections.  This function
             * tests to determine if the object is array-like.  It will also 
             * fail if the object is an array, but is empty.
             * @method _isValidCollection
             * @param o the object to test
             * @return {boolean} true if the object is array-like and populated
             * @static
             * @private
             */
            _isValidCollection: function(o) {
                // this.logger.debug(o.constructor.toString())
                // this.logger.debug(typeof o)

                return ( o                    && // o is something
                         o.length             && // o is indexed
                         typeof o != "string" && // o is not a string
                         !o.tagName           && // o is not an HTML element
                         !o.alert             && // o is not a window
                         typeof o[0] != "undefined" );

            },

            /**
             * @private
             * @property elCache
             * DOM element cache
             * @static
             */
            elCache: {},

            /**
             * We cache elements bound by id because when the unload event 
             * fires, we can no longer use document.getElementById
             * @method getEl
             * @static
             * @private
             */
            getEl: function(id) {
                return document.getElementById(id);
            },

            /**
             * Clears the element cache
             * @deprecated Elements are not cached any longer
             * @method clearCache
             * @static
             * @private
             */
            clearCache: function() { },

            /**
             * hook up any deferred listeners
             * @method _load
             * @static
             * @private
             */
            _load: function(e) {
                loadComplete = true;
                var EU = YAHOO.util.Event;
                // Remove the listener to assist with the IE memory issue, but not
                // for other browsers because FF 1.0x does not like it.
                if (this.isIE) {
                    EU._simpleRemove(window, "load", EU._load);
                }
            },

            /**
             * Polling function that runs before the onload event fires, 
             * attempting to attach to DOM Nodes as soon as they are 
             * available
             * @method _tryPreloadAttach
             * @static
             * @private
             */
            _tryPreloadAttach: function() {

                if (this.locked) {
                    return false;
                }

                this.locked = true;


                // keep trying until after the page is loaded.  We need to 
                // check the page load state prior to trying to bind the 
                // elements so that we can be certain all elements have been 
                // tested appropriately
                var tryAgain = !loadComplete;
                if (!tryAgain) {
                    tryAgain = (retryCount > 0);
                }

                // onAvailable
                var notAvail = [];
                for (var i=0,len=onAvailStack.length; i<len ; ++i) {
                    var item = onAvailStack[i];
                    if (item) {
                        var el = this.getEl(item.id);

                        if (el) {
                            // The element is available, but not necessarily ready
                            // @todo verify IE7 compatibility
                            // @todo should we test parentNode.nextSibling?
                            // @todo re-evaluate global content ready
                            if ( !item.checkReady || 
                                    loadComplete || 
                                    el.nextSibling ||
                                    (document && document.body) ) {

                                var scope = el;
                                if (item.override) {
                                    if (item.override === true) {
                                        scope = item.obj;
                                    } else {
                                        scope = item.override;
                                    }
                                }
                                item.fn.call(scope, item.obj);
                                //delete onAvailStack[i];
                                // null out instead of delete for Opera
                                onAvailStack[i] = null;
                            }
                        } else {
                            notAvail.push(item);
                        }
                    }
                }

                retryCount = (notAvail.length === 0) ? 0 : retryCount - 1;

                if (tryAgain) {
                    // we may need to strip the nulled out items here
                    this.startInterval();
                } else {
                    clearInterval(this._interval);
                    this._interval = null;
                }

                this.locked = false;

                return true;

            },

            /**
             * Removes all listeners attached to the given element via addListener.
             * Optionally, the node's children can also be purged.
             * Optionally, you can specify a specific type of event to remove.
             * @method purgeElement
             * @param {HTMLElement} el the element to purge
             * @param {boolean} recurse recursively purge this element's children
             * as well.  Use with caution.
             * @param {string} sType optional type of listener to purge. If
             * left out, all listeners will be removed
             * @static
             */
            purgeElement: function(el, recurse, sType) {
                var elListeners = this.getListeners(el, sType);
                if (elListeners) {
                    for (var i=0,len=elListeners.length; i<len ; ++i) {
                        var l = elListeners[i];
                        // can't use the index on the changing collection
                        //this.removeListener(el, l.type, l.fn, l.index);
                        this.removeListener(el, l.type, l.fn);
                    }
                }

                if (recurse && el && el.childNodes) {
                    for (i=0,len=el.childNodes.length; i<len ; ++i) {
                        this.purgeElement(el.childNodes[i], recurse, sType);
                    }
                }
            },

            /**
             * Returns all listeners attached to the given element via addListener.
             * Optionally, you can specify a specific type of event to return.
             * @method getListeners
             * @param el {HTMLElement} the element to inspect 
             * @param sType {string} optional type of listener to return. If
             * left out, all listeners will be returned
             * @return {Object} the listener. Contains the following fields:
             * &nbsp;&nbsp;type:   (string)   the type of event
             * &nbsp;&nbsp;fn:     (function) the callback supplied to addListener
             * &nbsp;&nbsp;obj:    (object)   the custom object supplied to addListener
             * &nbsp;&nbsp;adjust: (boolean)  whether or not to adjust the default scope
             * &nbsp;&nbsp;index:  (int)      its position in the Event util listener cache
             * @static
             */           
            getListeners: function(el, sType) {
                var elListeners = [];
                if (listeners && listeners.length > 0) {
                    for (var i=0,len=listeners.length; i<len ; ++i) {
                        var l = listeners[i];
                        if ( l  && l[this.EL] === el && 
                                (!sType || sType === l[this.TYPE]) ) {
                            elListeners.push({
                                type:   l[this.TYPE],
                                fn:     l[this.FN],
                                obj:    l[this.OBJ],
                                adjust: l[this.ADJ_SCOPE],
                                index:  i
                            });
                        }
                    }
                }

                return (elListeners.length) ? elListeners : null;
            },

            /**
             * Removes all listeners registered by pe.event.  Called 
             * automatically during the unload event.
             * @method _unload
             * @static
             * @private
             */
            _unload: function(e) {

                var EU = YAHOO.util.Event, i, j, l, len, index;

                for (i=0,len=unloadListeners.length; i<len; ++i) {
                    l = unloadListeners[i];
                    if (l) {
                        var scope = window;
                        if (l[EU.ADJ_SCOPE]) {
                            if (l[EU.ADJ_SCOPE] === true) {
                                scope = l[EU.OBJ];
                            } else {
                                scope = l[EU.ADJ_SCOPE];
                            }
                        }
                        l[EU.FN].call(scope, EU.getEvent(e), l[EU.OBJ] );
                        unloadListeners[i] = null;
                        l=null;
                        scope=null;
                    }
                }

                unloadListeners = null;

                if (listeners && listeners.length > 0) {
                    j = listeners.length;
                    while (j) {
                        index = j-1;
                        l = listeners[index];
                        if (l) {
                            EU.removeListener(l[EU.EL], l[EU.TYPE], 
                                    l[EU.FN], index);
                        } 
                        j = j - 1;
                    }
                    l=null;

                    EU.clearCache();
                }

                for (i=0,len=legacyEvents.length; i<len; ++i) {
                    // dereference the element
                    //delete legacyEvents[i][0];
                    legacyEvents[i][0] = null;

                    // delete the array item
                    //delete legacyEvents[i];
                    legacyEvents[i] = null;
                }

                legacyEvents = null;

                EU._simpleRemove(window, "unload", EU._unload);

            },

            /**
             * Returns scrollLeft
             * @method _getScrollLeft
             * @static
             * @private
             */
            _getScrollLeft: function() {
                return this._getScroll()[1];
            },

            /**
             * Returns scrollTop
             * @method _getScrollTop
             * @static
             * @private
             */
            _getScrollTop: function() {
                return this._getScroll()[0];
            },

            /**
             * Returns the scrollTop and scrollLeft.  Used to calculate the 
             * pageX and pageY in Internet Explorer
             * @method _getScroll
             * @static
             * @private
             */
            _getScroll: function() {
                var dd = document.documentElement, db = document.body;
                if (dd && (dd.scrollTop || dd.scrollLeft)) {
                    return [dd.scrollTop, dd.scrollLeft];
                } else if (db) {
                    return [db.scrollTop, db.scrollLeft];
                } else {
                    return [0, 0];
                }
            },

            /**
             * Adds a DOM event directly without the caching, cleanup, scope adj, etc
             *
             * @method _simpleAdd
             * @param {HTMLElement} el      the element to bind the handler to
             * @param {string}      sType   the type of event handler
             * @param {function}    fn      the callback to invoke
             * @param {boolen}      capture capture or bubble phase
             * @static
             * @private
             */
            _simpleAdd: function () {
                if (window.addEventListener) {
                    return function(el, sType, fn, capture) {
                        el.addEventListener(sType, fn, (capture));
                    };
                } else if (window.attachEvent) {
                    return function(el, sType, fn, capture) {
                        el.attachEvent("on" + sType, fn);
                    };
                } else {
                    return function(){};
                }
            }(),

            /**
             * Basic remove listener
             *
             * @method _simpleRemove
             * @param {HTMLElement} el      the element to bind the handler to
             * @param {string}      sType   the type of event handler
             * @param {function}    fn      the callback to invoke
             * @param {boolen}      capture capture or bubble phase
             * @static
             * @private
             */
            _simpleRemove: function() {
                if (window.removeEventListener) {
                    return function (el, sType, fn, capture) {
                        el.removeEventListener(sType, fn, (capture));
                    };
                } else if (window.detachEvent) {
                    return function (el, sType, fn) {
                        el.detachEvent("on" + sType, fn);
                    };
                } else {
                    return function(){};
                }
            }()
        };

    }();

    (function() {
        var EU = YAHOO.util.Event;

        /**
         * YAHOO.util.Event.on is an alias for addListener
         * @method on
         * @see addListener
         * @static
         */
        EU.on = EU.addListener;

        // YAHOO.mix(EU, YAHOO.util.EventProvider.prototype);
        // EU.createEvent("DOMContentReady");
        // EU.subscribe("DOMContentReady", EU._load);

        if (document && document.body) {
            EU._load();
        } else {
            // EU._simpleAdd(document, "DOMContentLoaded", EU._load);
            EU._simpleAdd(window, "load", EU._load);
        }
        EU._simpleAdd(window, "unload", EU._unload);
        EU._tryPreloadAttach();
    })();
}

/**
 * EventProvider is designed to be used with YAHOO.augment to wrap 
 * CustomEvents in an interface that allows events to be subscribed to 
 * and fired by name.  This makes it possible for implementing code to
 * subscribe to an event that either has not been created yet, or will
 * not be created at all.
 *
 * @Class EventProvider
 */
YAHOO.util.EventProvider = function() { };

YAHOO.util.EventProvider.prototype = {

    /**
     * Private storage of custom events
     * @property __yui_events
     * @type Object[]
     * @private
     */
    __yui_events: null,

    /**
     * Private storage of custom event subscribers
     * @property __yui_subscribers
     * @type Object[]
     * @private
     */
    __yui_subscribers: null,
    
    /**
     * Subscribe to a CustomEvent by event type
     *
     * @method subscribe
     * @param p_type     {string}   the type, or name of the event
     * @param p_fn       {function} the function to exectute when the event fires
     * @param p_obj
     * @param p_obj      {Object}   An object to be passed along when the event 
     *                              fires
     * @param p_override {boolean}  If true, the obj passed in becomes the 
     *                              execution scope of the listener
     */
    subscribe: function(p_type, p_fn, p_obj, p_override) {

        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];

        if (ce) {
            ce.subscribe(p_fn, p_obj, p_override);
        } else {
            this.__yui_subscribers = this.__yui_subscribers || {};
            var subs = this.__yui_subscribers;
            if (!subs[p_type]) {
                subs[p_type] = [];
            }
            subs[p_type].push(
                { fn: p_fn, obj: p_obj, override: p_override } );
        }
    },

    /**
     * Unsubscribes the from the specified event
     * @method unsubscribe
     * @param p_type {string}   The type, or name of the event
     * @param p_fn   {Function} The function to execute
     * @param p_obj  {Object}   The custom object passed to subscribe (optional)
     * @return {boolean} true if the subscriber was found and detached.
     */
    unsubscribe: function(p_type, p_fn, p_obj) {
        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];
        if (ce) {
            return ce.unsubscribe(p_fn, p_obj);
        } else {
            return false;
        }
    },

    /**
     * Creates a new custom event of the specified type.  If a custom event
     * by that name already exists, it will not be re-created.  In either
     * case the custom event is returned. 
     *
     * @method createEvent
     *
     * @param p_type {string} the type, or name of the event
     * @param p_config {object} optional config params.  Valid properties are:
     *
     *  <ul>
     *    <li>
     *      scope: defines the default execution scope.  If not defined
     *      the default scope will be this instance.
     *    </li>
     *    <li>
     *      silent: if true, the custom event will not generate log messages.
     *      This is false by default.
     *    </li>
     *    <li>
     *      onSubscribeCallback: specifies a callback to execute when the
     *      event has a new subscriber.  This will fire immediately for
     *      each queued subscriber if any exist prior to the creation of
     *      the event.
     *    </li>
     *  </ul>
     *
     *  @return {CustomEvent} the custom event
     *
     */
    createEvent: function(p_type, p_config) {

        this.__yui_events = this.__yui_events || {};
        var opts = p_config || {};
        var events = this.__yui_events;

        if (events[p_type]) {
        } else {

            var scope  = opts.scope  || this;
            var silent = opts.silent || null;

            var ce = new YAHOO.util.CustomEvent(p_type, scope, silent,
                    YAHOO.util.CustomEvent.FLAT);
            events[p_type] = ce;

            if (opts.onSubscribeCallback) {
                ce.subscribeEvent.subscribe(opts.onSubscribeCallback);
            }

            this.__yui_subscribers = this.__yui_subscribers || {};
            var qs = this.__yui_subscribers[p_type];

            if (qs) {
                for (var i=0; i<qs.length; ++i) {
                    ce.subscribe(qs[i].fn, qs[i].obj, qs[i].override);
                }
            }
        }

        return events[p_type];
    },

   /**
     * Fire a custom event by name.  The callback functions will be executed
     * from the scope specified when the event was created, and with the 
     * following parameters:
     *   <ul>
     *   <li>The first argument fire() was executed with</li>
     *   <li>The custom object (if any) that was passed into the subscribe() 
     *       method</li>
     *   </ul>
     * @method fireEvent
     * @param p_type    {string}  the type, or name of the event
     * @param arguments {Object*} an arbitrary set of parameters to pass to 
     *                            the handler.
     * @return {boolean} the return value from CustomEvent.fire, or null if 
     *                   the custom event does not exist.
     */
    fireEvent: function(p_type, arg1, arg2, etc) {

        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];

        if (ce) {
            var args = [];
            for (var i=1; i<arguments.length; ++i) {
                args.push(arguments[i]);
            }
            return ce.fire.apply(ce, args);
        } else {
            return null;
        }
    },

    /**
     * Returns true if the custom event of the provided type has been created
     * with createEvent.
     * @method hasEvent
     * @param type {string} the type, or name of the event
     */
    hasEvent: function(type) {
        if (this.__yui_events) {
            if (this.__yui_events[type]) {
                return true;
            }
        }
        return false;
    }

};

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 0.12.2
*/
/**
 * The animation module provides allows effects to be added to HTMLElements.
 * @module animation
 * @requires yahoo, event, dom
 */

/**
 *
 * Base animation class that provides the interface for building animated effects.
 * <p>Usage: var myAnim = new YAHOO.util.Anim(el, { width: { from: 10, to: 100 } }, 1, YAHOO.util.Easing.easeOut);</p>
 * @class Anim
 * @namespace YAHOO.util
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent
 * @constructor
 * @param {String | HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */

YAHOO.util.Anim = function(el, attributes, duration, method) {
    if (el) {
        this.init(el, attributes, duration, method); 
    }
};

YAHOO.util.Anim.prototype = {
    /**
     * Provides a readable name for the Anim instance.
     * @method toString
     * @return {String}
     */
    toString: function() {
        var el = this.getEl();
        var id = el.id || el.tagName;
        return ("Anim " + id);
    },
    
    patterns: { // cached for performance
        noNegatives:        /width|height|opacity|padding/i, // keep at zero or above
        offsetAttribute:  /^((width|height)|(top|left))$/, // use offsetValue as default
        defaultUnit:        /width|height|top$|bottom$|left$|right$/i, // use 'px' by default
        offsetUnit:         /\d+(em|%|en|ex|pt|in|cm|mm|pc)$/i // IE may return these, so convert these to offset
    },
    
    /**
     * Returns the value computed by the animation's "method".
     * @method doMethod
     * @param {String} attr The name of the attribute.
     * @param {Number} start The value this attribute should start from for this animation.
     * @param {Number} end  The value this attribute should end at for this animation.
     * @return {Number} The Value to be applied to the attribute.
     */
    doMethod: function(attr, start, end) {
        return this.method(this.currentFrame, start, end - start, this.totalFrames);
    },
    
    /**
     * Applies a value to an attribute.
     * @method setAttribute
     * @param {String} attr The name of the attribute.
     * @param {Number} val The value to be applied to the attribute.
     * @param {String} unit The unit ('px', '%', etc.) of the value.
     */
    setAttribute: function(attr, val, unit) {
        if ( this.patterns.noNegatives.test(attr) ) {
            val = (val > 0) ? val : 0;
        }

        YAHOO.util.Dom.setStyle(this.getEl(), attr, val + unit);
    },                        
    
    /**
     * Returns current value of the attribute.
     * @method getAttribute
     * @param {String} attr The name of the attribute.
     * @return {Number} val The current value of the attribute.
     */
    getAttribute: function(attr) {
        var el = this.getEl();
        var val = YAHOO.util.Dom.getStyle(el, attr);

        if (val !== 'auto' && !this.patterns.offsetUnit.test(val)) {
            return parseFloat(val);
        }
        
        var a = this.patterns.offsetAttribute.exec(attr) || [];
        var pos = !!( a[3] ); // top or left
        var box = !!( a[2] ); // width or height
        
        // use offsets for width/height and abs pos top/left
        if ( box || (YAHOO.util.Dom.getStyle(el, 'position') == 'absolute' && pos) ) {
            val = el['offset' + a[0].charAt(0).toUpperCase() + a[0].substr(1)];
        } else { // default to zero for other 'auto'
            val = 0;
        }

        return val;
    },
    
    /**
     * Returns the unit to use when none is supplied.
     * @method getDefaultUnit
     * @param {attr} attr The name of the attribute.
     * @return {String} The default unit to be used.
     */
    getDefaultUnit: function(attr) {
         if ( this.patterns.defaultUnit.test(attr) ) {
            return 'px';
         }
         
         return '';
    },
        
    /**
     * Sets the actual values to be used during the animation.  Should only be needed for subclass use.
     * @method setRuntimeAttribute
     * @param {Object} attr The attribute object
     * @private 
     */
    setRuntimeAttribute: function(attr) {
        var start;
        var end;
        var attributes = this.attributes;

        this.runtimeAttributes[attr] = {};
        
        var isset = function(prop) {
            return (typeof prop !== 'undefined');
        };
        
        if ( !isset(attributes[attr]['to']) && !isset(attributes[attr]['by']) ) {
            return false; // note return; nothing to animate to
        }
        
        start = ( isset(attributes[attr]['from']) ) ? attributes[attr]['from'] : this.getAttribute(attr);

        // To beats by, per SMIL 2.1 spec
        if ( isset(attributes[attr]['to']) ) {
            end = attributes[attr]['to'];
        } else if ( isset(attributes[attr]['by']) ) {
            if (start.constructor == Array) {
                end = [];
                for (var i = 0, len = start.length; i < len; ++i) {
                    end[i] = start[i] + attributes[attr]['by'][i];
                }
            } else {
                end = start + attributes[attr]['by'];
            }
        }
        
        this.runtimeAttributes[attr].start = start;
        this.runtimeAttributes[attr].end = end;

        // set units if needed
        this.runtimeAttributes[attr].unit = ( isset(attributes[attr].unit) ) ? attributes[attr]['unit'] : this.getDefaultUnit(attr);
    },

    /**
     * Constructor for Anim instance.
     * @method init
     * @param {String | HTMLElement} el Reference to the element that will be animated
     * @param {Object} attributes The attribute(s) to be animated.  
     * Each attribute is an object with at minimum a "to" or "by" member defined.  
     * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
     * All attribute names use camelCase.
     * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
     * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
     */ 
    init: function(el, attributes, duration, method) {
        /**
         * Whether or not the animation is running.
         * @property isAnimated
         * @private
         * @type Boolean
         */
        var isAnimated = false;
        
        /**
         * A Date object that is created when the animation begins.
         * @property startTime
         * @private
         * @type Date
         */
        var startTime = null;
        
        /**
         * The number of frames this animation was able to execute.
         * @property actualFrames
         * @private
         * @type Int
         */
        var actualFrames = 0; 

        /**
         * The element to be animated.
         * @property el
         * @private
         * @type HTMLElement
         */
        el = YAHOO.util.Dom.get(el);
        
        /**
         * The collection of attributes to be animated.  
         * Each attribute must have at least a "to" or "by" defined in order to animate.  
         * If "to" is supplied, the animation will end with the attribute at that value.  
         * If "by" is supplied, the animation will end at that value plus its starting value. 
         * If both are supplied, "to" is used, and "by" is ignored. 
         * Optional additional member include "from" (the value the attribute should start animating from, defaults to current value), and "unit" (the units to apply to the values).
         * @property attributes
         * @type Object
         */
        this.attributes = attributes || {};
        
        /**
         * The length of the animation.  Defaults to "1" (second).
         * @property duration
         * @type Number
         */
        this.duration = duration || 1;
        
        /**
         * The method that will provide values to the attribute(s) during the animation. 
         * Defaults to "YAHOO.util.Easing.easeNone".
         * @property method
         * @type Function
         */
        this.method = method || YAHOO.util.Easing.easeNone;

        /**
         * Whether or not the duration should be treated as seconds.
         * Defaults to true.
         * @property useSeconds
         * @type Boolean
         */
        this.useSeconds = true; // default to seconds
        
        /**
         * The location of the current animation on the timeline.
         * In time-based animations, this is used by AnimMgr to ensure the animation finishes on time.
         * @property currentFrame
         * @type Int
         */
        this.currentFrame = 0;
        
        /**
         * The total number of frames to be executed.
         * In time-based animations, this is used by AnimMgr to ensure the animation finishes on time.
         * @property totalFrames
         * @type Int
         */
        this.totalFrames = YAHOO.util.AnimMgr.fps;
        
        
        /**
         * Returns a reference to the animated element.
         * @method getEl
         * @return {HTMLElement}
         */
        this.getEl = function() { return el; };
        
        /**
         * Checks whether the element is currently animated.
         * @method isAnimated
         * @return {Boolean} current value of isAnimated.     
         */
        this.isAnimated = function() {
            return isAnimated;
        };
        
        /**
         * Returns the animation start time.
         * @method getStartTime
         * @return {Date} current value of startTime.      
         */
        this.getStartTime = function() {
            return startTime;
        };        
        
        this.runtimeAttributes = {};
        
        
        
        /**
         * Starts the animation by registering it with the animation manager. 
         * @method animate  
         */
        this.animate = function() {
            if ( this.isAnimated() ) {
                return false;
            }
            
            this.currentFrame = 0;
            
            this.totalFrames = ( this.useSeconds ) ? Math.ceil(YAHOO.util.AnimMgr.fps * this.duration) : this.duration;
    
            YAHOO.util.AnimMgr.registerElement(this);
        };
          
        /**
         * Stops the animation.  Normally called by AnimMgr when animation completes.
         * @method stop
         * @param {Boolean} finish (optional) If true, animation will jump to final frame.
         */ 
        this.stop = function(finish) {
            if (finish) {
                 this.currentFrame = this.totalFrames;
                 this._onTween.fire();
            }
            YAHOO.util.AnimMgr.stop(this);
        };
        
        var onStart = function() {            
            this.onStart.fire();
            
            this.runtimeAttributes = {};
            for (var attr in this.attributes) {
                this.setRuntimeAttribute(attr);
            }
            
            isAnimated = true;
            actualFrames = 0;
            startTime = new Date(); 
        };
        
        /**
         * Feeds the starting and ending values for each animated attribute to doMethod once per frame, then applies the resulting value to the attribute(s).
         * @private
         */
         
        var onTween = function() {
            var data = {
                duration: new Date() - this.getStartTime(),
                currentFrame: this.currentFrame
            };
            
            data.toString = function() {
                return (
                    'duration: ' + data.duration +
                    ', currentFrame: ' + data.currentFrame
                );
            };
            
            this.onTween.fire(data);
            
            var runtimeAttributes = this.runtimeAttributes;
            
            for (var attr in runtimeAttributes) {
                this.setAttribute(attr, this.doMethod(attr, runtimeAttributes[attr].start, runtimeAttributes[attr].end), runtimeAttributes[attr].unit); 
            }
            
            actualFrames += 1;
        };
        
        var onComplete = function() {
            var actual_duration = (new Date() - startTime) / 1000 ;
            
            var data = {
                duration: actual_duration,
                frames: actualFrames,
                fps: actualFrames / actual_duration
            };
            
            data.toString = function() {
                return (
                    'duration: ' + data.duration +
                    ', frames: ' + data.frames +
                    ', fps: ' + data.fps
                );
            };
            
            isAnimated = false;
            actualFrames = 0;
            this.onComplete.fire(data);
        };
        
        /**
         * Custom event that fires after onStart, useful in subclassing
         * @private
         */    
        this._onStart = new YAHOO.util.CustomEvent('_start', this, true);

        /**
         * Custom event that fires when animation begins
         * Listen via subscribe method (e.g. myAnim.onStart.subscribe(someFunction)
         * @event onStart
         */    
        this.onStart = new YAHOO.util.CustomEvent('start', this);
        
        /**
         * Custom event that fires between each frame
         * Listen via subscribe method (e.g. myAnim.onTween.subscribe(someFunction)
         * @event onTween
         */
        this.onTween = new YAHOO.util.CustomEvent('tween', this);
        
        /**
         * Custom event that fires after onTween
         * @private
         */
        this._onTween = new YAHOO.util.CustomEvent('_tween', this, true);
        
        /**
         * Custom event that fires when animation ends
         * Listen via subscribe method (e.g. myAnim.onComplete.subscribe(someFunction)
         * @event onComplete
         */
        this.onComplete = new YAHOO.util.CustomEvent('complete', this);
        /**
         * Custom event that fires after onComplete
         * @private
         */
        this._onComplete = new YAHOO.util.CustomEvent('_complete', this, true);

        this._onStart.subscribe(onStart);
        this._onTween.subscribe(onTween);
        this._onComplete.subscribe(onComplete);
    }
};

/**
 * Handles animation queueing and threading.
 * Used by Anim and subclasses.
 * @class AnimMgr
 * @namespace YAHOO.util
 */
YAHOO.util.AnimMgr = new function() {
    /** 
     * Reference to the animation Interval.
     * @property thread
     * @private
     * @type Int
     */
    var thread = null;
    
    /** 
     * The current queue of registered animation objects.
     * @property queue
     * @private
     * @type Array
     */    
    var queue = [];

    /** 
     * The number of active animations.
     * @property tweenCount
     * @private
     * @type Int
     */        
    var tweenCount = 0;

    /** 
     * Base frame rate (frames per second). 
     * Arbitrarily high for better x-browser calibration (slower browsers drop more frames).
     * @property fps
     * @type Int
     * 
     */
    this.fps = 1000;

    /** 
     * Interval delay in milliseconds, defaults to fastest possible.
     * @property delay
     * @type Int
     * 
     */
    this.delay = 1;

    /**
     * Adds an animation instance to the animation queue.
     * All animation instances must be registered in order to animate.
     * @method registerElement
     * @param {object} tween The Anim instance to be be registered
     */
    this.registerElement = function(tween) {
        queue[queue.length] = tween;
        tweenCount += 1;
        tween._onStart.fire();
        this.start();
    };
    
    /**
     * removes an animation instance from the animation queue.
     * All animation instances must be registered in order to animate.
     * @method unRegister
     * @param {object} tween The Anim instance to be be registered
     * @param {Int} index The index of the Anim instance
     * @private
     */
    this.unRegister = function(tween, index) {
        tween._onComplete.fire();
        index = index || getIndex(tween);
        if (index != -1) { queue.splice(index, 1); }
        
        tweenCount -= 1;
        if (tweenCount <= 0) { this.stop(); }
    };
    
    /**
     * Starts the animation thread.
	* Only one thread can run at a time.
     * @method start
     */    
    this.start = function() {
        if (thread === null) { thread = setInterval(this.run, this.delay); }
    };

    /**
     * Stops the animation thread or a specific animation instance.
     * @method stop
     * @param {object} tween A specific Anim instance to stop (optional)
     * If no instance given, Manager stops thread and all animations.
     */    
    this.stop = function(tween) {
        if (!tween) {
            clearInterval(thread);
            for (var i = 0, len = queue.length; i < len; ++i) {
                if (queue[i].isAnimated()) {
                    this.unRegister(tween, i);  
                }
            }
            queue = [];
            thread = null;
            tweenCount = 0;
        }
        else {
            this.unRegister(tween);
        }
    };
    
    /**
     * Called per Interval to handle each animation frame.
     * @method run
     */    
    this.run = function() {
        for (var i = 0, len = queue.length; i < len; ++i) {
            var tween = queue[i];
            if ( !tween || !tween.isAnimated() ) { continue; }

            if (tween.currentFrame < tween.totalFrames || tween.totalFrames === null)
            {
                tween.currentFrame += 1;
                
                if (tween.useSeconds) {
                    correctFrame(tween);
                }
                tween._onTween.fire();          
            }
            else { YAHOO.util.AnimMgr.stop(tween, i); }
        }
    };
    
    var getIndex = function(anim) {
        for (var i = 0, len = queue.length; i < len; ++i) {
            if (queue[i] == anim) {
                return i; // note return;
            }
        }
        return -1;
    };
    
    /**
     * On the fly frame correction to keep animation on time.
     * @method correctFrame
     * @private
     * @param {Object} tween The Anim instance being corrected.
     */
    var correctFrame = function(tween) {
        var frames = tween.totalFrames;
        var frame = tween.currentFrame;
        var expected = (tween.currentFrame * tween.duration * 1000 / tween.totalFrames);
        var elapsed = (new Date() - tween.getStartTime());
        var tweak = 0;
        
        if (elapsed < tween.duration * 1000) { // check if falling behind
            tweak = Math.round((elapsed / expected - 1) * tween.currentFrame);
        } else { // went over duration, so jump to end
            tweak = frames - (frame + 1); 
        }
        if (tweak > 0 && isFinite(tweak)) { // adjust if needed
            if (tween.currentFrame + tweak >= frames) {// dont go past last frame
                tweak = frames - (frame + 1);
            }
            
            tween.currentFrame += tweak;      
        }
    };
};
/**
 * Used to calculate Bezier splines for any number of control points.
 * @class Bezier
 * @namespace YAHOO.util
 *
 */
YAHOO.util.Bezier = new function() {
    /**
     * Get the current position of the animated element based on t.
     * Each point is an array of "x" and "y" values (0 = x, 1 = y)
     * At least 2 points are required (start and end).
     * First point is start. Last point is end.
     * Additional control points are optional.     
     * @method getPosition
     * @param {Array} points An array containing Bezier points
     * @param {Number} t A number between 0 and 1 which is the basis for determining current position
     * @return {Array} An array containing int x and y member data
     */
    this.getPosition = function(points, t) {  
        var n = points.length;
        var tmp = [];

        for (var i = 0; i < n; ++i){
            tmp[i] = [points[i][0], points[i][1]]; // save input
        }
        
        for (var j = 1; j < n; ++j) {
            for (i = 0; i < n - j; ++i) {
                tmp[i][0] = (1 - t) * tmp[i][0] + t * tmp[parseInt(i + 1, 10)][0];
                tmp[i][1] = (1 - t) * tmp[i][1] + t * tmp[parseInt(i + 1, 10)][1]; 
            }
        }
    
        return [ tmp[0][0], tmp[0][1] ]; 
    
    };
};
(function() {
/**
 * Anim subclass for color transitions.
 * <p>Usage: <code>var myAnim = new Y.ColorAnim(el, { backgroundColor: { from: '#FF0000', to: '#FFFFFF' } }, 1, Y.Easing.easeOut);</code> Color values can be specified with either 112233, #112233, 
 * [255,255,255], or rgb(255,255,255)</p>
 * @class ColorAnim
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @constructor
 * @extends YAHOO.util.Anim
 * @param {HTMLElement | String} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.
 * Each attribute is an object with at minimum a "to" or "by" member defined.
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    YAHOO.util.ColorAnim = function(el, attributes, duration,  method) {
        YAHOO.util.ColorAnim.superclass.constructor.call(this, el, attributes, duration, method);
    };
    
    YAHOO.extend(YAHOO.util.ColorAnim, YAHOO.util.Anim);
    
    // shorthand
    var Y = YAHOO.util;
    var superclass = Y.ColorAnim.superclass;
    var proto = Y.ColorAnim.prototype;
    
    proto.toString = function() {
        var el = this.getEl();
        var id = el.id || el.tagName;
        return ("ColorAnim " + id);
    };

    proto.patterns.color = /color$/i;
    proto.patterns.rgb            = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i;
    proto.patterns.hex            = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;
    proto.patterns.hex3          = /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
    proto.patterns.transparent = /^transparent|rgba\(0, 0, 0, 0\)$/; // need rgba for safari
    
    /**
     * Attempts to parse the given string and return a 3-tuple.
     * @method parseColor
     * @param {String} s The string to parse.
     * @return {Array} The 3-tuple of rgb values.
     */
    proto.parseColor = function(s) {
        if (s.length == 3) { return s; }
    
        var c = this.patterns.hex.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1], 16), parseInt(c[2], 16), parseInt(c[3], 16) ];
        }
    
        c = this.patterns.rgb.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1], 10), parseInt(c[2], 10), parseInt(c[3], 10) ];
        }
    
        c = this.patterns.hex3.exec(s);
        if (c && c.length == 4) {
            return [ parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16) ];
        }
        
        return null;
    };

    proto.getAttribute = function(attr) {
        var el = this.getEl();
        if (  this.patterns.color.test(attr) ) {
            var val = YAHOO.util.Dom.getStyle(el, attr);
            
            if (this.patterns.transparent.test(val)) { // bgcolor default
                var parent = el.parentNode; // try and get from an ancestor
                val = Y.Dom.getStyle(parent, attr);
            
                while (parent && this.patterns.transparent.test(val)) {
                    parent = parent.parentNode;
                    val = Y.Dom.getStyle(parent, attr);
                    if (parent.tagName.toUpperCase() == 'HTML') {
                        val = '#fff';
                    }
                }
            }
        } else {
            val = superclass.getAttribute.call(this, attr);
        }

        return val;
    };
    
    proto.doMethod = function(attr, start, end) {
        var val;
    
        if ( this.patterns.color.test(attr) ) {
            val = [];
            for (var i = 0, len = start.length; i < len; ++i) {
                val[i] = superclass.doMethod.call(this, attr, start[i], end[i]);
            }
            
            val = 'rgb('+Math.floor(val[0])+','+Math.floor(val[1])+','+Math.floor(val[2])+')';
        }
        else {
            val = superclass.doMethod.call(this, attr, start, end);
        }

        return val;
    };

    proto.setRuntimeAttribute = function(attr) {
        superclass.setRuntimeAttribute.call(this, attr);
        
        if ( this.patterns.color.test(attr) ) {
            var attributes = this.attributes;
            var start = this.parseColor(this.runtimeAttributes[attr].start);
            var end = this.parseColor(this.runtimeAttributes[attr].end);
            // fix colors if going "by"
            if ( typeof attributes[attr]['to'] === 'undefined' && typeof attributes[attr]['by'] !== 'undefined' ) {
                end = this.parseColor(attributes[attr].by);
            
                for (var i = 0, len = start.length; i < len; ++i) {
                    end[i] = start[i] + end[i];
                }
            }
            
            this.runtimeAttributes[attr].start = start;
            this.runtimeAttributes[attr].end = end;
        }
    };
})();/*
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright 2001 Robert Penner All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * Singleton that determines how an animation proceeds from start to end.
 * @class Easing
 * @namespace YAHOO.util
*/

YAHOO.util.Easing = {

    /**
     * Uniform speed between points.
     * @method easeNone
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeNone: function (t, b, c, d) {
    	return c*t/d + b;
    },
    
    /**
     * Begins slowly and accelerates towards end. (quadratic)
     * @method easeIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeIn: function (t, b, c, d) {
    	return c*(t/=d)*t + b;
    },

    /**
     * Begins quickly and decelerates towards end.  (quadratic)
     * @method easeOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeOut: function (t, b, c, d) {
    	return -c *(t/=d)*(t-2) + b;
    },
    
    /**
     * Begins slowly and decelerates towards end. (quadratic)
     * @method easeBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeBoth: function (t, b, c, d) {
    	if ((t/=d/2) < 1) {
            return c/2*t*t + b;
        }
        
    	return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    
    /**
     * Begins slowly and accelerates towards end. (quartic)
     * @method easeInStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeInStrong: function (t, b, c, d) {
    	return c*(t/=d)*t*t*t + b;
    },
    
    /**
     * Begins quickly and decelerates towards end.  (quartic)
     * @method easeOutStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeOutStrong: function (t, b, c, d) {
    	return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    
    /**
     * Begins slowly and decelerates towards end. (quartic)
     * @method easeBothStrong
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    easeBothStrong: function (t, b, c, d) {
    	if ((t/=d/2) < 1) {
            return c/2*t*t*t*t + b;
        }
        
    	return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },

    /**
     * Snap in elastic effect.
     * @method elasticIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */

    elasticIn: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        if ( (t /= d) == 1 ) {
            return b+c;
        }
        if (!p) {
            p=d*.3;
        }
        
    	if (!a || a < Math.abs(c)) {
            a = c; 
            var s = p/4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },

    /**
     * Snap out elastic effect.
     * @method elasticOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */
    elasticOut: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        if ( (t /= d) == 1 ) {
            return b+c;
        }
        if (!p) {
            p=d*.3;
        }
        
    	if (!a || a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    
    /**
     * Snap both elastic effect.
     * @method elasticBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} a Amplitude (optional)
     * @param {Number} p Period (optional)
     * @return {Number} The computed value for the current animation frame
     */
    elasticBoth: function (t, b, c, d, a, p) {
    	if (t == 0) {
            return b;
        }
        
        if ( (t /= d/2) == 2 ) {
            return b+c;
        }
        
        if (!p) {
            p = d*(.3*1.5);
        }
        
    	if ( !a || a < Math.abs(c) ) {
            a = c; 
            var s = p/4;
        }
    	else {
            var s = p/(2*Math.PI) * Math.asin (c/a);
        }
        
    	if (t < 1) {
            return -.5*(a*Math.pow(2,10*(t-=1)) * 
                    Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        }
    	return a*Math.pow(2,-10*(t-=1)) * 
                Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },

    /**
     * Backtracks slightly, then reverses direction and moves to end.
     * @method backIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backIn: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158;
        }
    	return c*(t/=d)*t*((s+1)*t - s) + b;
    },

    /**
     * Overshoots end, then reverses and comes back to end.
     * @method backOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backOut: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158;
        }
    	return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    
    /**
     * Backtracks slightly, then reverses direction, overshoots end, 
     * then reverses and comes back to end.
     * @method backBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @param {Number} s Overshoot (optional)
     * @return {Number} The computed value for the current animation frame
     */
    backBoth: function (t, b, c, d, s) {
    	if (typeof s == 'undefined') {
            s = 1.70158; 
        }
        
    	if ((t /= d/2 ) < 1) {
            return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        }
    	return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },

    /**
     * Bounce off of start.
     * @method bounceIn
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceIn: function (t, b, c, d) {
    	return c - YAHOO.util.Easing.bounceOut(d-t, 0, c, d) + b;
    },
    
    /**
     * Bounces off end.
     * @method bounceOut
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceOut: function (t, b, c, d) {
    	if ((t/=d) < (1/2.75)) {
    		return c*(7.5625*t*t) + b;
    	} else if (t < (2/2.75)) {
    		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    	} else if (t < (2.5/2.75)) {
    		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    	}
        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    },
    
    /**
     * Bounces off start and end.
     * @method bounceBoth
     * @param {Number} t Time value used to compute current value
     * @param {Number} b Starting value
     * @param {Number} c Delta between start and end values
     * @param {Number} d Total length of animation
     * @return {Number} The computed value for the current animation frame
     */
    bounceBoth: function (t, b, c, d) {
    	if (t < d/2) {
            return YAHOO.util.Easing.bounceIn(t*2, 0, c, d) * .5 + b;
        }
    	return YAHOO.util.Easing.bounceOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
};

(function() {
/**
 * Anim subclass for moving elements along a path defined by the "points" 
 * member of "attributes".  All "points" are arrays with x, y coordinates.
 * <p>Usage: <code>var myAnim = new YAHOO.util.Motion(el, { points: { to: [800, 800] } }, 1, YAHOO.util.Easing.easeOut);</code></p>
 * @class Motion
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent 
 * @constructor
 * @extends YAHOO.util.Anim
 * @param {String | HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    YAHOO.util.Motion = function(el, attributes, duration,  method) {
        if (el) { // dont break existing subclasses not using YAHOO.extend
            YAHOO.util.Motion.superclass.constructor.call(this, el, attributes, duration, method);
        }
    };

    YAHOO.extend(YAHOO.util.Motion, YAHOO.util.ColorAnim);
    
    // shorthand
    var Y = YAHOO.util;
    var superclass = Y.Motion.superclass;
    var proto = Y.Motion.prototype;

    proto.toString = function() {
        var el = this.getEl();
        var id = el.id || el.tagName;
        return ("Motion " + id);
    };
    
    proto.patterns.points = /^points$/i;
    
    proto.setAttribute = function(attr, val, unit) {
        if (  this.patterns.points.test(attr) ) {
            unit = unit || 'px';
            superclass.setAttribute.call(this, 'left', val[0], unit);
            superclass.setAttribute.call(this, 'top', val[1], unit);
        } else {
            superclass.setAttribute.call(this, attr, val, unit);
        }
    };

    proto.getAttribute = function(attr) {
        if (  this.patterns.points.test(attr) ) {
            var val = [
                superclass.getAttribute.call(this, 'left'),
                superclass.getAttribute.call(this, 'top')
            ];
        } else {
            val = superclass.getAttribute.call(this, attr);
        }

        return val;
    };

    proto.doMethod = function(attr, start, end) {
        var val = null;

        if ( this.patterns.points.test(attr) ) {
            var t = this.method(this.currentFrame, 0, 100, this.totalFrames) / 100;				
            val = Y.Bezier.getPosition(this.runtimeAttributes[attr], t);
        } else {
            val = superclass.doMethod.call(this, attr, start, end);
        }
        return val;
    };

    proto.setRuntimeAttribute = function(attr) {
        if ( this.patterns.points.test(attr) ) {
            var el = this.getEl();
            var attributes = this.attributes;
            var start;
            var control = attributes['points']['control'] || [];
            var end;
            var i, len;
            
            if (control.length > 0 && !(control[0] instanceof Array) ) { // could be single point or array of points
                control = [control];
            } else { // break reference to attributes.points.control
                var tmp = []; 
                for (i = 0, len = control.length; i< len; ++i) {
                    tmp[i] = control[i];
                }
                control = tmp;
            }

            if (Y.Dom.getStyle(el, 'position') == 'static') { // default to relative
                Y.Dom.setStyle(el, 'position', 'relative');
            }
    
            if ( isset(attributes['points']['from']) ) {
                Y.Dom.setXY(el, attributes['points']['from']); // set position to from point
            } 
            else { Y.Dom.setXY( el, Y.Dom.getXY(el) ); } // set it to current position
            
            start = this.getAttribute('points'); // get actual top & left
            
            // TO beats BY, per SMIL 2.1 spec
            if ( isset(attributes['points']['to']) ) {
                end = translateValues.call(this, attributes['points']['to'], start);
                
                var pageXY = Y.Dom.getXY(this.getEl());
                for (i = 0, len = control.length; i < len; ++i) {
                    control[i] = translateValues.call(this, control[i], start);
                }

                
            } else if ( isset(attributes['points']['by']) ) {
                end = [ start[0] + attributes['points']['by'][0], start[1] + attributes['points']['by'][1] ];
                
                for (i = 0, len = control.length; i < len; ++i) {
                    control[i] = [ start[0] + control[i][0], start[1] + control[i][1] ];
                }
            }

            this.runtimeAttributes[attr] = [start];
            
            if (control.length > 0) {
                this.runtimeAttributes[attr] = this.runtimeAttributes[attr].concat(control); 
            }

            this.runtimeAttributes[attr][this.runtimeAttributes[attr].length] = end;
        }
        else {
            superclass.setRuntimeAttribute.call(this, attr);
        }
    };
    
    var translateValues = function(val, start) {
        var pageXY = Y.Dom.getXY(this.getEl());
        val = [ val[0] - pageXY[0] + start[0], val[1] - pageXY[1] + start[1] ];

        return val; 
    };
    
    var isset = function(prop) {
        return (typeof prop !== 'undefined');
    };
})();
(function() {
/**
 * Anim subclass for scrolling elements to a position defined by the "scroll"
 * member of "attributes".  All "scroll" members are arrays with x, y scroll positions.
 * <p>Usage: <code>var myAnim = new YAHOO.util.Scroll(el, { scroll: { to: [0, 800] } }, 1, YAHOO.util.Easing.easeOut);</code></p>
 * @class Scroll
 * @namespace YAHOO.util
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent 
 * @extends YAHOO.util.Anim
 * @constructor
 * @param {String or HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
    YAHOO.util.Scroll = function(el, attributes, duration,  method) {
        if (el) { // dont break existing subclasses not using YAHOO.extend
            YAHOO.util.Scroll.superclass.constructor.call(this, el, attributes, duration, method);
        }
    };

    YAHOO.extend(YAHOO.util.Scroll, YAHOO.util.ColorAnim);
    
    // shorthand
    var Y = YAHOO.util;
    var superclass = Y.Scroll.superclass;
    var proto = Y.Scroll.prototype;

    proto.toString = function() {
        var el = this.getEl();
        var id = el.id || el.tagName;
        return ("Scroll " + id);
    };

    proto.doMethod = function(attr, start, end) {
        var val = null;
    
        if (attr == 'scroll') {
            val = [
                this.method(this.currentFrame, start[0], end[0] - start[0], this.totalFrames),
                this.method(this.currentFrame, start[1], end[1] - start[1], this.totalFrames)
            ];
            
        } else {
            val = superclass.doMethod.call(this, attr, start, end);
        }
        return val;
    };

    proto.getAttribute = function(attr) {
        var val = null;
        var el = this.getEl();
        
        if (attr == 'scroll') {
            val = [ el.scrollLeft, el.scrollTop ];
        } else {
            val = superclass.getAttribute.call(this, attr);
        }
        
        return val;
    };

    proto.setAttribute = function(attr, val, unit) {
        var el = this.getEl();
        
        if (attr == 'scroll') {
            el.scrollLeft = val[0];
            el.scrollTop = val[1];
        } else {
            superclass.setAttribute.call(this, attr, val, unit);
        }
    };
})();

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 0.12.2
*/
/**
* Config is a utility used within an Object to allow the implementer to maintain a list of local configuration properties and listen for changes to those properties dynamically using CustomEvent. The initial values are also maintained so that the configuration can be reset at any given point to its initial state.
* @namespace YAHOO.util
* @class Config
* @constructor
* @param {Object}	owner	The owner Object to which this Config Object belongs
*/
YAHOO.util.Config = function(owner) {
	if (owner) {
		this.init(owner);
	}
};

YAHOO.util.Config.prototype = {
	
	/**
	* Object reference to the owner of this Config Object
	* @property owner
	* @type Object
	*/
	owner : null,

	/**
	* Boolean flag that specifies whether a queue is currently being executed
	* @property queueInProgress
	* @type Boolean
	*/
	queueInProgress : false,


	/**
	* Validates that the value passed in is a Boolean.
	* @method checkBoolean
	* @param	{Object}	val	The value to validate
	* @return	{Boolean}	true, if the value is valid
	*/	
	checkBoolean: function(val) {
		if (typeof val == 'boolean') {
			return true;
		} else {
			return false;
		}
	},

	/**
	* Validates that the value passed in is a number.
	* @method checkNumber
	* @param	{Object}	val	The value to validate
	* @return	{Boolean}	true, if the value is valid
	*/
	checkNumber: function(val) {
		if (isNaN(val)) {
			return false;
		} else {
			return true;
		}
	}
};


/**
* Initializes the configuration Object and all of its local members.
* @method init
* @param {Object}	owner	The owner Object to which this Config Object belongs
*/
YAHOO.util.Config.prototype.init = function(owner) {

	this.owner = owner;

	/**
	* Object reference to the owner of this Config Object
	* @event configChangedEvent
	*/
	this.configChangedEvent = new YAHOO.util.CustomEvent("configChanged");

	this.queueInProgress = false;

	/* Private Members */

	/**
	* Maintains the local collection of configuration property objects and their specified values
	* @property config
	* @private
	* @type Object
	*/ 
	var config = {};

	/**
	* Maintains the local collection of configuration property objects as they were initially applied.
	* This object is used when resetting a property.
	* @property initialConfig
	* @private
	* @type Object
	*/ 
	var initialConfig = {};

	/**
	* Maintains the local, normalized CustomEvent queue
	* @property eventQueue
	* @private
	* @type Object
	*/ 
	var eventQueue = [];

	/**
	* Fires a configuration property event using the specified value. 
	* @method fireEvent
	* @private
	* @param {String}	key			The configuration property's name
	* @param {value}	Object		The value of the correct type for the property
	*/ 
	var fireEvent = function( key, value ) {
		key = key.toLowerCase();

		var property = config[key];

		if (typeof property != 'undefined' && property.event) {
			property.event.fire(value);
		}	
	};
	/* End Private Members */

	/**
	* Adds a property to the Config Object's private config hash.
	* @method addProperty
	* @param {String}	key	The configuration property's name
	* @param {Object}	propertyObject	The Object containing all of this property's arguments
	*/
	this.addProperty = function( key, propertyObject ) {
		key = key.toLowerCase();

		config[key] = propertyObject;

		propertyObject.event = new YAHOO.util.CustomEvent(key);
		propertyObject.key = key;

		if (propertyObject.handler) {
			propertyObject.event.subscribe(propertyObject.handler, this.owner, true);
		}

		this.setProperty(key, propertyObject.value, true);
		
		if (! propertyObject.suppressEvent) {
			this.queueProperty(key, propertyObject.value);
		}
	};

	/**
	* Returns a key-value configuration map of the values currently set in the Config Object.
	* @method getConfig
	* @return {Object} The current config, represented in a key-value map
	*/
	this.getConfig = function() {
		var cfg = {};
			
		for (var prop in config) {
			var property = config[prop];
			if (typeof property != 'undefined' && property.event) {
				cfg[prop] = property.value;
			}
		}
		
		return cfg;
	};

	/**
	* Returns the value of specified property.
	* @method getProperty
	* @param {String} key	The name of the property
	* @return {Object}		The value of the specified property
	*/
	this.getProperty = function(key) {
		key = key.toLowerCase();

		var property = config[key];
		if (typeof property != 'undefined' && property.event) {
			return property.value;
		} else {
			return undefined;
		}
	};

	/**
	* Resets the specified property's value to its initial value.
	* @method resetProperty
	* @param {String} key	The name of the property
	* @return {Boolean} True is the property was reset, false if not
	*/
	this.resetProperty = function(key) {
		key = key.toLowerCase();

		var property = config[key];
		if (typeof property != 'undefined' && property.event) {
			if (initialConfig[key] && initialConfig[key] != 'undefined')	{
				this.setProperty(key, initialConfig[key]);
			}
			return true;
		} else {
			return false;
		}
	};

	/**
	* Sets the value of a property. If the silent property is passed as true, the property's event will not be fired.
	* @method setProperty
	* @param {String} key		The name of the property
	* @param {String} value		The value to set the property to
	* @param {Boolean} silent	Whether the value should be set silently, without firing the property event.
	* @return {Boolean}			True, if the set was successful, false if it failed.
	*/
	this.setProperty = function(key, value, silent) {
		key = key.toLowerCase();

		if (this.queueInProgress && ! silent) {
			this.queueProperty(key,value); // Currently running through a queue... 
			return true;
		} else {
			var property = config[key];
			if (typeof property != 'undefined' && property.event) {
				if (property.validator && ! property.validator(value)) { // validator
					return false;
				} else {
					property.value = value;
					if (! silent) {
						fireEvent(key, value);
						this.configChangedEvent.fire([key, value]);
					}
					return true;
				}
			} else {
				return false;
			}
		}
	};

	/**
	* Sets the value of a property and queues its event to execute. If the event is already scheduled to execute, it is
	* moved from its current position to the end of the queue.
	* @method queueProperty
	* @param {String} key	The name of the property
	* @param {String} value	The value to set the property to
	* @return {Boolean}		true, if the set was successful, false if it failed.
	*/	
	this.queueProperty = function(key, value) {
		key = key.toLowerCase();

		var property = config[key];
							
		if (typeof property != 'undefined' && property.event) {
			if (typeof value != 'undefined' && property.validator && ! property.validator(value)) { // validator
				return false;
			} else {

				if (typeof value != 'undefined') {
					property.value = value;
				} else {
					value = property.value;
				}

				var foundDuplicate = false;

				for (var i=0;i<eventQueue.length;i++) {
					var queueItem = eventQueue[i];

					if (queueItem) {
						var queueItemKey = queueItem[0];
						var queueItemValue = queueItem[1];
						
						if (queueItemKey.toLowerCase() == key) {
							// found a dupe... push to end of queue, null current item, and break
							eventQueue[i] = null;
							eventQueue.push([key, (typeof value != 'undefined' ? value : queueItemValue)]);
							foundDuplicate = true;
							break;
						}
					}
				}
				
				if (! foundDuplicate && typeof value != 'undefined') { // this is a refire, or a new property in the queue
					eventQueue.push([key, value]);
				}
			}

			if (property.supercedes) {
				for (var s=0;s<property.supercedes.length;s++) {
					var supercedesCheck = property.supercedes[s];

					for (var q=0;q<eventQueue.length;q++) {
						var queueItemCheck = eventQueue[q];

						if (queueItemCheck) {
							var queueItemCheckKey = queueItemCheck[0];
							var queueItemCheckValue = queueItemCheck[1];
							
							if ( queueItemCheckKey.toLowerCase() == supercedesCheck.toLowerCase() ) {
								eventQueue.push([queueItemCheckKey, queueItemCheckValue]);
								eventQueue[q] = null;
								break;
							}
						}
					}
				}
			}

			return true;
		} else {
			return false;
		}
	};

	/**
	* Fires the event for a property using the property's current value.
	* @method refireEvent
	* @param {String} key	The name of the property
	*/
	this.refireEvent = function(key) {
		key = key.toLowerCase();

		var property = config[key];
		if (typeof property != 'undefined' && property.event && typeof property.value != 'undefined') {
			if (this.queueInProgress) {
				this.queueProperty(key);
			} else {
				fireEvent(key, property.value);
			}
		}
	};

	/**
	* Applies a key-value Object literal to the configuration, replacing any existing values, and queueing the property events.
	* Although the values will be set, fireQueue() must be called for their associated events to execute.
	* @method applyConfig
	* @param {Object}	userConfig	The configuration Object literal
	* @param {Boolean}	init		When set to true, the initialConfig will be set to the userConfig passed in, so that calling a reset will reset the properties to the passed values.
	*/
	this.applyConfig = function(userConfig, init) {
		if (init) {
			initialConfig = userConfig;
		}
		for (var prop in userConfig) {
			this.queueProperty(prop, userConfig[prop]);
		}
	};

	/**
	* Refires the events for all configuration properties using their current values.
	* @method refresh
	*/
	this.refresh = function() {
		for (var prop in config) {
			this.refireEvent(prop);
		}
	};

	/**
	* Fires the normalized list of queued property change events
	* @method fireQueue
	*/
	this.fireQueue = function() {
		this.queueInProgress = true;
		for (var i=0;i<eventQueue.length;i++) {
			var queueItem = eventQueue[i];
			if (queueItem) {
				var key = queueItem[0];
				var value = queueItem[1];
				
				var property = config[key];
				property.value = value;

				fireEvent(key,value);
			}
		}
		
		this.queueInProgress = false;
		eventQueue = [];
	};

	/**
	* Subscribes an external handler to the change event for any given property. 
	* @method subscribeToConfigEvent
	* @param {String}	key			The property name
	* @param {Function}	handler		The handler function to use subscribe to the property's event
	* @param {Object}	obj			The Object to use for scoping the event handler (see CustomEvent documentation)
	* @param {Boolean}	override	Optional. If true, will override "this" within the handler to map to the scope Object passed into the method.
	* @return {Boolean}				True, if the subscription was successful, otherwise false.
	*/	
	this.subscribeToConfigEvent = function(key, handler, obj, override) {
		key = key.toLowerCase();

		var property = config[key];
		if (typeof property != 'undefined' && property.event) {
			if (! YAHOO.util.Config.alreadySubscribed(property.event, handler, obj)) {
				property.event.subscribe(handler, obj, override);
			}
			return true;
		} else {
			return false;
		}
	};

	/**
	* Unsubscribes an external handler from the change event for any given property. 
	* @method unsubscribeFromConfigEvent
	* @param {String}	key			The property name
	* @param {Function}	handler		The handler function to use subscribe to the property's event
	* @param {Object}	obj			The Object to use for scoping the event handler (see CustomEvent documentation)
	* @return {Boolean}				True, if the unsubscription was successful, otherwise false.
	*/
	this.unsubscribeFromConfigEvent = function(key, handler, obj) {
		key = key.toLowerCase();

		var property = config[key];
		if (typeof property != 'undefined' && property.event) {
			return property.event.unsubscribe(handler, obj);
		} else {
			return false;
		}
	};

	/**
	* Returns a string representation of the Config object
	* @method toString
	* @return {String}	The Config object in string format.
	*/
	this.toString = function() {
		var output = "Config";
		if (this.owner) {
			output += " [" + this.owner.toString() + "]";
		}
		return output;
	};

	/**
	* Returns a string representation of the Config object's current CustomEvent queue
	* @method outputEventQueue
	* @return {String}	The string list of CustomEvents currently queued for execution
	*/
	this.outputEventQueue = function() {
		var output = "";
		for (var q=0;q<eventQueue.length;q++) {
			var queueItem = eventQueue[q];
			if (queueItem) {
				output += queueItem[0] + "=" + queueItem[1] + ", ";
			}
		}
		return output;
	};
};

/**
* Checks to determine if a particular function/Object pair are already subscribed to the specified CustomEvent
* @method YAHOO.util.Config.alreadySubscribed
* @static
* @param {YAHOO.util.CustomEvent} evt	The CustomEvent for which to check the subscriptions
* @param {Function}	fn	The function to look for in the subscribers list
* @param {Object}	obj	The execution scope Object for the subscription
* @return {Boolean}	true, if the function/Object pair is already subscribed to the CustomEvent passed in
*/
YAHOO.util.Config.alreadySubscribed = function(evt, fn, obj) {
	for (var e=0;e<evt.subscribers.length;e++) {
		var subsc = evt.subscribers[e];
		if (subsc && subsc.obj == obj && subsc.fn == fn) {
			return true;
		}
	}
	return false;
};

/**
*  The Container family of components is designed to enable developers to create different kinds of content-containing modules on the web. Module and Overlay are the most basic containers, and they can be used directly or extended to build custom containers. Also part of the Container family are four UI controls that extend Module and Overlay: Tooltip, Panel, Dialog, and SimpleDialog.
* @module container
* @title Container
* @requires yahoo,dom,event,dragdrop,animation
*/

/**
* Module is a JavaScript representation of the Standard Module Format. Standard Module Format is a simple standard for markup containers where child nodes representing the header, body, and footer of the content are denoted using the CSS classes "hd", "bd", and "ft" respectively. Module is the base class for all other classes in the YUI Container package.
* @namespace YAHOO.widget
* @class Module
* @constructor
* @param {String} el			The element ID representing the Module <em>OR</em>
* @param {HTMLElement} el		The element representing the Module
* @param {Object} userConfig	The configuration Object literal containing the configuration that should be set for this module. See configuration documentation for more details.
*/
YAHOO.widget.Module = function(el, userConfig) {
	if (el) { 
		this.init(el, userConfig); 
	}
};

/**
* Constant representing the prefix path to use for non-secure images
* @property YAHOO.widget.Module.IMG_ROOT
* @static
* @final
* @type String
*/
YAHOO.widget.Module.IMG_ROOT = "http://us.i1.yimg.com/us.yimg.com/i/";

/**
* Constant representing the prefix path to use for securely served images
* @property YAHOO.widget.Module.IMG_ROOT_SSL
* @static
* @final
* @type String
*/
YAHOO.widget.Module.IMG_ROOT_SSL = "https://a248.e.akamai.net/sec.yimg.com/i/";

/**
* Constant for the default CSS class name that represents a Module
* @property YAHOO.widget.Module.CSS_MODULE
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_MODULE = "module";

/**
* Constant representing the module header
* @property YAHOO.widget.Module.CSS_HEADER
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_HEADER = "hd";

/**
* Constant representing the module body
* @property YAHOO.widget.Module.CSS_BODY
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_BODY = "bd";

/**
* Constant representing the module footer
* @property YAHOO.widget.Module.CSS_FOOTER
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_FOOTER = "ft";

/**
* Constant representing the url for the "src" attribute of the iframe used to monitor changes to the browser's base font size
* @property YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL
* @static
* @final
* @type String
*/
YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL = "javascript:false;";

/**
* Singleton CustomEvent fired when the font size is changed in the browser.
* Opera's "zoom" functionality currently does not support text size detection.
* @event YAHOO.widget.Module.textResizeEvent
*/	
YAHOO.widget.Module.textResizeEvent = new YAHOO.util.CustomEvent("textResize");

YAHOO.widget.Module.prototype = {
	/**
	* The class's constructor function
	* @property contructor
	* @type Function
	*/
	constructor : YAHOO.widget.Module,

	/**
	* The main module element that contains the header, body, and footer
	* @property element
	* @type HTMLElement
	*/
	element : null, 

	/**
	* The header element, denoted with CSS class "hd"
	* @property header
	* @type HTMLElement
	*/
	header : null,

	/**
	* The body element, denoted with CSS class "bd"
	* @property body
	* @type HTMLElement
	*/
	body : null,

	/**
	* The footer element, denoted with CSS class "ft"
	* @property footer
	* @type HTMLElement
	*/
	footer : null,

	/**
	* The id of the element
	* @property id
	* @type String
	*/
	id : null,

	/**
	* The String representing the image root
	* @property imageRoot
	* @type String
	*/
	imageRoot : YAHOO.widget.Module.IMG_ROOT,
		
	/**
	* Initializes the custom events for Module which are fired automatically at appropriate times by the Module class.
	* @method initEvents
	*/
	initEvents : function() {

		/**
		* CustomEvent fired prior to class initalization.
		* @event beforeInitEvent
		* @param {class} classRef	class reference of the initializing class, such as this.beforeInitEvent.fire(YAHOO.widget.Module)
		*/
		this.beforeInitEvent = new YAHOO.util.CustomEvent("beforeInit");

		/**
		* CustomEvent fired after class initalization.
		* @event initEvent
		* @param {class} classRef	class reference of the initializing class, such as this.beforeInitEvent.fire(YAHOO.widget.Module)
		*/		
		this.initEvent = new YAHOO.util.CustomEvent("init");

		/**
		* CustomEvent fired when the Module is appended to the DOM
		* @event appendEvent
		*/
		this.appendEvent = new YAHOO.util.CustomEvent("append");

		/**
		* CustomEvent fired before the Module is rendered
		* @event beforeRenderEvent
		*/
		this.beforeRenderEvent = new YAHOO.util.CustomEvent("beforeRender");

		/**
		* CustomEvent fired after the Module is rendered
		* @event renderEvent
		*/
		this.renderEvent = new YAHOO.util.CustomEvent("render");
	
		/**
		* CustomEvent fired when the header content of the Module is modified
		* @event changeHeaderEvent
		* @param {String/HTMLElement} content	String/element representing the new header content
		*/
		this.changeHeaderEvent = new YAHOO.util.CustomEvent("changeHeader");
		
		/**
		* CustomEvent fired when the body content of the Module is modified
		* @event changeBodyEvent
		* @param {String/HTMLElement} content	String/element representing the new body content
		*/		
		this.changeBodyEvent = new YAHOO.util.CustomEvent("changeBody");
		
		/**
		* CustomEvent fired when the footer content of the Module is modified
		* @event changeFooterEvent
		* @param {String/HTMLElement} content	String/element representing the new footer content
		*/
		this.changeFooterEvent = new YAHOO.util.CustomEvent("changeFooter");

		/**
		* CustomEvent fired when the content of the Module is modified
		* @event changeContentEvent
		*/
		this.changeContentEvent = new YAHOO.util.CustomEvent("changeContent");

		/**
		* CustomEvent fired when the Module is destroyed
		* @event destroyEvent
		*/
		this.destroyEvent = new YAHOO.util.CustomEvent("destroy");
		
		/**
		* CustomEvent fired before the Module is shown
		* @event beforeShowEvent
		*/
		this.beforeShowEvent = new YAHOO.util.CustomEvent("beforeShow");

		/**
		* CustomEvent fired after the Module is shown
		* @event showEvent
		*/
		this.showEvent = new YAHOO.util.CustomEvent("show");

		/**
		* CustomEvent fired before the Module is hidden
		* @event beforeHideEvent
		*/
		this.beforeHideEvent = new YAHOO.util.CustomEvent("beforeHide");

		/**
		* CustomEvent fired after the Module is hidden
		* @event hideEvent
		*/
		this.hideEvent = new YAHOO.util.CustomEvent("hide");
	}, 

	/**
	* String representing the current user-agent platform
	* @property platform
	* @type String
	*/
	platform : function() {
					var ua = navigator.userAgent.toLowerCase();
					if (ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1) {
						return "windows";
					} else if (ua.indexOf("macintosh") != -1) {
						return "mac";
					} else {
						return false;
					}
				}(),

	/**
	* String representing the current user-agent browser
	* @property browser
	* @type String
	*/
	browser : function() {
			var ua = navigator.userAgent.toLowerCase();
				  if (ua.indexOf('opera')!=-1) { // Opera (check first in case of spoof)
					 return 'opera';
				  } else if (ua.indexOf('msie 7')!=-1) { // IE7
					 return 'ie7';
				  } else if (ua.indexOf('msie') !=-1) { // IE
					 return 'ie';
				  } else if (ua.indexOf('safari')!=-1) { // Safari (check before Gecko because it includes "like Gecko")
					 return 'safari';
				  } else if (ua.indexOf('gecko') != -1) { // Gecko
					 return 'gecko';
				  } else {
					 return false;
				  }
			}(),

	/**
	* Boolean representing whether or not the current browsing context is secure (https)
	* @property isSecure
	* @type Boolean
	*/
	isSecure : function() {
		if (window.location.href.toLowerCase().indexOf("https") === 0) {
			return true;
		} else {
			return false;
		}
	}(),

	/**
	* Initializes the custom events for Module which are fired automatically at appropriate times by the Module class.
	*/
	initDefaultConfig : function() {
		// Add properties //
		
		/**
		* Specifies whether the Module is visible on the page.
		* @config visible
		* @type Boolean
		* @default true
		*/
		this.cfg.addProperty("visible", { value:true, handler:this.configVisible, validator:this.cfg.checkBoolean } );
		
		/**
		* Object or array of objects representing the ContainerEffect classes that are active for animating the container.
		* @config effect
		* @type Object
		* @default null
		*/
		this.cfg.addProperty("effect", { suppressEvent:true, supercedes:["visible"] } );
		
		/**
		* Specifies whether to create a special proxy iframe to monitor for user font resizing in the document
		* @config monitorresize
		* @type Boolean
		* @default true
		*/
		this.cfg.addProperty("monitorresize", { value:true, handler:this.configMonitorResize } );
	},

	/**
	* The Module class's initialization method, which is executed for Module and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
	* @method init
	* @param {String}	el	The element ID representing the Module <em>OR</em>
	* @param {HTMLElement}	el	The element representing the Module
	* @param {Object}	userConfig	The configuration Object literal containing the configuration that should be set for this module. See configuration documentation for more details.
	*/
	init : function(el, userConfig) {

		this.initEvents();

		this.beforeInitEvent.fire(YAHOO.widget.Module);

		/**
		* The Module's Config object used for monitoring configuration properties.
		* @property cfg
		* @type YAHOO.util.Config
		*/
		this.cfg = new YAHOO.util.Config(this);
		
		if (this.isSecure) {
			this.imageRoot = YAHOO.widget.Module.IMG_ROOT_SSL;
		}

		if (typeof el == "string") {
			var elId = el;

			el = document.getElementById(el);
			if (! el) {
				el = document.createElement("DIV");
				el.id = elId;
			}
		}

		this.element = el;
		
		if (el.id) {
			this.id = el.id;
		} 

		var childNodes = this.element.childNodes;

		if (childNodes) {
			for (var i=0;i<childNodes.length;i++) {
				var child = childNodes[i];
				switch (child.className) {
					case YAHOO.widget.Module.CSS_HEADER:
						this.header = child;
						break;
					case YAHOO.widget.Module.CSS_BODY:
						this.body = child;
						break;
					case YAHOO.widget.Module.CSS_FOOTER:
						this.footer = child;
						break;
				}
			}
		}

		this.initDefaultConfig();

		YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Module.CSS_MODULE);

		if (userConfig) {
			this.cfg.applyConfig(userConfig, true);
		}

		// Subscribe to the fireQueue() method of Config so that any queued configuration changes are
		// excecuted upon render of the Module
		if (! YAHOO.util.Config.alreadySubscribed(this.renderEvent, this.cfg.fireQueue, this.cfg)) {
			this.renderEvent.subscribe(this.cfg.fireQueue, this.cfg, true);
		}

		this.initEvent.fire(YAHOO.widget.Module);
	},

	/**
	* Initialized an empty IFRAME that is placed out of the visible area that can be used to detect text resize.
	* @method initResizeMonitor
	*/
	initResizeMonitor : function() {

        if(this.browser != "opera") {

            var resizeMonitor = document.getElementById("_yuiResizeMonitor");
    
            if (! resizeMonitor) {
    
                resizeMonitor = document.createElement("iframe");
    
                var bIE = (this.browser.indexOf("ie") === 0);
    
                if(this.isSecure && 
                   YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL && 
                   bIE) {
    
                  resizeMonitor.src = 
                       YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL;
    
                }                

                resizeMonitor.id = "_yuiResizeMonitor";
                resizeMonitor.style.visibility = "hidden";
                
                document.body.appendChild(resizeMonitor);
    
                resizeMonitor.style.width = "10em";
                resizeMonitor.style.height = "10em";
                resizeMonitor.style.position = "absolute";
                
                var nLeft = -1 * resizeMonitor.offsetWidth,
                    nTop = -1 * resizeMonitor.offsetHeight;
    
                resizeMonitor.style.top = nTop + "px";
                resizeMonitor.style.left =  nLeft + "px";
                resizeMonitor.style.borderStyle = "none";
                resizeMonitor.style.borderWidth = "0";
                YAHOO.util.Dom.setStyle(resizeMonitor, "opacity", "0");
                
                resizeMonitor.style.visibility = "visible";
    
                if(!bIE) {
    
                    var doc = resizeMonitor.contentWindow.document;
    
                    doc.open();
                    doc.close();
                
                }
            }
    
			var fireTextResize = function() {
				YAHOO.widget.Module.textResizeEvent.fire();
			};

            if(resizeMonitor && resizeMonitor.contentWindow) {
                this.resizeMonitor = resizeMonitor;
				
				YAHOO.widget.Module.textResizeEvent.subscribe(this.onDomResize, this, true);
				
				if (! YAHOO.widget.Module.textResizeInitialized) {
					if (! YAHOO.util.Event.addListener(this.resizeMonitor.contentWindow, "resize", fireTextResize)) {
						// This will fail in IE if document.domain has changed, so we must change the listener to
						// use the resizeMonitor element instead
						YAHOO.util.Event.addListener(this.resizeMonitor, "resize", fireTextResize);
					}
					YAHOO.widget.Module.textResizeInitialized = true;
				}
            }
        
        }

	},

	/**
	* Event handler fired when the resize monitor element is resized.
	* @method onDomResize
	* @param {DOMEvent} e	The DOM resize event
	* @param {Object} obj	The scope object passed to the handler
	*/
	onDomResize : function(e, obj) { 
        var nLeft = -1 * this.resizeMonitor.offsetWidth,
            nTop = -1 * this.resizeMonitor.offsetHeight;
        
        this.resizeMonitor.style.top = nTop + "px";
        this.resizeMonitor.style.left =  nLeft + "px";
	
	},

	/**
	* Sets the Module's header content to the HTML specified, or appends the passed element to the header. If no header is present, one will be automatically created.
	* @method setHeader
	* @param {String}	headerContent	The HTML used to set the header <em>OR</em>
	* @param {HTMLElement}	headerContent	The HTMLElement to append to the header
	*/	
	setHeader : function(headerContent) {
		if (! this.header) {
			this.header = document.createElement("DIV");
			this.header.className = YAHOO.widget.Module.CSS_HEADER;
		}
		
		if (typeof headerContent == "string") {
			this.header.innerHTML = headerContent;
		} else {
			this.header.innerHTML = "";
			this.header.appendChild(headerContent);
		}

		this.changeHeaderEvent.fire(headerContent);
		this.changeContentEvent.fire();
	},

	/**
	* Appends the passed element to the header. If no header is present, one will be automatically created.
	* @method appendToHeader
	* @param {HTMLElement}	element	The element to append to the header
	*/	
	appendToHeader : function(element) {
		if (! this.header) {
			this.header = document.createElement("DIV");
			this.header.className = YAHOO.widget.Module.CSS_HEADER;
		}
		
		this.header.appendChild(element);
		this.changeHeaderEvent.fire(element);
		this.changeContentEvent.fire();
	},

	/**
	* Sets the Module's body content to the HTML specified, or appends the passed element to the body. If no body is present, one will be automatically created.
	* @method setBody
	* @param {String}	bodyContent	The HTML used to set the body <em>OR</em>
	* @param {HTMLElement}	bodyContent	The HTMLElement to append to the body
	*/		
	setBody : function(bodyContent) {
		if (! this.body) {
			this.body = document.createElement("DIV");
			this.body.className = YAHOO.widget.Module.CSS_BODY;
		}

		if (typeof bodyContent == "string")
		{
			this.body.innerHTML = bodyContent;
		} else {
			this.body.innerHTML = "";
			this.body.appendChild(bodyContent);
		}

		this.changeBodyEvent.fire(bodyContent);
		this.changeContentEvent.fire();
	},

	/**
	* Appends the passed element to the body. If no body is present, one will be automatically created.
	* @method appendToBody
	* @param {HTMLElement}	element	The element to append to the body
	*/
	appendToBody : function(element) {
		if (! this.body) {
			this.body = document.createElement("DIV");
			this.body.className = YAHOO.widget.Module.CSS_BODY;
		}

		this.body.appendChild(element);
		this.changeBodyEvent.fire(element);
		this.changeContentEvent.fire();
	},

	/**
	* Sets the Module's footer content to the HTML specified, or appends the passed element to the footer. If no footer is present, one will be automatically created.
	* @method setFooter
	* @param {String}	footerContent	The HTML used to set the footer <em>OR</em>
	* @param {HTMLElement}	footerContent	The HTMLElement to append to the footer
	*/	
	setFooter : function(footerContent) {
		if (! this.footer) {
			this.footer = document.createElement("DIV");
			this.footer.className = YAHOO.widget.Module.CSS_FOOTER;
		}

		if (typeof footerContent == "string") {
			this.footer.innerHTML = footerContent;
		} else {
			this.footer.innerHTML = "";
			this.footer.appendChild(footerContent);
		}

		this.changeFooterEvent.fire(footerContent);
		this.changeContentEvent.fire();
	},

	/**
	* Appends the passed element to the footer. If no footer is present, one will be automatically created.
	* @method appendToFooter
	* @param {HTMLElement}	element	The element to append to the footer
	*/
	appendToFooter : function(element) {
		if (! this.footer) {
			this.footer = document.createElement("DIV");
			this.footer.className = YAHOO.widget.Module.CSS_FOOTER;
		}

		this.footer.appendChild(element);
		this.changeFooterEvent.fire(element);
		this.changeContentEvent.fire();
	},

	/**
	* Renders the Module by inserting the elements that are not already in the main Module into their correct places. Optionally appends the Module to the specified node prior to the render's execution. NOTE: For Modules without existing markup, the appendToNode argument is REQUIRED. If this argument is ommitted and the current element is not present in the document, the function will return false, indicating that the render was a failure.
	* @method render
	* @param {String}	appendToNode	The element id to which the Module should be appended to prior to rendering <em>OR</em>
	* @param {HTMLElement}	appendToNode	The element to which the Module should be appended to prior to rendering	
	* @param {HTMLElement}	moduleElement	OPTIONAL. The element that represents the actual Standard Module container. 
	* @return {Boolean} Success or failure of the render
	*/
	render : function(appendToNode, moduleElement) {
		this.beforeRenderEvent.fire();

		if (! moduleElement) {
			moduleElement = this.element;
		}

		var me = this;
		var appendTo = function(element) {
			if (typeof element == "string") {
				element = document.getElementById(element);
			}
			
			if (element) {
				element.appendChild(me.element);
				me.appendEvent.fire();
			}
		};

		if (appendToNode) {
			appendTo(appendToNode);
		} else { // No node was passed in. If the element is not pre-marked up, this fails
			if (! YAHOO.util.Dom.inDocument(this.element)) {
				return false;
			}
		}

		// Need to get everything into the DOM if it isn't already
		
		if (this.header && ! YAHOO.util.Dom.inDocument(this.header)) {
			// There is a header, but it's not in the DOM yet... need to add it
			var firstChild = moduleElement.firstChild;
			if (firstChild) { // Insert before first child if exists
				moduleElement.insertBefore(this.header, firstChild);
			} else { // Append to empty body because there are no children
				moduleElement.appendChild(this.header);
			}
		}

		if (this.body && ! YAHOO.util.Dom.inDocument(this.body)) {
			// There is a body, but it's not in the DOM yet... need to add it
			if (this.footer && YAHOO.util.Dom.isAncestor(this.moduleElement, this.footer)) { // Insert before footer if exists in DOM
				moduleElement.insertBefore(this.body, this.footer);
			} else { // Append to element because there is no footer
				moduleElement.appendChild(this.body);
			}
		}

		if (this.footer && ! YAHOO.util.Dom.inDocument(this.footer)) {
			// There is a footer, but it's not in the DOM yet... need to add it
			moduleElement.appendChild(this.footer);
		}

		this.renderEvent.fire();
		return true;
	},

	/**
	* Removes the Module element from the DOM and sets all child elements to null.
	* @method destroy
	*/
	destroy : function() {
		var parent;

		if (this.element) {
			YAHOO.util.Event.purgeElement(this.element, true);
			parent = this.element.parentNode;
		}
		if (parent) {
			parent.removeChild(this.element);
		}

		this.element = null;
		this.header = null;
		this.body = null;
		this.footer = null;

		for (var e in this) {
			if (e instanceof YAHOO.util.CustomEvent) {
				e.unsubscribeAll();
			}
		}

		YAHOO.widget.Module.textResizeEvent.unsubscribe(this.onDomResize, this);

		this.destroyEvent.fire();
	},

	/**
	* Shows the Module element by setting the visible configuration property to true. Also fires two events: beforeShowEvent prior to the visibility change, and showEvent after.
	* @method show
	*/
	show : function() {
		this.cfg.setProperty("visible", true);
	},

	/**
	* Hides the Module element by setting the visible configuration property to false. Also fires two events: beforeHideEvent prior to the visibility change, and hideEvent after.
	* @method hide
	*/
	hide : function() {
		this.cfg.setProperty("visible", false);
	},

	// BUILT-IN EVENT HANDLERS FOR MODULE //

	/**
	* Default event handler for changing the visibility property of a Module. By default, this is achieved by switching the "display" style between "block" and "none".
	* This method is responsible for firing showEvent and hideEvent.
	* @param {String} type	The CustomEvent type (usually the property name)
	* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
	* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
	* @method configVisible
	*/
	configVisible : function(type, args, obj) {
		var visible = args[0];
		if (visible) {
			this.beforeShowEvent.fire();
			YAHOO.util.Dom.setStyle(this.element, "display", "block");
			this.showEvent.fire();
		} else {
			this.beforeHideEvent.fire();
			YAHOO.util.Dom.setStyle(this.element, "display", "none");
			this.hideEvent.fire();
		}
	},

	/**
	* Default event handler for the "monitorresize" configuration property
	* @param {String} type	The CustomEvent type (usually the property name)
	* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
	* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
	* @method configMonitorResize
	*/
	configMonitorResize : function(type, args, obj) {
		var monitor = args[0];
		if (monitor) {
			this.initResizeMonitor();
		} else {
			YAHOO.widget.Module.textResizeEvent.unsubscribe(this.onDomResize, this, true);
			this.resizeMonitor = null;
		}
	}
};

/**
* Returns a String representation of the Object.
* @method toString
* @return {String}	The string representation of the Module
*/ 
YAHOO.widget.Module.prototype.toString = function() {
	return "Module " + this.id;
};

/**
* Overlay is a Module that is absolutely positioned above the page flow. It has convenience methods for positioning and sizing, as well as options for controlling zIndex and constraining the Overlay's position to the current visible viewport. Overlay also contains a dynamicly generated IFRAME which is placed beneath it for Internet Explorer 6 and 5.x so that it will be properly rendered above SELECT elements.
* @namespace YAHOO.widget
* @class Overlay
* @extends YAHOO.widget.Module
* @param {String}	el	The element ID representing the Overlay <em>OR</em>
* @param {HTMLElement}	el	The element representing the Overlay
* @param {Object}	userConfig	The configuration object literal containing 10/23/2006the configuration that should be set for this Overlay. See configuration documentation for more details.
* @constructor
*/
YAHOO.widget.Overlay = function(el, userConfig) {
	YAHOO.widget.Overlay.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Overlay, YAHOO.widget.Module);

/**
* The URL that will be placed in the iframe
* @property YAHOO.widget.Overlay.IFRAME_SRC
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.IFRAME_SRC = "javascript:false;";

/**
* Constant representing the top left corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.TOP_LEFT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.TOP_LEFT = "tl";

/**
* Constant representing the top right corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.TOP_RIGHT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.TOP_RIGHT = "tr";

/**
* Constant representing the top bottom left corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.BOTTOM_LEFT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.BOTTOM_LEFT = "bl";

/**
* Constant representing the bottom right corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.BOTTOM_RIGHT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.BOTTOM_RIGHT = "br";

/**
* Constant representing the default CSS class used for an Overlay
* @property YAHOO.widget.Overlay.CSS_OVERLAY
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.CSS_OVERLAY = "overlay";

/**
* The Overlay initialization method, which is executed for Overlay and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the Overlay <em>OR</em>
* @param {HTMLElement}	el	The element representing the Overlay
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
*/
YAHOO.widget.Overlay.prototype.init = function(el, userConfig) {
	YAHOO.widget.Overlay.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level
	
	this.beforeInitEvent.fire(YAHOO.widget.Overlay);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Overlay.CSS_OVERLAY);

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	if (this.platform == "mac" && this.browser == "gecko") {
		if (! YAHOO.util.Config.alreadySubscribed(this.showEvent,this.showMacGeckoScrollbars,this)) {
			this.showEvent.subscribe(this.showMacGeckoScrollbars,this,true);
		}
		if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent,this.hideMacGeckoScrollbars,this)) {
			this.hideEvent.subscribe(this.hideMacGeckoScrollbars,this,true);
		}
	}

	this.initEvent.fire(YAHOO.widget.Overlay);
};

/**
* Initializes the custom events for Overlay which are fired automatically at appropriate times by the Overlay class.
* @method initEvents
*/
YAHOO.widget.Overlay.prototype.initEvents = function() {
	YAHOO.widget.Overlay.superclass.initEvents.call(this);

	/**
	* CustomEvent fired before the Overlay is moved.
	* @event beforeMoveEvent
	* @param {Number} x	x coordinate
	* @param {Number} y	y coordinate
	*/
	this.beforeMoveEvent = new YAHOO.util.CustomEvent("beforeMove", this);

	/**
	* CustomEvent fired after the Overlay is moved.
	* @event moveEvent
	* @param {Number} x	x coordinate
	* @param {Number} y	y coordinate
	*/
	this.moveEvent = new YAHOO.util.CustomEvent("move", this);
};

/**
* Initializes the class's configurable properties which can be changed using the Overlay's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Overlay.prototype.initDefaultConfig = function() {
	YAHOO.widget.Overlay.superclass.initDefaultConfig.call(this);

	// Add overlay config properties //

	/**
	* The absolute x-coordinate position of the Overlay
	* @config x
	* @type Number
	* @default null
	*/	
	this.cfg.addProperty("x", { handler:this.configX, validator:this.cfg.checkNumber, suppressEvent:true, supercedes:["iframe"] } );

	/**
	* The absolute y-coordinate position of the Overlay
	* @config y
	* @type Number
	* @default null
	*/	
	this.cfg.addProperty("y", { handler:this.configY, validator:this.cfg.checkNumber, suppressEvent:true, supercedes:["iframe"] } );

	/**
	* An array with the absolute x and y positions of the Overlay
	* @config xy
	* @type Number[]
	* @default null
	*/	
	this.cfg.addProperty("xy",{ handler:this.configXY, suppressEvent:true, supercedes:["iframe"] } );

	/**
	* The array of context arguments for context-sensitive positioning. The format is: [id or element, element corner, context corner]. For example, setting this property to ["img1", "tl", "bl"] would align the Overlay's top left corner to the context element's bottom left corner.
	* @config context
	* @type Array
	* @default null
	*/	
	this.cfg.addProperty("context",	{ handler:this.configContext, suppressEvent:true, supercedes:["iframe"] } );

	/**
	* True if the Overlay should be anchored to the center of the viewport.
	* @config fixedcenter
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty("fixedcenter", { value:false, handler:this.configFixedCenter, validator:this.cfg.checkBoolean, supercedes:["iframe","visible"] } );

	/**
	* CSS width of the Overlay.
	* @config width
	* @type String
	* @default null
	*/
	this.cfg.addProperty("width", { handler:this.configWidth, suppressEvent:true, supercedes:["iframe"] } );

	/**
	* CSS height of the Overlay.
	* @config height
	* @type String
	* @default null
	*/
	this.cfg.addProperty("height", { handler:this.configHeight, suppressEvent:true, supercedes:["iframe"] } );

	/**
	* CSS z-index of the Overlay.
	* @config zIndex
	* @type Number
	* @default null
	*/
	this.cfg.addProperty("zIndex", { value:null, handler:this.configzIndex } );

	/**
	* True if the Overlay should be prevented from being positioned out of the viewport.
	* @config constraintoviewport
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty("constraintoviewport", { value:false, handler:this.configConstrainToViewport, validator:this.cfg.checkBoolean, supercedes:["iframe","x","y","xy"] } );

	/**
	* True if the Overlay should have an IFRAME shim (for correcting the select z-index bug in IE6 and below).
	* @config iframe
	* @type Boolean
	* @default true for IE6 and below, false for all others
	*/
	this.cfg.addProperty("iframe", { value:(this.browser == "ie" ? true : false), handler:this.configIframe, validator:this.cfg.checkBoolean, supercedes:["zIndex"] } );
};

/**
* Moves the Overlay to the specified position. This function is identical to calling this.cfg.setProperty("xy", [x,y]);
* @method moveTo
* @param {Number}	x	The Overlay's new x position
* @param {Number}	y	The Overlay's new y position
*/
YAHOO.widget.Overlay.prototype.moveTo = function(x, y) {
	this.cfg.setProperty("xy",[x,y]);
};

/**
* Adds a special CSS class to the Overlay when Mac/Gecko is in use, to work around a Gecko bug where
* scrollbars cannot be hidden. See https://bugzilla.mozilla.org/show_bug.cgi?id=187435
* @method hideMacGeckoScrollbars
*/
YAHOO.widget.Overlay.prototype.hideMacGeckoScrollbars = function() {
	YAHOO.util.Dom.removeClass(this.element, "show-scrollbars");
	YAHOO.util.Dom.addClass(this.element, "hide-scrollbars");
};

/**
* Removes a special CSS class from the Overlay when Mac/Gecko is in use, to work around a Gecko bug where
* scrollbars cannot be hidden. See https://bugzilla.mozilla.org/show_bug.cgi?id=187435
* @method showMacGeckoScrollbars
*/
YAHOO.widget.Overlay.prototype.showMacGeckoScrollbars = function() {
	YAHOO.util.Dom.removeClass(this.element, "hide-scrollbars");
	YAHOO.util.Dom.addClass(this.element, "show-scrollbars");
};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "visible" property is changed. This method is responsible for firing showEvent and hideEvent.
* @method configVisible
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configVisible = function(type, args, obj) {
	var visible = args[0];

	var currentVis = YAHOO.util.Dom.getStyle(this.element, "visibility");

	if (currentVis == "inherit") { 
		var e = this.element.parentNode;
		while (e.nodeType != 9 && e.nodeType != 11) {
			currentVis = YAHOO.util.Dom.getStyle(e, "visibility");
			if (currentVis != "inherit") { break; }
			e = e.parentNode;
		}
		if (currentVis == "inherit") { 
			currentVis = "visible";
		}
	}
	
	var effect = this.cfg.getProperty("effect");

	var effectInstances = [];
	if (effect) {
		if (effect instanceof Array) {
			for (var i=0;i<effect.length;i++) {
				var eff = effect[i];
				effectInstances[effectInstances.length] = eff.effect(this, eff.duration);
			}
		} else {
			effectInstances[effectInstances.length] = effect.effect(this, effect.duration);
		}
	}

	var isMacGecko = (this.platform == "mac" && this.browser == "gecko");

	if (visible) { // Show
		if (isMacGecko) {
			this.showMacGeckoScrollbars();
		}	

		if (effect) { // Animate in
			if (visible) { // Animate in if not showing
				if (currentVis != "visible" || currentVis === "") {
					this.beforeShowEvent.fire();
					for (var j=0;j<effectInstances.length;j++) {
						var ei = effectInstances[j];
						if (j === 0 && ! YAHOO.util.Config.alreadySubscribed(ei.animateInCompleteEvent,this.showEvent.fire,this.showEvent)) {
							ei.animateInCompleteEvent.subscribe(this.showEvent.fire,this.showEvent,true); // Delegate showEvent until end of animateInComplete
						}
						ei.animateIn();
					}
				}
			}
		} else { // Show
			if (currentVis != "visible" || currentVis === "") {
				this.beforeShowEvent.fire();
				YAHOO.util.Dom.setStyle(this.element, "visibility", "visible");
				this.cfg.refireEvent("iframe");
				this.showEvent.fire();
			}
		}

	} else { // Hide
		if (isMacGecko) {
			this.hideMacGeckoScrollbars();
		}	

		if (effect) { // Animate out if showing
			if (currentVis == "visible") {
				this.beforeHideEvent.fire();
				for (var k=0;k<effectInstances.length;k++) {
					var h = effectInstances[k];
					if (k === 0 && ! YAHOO.util.Config.alreadySubscribed(h.animateOutCompleteEvent,this.hideEvent.fire,this.hideEvent)) {				
						h.animateOutCompleteEvent.subscribe(this.hideEvent.fire,this.hideEvent,true); // Delegate hideEvent until end of animateOutComplete
					}
					h.animateOut();
				}
			} else if (currentVis === "") {
				YAHOO.util.Dom.setStyle(this.element, "visibility", "hidden");
			}
		} else { // Simple hide
			if (currentVis == "visible" || currentVis === "") {
				this.beforeHideEvent.fire();
				YAHOO.util.Dom.setStyle(this.element, "visibility", "hidden");
				this.cfg.refireEvent("iframe");
				this.hideEvent.fire();
			}
		}	
	}
};

/**
* Center event handler used for centering on scroll/resize, but only if the Overlay is visible
* @method doCenterOnDOMEvent
*/
YAHOO.widget.Overlay.prototype.doCenterOnDOMEvent = function() {
	if (this.cfg.getProperty("visible")) {
		this.center();
	}
};

/**
* The default event handler fired when the "fixedcenter" property is changed.
* @method configFixedCenter
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configFixedCenter = function(type, args, obj) {
	var val = args[0];

	if (val) {
		this.center();
			
		if (! YAHOO.util.Config.alreadySubscribed(this.beforeShowEvent, this.center, this)) {
			this.beforeShowEvent.subscribe(this.center, this, true);
		}
		
		if (! YAHOO.util.Config.alreadySubscribed(YAHOO.widget.Overlay.windowResizeEvent, this.doCenterOnDOMEvent, this)) {
			YAHOO.widget.Overlay.windowResizeEvent.subscribe(this.doCenterOnDOMEvent, this, true);
		}

		if (! YAHOO.util.Config.alreadySubscribed(YAHOO.widget.Overlay.windowScrollEvent, this.doCenterOnDOMEvent, this)) {
			YAHOO.widget.Overlay.windowScrollEvent.subscribe( this.doCenterOnDOMEvent, this, true);
		}
	} else {
		YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.doCenterOnDOMEvent, this);
		YAHOO.widget.Overlay.windowScrollEvent.unsubscribe(this.doCenterOnDOMEvent, this);
	}
};

/**
* The default event handler fired when the "height" property is changed.
* @method configHeight
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configHeight = function(type, args, obj) {
	var height = args[0];
	var el = this.element;
	YAHOO.util.Dom.setStyle(el, "height", height);
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "width" property is changed.
* @method configWidth
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configWidth = function(type, args, obj) {
	var width = args[0];
	var el = this.element;
	YAHOO.util.Dom.setStyle(el, "width", width);
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "zIndex" property is changed.
* @method configzIndex
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configzIndex = function(type, args, obj) {
	var zIndex = args[0];

	var el = this.element;

	if (! zIndex) {
		zIndex = YAHOO.util.Dom.getStyle(el, "zIndex");
		if (! zIndex || isNaN(zIndex)) {
			zIndex = 0;
		}
	}

	if (this.iframe) {
		if (zIndex <= 0) {
			zIndex = 1;
		}
		YAHOO.util.Dom.setStyle(this.iframe, "zIndex", (zIndex-1));
	}

	YAHOO.util.Dom.setStyle(el, "zIndex", zIndex);
	this.cfg.setProperty("zIndex", zIndex, true);
};

/**
* The default event handler fired when the "xy" property is changed.
* @method configXY
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configXY = function(type, args, obj) {
	var pos = args[0];
	var x = pos[0];
	var y = pos[1];

	this.cfg.setProperty("x", x);
	this.cfg.setProperty("y", y);

	this.beforeMoveEvent.fire([x,y]);

	x = this.cfg.getProperty("x");
	y = this.cfg.getProperty("y");

	this.cfg.refireEvent("iframe");
	this.moveEvent.fire([x,y]);
};

/**
* The default event handler fired when the "x" property is changed.
* @method configX
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configX = function(type, args, obj) {
	var x = args[0];
	var y = this.cfg.getProperty("y");

	this.cfg.setProperty("x", x, true);
	this.cfg.setProperty("y", y, true);

	this.beforeMoveEvent.fire([x,y]);

	x = this.cfg.getProperty("x");
	y = this.cfg.getProperty("y");

	YAHOO.util.Dom.setX(this.element, x, true);
	
	this.cfg.setProperty("xy", [x, y], true);

	this.cfg.refireEvent("iframe");
	this.moveEvent.fire([x, y]);
};

/**
* The default event handler fired when the "y" property is changed.
* @method configY
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configY = function(type, args, obj) {
	var x = this.cfg.getProperty("x");
	var y = args[0];

	this.cfg.setProperty("x", x, true);
	this.cfg.setProperty("y", y, true);

	this.beforeMoveEvent.fire([x,y]);

	x = this.cfg.getProperty("x");
	y = this.cfg.getProperty("y");

	YAHOO.util.Dom.setY(this.element, y, true);

	this.cfg.setProperty("xy", [x, y], true);

	this.cfg.refireEvent("iframe");
	this.moveEvent.fire([x, y]);
};

/**
* Shows the iframe shim, if it has been enabled
* @method showIframe
*/
YAHOO.widget.Overlay.prototype.showIframe = function() {
	if (this.iframe) {
		this.iframe.style.display = "block";
	}
};

/**
* Hides the iframe shim, if it has been enabled
* @method hideIframe
*/
YAHOO.widget.Overlay.prototype.hideIframe = function() {
	if (this.iframe) {
		this.iframe.style.display = "none";
	}
};

/**
* The default event handler fired when the "iframe" property is changed.
* @method configIframe
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configIframe = function(type, args, obj) {

	var val = args[0];

	if (val) { // IFRAME shim is enabled

		if (! YAHOO.util.Config.alreadySubscribed(this.showEvent, this.showIframe, this)) {
			this.showEvent.subscribe(this.showIframe, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent, this.hideIframe, this)) {
			this.hideEvent.subscribe(this.hideIframe, this, true);
		}

		var x = this.cfg.getProperty("x");
		var y = this.cfg.getProperty("y");

		if (! x || ! y) {
			this.syncPosition();
			x = this.cfg.getProperty("x");
			y = this.cfg.getProperty("y");
		}

		if (! isNaN(x) && ! isNaN(y)) {
			if (! this.iframe) {
				this.iframe = document.createElement("iframe");
				if (this.isSecure) {
					this.iframe.src = YAHOO.widget.Overlay.IFRAME_SRC;
				}
				
				var parent = this.element.parentNode;
				if (parent) {
					parent.appendChild(this.iframe);
				} else {
					document.body.appendChild(this.iframe);
				}

				YAHOO.util.Dom.setStyle(this.iframe, "position", "absolute");
				YAHOO.util.Dom.setStyle(this.iframe, "border", "none");
				YAHOO.util.Dom.setStyle(this.iframe, "margin", "0");
				YAHOO.util.Dom.setStyle(this.iframe, "padding", "0");
				YAHOO.util.Dom.setStyle(this.iframe, "opacity", "0");
				if (this.cfg.getProperty("visible")) {
					this.showIframe();
				} else {
					this.hideIframe();
				}
			}
			
			var iframeDisplay = YAHOO.util.Dom.getStyle(this.iframe, "display");

			if (iframeDisplay == "none") {
				this.iframe.style.display = "block";
			}

			YAHOO.util.Dom.setXY(this.iframe, [x,y]);

			var width = this.element.clientWidth;
			var height = this.element.clientHeight;

			YAHOO.util.Dom.setStyle(this.iframe, "width", (width+2) + "px");
			YAHOO.util.Dom.setStyle(this.iframe, "height", (height+2) + "px");

			if (iframeDisplay == "none") {
				this.iframe.style.display = "none";
			}
		}
	} else {
		if (this.iframe) {
			this.iframe.style.display = "none";
		}
		this.showEvent.unsubscribe(this.showIframe, this);
		this.hideEvent.unsubscribe(this.hideIframe, this);
	}
};


/**
* The default event handler fired when the "constraintoviewport" property is changed.
* @method configConstrainToViewport
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configConstrainToViewport = function(type, args, obj) {
	var val = args[0];
	if (val) {
		if (! YAHOO.util.Config.alreadySubscribed(this.beforeMoveEvent, this.enforceConstraints, this)) {
			this.beforeMoveEvent.subscribe(this.enforceConstraints, this, true);
		}
	} else {
		this.beforeMoveEvent.unsubscribe(this.enforceConstraints, this);
	}
};

/**
* The default event handler fired when the "context" property is changed.
* @method configContext
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configContext = function(type, args, obj) {
	var contextArgs = args[0];

	if (contextArgs) {
		var contextEl = contextArgs[0];
		var elementMagnetCorner = contextArgs[1];
		var contextMagnetCorner = contextArgs[2];

		if (contextEl) {
			if (typeof contextEl == "string") {
				this.cfg.setProperty("context", [document.getElementById(contextEl),elementMagnetCorner,contextMagnetCorner], true);
			}
			
			if (elementMagnetCorner && contextMagnetCorner) {
				this.align(elementMagnetCorner, contextMagnetCorner);
			}
		}	
	}
};


// END BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Aligns the Overlay to its context element using the specified corner points (represented by the constants TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, and BOTTOM_RIGHT.
* @method align
* @param {String} elementAlign		The String representing the corner of the Overlay that should be aligned to the context element
* @param {String} contextAlign		The corner of the context element that the elementAlign corner should stick to.
*/
YAHOO.widget.Overlay.prototype.align = function(elementAlign, contextAlign) {
	var contextArgs = this.cfg.getProperty("context");
	if (contextArgs) {
		var context = contextArgs[0];
		
		var element = this.element;
		var me = this;

		if (! elementAlign) {
			elementAlign = contextArgs[1];
		}

		if (! contextAlign) {
			contextAlign = contextArgs[2];
		}

		if (element && context) {
			var elementRegion = YAHOO.util.Dom.getRegion(element);
			var contextRegion = YAHOO.util.Dom.getRegion(context);

			var doAlign = function(v,h) {
				switch (elementAlign) {
					case YAHOO.widget.Overlay.TOP_LEFT:
						me.moveTo(h,v);
						break;
					case YAHOO.widget.Overlay.TOP_RIGHT:
						me.moveTo(h-element.offsetWidth,v);
						break;
					case YAHOO.widget.Overlay.BOTTOM_LEFT:
						me.moveTo(h,v-element.offsetHeight);
						break;
					case YAHOO.widget.Overlay.BOTTOM_RIGHT:
						me.moveTo(h-element.offsetWidth,v-element.offsetHeight);
						break;
				}
			};

			switch (contextAlign) {
				case YAHOO.widget.Overlay.TOP_LEFT:
					doAlign(contextRegion.top, contextRegion.left);
					break;
				case YAHOO.widget.Overlay.TOP_RIGHT:
					doAlign(contextRegion.top, contextRegion.right);
					break;		
				case YAHOO.widget.Overlay.BOTTOM_LEFT:
					doAlign(contextRegion.bottom, contextRegion.left);
					break;
				case YAHOO.widget.Overlay.BOTTOM_RIGHT:
					doAlign(contextRegion.bottom, contextRegion.right);
					break;
			}
		}
	}
};

/**
* The default event handler executed when the moveEvent is fired, if the "constraintoviewport" is set to true.
* @method enforceConstraints
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.enforceConstraints = function(type, args, obj) {
	var pos = args[0];

	var x = pos[0];
	var y = pos[1];

	var offsetHeight = this.element.offsetHeight;
	var offsetWidth = this.element.offsetWidth;

	var viewPortWidth = YAHOO.util.Dom.getViewportWidth();
	var viewPortHeight = YAHOO.util.Dom.getViewportHeight();

	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollY = document.documentElement.scrollTop || document.body.scrollTop;

	var topConstraint = scrollY + 10;
	var leftConstraint = scrollX + 10;
	var bottomConstraint = scrollY + viewPortHeight - offsetHeight - 10;
	var rightConstraint = scrollX + viewPortWidth - offsetWidth - 10;
	
	if (x < leftConstraint) {
		x = leftConstraint;
	} else if (x > rightConstraint) {
		x = rightConstraint;
	}

	if (y < topConstraint) {
		y = topConstraint;
	} else if (y > bottomConstraint) {
		y = bottomConstraint;
	}

	this.cfg.setProperty("x", x, true);
	this.cfg.setProperty("y", y, true);
	this.cfg.setProperty("xy", [x,y], true);
};

/**
* Centers the container in the viewport.
* @method center
*/
YAHOO.widget.Overlay.prototype.center = function() {
	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollY = document.documentElement.scrollTop || document.body.scrollTop;

	var viewPortWidth = YAHOO.util.Dom.getClientWidth();
	var viewPortHeight = YAHOO.util.Dom.getClientHeight();

	var elementWidth = this.element.offsetWidth;
	var elementHeight = this.element.offsetHeight;

	var x = (viewPortWidth / 2) - (elementWidth / 2) + scrollX;
	var y = (viewPortHeight / 2) - (elementHeight / 2) + scrollY;
		
	this.cfg.setProperty("xy", [parseInt(x, 10), parseInt(y, 10)]);

	this.cfg.refireEvent("iframe");
};

/**
* Synchronizes the Panel's "xy", "x", and "y" properties with the Panel's position in the DOM. This is primarily used to update position information during drag & drop.
* @method syncPosition
*/
YAHOO.widget.Overlay.prototype.syncPosition = function() {
	var pos = YAHOO.util.Dom.getXY(this.element);
	this.cfg.setProperty("x", pos[0], true);
	this.cfg.setProperty("y", pos[1], true);
	this.cfg.setProperty("xy", pos, true);
};

/**
* Event handler fired when the resize monitor element is resized.
* @method onDomResize
* @param {DOMEvent} e	The resize DOM event
* @param {Object} obj	The scope object
*/
YAHOO.widget.Overlay.prototype.onDomResize = function(e, obj) {
	YAHOO.widget.Overlay.superclass.onDomResize.call(this, e, obj);
	var me = this;
	setTimeout(function() {
		me.syncPosition();
		me.cfg.refireEvent("iframe");
		me.cfg.refireEvent("context");
	}, 0);
};

/**
* Removes the Overlay element from the DOM and sets all child elements to null.
* @method destroy
*/
YAHOO.widget.Overlay.prototype.destroy = function() {
	if (this.iframe) {
		this.iframe.parentNode.removeChild(this.iframe);
	}
	
	this.iframe = null;

	YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.doCenterOnDOMEvent, this);
	YAHOO.widget.Overlay.windowScrollEvent.unsubscribe(this.doCenterOnDOMEvent, this);

	YAHOO.widget.Overlay.superclass.destroy.call(this);  
};

/**
* Returns a String representation of the object.
* @method toString
* @return {String} The string representation of the Overlay.
*/ 
YAHOO.widget.Overlay.prototype.toString = function() {
	return "Overlay " + this.id;
};

/**
* A singleton CustomEvent used for reacting to the DOM event for window scroll
* @event YAHOO.widget.Overlay.windowScrollEvent
*/
YAHOO.widget.Overlay.windowScrollEvent = new YAHOO.util.CustomEvent("windowScroll");

/**
* A singleton CustomEvent used for reacting to the DOM event for window resize
* @event YAHOO.widget.Overlay.windowResizeEvent
*/
YAHOO.widget.Overlay.windowResizeEvent = new YAHOO.util.CustomEvent("windowResize");

/**
* The DOM event handler used to fire the CustomEvent for window scroll
* @method YAHOO.widget.Overlay.windowScrollHandler
* @static
* @param {DOMEvent} e The DOM scroll event
*/
YAHOO.widget.Overlay.windowScrollHandler = function(e) {
	if (YAHOO.widget.Module.prototype.browser == "ie" || YAHOO.widget.Module.prototype.browser == "ie7") {
		if (! window.scrollEnd) {
			window.scrollEnd = -1;
		}
		clearTimeout(window.scrollEnd);
		window.scrollEnd = setTimeout(function() { YAHOO.widget.Overlay.windowScrollEvent.fire(); }, 1);
	} else {
		YAHOO.widget.Overlay.windowScrollEvent.fire();
	}
};

/**
* The DOM event handler used to fire the CustomEvent for window resize
* @method YAHOO.widget.Overlay.windowResizeHandler
* @static
* @param {DOMEvent} e The DOM resize event
*/
YAHOO.widget.Overlay.windowResizeHandler = function(e) {
	if (YAHOO.widget.Module.prototype.browser == "ie" || YAHOO.widget.Module.prototype.browser == "ie7") {
		if (! window.resizeEnd) {
			window.resizeEnd = -1;
		}
		clearTimeout(window.resizeEnd);
		window.resizeEnd = setTimeout(function() { YAHOO.widget.Overlay.windowResizeEvent.fire(); }, 100);
	} else {
		YAHOO.widget.Overlay.windowResizeEvent.fire();
	}
};

/**
* A boolean that indicated whether the window resize and scroll events have already been subscribed to.
* @property YAHOO.widget.Overlay._initialized
* @private
* @type Boolean
*/
YAHOO.widget.Overlay._initialized = null;

if (YAHOO.widget.Overlay._initialized === null) {
	YAHOO.util.Event.addListener(window, "scroll", YAHOO.widget.Overlay.windowScrollHandler);
	YAHOO.util.Event.addListener(window, "resize", YAHOO.widget.Overlay.windowResizeHandler);

	YAHOO.widget.Overlay._initialized = true;
}

/**
* OverlayManager is used for maintaining the focus status of multiple Overlays.* @namespace YAHOO.widget
* @namespace YAHOO.widget
* @class OverlayManager
* @constructor
* @param {Array}	overlays	Optional. A collection of Overlays to register with the manager.
* @param {Object}	userConfig		The object literal representing the user configuration of the OverlayManager
*/
YAHOO.widget.OverlayManager = function(userConfig) {
	this.init(userConfig);
};

/**
* The CSS class representing a focused Overlay
* @property YAHOO.widget.OverlayManager.CSS_FOCUSED
* @static
* @final
* @type String
*/
YAHOO.widget.OverlayManager.CSS_FOCUSED = "focused";

YAHOO.widget.OverlayManager.prototype = {
	/**
	* The class's constructor function
	* @property contructor
	* @type Function
	*/
	constructor : YAHOO.widget.OverlayManager,

	/**
	* The array of Overlays that are currently registered
	* @property overlays
	* @type YAHOO.widget.Overlay[]
	*/
	overlays : null,

	/**
	* Initializes the default configuration of the OverlayManager
	* @method initDefaultConfig
	*/	
	initDefaultConfig : function() {
		/**
		* The collection of registered Overlays in use by the OverlayManager
		* @config overlays
		* @type YAHOO.widget.Overlay[]
		* @default null
		*/
		this.cfg.addProperty("overlays", { suppressEvent:true } );

		/**
		* The default DOM event that should be used to focus an Overlay
		* @config focusevent
		* @type String
		* @default "mousedown"
		*/
		this.cfg.addProperty("focusevent", { value:"mousedown" } );
	}, 

	/**
	* Initializes the OverlayManager
	* @method init
	* @param {YAHOO.widget.Overlay[]}	overlays	Optional. A collection of Overlays to register with the manager.
	* @param {Object}	userConfig		The object literal representing the user configuration of the OverlayManager
	*/
	init : function(userConfig) {
		/**
		* The OverlayManager's Config object used for monitoring configuration properties.
		* @property cfg
		* @type YAHOO.util.Config
		*/
		this.cfg = new YAHOO.util.Config(this);

		this.initDefaultConfig();

		if (userConfig) {
			this.cfg.applyConfig(userConfig, true);
		}
		this.cfg.fireQueue();

		/**
		* The currently activated Overlay
		* @property activeOverlay
		* @private
		* @type YAHOO.widget.Overlay
		*/
		var activeOverlay = null;

		/**
		* Returns the currently focused Overlay
		* @method getActive
		* @return {YAHOO.widget.Overlay}	The currently focused Overlay
		*/
		this.getActive = function() {
			return activeOverlay;
		};

		/**
		* Focuses the specified Overlay
		* @method focus
		* @param {YAHOO.widget.Overlay} overlay	The Overlay to focus
		* @param {String} overlay	The id of the Overlay to focus
		*/
		this.focus = function(overlay) {
			var o = this.find(overlay);
			if (o) {
				this.blurAll();
				activeOverlay = o;
				YAHOO.util.Dom.addClass(activeOverlay.element, YAHOO.widget.OverlayManager.CSS_FOCUSED);
				this.overlays.sort(this.compareZIndexDesc);
				var topZIndex = YAHOO.util.Dom.getStyle(this.overlays[0].element, "zIndex");
				if (! isNaN(topZIndex) && this.overlays[0] != overlay) {
					activeOverlay.cfg.setProperty("zIndex", (parseInt(topZIndex, 10) + 2));
				}
				this.overlays.sort(this.compareZIndexDesc);
			}
		};

		/**
		* Removes the specified Overlay from the manager
		* @method remove
		* @param {YAHOO.widget.Overlay}	overlay	The Overlay to remove
		* @param {String} overlay	The id of the Overlay to remove
		*/
		this.remove = function(overlay) {
			var o = this.find(overlay);
			if (o) {
				var originalZ = YAHOO.util.Dom.getStyle(o.element, "zIndex");
				o.cfg.setProperty("zIndex", -1000, true);
				this.overlays.sort(this.compareZIndexDesc);
				this.overlays = this.overlays.slice(0, this.overlays.length-1);
				o.cfg.setProperty("zIndex", originalZ, true);

				o.cfg.setProperty("manager", null);
				o.focusEvent = null;
				o.blurEvent = null;
				o.focus = null;
				o.blur = null;
			}
		};

		/**
		* Removes focus from all registered Overlays in the manager
		* @method blurAll
		*/
		this.blurAll = function() {
			activeOverlay = null;
			for (var o=0;o<this.overlays.length;o++) {
				YAHOO.util.Dom.removeClass(this.overlays[o].element, YAHOO.widget.OverlayManager.CSS_FOCUSED);
			}		
		};

		var overlays = this.cfg.getProperty("overlays");
		
		if (! this.overlays) {
			this.overlays = [];
		}

		if (overlays) {
			this.register(overlays);
			this.overlays.sort(this.compareZIndexDesc);
		}
	},

	/**
	* Registers an Overlay or an array of Overlays with the manager. Upon registration, the Overlay receives functions for focus and blur, along with CustomEvents for each.
	* @method register
	* @param {YAHOO.widget.Overlay}	overlay		An Overlay to register with the manager.
	* @param {YAHOO.widget.Overlay[]}	overlay		An array of Overlays to register with the manager.
	* @return	{Boolean}	True if any Overlays are registered.
	*/
	register : function(overlay) {
		if (overlay instanceof YAHOO.widget.Overlay) {
			overlay.cfg.addProperty("manager", { value:this } );

			overlay.focusEvent = new YAHOO.util.CustomEvent("focus");
			overlay.blurEvent = new YAHOO.util.CustomEvent("blur");
			
			var mgr=this;

			overlay.focus = function() {
				mgr.focus(this);
				this.focusEvent.fire();
			};

			overlay.blur = function() {
				mgr.blurAll();
				this.blurEvent.fire();
			};

			var focusOnDomEvent = function(e,obj) {
				overlay.focus();
			};
			
			var focusevent = this.cfg.getProperty("focusevent");
			YAHOO.util.Event.addListener(overlay.element,focusevent,focusOnDomEvent,this,true);

			var zIndex = YAHOO.util.Dom.getStyle(overlay.element, "zIndex");
			if (! isNaN(zIndex)) {
				overlay.cfg.setProperty("zIndex", parseInt(zIndex, 10));
			} else {
				overlay.cfg.setProperty("zIndex", 0);
			}
			
			this.overlays.push(overlay);
			return true;
		} else if (overlay instanceof Array) {
			var regcount = 0;
			for (var i=0;i<overlay.length;i++) {
				if (this.register(overlay[i])) {
					regcount++;
				}
			}
			if (regcount > 0) {
				return true;
			}
		} else {
			return false;
		}
	},

	/**
	* Attempts to locate an Overlay by instance or ID.
	* @method find
	* @param {YAHOO.widget.Overlay}	overlay		An Overlay to locate within the manager
	* @param {String}	overlay		An Overlay id to locate within the manager
	* @return	{YAHOO.widget.Overlay}	The requested Overlay, if found, or null if it cannot be located.
	*/
	find : function(overlay) {
		if (overlay instanceof YAHOO.widget.Overlay) {
			for (var o=0;o<this.overlays.length;o++) {
				if (this.overlays[o] == overlay) {
					return this.overlays[o];
				}
			}
		} else if (typeof overlay == "string") {
			for (var p=0;p<this.overlays.length;p++) {
				if (this.overlays[p].id == overlay) {
					return this.overlays[p];
				}
			}			
		}
		return null;
	},

	/**
	* Used for sorting the manager's Overlays by z-index.
	* @method compareZIndexDesc
	* @private
	* @return {Number}	0, 1, or -1, depending on where the Overlay should fall in the stacking order.
	*/
	compareZIndexDesc : function(o1, o2) {
		var zIndex1 = o1.cfg.getProperty("zIndex");
		var zIndex2 = o2.cfg.getProperty("zIndex");

		if (zIndex1 > zIndex2) {
			return -1;
		} else if (zIndex1 < zIndex2) {
			return 1;
		} else {
			return 0;
		}
	},

	/**
	* Shows all Overlays in the manager.
	* @method showAll
	*/
	showAll : function() {
		for (var o=0;o<this.overlays.length;o++) {
			this.overlays[o].show();
		}
	},

	/**
	* Hides all Overlays in the manager.
	* @method hideAll
	*/
	hideAll : function() {
		for (var o=0;o<this.overlays.length;o++) {
			this.overlays[o].hide();
		}
	},


	/**
	* Returns a string representation of the object.
	* @method toString
	* @return {String}	The string representation of the OverlayManager
	*/ 
	toString : function() {
		return "OverlayManager";
	}

};

/**
* KeyListener is a utility that provides an easy interface for listening for keydown/keyup events fired against DOM elements.
* @namespace YAHOO.util
* @class KeyListener
* @constructor
* @param {HTMLElement}	attachTo	The element or element ID to which the key event should be attached
* @param {String}	attachTo	The element or element ID to which the key event should be attached
* @param {Object}	keyData		The object literal representing the key(s) to detect. Possible attributes are shift(boolean), alt(boolean), ctrl(boolean) and keys(either an int or an array of ints representing keycodes).
* @param {Function}	handler		The CustomEvent handler to fire when the key event is detected
* @param {Object}	handler		An object literal representing the handler. 
* @param {String}	event		Optional. The event (keydown or keyup) to listen for. Defaults automatically to keydown.
*/
YAHOO.util.KeyListener = function(attachTo, keyData, handler, event) {
	if (! event) {
		event = YAHOO.util.KeyListener.KEYDOWN;
	}

	/**
	* The CustomEvent fired internally when a key is pressed
	* @event keyEvent
	* @private
	* @param {Object}	keyData		The object literal representing the key(s) to detect. Possible attributes are shift(boolean), alt(boolean), ctrl(boolean) and keys(either an int or an array of ints representing keycodes).
	*/
	var keyEvent = new YAHOO.util.CustomEvent("keyPressed");
	
	/**
	* The CustomEvent fired when the KeyListener is enabled via the enable() function
	* @event enabledEvent
	* @param {Object}	keyData		The object literal representing the key(s) to detect. Possible attributes are shift(boolean), alt(boolean), ctrl(boolean) and keys(either an int or an array of ints representing keycodes).
	*/
	this.enabledEvent = new YAHOO.util.CustomEvent("enabled");

	/**
	* The CustomEvent fired when the KeyListener is disabled via the disable() function
	* @event disabledEvent
	* @param {Object}	keyData		The object literal representing the key(s) to detect. Possible attributes are shift(boolean), alt(boolean), ctrl(boolean) and keys(either an int or an array of ints representing keycodes).
	*/
	this.disabledEvent = new YAHOO.util.CustomEvent("disabled");

	if (typeof attachTo == 'string') {
		attachTo = document.getElementById(attachTo);
	}

	if (typeof handler == 'function') {
		keyEvent.subscribe(handler);
	} else {
		keyEvent.subscribe(handler.fn, handler.scope, handler.correctScope);
	}

	/**
	* Handles the key event when a key is pressed.
	* @method handleKeyPress
	* @param {DOMEvent} e	The keypress DOM event
	* @param {Object}	obj	The DOM event scope object
	* @private
	*/
	function handleKeyPress(e, obj) {
		if (! keyData.shift) {	
			keyData.shift = false; 
		}
		if (! keyData.alt) {	
			keyData.alt = false;
		}
		if (! keyData.ctrl) {
			keyData.ctrl = false;
		}

		// check held down modifying keys first
		if (e.shiftKey == keyData.shift && 
			e.altKey   == keyData.alt &&
			e.ctrlKey  == keyData.ctrl) { // if we pass this, all modifiers match
			
			var dataItem;
			var keyPressed;

			if (keyData.keys instanceof Array) {
				for (var i=0;i<keyData.keys.length;i++) {
					dataItem = keyData.keys[i];

					if (dataItem == e.charCode ) {
						keyEvent.fire(e.charCode, e);
						break;
					} else if (dataItem == e.keyCode) {
						keyEvent.fire(e.keyCode, e);
						break;
					}
				}
			} else {
				dataItem = keyData.keys;

				if (dataItem == e.charCode ) {
					keyEvent.fire(e.charCode, e);
				} else if (dataItem == e.keyCode) {
					keyEvent.fire(e.keyCode, e);
				}
			}
		}
	}

	/**
	* Enables the KeyListener by attaching the DOM event listeners to the target DOM element
	* @method enable
	*/
	this.enable = function() {
		if (! this.enabled) {
			YAHOO.util.Event.addListener(attachTo, event, handleKeyPress);
			this.enabledEvent.fire(keyData);
		}
		/**
		* Boolean indicating the enabled/disabled state of the Tooltip
		* @property enabled
		* @type Boolean
		*/
		this.enabled = true;
	};

	/**
	* Disables the KeyListener by removing the DOM event listeners from the target DOM element
	* @method disable
	*/
	this.disable = function() {
		if (this.enabled) {
			YAHOO.util.Event.removeListener(attachTo, event, handleKeyPress);
			this.disabledEvent.fire(keyData);
		}
		this.enabled = false;
	};

	/**
	* Returns a String representation of the object.
	* @method toString
	* @return {String}	The string representation of the KeyListener
	*/ 
	this.toString = function() {
		return "KeyListener [" + keyData.keys + "] " + attachTo.tagName + (attachTo.id ? "[" + attachTo.id + "]" : "");
	};

};

/**
* Constant representing the DOM "keydown" event.
* @property YAHOO.util.KeyListener.KEYDOWN
* @static
* @final
* @type String
*/
YAHOO.util.KeyListener.KEYDOWN = "keydown";

/**
* Constant representing the DOM "keyup" event.
* @property YAHOO.util.KeyListener.KEYUP
* @static
* @final
* @type String
*/
YAHOO.util.KeyListener.KEYUP = "keyup";

/**
* Tooltip is an implementation of Overlay that behaves like an OS tooltip, displaying when the user mouses over a particular element, and disappearing on mouse out.
* @namespace YAHOO.widget
* @class Tooltip
* @extends YAHOO.widget.Overlay
* @constructor
* @param {String}	el	The element ID representing the Tooltip <em>OR</em>
* @param {HTMLElement}	el	The element representing the Tooltip
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
*/
YAHOO.widget.Tooltip = function(el, userConfig) {
	YAHOO.widget.Tooltip.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Tooltip, YAHOO.widget.Overlay);

/**
* Constant representing the Tooltip CSS class
* @property YAHOO.widget.Tooltip.CSS_TOOLTIP
* @static
* @final
* @type String
*/
YAHOO.widget.Tooltip.CSS_TOOLTIP = "tt";

/**
* The Tooltip initialization method. This method is automatically called by the constructor. A Tooltip is automatically rendered by the init method, and it also is set to be invisible by default, and constrained to viewport by default as well.
* @method init
* @param {String}	el	The element ID representing the Tooltip <em>OR</em>
* @param {HTMLElement}	el	The element representing the Tooltip
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Tooltip. See configuration documentation for more details.
*/
YAHOO.widget.Tooltip.prototype.init = function(el, userConfig) {
	if (document.readyState && document.readyState != "complete") {
		var deferredInit = function() {
			this.init(el, userConfig);
		};
		YAHOO.util.Event.addListener(window, "load", deferredInit, this, true);
	} else {
		YAHOO.widget.Tooltip.superclass.init.call(this, el);

		this.beforeInitEvent.fire(YAHOO.widget.Tooltip);

		YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Tooltip.CSS_TOOLTIP);

		if (userConfig) {
			this.cfg.applyConfig(userConfig, true);
		}
		
		this.cfg.queueProperty("visible",false);
		this.cfg.queueProperty("constraintoviewport",true);

		this.setBody("");
		this.render(this.cfg.getProperty("container"));

		this.initEvent.fire(YAHOO.widget.Tooltip);
	}
};

/**
* Initializes the class's configurable properties which can be changed using the Overlay's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Tooltip.prototype.initDefaultConfig = function() {
	YAHOO.widget.Tooltip.superclass.initDefaultConfig.call(this);

	/**
	* Specifies whether the Tooltip should be kept from overlapping its context element.
	* @config preventoverlap
	* @type Boolean
	* @default true
	*/
	this.cfg.addProperty("preventoverlap",		{ value:true, validator:this.cfg.checkBoolean, supercedes:["x","y","xy"] } );

	/**
	* The number of milliseconds to wait before showing a Tooltip on mouseover.
	* @config showdelay
	* @type Number
	* @default 200
	*/
	this.cfg.addProperty("showdelay",			{ value:200, handler:this.configShowDelay, validator:this.cfg.checkNumber } );
	
	/**
	* The number of milliseconds to wait before automatically dismissing a Tooltip after the mouse has been resting on the context element.
	* @config autodismissdelay
	* @type Number
	* @default 5000
	*/
	this.cfg.addProperty("autodismissdelay",	{ value:5000, handler:this.configAutoDismissDelay, validator:this.cfg.checkNumber } );
	
	/**
	* The number of milliseconds to wait before hiding a Tooltip on mouseover.
	* @config hidedelay
	* @type Number
	* @default 250
	*/
	this.cfg.addProperty("hidedelay",			{ value:250, handler:this.configHideDelay, validator:this.cfg.checkNumber } );

	/**
	* Specifies the Tooltip's text.
	* @config text
	* @type String
	* @default null
	*/
	this.cfg.addProperty("text",				{ handler:this.configText, suppressEvent:true } );
	
	/**
	* Specifies the container element that the Tooltip's markup should be rendered into.
	* @config container
	* @type HTMLElement/String
	* @default document.body
	*/
	this.cfg.addProperty("container",			{ value:document.body, handler:this.configContainer } );

	/**
	* Specifies the element or elements that the Tooltip should be anchored to on mouseover.
	* @config context
	* @type HTMLElement[]/String[]
	* @default null
	*/

};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "text" property is changed.
* @method configText
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Tooltip.prototype.configText = function(type, args, obj) {
	var text = args[0];
	if (text) {
		this.setBody(text);
	}
};

/**
* The default event handler fired when the "container" property is changed.
* @method configContainer
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Tooltip.prototype.configContainer = function(type, args, obj) {
	var container = args[0];
	if (typeof container == 'string') {
		this.cfg.setProperty("container", document.getElementById(container), true);
	}
};

/**
* The default event handler fired when the "context" property is changed.
* @method configContext
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Tooltip.prototype.configContext = function(type, args, obj) {
	var context = args[0];
	if (context) {
		
		// Normalize parameter into an array
		if (! (context instanceof Array)) {
			if (typeof context == "string") {
				this.cfg.setProperty("context", [document.getElementById(context)], true);
			} else { // Assuming this is an element
				this.cfg.setProperty("context", [context], true);
			}
			context = this.cfg.getProperty("context");
		}


		// Remove any existing mouseover/mouseout listeners
		if (this._context) {
			for (var c=0;c<this._context.length;++c) {
				var el = this._context[c];
				YAHOO.util.Event.removeListener(el, "mouseover", this.onContextMouseOver);
				YAHOO.util.Event.removeListener(el, "mousemove", this.onContextMouseMove);
				YAHOO.util.Event.removeListener(el, "mouseout", this.onContextMouseOut);
			}
		}

		// Add mouseover/mouseout listeners to context elements
		this._context = context;
		for (var d=0;d<this._context.length;++d) {
			var el2 = this._context[d];
			YAHOO.util.Event.addListener(el2, "mouseover", this.onContextMouseOver, this);
			YAHOO.util.Event.addListener(el2, "mousemove", this.onContextMouseMove, this);
			YAHOO.util.Event.addListener(el2, "mouseout", this.onContextMouseOut, this);
		}
	}
};

// END BUILT-IN PROPERTY EVENT HANDLERS //

// BEGIN BUILT-IN DOM EVENT HANDLERS //

/**
* The default event handler fired when the user moves the mouse while over the context element.
* @method onContextMouseMove
* @param {DOMEvent} e	The current DOM event
* @param {Object}	obj	The object argument
*/
YAHOO.widget.Tooltip.prototype.onContextMouseMove = function(e, obj) {
	obj.pageX = YAHOO.util.Event.getPageX(e);
	obj.pageY = YAHOO.util.Event.getPageY(e);

};

/**
* The default event handler fired when the user mouses over the context element.
* @method onContextMouseOver
* @param {DOMEvent} e	The current DOM event
* @param {Object}	obj	The object argument
*/
YAHOO.widget.Tooltip.prototype.onContextMouseOver = function(e, obj) {

	if (obj.hideProcId) {
		clearTimeout(obj.hideProcId);
		obj.hideProcId = null;
	}
	
	var context = this;
	YAHOO.util.Event.addListener(context, "mousemove", obj.onContextMouseMove, obj);

	if (context.title) {
		obj._tempTitle = context.title;
		context.title = "";
	}

	/**
	* The unique process ID associated with the thread responsible for showing the Tooltip.
	* @type int
	*/
	obj.showProcId = obj.doShow(e, context);
};

/**
* The default event handler fired when the user mouses out of the context element.
* @method onContextMouseOut
* @param {DOMEvent} e	The current DOM event
* @param {Object}	obj	The object argument
*/
YAHOO.widget.Tooltip.prototype.onContextMouseOut = function(e, obj) {
	var el = this;

	if (obj._tempTitle) {
		el.title = obj._tempTitle;
		obj._tempTitle = null;
	}
	
	if (obj.showProcId) {
		clearTimeout(obj.showProcId);
		obj.showProcId = null;
	}

	if (obj.hideProcId) {
		clearTimeout(obj.hideProcId);
		obj.hideProcId = null;
	}


	obj.hideProcId = setTimeout(function() {
				obj.hide();
				}, obj.cfg.getProperty("hidedelay"));
};

// END BUILT-IN DOM EVENT HANDLERS //

/**
* Processes the showing of the Tooltip by setting the timeout delay and offset of the Tooltip.
* @method doShow
* @param {DOMEvent} e	The current DOM event
* @return {Number}	The process ID of the timeout function associated with doShow
*/
YAHOO.widget.Tooltip.prototype.doShow = function(e, context) {
	
	var yOffset = 25;
	if (this.browser == "opera" && context.tagName == "A") {
		yOffset += 12;
	}

	var me = this;
	return setTimeout(
		function() {
			if (me._tempTitle) {
				me.setBody(me._tempTitle);
			} else {
				me.cfg.refireEvent("text");
			}

			me.moveTo(me.pageX, me.pageY + yOffset);
			if (me.cfg.getProperty("preventoverlap")) {
				me.preventOverlap(me.pageX, me.pageY);
			}
			
			YAHOO.util.Event.removeListener(context, "mousemove", me.onContextMouseMove);

			me.show();
			me.hideProcId = me.doHide();
		},
	this.cfg.getProperty("showdelay"));
};

/**
* Sets the timeout for the auto-dismiss delay, which by default is 5 seconds, meaning that a tooltip will automatically dismiss itself after 5 seconds of being displayed.
* @method doHide
*/
YAHOO.widget.Tooltip.prototype.doHide = function() {
	var me = this;
	return setTimeout(
		function() {
			me.hide();
		},
		this.cfg.getProperty("autodismissdelay"));
};

/**
* Fired when the Tooltip is moved, this event handler is used to prevent the Tooltip from overlapping with its context element.
* @method preventOverlay
* @param {Number} pageX	The x coordinate position of the mouse pointer
* @param {Number} pageY	The y coordinate position of the mouse pointer
*/
YAHOO.widget.Tooltip.prototype.preventOverlap = function(pageX, pageY) {
	
	var height = this.element.offsetHeight;
	
	var elementRegion = YAHOO.util.Dom.getRegion(this.element);

	elementRegion.top -= 5;
	elementRegion.left -= 5;
	elementRegion.right += 5;
	elementRegion.bottom += 5;

	var mousePoint = new YAHOO.util.Point(pageX, pageY);
	
	if (elementRegion.contains(mousePoint)) {
		this.cfg.setProperty("y", (pageY-height-5));
	}
};

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the Tooltip
*/ 
YAHOO.widget.Tooltip.prototype.toString = function() {
	return "Tooltip " + this.id;
};

/**
* Panel is an implementation of Overlay that behaves like an OS window, with a draggable header and an optional close icon at the top right.
* @namespace YAHOO.widget
* @class Panel
* @extends YAHOO.widget.Overlay
* @constructor
* @param {String}	el	The element ID representing the Panel <em>OR</em>
* @param {HTMLElement}	el	The element representing the Panel
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Panel. See configuration documentation for more details.
*/
YAHOO.widget.Panel = function(el, userConfig) {
	YAHOO.widget.Panel.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Panel, YAHOO.widget.Overlay);

/**
* Constant representing the default CSS class used for a Panel
* @property YAHOO.widget.Panel.CSS_PANEL
* @static
* @final
* @type String
*/
YAHOO.widget.Panel.CSS_PANEL = "panel";

/**
* Constant representing the default CSS class used for a Panel's wrapping container
* @property YAHOO.widget.Panel.CSS_PANEL_CONTAINER
* @static
* @final
* @type String
*/
YAHOO.widget.Panel.CSS_PANEL_CONTAINER = "panel-container";

/**
* The Overlay initialization method, which is executed for Overlay and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the Overlay <em>OR</em>
* @param {HTMLElement}	el	The element representing the Overlay
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
*/
YAHOO.widget.Panel.prototype.init = function(el, userConfig) {
	YAHOO.widget.Panel.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level
	
	this.beforeInitEvent.fire(YAHOO.widget.Panel);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Panel.CSS_PANEL);

	this.buildWrapper();			
	
	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	this.beforeRenderEvent.subscribe(function() {
		var draggable = this.cfg.getProperty("draggable");
		if (draggable) {
			if (! this.header) {
				this.setHeader("&#160;");
			}
		}
	}, this, true);

	var me = this;

	var doBlur = function() {
		this.blur();
	};

	this.showMaskEvent.subscribe(function() {
		var checkFocusable = function(el) {
			if ((el.tagName == "A" || el.tagName == "BUTTON" || el.tagName == "SELECT" || el.tagName == "INPUT" || el.tagName == "TEXTAREA") && el.type != "hidden") {
				if (! YAHOO.util.Dom.isAncestor(me.element, el)) {
					YAHOO.util.Event.addListener(el, "focus", doBlur, el, true);
					return true;
				}
			} else {
				return false;
			}
		};
		
		this.focusableElements = YAHOO.util.Dom.getElementsBy(checkFocusable);
	}, this, true);

	this.hideMaskEvent.subscribe(function() {
		for (var i=0;i<this.focusableElements.length;i++) {
			var el2 = this.focusableElements[i];
			YAHOO.util.Event.removeListener(el2, "focus", doBlur);
		}
	}, this, true);

	this.beforeShowEvent.subscribe(function() {
		this.cfg.refireEvent("underlay");
	}, this, true);

	this.initEvent.fire(YAHOO.widget.Panel);
};

/**
* Initializes the custom events for Module which are fired automatically at appropriate times by the Module class.
*/
YAHOO.widget.Panel.prototype.initEvents = function() {
	YAHOO.widget.Panel.superclass.initEvents.call(this);

	/**
	* CustomEvent fired after the modality mask is shown
	* @event showMaskEvent
	*/
	this.showMaskEvent = new YAHOO.util.CustomEvent("showMask");

	/**
	* CustomEvent fired after the modality mask is hidden
	* @event hideMaskEvent
	*/
	this.hideMaskEvent = new YAHOO.util.CustomEvent("hideMask");

	/**
	* CustomEvent when the Panel is dragged
	* @event dragEvent
	*/
	this.dragEvent = new YAHOO.util.CustomEvent("drag");
};

/**
* Initializes the class's configurable properties which can be changed using the Panel's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Panel.prototype.initDefaultConfig = function() {
	YAHOO.widget.Panel.superclass.initDefaultConfig.call(this);

	// Add panel config properties //

	/**
	* True if the Panel should display a "close" button
	* @config close
	* @type Boolean
	* @default true
	*/	
	this.cfg.addProperty("close", { value:true, handler:this.configClose, validator:this.cfg.checkBoolean, supercedes:["visible"] } );

	/**
	* True if the Panel should be draggable
	* @config draggable
	* @type Boolean
	* @default true
	*/	
	this.cfg.addProperty("draggable", { value:true,	handler:this.configDraggable, validator:this.cfg.checkBoolean, supercedes:["visible"] } );

	/**
	* Sets the type of underlay to display for the Panel. Valid values are "shadow", "matte", and "none".
	* @config underlay
	* @type String
	* @default shadow
	*/
	this.cfg.addProperty("underlay", { value:"shadow", handler:this.configUnderlay, supercedes:["visible"] } );

	/**
	* True if the Panel should be displayed in a modal fashion, automatically creating a transparent mask over the document that will not be removed until the Panel is dismissed.
	* @config modal
	* @type Boolean
	* @default false
	*/	
	this.cfg.addProperty("modal",	{ value:false, handler:this.configModal, validator:this.cfg.checkBoolean, supercedes:["visible"] } );

	/**
	* A KeyListener (or array of KeyListeners) that will be enabled when the Panel is shown, and disabled when the Panel is hidden.
	* @config keylisteners
	* @type YAHOO.util.KeyListener[]
	* @default null
	*/	
	this.cfg.addProperty("keylisteners", { handler:this.configKeyListeners, suppressEvent:true, supercedes:["visible"] } );
};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "close" property is changed. The method controls the appending or hiding of the close icon at the top right of the Panel.
* @method configClose
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configClose = function(type, args, obj) {
	var val = args[0];

	var doHide = function(e, obj) {
		obj.hide();
	};

	if (val) {
		if (! this.close) {
			this.close = document.createElement("DIV");
			YAHOO.util.Dom.addClass(this.close, "close");

			if (this.isSecure) {
				YAHOO.util.Dom.addClass(this.close, "secure");
			} else {
				YAHOO.util.Dom.addClass(this.close, "nonsecure");
			}

			this.close.innerHTML = "&#160;";
			this.innerElement.appendChild(this.close);
			YAHOO.util.Event.addListener(this.close, "click", doHide, this);	
		} else {
			this.close.style.display = "block";
		}
	} else {
		if (this.close) {
			this.close.style.display = "none";
		}
	}
};

/**
* The default event handler fired when the "draggable" property is changed.
* @method configDraggable
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configDraggable = function(type, args, obj) {
	var val = args[0];
	if (val) {
		if (this.header) {
			YAHOO.util.Dom.setStyle(this.header,"cursor","move");
			this.registerDragDrop();
		}
	} else {
		if (this.dd) {
			this.dd.unreg();
		}
		if (this.header) {
			YAHOO.util.Dom.setStyle(this.header,"cursor","auto");
		}
	}
};

/**
* The default event handler fired when the "underlay" property is changed.
* @method configUnderlay
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configUnderlay = function(type, args, obj) {
	var val = args[0];

	switch (val.toLowerCase()) {
		case "shadow":
			YAHOO.util.Dom.removeClass(this.element, "matte");
			YAHOO.util.Dom.addClass(this.element, "shadow");

			if (! this.underlay) { // create if not already in DOM
				this.underlay = document.createElement("DIV");
				this.underlay.className = "underlay";
				this.underlay.innerHTML = "&#160;";
				this.element.appendChild(this.underlay);
			} 

			this.sizeUnderlay();
			break;
		case "matte":
			YAHOO.util.Dom.removeClass(this.element, "shadow");
			YAHOO.util.Dom.addClass(this.element, "matte");
			break;
		default:
			YAHOO.util.Dom.removeClass(this.element, "shadow");
			YAHOO.util.Dom.removeClass(this.element, "matte");
			break;
	}
};

/**
* The default event handler fired when the "modal" property is changed. This handler subscribes or unsubscribes to the show and hide events to handle the display or hide of the modality mask.
* @method configModal
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configModal = function(type, args, obj) {
	var modal = args[0];

	if (modal) {
		this.buildMask();

		if (! YAHOO.util.Config.alreadySubscribed( this.beforeShowEvent, this.showMask, this ) ) {
			this.beforeShowEvent.subscribe(this.showMask, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed( this.hideEvent, this.hideMask, this) ) {
			this.hideEvent.subscribe(this.hideMask, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed( YAHOO.widget.Overlay.windowResizeEvent, this.sizeMask, this ) ) {
			YAHOO.widget.Overlay.windowResizeEvent.subscribe(this.sizeMask, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed( this.destroyEvent, this.removeMask, this) ) {
			this.destroyEvent.subscribe(this.removeMask, this, true);
		}

		this.cfg.refireEvent("zIndex");
	} else {
		this.beforeShowEvent.unsubscribe(this.showMask, this);
		this.hideEvent.unsubscribe(this.hideMask, this);
		YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.sizeMask, this);
		this.destroyEvent.unsubscribe(this.removeMask, this);
	}
};

/**
* Removes the modality mask.
* @method removeMask
*/
YAHOO.widget.Panel.prototype.removeMask = function() {
	if (this.mask) {
		if (this.mask.parentNode) {
			this.mask.parentNode.removeChild(this.mask);
		}
		this.mask = null;
	}
};

/**
* The default event handler fired when the "keylisteners" property is changed.
* @method configKeyListeners
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configKeyListeners = function(type, args, obj) {
	var listeners = args[0];

	if (listeners) {
		if (listeners instanceof Array) {
			for (var i=0;i<listeners.length;i++) {
				var listener = listeners[i];

				if (! YAHOO.util.Config.alreadySubscribed(this.showEvent, listener.enable, listener)) {
					this.showEvent.subscribe(listener.enable, listener, true);
				}
				if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent, listener.disable, listener)) {
					this.hideEvent.subscribe(listener.disable, listener, true);
					this.destroyEvent.subscribe(listener.disable, listener, true);
				}
			}
		} else {
			if (! YAHOO.util.Config.alreadySubscribed(this.showEvent, listeners.enable, listeners)) {
				this.showEvent.subscribe(listeners.enable, listeners, true);
			}
			if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent, listeners.disable, listeners)) {
				this.hideEvent.subscribe(listeners.disable, listeners, true);
				this.destroyEvent.subscribe(listeners.disable, listeners, true); 
			}
		}
	} 
};

/**
* The default event handler fired when the "height" property is changed.
* @method configHeight
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configHeight = function(type, args, obj) {
	var height = args[0];
	var el = this.innerElement;
	YAHOO.util.Dom.setStyle(el, "height", height);
	this.cfg.refireEvent("underlay");
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "width" property is changed.
* @method configWidth
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configWidth = function(type, args, obj) {
	var width = args[0];
	var el = this.innerElement;
	YAHOO.util.Dom.setStyle(el, "width", width);
	this.cfg.refireEvent("underlay");
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "zIndex" property is changed.
* @method configzIndex
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configzIndex = function(type, args, obj) {
	YAHOO.widget.Panel.superclass.configzIndex.call(this, type, args, obj);
	
	var maskZ = 0;
	var currentZ = YAHOO.util.Dom.getStyle(this.element, "zIndex");
	
	if (this.mask) {
		if (! currentZ || isNaN(currentZ)) {
			currentZ = 0;
		}

		if (currentZ === 0) {
			this.cfg.setProperty("zIndex", 1);
		} else {
			maskZ = currentZ - 1;
			YAHOO.util.Dom.setStyle(this.mask, "zIndex", maskZ);
		}

	}
};

// END BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Builds the wrapping container around the Panel that is used for positioning the shadow and matte underlays. The container element is assigned to a  local instance variable called container, and the element is reinserted inside of it.
* @method buildWrapper
*/
YAHOO.widget.Panel.prototype.buildWrapper = function() {
	var elementParent = this.element.parentNode;
	var originalElement = this.element;
	
	var wrapper = document.createElement("DIV");
	wrapper.className = YAHOO.widget.Panel.CSS_PANEL_CONTAINER;
	wrapper.id = originalElement.id + "_c";
	
	if (elementParent) {
		elementParent.insertBefore(wrapper, originalElement);
	}

	wrapper.appendChild(originalElement);

	this.element = wrapper;
	this.innerElement = originalElement;

	YAHOO.util.Dom.setStyle(this.innerElement, "visibility", "inherit");
};

/**
* Adjusts the size of the shadow based on the size of the element.
* @method sizeUnderlay
*/
YAHOO.widget.Panel.prototype.sizeUnderlay = function() {
	if (this.underlay && this.browser != "gecko" && this.browser != "safari") {
		this.underlay.style.width = this.innerElement.offsetWidth + "px";
		this.underlay.style.height = this.innerElement.offsetHeight + "px";
	}
};

/**
* Event handler fired when the resize monitor element is resized.
* @method onDomResize
* @param {DOMEvent} e	The resize DOM event
* @param {Object} obj	The scope object
*/
YAHOO.widget.Panel.prototype.onDomResize = function(e, obj) { 
	YAHOO.widget.Panel.superclass.onDomResize.call(this, e, obj);
	var me = this;
	setTimeout(function() {
		me.sizeUnderlay();
	}, 0);
};

/**
* Registers the Panel's header for drag & drop capability.
* @method registerDragDrop
*/
YAHOO.widget.Panel.prototype.registerDragDrop = function() {
	if (this.header) {
		this.dd = new YAHOO.util.DD(this.element.id, this.id);

		if (! this.header.id) {
			this.header.id = this.id + "_h";
		}
		
		var me = this;

		this.dd.startDrag = function() {

			if (me.browser == "ie") {
				YAHOO.util.Dom.addClass(me.element,"drag");
			}

			if (me.cfg.getProperty("constraintoviewport")) {
				var offsetHeight = me.element.offsetHeight;
				var offsetWidth = me.element.offsetWidth;

				var viewPortWidth = YAHOO.util.Dom.getViewportWidth();
				var viewPortHeight = YAHOO.util.Dom.getViewportHeight();

				var scrollX = window.scrollX || document.documentElement.scrollLeft;
				var scrollY = window.scrollY || document.documentElement.scrollTop;

				var topConstraint = scrollY + 10;
				var leftConstraint = scrollX + 10;
				var bottomConstraint = scrollY + viewPortHeight - offsetHeight - 10;
				var rightConstraint = scrollX + viewPortWidth - offsetWidth - 10;

				this.minX = leftConstraint;
				this.maxX = rightConstraint;
				this.constrainX = true;

				this.minY = topConstraint;
				this.maxY = bottomConstraint;
				this.constrainY = true;
			} else {
				this.constrainX = false;
				this.constrainY = false;
			}

			me.dragEvent.fire("startDrag", arguments);
		};
		
		this.dd.onDrag = function() {
			me.syncPosition();
			me.cfg.refireEvent("iframe");
			if (this.platform == "mac" && this.browser == "gecko") {
				this.showMacGeckoScrollbars();
			}

			me.dragEvent.fire("onDrag", arguments);
		};

		this.dd.endDrag = function() {
			if (me.browser == "ie") {
				YAHOO.util.Dom.removeClass(me.element,"drag");
			}

			me.dragEvent.fire("endDrag", arguments);
		};

		this.dd.setHandleElId(this.header.id);
		this.dd.addInvalidHandleType("INPUT");
		this.dd.addInvalidHandleType("SELECT");
		this.dd.addInvalidHandleType("TEXTAREA");
	}
};

/**
* Builds the mask that is laid over the document when the Panel is configured to be modal.
* @method buildMask
*/
YAHOO.widget.Panel.prototype.buildMask = function() {
	if (! this.mask) {
		this.mask = document.createElement("DIV");
		this.mask.id = this.id + "_mask";
		this.mask.className = "mask";
		this.mask.innerHTML = "&#160;";

		var maskClick = function(e, obj) {
			YAHOO.util.Event.stopEvent(e);
		};

		var firstChild = document.body.firstChild;
		if (firstChild)	{
			document.body.insertBefore(this.mask, document.body.firstChild);
		} else {
			document.body.appendChild(this.mask);
		}
	}
};

/**
* Hides the modality mask.
* @method hideMask
*/
YAHOO.widget.Panel.prototype.hideMask = function() {
	if (this.cfg.getProperty("modal") && this.mask) {
		this.mask.style.display = "none";
		this.hideMaskEvent.fire();
		YAHOO.util.Dom.removeClass(document.body, "masked");
	}
};

/**
* Shows the modality mask.
* @method showMask
*/
YAHOO.widget.Panel.prototype.showMask = function() {
	if (this.cfg.getProperty("modal") && this.mask) {
		YAHOO.util.Dom.addClass(document.body, "masked");
		this.sizeMask();
		this.mask.style.display = "block";
		this.showMaskEvent.fire();
	}
};

/**
* Sets the size of the modality mask to cover the entire scrollable area of the document
* @method sizeMask
*/
YAHOO.widget.Panel.prototype.sizeMask = function() {
	if (this.mask) {
		this.mask.style.height = YAHOO.util.Dom.getDocumentHeight()+"px";
		this.mask.style.width = YAHOO.util.Dom.getDocumentWidth()+"px";
	}
};

/**
* Renders the Panel by inserting the elements that are not already in the main Panel into their correct places. Optionally appends the Panel to the specified node prior to the render's execution. NOTE: For Panels without existing markup, the appendToNode argument is REQUIRED. If this argument is ommitted and the current element is not present in the document, the function will return false, indicating that the render was a failure.
* @method render
* @param {String}	appendToNode	The element id to which the Module should be appended to prior to rendering <em>OR</em>
* @param {HTMLElement}	appendToNode	The element to which the Module should be appended to prior to rendering	
* @return {boolean} Success or failure of the render
*/
YAHOO.widget.Panel.prototype.render = function(appendToNode) {
	return YAHOO.widget.Panel.superclass.render.call(this, appendToNode, this.innerElement);
};

/**
* Returns a String representation of the object.
* @method toString
* @return {String} The string representation of the Panel.
*/ 
YAHOO.widget.Panel.prototype.toString = function() {
	return "Panel " + this.id;
};

/**
* Dialog is an implementation of Panel that can be used to submit form data. Built-in functionality for buttons with event handlers is included, and button sets can be build dynamically, or the preincluded ones for Submit/Cancel and OK/Cancel can be utilized. Forms can be processed in 3 ways -- via an asynchronous Connection utility call, a simple form POST or GET, or manually.
* @namespace YAHOO.widget
* @class Dialog
* @extends YAHOO.widget.Panel
* @constructor
* @param {String}	el	The element ID representing the Dialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the Dialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Dialog. See configuration documentation for more details.
*/
YAHOO.widget.Dialog = function(el, userConfig) {
	YAHOO.widget.Dialog.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Dialog, YAHOO.widget.Panel);

/**
* Constant representing the default CSS class used for a Dialog
* @property YAHOO.widget.Dialog.CSS_DIALOG
* @static
* @final
* @type String
*/
YAHOO.widget.Dialog.CSS_DIALOG = "dialog";

/**
* Initializes the class's configurable properties which can be changed using the Dialog's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Dialog.prototype.initDefaultConfig = function() {
	YAHOO.widget.Dialog.superclass.initDefaultConfig.call(this);

	/**
	* The internally maintained callback object for use with the Connection utility
	* @property callback
	* @type Object
	*/
	this.callback = {
		/**
		* The function to execute upon success of the Connection submission
		* @property callback.success
		* @type Function
		*/
		success : null,
		/**
		* The function to execute upon failure of the Connection submission
		* @property callback.failure
		* @type Function
		*/
		failure : null,
		/**
		* The arbitraty argument or arguments to pass to the Connection callback functions
		* @property callback.argument
		* @type Object
		*/
		argument: null
	};

	// Add form dialog config properties //
	
	/**
	* The method to use for posting the Dialog's form. Possible values are "async", "form", and "manual".
	* @config postmethod 
	* @type String
	* @default async
	*/
	this.cfg.addProperty("postmethod", { value:"async", handler:this.configPostMethod, validator:function(val) { 
													if (val != "form" && val != "async" && val != "none" && val != "manual") {
														return false;
													} else {
														return true;
													}
												} });

	/**
	* Object literal(s) defining the buttons for the Dialog's footer.
	* @config buttons
	* @type Object[]
	* @default "none"
	*/
	this.cfg.addProperty("buttons",		{ value:"none",	handler:this.configButtons } );
};

/**
* Initializes the custom events for Dialog which are fired automatically at appropriate times by the Dialog class.
* @method initEvents
*/
YAHOO.widget.Dialog.prototype.initEvents = function() {
	YAHOO.widget.Dialog.superclass.initEvents.call(this);

	/**
	* CustomEvent fired prior to submission
	* @event beforeSumitEvent
	*/	
	this.beforeSubmitEvent	= new YAHOO.util.CustomEvent("beforeSubmit");
	
	/**
	* CustomEvent fired after submission
	* @event submitEvent
	*/
	this.submitEvent		= new YAHOO.util.CustomEvent("submit");

	/**
	* CustomEvent fired prior to manual submission
	* @event manualSubmitEvent
	*/
	this.manualSubmitEvent	= new YAHOO.util.CustomEvent("manualSubmit");

	/**
	* CustomEvent fired prior to asynchronous submission
	* @event asyncSubmitEvent
	*/	
	this.asyncSubmitEvent	= new YAHOO.util.CustomEvent("asyncSubmit");

	/**
	* CustomEvent fired prior to form-based submission
	* @event formSubmitEvent
	*/
	this.formSubmitEvent	= new YAHOO.util.CustomEvent("formSubmit");

	/**
	* CustomEvent fired after cancel
	* @event cancelEvent
	*/
	this.cancelEvent		= new YAHOO.util.CustomEvent("cancel");
};

/**
* The Dialog initialization method, which is executed for Dialog and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the Dialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the Dialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Dialog. See configuration documentation for more details.
*/
YAHOO.widget.Dialog.prototype.init = function(el, userConfig) {
	YAHOO.widget.Dialog.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level
	
	this.beforeInitEvent.fire(YAHOO.widget.Dialog);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Dialog.CSS_DIALOG);

	this.cfg.setProperty("visible", false);

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	this.showEvent.subscribe(this.focusFirst, this, true);
	this.beforeHideEvent.subscribe(this.blurButtons, this, true);

	this.beforeRenderEvent.subscribe(function() {
		var buttonCfg = this.cfg.getProperty("buttons");
		if (buttonCfg && buttonCfg != "none") {
			if (! this.footer) {
				this.setFooter("");
			}
		}
	}, this, true);

	this.initEvent.fire(YAHOO.widget.Dialog);
};

/**
* Performs the submission of the Dialog form depending on the value of "postmethod" property.
* @method doSubmit
*/
YAHOO.widget.Dialog.prototype.doSubmit = function() {
	var pm = this.cfg.getProperty("postmethod");
	switch (pm) {
		case "async":
			var method = this.form.getAttribute("method") || 'POST';
			method = method.toUpperCase();
			YAHOO.util.Connect.setForm(this.form);
			var cObj = YAHOO.util.Connect.asyncRequest(method, this.form.getAttribute("action"), this.callback);
			this.asyncSubmitEvent.fire();
			break;
		case "form":
			this.form.submit();
			this.formSubmitEvent.fire();
			break;
		case "none":
		case "manual":
			this.manualSubmitEvent.fire();
			break;
	}
};

/**
* Prepares the Dialog's internal FORM object, creating one if one is not currently present.
* @method registerForm
*/
YAHOO.widget.Dialog.prototype.registerForm = function() {
	var form = this.element.getElementsByTagName("FORM")[0];

	if (! form) {
		var formHTML = "<form name=\"frm_" + this.id + "\" action=\"\"></form>";
		this.body.innerHTML += formHTML;
		form = this.element.getElementsByTagName("FORM")[0];
	}

	this.firstFormElement = function() {
		for (var f=0;f<form.elements.length;f++ ) {
			var el = form.elements[f];
			if (el.focus && ! el.disabled) {
				if (el.type && el.type != "hidden") {
					return el;
				}
			}
		}
		return null;
	}();

	this.lastFormElement = function() {
		for (var f=form.elements.length-1;f>=0;f-- ) {
			var el = form.elements[f];
			if (el.focus && ! el.disabled) {
				if (el.type && el.type != "hidden") {
					return el;
				}
			}
		}
		return null;
	}();

	this.form = form;

	if (this.cfg.getProperty("modal") && this.form) {

		var me = this;
		
		var firstElement = this.firstFormElement || this.firstButton;
		if (firstElement) {
			this.preventBackTab = new YAHOO.util.KeyListener(firstElement, { shift:true, keys:9 }, {fn:me.focusLast, scope:me, correctScope:true} );
			this.showEvent.subscribe(this.preventBackTab.enable, this.preventBackTab, true);
			this.hideEvent.subscribe(this.preventBackTab.disable, this.preventBackTab, true);
		}

		var lastElement = this.lastButton || this.lastFormElement;
		if (lastElement) {
			this.preventTabOut = new YAHOO.util.KeyListener(lastElement, { shift:false, keys:9 }, {fn:me.focusFirst, scope:me, correctScope:true} );
			this.showEvent.subscribe(this.preventTabOut.enable, this.preventTabOut, true);
			this.hideEvent.subscribe(this.preventTabOut.disable, this.preventTabOut, true);
		}
	}
};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "close" property is changed. The method controls the appending or hiding of the close icon at the top right of the Dialog.
* @method configClose
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Dialog.prototype.configClose = function(type, args, obj) {
	var val = args[0];

	var doCancel = function(e, obj) {
		obj.cancel();
	};

	if (val) {
		if (! this.close) {
			this.close = document.createElement("DIV");
			YAHOO.util.Dom.addClass(this.close, "close");

			if (this.isSecure) {
				YAHOO.util.Dom.addClass(this.close, "secure");
			} else {
				YAHOO.util.Dom.addClass(this.close, "nonsecure");
			}

			this.close.innerHTML = "&#160;";
			this.innerElement.appendChild(this.close);
			YAHOO.util.Event.addListener(this.close, "click", doCancel, this);	
		} else {
			this.close.style.display = "block";
		}
	} else {
		if (this.close) {
			this.close.style.display = "none";
		}
	}
};

/**
* The default event handler for the "buttons" configuration property
* @method configButtons
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Dialog.prototype.configButtons = function(type, args, obj) {
	var buttons = args[0];
	if (buttons != "none") {
		this.buttonSpan = null;
		this.buttonSpan = document.createElement("SPAN");
		this.buttonSpan.className = "button-group";

		for (var b=0;b<buttons.length;b++) {
			var button = buttons[b];

			var htmlButton = document.createElement("BUTTON");
			htmlButton.setAttribute("type", "button");

			if (button.isDefault) {
				htmlButton.className = "default";
				this.defaultHtmlButton = htmlButton;
			}

			htmlButton.appendChild(document.createTextNode(button.text));
			YAHOO.util.Event.addListener(htmlButton, "click", button.handler, this, true);

			this.buttonSpan.appendChild(htmlButton);		
			button.htmlButton = htmlButton;

			if (b === 0) {
				this.firstButton = button.htmlButton;
			}

			if (b == (buttons.length-1)) {
				this.lastButton = button.htmlButton;
			}

		}

		this.setFooter(this.buttonSpan);

		this.cfg.refireEvent("iframe");
		this.cfg.refireEvent("underlay");
	} else { // Do cleanup
		if (this.buttonSpan) {
			if (this.buttonSpan.parentNode) {
				this.buttonSpan.parentNode.removeChild(this.buttonSpan);
			}

			this.buttonSpan = null;
			this.firstButton = null;
			this.lastButton = null;
			this.defaultHtmlButton = null;
		}
	}
};


/**
* The default event handler used to focus the first field of the form when the Dialog is shown.
* @method focusFirst
*/
YAHOO.widget.Dialog.prototype.focusFirst = function(type,args,obj) {
	if (args) {
		var e = args[1];
		if (e) {
			YAHOO.util.Event.stopEvent(e);
		}
	}

	if (this.firstFormElement) {
		this.firstFormElement.focus();
	} else {
		this.focusDefaultButton();
	}
};

/**
* Sets the focus to the last button in the button or form element in the Dialog
* @method focusLast
*/
YAHOO.widget.Dialog.prototype.focusLast = function(type,args,obj) {
	if (args) {
		var e = args[1];
		if (e) {
			YAHOO.util.Event.stopEvent(e);
		}
	}

	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		this.focusLastButton();
	} else {
		if (this.lastFormElement) {
			this.lastFormElement.focus();
		}
	}
};

/**
* Sets the focus to the button that is designated as the default. By default, his handler is executed when the show event is fired.
* @method focusDefaultButton
*/
YAHOO.widget.Dialog.prototype.focusDefaultButton = function() {
	if (this.defaultHtmlButton) {
		this.defaultHtmlButton.focus();
	}
};

/**
* Blurs all the html buttons
* @method blurButtons
*/
YAHOO.widget.Dialog.prototype.blurButtons = function() {
	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		var html = buttons[0].htmlButton;
		if (html) {
			html.blur();
		}
	}
};

/**
* Sets the focus to the first button in the button list
* @method focusFirstButton
*/
YAHOO.widget.Dialog.prototype.focusFirstButton = function() {
	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		var html = buttons[0].htmlButton;
		if (html) {
			html.focus();
		}
	}
};

/**
* Sets the focus to the first button in the button list
* @method focusLastButton
*/
YAHOO.widget.Dialog.prototype.focusLastButton = function() {
	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		var html = buttons[buttons.length-1].htmlButton;
		if (html) {
			html.focus();
		}
	}
};

/**
* The default event handler for the "postmethod" configuration property
* @method configPostMethod
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Dialog.prototype.configPostMethod = function(type, args, obj) {
	var postmethod = args[0];

	this.registerForm();
	YAHOO.util.Event.addListener(this.form, "submit", function(e) {
														YAHOO.util.Event.stopEvent(e);
														this.submit();
														this.form.blur();
													  }, this, true); 
};

// END BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Built-in function hook for writing a validation function that will be checked for a "true" value prior to a submit. This function, as implemented by default, always returns true, so it should be overridden if validation is necessary.
* @method validate
*/
YAHOO.widget.Dialog.prototype.validate = function() {
	return true;
};

/**
* Executes a submit of the Dialog followed by a hide, if validation is successful.
* @method submit
*/
YAHOO.widget.Dialog.prototype.submit = function() {
	if (this.validate()) {
		this.beforeSubmitEvent.fire();
		this.doSubmit();
		this.submitEvent.fire();
		this.hide();
		return true;
	} else {
		return false;
	}
};

/**
* Executes the cancel of the Dialog followed by a hide.
* @method cancel
*/
YAHOO.widget.Dialog.prototype.cancel = function() {
	this.cancelEvent.fire();
	this.hide();	
};

/**
* Returns a JSON-compatible data structure representing the data currently contained in the form.
* @method getData
* @return {Object} A JSON object reprsenting the data of the current form.
*/
YAHOO.widget.Dialog.prototype.getData = function() {
	var form = this.form;
	var data = {};

	if (form) {
		for (var i=0;i<form.elements.length;i++) {
			var formItem = form.elements[i];
			if (formItem) {
				if (formItem.tagName) { // Got a single form item
					switch (formItem.tagName) {
						case "INPUT":
							switch (formItem.type) {
								case "checkbox": 
									data[formItem.name] = formItem.checked;
									break;
								case "textbox":
								case "text":
								case "hidden":
									data[formItem.name] = formItem.value;
									break;
							}
							break;
						case "TEXTAREA":
							data[formItem.name] = formItem.value;
							break;
						case "SELECT":
							var val = [];
							for (var x=0;x<formItem.options.length;x++)	{
								var option = formItem.options[x];
								if (option.selected) {
									var selval = option.value;
									if (! selval || selval === "") {
										selval = option.text;
									}
									val[val.length] = selval;
								}
							}
							data[formItem.name] = val;
							break;
					}
				} else if (formItem[0] && formItem[0].tagName) { // this is an array of form items
					if (formItem[0].tagName == "INPUT") {
						switch (formItem[0].type) {
							case "radio":
								for (var r=0; r<formItem.length; r++) {
									var radio = formItem[r];
									if (radio.checked) {
										data[radio.name] = radio.value;
										break;
									}
								}
								break;
							case "checkbox":
								var cbArray = [];
								for (var c=0; c<formItem.length; c++) {
									var check = formItem[c];
									if (check.checked) {
										cbArray[cbArray.length] = check.value;
									}
								}
								data[formItem[0].name] = cbArray;
								break;
						}
					}
				}
			}
		}	
	}
	return data;
};

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the Dialog
*/ 
YAHOO.widget.Dialog.prototype.toString = function() {
	return "Dialog " + this.id;
};

/**
* SimpleDialog is a simple implementation of Dialog that can be used to submit a single value. Forms can be processed in 3 ways -- via an asynchronous Connection utility call, a simple form POST or GET, or manually.
* @namespace YAHOO.widget
* @class SimpleDialog
* @extends YAHOO.widget.Dialog
* @constructor
* @param {String}	el	The element ID representing the SimpleDialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the SimpleDialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this SimpleDialog. See configuration documentation for more details.
*/
YAHOO.widget.SimpleDialog = function(el, userConfig) {
	YAHOO.widget.SimpleDialog.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.SimpleDialog, YAHOO.widget.Dialog);

/**
* Constant for the standard network icon for a blocking action
* @property YAHOO.widget.SimpleDialog.ICON_BLOCK
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_BLOCK = "nt/ic/ut/bsc/blck16_1.gif";

/**
* Constant for the standard network icon for alarm
* @property YAHOO.widget.SimpleDialog.ICON_ALARM
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_ALARM = "nt/ic/ut/bsc/alrt16_1.gif";

/**
* Constant for the standard network icon for help
* @property YAHOO.widget.SimpleDialog.ICON_HELP
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_HELP  = "nt/ic/ut/bsc/hlp16_1.gif";

/**
* Constant for the standard network icon for info
* @property YAHOO.widget.SimpleDialog.ICON_INFO
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_INFO  = "nt/ic/ut/bsc/info16_1.gif";

/**
* Constant for the standard network icon for warn
* @property YAHOO.widget.SimpleDialog.ICON_WARN
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_WARN  = "nt/ic/ut/bsc/warn16_1.gif";

/**
* Constant for the standard network icon for a tip
* @property YAHOO.widget.SimpleDialog.ICON_TIP
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_TIP   = "nt/ic/ut/bsc/tip16_1.gif";

/**
* Constant representing the default CSS class used for a SimpleDialog
* @property YAHOO.widget.SimpleDialog.CSS_SIMPLEDIALOG
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.CSS_SIMPLEDIALOG = "simple-dialog";

/**
* Initializes the class's configurable properties which can be changed using the SimpleDialog's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.SimpleDialog.prototype.initDefaultConfig = function() {
	YAHOO.widget.SimpleDialog.superclass.initDefaultConfig.call(this);

	// Add dialog config properties //

	/**
	* Sets the informational icon for the SimpleDialog
	* @config icon
	* @type String
	* @default "none"
	*/
	this.cfg.addProperty("icon",	{ value:"none",	handler:this.configIcon, suppressEvent:true } );
	
	/**
	* Sets the text for the SimpleDialog
	* @config text
	* @type String
	* @default ""
	*/
	this.cfg.addProperty("text",	{ value:"", handler:this.configText, suppressEvent:true, supercedes:["icon"] } );
};


/**
* The SimpleDialog initialization method, which is executed for SimpleDialog and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the SimpleDialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the SimpleDialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this SimpleDialog. See configuration documentation for more details.
*/
YAHOO.widget.SimpleDialog.prototype.init = function(el, userConfig) {
	YAHOO.widget.SimpleDialog.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level

	this.beforeInitEvent.fire(YAHOO.widget.SimpleDialog);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.SimpleDialog.CSS_SIMPLEDIALOG);

	this.cfg.queueProperty("postmethod", "manual");

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	this.beforeRenderEvent.subscribe(function() {
		if (! this.body) {
			this.setBody("");
		}
	}, this, true);

	this.initEvent.fire(YAHOO.widget.SimpleDialog);

};
/**
* Prepares the SimpleDialog's internal FORM object, creating one if one is not currently present, and adding the value hidden field.
* @method registerForm
*/
YAHOO.widget.SimpleDialog.prototype.registerForm = function() {
	YAHOO.widget.SimpleDialog.superclass.registerForm.call(this);
	this.form.innerHTML += "<input type=\"hidden\" name=\"" + this.id + "\" value=\"\"/>";
};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Fired when the "icon" property is set.
* @method configIcon
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.SimpleDialog.prototype.configIcon = function(type,args,obj) {
	var icon = args[0];
	if (icon && icon != "none") {
		var iconHTML = "<img src=\"" + this.imageRoot + icon + "\" class=\"icon\" />";
		this.body.innerHTML = iconHTML + this.body.innerHTML;
	}
};

/**
* Fired when the "text" property is set.
* @method configText
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.SimpleDialog.prototype.configText = function(type,args,obj) {
	var text = args[0];
	if (text) {
		this.setBody(text);
		this.cfg.refireEvent("icon");
	}
};
// END BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the SimpleDialog
*/ 
YAHOO.widget.SimpleDialog.prototype.toString = function() {
	return "SimpleDialog " + this.id;
};

/**
* ContainerEffect encapsulates animation transitions that are executed when an Overlay is shown or hidden.
* @namespace YAHOO.widget
* @class ContainerEffect
* @constructor
* @param {YAHOO.widget.Overlay}	overlay		The Overlay that the animation should be associated with
* @param {Object}	attrIn		The object literal representing the animation arguments to be used for the animate-in transition. The arguments for this literal are: attributes(object, see YAHOO.util.Anim for description), duration(Number), and method(i.e. YAHOO.util.Easing.easeIn).
* @param {Object}	attrOut		The object literal representing the animation arguments to be used for the animate-out transition. The arguments for this literal are: attributes(object, see YAHOO.util.Anim for description), duration(Number), and method(i.e. YAHOO.util.Easing.easeIn).
* @param {HTMLElement}	targetElement	Optional. The target element that should be animated during the transition. Defaults to overlay.element.
* @param {class}	Optional. The animation class to instantiate. Defaults to YAHOO.util.Anim. Other options include YAHOO.util.Motion.
*/
YAHOO.widget.ContainerEffect = function(overlay, attrIn, attrOut, targetElement, animClass) {
	if (! animClass) {
		animClass = YAHOO.util.Anim;
	}

	/**
	* The overlay to animate
	* @property overlay
	* @type YAHOO.widget.Overlay
	*/
	this.overlay = overlay;
	/**
	* The animation attributes to use when transitioning into view
	* @property attrIn
	* @type Object
	*/
	this.attrIn = attrIn;
	/**
	* The animation attributes to use when transitioning out of view
	* @property attrOut
	* @type Object
	*/
	this.attrOut = attrOut;
	/**
	* The target element to be animated
	* @property targetElement
	* @type HTMLElement
	*/
	this.targetElement = targetElement || overlay.element;
	/**
	* The animation class to use for animating the overlay
	* @property animClass
	* @type class
	*/
	this.animClass = animClass;
};

/**
* Initializes the animation classes and events.
* @method init
*/
YAHOO.widget.ContainerEffect.prototype.init = function() {
	this.beforeAnimateInEvent = new YAHOO.util.CustomEvent("beforeAnimateIn");
	this.beforeAnimateOutEvent = new YAHOO.util.CustomEvent("beforeAnimateOut");

	this.animateInCompleteEvent = new YAHOO.util.CustomEvent("animateInComplete");
	this.animateOutCompleteEvent = new YAHOO.util.CustomEvent("animateOutComplete");

	this.animIn = new this.animClass(this.targetElement, this.attrIn.attributes, this.attrIn.duration, this.attrIn.method);
	this.animIn.onStart.subscribe(this.handleStartAnimateIn, this);
	this.animIn.onTween.subscribe(this.handleTweenAnimateIn, this);
	this.animIn.onComplete.subscribe(this.handleCompleteAnimateIn, this);

	this.animOut = new this.animClass(this.targetElement, this.attrOut.attributes, this.attrOut.duration, this.attrOut.method);
	this.animOut.onStart.subscribe(this.handleStartAnimateOut, this);
	this.animOut.onTween.subscribe(this.handleTweenAnimateOut, this);
	this.animOut.onComplete.subscribe(this.handleCompleteAnimateOut, this);
};

/**
* Triggers the in-animation.
* @method animateIn
*/
YAHOO.widget.ContainerEffect.prototype.animateIn = function() {
	this.beforeAnimateInEvent.fire();
	this.animIn.animate();
};

/**
* Triggers the out-animation.
* @method animateOut
*/
YAHOO.widget.ContainerEffect.prototype.animateOut = function() {
	this.beforeAnimateOutEvent.fire();
	this.animOut.animate();
};

/**
* The default onStart handler for the in-animation.
* @method handleStartAnimateIn
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleStartAnimateIn = function(type, args, obj) { };
/**
* The default onTween handler for the in-animation.
* @method handleTweenAnimateIn
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleTweenAnimateIn = function(type, args, obj) { };
/**
* The default onComplete handler for the in-animation.
* @method handleCompleteAnimateIn
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleCompleteAnimateIn = function(type, args, obj) { };

/**
* The default onStart handler for the out-animation.
* @method handleStartAnimateOut
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleStartAnimateOut = function(type, args, obj) { };
/**
* The default onTween handler for the out-animation.
* @method handleTweenAnimateOut
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleTweenAnimateOut = function(type, args, obj) { };
/**
* The default onComplete handler for the out-animation.
* @method handleCompleteAnimateOut
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleCompleteAnimateOut = function(type, args, obj) { };

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the ContainerEffect
*/ 
YAHOO.widget.ContainerEffect.prototype.toString = function() {
	var output = "ContainerEffect";
	if (this.overlay) {
		output += " [" + this.overlay.toString() + "]";
	}
	return output;
};

/**
* A pre-configured ContainerEffect instance that can be used for fading an overlay in and out.
* @method FADE
* @static
* @param {Overlay}	overlay	The Overlay object to animate
* @param {Number}	dur	The duration of the animation
* @return {ContainerEffect}	The configured ContainerEffect object
*/
YAHOO.widget.ContainerEffect.FADE = function(overlay, dur) {
	var fade = new YAHOO.widget.ContainerEffect(overlay, { attributes:{opacity: {from:0, to:1}}, duration:dur, method:YAHOO.util.Easing.easeIn }, { attributes:{opacity: {to:0}}, duration:dur, method:YAHOO.util.Easing.easeOut}, overlay.element );

	fade.handleStartAnimateIn = function(type,args,obj) {
		YAHOO.util.Dom.addClass(obj.overlay.element, "hide-select");
		
		if (! obj.overlay.underlay) {
			obj.overlay.cfg.refireEvent("underlay");
		}

		if (obj.overlay.underlay) {
			obj.initialUnderlayOpacity = YAHOO.util.Dom.getStyle(obj.overlay.underlay, "opacity");
			obj.overlay.underlay.style.filter = null;
		}

		YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "visible"); 
		YAHOO.util.Dom.setStyle(obj.overlay.element, "opacity", 0);
	};


	fade.handleCompleteAnimateIn = function(type,args,obj) {
		YAHOO.util.Dom.removeClass(obj.overlay.element, "hide-select");

		if (obj.overlay.element.style.filter) {
			obj.overlay.element.style.filter = null;
		}			
		
		if (obj.overlay.underlay) {
			YAHOO.util.Dom.setStyle(obj.overlay.underlay, "opacity", obj.initialUnderlayOpacity);
		}

		obj.overlay.cfg.refireEvent("iframe");
		obj.animateInCompleteEvent.fire();
	};

	fade.handleStartAnimateOut = function(type, args, obj) {
		YAHOO.util.Dom.addClass(obj.overlay.element, "hide-select");

		if (obj.overlay.underlay) {
			obj.overlay.underlay.style.filter = null;
		}
	};

	fade.handleCompleteAnimateOut =  function(type, args, obj) { 
		YAHOO.util.Dom.removeClass(obj.overlay.element, "hide-select");
		if (obj.overlay.element.style.filter) {
			obj.overlay.element.style.filter = null;
		}				
		YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "hidden");
		YAHOO.util.Dom.setStyle(obj.overlay.element, "opacity", 1); 

		obj.overlay.cfg.refireEvent("iframe");

		obj.animateOutCompleteEvent.fire();
	};	

	fade.init();
	return fade;
};


/**
* A pre-configured ContainerEffect instance that can be used for sliding an overlay in and out.
* @method SLIDE
* @static
* @param {Overlay}	overlay	The Overlay object to animate
* @param {Number}	dur	The duration of the animation
* @return {ContainerEffect}	The configured ContainerEffect object
*/
YAHOO.widget.ContainerEffect.SLIDE = function(overlay, dur) {
	var x = overlay.cfg.getProperty("x") || YAHOO.util.Dom.getX(overlay.element);
	var y = overlay.cfg.getProperty("y") || YAHOO.util.Dom.getY(overlay.element);

	var clientWidth = YAHOO.util.Dom.getClientWidth();
	var offsetWidth = overlay.element.offsetWidth;

	var slide = new YAHOO.widget.ContainerEffect(overlay, { 
															attributes:{ points: { to:[x, y] } }, 
															duration:dur, 
															method:YAHOO.util.Easing.easeIn 
														}, 
														{ 
															attributes:{ points: { to:[(clientWidth+25), y] } },
															duration:dur, 
															method:YAHOO.util.Easing.easeOut
														},
														overlay.element,
														YAHOO.util.Motion);
												

	slide.handleStartAnimateIn = function(type,args,obj) {
		obj.overlay.element.style.left = (-25-offsetWidth) + "px";
		obj.overlay.element.style.top  = y + "px";
	};
	
	slide.handleTweenAnimateIn = function(type, args, obj) {


		var pos = YAHOO.util.Dom.getXY(obj.overlay.element);

		var currentX = pos[0];
		var currentY = pos[1];

		if (YAHOO.util.Dom.getStyle(obj.overlay.element, "visibility") == "hidden" && currentX < x) {
			YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "visible");
		}

		obj.overlay.cfg.setProperty("xy", [currentX,currentY], true);
		obj.overlay.cfg.refireEvent("iframe");
	};
	
	slide.handleCompleteAnimateIn = function(type, args, obj) {
		obj.overlay.cfg.setProperty("xy", [x,y], true);
		obj.startX = x;
		obj.startY = y;
		obj.overlay.cfg.refireEvent("iframe");
		obj.animateInCompleteEvent.fire();
	};

	slide.handleStartAnimateOut = function(type, args, obj) {
		var vw = YAHOO.util.Dom.getViewportWidth();
		
		var pos = YAHOO.util.Dom.getXY(obj.overlay.element);

		var yso = pos[1];

		var currentTo = obj.animOut.attributes.points.to;
		obj.animOut.attributes.points.to = [(vw+25), yso];
	};

	slide.handleTweenAnimateOut = function(type, args, obj) {
		var pos = YAHOO.util.Dom.getXY(obj.overlay.element);

		var xto = pos[0];
		var yto = pos[1];

		obj.overlay.cfg.setProperty("xy", [xto,yto], true);
		obj.overlay.cfg.refireEvent("iframe");
	};

	slide.handleCompleteAnimateOut = function(type, args, obj) { 
		YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "hidden");

		obj.overlay.cfg.setProperty("xy", [x,y]);
		obj.animateOutCompleteEvent.fire();
	};	

	slide.init();
	return slide;
};

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 0.12.2
*/
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The LogMsg class defines a single log message.
 *
 * @class LogMsg
 * @constructor
 * @param oConfigs {Object} Object literal of configuration params.
 */
 YAHOO.widget.LogMsg = function(oConfigs) {
    // Parse configs
    if (typeof oConfigs == "object") {
        for(var param in oConfigs) {
            this[param] = oConfigs[param];
        }
    }
 };
 
/////////////////////////////////////////////////////////////////////////////
//
// Public member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Log message.
 *
 * @property msg
 * @type String
 */
YAHOO.widget.LogMsg.prototype.msg = null;
 
/**
 * Log timestamp.
 *
 * @property time
 * @type Date
 */
YAHOO.widget.LogMsg.prototype.time = null;

/**
 * Log category.
 *
 * @property category
 * @type String
 */
YAHOO.widget.LogMsg.prototype.category = null;

/**
 * Log source. The first word passed in as the source argument.
 *
 * @property source
 * @type String
 */
YAHOO.widget.LogMsg.prototype.source = null;

/**
 * Log source detail. The remainder of the string passed in as the source argument, not
 * including the first word (if any).
 *
 * @property sourceDetail
 * @type String
 */
YAHOO.widget.LogMsg.prototype.sourceDetail = null;

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The LogWriter class provides a mechanism to log messages through
 * YAHOO.widget.Logger from a named source.
 *
 * @class LogWriter
 * @constructor
 * @param sSource {String} Source of LogWriter instance.
 */
YAHOO.widget.LogWriter = function(sSource) {
    if(!sSource) {
        YAHOO.log("Could not instantiate LogWriter due to invalid source.",
            "error", "LogWriter");
        return;
    }
    this._source = sSource;
 };

/////////////////////////////////////////////////////////////////////////////
//
// Public methods
//
/////////////////////////////////////////////////////////////////////////////

 /**
 * Public accessor to the unique name of the LogWriter instance.
 *
 * @method toString
 * @return {String} Unique name of the LogWriter instance.
 */
YAHOO.widget.LogWriter.prototype.toString = function() {
    return "LogWriter " + this._sSource;
};

/**
 * Logs a message attached to the source of the LogWriter.
 *
 * @method log
 * @param sMsg {String} The log message.
 * @param sCategory {String} Category name.
 */
YAHOO.widget.LogWriter.prototype.log = function(sMsg, sCategory) {
    YAHOO.widget.Logger.log(sMsg, sCategory, this._source);
};

/**
 * Public accessor to get the source name.
 *
 * @method getSource
 * @return {String} The LogWriter source.
 */
YAHOO.widget.LogWriter.prototype.getSource = function() {
    return this._sSource;
};

/**
 * Public accessor to set the source name.
 *
 * @method setSource
 * @param sSource {String} Source of LogWriter instance.
 */
YAHOO.widget.LogWriter.prototype.setSource = function(sSource) {
    if(!sSource) {
        YAHOO.log("Could not set source due to invalid source.", "error", this.toString());
        return;
    }
    else {
        this._sSource = sSource;
    }
};

/////////////////////////////////////////////////////////////////////////////
//
// Private member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Source of the LogWriter instance.
 *
 * @property _source
 * @type String
 * @private
 */
YAHOO.widget.LogWriter.prototype._source = null;



/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The LogReader class provides UI to read messages logged to YAHOO.widget.Logger.
 *
 * @class LogReader
 * @constructor
 * @param elContainer {HTMLElement} (optional) DOM element reference of an existing DIV.
 * @param elContainer {String} (optional) String ID of an existing DIV.
 * @param oConfigs {Object} (optional) Object literal of configuration params.
 */
YAHOO.widget.LogReader = function(elContainer, oConfigs) {
    var oSelf = this;
    this._sName = YAHOO.widget.LogReader._index;
    YAHOO.widget.LogReader._index++;

    // Parse config vars here
    if (typeof oConfigs == "object") {
        for(var param in oConfigs) {
            this[param] = oConfigs[param];
        }
    }

    // Attach container...
    if(elContainer) {
        if(typeof elContainer == "string") {
            this._elContainer = document.getElementById(elContainer);
        }
        else if(elContainer.tagName) {
            this._elContainer = elContainer;
        }
        this._elContainer.className = "yui-log";
    }
    // ...or create container from scratch
    if(!this._elContainer) {
        if(YAHOO.widget.LogReader._elDefaultContainer) {
            this._elContainer =  YAHOO.widget.LogReader._elDefaultContainer;
        }
        else {
            this._elContainer = document.body.appendChild(document.createElement("div"));
            this._elContainer.id = "yui-log";
            this._elContainer.className = "yui-log";

            YAHOO.widget.LogReader._elDefaultContainer = this._elContainer;
        }

        // If implementer has provided container values, trust and set those
        var containerStyle = this._elContainer.style;
        if(this.width) {
            containerStyle.width = this.width;
        }
        if(this.right) {
            containerStyle.right = this.right;
        }
        if(this.top) {
            containerStyle.top = this.top;
        }
         if(this.left) {
            containerStyle.left = this.left;
            containerStyle.right = "auto";
        }
        if(this.bottom) {
            containerStyle.bottom = this.bottom;
            containerStyle.top = "auto";
        }
       if(this.fontSize) {
            containerStyle.fontSize = this.fontSize;
        }
        if(window.opera) {
            document.body.style += '';
        }
    }

    if(this._elContainer) {
        // Create header
        if(!this._elHd) {
            this._elHd = this._elContainer.appendChild(document.createElement("div"));
            this._elHd.id = "yui-log-hd" + this._sName;
            this._elHd.className = "yui-log-hd";

            this._elCollapse = this._elHd.appendChild(document.createElement("div"));
            this._elCollapse.className = "yui-log-btns";

            this._btnCollapse = document.createElement("input");
            this._btnCollapse.type = "button";
            this._btnCollapse.style.fontSize =
                YAHOO.util.Dom.getStyle(this._elContainer,"fontSize");
            this._btnCollapse.className = "yui-log-button";
            this._btnCollapse.value = "Collapse";
            this._btnCollapse = this._elCollapse.appendChild(this._btnCollapse);
            YAHOO.util.Event.addListener(
                oSelf._btnCollapse,'click',oSelf._onClickCollapseBtn,oSelf);

            this._title = this._elHd.appendChild(document.createElement("h4"));
            this._title.innerHTML = "Logger Console";

            // If Drag and Drop utility is available...
            // ...and this container was created from scratch...
            // ...then make the header draggable
            if(YAHOO.util.DD &&
            (YAHOO.widget.LogReader._elDefaultContainer == this._elContainer)) {
                var ylog_dd = new YAHOO.util.DD(this._elContainer.id);
                ylog_dd.setHandleElId(this._elHd.id);
                this._elHd.style.cursor = "move";
            }
        }
        // Ceate console
        if(!this._elConsole) {
            this._elConsole =
                this._elContainer.appendChild(document.createElement("div"));
            this._elConsole.className = "yui-log-bd";

            // If implementer has provided console, trust and set those
            if(this.height) {
                this._elConsole.style.height = this.height;
            }
        }
        // Don't create footer if disabled
        if(!this._elFt && this.footerEnabled) {
            this._elFt = this._elContainer.appendChild(document.createElement("div"));
            this._elFt.className = "yui-log-ft";

            this._elBtns = this._elFt.appendChild(document.createElement("div"));
            this._elBtns.className = "yui-log-btns";

            this._btnPause = document.createElement("input");
            this._btnPause.type = "button";
            this._btnPause.style.fontSize =
                YAHOO.util.Dom.getStyle(this._elContainer,"fontSize");
            this._btnPause.className = "yui-log-button";
            this._btnPause.value = "Pause";
            this._btnPause = this._elBtns.appendChild(this._btnPause);
            YAHOO.util.Event.addListener(
                oSelf._btnPause,'click',oSelf._onClickPauseBtn,oSelf);

            this._btnClear = document.createElement("input");
            this._btnClear.type = "button";
            this._btnClear.style.fontSize =
                YAHOO.util.Dom.getStyle(this._elContainer,"fontSize");
            this._btnClear.className = "yui-log-button";
            this._btnClear.value = "Clear";
            this._btnClear = this._elBtns.appendChild(this._btnClear);
            YAHOO.util.Event.addListener(
                oSelf._btnClear,'click',oSelf._onClickClearBtn,oSelf);

            this._elCategoryFilters = this._elFt.appendChild(document.createElement("div"));
            this._elCategoryFilters.className = "yui-log-categoryfilters";
            this._elSourceFilters = this._elFt.appendChild(document.createElement("div"));
            this._elSourceFilters.className = "yui-log-sourcefilters";
        }
    }

    // Initialize internal vars
    if(!this._buffer) {
        this._buffer = []; // output buffer
    }
    // Timestamp of last log message to console
    this._lastTime = YAHOO.widget.Logger.getStartTime(); 
    
    // Subscribe to Logger custom events
    YAHOO.widget.Logger.newLogEvent.subscribe(this._onNewLog, this);
    YAHOO.widget.Logger.logResetEvent.subscribe(this._onReset, this);

    // Initialize category filters
    this._categoryFilters = [];
    var catsLen = YAHOO.widget.Logger.categories.length;
    if(this._elCategoryFilters) {
        for(var i=0; i < catsLen; i++) {
            this._createCategoryCheckbox(YAHOO.widget.Logger.categories[i]);
        }
    }
    // Initialize source filters
    this._sourceFilters = [];
    var sourcesLen = YAHOO.widget.Logger.sources.length;
    if(this._elSourceFilters) {
        for(var j=0; j < sourcesLen; j++) {
            this._createSourceCheckbox(YAHOO.widget.Logger.sources[j]);
        }
    }
    YAHOO.widget.Logger.categoryCreateEvent.subscribe(this._onCategoryCreate, this);
    YAHOO.widget.Logger.sourceCreateEvent.subscribe(this._onSourceCreate, this);

    this._filterLogs();
    YAHOO.log("LogReader initialized", null, this.toString());
};

/////////////////////////////////////////////////////////////////////////////
//
// Public member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Whether or not the log reader is enabled to output log messages.
 *
 * @property logReaderEnabled
 * @type Boolean
 * @default true
 */
YAHOO.widget.LogReader.prototype.logReaderEnabled = true;

/**
 * Public member to access CSS width of the log reader container.
 *
 * @property width
 * @type String
 */
YAHOO.widget.LogReader.prototype.width = null;

/**
 * Public member to access CSS height of the log reader container.
 *
 * @property height
 * @type String
 */
YAHOO.widget.LogReader.prototype.height = null;

/**
 * Public member to access CSS top position of the log reader container.
 *
 * @property top
 * @type String
 */
YAHOO.widget.LogReader.prototype.top = null;

/**
 * Public member to access CSS left position of the log reader container.
 *
 * @property left
 * @type String
 */
YAHOO.widget.LogReader.prototype.left = null;

/**
 * Public member to access CSS right position of the log reader container.
 *
 * @property right
 * @type String
 */
YAHOO.widget.LogReader.prototype.right = null;

/**
 * Public member to access CSS bottom position of the log reader container.
 *
 * @property bottom
 * @type String
 */
YAHOO.widget.LogReader.prototype.bottom = null;

/**
 * Public member to access CSS font size of the log reader container.
 *
 * @property fontSize
 * @type String
 */
YAHOO.widget.LogReader.prototype.fontSize = null;

/**
 * Whether or not the footer UI is enabled for the log reader.
 *
 * @property footerEnabled
 * @type Boolean
 * @default true
 */
YAHOO.widget.LogReader.prototype.footerEnabled = true;

/**
 * Whether or not output is verbose (more readable). Setting to true will make
 * output more compact (less readable).
 *
 * @property verboseOutput
 * @type Boolean
 * @default true
 */
YAHOO.widget.LogReader.prototype.verboseOutput = true;

/**
 * Whether or not newest message is printed on top.
 *
 * @property newestOnTop
 * @type Boolean
 */
YAHOO.widget.LogReader.prototype.newestOnTop = true;

/**
 * Maximum number of messages a LogReader console will display.
 *
 * @property thresholdMax
 * @type Number
 * @default 500
 */
YAHOO.widget.LogReader.prototype.thresholdMax = 500;

/**
 * When a LogReader console reaches its thresholdMax, it will clear out messages
 * and print out the latest thresholdMin number of messages.
 *
 * @property thresholdMin
 * @type Number
 * @default 100
 */
YAHOO.widget.LogReader.prototype.thresholdMin = 100;

/////////////////////////////////////////////////////////////////////////////
//
// Public methods
//
/////////////////////////////////////////////////////////////////////////////

 /**
 * Public accessor to the unique name of the LogReader instance.
 *
 * @method toString
 * @return {String} Unique name of the LogReader instance.
 */
YAHOO.widget.LogReader.prototype.toString = function() {
    return "LogReader instance" + this._sName;
};
/**
 * Pauses output of log messages. While paused, log messages are not lost, but
 * get saved to a buffer and then output upon resume of log reader.
 *
 * @method pause
 */
YAHOO.widget.LogReader.prototype.pause = function() {
    this._timeout = null;
    this.logReaderEnabled = false;
};

/**
 * Resumes output of log messages, including outputting any log messages that
 * have been saved to buffer while paused.
 *
 * @method resume
 */
YAHOO.widget.LogReader.prototype.resume = function() {
    this.logReaderEnabled = true;
    this._printBuffer();
};

/**
 * Hides UI of log reader. Logging functionality is not disrupted.
 *
 * @method hide
 */
YAHOO.widget.LogReader.prototype.hide = function() {
    this._elContainer.style.display = "none";
};

/**
 * Shows UI of log reader. Logging functionality is not disrupted.
 *
 * @method show
 */
YAHOO.widget.LogReader.prototype.show = function() {
    this._elContainer.style.display = "block";
};

/**
 * Updates title to given string.
 *
 * @method setTitle
 * @param sTitle {String} New title.
 */
YAHOO.widget.LogReader.prototype.setTitle = function(sTitle) {
    this._title.innerHTML = this.html2Text(sTitle);
};

/**
 * Gets timestamp of the last log.
 *
 * @method getLastTime
 * @return {Date} Timestamp of the last log.
 */
YAHOO.widget.LogReader.prototype.getLastTime = function() {
    return this._lastTime;
};

/**
 * Formats message string to HTML for output to console.
 *
 * @method formatMsg
 * @param oLogMsg {Object} Log message object.
 * @return {String} HTML-formatted message for output to console.
 */
YAHOO.widget.LogReader.prototype.formatMsg = function(oLogMsg) {
    var category = oLogMsg.category;
    
    // Label for color-coded display
    var label = category.substring(0,4).toUpperCase();

    // Calculate the elapsed time to be from the last item that passed through the filter,
    // not the absolute previous item in the stack

    var time = oLogMsg.time;
    if (time.toLocaleTimeString) {
        var localTime  = time.toLocaleTimeString();
    }
    else {
        localTime = time.toString();
    }

    var msecs = time.getTime();
    var startTime = YAHOO.widget.Logger.getStartTime();
    var totalTime = msecs - startTime;
    var elapsedTime = msecs - this.getLastTime();

    var source = oLogMsg.source;
    var sourceDetail = oLogMsg.sourceDetail;
    var sourceAndDetail = (sourceDetail) ?
        source + " " + sourceDetail : source;
        
    // Escape HTML entities in the log message itself for output to console
    var msg = this.html2Text(oLogMsg.msg);

    // Verbose output includes extra line breaks
    var output =  (this.verboseOutput) ?
        ["<p><span class='", category, "'>", label, "</span> ",
        totalTime, "ms (+", elapsedTime, ") ",
        localTime, ": ",
        "</p><p>",
        sourceAndDetail,
        ": </p><p>",
        msg,
        "</p>"] :

        ["<p><span class='", category, "'>", label, "</span> ",
        totalTime, "ms (+", elapsedTime, ") ",
        localTime, ": ",
        sourceAndDetail, ": ",
        msg,"</p>"];

    return output.join("");
};

/**
 * Converts input chars "<", ">", and "&" to HTML entities.
 *
 * @method html2Text
 * @param sHtml {String} String to convert.
 * @private
 */
YAHOO.widget.LogReader.prototype.html2Text = function(sHtml) {
    if(sHtml) {
        sHtml += "";
        return sHtml.replace(/&/g, "&#38;").replace(/</g, "&#60;").replace(/>/g, "&#62;");
    }
    return "";
};

/////////////////////////////////////////////////////////////////////////////
//
// Private member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Internal class member to index multiple log reader instances.
 *
 * @property _memberName
 * @static
 * @type Number
 * @default 0
 * @private
 */
YAHOO.widget.LogReader._index = 0;

/**
 * Name of LogReader instance.
 *
 * @property _sName
 * @type String
 * @private
 */
YAHOO.widget.LogReader.prototype._sName = null;

/**
 * A class member shared by all log readers if a container needs to be
 * created during instantiation. Will be null if a container element never needs to
 * be created on the fly, such as when the implementer passes in their own element.
 *
 * @property _elDefaultContainer
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader._elDefaultContainer = null;

/**
 * Buffer of log message objects for batch output.
 *
 * @property _buffer
 * @type Object[]
 * @private
 */
YAHOO.widget.LogReader.prototype._buffer = null;

/**
 * Number of log messages output to console.
 *
 * @property _consoleMsgCount
 * @type Number
 * @default 0
 * @private
 */
YAHOO.widget.LogReader.prototype._consoleMsgCount = 0;

/**
 * Date of last output log message.
 *
 * @property _lastTime
 * @type Date
 * @private
 */
YAHOO.widget.LogReader.prototype._lastTime = null;

/**
 * Batched output timeout ID.
 *
 * @property _timeout
 * @type Number
 * @private
 */
YAHOO.widget.LogReader.prototype._timeout = null;

/**
 * Array of filters for log message categories.
 *
 * @property _categoryFilters
 * @type String[]
 * @private
 */
YAHOO.widget.LogReader.prototype._categoryFilters = null;

/**
 * Array of filters for log message sources.
 *
 * @property _sourceFilters
 * @type String[]
 * @private
 */
YAHOO.widget.LogReader.prototype._sourceFilters = null;

/**
 * Log reader container element.
 *
 * @property _elContainer
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._elContainer = null;

/**
 * Log reader header element.
 *
 * @property _elHd
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._elHd = null;

/**
 * Log reader collapse element.
 *
 * @property _elCollapse
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._elCollapse = null;

/**
 * Log reader collapse button element.
 *
 * @property _btnCollapse
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._btnCollapse = null;

/**
 * Log reader title header element.
 *
 * @property _title
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._title = null;

/**
 * Log reader console element.
 *
 * @property _elConsole
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._elConsole = null;

/**
 * Log reader footer element.
 *
 * @property _elFt
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._elFt = null;

/**
 * Log reader buttons container element.
 *
 * @property _elBtns
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._elBtns = null;

/**
 * Container element for log reader category filter checkboxes.
 *
 * @property _elCategoryFilters
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._elCategoryFilters = null;

/**
 * Container element for log reader source filter checkboxes.
 *
 * @property _elSourceFilters
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._elSourceFilters = null;

/**
 * Log reader pause button element.
 *
 * @property _btnPause
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._btnPause = null;

/**
 * Clear button element.
 *
 * @property _btnClear
 * @type HTMLElement
 * @private
 */
YAHOO.widget.LogReader.prototype._btnClear = null;

/////////////////////////////////////////////////////////////////////////////
//
// Private methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Creates the UI for a category filter in the log reader footer element.
 *
 * @method _createCategoryCheckbox
 * @param sCategory {String} Category name.
 * @private
 */
YAHOO.widget.LogReader.prototype._createCategoryCheckbox = function(sCategory) {
    var oSelf = this;

    if(this._elFt) {
        var elParent = this._elCategoryFilters;
        var filters = this._categoryFilters;

        var elFilter = elParent.appendChild(document.createElement("span"));
        elFilter.className = "yui-log-filtergrp";
            // Append el at the end so IE 5.5 can set "type" attribute
            // and THEN set checked property
            var chkCategory = document.createElement("input");
            chkCategory.id = "yui-log-filter-" + sCategory + this._sName;
            chkCategory.className = "yui-log-filter-" + sCategory;
            chkCategory.type = "checkbox";
            chkCategory.category = sCategory;
            chkCategory = elFilter.appendChild(chkCategory);
            chkCategory.checked = true;

            // Add this checked filter to the internal array of filters
            filters.push(sCategory);
            // Subscribe to the click event
            YAHOO.util.Event.addListener(chkCategory,'click',oSelf._onCheckCategory,oSelf);

            // Create and class the text label
            var lblCategory = elFilter.appendChild(document.createElement("label"));
            lblCategory.htmlFor = chkCategory.id;
            lblCategory.className = sCategory;
            lblCategory.innerHTML = sCategory;
    }
};

/**
 * Creates a checkbox in the log reader footer element to filter by source.
 *
 * @method _createSourceCheckbox
 * @param sSource {String} Source name.
 * @private
 */
YAHOO.widget.LogReader.prototype._createSourceCheckbox = function(sSource) {
    var oSelf = this;

    if(this._elFt) {
        var elParent = this._elSourceFilters;
        var filters = this._sourceFilters;

        var elFilter = elParent.appendChild(document.createElement("span"));
        elFilter.className = "yui-log-filtergrp";

        // Append el at the end so IE 5.5 can set "type" attribute
        // and THEN set checked property
        var chkSource = document.createElement("input");
        chkSource.id = "yui-log-filter" + sSource + this._sName;
        chkSource.className = "yui-log-filter" + sSource;
        chkSource.type = "checkbox";
        chkSource.source = sSource;
        chkSource = elFilter.appendChild(chkSource);
        chkSource.checked = true;

        // Add this checked filter to the internal array of filters
        filters.push(sSource);
        // Subscribe to the click event
        YAHOO.util.Event.addListener(chkSource,'click',oSelf._onCheckSource,oSelf);

        // Create and class the text label
        var lblSource = elFilter.appendChild(document.createElement("label"));
        lblSource.htmlFor = chkSource.id;
        lblSource.className = sSource;
        lblSource.innerHTML = sSource;
    }
};

/**
 * Reprints all log messages in the stack through filters.
 *
 * @method _filterLogs
 * @private
 */
YAHOO.widget.LogReader.prototype._filterLogs = function() {
    // Reprint stack with new filters
    if (this._elConsole !== null) {
        this._clearConsole();
        this._printToConsole(YAHOO.widget.Logger.getStack());
    }
};

/**
 * Clears all outputted log messages from the console and resets the time of the
 * last output log message.
 *
 * @method _clearConsole
 * @private
 */
YAHOO.widget.LogReader.prototype._clearConsole = function() {
    // Clear the buffer of any pending messages
    this._timeout = null;
    this._buffer = [];
    this._consoleMsgCount = 0;

    // Reset the rolling timer
    this._lastTime = YAHOO.widget.Logger.getStartTime();

    var elConsole = this._elConsole;
    while(elConsole.hasChildNodes()) {
        elConsole.removeChild(elConsole.firstChild);
    }
};

/**
 * Sends buffer of log messages to output and clears buffer.
 *
 * @method _printBuffer
 * @private
 */
YAHOO.widget.LogReader.prototype._printBuffer = function() {
    this._timeout = null;

    if(this._elConsole !== null) {
        var thresholdMax = this.thresholdMax;
        thresholdMax = (thresholdMax && !isNaN(thresholdMax)) ? thresholdMax : 500;
        if(this._consoleMsgCount < thresholdMax) {
            var entries = [];
            for (var i=0; i<this._buffer.length; i++) {
                entries[i] = this._buffer[i];
            }
            this._buffer = [];
            this._printToConsole(entries);
        }
        else {
            this._filterLogs();
        }
        
        if(!this.newestOnTop) {
            this._elConsole.scrollTop = this._elConsole.scrollHeight;
        }
    }
};

/**
 * Cycles through an array of log messages, and outputs each one to the console
 * if its category has not been filtered out.
 *
 * @method _printToConsole
 * @param aEntries {Object[]} Array of LogMsg objects to output to console.
 * @private
 */
YAHOO.widget.LogReader.prototype._printToConsole = function(aEntries) {
    // Manage the number of messages displayed in the console
    var entriesLen = aEntries.length;
    var thresholdMin = this.thresholdMin;
    if(isNaN(thresholdMin) || (thresholdMin > this.thresholdMax)) {
        thresholdMin = 0;
    }
    var entriesStartIndex = (entriesLen > thresholdMin) ? (entriesLen - thresholdMin) : 0;
    
    // Iterate through all log entries 
    var sourceFiltersLen = this._sourceFilters.length;
    var categoryFiltersLen = this._categoryFilters.length;
    for(var i=entriesStartIndex; i<entriesLen; i++) {
        // Print only the ones that filter through
        var okToPrint = false;
        var okToFilterCats = false;

        // Get log message details
        var entry = aEntries[i];
        var source = entry.source;
        var category = entry.category;

        for(var j=0; j<sourceFiltersLen; j++) {
            if(source == this._sourceFilters[j]) {
                okToFilterCats = true;
                break;
            }
        }
        if(okToFilterCats) {
            for(var k=0; k<categoryFiltersLen; k++) {
                if(category == this._categoryFilters[k]) {
                    okToPrint = true;
                    break;
                }
            }
        }
        if(okToPrint) {
            var output = this.formatMsg(entry);

            // Verbose output uses <code> tag instead of <pre> tag (for wrapping)
            var container = (this.verboseOutput) ? "CODE" : "PRE";
            var oNewElement = (this.newestOnTop) ?
                this._elConsole.insertBefore(
                    document.createElement(container),this._elConsole.firstChild):
                this._elConsole.appendChild(document.createElement(container));

            oNewElement.innerHTML = output;
            this._consoleMsgCount++;
            this._lastTime = entry.time.getTime();
        }
    }
};

/////////////////////////////////////////////////////////////////////////////
//
// Private event handlers
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Handles Logger's categoryCreateEvent.
 *
 * @method _onCategoryCreate
 * @param sType {String} The event.
 * @param aArgs {Object[]} Data passed from event firer.
 * @param oSelf {Object} The LogReader instance.
 * @private
 */
YAHOO.widget.LogReader.prototype._onCategoryCreate = function(sType, aArgs, oSelf) {
    var category = aArgs[0];
    if(oSelf._elFt) {
        oSelf._createCategoryCheckbox(category);
    }
};

/**
 * Handles Logger's sourceCreateEvent.
 *
 * @method _onSourceCreate
 * @param sType {String} The event.
 * @param aArgs {Object[]} Data passed from event firer.
 * @param oSelf {Object} The LogReader instance.
 * @private
 */
YAHOO.widget.LogReader.prototype._onSourceCreate = function(sType, aArgs, oSelf) {
    var source = aArgs[0];
    if(oSelf._elFt) {
        oSelf._createSourceCheckbox(source);
    }
};

/**
 * Handles check events on the category filter checkboxes.
 *
 * @method _onCheckCategory
 * @param v {HTMLEvent} The click event.
 * @param oSelf {Object} The LogReader instance.
 * @private
 */
YAHOO.widget.LogReader.prototype._onCheckCategory = function(v, oSelf) {
    var newFilter = this.category;
    var filtersArray = oSelf._categoryFilters;

    if(!this.checked) { // Remove category from filters
        for(var i=0; i<filtersArray.length; i++) {
            if(newFilter == filtersArray[i]) {
                filtersArray.splice(i, 1);
                break;
            }
        }
    }
    else { // Add category to filters
        filtersArray.push(newFilter);
    }
    oSelf._filterLogs();
};

/**
 * Handles check events on the category filter checkboxes.
 *
 * @method _onCheckSource
 * @param v {HTMLEvent} The click event.
 * @param oSelf {Object} The log reader instance.
 * @private
 */
YAHOO.widget.LogReader.prototype._onCheckSource = function(v, oSelf) {
    var newFilter = this.source;
    var filtersArray = oSelf._sourceFilters;

    if(!this.checked) { // Remove category from filters
        for(var i=0; i<filtersArray.length; i++) {
            if(newFilter == filtersArray[i]) {
                filtersArray.splice(i, 1);
                break;
            }
        }
    }
    else { // Add category to filters
        filtersArray.push(newFilter);
    }
    oSelf._filterLogs();
};

/**
 * Handles click events on the collapse button.
 *
 * @method _onClickCollapseBtn
 * @param v {HTMLEvent} The click event.
 * @param oSelf {Object} The LogReader instance
 * @private
 */
YAHOO.widget.LogReader.prototype._onClickCollapseBtn = function(v, oSelf) {
    var btn = oSelf._btnCollapse;
    if(btn.value == "Expand") {
        oSelf._elConsole.style.display = "block";
        if(oSelf._elFt) {
            oSelf._elFt.style.display = "block";
        }
        btn.value = "Collapse";
    }
    else {
        oSelf._elConsole.style.display = "none";
        if(oSelf._elFt) {
            oSelf._elFt.style.display = "none";
        }
        btn.value = "Expand";
    }
};

/**
 * Handles click events on the pause button.
 *
 * @method _onClickPauseBtn
 * @param v {HTMLEvent} The click event.
 * @param oSelf {Object} The LogReader instance.
 * @private
 */
YAHOO.widget.LogReader.prototype._onClickPauseBtn = function(v, oSelf) {
    var btn = oSelf._btnPause;
    if(btn.value == "Resume") {
        oSelf.resume();
        btn.value = "Pause";
    }
    else {
        oSelf.pause();
        btn.value = "Resume";
    }
};

/**
 * Handles click events on the clear button.
 *
 * @method _onClickClearBtn
 * @param v {HTMLEvent} The click event.
 * @param oSelf {Object} The LogReader instance.
 * @private
 */
YAHOO.widget.LogReader.prototype._onClickClearBtn = function(v, oSelf) {
    oSelf._clearConsole();
};

/**
 * Handles Logger's newLogEvent.
 *
 * @method _onNewLog
 * @param sType {String} The event.
 * @param aArgs {Object[]} Data passed from event firer.
 * @param oSelf {Object} The LogReader instance.
 * @private
 */
YAHOO.widget.LogReader.prototype._onNewLog = function(sType, aArgs, oSelf) {
    var logEntry = aArgs[0];
    oSelf._buffer.push(logEntry);

    if (oSelf.logReaderEnabled === true && oSelf._timeout === null) {
        oSelf._timeout = setTimeout(function(){oSelf._printBuffer();}, 100);
    }
};

/**
 * Handles Logger's resetEvent.
 *
 * @method _onReset
 * @param sType {String} The event.
 * @param aArgs {Object[]} Data passed from event firer.
 * @param oSelf {Object} The LogReader instance.
 * @private
 */
YAHOO.widget.LogReader.prototype._onReset = function(sType, aArgs, oSelf) {
    oSelf._filterLogs();
};
 /**
 * The Logger widget provides a simple way to read or write log messages in
 * JavaScript code. Integration with the YUI Library's debug builds allow
 * implementers to access under-the-hood events, errors, and debugging messages.
 * Output may be read through a LogReader console and/or output to a browser
 * console.
 *
 * @module logger
 * @requires yahoo, event, dom
 * @optional dragdrop
 * @namespace YAHOO.widget
 * @title Logger Widget
 */

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The singleton Logger class provides core log management functionality. Saves
 * logs written through the global YAHOO.log function or written by a LogWriter
 * instance. Provides access to logs for reading by a LogReader instance or
 * native browser console such as the Firebug extension to Firefox or Safari's
 * JavaScript console through integration with the console.log() method.
 *
 * @class Logger
 * @static
 */
YAHOO.widget.Logger = {
    // Initialize members
    loggerEnabled: true,
    _browserConsoleEnabled: false,
    categories: ["info","warn","error","time","window"],
    sources: ["global"],
    _stack: [], // holds all log msgs
    maxStackEntries: 2500,
    _startTime: new Date().getTime(), // static start timestamp
    _lastTime: null // timestamp of last logged message
};

/////////////////////////////////////////////////////////////////////////////
//
// Public methods
//
/////////////////////////////////////////////////////////////////////////////
/**
 * Saves a log message to the stack and fires newLogEvent. If the log message is
 * assigned to an unknown category, creates a new category. If the log message is
 * from an unknown source, creates a new source.  If browser console is enabled,
 * outputs the log message to browser console.
 *
 * @method log
 * @param sMsg {String} The log message.
 * @param sCategory {String} Category of log message, or null.
 * @param sSource {String} Source of LogWriter, or null if global.
 */
YAHOO.widget.Logger.log = function(sMsg, sCategory, sSource) {
    if(this.loggerEnabled) {
        if(!sCategory) {
            sCategory = "info"; // default category
        }
        else {
            sCategory = sCategory.toLocaleLowerCase();
            if(this._isNewCategory(sCategory)) {
                this._createNewCategory(sCategory);
            }
        }
        var sClass = "global"; // default source
        var sDetail = null;
        if(sSource) {
            var spaceIndex = sSource.indexOf(" ");
            if(spaceIndex > 0) {
                // Substring until first space
                sClass = sSource.substring(0,spaceIndex);
                // The rest of the source
                sDetail = sSource.substring(spaceIndex,sSource.length);
            }
            else {
                sClass = sSource;
            }
            if(this._isNewSource(sClass)) {
                this._createNewSource(sClass);
            }
        }

        var timestamp = new Date();
        var logEntry = new YAHOO.widget.LogMsg({
            msg: sMsg,
            time: timestamp,
            category: sCategory,
            source: sClass,
            sourceDetail: sDetail
        });

        var stack = this._stack;
        var maxStackEntries = this.maxStackEntries;
        if(maxStackEntries && !isNaN(maxStackEntries) &&
            (stack.length >= maxStackEntries)) {
            stack.shift();
        }
        stack.push(logEntry);
        this.newLogEvent.fire(logEntry);

        if(this._browserConsoleEnabled) {
            this._printToBrowserConsole(logEntry);
        }
        return true;
    }
    else {
        return false;
    }
};

/**
 * Resets internal stack and startTime, enables Logger, and fires logResetEvent.
 *
 * @method reset
 */
YAHOO.widget.Logger.reset = function() {
    this._stack = [];
    this._startTime = new Date().getTime();
    this.loggerEnabled = true;
    this.log("Logger reset");
    this.logResetEvent.fire();
};

/**
 * Public accessor to internal stack of log message objects.
 *
 * @method getStack
 * @return {Object[]} Array of log message objects.
 */
YAHOO.widget.Logger.getStack = function() {
    return this._stack;
};

/**
 * Public accessor to internal start time.
 *
 * @method getStartTime
 * @return {Date} Internal date of when Logger singleton was initialized.
 */
YAHOO.widget.Logger.getStartTime = function() {
    return this._startTime;
};

/**
 * Disables output to the browser's global console.log() function, which is used
 * by the Firebug extension to Firefox as well as Safari.
 *
 * @method disableBrowserConsole
 */
YAHOO.widget.Logger.disableBrowserConsole = function() {
    YAHOO.log("Logger output to the function console.log() has been disabled.");
    this._browserConsoleEnabled = false;
};

/**
 * Enables output to the browser's global console.log() function, which is used
 * by the Firebug extension to Firefox as well as Safari.
 *
 * @method enableBrowserConsole
 */
YAHOO.widget.Logger.enableBrowserConsole = function() {
    this._browserConsoleEnabled = true;
    YAHOO.log("Logger output to the function console.log() has been enabled.");
};

/////////////////////////////////////////////////////////////////////////////
//
// Public events
//
/////////////////////////////////////////////////////////////////////////////

 /**
 * Fired when a new category has been created.
 *
 * @event categoryCreateEvent
 * @param sCategory {String} Category name.
 */
YAHOO.widget.Logger.categoryCreateEvent =
    new YAHOO.util.CustomEvent("categoryCreate", this, true);

 /**
 * Fired when a new source has been named.
 *
 * @event sourceCreateEvent
 * @param sSource {String} Source name.
 */
YAHOO.widget.Logger.sourceCreateEvent =
    new YAHOO.util.CustomEvent("sourceCreate", this, true);

 /**
 * Fired when a new log message has been created.
 *
 * @event newLogEvent
 * @param sMsg {String} Log message.
 */
YAHOO.widget.Logger.newLogEvent = new YAHOO.util.CustomEvent("newLog", this, true);

/**
 * Fired when the Logger has been reset has been created.
 *
 * @event logResetEvent
 */
YAHOO.widget.Logger.logResetEvent = new YAHOO.util.CustomEvent("logReset", this, true);

/////////////////////////////////////////////////////////////////////////////
//
// Private methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Creates a new category of log messages and fires categoryCreateEvent.
 *
 * @method _createNewCategory
 * @param sCategory {String} Category name.
 * @private
 */
YAHOO.widget.Logger._createNewCategory = function(sCategory) {
    this.categories.push(sCategory);
    this.categoryCreateEvent.fire(sCategory);
};

/**
 * Checks to see if a category has already been created.
 *
 * @method _isNewCategory
 * @param sCategory {String} Category name.
 * @return {Boolean} Returns true if category is unknown, else returns false.
 * @private
 */
YAHOO.widget.Logger._isNewCategory = function(sCategory) {
    for(var i=0; i < this.categories.length; i++) {
        if(sCategory == this.categories[i]) {
            return false;
        }
    }
    return true;
};

/**
 * Creates a new source of log messages and fires sourceCreateEvent.
 *
 * @method _createNewSource
 * @param sSource {String} Source name.
 * @private
 */
YAHOO.widget.Logger._createNewSource = function(sSource) {
    this.sources.push(sSource);
    this.sourceCreateEvent.fire(sSource);
};

/**
 * Checks to see if a source already exists.
 *
 * @method _isNewSource
 * @param sSource {String} Source name.
 * @return {Boolean} Returns true if source is unknown, else returns false.
 * @private
 */
YAHOO.widget.Logger._isNewSource = function(sSource) {
    if(sSource) {
        for(var i=0; i < this.sources.length; i++) {
            if(sSource == this.sources[i]) {
                return false;
            }
        }
        return true;
    }
};

/**
 * Outputs a log message to global console.log() function.
 *
 * @method _printToBrowserConsole
 * @param oEntry {Object} Log entry object.
 * @private
 */
YAHOO.widget.Logger._printToBrowserConsole = function(oEntry) {
    if(window.console && console.log) {
        var category = oEntry.category;
        var label = oEntry.category.substring(0,4).toUpperCase();

        var time = oEntry.time;
        if (time.toLocaleTimeString) {
            var localTime  = time.toLocaleTimeString();
        }
        else {
            localTime = time.toString();
        }

        var msecs = time.getTime();
        var elapsedTime = (YAHOO.widget.Logger._lastTime) ?
            (msecs - YAHOO.widget.Logger._lastTime) : 0;
        YAHOO.widget.Logger._lastTime = msecs;

        var output =
            localTime + " (" +
            elapsedTime + "ms): " +
            oEntry.source + ": " +
            oEntry.msg;

        console.log(output);
    }
};

/////////////////////////////////////////////////////////////////////////////
//
// Private event handlers
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Handles logging of messages due to window error events.
 *
 * @method _onWindowError
 * @param sMsg {String} The error message.
 * @param sUrl {String} URL of the error.
 * @param sLine {String} Line number of the error.
 * @private
 */
YAHOO.widget.Logger._onWindowError = function(sMsg,sUrl,sLine) {
    // Logger is not in scope of this event handler
    try {
        YAHOO.widget.Logger.log(sMsg+' ('+sUrl+', line '+sLine+')', "window");
        if(YAHOO.widget.Logger._origOnWindowError) {
            YAHOO.widget.Logger._origOnWindowError();
        }
    }
    catch(e) {
        return false;
    }
};

/////////////////////////////////////////////////////////////////////////////
//
// Enable handling of native JavaScript errors
// NB: Not all browsers support the window.onerror event
//
/////////////////////////////////////////////////////////////////////////////

if(window.onerror) {
    // Save any previously defined handler to call
    YAHOO.widget.Logger._origOnWindowError = window.onerror;
}
window.onerror = YAHOO.widget.Logger._onWindowError;

/////////////////////////////////////////////////////////////////////////////
//
// First log
//
/////////////////////////////////////////////////////////////////////////////

YAHOO.widget.Logger.log("Logger initialized");

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 0.12.2
*/
/**
 * The Connection Manager provides a simplified interface to the XMLHttpRequest
 * object.  It handles cross-browser instantiantion of XMLHttpRequest, negotiates the
 * interactive states and server response, returning the results to a pre-defined
 * callback you create.
 *
 * @namespace YAHOO.util
 * @module connection
 * @requires yahoo
 */

/**
 * The Connection Manager singleton provides methods for creating and managing
 * asynchronous transactions.
 *
 * @class Connect
 */
YAHOO.util.Connect =
{
  /**
   * @description Array of MSFT ActiveX ids for XMLHttpRequest.
   * @property _msxml_progid
   * @private
   * @static
   * @type array
   */
	_msxml_progid:[
		'MSXML2.XMLHTTP.3.0',
		'MSXML2.XMLHTTP',
		'Microsoft.XMLHTTP'
		],

  /**
   * @description Object literal of HTTP header(s)
   * @property _http_header
   * @private
   * @static
   * @type object
   */
	_http_header:{},

  /**
   * @description Determines if HTTP headers are set.
   * @property _has_http_headers
   * @private
   * @static
   * @type boolean
   */
	_has_http_headers:false,

 /**
  * @description Determines if a default header of
  * Content-Type of 'application/x-www-form-urlencoded'
  * will be added to any client HTTP headers sent for POST
  * transactions.
  * @property _use_default_post_header
  * @private
  * @static
  * @type boolean
  */
    _use_default_post_header:true,

 /**
  * @description Determines if a default header of
  * Content-Type of 'application/x-www-form-urlencoded'
  * will be added to any client HTTP headers sent for POST
  * transactions.
  * @property _default_post_header
  * @private
  * @static
  * @type boolean
  */
    _default_post_header:'application/x-www-form-urlencoded',

 /**
  * @description Property modified by setForm() to determine if the data
  * should be submitted as an HTML form.
  * @property _isFormSubmit
  * @private
  * @static
  * @type boolean
  */
    _isFormSubmit:false,

 /**
  * @description Property modified by setForm() to determine if a file(s)
  * upload is expected.
  * @property _isFileUpload
  * @private
  * @static
  * @type boolean
  */
    _isFileUpload:false,

 /**
  * @description Property modified by setForm() to set a reference to the HTML
  * form node if the desired action is file upload.
  * @property _formNode
  * @private
  * @static
  * @type object
  */
    _formNode:null,

 /**
  * @description Property modified by setForm() to set the HTML form data
  * for each transaction.
  * @property _sFormData
  * @private
  * @static
  * @type string
  */
    _sFormData:null,

 /**
  * @description Collection of polling references to the polling mechanism in handleReadyState.
  * @property _poll
  * @private
  * @static
  * @type object
  */
    _poll:{},

 /**
  * @description Queue of timeout values for each transaction callback with a defined timeout value.
  * @property _timeOut
  * @private
  * @static
  * @type object
  */
    _timeOut:{},

  /**
   * @description The polling frequency, in milliseconds, for HandleReadyState.
   * when attempting to determine a transaction's XHR readyState.
   * The default is 50 milliseconds.
   * @property _polling_interval
   * @private
   * @static
   * @type int
   */
     _polling_interval:50,

  /**
   * @description A transaction counter that increments the transaction id for each transaction.
   * @property _transaction_id
   * @private
   * @static
   * @type int
   */
     _transaction_id:0,

  /**
   * @description Member to add an ActiveX id to the existing xml_progid array.
   * In the event(unlikely) a new ActiveX id is introduced, it can be added
   * without internal code modifications.
   * @method setProgId
   * @public
   * @static
   * @param {string} id The ActiveX id to be added to initialize the XHR object.
   * @return void
   */
	setProgId:function(id)
	{
		this._msxml_progid.unshift(id);
	},

  /**
   * @description Member to enable or disable the default POST header.
   * @method setDefaultPostHeader
   * @public
   * @static
   * @param {boolean} b Set and use default header - true or false .
   * @return void
   */
	setDefaultPostHeader:function(b)
	{
		this._use_default_post_header = b;
	},

  /**
   * @description Member to modify the default polling interval.
   * @method setPollingInterval
   * @public
   * @static
   * @param {int} i The polling interval in milliseconds.
   * @return void
   */
	setPollingInterval:function(i)
	{
		if(typeof i == 'number' && isFinite(i)){
			this._polling_interval = i;
		}
	},

  /**
   * @description Instantiates a XMLHttpRequest object and returns an object with two properties:
   * the XMLHttpRequest instance and the transaction id.
   * @method createXhrObject
   * @private
   * @static
   * @param {int} transactionId Property containing the transaction id for this transaction.
   * @return object
   */
	createXhrObject:function(transactionId)
	{
		var obj,http;
		try
		{
			// Instantiates XMLHttpRequest in non-IE browsers and assigns to http.
			http = new XMLHttpRequest();
			//  Object literal with http and tId properties
			obj = { conn:http, tId:transactionId };
		}
		catch(e)
		{
			for(var i=0; i<this._msxml_progid.length; ++i){
				try
				{
					// Instantiates XMLHttpRequest for IE and assign to http.
					http = new ActiveXObject(this._msxml_progid[i]);
					//  Object literal with conn and tId properties
					obj = { conn:http, tId:transactionId };
					break;
				}
				catch(e){}
			}
		}
		finally
		{
			return obj;
		}
	},

  /**
   * @description This method is called by asyncRequest to create a
   * valid connection object for the transaction.  It also passes a
   * transaction id and increments the transaction id counter.
   * @method getConnectionObject
   * @private
   * @static
   * @return {object}
   */
	getConnectionObject:function()
	{
		var o;
		var tId = this._transaction_id;

		try
		{
			o = this.createXhrObject(tId);
			if(o){
				this._transaction_id++;
			}
		}
		catch(e){}
		finally
		{
			return o;
		}
	},

  /**
   * @description Method for initiating an asynchronous request via the XHR object.
   * @method asyncRequest
   * @public
   * @static
   * @param {string} method HTTP transaction method
   * @param {string} uri Fully qualified path of resource
   * @param {callback} callback User-defined callback function or object
   * @param {string} postData POST body
   * @return {object} Returns the connection object
   */
	asyncRequest:function(method, uri, callback, postData)
	{
		var o = this.getConnectionObject();

		if(!o){
			return null;
		}
		else{
			if(this._isFormSubmit){
				if(this._isFileUpload){
					this.uploadFile(o.tId, callback, uri, postData);
					this.releaseObject(o);

					return;
				}

				//If the specified HTTP method is GET, setForm() will return an
				//encoded string that is concatenated to the uri to
				//create a querystring.
				if(method == 'GET'){
					if(this._sFormData.length != 0){
						// If the URI already contains a querystring, append an ampersand
						// and then concatenate _sFormData to the URI.
						uri += ((uri.indexOf('?') == -1)?'?':'&') + this._sFormData;
					}
					else{
						uri += "?" + this._sFormData;
					}
				}
				else if(method == 'POST'){
					//If POST data exist in addition to the HTML form data,
					//it will be concatenated to the form data.
					postData = postData?this._sFormData + "&" + postData:this._sFormData;
				}
			}

			o.conn.open(method, uri, true);

			if(this._isFormSubmit || (postData && this._use_default_post_header)){
				this.initHeader('Content-Type', this._default_post_header);
				if(this._isFormSubmit){
					this.resetFormState();
				}
			}

			if(this._has_http_headers){
				this.setHeader(o);
			}

			this.handleReadyState(o, callback);
			o.conn.send(postData || null);

			return o;
		}
	},

  /**
   * @description This method serves as a timer that polls the XHR object's readyState
   * property during a transaction, instead of binding a callback to the
   * onreadystatechange event.  Upon readyState 4, handleTransactionResponse
   * will process the response, and the timer will be cleared.
   * @method handleReadyState
   * @private
   * @static
   * @param {object} o The connection object
   * @param {callback} callback The user-defined callback object
   * @return {void}
   */
    handleReadyState:function(o, callback)
    {
		var oConn = this;

		if(callback && callback.timeout){
			this._timeOut[o.tId] = window.setTimeout(function(){ oConn.abort(o, callback, true); }, callback.timeout);
		}

		this._poll[o.tId] = window.setInterval(
			function(){
				if(o.conn && o.conn.readyState == 4){
					window.clearInterval(oConn._poll[o.tId]);
					delete oConn._poll[o.tId];

					if(callback && callback.timeout){
						delete oConn._timeOut[o.tId];
					}

					oConn.handleTransactionResponse(o, callback);
				}
			}
		,this._polling_interval);
    },

  /**
   * @description This method attempts to interpret the server response and
   * determine whether the transaction was successful, or if an error or
   * exception was encountered.
   * @method handleTransactionResponse
   * @private
   * @static
   * @param {object} o The connection object
   * @param {object} callback The sser-defined callback object
   * @param {boolean} isAbort Determines if the transaction was aborted.
   * @return {void}
   */
    handleTransactionResponse:function(o, callback, isAbort)
    {
		// If no valid callback is provided, then do not process any callback handling.
		if(!callback){
			this.releaseObject(o);
			return;
		}

		var httpStatus, responseObject;

		try
		{
			if(o.conn.status !== undefined && o.conn.status != 0){
				httpStatus = o.conn.status;
			}
			else{
				httpStatus = 13030;
			}
		}
		catch(e){
			// 13030 is the custom code to indicate the condition -- in Mozilla/FF --
			// when the o object's status and statusText properties are
			// unavailable, and a query attempt throws an exception.
			httpStatus = 13030;
		}

		if(httpStatus >= 200 && httpStatus < 300){
			try
			{
				responseObject = this.createResponseObject(o, callback.argument);
				if(callback.success){
					if(!callback.scope){
						callback.success(responseObject);
					}
					else{
						// If a scope property is defined, the callback will be fired from
						// the context of the object.
						callback.success.apply(callback.scope, [responseObject]);
					}
				}
			}
			catch(e){}
		}
		else{
			try
			{
				switch(httpStatus){
					// The following cases are wininet.dll error codes that may be encountered.
					case 12002: // Server timeout
					case 12029: // 12029 to 12031 correspond to dropped connections.
					case 12030:
					case 12031:
					case 12152: // Connection closed by server.
					case 13030: // See above comments for variable status.
						responseObject = this.createExceptionObject(o.tId, callback.argument, (isAbort?isAbort:false));
						if(callback.failure){
							if(!callback.scope){
								callback.failure(responseObject);
							}
							else{
								callback.failure.apply(callback.scope, [responseObject]);
							}
						}
						break;
					default:
						responseObject = this.createResponseObject(o, callback.argument);
						if(callback.failure){
							if(!callback.scope){
								callback.failure(responseObject);
							}
							else{
								callback.failure.apply(callback.scope, [responseObject]);
							}
						}
				}
			}
			catch(e){}
		}

		this.releaseObject(o);
		responseObject = null;
    },

  /**
   * @description This method evaluates the server response, creates and returns the results via
   * its properties.  Success and failure cases will differ in the response
   * object's property values.
   * @method createResponseObject
   * @private
   * @static
   * @param {object} o The connection object
   * @param {callbackArg} callbackArg The user-defined argument or arguments to be passed to the callback
   * @return {object}
   */
    createResponseObject:function(o, callbackArg)
    {
		var obj = {};
		var headerObj = {};

		try
		{
			var headerStr = o.conn.getAllResponseHeaders();
			var header = headerStr.split('\n');
			for(var i=0; i<header.length; i++){
				var delimitPos = header[i].indexOf(':');
				if(delimitPos != -1){
					headerObj[header[i].substring(0,delimitPos)] = header[i].substring(delimitPos+2);
				}
			}
		}
		catch(e){}

		obj.tId = o.tId;
		obj.status = o.conn.status;
		obj.statusText = o.conn.statusText;
		obj.getResponseHeader = headerObj;
		obj.getAllResponseHeaders = headerStr;
		obj.responseText = o.conn.responseText;
		obj.responseXML = o.conn.responseXML;

		if(typeof callbackArg !== undefined){
			obj.argument = callbackArg;
		}

		return obj;
    },

  /**
   * @description If a transaction cannot be completed due to dropped or closed connections,
   * there may be not be enough information to build a full response object.
   * The failure callback will be fired and this specific condition can be identified
   * by a status property value of 0.
   *
   * If an abort was successful, the status property will report a value of -1.
   *
   * @method createExceptionObject
   * @private
   * @static
   * @param {int} tId The Transaction Id
   * @param {callbackArg} callbackArg The user-defined argument or arguments to be passed to the callback
   * @param {boolean} isAbort Determines if the exception case is caused by a transaction abort
   * @return {object}
   */
    createExceptionObject:function(tId, callbackArg, isAbort)
    {
		var COMM_CODE = 0;
		var COMM_ERROR = 'communication failure';
		var ABORT_CODE = -1;
		var ABORT_ERROR = 'transaction aborted';

		var obj = {};

		obj.tId = tId;
		if(isAbort){
			obj.status = ABORT_CODE;
			obj.statusText = ABORT_ERROR;
		}
		else{
			obj.status = COMM_CODE;
			obj.statusText = COMM_ERROR;
		}

		if(callbackArg){
			obj.argument = callbackArg;
		}

		return obj;
    },

  /**
   * @description Public method that stores the custom HTTP headers for each transaction.
   * @method initHeader
   * @public
   * @static
   * @param {string} label The HTTP header label
   * @param {string} value The HTTP header value
   * @return {void}
   */
	initHeader:function(label,value)
	{
		if(this._http_header[label] === undefined){
			this._http_header[label] = value;
		}
		else{
			// Concatenate multiple values, comma-delimited,
			// for the same header label,
			this._http_header[label] =  value + "," + this._http_header[label];
		}

		this._has_http_headers = true;
	},

  /**
   * @description Accessor that sets the HTTP headers for each transaction.
   * @method setHeader
   * @private
   * @static
   * @param {object} o The connection object for the transaction.
   * @return {void}
   */
	setHeader:function(o)
	{
		for(var prop in this._http_header){
			if(this._http_header.hasOwnProperty(prop)){
				o.conn.setRequestHeader(prop, this._http_header[prop]);
			}
		}
		delete this._http_header;

		this._http_header = {};
		this._has_http_headers = false;
	},

  /**
   * @description This method assembles the form label and value pairs and
   * constructs an encoded string.
   * asyncRequest() will automatically initialize the
   * transaction with a HTTP header Content-Type of
   * application/x-www-form-urlencoded.
   * @method setForm
   * @public
   * @static
   * @param {string || object} form id or name attribute, or form object.
   * @param {string} optional boolean to indicate SSL environment.
   * @param {string || boolean} optional qualified path of iframe resource for SSL in IE.
   * @return {string} string of the HTML form field name and value pairs..
   */
	setForm:function(formId, isUpload, secureUri)
	{
		this.resetFormState();
		var oForm;
		if(typeof formId == 'string'){
			// Determine if the argument is a form id or a form name.
			// Note form name usage is deprecated but supported
			// here for legacy reasons.
			oForm = (document.getElementById(formId) || document.forms[formId]);
		}
		else if(typeof formId == 'object'){
			// Treat argument as an HTML form object.
			oForm = formId;
		}
		else{
			return;
		}

		// If the isUpload argument is true, setForm will call createFrame to initialize
		// an iframe as the form target.
		//
		// The argument secureURI is also required by IE in SSL environments
		// where the secureURI string is a fully qualified HTTP path, used to set the source
		// of the iframe, to a stub resource in the same domain.
		if(isUpload){

			// Create iframe in preparation for file upload.
			this.createFrame(secureUri?secureUri:null);

			// Set form reference and file upload properties to true.
			this._isFormSubmit = true;
			this._isFileUpload = true;
			this._formNode = oForm;

			return;
		}

		var oElement, oName, oValue, oDisabled;
		var hasSubmit = false;

		// Iterate over the form elements collection to construct the
		// label-value pairs.
		for (var i=0; i<oForm.elements.length; i++){
			oElement = oForm.elements[i];
			oDisabled = oForm.elements[i].disabled;
			oName = oForm.elements[i].name;
			oValue = oForm.elements[i].value;

			// Do not submit fields that are disabled or
			// do not have a name attribute value.
			if(!oDisabled && oName)
			{
				switch (oElement.type)
				{
					case 'select-one':
					case 'select-multiple':
						for(var j=0; j<oElement.options.length; j++){
							if(oElement.options[j].selected){
								if(window.ActiveXObject){
									this._sFormData += encodeURIComponent(oName) + '=' + encodeURIComponent(oElement.options[j].attributes['value'].specified?oElement.options[j].value:oElement.options[j].text) + '&';
								}
								else{
									this._sFormData += encodeURIComponent(oName) + '=' + encodeURIComponent(oElement.options[j].hasAttribute('value')?oElement.options[j].value:oElement.options[j].text) + '&';
								}

							}
						}
						break;
					case 'radio':
					case 'checkbox':
						if(oElement.checked){
							this._sFormData += encodeURIComponent(oName) + '=' + encodeURIComponent(oValue) + '&';
						}
						break;
					case 'file':
						// stub case as XMLHttpRequest will only send the file path as a string.
					case undefined:
						// stub case for fieldset element which returns undefined.
					case 'reset':
						// stub case for input type reset button.
					case 'button':
						// stub case for input type button elements.
						break;
					case 'submit':
						if(hasSubmit == false){
							this._sFormData += encodeURIComponent(oName) + '=' + encodeURIComponent(oValue) + '&';
							hasSubmit = true;
						}
						break;
					default:
						this._sFormData += encodeURIComponent(oName) + '=' + encodeURIComponent(oValue) + '&';
						break;
				}
			}
		}

		this._isFormSubmit = true;
		this._sFormData = this._sFormData.substr(0, this._sFormData.length - 1);

		return this._sFormData;
	},

  /**
   * @description Resets HTML form properties when an HTML form or HTML form
   * with file upload transaction is sent.
   * @method resetFormState
   * @private
   * @static
   * @return {void}
   */
	resetFormState:function(){
		this._isFormSubmit = false;
		this._isFileUpload = false;
		this._formNode = null;
		this._sFormData = "";
	},

  /**
   * @description Creates an iframe to be used for form file uploads.  It is remove from the
   * document upon completion of the upload transaction.
   * @method createFrame
   * @private
   * @static
   * @param {string} secureUri Optional qualified path of iframe resource for SSL in IE.
   * @return {void}
   */
	createFrame:function(secureUri){

		// IE does not allow the setting of id and name attributes as object
		// properties via createElement().  A different iframe creation
		// pattern is required for IE.
		var frameId = 'yuiIO' + this._transaction_id;
		if(window.ActiveXObject){
			var io = document.createElement('<iframe id="' + frameId + '" name="' + frameId + '" />');

			// IE will throw a security exception in an SSL environment if the
			// iframe source is undefined.
			if(typeof secureUri == 'boolean'){
				io.src = 'javascript:false';
			}
			else if(typeof secureURI == 'string'){
				// Deprecated
				io.src = secureUri;
			}
		}
		else{
			var io = document.createElement('iframe');
			io.id = frameId;
			io.name = frameId;
		}

		io.style.position = 'absolute';
		io.style.top = '-1000px';
		io.style.left = '-1000px';

		document.body.appendChild(io);
	},

  /**
   * @description Parses the POST data and creates hidden form elements
   * for each key-value, and appends them to the HTML form object.
   * @method appendPostData
   * @private
   * @static
   * @param {string} postData The HTTP POST data
   * @return {array} formElements Collection of hidden fields.
   */
	appendPostData:function(postData)
	{
		var formElements = [];
		var postMessage = postData.split('&');
		for(var i=0; i < postMessage.length; i++){
			var delimitPos = postMessage[i].indexOf('=');
			if(delimitPos != -1){
				formElements[i] = document.createElement('input');
				formElements[i].type = 'hidden';
				formElements[i].name = postMessage[i].substring(0,delimitPos);
				formElements[i].value = postMessage[i].substring(delimitPos+1);
				this._formNode.appendChild(formElements[i]);
			}
		}

		return formElements;
	},

  /**
   * @description Uploads HTML form, including files/attachments, to the
   * iframe created in createFrame.
   * @method uploadFile
   * @private
   * @static
   * @param {int} id The transaction id.
   * @param {object} callback - User-defined callback object.
   * @param {string} uri Fully qualified path of resource.
   * @return {void}
   */
	uploadFile:function(id, callback, uri, postData){

		// Each iframe has an id prefix of "yuiIO" followed
		// by the unique transaction id.
		var frameId = 'yuiIO' + id;
		var io = document.getElementById(frameId);

		// Initialize the HTML form properties in case they are
		// not defined in the HTML form.
		this._formNode.action = uri;
		this._formNode.method = 'POST';
		this._formNode.target = frameId;

		if(this._formNode.encoding){
			// IE does not respect property enctype for HTML forms.
			// Instead use property encoding.
			this._formNode.encoding = 'multipart/form-data';
		}
		else{
			this._formNode.enctype = 'multipart/form-data';
		}

		if(postData){
			var oElements = this.appendPostData(postData);
		}

		this._formNode.submit();

		if(oElements && oElements.length > 0){
			try
			{
				for(var i=0; i < oElements.length; i++){
					this._formNode.removeChild(oElements[i]);
				}
			}
			catch(e){}
		}

		// Reset HTML form status properties.
		this.resetFormState();

		// Create the upload callback handler that fires when the iframe
		// receives the load event.  Subsequently, the event handler is detached
		// and the iframe removed from the document.

		var uploadCallback = function()
		{
			var obj = {};
			obj.tId = id;
			obj.argument = callback.argument;

			try
			{
				obj.responseText = io.contentWindow.document.body?io.contentWindow.document.body.innerHTML:null;
				obj.responseXML = io.contentWindow.document.XMLDocument?io.contentWindow.document.XMLDocument:io.contentWindow.document;
			}
			catch(e){}

			if(callback.upload){
				if(!callback.scope){
					callback.upload(obj);
				}
				else{
					callback.upload.apply(callback.scope, [obj]);
				}
			}

			if(YAHOO.util.Event){
				YAHOO.util.Event.removeListener(io, "load", uploadCallback);
			}
			else if(window.detachEvent){
				io.detachEvent('onload', uploadCallback);
			}
			else{
				io.removeEventListener('load', uploadCallback, false);
			}
			setTimeout(function(){ document.body.removeChild(io); }, 100);
		};


		// Bind the onload handler to the iframe to detect the file upload response.
		if(YAHOO.util.Event){
			YAHOO.util.Event.addListener(io, "load", uploadCallback);
		}
		else if(window.attachEvent){
			io.attachEvent('onload', uploadCallback);
		}
		else{
			io.addEventListener('load', uploadCallback, false);
		}
	},

  /**
   * @description Method to terminate a transaction, if it has not reached readyState 4.
   * @method abort
   * @public
   * @static
   * @param {object} o The connection object returned by asyncRequest.
   * @param {object} callback  User-defined callback object.
   * @param {string} isTimeout boolean to indicate if abort was a timeout.
   * @return {boolean}
   */
	abort:function(o, callback, isTimeout)
	{
		if(this.isCallInProgress(o)){
			o.conn.abort();
			window.clearInterval(this._poll[o.tId]);
			delete this._poll[o.tId];
			if(isTimeout){
				delete this._timeOut[o.tId];
			}

			this.handleTransactionResponse(o, callback, true);

			return true;
		}
		else{
			return false;
		}
	},

  /**
   * Public method to check if the transaction is still being processed.
   *
   * @method isCallInProgress
   * @public
   * @static
   * @param {object} o The connection object returned by asyncRequest
   * @return {boolean}
   */
	isCallInProgress:function(o)
	{
		// if the XHR object assigned to the transaction has not been dereferenced,
		// then check its readyState status.  Otherwise, return false.
		if(o.conn){
			return o.conn.readyState != 4 && o.conn.readyState != 0;
		}
		else{
			//The XHR object has been destroyed.
			return false;
		}
	},

  /**
   * @description Dereference the XHR instance and the connection object after the transaction is completed.
   * @method releaseObject
   * @private
   * @static
   * @param {object} o The connection object
   * @return {void}
   */
	releaseObject:function(o)
	{
		//dereference the XHR instance.
		o.conn = null;
		//dereference the connection object.
		o = null;
	}
};

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 0.12.2
*/
/**
* Config is a utility used within an Object to allow the implementer to maintain a list of local configuration properties and listen for changes to those properties dynamically using CustomEvent. The initial values are also maintained so that the configuration can be reset at any given point to its initial state.
* @namespace YAHOO.util
* @class Config
* @constructor
* @param {Object}	owner	The owner Object to which this Config Object belongs
*/
YAHOO.util.Config = function(owner) {
	if (owner) {
		this.init(owner);
	}
};

YAHOO.util.Config.prototype = {
	
	/**
	* Object reference to the owner of this Config Object
	* @property owner
	* @type Object
	*/
	owner : null,

	/**
	* Boolean flag that specifies whether a queue is currently being executed
	* @property queueInProgress
	* @type Boolean
	*/
	queueInProgress : false,


	/**
	* Validates that the value passed in is a Boolean.
	* @method checkBoolean
	* @param	{Object}	val	The value to validate
	* @return	{Boolean}	true, if the value is valid
	*/	
	checkBoolean: function(val) {
		if (typeof val == 'boolean') {
			return true;
		} else {
			return false;
		}
	},

	/**
	* Validates that the value passed in is a number.
	* @method checkNumber
	* @param	{Object}	val	The value to validate
	* @return	{Boolean}	true, if the value is valid
	*/
	checkNumber: function(val) {
		if (isNaN(val)) {
			return false;
		} else {
			return true;
		}
	}
};


/**
* Initializes the configuration Object and all of its local members.
* @method init
* @param {Object}	owner	The owner Object to which this Config Object belongs
*/
YAHOO.util.Config.prototype.init = function(owner) {

	this.owner = owner;

	/**
	* Object reference to the owner of this Config Object
	* @event configChangedEvent
	*/
	this.configChangedEvent = new YAHOO.util.CustomEvent("configChanged");

	this.queueInProgress = false;

	/* Private Members */

	/**
	* Maintains the local collection of configuration property objects and their specified values
	* @property config
	* @private
	* @type Object
	*/ 
	var config = {};

	/**
	* Maintains the local collection of configuration property objects as they were initially applied.
	* This object is used when resetting a property.
	* @property initialConfig
	* @private
	* @type Object
	*/ 
	var initialConfig = {};

	/**
	* Maintains the local, normalized CustomEvent queue
	* @property eventQueue
	* @private
	* @type Object
	*/ 
	var eventQueue = [];

	/**
	* Fires a configuration property event using the specified value. 
	* @method fireEvent
	* @private
	* @param {String}	key			The configuration property's name
	* @param {value}	Object		The value of the correct type for the property
	*/ 
	var fireEvent = function( key, value ) {
		key = key.toLowerCase();

		var property = config[key];

		if (typeof property != 'undefined' && property.event) {
			property.event.fire(value);
		}	
	};
	/* End Private Members */

	/**
	* Adds a property to the Config Object's private config hash.
	* @method addProperty
	* @param {String}	key	The configuration property's name
	* @param {Object}	propertyObject	The Object containing all of this property's arguments
	*/
	this.addProperty = function( key, propertyObject ) {
		key = key.toLowerCase();

		config[key] = propertyObject;

		propertyObject.event = new YAHOO.util.CustomEvent(key);
		propertyObject.key = key;

		if (propertyObject.handler) {
			propertyObject.event.subscribe(propertyObject.handler, this.owner, true);
		}

		this.setProperty(key, propertyObject.value, true);
		
		if (! propertyObject.suppressEvent) {
			this.queueProperty(key, propertyObject.value);
		}
	};

	/**
	* Returns a key-value configuration map of the values currently set in the Config Object.
	* @method getConfig
	* @return {Object} The current config, represented in a key-value map
	*/
	this.getConfig = function() {
		var cfg = {};
			
		for (var prop in config) {
			var property = config[prop];
			if (typeof property != 'undefined' && property.event) {
				cfg[prop] = property.value;
			}
		}
		
		return cfg;
	};

	/**
	* Returns the value of specified property.
	* @method getProperty
	* @param {String} key	The name of the property
	* @return {Object}		The value of the specified property
	*/
	this.getProperty = function(key) {
		key = key.toLowerCase();

		var property = config[key];
		if (typeof property != 'undefined' && property.event) {
			return property.value;
		} else {
			return undefined;
		}
	};

	/**
	* Resets the specified property's value to its initial value.
	* @method resetProperty
	* @param {String} key	The name of the property
	* @return {Boolean} True is the property was reset, false if not
	*/
	this.resetProperty = function(key) {
		key = key.toLowerCase();

		var property = config[key];
		if (typeof property != 'undefined' && property.event) {
			if (initialConfig[key] && initialConfig[key] != 'undefined')	{
				this.setProperty(key, initialConfig[key]);
			}
			return true;
		} else {
			return false;
		}
	};

	/**
	* Sets the value of a property. If the silent property is passed as true, the property's event will not be fired.
	* @method setProperty
	* @param {String} key		The name of the property
	* @param {String} value		The value to set the property to
	* @param {Boolean} silent	Whether the value should be set silently, without firing the property event.
	* @return {Boolean}			True, if the set was successful, false if it failed.
	*/
	this.setProperty = function(key, value, silent) {
		key = key.toLowerCase();

		if (this.queueInProgress && ! silent) {
			this.queueProperty(key,value); // Currently running through a queue... 
			return true;
		} else {
			var property = config[key];
			if (typeof property != 'undefined' && property.event) {
				if (property.validator && ! property.validator(value)) { // validator
					return false;
				} else {
					property.value = value;
					if (! silent) {
						fireEvent(key, value);
						this.configChangedEvent.fire([key, value]);
					}
					return true;
				}
			} else {
				return false;
			}
		}
	};

	/**
	* Sets the value of a property and queues its event to execute. If the event is already scheduled to execute, it is
	* moved from its current position to the end of the queue.
	* @method queueProperty
	* @param {String} key	The name of the property
	* @param {String} value	The value to set the property to
	* @return {Boolean}		true, if the set was successful, false if it failed.
	*/	
	this.queueProperty = function(key, value) {
		key = key.toLowerCase();

		var property = config[key];
							
		if (typeof property != 'undefined' && property.event) {
			if (typeof value != 'undefined' && property.validator && ! property.validator(value)) { // validator
				return false;
			} else {

				if (typeof value != 'undefined') {
					property.value = value;
				} else {
					value = property.value;
				}

				var foundDuplicate = false;

				for (var i=0;i<eventQueue.length;i++) {
					var queueItem = eventQueue[i];

					if (queueItem) {
						var queueItemKey = queueItem[0];
						var queueItemValue = queueItem[1];
						
						if (queueItemKey.toLowerCase() == key) {
							// found a dupe... push to end of queue, null current item, and break
							eventQueue[i] = null;
							eventQueue.push([key, (typeof value != 'undefined' ? value : queueItemValue)]);
							foundDuplicate = true;
							break;
						}
					}
				}
				
				if (! foundDuplicate && typeof value != 'undefined') { // this is a refire, or a new property in the queue
					eventQueue.push([key, value]);
				}
			}

			if (property.supercedes) {
				for (var s=0;s<property.supercedes.length;s++) {
					var supercedesCheck = property.supercedes[s];

					for (var q=0;q<eventQueue.length;q++) {
						var queueItemCheck = eventQueue[q];

						if (queueItemCheck) {
							var queueItemCheckKey = queueItemCheck[0];
							var queueItemCheckValue = queueItemCheck[1];
							
							if ( queueItemCheckKey.toLowerCase() == supercedesCheck.toLowerCase() ) {
								eventQueue.push([queueItemCheckKey, queueItemCheckValue]);
								eventQueue[q] = null;
								break;
							}
						}
					}
				}
			}

			return true;
		} else {
			return false;
		}
	};

	/**
	* Fires the event for a property using the property's current value.
	* @method refireEvent
	* @param {String} key	The name of the property
	*/
	this.refireEvent = function(key) {
		key = key.toLowerCase();

		var property = config[key];
		if (typeof property != 'undefined' && property.event && typeof property.value != 'undefined') {
			if (this.queueInProgress) {
				this.queueProperty(key);
			} else {
				fireEvent(key, property.value);
			}
		}
	};

	/**
	* Applies a key-value Object literal to the configuration, replacing any existing values, and queueing the property events.
	* Although the values will be set, fireQueue() must be called for their associated events to execute.
	* @method applyConfig
	* @param {Object}	userConfig	The configuration Object literal
	* @param {Boolean}	init		When set to true, the initialConfig will be set to the userConfig passed in, so that calling a reset will reset the properties to the passed values.
	*/
	this.applyConfig = function(userConfig, init) {
		if (init) {
			initialConfig = userConfig;
		}
		for (var prop in userConfig) {
			this.queueProperty(prop, userConfig[prop]);
		}
	};

	/**
	* Refires the events for all configuration properties using their current values.
	* @method refresh
	*/
	this.refresh = function() {
		for (var prop in config) {
			this.refireEvent(prop);
		}
	};

	/**
	* Fires the normalized list of queued property change events
	* @method fireQueue
	*/
	this.fireQueue = function() {
		this.queueInProgress = true;
		for (var i=0;i<eventQueue.length;i++) {
			var queueItem = eventQueue[i];
			if (queueItem) {
				var key = queueItem[0];
				var value = queueItem[1];
				
				var property = config[key];
				property.value = value;

				fireEvent(key,value);
			}
		}
		
		this.queueInProgress = false;
		eventQueue = [];
	};

	/**
	* Subscribes an external handler to the change event for any given property. 
	* @method subscribeToConfigEvent
	* @param {String}	key			The property name
	* @param {Function}	handler		The handler function to use subscribe to the property's event
	* @param {Object}	obj			The Object to use for scoping the event handler (see CustomEvent documentation)
	* @param {Boolean}	override	Optional. If true, will override "this" within the handler to map to the scope Object passed into the method.
	* @return {Boolean}				True, if the subscription was successful, otherwise false.
	*/	
	this.subscribeToConfigEvent = function(key, handler, obj, override) {
		key = key.toLowerCase();

		var property = config[key];
		if (typeof property != 'undefined' && property.event) {
			if (! YAHOO.util.Config.alreadySubscribed(property.event, handler, obj)) {
				property.event.subscribe(handler, obj, override);
			}
			return true;
		} else {
			return false;
		}
	};

	/**
	* Unsubscribes an external handler from the change event for any given property. 
	* @method unsubscribeFromConfigEvent
	* @param {String}	key			The property name
	* @param {Function}	handler		The handler function to use subscribe to the property's event
	* @param {Object}	obj			The Object to use for scoping the event handler (see CustomEvent documentation)
	* @return {Boolean}				True, if the unsubscription was successful, otherwise false.
	*/
	this.unsubscribeFromConfigEvent = function(key, handler, obj) {
		key = key.toLowerCase();

		var property = config[key];
		if (typeof property != 'undefined' && property.event) {
			return property.event.unsubscribe(handler, obj);
		} else {
			return false;
		}
	};

	/**
	* Returns a string representation of the Config object
	* @method toString
	* @return {String}	The Config object in string format.
	*/
	this.toString = function() {
		var output = "Config";
		if (this.owner) {
			output += " [" + this.owner.toString() + "]";
		}
		return output;
	};

	/**
	* Returns a string representation of the Config object's current CustomEvent queue
	* @method outputEventQueue
	* @return {String}	The string list of CustomEvents currently queued for execution
	*/
	this.outputEventQueue = function() {
		var output = "";
		for (var q=0;q<eventQueue.length;q++) {
			var queueItem = eventQueue[q];
			if (queueItem) {
				output += queueItem[0] + "=" + queueItem[1] + ", ";
			}
		}
		return output;
	};
};

/**
* Checks to determine if a particular function/Object pair are already subscribed to the specified CustomEvent
* @method YAHOO.util.Config.alreadySubscribed
* @static
* @param {YAHOO.util.CustomEvent} evt	The CustomEvent for which to check the subscriptions
* @param {Function}	fn	The function to look for in the subscribers list
* @param {Object}	obj	The execution scope Object for the subscription
* @return {Boolean}	true, if the function/Object pair is already subscribed to the CustomEvent passed in
*/
YAHOO.util.Config.alreadySubscribed = function(evt, fn, obj) {
	for (var e=0;e<evt.subscribers.length;e++) {
		var subsc = evt.subscribers[e];
		if (subsc && subsc.obj == obj && subsc.fn == fn) {
			return true;
		}
	}
	return false;
};

/**
* YAHOO.widget.DateMath is used for simple date manipulation. The class is a static utility
* used for adding, subtracting, and comparing dates.
* @namespace YAHOO.widget
* @class DateMath
*/
YAHOO.widget.DateMath = {
	/**
	* Constant field representing Day
	* @property DAY
	* @static
	* @final
	* @type String
	*/
	DAY : "D",

	/**
	* Constant field representing Week
	* @property WEEK
	* @static
	* @final
	* @type String
	*/
	WEEK : "W",

	/**
	* Constant field representing Year
	* @property YEAR
	* @static
	* @final
	* @type String
	*/
	YEAR : "Y",

	/**
	* Constant field representing Month
	* @property MONTH
	* @static
	* @final
	* @type String
	*/
	MONTH : "M",

	/**
	* Constant field representing one day, in milliseconds
	* @property ONE_DAY_MS
	* @static
	* @final
	* @type Number
	*/
	ONE_DAY_MS : 1000*60*60*24,

	/**
	* Adds the specified amount of time to the this instance.
	* @method add
	* @param {Date} date	The JavaScript Date object to perform addition on
	* @param {String} field	The field constant to be used for performing addition.
	* @param {Number} amount	The number of units (measured in the field constant) to add to the date.
	* @return {Date} The resulting Date object
	*/
	add : function(date, field, amount) {
		var d = new Date(date.getTime());
		switch (field) {
			case this.MONTH:
				var newMonth = date.getMonth() + amount;
				var years = 0;


				if (newMonth < 0) {
					while (newMonth < 0) {
						newMonth += 12;
						years -= 1;
					}
				} else if (newMonth > 11) {
					while (newMonth > 11) {
						newMonth -= 12;
						years += 1;
					}
				}
				
				d.setMonth(newMonth);
				d.setFullYear(date.getFullYear() + years);
				break;
			case this.DAY:
				d.setDate(date.getDate() + amount);
				break;
			case this.YEAR:
				d.setFullYear(date.getFullYear() + amount);
				break;
			case this.WEEK:
				d.setDate(date.getDate() + (amount * 7));
				break;
		}
		return d;
	},

	/**
	* Subtracts the specified amount of time from the this instance.
	* @method subtract
	* @param {Date} date	The JavaScript Date object to perform subtraction on
	* @param {Number} field	The this field constant to be used for performing subtraction.
	* @param {Number} amount	The number of units (measured in the field constant) to subtract from the date.
	* @return {Date} The resulting Date object
	*/
	subtract : function(date, field, amount) {
		return this.add(date, field, (amount*-1));
	},

	/**
	* Determines whether a given date is before another date on the calendar.
	* @method before
	* @param {Date} date		The Date object to compare with the compare argument
	* @param {Date} compareTo	The Date object to use for the comparison
	* @return {Boolean} true if the date occurs before the compared date; false if not.
	*/
	before : function(date, compareTo) {
		var ms = compareTo.getTime();
		if (date.getTime() < ms) {
			return true;
		} else {
			return false;
		}
	},

	/**
	* Determines whether a given date is after another date on the calendar.
	* @method after
	* @param {Date} date		The Date object to compare with the compare argument
	* @param {Date} compareTo	The Date object to use for the comparison
	* @return {Boolean} true if the date occurs after the compared date; false if not.
	*/
	after : function(date, compareTo) {
		var ms = compareTo.getTime();
		if (date.getTime() > ms) {
			return true;
		} else {
			return false;
		}
	},

	/**
	* Determines whether a given date is between two other dates on the calendar.
	* @method between
	* @param {Date} date		The date to check for
	* @param {Date} dateBegin	The start of the range
	* @param {Date} dateEnd		The end of the range
	* @return {Boolean} true if the date occurs between the compared dates; false if not.
	*/
	between : function(date, dateBegin, dateEnd) {
		if (this.after(date, dateBegin) && this.before(date, dateEnd)) {
			return true;
		} else {
			return false;
		}
	},
	
	/**
	* Retrieves a JavaScript Date object representing January 1 of any given year.
	* @method getJan1
	* @param {Number} calendarYear		The calendar year for which to retrieve January 1
	* @return {Date}	January 1 of the calendar year specified.
	*/
	getJan1 : function(calendarYear) {
		return new Date(calendarYear,0,1); 
	},

	/**
	* Calculates the number of days the specified date is from January 1 of the specified calendar year.
	* Passing January 1 to this function would return an offset value of zero.
	* @method getDayOffset
	* @param {Date}	date	The JavaScript date for which to find the offset
	* @param {Number} calendarYear	The calendar year to use for determining the offset
	* @return {Number}	The number of days since January 1 of the given year
	*/
	getDayOffset : function(date, calendarYear) {
		var beginYear = this.getJan1(calendarYear); // Find the start of the year. This will be in week 1.
		
		// Find the number of days the passed in date is away from the calendar year start
		var dayOffset = Math.ceil((date.getTime()-beginYear.getTime()) / this.ONE_DAY_MS);
		return dayOffset;
	},

	/**
	* Calculates the week number for the given date. This function assumes that week 1 is the
	* week in which January 1 appears, regardless of whether the week consists of a full 7 days.
	* The calendar year can be specified to help find what a the week number would be for a given
	* date if the date overlaps years. For instance, a week may be considered week 1 of 2005, or
	* week 53 of 2004. Specifying the optional calendarYear allows one to make this distinction
	* easily.
	* @method getWeekNumber
	* @param {Date}	date	The JavaScript date for which to find the week number
	* @param {Number} calendarYear	OPTIONAL - The calendar year to use for determining the week number. Default is
	*											the calendar year of parameter "date".
	* @param {Number} weekStartsOn	OPTIONAL - The integer (0-6) representing which day a week begins on. Default is 0 (for Sunday).
	* @return {Number}	The week number of the given date.
	*/
	getWeekNumber : function(date, calendarYear) {
		date = this.clearTime(date);
		var nearestThurs = new Date(date.getTime() + (4 * this.ONE_DAY_MS) - ((date.getDay()) * this.ONE_DAY_MS));

		var jan1 = new Date(nearestThurs.getFullYear(),0,1);
		var dayOfYear = ((nearestThurs.getTime() - jan1.getTime()) / this.ONE_DAY_MS) - 1;

		var weekNum = Math.ceil((dayOfYear)/ 7);
		return weekNum;
	},

	/**
	* Determines if a given week overlaps two different years.
	* @method isYearOverlapWeek
	* @param {Date}	weekBeginDate	The JavaScript Date representing the first day of the week.
	* @return {Boolean}	true if the date overlaps two different years.
	*/
	isYearOverlapWeek : function(weekBeginDate) {
		var overlaps = false;
		var nextWeek = this.add(weekBeginDate, this.DAY, 6);
		if (nextWeek.getFullYear() != weekBeginDate.getFullYear()) {
			overlaps = true;
		}
		return overlaps;
	},

	/**
	* Determines if a given week overlaps two different months.
	* @method isMonthOverlapWeek
	* @param {Date}	weekBeginDate	The JavaScript Date representing the first day of the week.
	* @return {Boolean}	true if the date overlaps two different months.
	*/
	isMonthOverlapWeek : function(weekBeginDate) {
		var overlaps = false;
		var nextWeek = this.add(weekBeginDate, this.DAY, 6);
		if (nextWeek.getMonth() != weekBeginDate.getMonth()) {
			overlaps = true;
		}
		return overlaps;
	},

	/**
	* Gets the first day of a month containing a given date.
	* @method findMonthStart
	* @param {Date}	date	The JavaScript Date used to calculate the month start
	* @return {Date}		The JavaScript Date representing the first day of the month
	*/
	findMonthStart : function(date) {
		var start = new Date(date.getFullYear(), date.getMonth(), 1);
		return start;
	},

	/**
	* Gets the last day of a month containing a given date.
	* @method findMonthEnd
	* @param {Date}	date	The JavaScript Date used to calculate the month end
	* @return {Date}		The JavaScript Date representing the last day of the month
	*/
	findMonthEnd : function(date) {
		var start = this.findMonthStart(date);
		var nextMonth = this.add(start, this.MONTH, 1);
		var end = this.subtract(nextMonth, this.DAY, 1);
		return end;
	},

	/**
	* Clears the time fields from a given date, effectively setting the time to 12 noon.
	* @method clearTime
	* @param {Date}	date	The JavaScript Date for which the time fields will be cleared
	* @return {Date}		The JavaScript Date cleared of all time fields
	*/
	clearTime : function(date) {
		date.setHours(12,0,0,0);
		return date;
	}
};

/**
* The Calendar component is a UI control that enables users to choose one or more dates from a graphical calendar presented in a one-month ("one-up") or two-month ("two-up") interface. Calendars are generated entirely via script and can be navigated without any page refreshes.
* @module    calendar
* @title     Calendar
* @namespace YAHOO.widget
* @requires  yahoo,dom,event
*/

/**
* Calendar is the base class for the Calendar widget. In its most basic
* implementation, it has the ability to render a calendar widget on the page
* that can be manipulated to select a single date, move back and forth between
* months and years.
* <p>To construct the placeholder for the calendar widget, the code is as
* follows:
*	<xmp>
*		<div id="cal1Container"></div>
*	</xmp>
* Note that the table can be replaced with any kind of element.
* </p>
* @namespace YAHOO.widget
* @class Calendar
* @constructor
* @param {String}	id			The id of the table element that will represent the calendar widget
* @param {String}	containerId	The id of the container div element that will wrap the calendar table
* @param {Object}	config		The configuration object containing the Calendar's arguments
*/
YAHOO.widget.Calendar = function(id, containerId, config) {
	this.init(id, containerId, config);
};

/**
* The path to be used for images loaded for the Calendar
* @property YAHOO.widget.Calendar.IMG_ROOT
* @static
* @type String
*/
YAHOO.widget.Calendar.IMG_ROOT = (window.location.href.toLowerCase().indexOf("https") === 0 ? "https://a248.e.akamai.net/sec.yimg.com/i/" : "http://us.i1.yimg.com/us.yimg.com/i/");

/**
* Type constant used for renderers to represent an individual date (M/D/Y)
* @property YAHOO.widget.Calendar.DATE
* @static
* @final
* @type String
*/
YAHOO.widget.Calendar.DATE = "D";

/**
* Type constant used for renderers to represent an individual date across any year (M/D)
* @property YAHOO.widget.Calendar.MONTH_DAY
* @static
* @final
* @type String
*/
YAHOO.widget.Calendar.MONTH_DAY = "MD";

/**
* Type constant used for renderers to represent a weekday
* @property YAHOO.widget.Calendar.WEEKDAY
* @static
* @final
* @type String
*/
YAHOO.widget.Calendar.WEEKDAY = "WD";

/**
* Type constant used for renderers to represent a range of individual dates (M/D/Y-M/D/Y)
* @property YAHOO.widget.Calendar.RANGE
* @static
* @final
* @type String
*/
YAHOO.widget.Calendar.RANGE = "R";

/**
* Type constant used for renderers to represent a month across any year
* @property YAHOO.widget.Calendar.MONTH
* @static
* @final
* @type String
*/
YAHOO.widget.Calendar.MONTH = "M";

/**
* Constant that represents the total number of date cells that are displayed in a given month
* @property YAHOO.widget.Calendar.DISPLAY_DAYS
* @static
* @final
* @type Number
*/
YAHOO.widget.Calendar.DISPLAY_DAYS = 42;

/**
* Constant used for halting the execution of the remainder of the render stack
* @property YAHOO.widget.Calendar.STOP_RENDER
* @static
* @final
* @type String
*/
YAHOO.widget.Calendar.STOP_RENDER = "S";

YAHOO.widget.Calendar.prototype = {

	/**
	* The configuration object used to set up the calendars various locale and style options.
	* @property Config
	* @private
	* @deprecated Configuration properties should be set by calling Calendar.cfg.setProperty.
	* @type Object
	*/
	Config : null,

	/**
	* The parent CalendarGroup, only to be set explicitly by the parent group
	* @property parent
	* @type CalendarGroup
	*/	
	parent : null,

	/**
	* The index of this item in the parent group
	* @property index
	* @type Number
	*/
	index : -1,

	/**
	* The collection of calendar table cells
	* @property cells
	* @type HTMLTableCellElement[]
	*/
	cells : null,
	
	/**
	* The collection of calendar cell dates that is parallel to the cells collection. The array contains dates field arrays in the format of [YYYY, M, D].
	* @property cellDates
	* @type Array[](Number[])
	*/
	cellDates : null,

	/**
	* The id that uniquely identifies this calendar. This id should match the id of the placeholder element on the page.
	* @property id
	* @type String
	*/
	id : null,

	/**
	* The DOM element reference that points to this calendar's container element. The calendar will be inserted into this element when the shell is rendered.
	* @property oDomContainer
	* @type HTMLElement
	*/
	oDomContainer : null,

	/**
	* A Date object representing today's date.
	* @property today
	* @type Date
	*/
	today : null,

	/**
	* The list of render functions, along with required parameters, used to render cells. 
	* @property renderStack
	* @type Array[]
	*/
	renderStack : null,

	/**
	* A copy of the initial render functions created before rendering.
	* @property _renderStack
	* @private
	* @type Array
	*/
	_renderStack : null,

	/**
	* A Date object representing the month/year that the calendar is initially set to
	* @property _pageDate
	* @private
	* @type Date
	*/
	_pageDate : null,

	/**
	* The private list of initially selected dates.
	* @property _selectedDates
	* @private
	* @type Array
	*/
	_selectedDates : null,

	/**
	* A map of DOM event handlers to attach to cells associated with specific CSS class names
	* @property domEventMap
	* @type Object
	*/
	domEventMap : null
};



/**
* Initializes the Calendar widget.
* @method init
* @param {String}	id			The id of the table element that will represent the calendar widget
* @param {String}	containerId	The id of the container div element that will wrap the calendar table
* @param {Object}	config		The configuration object containing the Calendar's arguments
*/
YAHOO.widget.Calendar.prototype.init = function(id, containerId, config) {
	this.initEvents();
	this.today = new Date();
	YAHOO.widget.DateMath.clearTime(this.today);

	this.id = id;
	this.oDomContainer = document.getElementById(containerId);

	/**
	* The Config object used to hold the configuration variables for the Calendar
	* @property cfg

	* @type YAHOO.util.Config
	*/
	this.cfg = new YAHOO.util.Config(this);
	
	/**
	* The local object which contains the Calendar's options
	* @property Options
	* @type Object
	*/
	this.Options = {};

	/**
	* The local object which contains the Calendar's locale settings
	* @property Locale
	* @type Object
	*/
	this.Locale = {};

	this.initStyles();

	YAHOO.util.Dom.addClass(this.oDomContainer, this.Style.CSS_CONTAINER);	
	YAHOO.util.Dom.addClass(this.oDomContainer, this.Style.CSS_SINGLE);

	this.cellDates = [];
	this.cells = [];
	this.renderStack = [];
	this._renderStack = [];

	this.setupConfig();
	
	if (config) {
		this.cfg.applyConfig(config, true);
	}
	
	this.cfg.fireQueue();
};

/**
* Renders the built-in IFRAME shim for the IE6 and below
* @method configIframe
*/
YAHOO.widget.Calendar.prototype.configIframe = function(type, args, obj) {
	var useIframe = args[0];

	if (YAHOO.util.Dom.inDocument(this.oDomContainer)) {
		if (useIframe) {
			var pos = YAHOO.util.Dom.getStyle(this.oDomContainer, "position");

			if (this.browser == "ie" && (pos == "absolute" || pos == "relative")) {
				if (! YAHOO.util.Dom.inDocument(this.iframe)) {
					this.iframe = document.createElement("iframe");
					this.iframe.src = "javascript:false;";
					YAHOO.util.Dom.setStyle(this.iframe, "opacity", "0");
					this.oDomContainer.insertBefore(this.iframe, this.oDomContainer.firstChild);
				}
			}
		} else {
			if (this.iframe) {
				if (this.iframe.parentNode) {
					this.iframe.parentNode.removeChild(this.iframe);
				}
				this.iframe = null;
			}
		}
	}
};

/**
* Default handler for the "title" property
* @method configTitle
*/
YAHOO.widget.Calendar.prototype.configTitle = function(type, args, obj) {
	var title = args[0];
	var close = this.cfg.getProperty("close");
	
	var titleDiv;

	if (title && title !== "") {
		titleDiv = YAHOO.util.Dom.getElementsByClassName(YAHOO.widget.CalendarGroup.CSS_2UPTITLE, "div", this.oDomContainer)[0] || document.createElement("div");
		titleDiv.className = YAHOO.widget.CalendarGroup.CSS_2UPTITLE;
		titleDiv.innerHTML = title;
		this.oDomContainer.insertBefore(titleDiv, this.oDomContainer.firstChild);
		YAHOO.util.Dom.addClass(this.oDomContainer, "withtitle");
	} else {
		titleDiv = YAHOO.util.Dom.getElementsByClassName(YAHOO.widget.CalendarGroup.CSS_2UPTITLE, "div", this.oDomContainer)[0] || null;

		if (titleDiv) {
			YAHOO.util.Event.purgeElement(titleDiv);
			this.oDomContainer.removeChild(titleDiv);
		}
		if (! close) {
			YAHOO.util.Dom.removeClass(this.oDomContainer, "withtitle");
		}
	}
};

/**
* Default handler for the "close" property
* @method configClose
*/
YAHOO.widget.Calendar.prototype.configClose = function(type, args, obj) {
	var close = args[0];
	var title = this.cfg.getProperty("title");

	var linkClose;

	if (close === true) {
		linkClose = YAHOO.util.Dom.getElementsByClassName("link-close", "a", this.oDomContainer)[0] || document.createElement("a");
		linkClose.href = "javascript:void(null);";
		linkClose.className = "link-close";
		YAHOO.util.Event.addListener(linkClose, "click", this.hide, this, true);
		var imgClose = document.createElement("img");
		imgClose.src = YAHOO.widget.Calendar.IMG_ROOT + "us/my/bn/x_d.gif";
		imgClose.className = YAHOO.widget.CalendarGroup.CSS_2UPCLOSE;
		linkClose.appendChild(imgClose);
		this.oDomContainer.appendChild(linkClose);
		YAHOO.util.Dom.addClass(this.oDomContainer, "withtitle");
	} else {
		linkClose = YAHOO.util.Dom.getElementsByClassName("link-close", "a", this.oDomContainer)[0] || null;

		if (linkClose) {
			YAHOO.util.Event.purgeElement(linkClose);
			this.oDomContainer.removeChild(linkClose);
		}
		if (! title || title === "") {
			YAHOO.util.Dom.removeClass(this.oDomContainer, "withtitle");
		}
	}
};

/**
* Initializes Calendar's built-in CustomEvents
* @method initEvents
*/
YAHOO.widget.Calendar.prototype.initEvents = function() {

	/**
	* Fired before a selection is made
	* @event beforeSelectEvent

	*/
	this.beforeSelectEvent = new YAHOO.util.CustomEvent("beforeSelect"); 

	/**
	* Fired when a selection is made
	* @event selectEvent
	* @param {Array}	Array of Date field arrays in the format [YYYY, MM, DD].
	*/
	this.selectEvent = new YAHOO.util.CustomEvent("select");

	/**
	* Fired before a selection is made
	* @event beforeDeselectEvent
	*/
	this.beforeDeselectEvent = new YAHOO.util.CustomEvent("beforeDeselect");

	/**
	* Fired when a selection is made
	* @event deselectEvent
	* @param {Array}	Array of Date field arrays in the format [YYYY, MM, DD].
	*/
	this.deselectEvent = new YAHOO.util.CustomEvent("deselect");

	/**
	* Fired when the Calendar page is changed
	* @event changePageEvent
	*/
	this.changePageEvent = new YAHOO.util.CustomEvent("changePage");

	/**
	* Fired before the Calendar is rendered
	* @event beforeRenderEvent
	*/
	this.beforeRenderEvent = new YAHOO.util.CustomEvent("beforeRender");

	/**
	* Fired when the Calendar is rendered
	* @event renderEvent
	*/
	this.renderEvent = new YAHOO.util.CustomEvent("render");

	/**
	* Fired when the Calendar is reset
	* @event resetEvent
	*/
	this.resetEvent = new YAHOO.util.CustomEvent("reset");

	/**
	* Fired when the Calendar is cleared
	* @event clearEvent
	*/
	this.clearEvent = new YAHOO.util.CustomEvent("clear");

	this.beforeSelectEvent.subscribe(this.onBeforeSelect, this, true);
	this.selectEvent.subscribe(this.onSelect, this, true);
	this.beforeDeselectEvent.subscribe(this.onBeforeDeselect, this, true);
	this.deselectEvent.subscribe(this.onDeselect, this, true);
	this.changePageEvent.subscribe(this.onChangePage, this, true);
	this.renderEvent.subscribe(this.onRender, this, true);
	this.resetEvent.subscribe(this.onReset, this, true);
	this.clearEvent.subscribe(this.onClear, this, true);
};


/**
* The default event function that is attached to a date link within a calendar cell
* when the calendar is rendered.
* @method doSelectCell
* @param {DOMEvent} e	The event
* @param {Calendar} cal	A reference to the calendar passed by the Event utility
*/
YAHOO.widget.Calendar.prototype.doSelectCell = function(e, cal) {
	var target = YAHOO.util.Event.getTarget(e);

	var cell,index,d,date;

	while (target.tagName.toLowerCase() != "td" && ! YAHOO.util.Dom.hasClass(target, cal.Style.CSS_CELL_SELECTABLE)) {
		target = target.parentNode;
		if (target.tagName.toLowerCase() == "html") {
			return;
		}
	}
	
	cell = target;

	if (YAHOO.util.Dom.hasClass(cell, cal.Style.CSS_CELL_SELECTABLE)) {
		index = cell.id.split("cell")[1];
		d = cal.cellDates[index];
		date = new Date(d[0],d[1]-1,d[2]);
	
		var link;

		if (cal.Options.MULTI_SELECT) {
			link = cell.getElementsByTagName("a")[0];
			if (link) {
				link.blur();
			}
			
			var cellDate = cal.cellDates[index];
			var cellDateIndex = cal._indexOfSelectedFieldArray(cellDate);
			
			if (cellDateIndex > -1) {	
				cal.deselectCell(index);
			} else {
				cal.selectCell(index);
			}	
			
		} else {
			link = cell.getElementsByTagName("a")[0];
			if (link) {
				link.blur();
			}
			cal.selectCell(index);
		}
	}
};

/**
* The event that is executed when the user hovers over a cell
* @method doCellMouseOver
* @param {DOMEvent} e	The event
* @param {Calendar} cal	A reference to the calendar passed by the Event utility
*/
YAHOO.widget.Calendar.prototype.doCellMouseOver = function(e, cal) {
	var target;
	if (e) {
		target = YAHOO.util.Event.getTarget(e);
	} else {
		target = this;
	}

	while (target.tagName.toLowerCase() != "td") {
		target = target.parentNode;
		if (target.tagName.toLowerCase() == "html") {
			return;
		}
	}

	if (YAHOO.util.Dom.hasClass(target, cal.Style.CSS_CELL_SELECTABLE)) {
		YAHOO.util.Dom.addClass(target, cal.Style.CSS_CELL_HOVER);
	}
};

/**
* The event that is executed when the user moves the mouse out of a cell
* @method doCellMouseOut
* @param {DOMEvent} e	The event
* @param {Calendar} cal	A reference to the calendar passed by the Event utility
*/
YAHOO.widget.Calendar.prototype.doCellMouseOut = function(e, cal) {
	var target;
	if (e) {
		target = YAHOO.util.Event.getTarget(e);
	} else {
		target = this;
	}

	while (target.tagName.toLowerCase() != "td") {
		target = target.parentNode;
		if (target.tagName.toLowerCase() == "html") {
			return;
		}
	}

	if (YAHOO.util.Dom.hasClass(target, cal.Style.CSS_CELL_SELECTABLE)) {
		YAHOO.util.Dom.removeClass(target, cal.Style.CSS_CELL_HOVER);
	}
};

YAHOO.widget.Calendar.prototype.setupConfig = function() {

	/**
	* The month/year representing the current visible Calendar date (mm/yyyy)
	* @config pagedate
	* @type String
	* @default today's date
	*/
	this.cfg.addProperty("pagedate", { value:new Date(), handler:this.configPageDate } );

	/**
	* The date or range of dates representing the current Calendar selection
	* @config selected
	* @type String
	* @default []
	*/
	this.cfg.addProperty("selected", { value:[], handler:this.configSelected } );

	/**
	* The title to display above the Calendar's month header
	* @config title
	* @type String
	* @default ""
	*/
	this.cfg.addProperty("title", { value:"", handler:this.configTitle } );

	/**
	* Whether or not a close button should be displayed for this Calendar
	* @config close
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty("close", { value:false, handler:this.configClose } );

	/**
	* Whether or not an iframe shim should be placed under the Calendar to prevent select boxes from bleeding through in Internet Explorer 6 and below.
	* @config iframe
	* @type Boolean
	* @default true
	*/
	this.cfg.addProperty("iframe", { value:true, handler:this.configIframe, validator:this.cfg.checkBoolean } );

	/**
	* The minimum selectable date in the current Calendar (mm/dd/yyyy)
	* @config mindate
	* @type String
	* @default null
	*/
	this.cfg.addProperty("mindate", { value:null, handler:this.configMinDate } );

	/**
	* The maximum selectable date in the current Calendar (mm/dd/yyyy)
	* @config maxdate
	* @type String
	* @default null
	*/
	this.cfg.addProperty("maxdate", { value:null, handler:this.configMaxDate } );


	// Options properties

	/**
	* True if the Calendar should allow multiple selections. False by default.
	* @config MULTI_SELECT
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty("MULTI_SELECT",	{ value:false, handler:this.configOptions, validator:this.cfg.checkBoolean } );

	/**
	* The weekday the week begins on. Default is 0 (Sunday).
	* @config START_WEEKDAY
	* @type number
	* @default 0
	*/
	this.cfg.addProperty("START_WEEKDAY",	{ value:0, handler:this.configOptions, validator:this.cfg.checkNumber  } );

	/**
	* True if the Calendar should show weekday labels. True by default.
	* @config SHOW_WEEKDAYS
	* @type Boolean
	* @default true
	*/
	this.cfg.addProperty("SHOW_WEEKDAYS",	{ value:true, handler:this.configOptions, validator:this.cfg.checkBoolean  } );

	/**
	* True if the Calendar should show week row headers. False by default.
	* @config SHOW_WEEK_HEADER
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty("SHOW_WEEK_HEADER",{ value:false, handler:this.configOptions, validator:this.cfg.checkBoolean } );

	/**
	* True if the Calendar should show week row footers. False by default.
	* @config SHOW_WEEK_FOOTER
	* @type Boolean
	* @default false
	*/	
	this.cfg.addProperty("SHOW_WEEK_FOOTER",{ value:false, handler:this.configOptions, validator:this.cfg.checkBoolean } );

	/**
	* True if the Calendar should suppress weeks that are not a part of the current month. False by default.
	* @config HIDE_BLANK_WEEKS
	* @type Boolean
	* @default false
	*/	
	this.cfg.addProperty("HIDE_BLANK_WEEKS",{ value:false, handler:this.configOptions, validator:this.cfg.checkBoolean } );

	/**
	* The image that should be used for the left navigation arrow.
	* @config NAV_ARROW_LEFT
	* @type String
	* @default YAHOO.widget.Calendar.IMG_ROOT + "us/tr/callt.gif"
	*/	
	this.cfg.addProperty("NAV_ARROW_LEFT",	{ value:YAHOO.widget.Calendar.IMG_ROOT + "us/tr/callt.gif", handler:this.configOptions } );

	/**
	* The image that should be used for the left navigation arrow.
	* @config NAV_ARROW_RIGHT
	* @type String
	* @default YAHOO.widget.Calendar.IMG_ROOT + "us/tr/calrt.gif"
	*/	
	this.cfg.addProperty("NAV_ARROW_RIGHT",	{ value:YAHOO.widget.Calendar.IMG_ROOT + "us/tr/calrt.gif", handler:this.configOptions } );

	// Locale properties

	/**
	* The short month labels for the current locale.
	* @config MONTHS_SHORT
	* @type String[]
	* @default ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	*/
	this.cfg.addProperty("MONTHS_SHORT",	{ value:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], handler:this.configLocale } );
	
	/**
	* The long month labels for the current locale.
	* @config MONTHS_LONG
	* @type String[]
	* @default ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	*/	
	this.cfg.addProperty("MONTHS_LONG",		{ value:["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], handler:this.configLocale } );
	
	/**
	* The 1-character weekday labels for the current locale.
	* @config WEEKDAYS_1CHAR
	* @type String[]
	* @default ["S", "M", "T", "W", "T", "F", "S"]
	*/	
	this.cfg.addProperty("WEEKDAYS_1CHAR",	{ value:["S", "M", "T", "W", "T", "F", "S"], handler:this.configLocale } );
	
	/**
	* The short weekday labels for the current locale.
	* @config WEEKDAYS_SHORT
	* @type String[]
	* @default ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
	*/	
	this.cfg.addProperty("WEEKDAYS_SHORT",	{ value:["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], handler:this.configLocale } );
	
	/**
	* The medium weekday labels for the current locale.
	* @config WEEKDAYS_MEDIUM
	* @type String[]
	* @default ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	*/	
	this.cfg.addProperty("WEEKDAYS_MEDIUM",	{ value:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], handler:this.configLocale } );
	
	/**
	* The long weekday labels for the current locale.
	* @config WEEKDAYS_LONG
	* @type String[]
	* @default ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	*/	
	this.cfg.addProperty("WEEKDAYS_LONG",	{ value:["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], handler:this.configLocale } );

	/**
	* Refreshes the locale values used to build the Calendar.
	* @method refreshLocale
	* @private
	*/
	var refreshLocale = function() {
		this.cfg.refireEvent("LOCALE_MONTHS");
		this.cfg.refireEvent("LOCALE_WEEKDAYS");
	};

	this.cfg.subscribeToConfigEvent("START_WEEKDAY", refreshLocale, this, true);
	this.cfg.subscribeToConfigEvent("MONTHS_SHORT", refreshLocale, this, true);
	this.cfg.subscribeToConfigEvent("MONTHS_LONG", refreshLocale, this, true);
	this.cfg.subscribeToConfigEvent("WEEKDAYS_1CHAR", refreshLocale, this, true);
	this.cfg.subscribeToConfigEvent("WEEKDAYS_SHORT", refreshLocale, this, true);
	this.cfg.subscribeToConfigEvent("WEEKDAYS_MEDIUM", refreshLocale, this, true);
	this.cfg.subscribeToConfigEvent("WEEKDAYS_LONG", refreshLocale, this, true);
	
	/**
	* The setting that determines which length of month labels should be used. Possible values are "short" and "long".
	* @config LOCALE_MONTHS
	* @type String
	* @default "long"
	*/	
	this.cfg.addProperty("LOCALE_MONTHS",	{ value:"long", handler:this.configLocaleValues } );
	
	/**
	* The setting that determines which length of weekday labels should be used. Possible values are "1char", "short", "medium", and "long".
	* @config LOCALE_WEEKDAYS
	* @type String
	* @default "short"
	*/	
	this.cfg.addProperty("LOCALE_WEEKDAYS",	{ value:"short", handler:this.configLocaleValues } );

	/**
	* The value used to delimit individual dates in a date string passed to various Calendar functions.
	* @config DATE_DELIMITER
	* @type String
	* @default ","
	*/	
	this.cfg.addProperty("DATE_DELIMITER",		{ value:",", handler:this.configLocale } );

	/**
	* The value used to delimit date fields in a date string passed to various Calendar functions.
	* @config DATE_FIELD_DELIMITER
	* @type String
	* @default "/"
	*/	
	this.cfg.addProperty("DATE_FIELD_DELIMITER",{ value:"/", handler:this.configLocale } );

	/**
	* The value used to delimit date ranges in a date string passed to various Calendar functions.
	* @config DATE_RANGE_DELIMITER
	* @type String
	* @default "-"
	*/
	this.cfg.addProperty("DATE_RANGE_DELIMITER",{ value:"-", handler:this.configLocale } );

	/**
	* The position of the month in a month/year date string
	* @config MY_MONTH_POSITION
	* @type Number
	* @default 1
	*/
	this.cfg.addProperty("MY_MONTH_POSITION",	{ value:1, handler:this.configLocale, validator:this.cfg.checkNumber } );

	/**
	* The position of the year in a month/year date string
	* @config MY_YEAR_POSITION
	* @type Number
	* @default 2
	*/
	this.cfg.addProperty("MY_YEAR_POSITION",	{ value:2, handler:this.configLocale, validator:this.cfg.checkNumber } );

	/**
	* The position of the month in a month/day date string
	* @config MD_MONTH_POSITION
	* @type Number
	* @default 1
	*/
	this.cfg.addProperty("MD_MONTH_POSITION",	{ value:1, handler:this.configLocale, validator:this.cfg.checkNumber } );

	/**
	* The position of the day in a month/year date string
	* @config MD_DAY_POSITION
	* @type Number
	* @default 2
	*/
	this.cfg.addProperty("MD_DAY_POSITION",		{ value:2, handler:this.configLocale, validator:this.cfg.checkNumber } );

	/**
	* The position of the month in a month/day/year date string
	* @config MDY_MONTH_POSITION
	* @type Number
	* @default 1
	*/
	this.cfg.addProperty("MDY_MONTH_POSITION",	{ value:1, handler:this.configLocale, validator:this.cfg.checkNumber } );

	/**
	* The position of the day in a month/day/year date string
	* @config MDY_DAY_POSITION
	* @type Number
	* @default 2
	*/
	this.cfg.addProperty("MDY_DAY_POSITION",	{ value:2, handler:this.configLocale, validator:this.cfg.checkNumber } );

	/**
	* The position of the year in a month/day/year date string
	* @config MDY_YEAR_POSITION
	* @type Number
	* @default 3
	*/
	this.cfg.addProperty("MDY_YEAR_POSITION",	{ value:3, handler:this.configLocale, validator:this.cfg.checkNumber } );
};

/**
* The default handler for the "pagedate" property
* @method configPageDate
*/
YAHOO.widget.Calendar.prototype.configPageDate = function(type, args, obj) {
	var val = args[0];
	var month, year, aMonthYear;

	if (val) {
		if (val instanceof Date) {
			val = YAHOO.widget.DateMath.findMonthStart(val);
			this.cfg.setProperty("pagedate", val, true);
			if (! this._pageDate) {
				this._pageDate = this.cfg.getProperty("pagedate");
			}
			return;
		} else {
			aMonthYear = val.split(this.cfg.getProperty("DATE_FIELD_DELIMITER"));
			month = parseInt(aMonthYear[this.cfg.getProperty("MY_MONTH_POSITION")-1], 10)-1;
			year = parseInt(aMonthYear[this.cfg.getProperty("MY_YEAR_POSITION")-1], 10);
		}
	} else {
		month = this.today.getMonth();
		year = this.today.getFullYear();
	}
	
	this.cfg.setProperty("pagedate", new Date(year, month, 1), true);
	if (! this._pageDate) {
		this._pageDate = this.cfg.getProperty("pagedate");
	}
};

/**
* The default handler for the "mindate" property
* @method configMinDate
*/
YAHOO.widget.Calendar.prototype.configMinDate = function(type, args, obj) {
	var val = args[0];
	if (typeof val == 'string') {
		val = this._parseDate(val);
		this.cfg.setProperty("mindate", new Date(val[0],(val[1]-1),val[2]));
	}
};

/**
* The default handler for the "maxdate" property
* @method configMaxDate
*/
YAHOO.widget.Calendar.prototype.configMaxDate = function(type, args, obj) {
	var val = args[0];
	if (typeof val == 'string') {
		val = this._parseDate(val);
		this.cfg.setProperty("maxdate", new Date(val[0],(val[1]-1),val[2]));
	}
};

/**
* The default handler for the "selected" property
* @method configSelected
*/
YAHOO.widget.Calendar.prototype.configSelected = function(type, args, obj) {
	var selected = args[0];
	
	if (selected) {
		if (typeof selected == 'string') {
			this.cfg.setProperty("selected", this._parseDates(selected), true);
		} 
	}
	if (! this._selectedDates) {
		this._selectedDates = this.cfg.getProperty("selected");
	}
};

/**
* The default handler for all configuration options properties
* @method configOptions
*/
YAHOO.widget.Calendar.prototype.configOptions = function(type, args, obj) {
	type = type.toUpperCase();
	var val = args[0];
	this.Options[type] = val;
};

/**
* The default handler for all configuration locale properties
* @method configLocale
*/
YAHOO.widget.Calendar.prototype.configLocale = function(type, args, obj) {
	type = type.toUpperCase();
	var val = args[0];
	this.Locale[type] = val;

	this.cfg.refireEvent("LOCALE_MONTHS");
	this.cfg.refireEvent("LOCALE_WEEKDAYS");

};

/**
* The default handler for all configuration locale field length properties
* @method configLocaleValues
*/
YAHOO.widget.Calendar.prototype.configLocaleValues = function(type, args, obj) {
	type = type.toUpperCase();
	var val = args[0];

	switch (type) {
		case "LOCALE_MONTHS":
			switch (val) {
				case "short":
					this.Locale.LOCALE_MONTHS = this.cfg.getProperty("MONTHS_SHORT").concat();
					break;
				case "long":
					this.Locale.LOCALE_MONTHS = this.cfg.getProperty("MONTHS_LONG").concat();
					break;
			}
			break;
		case "LOCALE_WEEKDAYS":
			switch (val) {
				case "1char":
					this.Locale.LOCALE_WEEKDAYS = this.cfg.getProperty("WEEKDAYS_1CHAR").concat();
					break;
				case "short":
					this.Locale.LOCALE_WEEKDAYS = this.cfg.getProperty("WEEKDAYS_SHORT").concat();
					break;
				case "medium":
					this.Locale.LOCALE_WEEKDAYS = this.cfg.getProperty("WEEKDAYS_MEDIUM").concat();
					break;
				case "long":
					this.Locale.LOCALE_WEEKDAYS = this.cfg.getProperty("WEEKDAYS_LONG").concat();
					break;
			}
			
			var START_WEEKDAY = this.cfg.getProperty("START_WEEKDAY");

			if (START_WEEKDAY > 0) {
				for (var w=0;w<START_WEEKDAY;++w) {
					this.Locale.LOCALE_WEEKDAYS.push(this.Locale.LOCALE_WEEKDAYS.shift());
				}
			}
			break;
	}
};

/**
* Defines the style constants for the Calendar
* @method initStyles
*/
YAHOO.widget.Calendar.prototype.initStyles = function() {

	/**
	* Collection of Style constants for the Calendar
	* @property Style
	*/
	this.Style = {
		/**
		* @property Style.CSS_ROW_HEADER
		*/
		CSS_ROW_HEADER: "calrowhead",
		/**
		* @property Style.CSS_ROW_FOOTER
		*/
		CSS_ROW_FOOTER: "calrowfoot",
		/**
		* @property Style.CSS_CELL
		*/
		CSS_CELL : "calcell",
		/**
		* @property Style.CSS_CELL_SELECTED
		*/
		CSS_CELL_SELECTED : "selected",
		/**
		* @property Style.CSS_CELL_SELECTABLE
		*/
		CSS_CELL_SELECTABLE : "selectable",
		/**
		* @property Style.CSS_CELL_RESTRICTED
		*/
		CSS_CELL_RESTRICTED : "restricted",
		/**
		* @property Style.CSS_CELL_TODAY
		*/
		CSS_CELL_TODAY : "today",
		/**
		* @property Style.CSS_CELL_OOM
		*/
		CSS_CELL_OOM : "oom",
		/**
		* @property Style.CSS_CELL_OOB
		*/
		CSS_CELL_OOB : "previous",
		/**
		* @property Style.CSS_HEADER
		*/
		CSS_HEADER : "calheader",
		/**
		* @property Style.CSS_HEADER_TEXT
		*/
		CSS_HEADER_TEXT : "calhead",
		/**
		* @property Style.CSS_WEEKDAY_CELL
		*/
		CSS_WEEKDAY_CELL : "calweekdaycell",
		/**
		* @property Style.CSS_WEEKDAY_ROW
		*/
		CSS_WEEKDAY_ROW : "calweekdayrow",
		/**
		* @property Style.CSS_FOOTER
		*/
		CSS_FOOTER : "calfoot",
		/**
		* @property Style.CSS_CALENDAR
		*/
		CSS_CALENDAR : "yui-calendar",
		/**
		* @property Style.CSS_SINGLE
		*/
		CSS_SINGLE : "single",
		/**
		* @property Style.CSS_CONTAINER
		*/
		CSS_CONTAINER : "yui-calcontainer",
		/**
		* @property Style.CSS_NAV_LEFT
		*/
		CSS_NAV_LEFT : "calnavleft",
		/**
		* @property Style.CSS_NAV_RIGHT
		*/
		CSS_NAV_RIGHT : "calnavright",
		/**
		* @property Style.CSS_CELL_TOP
		*/
		CSS_CELL_TOP : "calcelltop",
		/**
		* @property Style.CSS_CELL_LEFT
		*/
		CSS_CELL_LEFT : "calcellleft",
		/**
		* @property Style.CSS_CELL_RIGHT
		*/
		CSS_CELL_RIGHT : "calcellright",
		/**
		* @property Style.CSS_CELL_BOTTOM
		*/
		CSS_CELL_BOTTOM : "calcellbottom",
		/**
		* @property Style.CSS_CELL_HOVER
		*/
		CSS_CELL_HOVER : "calcellhover",
		/**
		* @property Style.CSS_CELL_HIGHLIGHT1
		*/
		CSS_CELL_HIGHLIGHT1 : "highlight1",
		/**
		* @property Style.CSS_CELL_HIGHLIGHT2
		*/
		CSS_CELL_HIGHLIGHT2 : "highlight2",
		/**
		* @property Style.CSS_CELL_HIGHLIGHT3
		*/
		CSS_CELL_HIGHLIGHT3 : "highlight3",
		/**
		* @property Style.CSS_CELL_HIGHLIGHT4
		*/
		CSS_CELL_HIGHLIGHT4 : "highlight4"
	};
};

/**
* Builds the date label that will be displayed in the calendar header or
* footer, depending on configuration.
* @method buildMonthLabel
* @return	{String}	The formatted calendar month label
*/
YAHOO.widget.Calendar.prototype.buildMonthLabel = function() {
	var text = this.Locale.LOCALE_MONTHS[this.cfg.getProperty("pagedate").getMonth()] + " " + this.cfg.getProperty("pagedate").getFullYear();
	return text;
};

/**
* Builds the date digit that will be displayed in calendar cells
* @method buildDayLabel
* @param {Date}	workingDate	The current working date
* @return	{String}	The formatted day label
*/
YAHOO.widget.Calendar.prototype.buildDayLabel = function(workingDate) {
	var day = workingDate.getDate();
	return day;
};

/**
* Renders the calendar header.
* @method renderHeader
* @param {Array}	html	The current working HTML array
* @return {Array} The current working HTML array
*/
YAHOO.widget.Calendar.prototype.renderHeader = function(html) {
	var colSpan = 7;
	
	if (this.cfg.getProperty("SHOW_WEEK_HEADER")) {
		colSpan += 1;
	}

	if (this.cfg.getProperty("SHOW_WEEK_FOOTER")) {
		colSpan += 1;
	}

	html[html.length] = "<thead>";
	html[html.length] =		"<tr>";
	html[html.length] =			'<th colspan="' + colSpan + '" class="' + this.Style.CSS_HEADER_TEXT + '">';
	html[html.length] =				'<div class="' + this.Style.CSS_HEADER + '">';

		var renderLeft, renderRight = false;

		if (this.parent) {
			if (this.index === 0) {
				renderLeft = true;
			}
			if (this.index == (this.parent.cfg.getProperty("pages") -1)) {
				renderRight = true;
			}
		} else {
			renderLeft = true;
			renderRight = true;
		}

		var cal = this.parent || this;

		if (renderLeft) {
			html[html.length] = '<a class="' + this.Style.CSS_NAV_LEFT + '" style="background-image:url(' + this.cfg.getProperty("NAV_ARROW_LEFT") + ')">&#160;</a>';
		}
		
		html[html.length] = this.buildMonthLabel();
		
		if (renderRight) {
			html[html.length] = '<a class="' + this.Style.CSS_NAV_RIGHT + '" style="background-image:url(' + this.cfg.getProperty("NAV_ARROW_RIGHT") + ')">&#160;</a>';
		}


	html[html.length] =				'</div>';
	html[html.length] =			'</th>';
	html[html.length] =		'</tr>';

	if (this.cfg.getProperty("SHOW_WEEKDAYS")) {
		html = this.buildWeekdays(html);
	}
	
	html[html.length] = '</thead>';

	return html;
};

/**
* Renders the Calendar's weekday headers.
* @method buildWeekdays
* @param {Array}	html	The current working HTML array
* @return {Array} The current working HTML array
*/
YAHOO.widget.Calendar.prototype.buildWeekdays = function(html) {

	html[html.length] = '<tr class="' + this.Style.CSS_WEEKDAY_ROW + '">';

	if (this.cfg.getProperty("SHOW_WEEK_HEADER")) {
		html[html.length] = '<th>&#160;</th>';
	}

	for(var i=0;i<this.Locale.LOCALE_WEEKDAYS.length;++i) {
		html[html.length] = '<th class="calweekdaycell">' + this.Locale.LOCALE_WEEKDAYS[i] + '</th>';
	}

	if (this.cfg.getProperty("SHOW_WEEK_FOOTER")) {
		html[html.length] = '<th>&#160;</th>';
	}

	html[html.length] = '</tr>';

	return html;
};

/**
* Renders the calendar body.
* @method renderBody
* @param {Date}	workingDate	The current working Date being used for the render process
* @param {Array}	html	The current working HTML array
* @return {Array} The current working HTML array
*/
YAHOO.widget.Calendar.prototype.renderBody = function(workingDate, html) {
	
	var startDay = this.cfg.getProperty("START_WEEKDAY");

	this.preMonthDays = workingDate.getDay();
	if (startDay > 0) {
		this.preMonthDays -= startDay;
	}
	if (this.preMonthDays < 0) {
		this.preMonthDays += 7;
	}
	
	this.monthDays = YAHOO.widget.DateMath.findMonthEnd(workingDate).getDate();
	this.postMonthDays = YAHOO.widget.Calendar.DISPLAY_DAYS-this.preMonthDays-this.monthDays;
	
	workingDate = YAHOO.widget.DateMath.subtract(workingDate, YAHOO.widget.DateMath.DAY, this.preMonthDays);

	var useDate,weekNum,weekClass;
	useDate = this.cfg.getProperty("pagedate");

	html[html.length] = '<tbody class="m' + (useDate.getMonth()+1) + '">';
	
	var i = 0;

	var tempDiv = document.createElement("div");
	var cell = document.createElement("td");
	tempDiv.appendChild(cell);

	var jan1 = new Date(useDate.getFullYear(),0,1);

	var cal = this.parent || this;

	for (var r=0;r<6;r++) {

		weekNum = YAHOO.widget.DateMath.getWeekNumber(workingDate, useDate.getFullYear(), startDay);

		weekClass = "w" + weekNum;

		if (r !== 0 && this.isDateOOM(workingDate) && this.cfg.getProperty("HIDE_BLANK_WEEKS") === true) {
			break;
		} else {
					
			html[html.length] = '<tr class="' + weekClass + '">';
			
			if (this.cfg.getProperty("SHOW_WEEK_HEADER")) { html = this.renderRowHeader(weekNum, html); }
			
			for (var d=0;d<7;d++){ // Render actual days

				var cellRenderers = [];

				this.clearElement(cell);
				
				YAHOO.util.Dom.addClass(cell, "calcell");

				cell.id = this.id + "_cell" + i;

				cell.innerHTML = i;

				var renderer = null;
				
				if (workingDate.getFullYear()	== this.today.getFullYear() &&
					workingDate.getMonth()		== this.today.getMonth() &&
					workingDate.getDate()		== this.today.getDate()) {
					cellRenderers[cellRenderers.length]=cal.renderCellStyleToday;
				}
				
				this.cellDates[this.cellDates.length]=[workingDate.getFullYear(),workingDate.getMonth()+1,workingDate.getDate()]; // Add this date to cellDates
							
				if (this.isDateOOM(workingDate)) {
					cellRenderers[cellRenderers.length]=cal.renderCellNotThisMonth;
				} else {

					YAHOO.util.Dom.addClass(cell, "wd" + workingDate.getDay());
					YAHOO.util.Dom.addClass(cell, "d" + workingDate.getDate());
				
					for (var s=0;s<this.renderStack.length;++s) {

						var rArray = this.renderStack[s];
						var type = rArray[0];
						
						var month;
						var day;
						var year;
						
						switch (type) {
							case YAHOO.widget.Calendar.DATE:
								month = rArray[1][1];
								day = rArray[1][2];
								year = rArray[1][0];

								if (workingDate.getMonth()+1 == month && workingDate.getDate() == day && workingDate.getFullYear() == year) {
									renderer = rArray[2];
									this.renderStack.splice(s,1);
								}
								break;
							case YAHOO.widget.Calendar.MONTH_DAY:
								month = rArray[1][0];
								day = rArray[1][1];
								
								if (workingDate.getMonth()+1 == month && workingDate.getDate() == day) {
									renderer = rArray[2];
									this.renderStack.splice(s,1);
								}
								break;
							case YAHOO.widget.Calendar.RANGE:
								var date1 = rArray[1][0];
								var date2 = rArray[1][1];

								var d1month = date1[1];
								var d1day = date1[2];
								var d1year = date1[0];
								
								var d1 = new Date(d1year, d1month-1, d1day);

								var d2month = date2[1];
								var d2day = date2[2];
								var d2year = date2[0];

								var d2 = new Date(d2year, d2month-1, d2day);

								if (workingDate.getTime() >= d1.getTime() && workingDate.getTime() <= d2.getTime()) {
									renderer = rArray[2];

									if (workingDate.getTime()==d2.getTime()) { 
										this.renderStack.splice(s,1);
									}
								}
								break;
							case YAHOO.widget.Calendar.WEEKDAY:
								
								var weekday = rArray[1][0];
								if (workingDate.getDay()+1 == weekday) {
									renderer = rArray[2];
								}
								break;
							case YAHOO.widget.Calendar.MONTH:
								
								month = rArray[1][0];
								if (workingDate.getMonth()+1 == month) {
									renderer = rArray[2];
								}
								break;
						}
						
						if (renderer) {
							cellRenderers[cellRenderers.length]=renderer;
						}
					}

				}

				if (this._indexOfSelectedFieldArray([workingDate.getFullYear(),workingDate.getMonth()+1,workingDate.getDate()]) > -1) {
					cellRenderers[cellRenderers.length]=cal.renderCellStyleSelected; 
				}

				var mindate = this.cfg.getProperty("mindate");
				var maxdate = this.cfg.getProperty("maxdate");

				if (mindate) {
					mindate = YAHOO.widget.DateMath.clearTime(mindate);
				}
				if (maxdate) {
					maxdate = YAHOO.widget.DateMath.clearTime(maxdate);
				}

				if (
					(mindate && (workingDate.getTime() < mindate.getTime())) ||
					(maxdate && (workingDate.getTime() > maxdate.getTime()))
				) {
					cellRenderers[cellRenderers.length]=cal.renderOutOfBoundsDate;
				} else {
					cellRenderers[cellRenderers.length]=cal.styleCellDefault;
					cellRenderers[cellRenderers.length]=cal.renderCellDefault;	
				}

				
				
				for (var x=0;x<cellRenderers.length;++x) {
					var ren = cellRenderers[x];
					if (ren.call((this.parent || this),workingDate,cell) == YAHOO.widget.Calendar.STOP_RENDER) {
						break;
					}
				}

				workingDate.setTime(workingDate.getTime() + YAHOO.widget.DateMath.ONE_DAY_MS);

				if (i >= 0 && i <= 6) {
					YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_TOP);
				}
				if ((i % 7) === 0) {
					YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_LEFT);
				}
				if (((i+1) % 7) === 0) {
					YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_RIGHT);
				}
				
				var postDays = this.postMonthDays; 
				if (postDays >= 7 && this.cfg.getProperty("HIDE_BLANK_WEEKS")) {
					var blankWeeks = Math.floor(postDays/7);
					for (var p=0;p<blankWeeks;++p) {
						postDays -= 7;
					}
				}
				
				if (i >= ((this.preMonthDays+postDays+this.monthDays)-7)) {
					YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_BOTTOM);
				}

				html[html.length] = tempDiv.innerHTML;
				
				i++;
			}

			if (this.cfg.getProperty("SHOW_WEEK_FOOTER")) { html = this.renderRowFooter(weekNum, html); }

			html[html.length] = '</tr>';
		}
	}

	html[html.length] = '</tbody>';

	return html;
};

/**
* Renders the calendar footer. In the default implementation, there is
* no footer.
* @method renderFooter
* @param {Array}	html	The current working HTML array
* @return {Array} The current working HTML array
*/
YAHOO.widget.Calendar.prototype.renderFooter = function(html) { return html; };

/**
* Renders the calendar after it has been configured. The render() method has a specific call chain that will execute
* when the method is called: renderHeader, renderBody, renderFooter.
* Refer to the documentation for those methods for information on 
* individual render tasks.
* @method render
*/
YAHOO.widget.Calendar.prototype.render = function() {
	this.beforeRenderEvent.fire();

	// Find starting day of the current month
	var workingDate = YAHOO.widget.DateMath.findMonthStart(this.cfg.getProperty("pagedate"));

	this.resetRenderers();
	this.cellDates.length = 0;
	
	YAHOO.util.Event.purgeElement(this.oDomContainer, true);
	
	var html = [];

	html[html.length] = '<table cellSpacing="0" class="' + this.Style.CSS_CALENDAR + ' y' + workingDate.getFullYear() + '" id="' + this.id + '">';
	html = this.renderHeader(html);
	html = this.renderBody(workingDate, html);
	html = this.renderFooter(html);
	html[html.length] = '</table>';

	this.oDomContainer.innerHTML = html.join("\n");
	
	this.applyListeners();
	this.cells = this.oDomContainer.getElementsByTagName("td");

	this.cfg.refireEvent("title");
	this.cfg.refireEvent("close");
	this.cfg.refireEvent("iframe");

	this.renderEvent.fire();
};

/**
* Applies the Calendar's DOM listeners to applicable elements.
* @method applyListeners
*/
YAHOO.widget.Calendar.prototype.applyListeners = function() {
	
	var root = this.oDomContainer;
	var cal = this.parent || this;

	var linkLeft, linkRight;
	
	linkLeft = YAHOO.util.Dom.getElementsByClassName(this.Style.CSS_NAV_LEFT, "a", root);
	linkRight = YAHOO.util.Dom.getElementsByClassName(this.Style.CSS_NAV_RIGHT, "a", root);

	if (linkLeft) {
		this.linkLeft = linkLeft[0];
		YAHOO.util.Event.addListener(this.linkLeft, "mousedown", cal.previousMonth, cal, true);
	}

	if (linkRight) {
		this.linkRight = linkRight[0];
		YAHOO.util.Event.addListener(this.linkRight, "mousedown", cal.nextMonth, cal, true);
	}

	if (this.domEventMap) {
		var el,elements;
		for (var cls in this.domEventMap) {	
			if (this.domEventMap.hasOwnProperty(cls)) {
				var items = this.domEventMap[cls];
				
				if (! (items instanceof Array)) {
					items = [items];
				}

				for (var i=0;i<items.length;i++)	{
					var item = items[i];
					elements = YAHOO.util.Dom.getElementsByClassName(cls, item.tag, this.oDomContainer);

					for (var c=0;c<elements.length;c++) {
						el = elements[c];
						 YAHOO.util.Event.addListener(el, item.event, item.handler, item.scope, item.correct );
					}
				}
			}
		}
	}

	YAHOO.util.Event.addListener(this.oDomContainer, "click", this.doSelectCell, this);
	YAHOO.util.Event.addListener(this.oDomContainer, "mouseover", this.doCellMouseOver, this);
	YAHOO.util.Event.addListener(this.oDomContainer, "mouseout", this.doCellMouseOut, this);
};

/**
* Retrieves the Date object for the specified Calendar cell
* @method getDateByCellId
* @param {String}	id	The id of the cell
* @return {Date} The Date object for the specified Calendar cell
*/
YAHOO.widget.Calendar.prototype.getDateByCellId = function(id) {
	var date = this.getDateFieldsByCellId(id);
	return new Date(date[0],date[1]-1,date[2]);
};

/**
* Retrieves the Date object for the specified Calendar cell
* @method getDateFieldsByCellId
* @param {String}	id	The id of the cell
* @return {Array}	The array of Date fields for the specified Calendar cell
*/
YAHOO.widget.Calendar.prototype.getDateFieldsByCellId = function(id) {
	id = id.toLowerCase().split("_cell")[1];
	id = parseInt(id, 10);
	return this.cellDates[id];
};
												  
// BEGIN BUILT-IN TABLE CELL RENDERERS

/**
* Renders a cell that falls before the minimum date or after the maximum date.
* widget class.
* @method renderOutOfBoundsDate
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
* @return {String} YAHOO.widget.Calendar.STOP_RENDER if rendering should stop with this style, null or nothing if rendering
*			should not be terminated
*/
YAHOO.widget.Calendar.prototype.renderOutOfBoundsDate = function(workingDate, cell) {
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_OOB);
	cell.innerHTML = workingDate.getDate();
	return YAHOO.widget.Calendar.STOP_RENDER;
};

/**
* Renders the row header for a week.
* @method renderRowHeader
* @param {Number}	weekNum	The week number of the current row
* @param {Array}	cell	The current working HTML array
*/
YAHOO.widget.Calendar.prototype.renderRowHeader = function(weekNum, html) {
	html[html.length] = '<th class="calrowhead">' + weekNum + '</th>';
	return html;
};

/**
* Renders the row footer for a week.
* @method renderRowFooter
* @param {Number}	weekNum	The week number of the current row
* @param {Array}	cell	The current working HTML array
*/
YAHOO.widget.Calendar.prototype.renderRowFooter = function(weekNum, html) {
	html[html.length] = '<th class="calrowfoot">' + weekNum + '</th>';
	return html;
};

/**
* Renders a single standard calendar cell in the calendar widget table.
* All logic for determining how a standard default cell will be rendered is 
* encapsulated in this method, and must be accounted for when extending the
* widget class.
* @method renderCellDefault
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
*/
YAHOO.widget.Calendar.prototype.renderCellDefault = function(workingDate, cell) {
	cell.innerHTML = '<a href="javascript:void(null);" >' + this.buildDayLabel(workingDate) + "</a>";
};

/**
* Styles a selectable cell.
* @method styleCellDefault
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
*/
YAHOO.widget.Calendar.prototype.styleCellDefault = function(workingDate, cell) {
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_SELECTABLE);
};


/**
* Renders a single standard calendar cell using the CSS hightlight1 style
* @method renderCellStyleHighlight1
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
*/
YAHOO.widget.Calendar.prototype.renderCellStyleHighlight1 = function(workingDate, cell) {
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_HIGHLIGHT1);
};

/**
* Renders a single standard calendar cell using the CSS hightlight2 style
* @method renderCellStyleHighlight2
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
*/
YAHOO.widget.Calendar.prototype.renderCellStyleHighlight2 = function(workingDate, cell) {
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_HIGHLIGHT2);
};

/**
* Renders a single standard calendar cell using the CSS hightlight3 style
* @method renderCellStyleHighlight3
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
*/
YAHOO.widget.Calendar.prototype.renderCellStyleHighlight3 = function(workingDate, cell) {
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_HIGHLIGHT3);
};

/**
* Renders a single standard calendar cell using the CSS hightlight4 style
* @method renderCellStyleHighlight4
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
*/
YAHOO.widget.Calendar.prototype.renderCellStyleHighlight4 = function(workingDate, cell) {
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_HIGHLIGHT4);
};

/**
* Applies the default style used for rendering today's date to the current calendar cell
* @method renderCellStyleToday
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
*/
YAHOO.widget.Calendar.prototype.renderCellStyleToday = function(workingDate, cell) {
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_TODAY);
};

/**
* Applies the default style used for rendering selected dates to the current calendar cell
* @method renderCellStyleSelected
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
* @return {String} YAHOO.widget.Calendar.STOP_RENDER if rendering should stop with this style, null or nothing if rendering
*			should not be terminated
*/
YAHOO.widget.Calendar.prototype.renderCellStyleSelected = function(workingDate, cell) {
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_SELECTED);
};

/**
* Applies the default style used for rendering dates that are not a part of the current
* month (preceding or trailing the cells for the current month)
* @method renderCellNotThisMonth
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
* @return {String} YAHOO.widget.Calendar.STOP_RENDER if rendering should stop with this style, null or nothing if rendering
*			should not be terminated
*/
YAHOO.widget.Calendar.prototype.renderCellNotThisMonth = function(workingDate, cell) {
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_OOM);
	cell.innerHTML=workingDate.getDate();
	return YAHOO.widget.Calendar.STOP_RENDER;
};

/**
* Renders the current calendar cell as a non-selectable "black-out" date using the default
* restricted style.
* @method renderBodyCellRestricted
* @param {Date}					workingDate		The current working Date object being used to generate the calendar
* @param {HTMLTableCellElement}	cell			The current working cell in the calendar
* @return {String} YAHOO.widget.Calendar.STOP_RENDER if rendering should stop with this style, null or nothing if rendering
*			should not be terminated
*/
YAHOO.widget.Calendar.prototype.renderBodyCellRestricted = function(workingDate, cell) {
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL);
	YAHOO.util.Dom.addClass(cell, this.Style.CSS_CELL_RESTRICTED);
	cell.innerHTML=workingDate.getDate();
	return YAHOO.widget.Calendar.STOP_RENDER;
};

// END BUILT-IN TABLE CELL RENDERERS

// BEGIN MONTH NAVIGATION METHODS

/**
* Adds the designated number of months to the current calendar month, and sets the current
* calendar page date to the new month.
* @method addMonths
* @param {Number}	count	The number of months to add to the current calendar
*/
YAHOO.widget.Calendar.prototype.addMonths = function(count) {
	this.cfg.setProperty("pagedate", YAHOO.widget.DateMath.add(this.cfg.getProperty("pagedate"), YAHOO.widget.DateMath.MONTH, count));
	this.resetRenderers();
	this.changePageEvent.fire();
};

/**
* Subtracts the designated number of months from the current calendar month, and sets the current
* calendar page date to the new month.
* @method subtractMonths
* @param {Number}	count	The number of months to subtract from the current calendar
*/
YAHOO.widget.Calendar.prototype.subtractMonths = function(count) {
	this.cfg.setProperty("pagedate", YAHOO.widget.DateMath.subtract(this.cfg.getProperty("pagedate"), YAHOO.widget.DateMath.MONTH, count));
	this.resetRenderers();
	this.changePageEvent.fire();
};

/**
* Adds the designated number of years to the current calendar, and sets the current
* calendar page date to the new month.
* @method addYears
* @param {Number}	count	The number of years to add to the current calendar
*/
YAHOO.widget.Calendar.prototype.addYears = function(count) {
	this.cfg.setProperty("pagedate", YAHOO.widget.DateMath.add(this.cfg.getProperty("pagedate"), YAHOO.widget.DateMath.YEAR, count));
	this.resetRenderers();
	this.changePageEvent.fire();
};

/**
* Subtcats the designated number of years from the current calendar, and sets the current
* calendar page date to the new month.
* @method subtractYears
* @param {Number}	count	The number of years to subtract from the current calendar
*/
YAHOO.widget.Calendar.prototype.subtractYears = function(count) {
	this.cfg.setProperty("pagedate", YAHOO.widget.DateMath.subtract(this.cfg.getProperty("pagedate"), YAHOO.widget.DateMath.YEAR, count));
	this.resetRenderers();
	this.changePageEvent.fire();
};

/**
* Navigates to the next month page in the calendar widget.
* @method nextMonth
*/
YAHOO.widget.Calendar.prototype.nextMonth = function() {
	this.addMonths(1);
};

/**
* Navigates to the previous month page in the calendar widget.
* @method previousMonth
*/
YAHOO.widget.Calendar.prototype.previousMonth = function() {
	this.subtractMonths(1);
};

/**
* Navigates to the next year in the currently selected month in the calendar widget.
* @method nextYear
*/
YAHOO.widget.Calendar.prototype.nextYear = function() {
	this.addYears(1);
};

/**
* Navigates to the previous year in the currently selected month in the calendar widget.
* @method previousYear
*/
YAHOO.widget.Calendar.prototype.previousYear = function() {
	this.subtractYears(1);
};

// END MONTH NAVIGATION METHODS

// BEGIN SELECTION METHODS

/**
* Resets the calendar widget to the originally selected month and year, and 
* sets the calendar to the initial selection(s).
* @method reset
*/
YAHOO.widget.Calendar.prototype.reset = function() {
	this.cfg.resetProperty("selected");
	this.cfg.resetProperty("pagedate");
	this.resetEvent.fire();
};

/**
* Clears the selected dates in the current calendar widget and sets the calendar
* to the current month and year.
* @method clear
*/
YAHOO.widget.Calendar.prototype.clear = function() {
	this.cfg.setProperty("selected", []);
	this.cfg.setProperty("pagedate", new Date(this.today.getTime()));
	this.clearEvent.fire();
};

/**
* Selects a date or a collection of dates on the current calendar. This method, by default,
* does not call the render method explicitly. Once selection has completed, render must be 
* called for the changes to be reflected visually.
* @method select
* @param	{String/Date/Date[]}	date	The date string of dates to select in the current calendar. Valid formats are
*								individual date(s) (12/24/2005,12/26/2005) or date range(s) (12/24/2005-1/1/2006).
*								Multiple comma-delimited dates can also be passed to this method (12/24/2005,12/11/2005-12/13/2005).
*								This method can also take a JavaScript Date object or an array of Date objects.
* @return	{Date[]}			Array of JavaScript Date objects representing all individual dates that are currently selected.
*/
YAHOO.widget.Calendar.prototype.select = function(date) {
	this.beforeSelectEvent.fire();

	var selected = this.cfg.getProperty("selected");
	var aToBeSelected = this._toFieldArray(date);

	for (var a=0;a<aToBeSelected.length;++a) {
		var toSelect = aToBeSelected[a]; // For each date item in the list of dates we're trying to select
		if (this._indexOfSelectedFieldArray(toSelect) == -1) { // not already selected?
			selected[selected.length]=toSelect;
		}
	}
	
	if (this.parent) {
		this.parent.cfg.setProperty("selected", selected);
	} else {
		this.cfg.setProperty("selected", selected);
	}

	this.selectEvent.fire(aToBeSelected);
	
	return this.getSelectedDates();
};

/**
* Selects a date on the current calendar by referencing the index of the cell that should be selected.
* This method is used to easily select a single cell (usually with a mouse click) without having to do
* a full render. The selected style is applied to the cell directly.
* @method selectCell
* @param	{Number}	cellIndex	The index of the cell to select in the current calendar. 
* @return	{Date[]}	Array of JavaScript Date objects representing all individual dates that are currently selected.
*/
YAHOO.widget.Calendar.prototype.selectCell = function(cellIndex) {
	this.beforeSelectEvent.fire();

	var selected = this.cfg.getProperty("selected");

	var cell = this.cells[cellIndex];
	var cellDate = this.cellDates[cellIndex];

	var dCellDate = this._toDate(cellDate);

	var selectDate = cellDate.concat();

	selected[selected.length] = selectDate;

	if (this.parent) {
		this.parent.cfg.setProperty("selected", selected);
	} else {
		this.cfg.setProperty("selected", selected);
	}

	this.renderCellStyleSelected(dCellDate,cell);

	this.selectEvent.fire([selectDate]);

	this.doCellMouseOut.call(cell, null, this);

	return this.getSelectedDates();
};

/**
* Deselects a date or a collection of dates on the current calendar. This method, by default,
* does not call the render method explicitly. Once deselection has completed, render must be 
* called for the changes to be reflected visually.
* @method deselect
* @param	{String/Date/Date[]}	date	The date string of dates to deselect in the current calendar. Valid formats are
*								individual date(s) (12/24/2005,12/26/2005) or date range(s) (12/24/2005-1/1/2006).
*								Multiple comma-delimited dates can also be passed to this method (12/24/2005,12/11/2005-12/13/2005).
*								This method can also take a JavaScript Date object or an array of Date objects.	
* @return	{Date[]}			Array of JavaScript Date objects representing all individual dates that are currently selected.
*/
YAHOO.widget.Calendar.prototype.deselect = function(date) {
	this.beforeDeselectEvent.fire();

	var selected = this.cfg.getProperty("selected");

	var aToBeSelected = this._toFieldArray(date);

	for (var a=0;a<aToBeSelected.length;++a) {
		var toSelect = aToBeSelected[a]; // For each date item in the list of dates we're trying to select
		var index = this._indexOfSelectedFieldArray(toSelect);
	
		if (index != -1) {	
			selected.splice(index,1);
		}
	}

	if (this.parent) {
		this.parent.cfg.setProperty("selected", selected);
	} else {
		this.cfg.setProperty("selected", selected);
	}

	this.deselectEvent.fire(aToBeSelected);
	
	return this.getSelectedDates();
};

/**
* Deselects a date on the current calendar by referencing the index of the cell that should be deselected.
* This method is used to easily deselect a single cell (usually with a mouse click) without having to do
* a full render. The selected style is removed from the cell directly.
* @method deselectCell
* @param	{Number}	cellIndex	The index of the cell to deselect in the current calendar. 
* @return	{Date[]}	Array of JavaScript Date objects representing all individual dates that are currently selected.
*/
YAHOO.widget.Calendar.prototype.deselectCell = function(i) {
	this.beforeDeselectEvent.fire();
	
	var selected = this.cfg.getProperty("selected");

	var cell = this.cells[i];
	var cellDate = this.cellDates[i];
	var cellDateIndex = this._indexOfSelectedFieldArray(cellDate);

	var dCellDate = this._toDate(cellDate);

	var selectDate = cellDate.concat();

	if (cellDateIndex > -1) {
		if (this.cfg.getProperty("pagedate").getMonth() == dCellDate.getMonth() &&
			this.cfg.getProperty("pagedate").getFullYear() == dCellDate.getFullYear()) {
			YAHOO.util.Dom.removeClass(cell, this.Style.CSS_CELL_SELECTED);
		}

		selected.splice(cellDateIndex, 1);
	}


	if (this.parent) {
		this.parent.cfg.setProperty("selected", selected);
	} else {
		this.cfg.setProperty("selected", selected);
	}
	
	this.deselectEvent.fire(selectDate);
	return this.getSelectedDates();
};

/**
* Deselects all dates on the current calendar.
* @method deselectAll
* @return {Date[]}		Array of JavaScript Date objects representing all individual dates that are currently selected.
*						Assuming that this function executes properly, the return value should be an empty array.
*						However, the empty array is returned for the sake of being able to check the selection status
*						of the calendar.
*/
YAHOO.widget.Calendar.prototype.deselectAll = function() {
	this.beforeDeselectEvent.fire();

	var selected = this.cfg.getProperty("selected");
	var count = selected.length;
	var sel = selected.concat();

	if (this.parent) {
		this.parent.cfg.setProperty("selected", []);
	} else {
		this.cfg.setProperty("selected", []);
	}
	
	if (count > 0) {
		this.deselectEvent.fire(sel);
	}

	return this.getSelectedDates();
};

// END SELECTION METHODS

// BEGIN TYPE CONVERSION METHODS

/**
* Converts a date (either a JavaScript Date object, or a date string) to the internal data structure
* used to represent dates: [[yyyy,mm,dd],[yyyy,mm,dd]].
* @method _toFieldArray
* @private
* @param	{String/Date/Date[]}	date	The date string of dates to deselect in the current calendar. Valid formats are
*								individual date(s) (12/24/2005,12/26/2005) or date range(s) (12/24/2005-1/1/2006).
*								Multiple comma-delimited dates can also be passed to this method (12/24/2005,12/11/2005-12/13/2005).
*								This method can also take a JavaScript Date object or an array of Date objects.	
* @return {Array[](Number[])}	Array of date field arrays
*/
YAHOO.widget.Calendar.prototype._toFieldArray = function(date) {
	var returnDate = [];

	if (date instanceof Date) {
		returnDate = [[date.getFullYear(), date.getMonth()+1, date.getDate()]];
	} else if (typeof date == 'string') {
		returnDate = this._parseDates(date);
	} else if (date instanceof Array) {
		for (var i=0;i<date.length;++i) {
			var d = date[i];
			returnDate[returnDate.length] = [d.getFullYear(),d.getMonth()+1,d.getDate()];
		}
	}
	
	return returnDate;
};

/**
* Converts a date field array [yyyy,mm,dd] to a JavaScript Date object.
* @method _toDate
* @private
* @param	{Number[]}		dateFieldArray	The date field array to convert to a JavaScript Date.
* @return	{Date}	JavaScript Date object representing the date field array
*/
YAHOO.widget.Calendar.prototype._toDate = function(dateFieldArray) {
	if (dateFieldArray instanceof Date) {
		return dateFieldArray;
	} else {
		return new Date(dateFieldArray[0],dateFieldArray[1]-1,dateFieldArray[2]);
	}
};

// END TYPE CONVERSION METHODS 

// BEGIN UTILITY METHODS

/**
* Converts a date field array [yyyy,mm,dd] to a JavaScript Date object.
* @method _fieldArraysAreEqual
* @private
* @param	{Number[]}	array1	The first date field array to compare
* @param	{Number[]}	array2	The first date field array to compare
* @return	{Boolean}	The boolean that represents the equality of the two arrays
*/
YAHOO.widget.Calendar.prototype._fieldArraysAreEqual = function(array1, array2) {
	var match = false;

	if (array1[0]==array2[0]&&array1[1]==array2[1]&&array1[2]==array2[2]) {
		match=true;	
	}

	return match;
};

/**
* Gets the index of a date field array [yyyy,mm,dd] in the current list of selected dates.
* @method	_indexOfSelectedFieldArray
* @private
* @param	{Number[]}		find	The date field array to search for
* @return	{Number}			The index of the date field array within the collection of selected dates.
*								-1 will be returned if the date is not found.
*/
YAHOO.widget.Calendar.prototype._indexOfSelectedFieldArray = function(find) {
	var selected = -1;
	var seldates = this.cfg.getProperty("selected");

	for (var s=0;s<seldates.length;++s) {
		var sArray = seldates[s];
		if (find[0]==sArray[0]&&find[1]==sArray[1]&&find[2]==sArray[2]) {
			selected = s;
			break;
		}
	}

	return selected;
};

/**
* Determines whether a given date is OOM (out of month).
* @method	isDateOOM
* @param	{Date}	date	The JavaScript Date object for which to check the OOM status
* @return	{Boolean}	true if the date is OOM
*/
YAHOO.widget.Calendar.prototype.isDateOOM = function(date) {
	var isOOM = false;
	if (date.getMonth() != this.cfg.getProperty("pagedate").getMonth()) {
		isOOM = true;
	}
	return isOOM;
};

// END UTILITY METHODS

// BEGIN EVENT HANDLERS

/**
* Event executed before a date is selected in the calendar widget.
* @deprecated Event handlers for this event should be susbcribed to beforeSelectEvent.
*/
YAHOO.widget.Calendar.prototype.onBeforeSelect = function() {
	if (this.cfg.getProperty("MULTI_SELECT") === false) {
		if (this.parent) {
			this.parent.callChildFunction("clearAllBodyCellStyles", this.Style.CSS_CELL_SELECTED);
			this.parent.deselectAll();
		} else {
			this.clearAllBodyCellStyles(this.Style.CSS_CELL_SELECTED);
			this.deselectAll();
		}
	}
};

/**
* Event executed when a date is selected in the calendar widget.
* @param	{Array}	selected	An array of date field arrays representing which date or dates were selected. Example: [ [2006,8,6],[2006,8,7],[2006,8,8] ]
* @deprecated Event handlers for this event should be susbcribed to selectEvent.
*/
YAHOO.widget.Calendar.prototype.onSelect = function(selected) { };

/**
* Event executed before a date is deselected in the calendar widget.
* @deprecated Event handlers for this event should be susbcribed to beforeDeselectEvent.
*/
YAHOO.widget.Calendar.prototype.onBeforeDeselect = function() { };

/**
* Event executed when a date is deselected in the calendar widget.
* @param	{Array}	selected	An array of date field arrays representing which date or dates were deselected. Example: [ [2006,8,6],[2006,8,7],[2006,8,8] ]
* @deprecated Event handlers for this event should be susbcribed to deselectEvent.
*/
YAHOO.widget.Calendar.prototype.onDeselect = function(deselected) { };

/**
* Event executed when the user navigates to a different calendar page.
* @deprecated Event handlers for this event should be susbcribed to changePageEvent.
*/
YAHOO.widget.Calendar.prototype.onChangePage = function() {
	this.render();
};

/**
* Event executed when the calendar widget is rendered.
* @deprecated Event handlers for this event should be susbcribed to renderEvent.
*/
YAHOO.widget.Calendar.prototype.onRender = function() { };

/**
* Event executed when the calendar widget is reset to its original state.
* @deprecated Event handlers for this event should be susbcribed to resetEvemt.
*/
YAHOO.widget.Calendar.prototype.onReset = function() { this.render(); };

/**
* Event executed when the calendar widget is completely cleared to the current month with no selections.
* @deprecated Event handlers for this event should be susbcribed to clearEvent.
*/
YAHOO.widget.Calendar.prototype.onClear = function() { this.render(); };

/**
* Validates the calendar widget. This method has no default implementation
* and must be extended by subclassing the widget.
* @return	Should return true if the widget validates, and false if
* it doesn't.
* @type Boolean
*/
YAHOO.widget.Calendar.prototype.validate = function() { return true; };

// END EVENT HANDLERS

// BEGIN DATE PARSE METHODS

/**
* Converts a date string to a date field array
* @private
* @param	{String}	sDate			Date string. Valid formats are mm/dd and mm/dd/yyyy.
* @return				A date field array representing the string passed to the method
* @type Array[](Number[])
*/
YAHOO.widget.Calendar.prototype._parseDate = function(sDate) {
	var aDate = sDate.split(this.Locale.DATE_FIELD_DELIMITER);
	var rArray;

	if (aDate.length == 2) {
		rArray = [aDate[this.Locale.MD_MONTH_POSITION-1],aDate[this.Locale.MD_DAY_POSITION-1]];
		rArray.type = YAHOO.widget.Calendar.MONTH_DAY;
	} else {
		rArray = [aDate[this.Locale.MDY_YEAR_POSITION-1],aDate[this.Locale.MDY_MONTH_POSITION-1],aDate[this.Locale.MDY_DAY_POSITION-1]];
		rArray.type = YAHOO.widget.Calendar.DATE;
	}

	for (var i=0;i<rArray.length;i++) {
		rArray[i] = parseInt(rArray[i], 10);
	}

	return rArray;
};

/**
* Converts a multi or single-date string to an array of date field arrays
* @private
* @param	{String}	sDates		Date string with one or more comma-delimited dates. Valid formats are mm/dd, mm/dd/yyyy, mm/dd/yyyy-mm/dd/yyyy
* @return							An array of date field arrays
* @type Array[](Number[])
*/
YAHOO.widget.Calendar.prototype._parseDates = function(sDates) {
	var aReturn = [];

	var aDates = sDates.split(this.Locale.DATE_DELIMITER);
	
	for (var d=0;d<aDates.length;++d) {
		var sDate = aDates[d];

		if (sDate.indexOf(this.Locale.DATE_RANGE_DELIMITER) != -1) {
			// This is a range
			var aRange = sDate.split(this.Locale.DATE_RANGE_DELIMITER);

			var dateStart = this._parseDate(aRange[0]);
			var dateEnd = this._parseDate(aRange[1]);

			var fullRange = this._parseRange(dateStart, dateEnd);
			aReturn = aReturn.concat(fullRange);
		} else {
			// This is not a range
			var aDate = this._parseDate(sDate);
			aReturn.push(aDate);
		}
	}
	return aReturn;
};

/**
* Converts a date range to the full list of included dates
* @private
* @param	{Number[]}	startDate	Date field array representing the first date in the range
* @param	{Number[]}	endDate		Date field array representing the last date in the range
* @return							An array of date field arrays
* @type Array[](Number[])
*/
YAHOO.widget.Calendar.prototype._parseRange = function(startDate, endDate) {
	var dStart   = new Date(startDate[0],startDate[1]-1,startDate[2]);
	var dCurrent = YAHOO.widget.DateMath.add(new Date(startDate[0],startDate[1]-1,startDate[2]),YAHOO.widget.DateMath.DAY,1);
	var dEnd     = new Date(endDate[0],  endDate[1]-1,  endDate[2]);

	var results = [];
	results.push(startDate);
	while (dCurrent.getTime() <= dEnd.getTime()) {
		results.push([dCurrent.getFullYear(),dCurrent.getMonth()+1,dCurrent.getDate()]);
		dCurrent = YAHOO.widget.DateMath.add(dCurrent,YAHOO.widget.DateMath.DAY,1);
	}
	return results;
};

// END DATE PARSE METHODS

// BEGIN RENDERER METHODS

/**
* Resets the render stack of the current calendar to its original pre-render value.
*/
YAHOO.widget.Calendar.prototype.resetRenderers = function() {
	this.renderStack = this._renderStack.concat();
};

/**
* Clears the inner HTML, CSS class and style information from the specified cell.
* @method clearElement
* @param	{HTMLTableCellElement}	The cell to clear
*/ 
YAHOO.widget.Calendar.prototype.clearElement = function(cell) {
	cell.innerHTML = "&#160;";
	cell.className="";
};

/**
* Adds a renderer to the render stack. The function reference passed to this method will be executed
* when a date cell matches the conditions specified in the date string for this renderer.
* @method addRenderer
* @param	{String}	sDates		A date string to associate with the specified renderer. Valid formats
*									include date (12/24/2005), month/day (12/24), and range (12/1/2004-1/1/2005)
* @param	{Function}	fnRender	The function executed to render cells that match the render rules for this renderer.
*/
YAHOO.widget.Calendar.prototype.addRenderer = function(sDates, fnRender) {
	var aDates = this._parseDates(sDates);
	for (var i=0;i<aDates.length;++i) {
		var aDate = aDates[i];
	
		if (aDate.length == 2) { // this is either a range or a month/day combo
			if (aDate[0] instanceof Array) { // this is a range
				this._addRenderer(YAHOO.widget.Calendar.RANGE,aDate,fnRender);
			} else { // this is a month/day combo
				this._addRenderer(YAHOO.widget.Calendar.MONTH_DAY,aDate,fnRender);
			}
		} else if (aDate.length == 3) {
			this._addRenderer(YAHOO.widget.Calendar.DATE,aDate,fnRender);
		}
	}
};

/**
* The private method used for adding cell renderers to the local render stack.
* This method is called by other methods that set the renderer type prior to the method call.
* @method _addRenderer
* @private
* @param	{String}	type		The type string that indicates the type of date renderer being added.
*									Values are YAHOO.widget.Calendar.DATE, YAHOO.widget.Calendar.MONTH_DAY, YAHOO.widget.Calendar.WEEKDAY,
*									YAHOO.widget.Calendar.RANGE, YAHOO.widget.Calendar.MONTH
* @param	{Array}		aDates		An array of dates used to construct the renderer. The format varies based
*									on the renderer type
* @param	{Function}	fnRender	The function executed to render cells that match the render rules for this renderer.
*/
YAHOO.widget.Calendar.prototype._addRenderer = function(type, aDates, fnRender) {
	var add = [type,aDates,fnRender];
	this.renderStack.unshift(add);	
	this._renderStack = this.renderStack.concat();
};

/**
* Adds a month to the render stack. The function reference passed to this method will be executed
* when a date cell matches the month passed to this method.
* @method addMonthRenderer
* @param	{Number}	month		The month (1-12) to associate with this renderer
* @param	{Function}	fnRender	The function executed to render cells that match the render rules for this renderer.
*/
YAHOO.widget.Calendar.prototype.addMonthRenderer = function(month, fnRender) {
	this._addRenderer(YAHOO.widget.Calendar.MONTH,[month],fnRender);
};

/**
* Adds a weekday to the render stack. The function reference passed to this method will be executed
* when a date cell matches the weekday passed to this method.
* @method addWeekdayRenderer
* @param	{Number}	weekday		The weekday (0-6) to associate with this renderer
* @param	{Function}	fnRender	The function executed to render cells that match the render rules for this renderer.
*/
YAHOO.widget.Calendar.prototype.addWeekdayRenderer = function(weekday, fnRender) {
	this._addRenderer(YAHOO.widget.Calendar.WEEKDAY,[weekday],fnRender);
};

// END RENDERER METHODS

// BEGIN CSS METHODS

/**
* Removes all styles from all body cells in the current calendar table.
* @method clearAllBodyCellStyles
* @param	{style}		The CSS class name to remove from all calendar body cells
*/
YAHOO.widget.Calendar.prototype.clearAllBodyCellStyles = function(style) {
	for (var c=0;c<this.cells.length;++c) {
		YAHOO.util.Dom.removeClass(this.cells[c],style);
	}
};

// END CSS METHODS

// BEGIN GETTER/SETTER METHODS
/**
* Sets the calendar's month explicitly
* @method setMonth
* @param {Number}	month		The numeric month, from 0 (January) to 11 (December)
*/
YAHOO.widget.Calendar.prototype.setMonth = function(month) {
	var current = this.cfg.getProperty("pagedate");
	current.setMonth(parseInt(month, 10));
	this.cfg.setProperty("pagedate", current);
};

/**
* Sets the calendar's year explicitly.
* @method setYear
* @param {Number}	year		The numeric 4-digit year
*/
YAHOO.widget.Calendar.prototype.setYear = function(year) {
	var current = this.cfg.getProperty("pagedate");
	current.setFullYear(parseInt(year, 10));
	this.cfg.setProperty("pagedate", current);
};

/**
* Gets the list of currently selected dates from the calendar.
* @method getSelectedDates
* @return {Date[]} An array of currently selected JavaScript Date objects.
*/
YAHOO.widget.Calendar.prototype.getSelectedDates = function() {
	var returnDates = [];
	var selected = this.cfg.getProperty("selected");

	for (var d=0;d<selected.length;++d) {
		var dateArray = selected[d];

		var date = new Date(dateArray[0],dateArray[1]-1,dateArray[2]);
		returnDates.push(date);
	}

	returnDates.sort( function(a,b) { return a-b; } );
	return returnDates;
};

/// END GETTER/SETTER METHODS ///

/**
* Hides the Calendar's outer container from view.
* @method hide
*/
YAHOO.widget.Calendar.prototype.hide = function() {
	this.oDomContainer.style.display = "none";
};

/**
* Shows the Calendar's outer container.
* @method show
*/
YAHOO.widget.Calendar.prototype.show = function() {
	this.oDomContainer.style.display = "block";
};

/**
* Returns a string representing the current browser.
* @property browser
* @type String
*/
YAHOO.widget.Calendar.prototype.browser = function() {
			var ua = navigator.userAgent.toLowerCase();
				  if (ua.indexOf('opera')!=-1) { // Opera (check first in case of spoof)
					 return 'opera';
				  } else if (ua.indexOf('msie 7')!=-1) { // IE7
					 return 'ie7';
				  } else if (ua.indexOf('msie') !=-1) { // IE
					 return 'ie';
				  } else if (ua.indexOf('safari')!=-1) { // Safari (check before Gecko because it includes "like Gecko")
					 return 'safari';
				  } else if (ua.indexOf('gecko') != -1) { // Gecko
					 return 'gecko';
				  } else {
					 return false;
				  }
			}();
/**
* Returns a string representation of the object.
* @method toString
* @return {String}	A string representation of the Calendar object.
*/
YAHOO.widget.Calendar.prototype.toString = function() {
	return "Calendar " + this.id;
};

/**
* @namespace YAHOO.widget
* @class Calendar_Core
* @extends YAHOO.widget.Calendar
* @deprecated The old Calendar_Core class is no longer necessary.
*/
YAHOO.widget.Calendar_Core = YAHOO.widget.Calendar;

YAHOO.widget.Cal_Core = YAHOO.widget.Calendar;

/**
* YAHOO.widget.CalendarGroup is a special container class for YAHOO.widget.Calendar. This class facilitates
* the ability to have multi-page calendar views that share a single dataset and are
* dependent on each other.
* 
* The calendar group instance will refer to each of its elements using a 0-based index.
* For example, to construct the placeholder for a calendar group widget with id "cal1" and
* containerId of "cal1Container", the markup would be as follows:
*	<xmp>
*		<div id="cal1Container_0"></div>
*		<div id="cal1Container_1"></div>
*	</xmp>
* The tables for the calendars ("cal1_0" and "cal1_1") will be inserted into those containers.
* @namespace YAHOO.widget
* @class CalendarGroup
* @constructor
* @param {String}	id			The id of the table element that will represent the calendar widget
* @param {String}	containerId	The id of the container div element that will wrap the calendar table
* @param {Object}	config		The configuration object containing the Calendar's arguments
*/
YAHOO.widget.CalendarGroup = function(id, containerId, config) {
	if (arguments.length > 0) {
		this.init(id, containerId, config);
	}
};

/**
* Initializes the calendar group. All subclasses must call this method in order for the
* group to be initialized properly.
* @method init
* @param {String}	id			The id of the table element that will represent the calendar widget
* @param {String}	containerId	The id of the container div element that will wrap the calendar table
* @param {Object}	config		The configuration object containing the Calendar's arguments
*/
YAHOO.widget.CalendarGroup.prototype.init = function(id, containerId, config) {
	this.initEvents();
	this.initStyles();

	/**
	* The collection of Calendar pages contained within the CalendarGroup
	* @property pages
	* @type YAHOO.widget.Calendar[]
	*/
	this.pages = [];
	
	/**
	* The unique id associated with the CalendarGroup
	* @property id
	* @type String
	*/
	this.id = id;

	/**
	* The unique id associated with the CalendarGroup container
	* @property containerId
	* @type String
	*/
	this.containerId = containerId;

	/**
	* The outer containing element for the CalendarGroup
	* @property oDomContainer
	* @type HTMLElement
	*/
	this.oDomContainer = document.getElementById(containerId);

	YAHOO.util.Dom.addClass(this.oDomContainer, YAHOO.widget.CalendarGroup.CSS_CONTAINER);
	YAHOO.util.Dom.addClass(this.oDomContainer, YAHOO.widget.CalendarGroup.CSS_MULTI_UP);

	/**
	* The Config object used to hold the configuration variables for the CalendarGroup
	* @property cfg
	* @type YAHOO.util.Config
	*/
	this.cfg = new YAHOO.util.Config(this);

	/**
	* The local object which contains the CalendarGroup's options
	* @property Options
	* @type Object
	*/
	this.Options = {};

	/**
	* The local object which contains the CalendarGroup's locale settings
	* @property Locale
	* @type Object
	*/
	this.Locale = {};

	this.setupConfig();

	if (config) {
		this.cfg.applyConfig(config, true);
	}

	this.cfg.fireQueue();

	// OPERA HACK FOR MISWRAPPED FLOATS
	if (this.browser == "opera"){
		var fixWidth = function() {
			var startW = this.oDomContainer.offsetWidth;
			var w = 0;
			for (var p=0;p<this.pages.length;++p) {
				var cal = this.pages[p];
				w += cal.oDomContainer.offsetWidth;
			}
			if (w > 0) {
				this.oDomContainer.style.width = w + "px";
			}
		};
		this.renderEvent.subscribe(fixWidth,this,true);
	}
};


YAHOO.widget.CalendarGroup.prototype.setupConfig = function() {
	/**
	* The number of pages to include in the CalendarGroup. This value can only be set once, in the CalendarGroup's constructor arguments.
	* @config pages
	* @type Number
	* @default 2
	*/
	this.cfg.addProperty("pages", { value:2, validator:this.cfg.checkNumber, handler:this.configPages } );

	/**
	* The month/year representing the current visible Calendar date (mm/yyyy)
	* @config pagedate
	* @type String
	* @default today's date
	*/
	this.cfg.addProperty("pagedate", { value:new Date(), handler:this.configPageDate } );

	/**
	* The date or range of dates representing the current Calendar selection
	* @config selected
	* @type String
	* @default []
	*/
	this.cfg.addProperty("selected", { value:[], handler:this.delegateConfig } );

	/**
	* The title to display above the CalendarGroup's month header
	* @config title
	* @type String
	* @default ""
	*/
	this.cfg.addProperty("title", { value:"", handler:this.configTitle } );

	/**
	* Whether or not a close button should be displayed for this CalendarGroup
	* @config close
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty("close", { value:false, handler:this.configClose } );

	/**
	* Whether or not an iframe shim should be placed under the Calendar to prevent select boxes from bleeding through in Internet Explorer 6 and below.
	* @config iframe
	* @type Boolean
	* @default true
	*/
	this.cfg.addProperty("iframe", { value:true, handler:this.delegateConfig, validator:this.cfg.checkBoolean } );

	/**
	* The minimum selectable date in the current Calendar (mm/dd/yyyy)
	* @config mindate
	* @type String
	* @default null
	*/
	this.cfg.addProperty("mindate", { value:null, handler:this.delegateConfig } );

	/**
	* The maximum selectable date in the current Calendar (mm/dd/yyyy)
	* @config maxdate
	* @type String
	* @default null
	*/	
	this.cfg.addProperty("maxdate", { value:null, handler:this.delegateConfig  } );

	// Options properties

	/**
	* True if the Calendar should allow multiple selections. False by default.
	* @config MULTI_SELECT
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty("MULTI_SELECT",	{ value:false, handler:this.delegateConfig, validator:this.cfg.checkBoolean } );

	/**
	* The weekday the week begins on. Default is 0 (Sunday).
	* @config START_WEEKDAY
	* @type number
	* @default 0
	*/	
	this.cfg.addProperty("START_WEEKDAY",	{ value:0, handler:this.delegateConfig, validator:this.cfg.checkNumber  } );
	
	/**
	* True if the Calendar should show weekday labels. True by default.
	* @config SHOW_WEEKDAYS
	* @type Boolean
	* @default true
	*/	
	this.cfg.addProperty("SHOW_WEEKDAYS",	{ value:true, handler:this.delegateConfig, validator:this.cfg.checkBoolean } );
	
	/**
	* True if the Calendar should show week row headers. False by default.
	* @config SHOW_WEEK_HEADER
	* @type Boolean
	* @default false
	*/	
	this.cfg.addProperty("SHOW_WEEK_HEADER",{ value:false, handler:this.delegateConfig, validator:this.cfg.checkBoolean } );
	
	/**
	* True if the Calendar should show week row footers. False by default.
	* @config SHOW_WEEK_FOOTER
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty("SHOW_WEEK_FOOTER",{ value:false, handler:this.delegateConfig, validator:this.cfg.checkBoolean } );
	
	/**
	* True if the Calendar should suppress weeks that are not a part of the current month. False by default.
	* @config HIDE_BLANK_WEEKS
	* @type Boolean
	* @default false
	*/		
	this.cfg.addProperty("HIDE_BLANK_WEEKS",{ value:false, handler:this.delegateConfig, validator:this.cfg.checkBoolean } );
	
	/**
	* The image that should be used for the left navigation arrow.
	* @config NAV_ARROW_LEFT
	* @type String
	* @default YAHOO.widget.Calendar.IMG_ROOT + "us/tr/callt.gif"
	*/		
	this.cfg.addProperty("NAV_ARROW_LEFT",	{ value:YAHOO.widget.Calendar.IMG_ROOT + "us/tr/callt.gif", handler:this.delegateConfig } );
	
	/**
	* The image that should be used for the left navigation arrow.
	* @config NAV_ARROW_RIGHT
	* @type String
	* @default YAHOO.widget.Calendar.IMG_ROOT + "us/tr/calrt.gif"
	*/		
	this.cfg.addProperty("NAV_ARROW_RIGHT",	{ value:YAHOO.widget.Calendar.IMG_ROOT + "us/tr/calrt.gif", handler:this.delegateConfig } );

	// Locale properties
	
	/**
	* The short month labels for the current locale.
	* @config MONTHS_SHORT
	* @type String[]
	* @default ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	*/
	this.cfg.addProperty("MONTHS_SHORT",	{ value:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], handler:this.delegateConfig } );
	
	/**
	* The long month labels for the current locale.
	* @config MONTHS_LONG
	* @type String[]
	* @default ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	*/		
	this.cfg.addProperty("MONTHS_LONG",		{ value:["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], handler:this.delegateConfig } );
	
	/**
	* The 1-character weekday labels for the current locale.
	* @config WEEKDAYS_1CHAR
	* @type String[]
	* @default ["S", "M", "T", "W", "T", "F", "S"]
	*/		
	this.cfg.addProperty("WEEKDAYS_1CHAR",	{ value:["S", "M", "T", "W", "T", "F", "S"], handler:this.delegateConfig } );
	
	/**
	* The short weekday labels for the current locale.
	* @config WEEKDAYS_SHORT
	* @type String[]
	* @default ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
	*/		
	this.cfg.addProperty("WEEKDAYS_SHORT",	{ value:["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], handler:this.delegateConfig } );
	
	/**
	* The medium weekday labels for the current locale.
	* @config WEEKDAYS_MEDIUM
	* @type String[]
	* @default ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	*/		
	this.cfg.addProperty("WEEKDAYS_MEDIUM",	{ value:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], handler:this.delegateConfig } );
	
	/**
	* The long weekday labels for the current locale.
	* @config WEEKDAYS_LONG
	* @type String[]
	* @default ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	*/		
	this.cfg.addProperty("WEEKDAYS_LONG",	{ value:["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], handler:this.delegateConfig } );

	/**
	* The setting that determines which length of month labels should be used. Possible values are "short" and "long".
	* @config LOCALE_MONTHS
	* @type String
	* @default "long"
	*/
	this.cfg.addProperty("LOCALE_MONTHS",	{ value:"long", handler:this.delegateConfig } );

	/**
	* The setting that determines which length of weekday labels should be used. Possible values are "1char", "short", "medium", and "long".
	* @config LOCALE_WEEKDAYS
	* @type String
	* @default "short"
	*/	
	this.cfg.addProperty("LOCALE_WEEKDAYS",	{ value:"short", handler:this.delegateConfig } );

	/**
	* The value used to delimit individual dates in a date string passed to various Calendar functions.
	* @config DATE_DELIMITER
	* @type String
	* @default ","
	*/
	this.cfg.addProperty("DATE_DELIMITER",		{ value:",", handler:this.delegateConfig } );

	/**
	* The value used to delimit date fields in a date string passed to various Calendar functions.
	* @config DATE_FIELD_DELIMITER
	* @type String
	* @default "/"
	*/	
	this.cfg.addProperty("DATE_FIELD_DELIMITER",{ value:"/", handler:this.delegateConfig } );

	/**
	* The value used to delimit date ranges in a date string passed to various Calendar functions.
	* @config DATE_RANGE_DELIMITER
	* @type String
	* @default "-"
	*/
	this.cfg.addProperty("DATE_RANGE_DELIMITER",{ value:"-", handler:this.delegateConfig } );

	/**
	* The position of the month in a month/year date string
	* @config MY_MONTH_POSITION
	* @type Number
	* @default 1
	*/
	this.cfg.addProperty("MY_MONTH_POSITION",	{ value:1, handler:this.delegateConfig, validator:this.cfg.checkNumber } );
	
	/**
	* The position of the year in a month/year date string
	* @config MY_YEAR_POSITION
	* @type Number
	* @default 2
	*/	
	this.cfg.addProperty("MY_YEAR_POSITION",	{ value:2, handler:this.delegateConfig, validator:this.cfg.checkNumber } );
	
	/**
	* The position of the month in a month/day date string
	* @config MD_MONTH_POSITION
	* @type Number
	* @default 1
	*/	
	this.cfg.addProperty("MD_MONTH_POSITION",	{ value:1, handler:this.delegateConfig, validator:this.cfg.checkNumber } );
	
	/**
	* The position of the day in a month/year date string
	* @config MD_DAY_POSITION
	* @type Number
	* @default 2
	*/	
	this.cfg.addProperty("MD_DAY_POSITION",		{ value:2, handler:this.delegateConfig, validator:this.cfg.checkNumber } );
	
	/**
	* The position of the month in a month/day/year date string
	* @config MDY_MONTH_POSITION
	* @type Number
	* @default 1
	*/	
	this.cfg.addProperty("MDY_MONTH_POSITION",	{ value:1, handler:this.delegateConfig, validator:this.cfg.checkNumber } );
	
	/**
	* The position of the day in a month/day/year date string
	* @config MDY_DAY_POSITION
	* @type Number
	* @default 2
	*/	
	this.cfg.addProperty("MDY_DAY_POSITION",	{ value:2, handler:this.delegateConfig, validator:this.cfg.checkNumber } );
	
	/**
	* The position of the year in a month/day/year date string
	* @config MDY_YEAR_POSITION
	* @type Number
	* @default 3
	*/	
	this.cfg.addProperty("MDY_YEAR_POSITION",	{ value:3, handler:this.delegateConfig, validator:this.cfg.checkNumber } );

};

/**
* Initializes CalendarGroup's built-in CustomEvents
* @method initEvents
*/
YAHOO.widget.CalendarGroup.prototype.initEvents = function() {
	var me = this;

	/**
	* Proxy subscriber to subscribe to the CalendarGroup's child Calendars' CustomEvents
	* @method sub
	* @private
	* @param {Function} fn	The function to subscribe to this CustomEvent
	* @param {Object}	obj	The CustomEvent's scope object
	* @param {Boolean}	bOverride	Whether or not to apply scope correction
	*/
	var sub = function(fn, obj, bOverride) {
		for (var p=0;p<me.pages.length;++p) {
			var cal = me.pages[p];
			cal[this.type + "Event"].subscribe(fn, obj, bOverride);
		}
	};

	/**
	* Proxy unsubscriber to unsubscribe from the CalendarGroup's child Calendars' CustomEvents
	* @method unsub
	* @private
	* @param {Function} fn	The function to subscribe to this CustomEvent
	* @param {Object}	obj	The CustomEvent's scope object
	*/
	var unsub = function(fn, obj) {
		for (var p=0;p<me.pages.length;++p) {
			var cal = me.pages[p];
			cal[this.type + "Event"].unsubscribe(fn, obj);
		}
	};

	/**
	* Fired before a selection is made
	* @event beforeSelectEvent
	*/
	this.beforeSelectEvent = new YAHOO.util.CustomEvent("beforeSelect");
	this.beforeSelectEvent.subscribe = sub; this.beforeSelectEvent.unsubscribe = unsub;

	/**
	* Fired when a selection is made
	* @event selectEvent
	* @param {Array}	Array of Date field arrays in the format [YYYY, MM, DD].
	*/
	this.selectEvent = new YAHOO.util.CustomEvent("select"); 
	this.selectEvent.subscribe = sub; this.selectEvent.unsubscribe = unsub;

	/**
	* Fired before a selection is made
	* @event beforeDeselectEvent
	*/
	this.beforeDeselectEvent = new YAHOO.util.CustomEvent("beforeDeselect"); 
	this.beforeDeselectEvent.subscribe = sub; this.beforeDeselectEvent.unsubscribe = unsub;

	/**
	* Fired when a selection is made
	* @event deselectEvent
	* @param {Array}	Array of Date field arrays in the format [YYYY, MM, DD].
	*/
	this.deselectEvent = new YAHOO.util.CustomEvent("deselect"); 
	this.deselectEvent.subscribe = sub; this.deselectEvent.unsubscribe = unsub;
	
	/**
	* Fired when the Calendar page is changed
	* @event changePageEvent
	*/
	this.changePageEvent = new YAHOO.util.CustomEvent("changePage"); 
	this.changePageEvent.subscribe = sub; this.changePageEvent.unsubscribe = unsub;

	/**
	* Fired before the Calendar is rendered
	* @event beforeRenderEvent
	*/
	this.beforeRenderEvent = new YAHOO.util.CustomEvent("beforeRender");
	this.beforeRenderEvent.subscribe = sub; this.beforeRenderEvent.unsubscribe = unsub;

	/**
	* Fired when the Calendar is rendered
	* @event renderEvent
	*/
	this.renderEvent = new YAHOO.util.CustomEvent("render");
	this.renderEvent.subscribe = sub; this.renderEvent.unsubscribe = unsub;

	/**
	* Fired when the Calendar is reset
	* @event resetEvent
	*/
	this.resetEvent = new YAHOO.util.CustomEvent("reset"); 
	this.resetEvent.subscribe = sub; this.resetEvent.unsubscribe = unsub;

	/**
	* Fired when the Calendar is cleared
	* @event clearEvent
	*/
	this.clearEvent = new YAHOO.util.CustomEvent("clear");
	this.clearEvent.subscribe = sub; this.clearEvent.unsubscribe = unsub;

};

/**
* The default Config handler for the "pages" property
* @method configPages
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.CalendarGroup.prototype.configPages = function(type, args, obj) {
	var pageCount = args[0];

	for (var p=0;p<pageCount;++p) {
		var calId = this.id + "_" + p;
		var calContainerId = this.containerId + "_" + p;

		var childConfig = this.cfg.getConfig();
		childConfig.close = false;
		childConfig.title = false;

		var cal = this.constructChild(calId, calContainerId, childConfig);
		var caldate = cal.cfg.getProperty("pagedate");
		caldate.setMonth(caldate.getMonth()+p);
		cal.cfg.setProperty("pagedate", caldate);
		
		YAHOO.util.Dom.removeClass(cal.oDomContainer, this.Style.CSS_SINGLE);
		YAHOO.util.Dom.addClass(cal.oDomContainer, "groupcal");
		
		if (p===0) {
			YAHOO.util.Dom.addClass(cal.oDomContainer, "first");
		}

		if (p==(pageCount-1)) {
			YAHOO.util.Dom.addClass(cal.oDomContainer, "last");
		}
		
		cal.parent = this;
		cal.index = p; 

		this.pages[this.pages.length] = cal;
	}
};

/**
* The default Config handler for the "pagedate" property
* @method configPageDate
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.CalendarGroup.prototype.configPageDate = function(type, args, obj) {
	var val = args[0];

	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.cfg.setProperty("pagedate", val);
		var calDate = cal.cfg.getProperty("pagedate");
		calDate.setMonth(calDate.getMonth()+p);
	}
};

/**
* Delegates a configuration property to the CustomEvents associated with the CalendarGroup's children
* @method delegateConfig
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.CalendarGroup.prototype.delegateConfig = function(type, args, obj) {
	var val = args[0];
	var cal;

	for (var p=0;p<this.pages.length;p++) {
		cal = this.pages[p];
		cal.cfg.setProperty(type, val);
	}
};


/**
* Adds a function to all child Calendars within this CalendarGroup.
* @method setChildFunction
* @param {String}		fnName		The name of the function
* @param {Function}		fn			The function to apply to each Calendar page object
*/
YAHOO.widget.CalendarGroup.prototype.setChildFunction = function(fnName, fn) {
	var pageCount = this.cfg.getProperty("pages");

	for (var p=0;p<pageCount;++p) {
		this.pages[p][fnName] = fn;
	}
};

/**
* Calls a function within all child Calendars within this CalendarGroup.
* @method callChildFunction
* @param {String}		fnName		The name of the function
* @param {Array}		args		The arguments to pass to the function
*/
YAHOO.widget.CalendarGroup.prototype.callChildFunction = function(fnName, args) {
	var pageCount = this.cfg.getProperty("pages");

	for (var p=0;p<pageCount;++p) {
		var page = this.pages[p];
		if (page[fnName]) {
			var fn = page[fnName];
			fn.call(page, args);
		}
	}	
};

/**
* Constructs a child calendar. This method can be overridden if a subclassed version of the default
* calendar is to be used.
* @method constructChild
* @param {String}	id			The id of the table element that will represent the calendar widget
* @param {String}	containerId	The id of the container div element that will wrap the calendar table
* @param {Object}	config		The configuration object containing the Calendar's arguments
* @return {YAHOO.widget.Calendar}	The YAHOO.widget.Calendar instance that is constructed
*/
YAHOO.widget.CalendarGroup.prototype.constructChild = function(id,containerId,config) {
	var container = document.getElementById(containerId);
	if (! container) {
		container = document.createElement("div");
		container.id = containerId;
		this.oDomContainer.appendChild(container);
	}
	return new YAHOO.widget.Calendar(id,containerId,config);
};


/**
* Sets the calendar group's month explicitly. This month will be set into the first
* page of the multi-page calendar, and all other months will be iterated appropriately.
* @method setMonth
* @param {Number}	month		The numeric month, from 0 (January) to 11 (December)
*/
YAHOO.widget.CalendarGroup.prototype.setMonth = function(month) {
	month = parseInt(month, 10);

	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.setMonth(month+p);
	}
};

/**
* Sets the calendar group's year explicitly. This year will be set into the first
* page of the multi-page calendar, and all other months will be iterated appropriately.
* @method setYear
* @param {Number}	year		The numeric 4-digit year
*/
YAHOO.widget.CalendarGroup.prototype.setYear = function(year) {
	year = parseInt(year, 10);

	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		var pageDate = cal.cfg.getProperty("pageDate");

		if ((pageDate.getMonth()+1) == 1 && p>0) {
			year+=1;
		}
		cal.setYear(year);
	}
};
/**
* Calls the render function of all child calendars within the group.
* @method render
*/
YAHOO.widget.CalendarGroup.prototype.render = function() {
	this.renderHeader();
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.render();
	}
	this.renderFooter();
};

/**
* Selects a date or a collection of dates on the current calendar. This method, by default,
* does not call the render method explicitly. Once selection has completed, render must be 
* called for the changes to be reflected visually.
* @method select
* @param	{String/Date/Date[]}	date	The date string of dates to select in the current calendar. Valid formats are
*								individual date(s) (12/24/2005,12/26/2005) or date range(s) (12/24/2005-1/1/2006).
*								Multiple comma-delimited dates can also be passed to this method (12/24/2005,12/11/2005-12/13/2005).
*								This method can also take a JavaScript Date object or an array of Date objects.
* @return	{Date[]}			Array of JavaScript Date objects representing all individual dates that are currently selected.
*/
YAHOO.widget.CalendarGroup.prototype.select = function(date) {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.select(date);
	}
	return this.getSelectedDates();
};

/**
* Selects a date on the current calendar by referencing the index of the cell that should be selected.
* This method is used to easily select a single cell (usually with a mouse click) without having to do
* a full render. The selected style is applied to the cell directly.
* @method selectCell
* @param	{Number}	cellIndex	The index of the cell to select in the current calendar. 
* @return	{Date[]}	Array of JavaScript Date objects representing all individual dates that are currently selected.
*/
YAHOO.widget.CalendarGroup.prototype.selectCell = function(cellIndex) {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.selectCell(cellIndex);
	}
	return this.getSelectedDates();
};

/**
* Deselects a date or a collection of dates on the current calendar. This method, by default,
* does not call the render method explicitly. Once deselection has completed, render must be 
* called for the changes to be reflected visually.
* @method deselect
* @param	{String/Date/Date[]}	date	The date string of dates to deselect in the current calendar. Valid formats are
*								individual date(s) (12/24/2005,12/26/2005) or date range(s) (12/24/2005-1/1/2006).
*								Multiple comma-delimited dates can also be passed to this method (12/24/2005,12/11/2005-12/13/2005).
*								This method can also take a JavaScript Date object or an array of Date objects.	
* @return	{Date[]}			Array of JavaScript Date objects representing all individual dates that are currently selected.
*/
YAHOO.widget.CalendarGroup.prototype.deselect = function(date) {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.deselect(date);
	}
	return this.getSelectedDates();
};

/**
* Deselects all dates on the current calendar.
* @method deselectAll
* @return {Date[]}		Array of JavaScript Date objects representing all individual dates that are currently selected.
*						Assuming that this function executes properly, the return value should be an empty array.
*						However, the empty array is returned for the sake of being able to check the selection status
*						of the calendar.
*/
YAHOO.widget.CalendarGroup.prototype.deselectAll = function() {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.deselectAll();
	}
	return this.getSelectedDates();
};

/**
* Deselects a date on the current calendar by referencing the index of the cell that should be deselected.
* This method is used to easily deselect a single cell (usually with a mouse click) without having to do
* a full render. The selected style is removed from the cell directly.
* @method deselectCell
* @param	{Number}	cellIndex	The index of the cell to deselect in the current calendar. 
* @return	{Date[]}	Array of JavaScript Date objects representing all individual dates that are currently selected.
*/
YAHOO.widget.CalendarGroup.prototype.deselectCell = function(cellIndex) {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.deselectCell(cellIndex);
	}
	return this.getSelectedDates();
};

/**
* Resets the calendar widget to the originally selected month and year, and 
* sets the calendar to the initial selection(s).
* @method reset
*/
YAHOO.widget.CalendarGroup.prototype.reset = function() {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.reset();
	}
};

/**
* Clears the selected dates in the current calendar widget and sets the calendar
* to the current month and year.
* @method clear
*/
YAHOO.widget.CalendarGroup.prototype.clear = function() {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.clear();
	}
};

/**
* Navigates to the next month page in the calendar widget.
* @method nextMonth
*/
YAHOO.widget.CalendarGroup.prototype.nextMonth = function() {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.nextMonth();
	}
};

/**
* Navigates to the previous month page in the calendar widget.
* @method previousMonth
*/
YAHOO.widget.CalendarGroup.prototype.previousMonth = function() {
	for (var p=this.pages.length-1;p>=0;--p) {
		var cal = this.pages[p];
		cal.previousMonth();
	}
};

/**
* Navigates to the next year in the currently selected month in the calendar widget.
* @method nextYear
*/
YAHOO.widget.CalendarGroup.prototype.nextYear = function() {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.nextYear();
	}
};

/**
* Navigates to the previous year in the currently selected month in the calendar widget.
* @method previousYear
*/
YAHOO.widget.CalendarGroup.prototype.previousYear = function() {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.previousYear();
	}
};


/**
* Gets the list of currently selected dates from the calendar.
* @return			An array of currently selected JavaScript Date objects.
* @type Date[]
*/
YAHOO.widget.CalendarGroup.prototype.getSelectedDates = function() { 
	var returnDates = [];
	var selected = this.cfg.getProperty("selected");

	for (var d=0;d<selected.length;++d) {
		var dateArray = selected[d];

		var date = new Date(dateArray[0],dateArray[1]-1,dateArray[2]);
		returnDates.push(date);
	}

	returnDates.sort( function(a,b) { return a-b; } );
	return returnDates;
};

/**
* Adds a renderer to the render stack. The function reference passed to this method will be executed
* when a date cell matches the conditions specified in the date string for this renderer.
* @method addRenderer
* @param	{String}	sDates		A date string to associate with the specified renderer. Valid formats
*									include date (12/24/2005), month/day (12/24), and range (12/1/2004-1/1/2005)
* @param	{Function}	fnRender	The function executed to render cells that match the render rules for this renderer.
*/
YAHOO.widget.CalendarGroup.prototype.addRenderer = function(sDates, fnRender) {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.addRenderer(sDates, fnRender);
	}
};

/**
* Adds a month to the render stack. The function reference passed to this method will be executed
* when a date cell matches the month passed to this method.
* @method addMonthRenderer
* @param	{Number}	month		The month (1-12) to associate with this renderer
* @param	{Function}	fnRender	The function executed to render cells that match the render rules for this renderer.
*/
YAHOO.widget.CalendarGroup.prototype.addMonthRenderer = function(month, fnRender) {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.addMonthRenderer(month, fnRender);
	}
};

/**
* Adds a weekday to the render stack. The function reference passed to this method will be executed
* when a date cell matches the weekday passed to this method.
* @method addWeekdayRenderer
* @param	{Number}	weekday		The weekday (0-6) to associate with this renderer
* @param	{Function}	fnRender	The function executed to render cells that match the render rules for this renderer.
*/
YAHOO.widget.CalendarGroup.prototype.addWeekdayRenderer = function(weekday, fnRender) {
	for (var p=0;p<this.pages.length;++p) {
		var cal = this.pages[p];
		cal.addWeekdayRenderer(weekday, fnRender);
	}
};

/**
* Renders the header for the CalendarGroup.
* @method renderHeader
*/
YAHOO.widget.CalendarGroup.prototype.renderHeader = function() {};

/**
* Renders a footer for the 2-up calendar container. By default, this method is
* unimplemented.
* @method renderFooter
*/
YAHOO.widget.CalendarGroup.prototype.renderFooter = function() {};

/**
* Adds the designated number of months to the current calendar month, and sets the current
* calendar page date to the new month.
* @method addMonths
* @param {Number}	count	The number of months to add to the current calendar
*/
YAHOO.widget.CalendarGroup.prototype.addMonths = function(count) {
	this.callChildFunction("addMonths", count);
};


/**
* Subtracts the designated number of months from the current calendar month, and sets the current
* calendar page date to the new month.
* @method subtractMonths
* @param {Number}	count	The number of months to subtract from the current calendar
*/
YAHOO.widget.CalendarGroup.prototype.subtractMonths = function(count) {
	this.callChildFunction("subtractMonths", count);
};

/**
* Adds the designated number of years to the current calendar, and sets the current
* calendar page date to the new month.
* @method addYears
* @param {Number}	count	The number of years to add to the current calendar
*/
YAHOO.widget.CalendarGroup.prototype.addYears = function(count) {
	this.callChildFunction("addYears", count);
};

/**
* Subtcats the designated number of years from the current calendar, and sets the current
* calendar page date to the new month.
* @method subtractYears
* @param {Number}	count	The number of years to subtract from the current calendar
*/
YAHOO.widget.CalendarGroup.prototype.subtractYears = function(count) {
	this.callChildFunction("subtractYears", count);
};

/**
* CSS class representing the container for the calendar
* @property YAHOO.widget.CalendarGroup.CSS_CONTAINER
* @static
* @final
* @type String
*/
YAHOO.widget.CalendarGroup.CSS_CONTAINER = "yui-calcontainer";

/**
* CSS class representing the container for the calendar
* @property YAHOO.widget.CalendarGroup.CSS_MULTI_UP
* @static
* @final
* @type String
*/
YAHOO.widget.CalendarGroup.CSS_MULTI_UP = "multi";

/**
* CSS class representing the title for the 2-up calendar
* @property YAHOO.widget.CalendarGroup.CSS_2UPTITLE
* @static
* @final
* @type String
*/
YAHOO.widget.CalendarGroup.CSS_2UPTITLE = "title";

/**
* CSS class representing the close icon for the 2-up calendar
* @property YAHOO.widget.CalendarGroup.CSS_2UPCLOSE
* @static
* @final
* @type String
*/
YAHOO.widget.CalendarGroup.CSS_2UPCLOSE = "close-icon";

YAHOO.augment(YAHOO.widget.CalendarGroup, YAHOO.widget.Calendar, "buildDayLabel",
																 "buildMonthLabel",
																 "renderOutOfBoundsDate",
																 "renderRowHeader",
																 "renderRowFooter",
																 "renderCellDefault",
																 "styleCellDefault",
																 "renderCellStyleHighlight1",
																 "renderCellStyleHighlight2",
																 "renderCellStyleHighlight3",
																 "renderCellStyleHighlight4",
																 "renderCellStyleToday",
																 "renderCellStyleSelected",
																 "renderCellNotThisMonth",
																 "renderBodyCellRestricted",
																 "initStyles",
																 "configTitle",
																 "configClose",
																 "hide",
																 "show",
																 "browser");

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	A string representation of the CalendarGroup object.
*/
YAHOO.widget.CalendarGroup.prototype.toString = function() {
	return "CalendarGroup " + this.id;
};

YAHOO.widget.CalGrp = YAHOO.widget.CalendarGroup;

/**
* @class YAHOO.widget.Calendar2up
* @extends YAHOO.widget.CalendarGroup
* @deprecated The old Calendar2up class is no longer necessary, since CalendarGroup renders in a 2up view by default.
*/
YAHOO.widget.Calendar2up = function(id, containerId, config) {
	this.init(id, containerId, config);
};

YAHOO.extend(YAHOO.widget.Calendar2up, YAHOO.widget.CalendarGroup);

/**
* @deprecated The old Calendar2up class is no longer necessary, since CalendarGroup renders in a 2up view by default.
*/
YAHOO.widget.Cal2up = YAHOO.widget.Calendar2up;

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 0.12.2
*/
(function() {

var Event=YAHOO.util.Event; 
var Dom=YAHOO.util.Dom;

/**
 * Defines the interface and base operation of items that that can be 
 * dragged or can be drop targets.  It was designed to be extended, overriding
 * the event handlers for startDrag, onDrag, onDragOver, onDragOut.
 * Up to three html elements can be associated with a DragDrop instance:
 * <ul>
 * <li>linked element: the element that is passed into the constructor.
 * This is the element which defines the boundaries for interaction with 
 * other DragDrop objects.</li>
 * <li>handle element(s): The drag operation only occurs if the element that 
 * was clicked matches a handle element.  By default this is the linked 
 * element, but there are times that you will want only a portion of the 
 * linked element to initiate the drag operation, and the setHandleElId() 
 * method provides a way to define this.</li>
 * <li>drag element: this represents an the element that would be moved along
 * with the cursor during a drag operation.  By default, this is the linked
 * element itself as in {@link YAHOO.util.DD}.  setDragElId() lets you define
 * a separate element that would be moved, as in {@link YAHOO.util.DDProxy}
 * </li>
 * </ul>
 * This class should not be instantiated until the onload event to ensure that
 * the associated elements are available.
 * The following would define a DragDrop obj that would interact with any 
 * other DragDrop obj in the "group1" group:
 * <pre>
 *  dd = new YAHOO.util.DragDrop("div1", "group1");
 * </pre>
 * Since none of the event handlers have been implemented, nothing would 
 * actually happen if you were to run the code above.  Normally you would 
 * override this class or one of the default implementations, but you can 
 * also override the methods you want on an instance of the class...
 * <pre>
 *  dd.onDragDrop = function(e, id) {
 *  &nbsp;&nbsp;alert("dd was dropped on " + id);
 *  }
 * </pre>
 * @namespace YAHOO.util
 * @class DragDrop
 * @constructor
 * @param {String} id of the element that is linked to this instance
 * @param {String} sGroup the group of related DragDrop objects
 * @param {object} config an object containing configurable attributes
 *                Valid properties for DragDrop: 
 *                    padding, isTarget, maintainOffset, primaryButtonOnly,
 */
YAHOO.util.DragDrop = function(id, sGroup, config) {
    if (id) {
        this.init(id, sGroup, config); 
    }
};

YAHOO.util.DragDrop.prototype = {

    /**
     * The id of the element associated with this object.  This is what we 
     * refer to as the "linked element" because the size and position of 
     * this element is used to determine when the drag and drop objects have 
     * interacted.
     * @property id
     * @type String
     */
    id: null,

    /**
     * Configuration attributes passed into the constructor
     * @property config
     * @type object
     */
    config: null,

    /**
     * The id of the element that will be dragged.  By default this is same 
     * as the linked element , but could be changed to another element. Ex: 
     * YAHOO.util.DDProxy
     * @property dragElId
     * @type String
     * @private
     */
    dragElId: null, 

    /**
     * the id of the element that initiates the drag operation.  By default 
     * this is the linked element, but could be changed to be a child of this
     * element.  This lets us do things like only starting the drag when the 
     * header element within the linked html element is clicked.
     * @property handleElId
     * @type String
     * @private
     */
    handleElId: null, 

    /**
     * An associative array of HTML tags that will be ignored if clicked.
     * @property invalidHandleTypes
     * @type {string: string}
     */
    invalidHandleTypes: null, 

    /**
     * An associative array of ids for elements that will be ignored if clicked
     * @property invalidHandleIds
     * @type {string: string}
     */
    invalidHandleIds: null, 

    /**
     * An indexted array of css class names for elements that will be ignored
     * if clicked.
     * @property invalidHandleClasses
     * @type string[]
     */
    invalidHandleClasses: null, 

    /**
     * The linked element's absolute X position at the time the drag was 
     * started
     * @property startPageX
     * @type int
     * @private
     */
    startPageX: 0,

    /**
     * The linked element's absolute X position at the time the drag was 
     * started
     * @property startPageY
     * @type int
     * @private
     */
    startPageY: 0,

    /**
     * The group defines a logical collection of DragDrop objects that are 
     * related.  Instances only get events when interacting with other 
     * DragDrop object in the same group.  This lets us define multiple 
     * groups using a single DragDrop subclass if we want.
     * @property groups
     * @type {string: string}
     */
    groups: null,

    /**
     * Individual drag/drop instances can be locked.  This will prevent 
     * onmousedown start drag.
     * @property locked
     * @type boolean
     * @private
     */
    locked: false,

    /**
     * Lock this instance
     * @method lock
     */
    lock: function() { this.locked = true; },

    /**
     * Unlock this instace
     * @method unlock
     */
    unlock: function() { this.locked = false; },

    /**
     * By default, all insances can be a drop target.  This can be disabled by
     * setting isTarget to false.
     * @method isTarget
     * @type boolean
     */
    isTarget: true,

    /**
     * The padding configured for this drag and drop object for calculating
     * the drop zone intersection with this object.
     * @method padding
     * @type int[]
     */
    padding: null,

    /**
     * Cached reference to the linked element
     * @property _domRef
     * @private
     */
    _domRef: null,

    /**
     * Internal typeof flag
     * @property __ygDragDrop
     * @private
     */
    __ygDragDrop: true,

    /**
     * Set to true when horizontal contraints are applied
     * @property constrainX
     * @type boolean
     * @private
     */
    constrainX: false,

    /**
     * Set to true when vertical contraints are applied
     * @property constrainY
     * @type boolean
     * @private
     */
    constrainY: false,

    /**
     * The left constraint
     * @property minX
     * @type int
     * @private
     */
    minX: 0,

    /**
     * The right constraint
     * @property maxX
     * @type int
     * @private
     */
    maxX: 0,

    /**
     * The up constraint 
     * @property minY
     * @type int
     * @type int
     * @private
     */
    minY: 0,

    /**
     * The down constraint 
     * @property maxY
     * @type int
     * @private
     */
    maxY: 0,

    /**
     * Maintain offsets when we resetconstraints.  Set to true when you want
     * the position of the element relative to its parent to stay the same
     * when the page changes
     *
     * @property maintainOffset
     * @type boolean
     */
    maintainOffset: false,

    /**
     * Array of pixel locations the element will snap to if we specified a 
     * horizontal graduation/interval.  This array is generated automatically
     * when you define a tick interval.
     * @property xTicks
     * @type int[]
     */
    xTicks: null,

    /**
     * Array of pixel locations the element will snap to if we specified a 
     * vertical graduation/interval.  This array is generated automatically 
     * when you define a tick interval.
     * @property yTicks
     * @type int[]
     */
    yTicks: null,

    /**
     * By default the drag and drop instance will only respond to the primary
     * button click (left button for a right-handed mouse).  Set to true to
     * allow drag and drop to start with any mouse click that is propogated
     * by the browser
     * @property primaryButtonOnly
     * @type boolean
     */
    primaryButtonOnly: true,

    /**
     * The availabe property is false until the linked dom element is accessible.
     * @property available
     * @type boolean
     */
    available: false,

    /**
     * By default, drags can only be initiated if the mousedown occurs in the
     * region the linked element is.  This is done in part to work around a
     * bug in some browsers that mis-report the mousedown if the previous
     * mouseup happened outside of the window.  This property is set to true
     * if outer handles are defined.
     *
     * @property hasOuterHandles
     * @type boolean
     * @default false
     */
    hasOuterHandles: false,

    /**
     * Code that executes immediately before the startDrag event
     * @method b4StartDrag
     * @private
     */
    b4StartDrag: function(x, y) { },

    /**
     * Abstract method called after a drag/drop object is clicked
     * and the drag or mousedown time thresholds have beeen met.
     * @method startDrag
     * @param {int} X click location
     * @param {int} Y click location
     */
    startDrag: function(x, y) { /* override this */ },

    /**
     * Code that executes immediately before the onDrag event
     * @method b4Drag
     * @private
     */
    b4Drag: function(e) { },

    /**
     * Abstract method called during the onMouseMove event while dragging an 
     * object.
     * @method onDrag
     * @param {Event} e the mousemove event
     */
    onDrag: function(e) { /* override this */ },

    /**
     * Abstract method called when this element fist begins hovering over 
     * another DragDrop obj
     * @method onDragEnter
     * @param {Event} e the mousemove event
     * @param {String|DragDrop[]} id In POINT mode, the element
     * id this is hovering over.  In INTERSECT mode, an array of one or more 
     * dragdrop items being hovered over.
     */
    onDragEnter: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragOver event
     * @method b4DragOver
     * @private
     */
    b4DragOver: function(e) { },

    /**
     * Abstract method called when this element is hovering over another 
     * DragDrop obj
     * @method onDragOver
     * @param {Event} e the mousemove event
     * @param {String|DragDrop[]} id In POINT mode, the element
     * id this is hovering over.  In INTERSECT mode, an array of dd items 
     * being hovered over.
     */
    onDragOver: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragOut event
     * @method b4DragOut
     * @private
     */
    b4DragOut: function(e) { },

    /**
     * Abstract method called when we are no longer hovering over an element
     * @method onDragOut
     * @param {Event} e the mousemove event
     * @param {String|DragDrop[]} id In POINT mode, the element
     * id this was hovering over.  In INTERSECT mode, an array of dd items 
     * that the mouse is no longer over.
     */
    onDragOut: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragDrop event
     * @method b4DragDrop
     * @private
     */
    b4DragDrop: function(e) { },

    /**
     * Abstract method called when this item is dropped on another DragDrop 
     * obj
     * @method onDragDrop
     * @param {Event} e the mouseup event
     * @param {String|DragDrop[]} id In POINT mode, the element
     * id this was dropped on.  In INTERSECT mode, an array of dd items this 
     * was dropped on.
     */
    onDragDrop: function(e, id) { /* override this */ },

    /**
     * Abstract method called when this item is dropped on an area with no
     * drop target
     * @method onInvalidDrop
     * @param {Event} e the mouseup event
     */
    onInvalidDrop: function(e) { /* override this */ },

    /**
     * Code that executes immediately before the endDrag event
     * @method b4EndDrag
     * @private
     */
    b4EndDrag: function(e) { },

    /**
     * Fired when we are done dragging the object
     * @method endDrag
     * @param {Event} e the mouseup event
     */
    endDrag: function(e) { /* override this */ },

    /**
     * Code executed immediately before the onMouseDown event
     * @method b4MouseDown
     * @param {Event} e the mousedown event
     * @private
     */
    b4MouseDown: function(e) {  },

    /**
     * Event handler that fires when a drag/drop obj gets a mousedown
     * @method onMouseDown
     * @param {Event} e the mousedown event
     */
    onMouseDown: function(e) { /* override this */ },

    /**
     * Event handler that fires when a drag/drop obj gets a mouseup
     * @method onMouseUp
     * @param {Event} e the mouseup event
     */
    onMouseUp: function(e) { /* override this */ },
   
    /**
     * Override the onAvailable method to do what is needed after the initial
     * position was determined.
     * @method onAvailable
     */
    onAvailable: function () { 
    },

    /**
     * Returns a reference to the linked element
     * @method getEl
     * @return {HTMLElement} the html element 
     */
    getEl: function() { 
        if (!this._domRef) {
            this._domRef = Dom.get(this.id); 
        }

        return this._domRef;
    },

    /**
     * Returns a reference to the actual element to drag.  By default this is
     * the same as the html element, but it can be assigned to another 
     * element. An example of this can be found in YAHOO.util.DDProxy
     * @method getDragEl
     * @return {HTMLElement} the html element 
     */
    getDragEl: function() {
        return Dom.get(this.dragElId);
    },

    /**
     * Sets up the DragDrop object.  Must be called in the constructor of any
     * YAHOO.util.DragDrop subclass
     * @method init
     * @param id the id of the linked element
     * @param {String} sGroup the group of related items
     * @param {object} config configuration attributes
     */
    init: function(id, sGroup, config) {
        this.initTarget(id, sGroup, config);
        Event.on(this.id, "mousedown", this.handleMouseDown, this, true);
        // Event.on(this.id, "selectstart", Event.preventDefault);
    },

    /**
     * Initializes Targeting functionality only... the object does not
     * get a mousedown handler.
     * @method initTarget
     * @param id the id of the linked element
     * @param {String} sGroup the group of related items
     * @param {object} config configuration attributes
     */
    initTarget: function(id, sGroup, config) {

        // configuration attributes 
        this.config = config || {};

        // create a local reference to the drag and drop manager
        this.DDM = YAHOO.util.DDM;
        // initialize the groups array
        this.groups = {};

        // assume that we have an element reference instead of an id if the
        // parameter is not a string
        if (typeof id !== "string") {
            YAHOO.log("id is not a string, assuming it is an HTMLElement");
            id = Dom.generateId(id);
        }

        // set the id
        this.id = id;

        // add to an interaction group
        this.addToGroup((sGroup) ? sGroup : "default");

        // We don't want to register this as the handle with the manager
        // so we just set the id rather than calling the setter.
        this.handleElId = id;

        Event.onAvailable(id, this.handleOnAvailable, this, true);


        // the linked element is the element that gets dragged by default
        this.setDragElId(id); 

        // by default, clicked anchors will not start drag operations. 
        // @TODO what else should be here?  Probably form fields.
        this.invalidHandleTypes = { A: "A" };
        this.invalidHandleIds = {};
        this.invalidHandleClasses = [];

        this.applyConfig();
    },

    /**
     * Applies the configuration parameters that were passed into the constructor.
     * This is supposed to happen at each level through the inheritance chain.  So
     * a DDProxy implentation will execute apply config on DDProxy, DD, and 
     * DragDrop in order to get all of the parameters that are available in
     * each object.
     * @method applyConfig
     */
    applyConfig: function() {

        // configurable properties: 
        //    padding, isTarget, maintainOffset, primaryButtonOnly
        this.padding           = this.config.padding || [0, 0, 0, 0];
        this.isTarget          = (this.config.isTarget !== false);
        this.maintainOffset    = (this.config.maintainOffset);
        this.primaryButtonOnly = (this.config.primaryButtonOnly !== false);

    },

    /**
     * Executed when the linked element is available
     * @method handleOnAvailable
     * @private
     */
    handleOnAvailable: function() {
        this.available = true;
        this.resetConstraints();
        this.onAvailable();
    },

     /**
     * Configures the padding for the target zone in px.  Effectively expands
     * (or reduces) the virtual object size for targeting calculations.  
     * Supports css-style shorthand; if only one parameter is passed, all sides
     * will have that padding, and if only two are passed, the top and bottom
     * will have the first param, the left and right the second.
     * @method setPadding
     * @param {int} iTop    Top pad
     * @param {int} iRight  Right pad
     * @param {int} iBot    Bot pad
     * @param {int} iLeft   Left pad
     */
    setPadding: function(iTop, iRight, iBot, iLeft) {
        // this.padding = [iLeft, iRight, iTop, iBot];
        if (!iRight && 0 !== iRight) {
            this.padding = [iTop, iTop, iTop, iTop];
        } else if (!iBot && 0 !== iBot) {
            this.padding = [iTop, iRight, iTop, iRight];
        } else {
            this.padding = [iTop, iRight, iBot, iLeft];
        }
    },

    /**
     * Stores the initial placement of the linked element.
     * @method setInitialPosition
     * @param {int} diffX   the X offset, default 0
     * @param {int} diffY   the Y offset, default 0
     */
    setInitPosition: function(diffX, diffY) {
        var el = this.getEl();

        if (!this.DDM.verifyEl(el)) {
            return;
        }

        var dx = diffX || 0;
        var dy = diffY || 0;

        var p = Dom.getXY( el );

        this.initPageX = p[0] - dx;
        this.initPageY = p[1] - dy;

        this.lastPageX = p[0];
        this.lastPageY = p[1];


        this.setStartPosition(p);
    },

    /**
     * Sets the start position of the element.  This is set when the obj
     * is initialized, the reset when a drag is started.
     * @method setStartPosition
     * @param pos current position (from previous lookup)
     * @private
     */
    setStartPosition: function(pos) {
        var p = pos || Dom.getXY( this.getEl() );

        this.deltaSetXY = null;

        this.startPageX = p[0];
        this.startPageY = p[1];
    },

    /**
     * Add this instance to a group of related drag/drop objects.  All 
     * instances belong to at least one group, and can belong to as many 
     * groups as needed.
     * @method addToGroup
     * @param sGroup {string} the name of the group
     */
    addToGroup: function(sGroup) {
        this.groups[sGroup] = true;
        this.DDM.regDragDrop(this, sGroup);
    },

    /**
     * Remove's this instance from the supplied interaction group
     * @method removeFromGroup
     * @param {string}  sGroup  The group to drop
     */
    removeFromGroup: function(sGroup) {
        if (this.groups[sGroup]) {
            delete this.groups[sGroup];
        }

        this.DDM.removeDDFromGroup(this, sGroup);
    },

    /**
     * Allows you to specify that an element other than the linked element 
     * will be moved with the cursor during a drag
     * @method setDragElId
     * @param id {string} the id of the element that will be used to initiate the drag
     */
    setDragElId: function(id) {
        this.dragElId = id;
    },

    /**
     * Allows you to specify a child of the linked element that should be 
     * used to initiate the drag operation.  An example of this would be if 
     * you have a content div with text and links.  Clicking anywhere in the 
     * content area would normally start the drag operation.  Use this method
     * to specify that an element inside of the content div is the element 
     * that starts the drag operation.
     * @method setHandleElId
     * @param id {string} the id of the element that will be used to 
     * initiate the drag.
     */
    setHandleElId: function(id) {
        if (typeof id !== "string") {
            YAHOO.log("id is not a string, assuming it is an HTMLElement");
            id = Dom.generateId(id);
        }
        this.handleElId = id;
        this.DDM.regHandle(this.id, id);
    },

    /**
     * Allows you to set an element outside of the linked element as a drag 
     * handle
     * @method setOuterHandleElId
     * @param id the id of the element that will be used to initiate the drag
     */
    setOuterHandleElId: function(id) {
        if (typeof id !== "string") {
            YAHOO.log("id is not a string, assuming it is an HTMLElement");
            id = Dom.generateId(id);
        }
        Event.on(id, "mousedown", 
                this.handleMouseDown, this, true);
        this.setHandleElId(id);

        this.hasOuterHandles = true;
    },

    /**
     * Remove all drag and drop hooks for this element
     * @method unreg
     */
    unreg: function() {
        Event.removeListener(this.id, "mousedown", 
                this.handleMouseDown);
        this._domRef = null;
        this.DDM._remove(this);
    },

    /**
     * Returns true if this instance is locked, or the drag drop mgr is locked
     * (meaning that all drag/drop is disabled on the page.)
     * @method isLocked
     * @return {boolean} true if this obj or all drag/drop is locked, else 
     * false
     */
    isLocked: function() {
        return (this.DDM.isLocked() || this.locked);
    },

    /**
     * Fired when this object is clicked
     * @method handleMouseDown
     * @param {Event} e 
     * @param {YAHOO.util.DragDrop} oDD the clicked dd object (this dd obj)
     * @private
     */
    handleMouseDown: function(e, oDD) {

        var button = e.which || e.button;

        if (this.primaryButtonOnly && button > 1) {
            return;
        }

        if (this.isLocked()) {
            return;
        }

        this.DDM.refreshCache(this.groups);
        // var self = this;
        // setTimeout( function() { self.DDM.refreshCache(self.groups); }, 0);

        // Only process the event if we really clicked within the linked 
        // element.  The reason we make this check is that in the case that 
        // another element was moved between the clicked element and the 
        // cursor in the time between the mousedown and mouseup events. When 
        // this happens, the element gets the next mousedown event 
        // regardless of where on the screen it happened.  
        var pt = new YAHOO.util.Point(Event.getPageX(e), Event.getPageY(e));
        if (!this.hasOuterHandles && !this.DDM.isOverTarget(pt, this) )  {
        } else {
            if (this.clickValidator(e)) {


                // set the initial element position
                this.setStartPosition();


                this.b4MouseDown(e);
                this.onMouseDown(e);
                this.DDM.handleMouseDown(e, this);

                this.DDM.stopEvent(e);
            } else {


            }
        }
    },

    clickValidator: function(e) {
        var target = Event.getTarget(e);
        return ( this.isValidHandleChild(target) &&
                    (this.id == this.handleElId || 
                        this.DDM.handleWasClicked(target, this.id)) );
    },

    /**
     * Allows you to specify a tag name that should not start a drag operation
     * when clicked.  This is designed to facilitate embedding links within a
     * drag handle that do something other than start the drag.
     * @method addInvalidHandleType
     * @param {string} tagName the type of element to exclude
     */
    addInvalidHandleType: function(tagName) {
        var type = tagName.toUpperCase();
        this.invalidHandleTypes[type] = type;
    },

    /**
     * Lets you to specify an element id for a child of a drag handle
     * that should not initiate a drag
     * @method addInvalidHandleId
     * @param {string} id the element id of the element you wish to ignore
     */
    addInvalidHandleId: function(id) {
        if (typeof id !== "string") {
            YAHOO.log("id is not a string, assuming it is an HTMLElement");
            id = Dom.generateId(id);
        }
        this.invalidHandleIds[id] = id;
    },

    /**
     * Lets you specify a css class of elements that will not initiate a drag
     * @method addInvalidHandleClass
     * @param {string} cssClass the class of the elements you wish to ignore
     */
    addInvalidHandleClass: function(cssClass) {
        this.invalidHandleClasses.push(cssClass);
    },

    /**
     * Unsets an excluded tag name set by addInvalidHandleType
     * @method removeInvalidHandleType
     * @param {string} tagName the type of element to unexclude
     */
    removeInvalidHandleType: function(tagName) {
        var type = tagName.toUpperCase();
        // this.invalidHandleTypes[type] = null;
        delete this.invalidHandleTypes[type];
    },
    
    /**
     * Unsets an invalid handle id
     * @method removeInvalidHandleId
     * @param {string} id the id of the element to re-enable
     */
    removeInvalidHandleId: function(id) {
        if (typeof id !== "string") {
            YAHOO.log("id is not a string, assuming it is an HTMLElement");
            id = Dom.generateId(id);
        }
        delete this.invalidHandleIds[id];
    },

    /**
     * Unsets an invalid css class
     * @method removeInvalidHandleClass
     * @param {string} cssClass the class of the element(s) you wish to 
     * re-enable
     */
    removeInvalidHandleClass: function(cssClass) {
        for (var i=0, len=this.invalidHandleClasses.length; i<len; ++i) {
            if (this.invalidHandleClasses[i] == cssClass) {
                delete this.invalidHandleClasses[i];
            }
        }
    },

    /**
     * Checks the tag exclusion list to see if this click should be ignored
     * @method isValidHandleChild
     * @param {HTMLElement} node the HTMLElement to evaluate
     * @return {boolean} true if this is a valid tag type, false if not
     */
    isValidHandleChild: function(node) {

        var valid = true;
        // var n = (node.nodeName == "#text") ? node.parentNode : node;
        var nodeName;
        try {
            nodeName = node.nodeName.toUpperCase();
        } catch(e) {
            nodeName = node.nodeName;
        }
        valid = valid && !this.invalidHandleTypes[nodeName];
        valid = valid && !this.invalidHandleIds[node.id];

        for (var i=0, len=this.invalidHandleClasses.length; valid && i<len; ++i) {
            valid = !Dom.hasClass(node, this.invalidHandleClasses[i]);
        }


        return valid;

    },

    /**
     * Create the array of horizontal tick marks if an interval was specified
     * in setXConstraint().
     * @method setXTicks
     * @private
     */
    setXTicks: function(iStartX, iTickSize) {
        this.xTicks = [];
        this.xTickSize = iTickSize;
        
        var tickMap = {};

        for (var i = this.initPageX; i >= this.minX; i = i - iTickSize) {
            if (!tickMap[i]) {
                this.xTicks[this.xTicks.length] = i;
                tickMap[i] = true;
            }
        }

        for (i = this.initPageX; i <= this.maxX; i = i + iTickSize) {
            if (!tickMap[i]) {
                this.xTicks[this.xTicks.length] = i;
                tickMap[i] = true;
            }
        }

        this.xTicks.sort(this.DDM.numericSort) ;
    },

    /**
     * Create the array of vertical tick marks if an interval was specified in 
     * setYConstraint().
     * @method setYTicks
     * @private
     */
    setYTicks: function(iStartY, iTickSize) {
        this.yTicks = [];
        this.yTickSize = iTickSize;

        var tickMap = {};

        for (var i = this.initPageY; i >= this.minY; i = i - iTickSize) {
            if (!tickMap[i]) {
                this.yTicks[this.yTicks.length] = i;
                tickMap[i] = true;
            }
        }

        for (i = this.initPageY; i <= this.maxY; i = i + iTickSize) {
            if (!tickMap[i]) {
                this.yTicks[this.yTicks.length] = i;
                tickMap[i] = true;
            }
        }

        this.yTicks.sort(this.DDM.numericSort) ;
    },

    /**
     * By default, the element can be dragged any place on the screen.  Use 
     * this method to limit the horizontal travel of the element.  Pass in 
     * 0,0 for the parameters if you want to lock the drag to the y axis.
     * @method setXConstraint
     * @param {int} iLeft the number of pixels the element can move to the left
     * @param {int} iRight the number of pixels the element can move to the 
     * right
     * @param {int} iTickSize optional parameter for specifying that the 
     * element
     * should move iTickSize pixels at a time.
     */
    setXConstraint: function(iLeft, iRight, iTickSize) {
        this.leftConstraint = iLeft;
        this.rightConstraint = iRight;

        this.minX = this.initPageX - iLeft;
        this.maxX = this.initPageX + iRight;
        if (iTickSize) { this.setXTicks(this.initPageX, iTickSize); }

        this.constrainX = true;
    },

    /**
     * Clears any constraints applied to this instance.  Also clears ticks
     * since they can't exist independent of a constraint at this time.
     * @method clearConstraints
     */
    clearConstraints: function() {
        this.constrainX = false;
        this.constrainY = false;
        this.clearTicks();
    },

    /**
     * Clears any tick interval defined for this instance
     * @method clearTicks
     */
    clearTicks: function() {
        this.xTicks = null;
        this.yTicks = null;
        this.xTickSize = 0;
        this.yTickSize = 0;
    },

    /**
     * By default, the element can be dragged any place on the screen.  Set 
     * this to limit the vertical travel of the element.  Pass in 0,0 for the
     * parameters if you want to lock the drag to the x axis.
     * @method setYConstraint
     * @param {int} iUp the number of pixels the element can move up
     * @param {int} iDown the number of pixels the element can move down
     * @param {int} iTickSize optional parameter for specifying that the 
     * element should move iTickSize pixels at a time.
     */
    setYConstraint: function(iUp, iDown, iTickSize) {
        this.topConstraint = iUp;
        this.bottomConstraint = iDown;


        this.minY = this.initPageY - iUp;
        this.maxY = this.initPageY + iDown;
        if (iTickSize) { this.setYTicks(this.initPageY, iTickSize); }

        this.constrainY = true;
        
    },

    /**
     * resetConstraints must be called if you manually reposition a dd element.
     * @method resetConstraints
     * @param {boolean} maintainOffset
     */
    resetConstraints: function() {


        // Maintain offsets if necessary
        if (this.initPageX || this.initPageX === 0) {
            // figure out how much this thing has moved
            var dx = (this.maintainOffset) ? this.lastPageX - this.initPageX : 0;
            var dy = (this.maintainOffset) ? this.lastPageY - this.initPageY : 0;

            this.setInitPosition(dx, dy);

        // This is the first time we have detected the element's position
        } else {
            this.setInitPosition();
        }

        if (this.constrainX) {
            this.setXConstraint( this.leftConstraint, 
                                 this.rightConstraint, 
                                 this.xTickSize        );
        }

        if (this.constrainY) {
            this.setYConstraint( this.topConstraint, 
                                 this.bottomConstraint, 
                                 this.yTickSize         );
        }
    },

    /**
     * Normally the drag element is moved pixel by pixel, but we can specify 
     * that it move a number of pixels at a time.  This method resolves the 
     * location when we have it set up like this.
     * @method getTick
     * @param {int} val where we want to place the object
     * @param {int[]} tickArray sorted array of valid points
     * @return {int} the closest tick
     * @private
     */
    getTick: function(val, tickArray) {

        if (!tickArray) {
            // If tick interval is not defined, it is effectively 1 pixel, 
            // so we return the value passed to us.
            return val; 
        } else if (tickArray[0] >= val) {
            // The value is lower than the first tick, so we return the first
            // tick.
            return tickArray[0];
        } else {
            for (var i=0, len=tickArray.length; i<len; ++i) {
                var next = i + 1;
                if (tickArray[next] && tickArray[next] >= val) {
                    var diff1 = val - tickArray[i];
                    var diff2 = tickArray[next] - val;
                    return (diff2 > diff1) ? tickArray[i] : tickArray[next];
                }
            }

            // The value is larger than the last tick, so we return the last
            // tick.
            return tickArray[tickArray.length - 1];
        }
    },

    /**
     * toString method
     * @method toString
     * @return {string} string representation of the dd obj
     */
    toString: function() {
        return ("DragDrop " + this.id);
    }

};

})();
/**
 * The drag and drop utility provides a framework for building drag and drop
 * applications.  In addition to enabling drag and drop for specific elements,
 * the drag and drop elements are tracked by the manager class, and the
 * interactions between the various elements are tracked during the drag and
 * the implementing code is notified about these important moments.
 * @module dragdrop
 * @title Drag and Drop
 * @requires yahoo,dom,event
 * @namespace YAHOO.util
 */

// Only load the library once.  Rewriting the manager class would orphan 
// existing drag and drop instances.
if (!YAHOO.util.DragDropMgr) {

/**
 * DragDropMgr is a singleton that tracks the element interaction for 
 * all DragDrop items in the window.  Generally, you will not call 
 * this class directly, but it does have helper methods that could 
 * be useful in your DragDrop implementations.
 * @class DragDropMgr
 * @static
 */
YAHOO.util.DragDropMgr = function() {

    var Event = YAHOO.util.Event;

    return {

        /**
         * Two dimensional Array of registered DragDrop objects.  The first 
         * dimension is the DragDrop item group, the second the DragDrop 
         * object.
         * @property ids
         * @type {string: string}
         * @private
         * @static
         */
        ids: {},

        /**
         * Array of element ids defined as drag handles.  Used to determine 
         * if the element that generated the mousedown event is actually the 
         * handle and not the html element itself.
         * @property handleIds
         * @type {string: string}
         * @private
         * @static
         */
        handleIds: {},

        /**
         * the DragDrop object that is currently being dragged
         * @property dragCurrent
         * @type DragDrop
         * @private
         * @static
         **/
        dragCurrent: null,

        /**
         * the DragDrop object(s) that are being hovered over
         * @property dragOvers
         * @type Array
         * @private
         * @static
         */
        dragOvers: {},

        /**
         * the X distance between the cursor and the object being dragged
         * @property deltaX
         * @type int
         * @private
         * @static
         */
        deltaX: 0,

        /**
         * the Y distance between the cursor and the object being dragged
         * @property deltaY
         * @type int
         * @private
         * @static
         */
        deltaY: 0,

        /**
         * Flag to determine if we should prevent the default behavior of the
         * events we define. By default this is true, but this can be set to 
         * false if you need the default behavior (not recommended)
         * @property preventDefault
         * @type boolean
         * @static
         */
        preventDefault: true,

        /**
         * Flag to determine if we should stop the propagation of the events 
         * we generate. This is true by default but you may want to set it to
         * false if the html element contains other features that require the
         * mouse click.
         * @property stopPropagation
         * @type boolean
         * @static
         */
        stopPropagation: true,

        /**
         * Internal flag that is set to true when drag and drop has been
         * intialized
         * @property initialized
         * @private
         * @static
         */
        initalized: false,

        /**
         * All drag and drop can be disabled.
         * @property locked
         * @private
         * @static
         */
        locked: false,

        /**
         * Called the first time an element is registered.
         * @method init
         * @private
         * @static
         */
        init: function() {
            this.initialized = true;
        },

        /**
         * In point mode, drag and drop interaction is defined by the 
         * location of the cursor during the drag/drop
         * @property POINT
         * @type int
         * @static
         * @final
         */
        POINT: 0,

        /**
         * In intersect mode, drag and drop interaction is defined by the 
         * cursor position or the amount of overlap of two or more drag and 
         * drop objects.
         * @property INTERSECT
         * @type int
         * @static
         * @final
         */
        INTERSECT: 1,

        /**
         * In intersect mode, drag and drop interaction is defined only by the 
         * overlap of two or more drag and drop objects.
         * @property STRICT_INTERSECT
         * @type int
         * @static
         * @final
         */
        STRICT_INTERSECT: 2,

        /**
         * The current drag and drop mode.  Default: POINT
         * @property mode
         * @type int
         * @static
         */
        mode: 0,

        /**
         * Runs method on all drag and drop objects
         * @method _execOnAll
         * @private
         * @static
         */
        _execOnAll: function(sMethod, args) {
            for (var i in this.ids) {
                for (var j in this.ids[i]) {
                    var oDD = this.ids[i][j];
                    if (! this.isTypeOfDD(oDD)) {
                        continue;
                    }
                    oDD[sMethod].apply(oDD, args);
                }
            }
        },

        /**
         * Drag and drop initialization.  Sets up the global event handlers
         * @method _onLoad
         * @private
         * @static
         */
        _onLoad: function() {

            this.init();


            Event.on(document, "mouseup",   this.handleMouseUp, this, true);
            Event.on(document, "mousemove", this.handleMouseMove, this, true);
            Event.on(window,   "unload",    this._onUnload, this, true);
            Event.on(window,   "resize",    this._onResize, this, true);
            // Event.on(window,   "mouseout",    this._test);

        },

        /**
         * Reset constraints on all drag and drop objs
         * @method _onResize
         * @private
         * @static
         */
        _onResize: function(e) {
            this._execOnAll("resetConstraints", []);
        },

        /**
         * Lock all drag and drop functionality
         * @method lock
         * @static
         */
        lock: function() { this.locked = true; },

        /**
         * Unlock all drag and drop functionality
         * @method unlock
         * @static
         */
        unlock: function() { this.locked = false; },

        /**
         * Is drag and drop locked?
         * @method isLocked
         * @return {boolean} True if drag and drop is locked, false otherwise.
         * @static
         */
        isLocked: function() { return this.locked; },

        /**
         * Location cache that is set for all drag drop objects when a drag is
         * initiated, cleared when the drag is finished.
         * @property locationCache
         * @private
         * @static
         */
        locationCache: {},

        /**
         * Set useCache to false if you want to force object the lookup of each
         * drag and drop linked element constantly during a drag.
         * @property useCache
         * @type boolean
         * @static
         */
        useCache: true,

        /**
         * The number of pixels that the mouse needs to move after the 
         * mousedown before the drag is initiated.  Default=3;
         * @property clickPixelThresh
         * @type int
         * @static
         */
        clickPixelThresh: 3,

        /**
         * The number of milliseconds after the mousedown event to initiate the
         * drag if we don't get a mouseup event. Default=1000
         * @property clickTimeThresh
         * @type int
         * @static
         */
        clickTimeThresh: 1000,

        /**
         * Flag that indicates that either the drag pixel threshold or the 
         * mousdown time threshold has been met
         * @property dragThreshMet
         * @type boolean
         * @private
         * @static
         */
        dragThreshMet: false,

        /**
         * Timeout used for the click time threshold
         * @property clickTimeout
         * @type Object
         * @private
         * @static
         */
        clickTimeout: null,

        /**
         * The X position of the mousedown event stored for later use when a 
         * drag threshold is met.
         * @property startX
         * @type int
         * @private
         * @static
         */
        startX: 0,

        /**
         * The Y position of the mousedown event stored for later use when a 
         * drag threshold is met.
         * @property startY
         * @type int
         * @private
         * @static
         */
        startY: 0,

        /**
         * Each DragDrop instance must be registered with the DragDropMgr.  
         * This is executed in DragDrop.init()
         * @method regDragDrop
         * @param {DragDrop} oDD the DragDrop object to register
         * @param {String} sGroup the name of the group this element belongs to
         * @static
         */
        regDragDrop: function(oDD, sGroup) {
            if (!this.initialized) { this.init(); }
            
            if (!this.ids[sGroup]) {
                this.ids[sGroup] = {};
            }
            this.ids[sGroup][oDD.id] = oDD;
        },

        /**
         * Removes the supplied dd instance from the supplied group. Executed
         * by DragDrop.removeFromGroup, so don't call this function directly.
         * @method removeDDFromGroup
         * @private
         * @static
         */
        removeDDFromGroup: function(oDD, sGroup) {
            if (!this.ids[sGroup]) {
                this.ids[sGroup] = {};
            }

            var obj = this.ids[sGroup];
            if (obj && obj[oDD.id]) {
                delete obj[oDD.id];
            }
        },

        /**
         * Unregisters a drag and drop item.  This is executed in 
         * DragDrop.unreg, use that method instead of calling this directly.
         * @method _remove
         * @private
         * @static
         */
        _remove: function(oDD) {
            for (var g in oDD.groups) {
                if (g && this.ids[g][oDD.id]) {
                    delete this.ids[g][oDD.id];
                }
            }
            delete this.handleIds[oDD.id];
        },

        /**
         * Each DragDrop handle element must be registered.  This is done
         * automatically when executing DragDrop.setHandleElId()
         * @method regHandle
         * @param {String} sDDId the DragDrop id this element is a handle for
         * @param {String} sHandleId the id of the element that is the drag 
         * handle
         * @static
         */
        regHandle: function(sDDId, sHandleId) {
            if (!this.handleIds[sDDId]) {
                this.handleIds[sDDId] = {};
            }
            this.handleIds[sDDId][sHandleId] = sHandleId;
        },

        /**
         * Utility function to determine if a given element has been 
         * registered as a drag drop item.
         * @method isDragDrop
         * @param {String} id the element id to check
         * @return {boolean} true if this element is a DragDrop item, 
         * false otherwise
         * @static
         */
        isDragDrop: function(id) {
            return ( this.getDDById(id) ) ? true : false;
        },

        /**
         * Returns the drag and drop instances that are in all groups the
         * passed in instance belongs to.
         * @method getRelated
         * @param {DragDrop} p_oDD the obj to get related data for
         * @param {boolean} bTargetsOnly if true, only return targetable objs
         * @return {DragDrop[]} the related instances
         * @static
         */
        getRelated: function(p_oDD, bTargetsOnly) {
            var oDDs = [];
            for (var i in p_oDD.groups) {
                for (j in this.ids[i]) {
                    var dd = this.ids[i][j];
                    if (! this.isTypeOfDD(dd)) {
                        continue;
                    }
                    if (!bTargetsOnly || dd.isTarget) {
                        oDDs[oDDs.length] = dd;
                    }
                }
            }

            return oDDs;
        },

        /**
         * Returns true if the specified dd target is a legal target for 
         * the specifice drag obj
         * @method isLegalTarget
         * @param {DragDrop} the drag obj
         * @param {DragDrop} the target
         * @return {boolean} true if the target is a legal target for the 
         * dd obj
         * @static
         */
        isLegalTarget: function (oDD, oTargetDD) {
            var targets = this.getRelated(oDD, true);
            for (var i=0, len=targets.length;i<len;++i) {
                if (targets[i].id == oTargetDD.id) {
                    return true;
                }
            }

            return false;
        },

        /**
         * My goal is to be able to transparently determine if an object is
         * typeof DragDrop, and the exact subclass of DragDrop.  typeof 
         * returns "object", oDD.constructor.toString() always returns
         * "DragDrop" and not the name of the subclass.  So for now it just
         * evaluates a well-known variable in DragDrop.
         * @method isTypeOfDD
         * @param {Object} the object to evaluate
         * @return {boolean} true if typeof oDD = DragDrop
         * @static
         */
        isTypeOfDD: function (oDD) {
            return (oDD && oDD.__ygDragDrop);
        },

        /**
         * Utility function to determine if a given element has been 
         * registered as a drag drop handle for the given Drag Drop object.
         * @method isHandle
         * @param {String} id the element id to check
         * @return {boolean} true if this element is a DragDrop handle, false 
         * otherwise
         * @static
         */
        isHandle: function(sDDId, sHandleId) {
            return ( this.handleIds[sDDId] && 
                            this.handleIds[sDDId][sHandleId] );
        },

        /**
         * Returns the DragDrop instance for a given id
         * @method getDDById
         * @param {String} id the id of the DragDrop object
         * @return {DragDrop} the drag drop object, null if it is not found
         * @static
         */
        getDDById: function(id) {
            for (var i in this.ids) {
                if (this.ids[i][id]) {
                    return this.ids[i][id];
                }
            }
            return null;
        },

        /**
         * Fired after a registered DragDrop object gets the mousedown event.
         * Sets up the events required to track the object being dragged
         * @method handleMouseDown
         * @param {Event} e the event
         * @param oDD the DragDrop object being dragged
         * @private
         * @static
         */
        handleMouseDown: function(e, oDD) {

            this.currentTarget = YAHOO.util.Event.getTarget(e);

            this.dragCurrent = oDD;

            var el = oDD.getEl();

            // track start position
            this.startX = YAHOO.util.Event.getPageX(e);
            this.startY = YAHOO.util.Event.getPageY(e);

            this.deltaX = this.startX - el.offsetLeft;
            this.deltaY = this.startY - el.offsetTop;

            this.dragThreshMet = false;

            this.clickTimeout = setTimeout( 
                    function() { 
                        var DDM = YAHOO.util.DDM;
                        DDM.startDrag(DDM.startX, DDM.startY); 
                    }, 
                    this.clickTimeThresh );
        },

        /**
         * Fired when either the drag pixel threshol or the mousedown hold 
         * time threshold has been met.
         * @method startDrag
         * @param x {int} the X position of the original mousedown
         * @param y {int} the Y position of the original mousedown
         * @static
         */
        startDrag: function(x, y) {
            clearTimeout(this.clickTimeout);
            if (this.dragCurrent) {
                this.dragCurrent.b4StartDrag(x, y);
                this.dragCurrent.startDrag(x, y);
            }
            this.dragThreshMet = true;
        },

        /**
         * Internal function to handle the mouseup event.  Will be invoked 
         * from the context of the document.
         * @method handleMouseUp
         * @param {Event} e the event
         * @private
         * @static
         */
        handleMouseUp: function(e) {

            if (! this.dragCurrent) {
                return;
            }

            clearTimeout(this.clickTimeout);

            if (this.dragThreshMet) {
                this.fireEvents(e, true);
            } else {
            }

            this.stopDrag(e);

            this.stopEvent(e);
        },

        /**
         * Utility to stop event propagation and event default, if these 
         * features are turned on.
         * @method stopEvent
         * @param {Event} e the event as returned by this.getEvent()
         * @static
         */
        stopEvent: function(e) {
            if (this.stopPropagation) {
                YAHOO.util.Event.stopPropagation(e);
            }

            if (this.preventDefault) {
                YAHOO.util.Event.preventDefault(e);
            }
        },

        /** 
         * Internal function to clean up event handlers after the drag 
         * operation is complete
         * @method stopDrag
         * @param {Event} e the event
         * @private
         * @static
         */
        stopDrag: function(e) {

            // Fire the drag end event for the item that was dragged
            if (this.dragCurrent) {
                if (this.dragThreshMet) {
                    this.dragCurrent.b4EndDrag(e);
                    this.dragCurrent.endDrag(e);
                }

                this.dragCurrent.onMouseUp(e);
            }

            this.dragCurrent = null;
            this.dragOvers = {};
        },

        /** 
         * Internal function to handle the mousemove event.  Will be invoked 
         * from the context of the html element.
         *
         * @TODO figure out what we can do about mouse events lost when the 
         * user drags objects beyond the window boundary.  Currently we can 
         * detect this in internet explorer by verifying that the mouse is 
         * down during the mousemove event.  Firefox doesn't give us the 
         * button state on the mousemove event.
         * @method handleMouseMove
         * @param {Event} e the event
         * @private
         * @static
         */
        handleMouseMove: function(e) {
            if (! this.dragCurrent) {
                return true;
            }

            // var button = e.which || e.button;

            // check for IE mouseup outside of page boundary
            if (YAHOO.util.Event.isIE && !e.button) {
                this.stopEvent(e);
                return this.handleMouseUp(e);
            }

            if (!this.dragThreshMet) {
                var diffX = Math.abs(this.startX - YAHOO.util.Event.getPageX(e));
                var diffY = Math.abs(this.startY - YAHOO.util.Event.getPageY(e));
                if (diffX > this.clickPixelThresh || 
                            diffY > this.clickPixelThresh) {
                    this.startDrag(this.startX, this.startY);
                }
            }

            if (this.dragThreshMet) {
                this.dragCurrent.b4Drag(e);
                this.dragCurrent.onDrag(e);
                this.fireEvents(e, false);
            }

            this.stopEvent(e);

            return true;
        },

        /**
         * Iterates over all of the DragDrop elements to find ones we are 
         * hovering over or dropping on
         * @method fireEvents
         * @param {Event} e the event
         * @param {boolean} isDrop is this a drop op or a mouseover op?
         * @private
         * @static
         */
        fireEvents: function(e, isDrop) {
            var dc = this.dragCurrent;

            // If the user did the mouse up outside of the window, we could 
            // get here even though we have ended the drag.
            if (!dc || dc.isLocked()) {
                return;
            }

            var x = YAHOO.util.Event.getPageX(e);
            var y = YAHOO.util.Event.getPageY(e);
            var pt = new YAHOO.util.Point(x,y);

            // cache the previous dragOver array
            var oldOvers = [];

            var outEvts   = [];
            var overEvts  = [];
            var dropEvts  = [];
            var enterEvts = [];

            // Check to see if the object(s) we were hovering over is no longer 
            // being hovered over so we can fire the onDragOut event
            for (var i in this.dragOvers) {

                var ddo = this.dragOvers[i];

                if (! this.isTypeOfDD(ddo)) {
                    continue;
                }

                if (! this.isOverTarget(pt, ddo, this.mode)) {
                    outEvts.push( ddo );
                }

                oldOvers[i] = true;
                delete this.dragOvers[i];
            }

            for (var sGroup in dc.groups) {
                
                if ("string" != typeof sGroup) {
                    continue;
                }

                for (i in this.ids[sGroup]) {
                    var oDD = this.ids[sGroup][i];
                    if (! this.isTypeOfDD(oDD)) {
                        continue;
                    }

                    if (oDD.isTarget && !oDD.isLocked() && oDD != dc) {
                        if (this.isOverTarget(pt, oDD, this.mode)) {
                            // look for drop interactions
                            if (isDrop) {
                                dropEvts.push( oDD );
                            // look for drag enter and drag over interactions
                            } else {

                                // initial drag over: dragEnter fires
                                if (!oldOvers[oDD.id]) {
                                    enterEvts.push( oDD );
                                // subsequent drag overs: dragOver fires
                                } else {
                                    overEvts.push( oDD );
                                }

                                this.dragOvers[oDD.id] = oDD;
                            }
                        }
                    }
                }
            }

            if (this.mode) {
                if (outEvts.length) {
                    dc.b4DragOut(e, outEvts);
                    dc.onDragOut(e, outEvts);
                }

                if (enterEvts.length) {
                    dc.onDragEnter(e, enterEvts);
                }

                if (overEvts.length) {
                    dc.b4DragOver(e, overEvts);
                    dc.onDragOver(e, overEvts);
                }

                if (dropEvts.length) {
                    dc.b4DragDrop(e, dropEvts);
                    dc.onDragDrop(e, dropEvts);
                }

            } else {
                // fire dragout events
                var len = 0;
                for (i=0, len=outEvts.length; i<len; ++i) {
                    dc.b4DragOut(e, outEvts[i].id);
                    dc.onDragOut(e, outEvts[i].id);
                }
                 
                // fire enter events
                for (i=0,len=enterEvts.length; i<len; ++i) {
                    // dc.b4DragEnter(e, oDD.id);
                    dc.onDragEnter(e, enterEvts[i].id);
                }
         
                // fire over events
                for (i=0,len=overEvts.length; i<len; ++i) {
                    dc.b4DragOver(e, overEvts[i].id);
                    dc.onDragOver(e, overEvts[i].id);
                }

                // fire drop events
                for (i=0, len=dropEvts.length; i<len; ++i) {
                    dc.b4DragDrop(e, dropEvts[i].id);
                    dc.onDragDrop(e, dropEvts[i].id);
                }

            }

            // notify about a drop that did not find a target
            if (isDrop && !dropEvts.length) {
                dc.onInvalidDrop(e);
            }

        },

        /**
         * Helper function for getting the best match from the list of drag 
         * and drop objects returned by the drag and drop events when we are 
         * in INTERSECT mode.  It returns either the first object that the 
         * cursor is over, or the object that has the greatest overlap with 
         * the dragged element.
         * @method getBestMatch
         * @param  {DragDrop[]} dds The array of drag and drop objects 
         * targeted
         * @return {DragDrop}       The best single match
         * @static
         */
        getBestMatch: function(dds) {
            var winner = null;

            var len = dds.length;

            if (len == 1) {
                winner = dds[0];
            } else {
                // Loop through the targeted items
                for (var i=0; i<len; ++i) {
                    var dd = dds[i];
                    // If the cursor is over the object, it wins.  If the 
                    // cursor is over multiple matches, the first one we come
                    // to wins.
                    if (this.mode == this.INTERSECT && dd.cursorIsOver) {
                        winner = dd;
                        break;
                    // Otherwise the object with the most overlap wins
                    } else {
                        if (!winner || !winner.overlap || (dd.overlap &&
                            winner.overlap.getArea() < dd.overlap.getArea())) {
                            winner = dd;
                        }
                    }
                }
            }

            return winner;
        },

        /**
         * Refreshes the cache of the top-left and bottom-right points of the 
         * drag and drop objects in the specified group(s).  This is in the
         * format that is stored in the drag and drop instance, so typical 
         * usage is:
         * <code>
         * YAHOO.util.DragDropMgr.refreshCache(ddinstance.groups);
         * </code>
         * Alternatively:
         * <code>
         * YAHOO.util.DragDropMgr.refreshCache({group1:true, group2:true});
         * </code>
         * @TODO this really should be an indexed array.  Alternatively this
         * method could accept both.
         * @method refreshCache
         * @param {Object} groups an associative array of groups to refresh
         * @static
         */
        refreshCache: function(groups) {
            for (var sGroup in groups) {
                if ("string" != typeof sGroup) {
                    continue;
                }
                for (var i in this.ids[sGroup]) {
                    var oDD = this.ids[sGroup][i];

                    if (this.isTypeOfDD(oDD)) {
                    // if (this.isTypeOfDD(oDD) && oDD.isTarget) {
                        var loc = this.getLocation(oDD);
                        if (loc) {
                            this.locationCache[oDD.id] = loc;
                        } else {
                            delete this.locationCache[oDD.id];
                            // this will unregister the drag and drop object if
                            // the element is not in a usable state
                            // oDD.unreg();
                        }
                    }
                }
            }
        },

        /**
         * This checks to make sure an element exists and is in the DOM.  The
         * main purpose is to handle cases where innerHTML is used to remove
         * drag and drop objects from the DOM.  IE provides an 'unspecified
         * error' when trying to access the offsetParent of such an element
         * @method verifyEl
         * @param {HTMLElement} el the element to check
         * @return {boolean} true if the element looks usable
         * @static
         */
        verifyEl: function(el) {
            try {
                if (el) {
                    var parent = el.offsetParent;
                    if (parent) {
                        return true;
                    }
                }
            } catch(e) {
            }

            return false;
        },
        
        /**
         * Returns a Region object containing the drag and drop element's position
         * and size, including the padding configured for it
         * @method getLocation
         * @param {DragDrop} oDD the drag and drop object to get the 
         *                       location for
         * @return {YAHOO.util.Region} a Region object representing the total area
         *                             the element occupies, including any padding
         *                             the instance is configured for.
         * @static
         */
        getLocation: function(oDD) {
            if (! this.isTypeOfDD(oDD)) {
                return null;
            }

            var el = oDD.getEl(), pos, x1, x2, y1, y2, t, r, b, l;

            try {
                pos= YAHOO.util.Dom.getXY(el);
            } catch (e) { }

            if (!pos) {
                return null;
            }

            x1 = pos[0];
            x2 = x1 + el.offsetWidth;
            y1 = pos[1];
            y2 = y1 + el.offsetHeight;

            t = y1 - oDD.padding[0];
            r = x2 + oDD.padding[1];
            b = y2 + oDD.padding[2];
            l = x1 - oDD.padding[3];

            return new YAHOO.util.Region( t, r, b, l );
        },

        /**
         * Checks the cursor location to see if it over the target
         * @method isOverTarget
         * @param {YAHOO.util.Point} pt The point to evaluate
         * @param {DragDrop} oTarget the DragDrop object we are inspecting
         * @return {boolean} true if the mouse is over the target
         * @private
         * @static
         */
        isOverTarget: function(pt, oTarget, intersect) {
            // use cache if available
            var loc = this.locationCache[oTarget.id];
            if (!loc || !this.useCache) {
                loc = this.getLocation(oTarget);
                this.locationCache[oTarget.id] = loc;

            }

            if (!loc) {
                return false;
            }

            oTarget.cursorIsOver = loc.contains( pt );

            // DragDrop is using this as a sanity check for the initial mousedown
            // in this case we are done.  In POINT mode, if the drag obj has no
            // contraints, we are also done. Otherwise we need to evaluate the 
            // location of the target as related to the actual location of the
            // dragged element.
            var dc = this.dragCurrent;
            if (!dc || !dc.getTargetCoord || 
                    (!intersect && !dc.constrainX && !dc.constrainY)) {
                return oTarget.cursorIsOver;
            }

            oTarget.overlap = null;

            // Get the current location of the drag element, this is the
            // location of the mouse event less the delta that represents
            // where the original mousedown happened on the element.  We
            // need to consider constraints and ticks as well.
            var pos = dc.getTargetCoord(pt.x, pt.y);

            var el = dc.getDragEl();
            var curRegion = new YAHOO.util.Region( pos.y, 
                                                   pos.x + el.offsetWidth,
                                                   pos.y + el.offsetHeight, 
                                                   pos.x );

            var overlap = curRegion.intersect(loc);

            if (overlap) {
                oTarget.overlap = overlap;
                return (intersect) ? true : oTarget.cursorIsOver;
            } else {
                return false;
            }
        },

        /**
         * unload event handler
         * @method _onUnload
         * @private
         * @static
         */
        _onUnload: function(e, me) {
            this.unregAll();
        },

        /**
         * Cleans up the drag and drop events and objects.
         * @method unregAll
         * @private
         * @static
         */
        unregAll: function() {

            if (this.dragCurrent) {
                this.stopDrag();
                this.dragCurrent = null;
            }

            this._execOnAll("unreg", []);

            for (i in this.elementCache) {
                delete this.elementCache[i];
            }

            this.elementCache = {};
            this.ids = {};
        },

        /**
         * A cache of DOM elements
         * @property elementCache
         * @private
         * @static
         */
        elementCache: {},
        
        /**
         * Get the wrapper for the DOM element specified
         * @method getElWrapper
         * @param {String} id the id of the element to get
         * @return {YAHOO.util.DDM.ElementWrapper} the wrapped element
         * @private
         * @deprecated This wrapper isn't that useful
         * @static
         */
        getElWrapper: function(id) {
            var oWrapper = this.elementCache[id];
            if (!oWrapper || !oWrapper.el) {
                oWrapper = this.elementCache[id] = 
                    new this.ElementWrapper(YAHOO.util.Dom.get(id));
            }
            return oWrapper;
        },

        /**
         * Returns the actual DOM element
         * @method getElement
         * @param {String} id the id of the elment to get
         * @return {Object} The element
         * @deprecated use YAHOO.util.Dom.get instead
         * @static
         */
        getElement: function(id) {
            return YAHOO.util.Dom.get(id);
        },
        
        /**
         * Returns the style property for the DOM element (i.e., 
         * document.getElById(id).style)
         * @method getCss
         * @param {String} id the id of the elment to get
         * @return {Object} The style property of the element
         * @deprecated use YAHOO.util.Dom instead
         * @static
         */
        getCss: function(id) {
            var el = YAHOO.util.Dom.get(id);
            return (el) ? el.style : null;
        },

        /**
         * Inner class for cached elements
         * @class DragDropMgr.ElementWrapper
         * @for DragDropMgr
         * @private
         * @deprecated
         */
        ElementWrapper: function(el) {
                /**
                 * The element
                 * @property el
                 */
                this.el = el || null;
                /**
                 * The element id
                 * @property id
                 */
                this.id = this.el && el.id;
                /**
                 * A reference to the style property
                 * @property css
                 */
                this.css = this.el && el.style;
            },

        /**
         * Returns the X position of an html element
         * @method getPosX
         * @param el the element for which to get the position
         * @return {int} the X coordinate
         * @for DragDropMgr
         * @deprecated use YAHOO.util.Dom.getX instead
         * @static
         */
        getPosX: function(el) {
            return YAHOO.util.Dom.getX(el);
        },

        /**
         * Returns the Y position of an html element
         * @method getPosY
         * @param el the element for which to get the position
         * @return {int} the Y coordinate
         * @deprecated use YAHOO.util.Dom.getY instead
         * @static
         */
        getPosY: function(el) {
            return YAHOO.util.Dom.getY(el); 
        },

        /**
         * Swap two nodes.  In IE, we use the native method, for others we 
         * emulate the IE behavior
         * @method swapNode
         * @param n1 the first node to swap
         * @param n2 the other node to swap
         * @static
         */
        swapNode: function(n1, n2) {
            if (n1.swapNode) {
                n1.swapNode(n2);
            } else {
                var p = n2.parentNode;
                var s = n2.nextSibling;

                if (s == n1) {
                    p.insertBefore(n1, n2);
                } else if (n2 == n1.nextSibling) {
                    p.insertBefore(n2, n1);
                } else {
                    n1.parentNode.replaceChild(n2, n1);
                    p.insertBefore(n1, s);
                }
            }
        },

        /**
         * Returns the current scroll position
         * @method getScroll
         * @private
         * @static
         */
        getScroll: function () {
            var t, l, dde=document.documentElement, db=document.body;
            if (dde && (dde.scrollTop || dde.scrollLeft)) {
                t = dde.scrollTop;
                l = dde.scrollLeft;
            } else if (db) {
                t = db.scrollTop;
                l = db.scrollLeft;
            } else {
                YAHOO.log("could not get scroll property");
            }
            return { top: t, left: l };
        },

        /**
         * Returns the specified element style property
         * @method getStyle
         * @param {HTMLElement} el          the element
         * @param {string}      styleProp   the style property
         * @return {string} The value of the style property
         * @deprecated use YAHOO.util.Dom.getStyle
         * @static
         */
        getStyle: function(el, styleProp) {
            return YAHOO.util.Dom.getStyle(el, styleProp);
        },

        /**
         * Gets the scrollTop
         * @method getScrollTop
         * @return {int} the document's scrollTop
         * @static
         */
        getScrollTop: function () { return this.getScroll().top; },

        /**
         * Gets the scrollLeft
         * @method getScrollLeft
         * @return {int} the document's scrollTop
         * @static
         */
        getScrollLeft: function () { return this.getScroll().left; },

        /**
         * Sets the x/y position of an element to the location of the
         * target element.
         * @method moveToEl
         * @param {HTMLElement} moveEl      The element to move
         * @param {HTMLElement} targetEl    The position reference element
         * @static
         */
        moveToEl: function (moveEl, targetEl) {
            var aCoord = YAHOO.util.Dom.getXY(targetEl);
            YAHOO.util.Dom.setXY(moveEl, aCoord);
        },

        /**
         * Gets the client height
         * @method getClientHeight
         * @return {int} client height in px
         * @deprecated use YAHOO.util.Dom.getViewportHeight instead
         * @static
         */
        getClientHeight: function() {
            return YAHOO.util.Dom.getViewportHeight();
        },

        /**
         * Gets the client width
         * @method getClientWidth
         * @return {int} client width in px
         * @deprecated use YAHOO.util.Dom.getViewportWidth instead
         * @static
         */
        getClientWidth: function() {
            return YAHOO.util.Dom.getViewportWidth();
        },

        /**
         * Numeric array sort function
         * @method numericSort
         * @static
         */
        numericSort: function(a, b) { return (a - b); },

        /**
         * Internal counter
         * @property _timeoutCount
         * @private
         * @static
         */
        _timeoutCount: 0,

        /**
         * Trying to make the load order less important.  Without this we get
         * an error if this file is loaded before the Event Utility.
         * @method _addListeners
         * @private
         * @static
         */
        _addListeners: function() {
            var DDM = YAHOO.util.DDM;
            if ( YAHOO.util.Event && document ) {
                DDM._onLoad();
            } else {
                if (DDM._timeoutCount > 2000) {
                } else {
                    setTimeout(DDM._addListeners, 10);
                    if (document && document.body) {
                        DDM._timeoutCount += 1;
                    }
                }
            }
        },

        /**
         * Recursively searches the immediate parent and all child nodes for 
         * the handle element in order to determine wheter or not it was 
         * clicked.
         * @method handleWasClicked
         * @param node the html element to inspect
         * @static
         */
        handleWasClicked: function(node, id) {
            if (this.isHandle(id, node.id)) {
                return true;
            } else {
                // check to see if this is a text node child of the one we want
                var p = node.parentNode;

                while (p) {
                    if (this.isHandle(id, p.id)) {
                        return true;
                    } else {
                        p = p.parentNode;
                    }
                }
            }

            return false;
        }

    };

}();

// shorter alias, save a few bytes
YAHOO.util.DDM = YAHOO.util.DragDropMgr;
YAHOO.util.DDM._addListeners();

}

/**
 * A DragDrop implementation where the linked element follows the 
 * mouse cursor during a drag.
 * @class DD
 * @extends YAHOO.util.DragDrop
 * @constructor
 * @param {String} id the id of the linked element 
 * @param {String} sGroup the group of related DragDrop items
 * @param {object} config an object containing configurable attributes
 *                Valid properties for DD: 
 *                    scroll
 */
YAHOO.util.DD = function(id, sGroup, config) {
    if (id) {
        this.init(id, sGroup, config);
    }
};

YAHOO.extend(YAHOO.util.DD, YAHOO.util.DragDrop, {

    /**
     * When set to true, the utility automatically tries to scroll the browser
     * window wehn a drag and drop element is dragged near the viewport boundary.
     * Defaults to true.
     * @property scroll
     * @type boolean
     */
    scroll: true, 

    /**
     * Sets the pointer offset to the distance between the linked element's top 
     * left corner and the location the element was clicked
     * @method autoOffset
     * @param {int} iPageX the X coordinate of the click
     * @param {int} iPageY the Y coordinate of the click
     */
    autoOffset: function(iPageX, iPageY) {
        var x = iPageX - this.startPageX;
        var y = iPageY - this.startPageY;
        this.setDelta(x, y);
    },

    /** 
     * Sets the pointer offset.  You can call this directly to force the 
     * offset to be in a particular location (e.g., pass in 0,0 to set it 
     * to the center of the object, as done in YAHOO.widget.Slider)
     * @method setDelta
     * @param {int} iDeltaX the distance from the left
     * @param {int} iDeltaY the distance from the top
     */
    setDelta: function(iDeltaX, iDeltaY) {
        this.deltaX = iDeltaX;
        this.deltaY = iDeltaY;
    },

    /**
     * Sets the drag element to the location of the mousedown or click event, 
     * maintaining the cursor location relative to the location on the element 
     * that was clicked.  Override this if you want to place the element in a 
     * location other than where the cursor is.
     * @method setDragElPos
     * @param {int} iPageX the X coordinate of the mousedown or drag event
     * @param {int} iPageY the Y coordinate of the mousedown or drag event
     */
    setDragElPos: function(iPageX, iPageY) {
        // the first time we do this, we are going to check to make sure
        // the element has css positioning

        var el = this.getDragEl();
        this.alignElWithMouse(el, iPageX, iPageY);
    },

    /**
     * Sets the element to the location of the mousedown or click event, 
     * maintaining the cursor location relative to the location on the element 
     * that was clicked.  Override this if you want to place the element in a 
     * location other than where the cursor is.
     * @method alignElWithMouse
     * @param {HTMLElement} el the element to move
     * @param {int} iPageX the X coordinate of the mousedown or drag event
     * @param {int} iPageY the Y coordinate of the mousedown or drag event
     */
    alignElWithMouse: function(el, iPageX, iPageY) {
        var oCoord = this.getTargetCoord(iPageX, iPageY);

        if (!this.deltaSetXY) {
            var aCoord = [oCoord.x, oCoord.y];
            YAHOO.util.Dom.setXY(el, aCoord);
            var newLeft = parseInt( YAHOO.util.Dom.getStyle(el, "left"), 10 );
            var newTop  = parseInt( YAHOO.util.Dom.getStyle(el, "top" ), 10 );

            this.deltaSetXY = [ newLeft - oCoord.x, newTop - oCoord.y ];
        } else {
            YAHOO.util.Dom.setStyle(el, "left", (oCoord.x + this.deltaSetXY[0]) + "px");
            YAHOO.util.Dom.setStyle(el, "top",  (oCoord.y + this.deltaSetXY[1]) + "px");
        }
        
        this.cachePosition(oCoord.x, oCoord.y);
        this.autoScroll(oCoord.x, oCoord.y, el.offsetHeight, el.offsetWidth);
    },

    /**
     * Saves the most recent position so that we can reset the constraints and
     * tick marks on-demand.  We need to know this so that we can calculate the
     * number of pixels the element is offset from its original position.
     * @method cachePosition
     * @param iPageX the current x position (optional, this just makes it so we
     * don't have to look it up again)
     * @param iPageY the current y position (optional, this just makes it so we
     * don't have to look it up again)
     */
    cachePosition: function(iPageX, iPageY) {
        if (iPageX) {
            this.lastPageX = iPageX;
            this.lastPageY = iPageY;
        } else {
            var aCoord = YAHOO.util.Dom.getXY(this.getEl());
            this.lastPageX = aCoord[0];
            this.lastPageY = aCoord[1];
        }
    },

    /**
     * Auto-scroll the window if the dragged object has been moved beyond the 
     * visible window boundary.
     * @method autoScroll
     * @param {int} x the drag element's x position
     * @param {int} y the drag element's y position
     * @param {int} h the height of the drag element
     * @param {int} w the width of the drag element
     * @private
     */
    autoScroll: function(x, y, h, w) {

        if (this.scroll) {
            // The client height
            var clientH = this.DDM.getClientHeight();

            // The client width
            var clientW = this.DDM.getClientWidth();

            // The amt scrolled down
            var st = this.DDM.getScrollTop();

            // The amt scrolled right
            var sl = this.DDM.getScrollLeft();

            // Location of the bottom of the element
            var bot = h + y;

            // Location of the right of the element
            var right = w + x;

            // The distance from the cursor to the bottom of the visible area, 
            // adjusted so that we don't scroll if the cursor is beyond the
            // element drag constraints
            var toBot = (clientH + st - y - this.deltaY);

            // The distance from the cursor to the right of the visible area
            var toRight = (clientW + sl - x - this.deltaX);


            // How close to the edge the cursor must be before we scroll
            // var thresh = (document.all) ? 100 : 40;
            var thresh = 40;

            // How many pixels to scroll per autoscroll op.  This helps to reduce 
            // clunky scrolling. IE is more sensitive about this ... it needs this 
            // value to be higher.
            var scrAmt = (document.all) ? 80 : 30;

            // Scroll down if we are near the bottom of the visible page and the 
            // obj extends below the crease
            if ( bot > clientH && toBot < thresh ) { 
                window.scrollTo(sl, st + scrAmt); 
            }

            // Scroll up if the window is scrolled down and the top of the object
            // goes above the top border
            if ( y < st && st > 0 && y - st < thresh ) { 
                window.scrollTo(sl, st - scrAmt); 
            }

            // Scroll right if the obj is beyond the right border and the cursor is
            // near the border.
            if ( right > clientW && toRight < thresh ) { 
                window.scrollTo(sl + scrAmt, st); 
            }

            // Scroll left if the window has been scrolled to the right and the obj
            // extends past the left border
            if ( x < sl && sl > 0 && x - sl < thresh ) { 
                window.scrollTo(sl - scrAmt, st);
            }
        }
    },

    /**
     * Finds the location the element should be placed if we want to move
     * it to where the mouse location less the click offset would place us.
     * @method getTargetCoord
     * @param {int} iPageX the X coordinate of the click
     * @param {int} iPageY the Y coordinate of the click
     * @return an object that contains the coordinates (Object.x and Object.y)
     * @private
     */
    getTargetCoord: function(iPageX, iPageY) {


        var x = iPageX - this.deltaX;
        var y = iPageY - this.deltaY;

        if (this.constrainX) {
            if (x < this.minX) { x = this.minX; }
            if (x > this.maxX) { x = this.maxX; }
        }

        if (this.constrainY) {
            if (y < this.minY) { y = this.minY; }
            if (y > this.maxY) { y = this.maxY; }
        }

        x = this.getTick(x, this.xTicks);
        y = this.getTick(y, this.yTicks);


        return {x:x, y:y};
    },

    /*
     * Sets up config options specific to this class. Overrides
     * YAHOO.util.DragDrop, but all versions of this method through the 
     * inheritance chain are called
     */
    applyConfig: function() {
        YAHOO.util.DD.superclass.applyConfig.call(this);
        this.scroll = (this.config.scroll !== false);
    },

    /*
     * Event that fires prior to the onMouseDown event.  Overrides 
     * YAHOO.util.DragDrop.
     */
    b4MouseDown: function(e) {
        // this.resetConstraints();
        this.autoOffset(YAHOO.util.Event.getPageX(e), 
                            YAHOO.util.Event.getPageY(e));
    },

    /*
     * Event that fires prior to the onDrag event.  Overrides 
     * YAHOO.util.DragDrop.
     */
    b4Drag: function(e) {
        this.setDragElPos(YAHOO.util.Event.getPageX(e), 
                            YAHOO.util.Event.getPageY(e));
    },

    toString: function() {
        return ("DD " + this.id);
    }

    //////////////////////////////////////////////////////////////////////////
    // Debugging ygDragDrop events that can be overridden
    //////////////////////////////////////////////////////////////////////////
    /*
    startDrag: function(x, y) {
    },

    onDrag: function(e) {
    },

    onDragEnter: function(e, id) {
    },

    onDragOver: function(e, id) {
    },

    onDragOut: function(e, id) {
    },

    onDragDrop: function(e, id) {
    },

    endDrag: function(e) {
    }

    */

});
/**
 * A DragDrop implementation that inserts an empty, bordered div into
 * the document that follows the cursor during drag operations.  At the time of
 * the click, the frame div is resized to the dimensions of the linked html
 * element, and moved to the exact location of the linked element.
 *
 * References to the "frame" element refer to the single proxy element that
 * was created to be dragged in place of all DDProxy elements on the
 * page.
 *
 * @class DDProxy
 * @extends YAHOO.util.DD
 * @constructor
 * @param {String} id the id of the linked html element
 * @param {String} sGroup the group of related DragDrop objects
 * @param {object} config an object containing configurable attributes
 *                Valid properties for DDProxy in addition to those in DragDrop: 
 *                   resizeFrame, centerFrame, dragElId
 */
YAHOO.util.DDProxy = function(id, sGroup, config) {
    if (id) {
        this.init(id, sGroup, config);
        this.initFrame(); 
    }
};

/**
 * The default drag frame div id
 * @property YAHOO.util.DDProxy.dragElId
 * @type String
 * @static
 */
YAHOO.util.DDProxy.dragElId = "ygddfdiv";

YAHOO.extend(YAHOO.util.DDProxy, YAHOO.util.DD, {

    /**
     * By default we resize the drag frame to be the same size as the element
     * we want to drag (this is to get the frame effect).  We can turn it off
     * if we want a different behavior.
     * @property resizeFrame
     * @type boolean
     */
    resizeFrame: true,

    /**
     * By default the frame is positioned exactly where the drag element is, so
     * we use the cursor offset provided by YAHOO.util.DD.  Another option that works only if
     * you do not have constraints on the obj is to have the drag frame centered
     * around the cursor.  Set centerFrame to true for this effect.
     * @property centerFrame
     * @type boolean
     */
    centerFrame: false,

    /**
     * Creates the proxy element if it does not yet exist
     * @method createFrame
     */
    createFrame: function() {
        var self = this;
        var body = document.body;

        if (!body || !body.firstChild) {
            setTimeout( function() { self.createFrame(); }, 50 );
            return;
        }

        var div = this.getDragEl();

        if (!div) {
            div    = document.createElement("div");
            div.id = this.dragElId;
            var s  = div.style;

            s.position   = "absolute";
            s.visibility = "hidden";
            s.cursor     = "move";
            s.border     = "2px solid #aaa";
            s.zIndex     = 999;

            // appendChild can blow up IE if invoked prior to the window load event
            // while rendering a table.  It is possible there are other scenarios 
            // that would cause this to happen as well.
            body.insertBefore(div, body.firstChild);
        }
    },

    /**
     * Initialization for the drag frame element.  Must be called in the
     * constructor of all subclasses
     * @method initFrame
     */
    initFrame: function() {
        this.createFrame();
    },

    applyConfig: function() {
        YAHOO.util.DDProxy.superclass.applyConfig.call(this);

        this.resizeFrame = (this.config.resizeFrame !== false);
        this.centerFrame = (this.config.centerFrame);
        this.setDragElId(this.config.dragElId || YAHOO.util.DDProxy.dragElId);
    },

    /**
     * Resizes the drag frame to the dimensions of the clicked object, positions 
     * it over the object, and finally displays it
     * @method showFrame
     * @param {int} iPageX X click position
     * @param {int} iPageY Y click position
     * @private
     */
    showFrame: function(iPageX, iPageY) {
        var el = this.getEl();
        var dragEl = this.getDragEl();
        var s = dragEl.style;

        this._resizeProxy();

        if (this.centerFrame) {
            this.setDelta( Math.round(parseInt(s.width,  10)/2), 
                           Math.round(parseInt(s.height, 10)/2) );
        }

        this.setDragElPos(iPageX, iPageY);

        YAHOO.util.Dom.setStyle(dragEl, "visibility", "visible"); 
    },

    /**
     * The proxy is automatically resized to the dimensions of the linked
     * element when a drag is initiated, unless resizeFrame is set to false
     * @method _resizeProxy
     * @private
     */
    _resizeProxy: function() {
        if (this.resizeFrame) {
            var DOM    = YAHOO.util.Dom;
            var el     = this.getEl();
            var dragEl = this.getDragEl();

            var bt = parseInt( DOM.getStyle(dragEl, "borderTopWidth"    ), 10);
            var br = parseInt( DOM.getStyle(dragEl, "borderRightWidth"  ), 10);
            var bb = parseInt( DOM.getStyle(dragEl, "borderBottomWidth" ), 10);
            var bl = parseInt( DOM.getStyle(dragEl, "borderLeftWidth"   ), 10);

            if (isNaN(bt)) { bt = 0; }
            if (isNaN(br)) { br = 0; }
            if (isNaN(bb)) { bb = 0; }
            if (isNaN(bl)) { bl = 0; }


            var newWidth  = Math.max(0, el.offsetWidth  - br - bl);                                                                                           
            var newHeight = Math.max(0, el.offsetHeight - bt - bb);


            DOM.setStyle( dragEl, "width",  newWidth  + "px" );
            DOM.setStyle( dragEl, "height", newHeight + "px" );
        }
    },

    // overrides YAHOO.util.DragDrop
    b4MouseDown: function(e) {
        var x = YAHOO.util.Event.getPageX(e);
        var y = YAHOO.util.Event.getPageY(e);
        this.autoOffset(x, y);
        this.setDragElPos(x, y);
    },

    // overrides YAHOO.util.DragDrop
    b4StartDrag: function(x, y) {
        // show the drag frame
        this.showFrame(x, y);
    },

    // overrides YAHOO.util.DragDrop
    b4EndDrag: function(e) {
        YAHOO.util.Dom.setStyle(this.getDragEl(), "visibility", "hidden"); 
    },

    // overrides YAHOO.util.DragDrop
    // By default we try to move the element to the last location of the frame.  
    // This is so that the default behavior mirrors that of YAHOO.util.DD.  
    endDrag: function(e) {
        var DOM = YAHOO.util.Dom;
        var lel = this.getEl();
        var del = this.getDragEl();

        // Show the drag frame briefly so we can get its position
        // del.style.visibility = "";
        DOM.setStyle(del, "visibility", ""); 

        // Hide the linked element before the move to get around a Safari 
        // rendering bug.
        //lel.style.visibility = "hidden";
        DOM.setStyle(lel, "visibility", "hidden"); 
        YAHOO.util.DDM.moveToEl(lel, del);
        //del.style.visibility = "hidden";
        DOM.setStyle(del, "visibility", "hidden"); 
        //lel.style.visibility = "";
        DOM.setStyle(lel, "visibility", ""); 
    },

    toString: function() {
        return ("DDProxy " + this.id);
    }

});
/**
 * A DragDrop implementation that does not move, but can be a drop 
 * target.  You would get the same result by simply omitting implementation 
 * for the event callbacks, but this way we reduce the processing cost of the 
 * event listener and the callbacks.
 * @class DDTarget
 * @extends YAHOO.util.DragDrop 
 * @constructor
 * @param {String} id the id of the element that is a drop target
 * @param {String} sGroup the group of related DragDrop objects
 * @param {object} config an object containing configurable attributes
 *                 Valid properties for DDTarget in addition to those in 
 *                 DragDrop: 
 *                    none
 */
YAHOO.util.DDTarget = function(id, sGroup, config) {
    if (id) {
        this.initTarget(id, sGroup, config);
    }
};

// YAHOO.util.DDTarget.prototype = new YAHOO.util.DragDrop();
YAHOO.extend(YAHOO.util.DDTarget, YAHOO.util.DragDrop, {
    toString: function() {
        return ("DDTarget " + this.id);
    }
});

/*
Copyright (c) 2006, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 0.12.2
*/
/**
 * The Slider component is a UI control that enables the user to adjust 
 * values in a finite range along one or two axes. Typically, the Slider 
 * control is used in a web application as a rich, visual replacement 
 * for an input box that takes a number as input. The Slider control can 
 * also easily accommodate a second dimension, providing x,y output for 
 * a selection point chosen from a rectangular region.
 *
 * @module    slider
 * @title     Slider Widget
 * @namespace YAHOO.widget
 * @requires  yahoo,dom,dragdrop,event
 * @optional  animation
 */

/**
 * A DragDrop implementation that can be used as a background for a
 * slider.  It takes a reference to the thumb instance 
 * so it can delegate some of the events to it.  The goal is to make the 
 * thumb jump to the location on the background when the background is 
 * clicked.  
 *
 * @class Slider
 * @extends YAHOO.util.DragDrop
 * @uses YAHOO.util.EventProvider
 * @constructor
 * @param {String}      id     The id of the element linked to this instance
 * @param {String}      sGroup The group of related DragDrop items
 * @param {SliderThumb} oThumb The thumb for this slider
 * @param {String}      sType  The type of slider (horiz, vert, region)
 */
YAHOO.widget.Slider = function(sElementId, sGroup, oThumb, sType) {
    if (sElementId) {
        this.init(sElementId, sGroup, true);
        this.initSlider(sType);
        this.initThumb(oThumb);
    }
};

/**
 * Factory method for creating a horizontal slider
 * @method YAHOO.widget.Slider.getHorizSlider
 * @static
 * @param {String} sBGElId the id of the slider's background element
 * @param {String} sHandleElId the id of the thumb element
 * @param {int} iLeft the number of pixels the element can move left
 * @param {int} iRight the number of pixels the element can move right
 * @param {int} iTickSize optional parameter for specifying that the element 
 * should move a certain number pixels at a time.
 * @return {Slider} a horizontal slider control
 */
YAHOO.widget.Slider.getHorizSlider = 
    function (sBGElId, sHandleElId, iLeft, iRight, iTickSize) {
        return new YAHOO.widget.Slider(sBGElId, sBGElId, 
            new YAHOO.widget.SliderThumb(sHandleElId, sBGElId, 
                               iLeft, iRight, 0, 0, iTickSize), "horiz");
};

/**
 * Factory method for creating a vertical slider
 * @method YAHOO.widget.Slider.getVertSlider
 * @static
 * @param {String} sBGElId the id of the slider's background element
 * @param {String} sHandleElId the id of the thumb element
 * @param {int} iUp the number of pixels the element can move up
 * @param {int} iDown the number of pixels the element can move down
 * @param {int} iTickSize optional parameter for specifying that the element 
 * should move a certain number pixels at a time.
 * @return {Slider} a vertical slider control
 */
YAHOO.widget.Slider.getVertSlider = 
    function (sBGElId, sHandleElId, iUp, iDown, iTickSize) {
        return new YAHOO.widget.Slider(sBGElId, sBGElId, 
            new YAHOO.widget.SliderThumb(sHandleElId, sBGElId, 0, 0, 
                               iUp, iDown, iTickSize), "vert");
};

/**
 * Factory method for creating a slider region like the one in the color
 * picker example
 * @method YAHOO.widget.Slider.getSliderRegion
 * @static
 * @param {String} sBGElId the id of the slider's background element
 * @param {String} sHandleElId the id of the thumb element
 * @param {int} iLeft the number of pixels the element can move left
 * @param {int} iRight the number of pixels the element can move right
 * @param {int} iUp the number of pixels the element can move up
 * @param {int} iDown the number of pixels the element can move down
 * @param {int} iTickSize optional parameter for specifying that the element 
 * should move a certain number pixels at a time.
 * @return {Slider} a slider region control
 */
YAHOO.widget.Slider.getSliderRegion = 
    function (sBGElId, sHandleElId, iLeft, iRight, iUp, iDown, iTickSize) {
        return new YAHOO.widget.Slider(sBGElId, sBGElId, 
            new YAHOO.widget.SliderThumb(sHandleElId, sBGElId, iLeft, iRight, 
                               iUp, iDown, iTickSize), "region");
};

/**
 * By default, animation is available if the animation library is detected.
 * @property YAHOO.widget.Slider.ANIM_AVAIL
 * @static
 * @type boolean
 */
YAHOO.widget.Slider.ANIM_AVAIL = true;

YAHOO.extend(YAHOO.widget.Slider, YAHOO.util.DragDrop, {

    /**
     * Initializes the slider.  Executed in the constructor
     * @method initSlider
     * @param {string} sType the type of slider (horiz, vert, region)
     */
    initSlider: function(sType) {

        /**
         * The type of the slider (horiz, vert, region)
         * @property type
         * @type string
         */
        this.type = sType;

        //this.removeInvalidHandleType("A");


        /**
         * Event the fires when the value of the control changes.  If 
         * the control is animated the event will fire every point
         * along the way.
         * @event change
         * @param {int} newOffset|x the new offset for normal sliders, or the new
         *                          x offset for region sliders
         * @param {int} y the number of pixels the thumb has moved on the y axis
         *                (region sliders only)
         */
        this.createEvent("change", this);

        /**
         * Event that fires at the beginning of a slider thumb move.
         * @event slideStart
         */
        this.createEvent("slideStart", this);

        /**
         * Event that fires at the end of a slider thumb move
         * @event slideEnd
         */
        this.createEvent("slideEnd", this);

        /**
         * Overrides the isTarget property in YAHOO.util.DragDrop
         * @property isTarget
         * @private
         */
        this.isTarget = false;
    
        /**
         * Flag that determines if the thumb will animate when moved
         * @property animate
         * @type boolean
         */
        this.animate = YAHOO.widget.Slider.ANIM_AVAIL;

        /**
         * Set to false to disable a background click thumb move
         * @property backgroundEnabled
         * @type boolean
         */
        this.backgroundEnabled = true;

        /**
         * Adjustment factor for tick animation, the more ticks, the
         * faster the animation (by default)
         * @property tickPause
         * @type int
         */
        this.tickPause = 40;

        /**
         * Enables the arrow, home and end keys, defaults to true.
         * @property enableKeys
         * @type boolean
         */
        this.enableKeys = true;

        /**
         * Specifies the number of pixels the arrow keys will move the slider.
         * Default is 25.
         * @property keyIncrement
         * @type int
         */
        this.keyIncrement = 20;

        /**
         * moveComplete is set to true when the slider has moved to its final
         * destination.  For animated slider, this value can be checked in 
         * the onChange handler to make it possible to execute logic only
         * when the move is complete rather than at all points along the way.
         *
         * @property moveComplete
         * @type Boolean
         */
        this.moveComplete = true;

        /**
         * If animation is configured, specifies the length of the animation
         * in seconds.
         * @property animationDuration
         * @type int
         * @default 0.2
         */
        this.animationDuration = 0.2;
    },

    /**
     * Initializes the slider's thumb. Executed in the constructor.
     * @method initThumb
     * @param {YAHOO.widget.SliderThumb} t the slider thumb
     */
    initThumb: function(t) {

        var self = this;

        /**
         * A YAHOO.widget.SliderThumb instance that we will use to 
         * reposition the thumb when the background is clicked
         * @property thumb
         * @type YAHOO.widget.SliderThumb
         */
        this.thumb = t;
        t.cacheBetweenDrags = true;

        // add handler for the handle onchange event
        t.onChange = function() { 
            self.handleThumbChange(); 
        };

        if (t._isHoriz && t.xTicks && t.xTicks.length) {
            this.tickPause = Math.round(360 / t.xTicks.length);
        } else if (t.yTicks && t.yTicks.length) {
            this.tickPause = Math.round(360 / t.yTicks.length);
        }


        // delegate thumb methods
        t.onMouseDown = function () { return self.focus(); };
        t.onMouseUp = function() { self.thumbMouseUp(); };
        t.onDrag = function() { self.fireEvents(true); };
        t.onAvailable = function() { return self.setStartSliderState(); };

    },

    /**
     * Executed when the slider element is available
     * @method onAvailable
     */
    onAvailable: function() {
        var Event = YAHOO.util.Event;
        Event.on(this.id, "keydown",  this.handleKeyDown,  this, true);
        Event.on(this.id, "keypress", this.handleKeyPress, this, true);
    },
 
    /**
     * Executed when a keypress event happens with the control focused.
     * Prevents the default behavior for navigation keys.  The actual
     * logic for moving the slider thumb in response to a key event
     * happens in handleKeyDown.
     * @param {Event} e the keypress event
     */
    handleKeyPress: function(e) {
        if (this.enableKeys) {
            var Event = YAHOO.util.Event;
            var kc = Event.getCharCode(e);
            switch (kc) {
                case 0x25: // left
                case 0x26: // up
                case 0x27: // right
                case 0x28: // down
                case 0x24: // home
                case 0x23: // end
                    Event.preventDefault(e);
                    break;
                default:
            }
        }
    },

    /**
     * Executed when a keydown event happens with the control focused.
     * Updates the slider value and display when the keypress is an
     * arrow key, home, or end as long as enableKeys is set to true.
     * @param {Event} e the keydown event
     */
    handleKeyDown: function(e) {
        if (this.enableKeys) {
            var Event = YAHOO.util.Event;

            var kc = Event.getCharCode(e), t=this.thumb;
            var h=this.getXValue(),v=this.getYValue();

            var horiz = false;
            var changeValue = true;
            switch (kc) {

                // left
                case 0x25: h -= this.keyIncrement; break;

                // up
                case 0x26: v -= this.keyIncrement; break;

                // right
                case 0x27: h += this.keyIncrement; break;

                // down
                case 0x28: v += this.keyIncrement; break;

                // home
                case 0x24: h = t.leftConstraint;    
                           v = t.topConstraint;    
                           break;

                // end
                case 0x23: h = t.rightConstraint; 
                           v = t.bottomConstraint;    
                           break;

                default:   changeValue = false;
            }

            if (changeValue) {
                if (t._isRegion) {
                    this.setRegionValue(h, v, true);
                } else {
                    var newVal = (t._isHoriz) ? h : v;
                    this.setValue(newVal, true);
                }
                Event.stopEvent(e);
            }

        }
    },

    /**
     * Initialization that sets up the value offsets once the elements are ready
     * @method setStartSliderState
     */
    setStartSliderState: function() {


        this.setThumbCenterPoint();

        /**
         * The basline position of the background element, used
         * to determine if the background has moved since the last
         * operation.
         * @property baselinePos
         * @type [int, int]
         */
        this.baselinePos = YAHOO.util.Dom.getXY(this.getEl());

        this.thumb.startOffset = this.thumb.getOffsetFromParent(this.baselinePos);

        if (this.thumb._isRegion) {
            if (this.deferredSetRegionValue) {
                this.setRegionValue.apply(this, this.deferredSetRegionValue, true);
                this.deferredSetRegionValue = null;
            } else {
                this.setRegionValue(0, 0, true, true);
            }
        } else {
            if (this.deferredSetValue) {
                this.setValue.apply(this, this.deferredSetValue, true);
                this.deferredSetValue = null;
            } else {
                this.setValue(0, true, true);
            }
        }
    },

    /**
     * When the thumb is available, we cache the centerpoint of the element so
     * we can position the element correctly when the background is clicked
     * @method setThumbCenterPoint
     */
    setThumbCenterPoint: function() {

        var el = this.thumb.getEl();

        if (el) {
            /**
             * The center of the slider element is stored so we can 
             * place it in the correct position when the background is clicked.
             * @property thumbCenterPoint
             * @type {"x": int, "y": int}
             */
            this.thumbCenterPoint = { 
                    x: parseInt(el.offsetWidth/2, 10), 
                    y: parseInt(el.offsetHeight/2, 10) 
            };
        }

    },

    /**
     * Locks the slider, overrides YAHOO.util.DragDrop
     * @method lock
     */
    lock: function() {
        this.thumb.lock();
        this.locked = true;
    },

    /**
     * Unlocks the slider, overrides YAHOO.util.DragDrop
     * @method unlock
     */
    unlock: function() {
        this.thumb.unlock();
        this.locked = false;
    },

    /**
     * Handles mouseup event on the slider background
     * @method thumbMouseUp
     * @private
     */
    thumbMouseUp: function() {
        if (!this.isLocked() && !this.moveComplete) {
            this.endMove();
        }

    },

    /**
     * Returns a reference to this slider's thumb
     * @method getThumb
     * @return {SliderThumb} this slider's thumb
     */
    getThumb: function() {
        return this.thumb;
    },

    /**
     * Try to focus the element when clicked so we can add
     * accessibility features
     * @method focus
     * @private
     */
    focus: function() {

        // Focus the background element if possible
        var el = this.getEl();

        if (el.focus) {
            try {
                el.focus();
            } catch(e) {
                // Prevent permission denied unhandled exception in FF that can
                // happen when setting focus while another element is handling
                // the blur.  @TODO this is still writing to the error log 
                // (unhandled error) in FF1.5 with strict error checking on.
            }
        }

        this.verifyOffset();

        if (this.isLocked()) {
            return false;
        } else {
            this.onSlideStart();
            return true;
        }
    },

    /**
     * Event that fires when the value of the slider has changed
     * @method onChange
     * @param {int} firstOffset the number of pixels the thumb has moved
     * from its start position. Normal horizontal and vertical sliders will only
     * have the firstOffset.  Regions will have both, the first is the horizontal
     * offset, the second the vertical.
     * @param {int} secondOffset the y offset for region sliders
     * @deprecated use instance.subscribe("change") instead
     */
    onChange: function (firstOffset, secondOffset) { 
        /* override me */ 
    },

    /**
     * Event that fires when the at the beginning of the slider thumb move
     * @method onSlideStart
     * @deprecated use instance.subscribe("slideStart") instead
     */
    onSlideStart: function () { 
        /* override me */ 
    },

    /**
     * Event that fires at the end of a slider thumb move
     * @method onSliderEnd
     * @deprecated use instance.subscribe("slideEnd") instead
     */
    onSlideEnd: function () { 
        /* override me */ 
    },

    /**
     * Returns the slider's thumb offset from the start position
     * @method getValue
     * @return {int} the current value
     */
    getValue: function () { 
        return this.thumb.getValue();
    },

    /**
     * Returns the slider's thumb X offset from the start position
     * @method getXValue
     * @return {int} the current horizontal offset
     */
    getXValue: function () { 
        return this.thumb.getXValue();
    },

    /**
     * Returns the slider's thumb Y offset from the start position
     * @method getYValue
     * @return {int} the current vertical offset
     */
    getYValue: function () { 
        return this.thumb.getYValue();
    },

    /**
     * Internal handler for the slider thumb's onChange event
     * @method handleThumbChange
     * @private
     */
    handleThumbChange: function () { 
        var t = this.thumb;
        if (t._isRegion) {
            t.onChange(t.getXValue(), t.getYValue());
            this.fireEvent("change", { x: t.getXValue(), y: t.getYValue() } );
        } else {
            t.onChange(t.getValue());
            this.fireEvent("change", t.getValue());
        }

    },

    /**
     * Provides a way to set the value of the slider in code.
     * @method setValue
     * @param {int} newOffset the number of pixels the thumb should be
     * positioned away from the initial start point 
     * @param {boolean} skipAnim set to true to disable the animation
     * for this move action (but not others).
     * @param {boolean} force ignore the locked setting and set value anyway
     * @return {boolean} true if the move was performed, false if it failed
     */
    setValue: function(newOffset, skipAnim, force) {

        if (!this.thumb.available) {
            this.deferredSetValue = arguments;
            return false;
        }

        if (this.isLocked() && !force) {
            return false;
        }

        if ( isNaN(newOffset) ) {
            return false;
        }

        var t = this.thumb;
        var newX, newY;
        this.verifyOffset(true);
        if (t._isRegion) {
            return false;
        } else if (t._isHoriz) {
            this.onSlideStart();
            // this.fireEvent("slideStart");
            newX = t.initPageX + newOffset + this.thumbCenterPoint.x;
            this.moveThumb(newX, t.initPageY, skipAnim);
        } else {
            this.onSlideStart();
            // this.fireEvent("slideStart");
            newY = t.initPageY + newOffset + this.thumbCenterPoint.y;
            this.moveThumb(t.initPageX, newY, skipAnim);
        }

        return true;
    },

    /**
     * Provides a way to set the value of the region slider in code.
     * @method setRegionValue
     * @param {int} newOffset the number of pixels the thumb should be
     * positioned away from the initial start point (x axis for region)
     * @param {int} newOffset2 the number of pixels the thumb should be
     * positioned away from the initial start point (y axis for region)
     * @param {boolean} skipAnim set to true to disable the animation
     * for this move action (but not others).
     * @param {boolean} force ignore the locked setting and set value anyway
     * @return {boolean} true if the move was performed, false if it failed
     */
    setRegionValue: function(newOffset, newOffset2, skipAnim, force) {

        if (!this.thumb.available) {
            this.deferredSetRegionValue = arguments;
            return false;
        }

        if (this.isLocked() && !force) {
            return false;
        }

        if ( isNaN(newOffset) ) {
            return false;
        }

        var t = this.thumb;
        if (t._isRegion) {
            this.onSlideStart();
            var newX = t.initPageX + newOffset + this.thumbCenterPoint.x;
            var newY = t.initPageY + newOffset2 + this.thumbCenterPoint.y;
            this.moveThumb(newX, newY, skipAnim);
            return true;
        }

        return false;

    },

    /**
     * Checks the background position element position.  If it has moved from the
     * baseline position, the constraints for the thumb are reset
     * @param checkPos {boolean} check the position instead of using cached value
     * @method verifyOffset
     * @return {boolean} True if the offset is the same as the baseline.
     */
    verifyOffset: function(checkPos) {

        var newPos = YAHOO.util.Dom.getXY(this.getEl());
        //var newPos = [this.initPageX, this.initPageY];


        if (newPos[0] != this.baselinePos[0] || newPos[1] != this.baselinePos[1]) {
            this.thumb.resetConstraints();
            this.baselinePos = newPos;
            return false;
        }

        return true;
    },

    /**
     * Move the associated slider moved to a timeout to try to get around the 
     * mousedown stealing moz does when I move the slider element between the 
     * cursor and the background during the mouseup event
     * @method moveThumb
     * @param {int} x the X coordinate of the click
     * @param {int} y the Y coordinate of the click
     * @param {boolean} skipAnim don't animate if the move happend onDrag
     * @private
     */
    moveThumb: function(x, y, skipAnim) {


        var t = this.thumb;
        var self = this;

        if (!t.available) {
            return;
        }


        // this.verifyOffset();

        t.setDelta(this.thumbCenterPoint.x, this.thumbCenterPoint.y);

        var _p = t.getTargetCoord(x, y);
        var p = [_p.x, _p.y];

        this.fireEvent("slideStart");

        if (this.animate && YAHOO.widget.Slider.ANIM_AVAIL && t._graduated && !skipAnim) {
            // this.thumb._animating = true;
            this.lock();

            // cache the current thumb pos
            this.curCoord = YAHOO.util.Dom.getXY(this.thumb.getEl());

            setTimeout( function() { self.moveOneTick(p); }, this.tickPause );

        } else if (this.animate && YAHOO.widget.Slider.ANIM_AVAIL && !skipAnim) {

            // this.thumb._animating = true;
            this.lock();

            var oAnim = new YAHOO.util.Motion( 
                    t.id, { points: { to: p } }, 
                    this.animationDuration, 
                    YAHOO.util.Easing.easeOut );

            oAnim.onComplete.subscribe( function() { self.endMove(); } );
            oAnim.animate();
        } else {
            t.setDragElPos(x, y);
            // this.fireEvents();
            this.endMove();
        }
    },

    /**
     * Move the slider one tick mark towards its final coordinate.  Used
     * for the animation when tick marks are defined
     * @method moveOneTick
     * @param {int[]} the destination coordinate
     * @private
     */
    moveOneTick: function(finalCoord) {

        var t = this.thumb, tmp;

        // redundant call to getXY since we set the position most of time prior 
        // to getting here.  Moved to this.curCoord
        //var curCoord = YAHOO.util.Dom.getXY(t.getEl());

        // alignElWithMouse caches position in lastPageX, lastPageY .. doesn't work
        //var curCoord = [this.lastPageX, this.lastPageY];

        // var thresh = Math.min(t.tickSize + (Math.floor(t.tickSize/2)), 10);
        // var thresh = 10;
        // var thresh = t.tickSize + (Math.floor(t.tickSize/2));

        var nextCoord = null;

        if (t._isRegion) {
            nextCoord = this._getNextX(this.curCoord, finalCoord);
            var tmpX = (nextCoord) ? nextCoord[0] : this.curCoord[0];
            nextCoord = this._getNextY([tmpX, this.curCoord[1]], finalCoord);

        } else if (t._isHoriz) {
            nextCoord = this._getNextX(this.curCoord, finalCoord);
        } else {
            nextCoord = this._getNextY(this.curCoord, finalCoord);
        }


        if (nextCoord) {

            // cache the position
            this.curCoord = nextCoord;

            // move to the next coord
            // YAHOO.util.Dom.setXY(t.getEl(), nextCoord);

            // var el = t.getEl();
            // YAHOO.util.Dom.setStyle(el, "left", (nextCoord[0] + this.thumb.deltaSetXY[0]) + "px");
            // YAHOO.util.Dom.setStyle(el, "top",  (nextCoord[1] + this.thumb.deltaSetXY[1]) + "px");

            this.thumb.alignElWithMouse(t.getEl(), nextCoord[0], nextCoord[1]);
            
            // check if we are in the final position, if not make a recursive call
            if (!(nextCoord[0] == finalCoord[0] && nextCoord[1] == finalCoord[1])) {
                var self = this;
                setTimeout(function() { self.moveOneTick(finalCoord); }, 
                        this.tickPause);
            } else {
                this.endMove();
            }
        } else {
            this.endMove();
        }

        //this.tickPause = Math.round(this.tickPause/2);
    },

    /**
     * Returns the next X tick value based on the current coord and the target coord.
     * @method _getNextX
     * @private
     */
    _getNextX: function(curCoord, finalCoord) {
        var t = this.thumb;
        var thresh;
        var tmp = [];
        var nextCoord = null;
        if (curCoord[0] > finalCoord[0]) {
            thresh = t.tickSize - this.thumbCenterPoint.x;
            tmp = t.getTargetCoord( curCoord[0] - thresh, curCoord[1] );
            nextCoord = [tmp.x, tmp.y];
        } else if (curCoord[0] < finalCoord[0]) {
            thresh = t.tickSize + this.thumbCenterPoint.x;
            tmp = t.getTargetCoord( curCoord[0] + thresh, curCoord[1] );
            nextCoord = [tmp.x, tmp.y];
        } else {
            // equal, do nothing
        }

        return nextCoord;
    },

    /**
     * Returns the next Y tick value based on the current coord and the target coord.
     * @method _getNextY
     * @private
     */
    _getNextY: function(curCoord, finalCoord) {
        var t = this.thumb;
        var thresh;
        var tmp = [];
        var nextCoord = null;

        if (curCoord[1] > finalCoord[1]) {
            thresh = t.tickSize - this.thumbCenterPoint.y;
            tmp = t.getTargetCoord( curCoord[0], curCoord[1] - thresh );
            nextCoord = [tmp.x, tmp.y];
        } else if (curCoord[1] < finalCoord[1]) {
            thresh = t.tickSize + this.thumbCenterPoint.y;
            tmp = t.getTargetCoord( curCoord[0], curCoord[1] + thresh );
            nextCoord = [tmp.x, tmp.y];
        } else {
            // equal, do nothing
        }

        return nextCoord;
    },

    /**
     * Resets the constraints before moving the thumb.
     * @method b4MouseDown
     * @private
     */
    b4MouseDown: function(e) {
        this.thumb.autoOffset();
        this.thumb.resetConstraints();
    },

    /**
     * Handles the mousedown event for the slider background
     * @method onMouseDown
     * @private
     */
    onMouseDown: function(e) {
        // this.resetConstraints(true);
        // this.thumb.resetConstraints(true);

        if (! this.isLocked() && this.backgroundEnabled) {
            var x = YAHOO.util.Event.getPageX(e);
            var y = YAHOO.util.Event.getPageY(e);

            this.focus();
            this.moveThumb(x, y);
        }
        
    },

    /**
     * Handles the onDrag event for the slider background
     * @method onDrag
     * @private
     */
    onDrag: function(e) {
        if (! this.isLocked()) {
            var x = YAHOO.util.Event.getPageX(e);

            var y = YAHOO.util.Event.getPageY(e);
            this.moveThumb(x, y, true);
        }
    },

    /**
     * Fired when the slider movement ends
     * @method endMove
     * @private
     */
    endMove: function () {
        // this._animating = false;
        this.unlock();
        this.moveComplete = true;
        this.fireEvents();
    },

    /**
     * Fires the change event if the value has been changed.  Ignored if we are in
     * the middle of an animation as the event will fire when the animation is
     * complete
     * @method fireEvents
     * @param {boolean} thumbEvent set to true if this event is fired from an event
     *                  that occurred on the thumb.  If it is, the state of the
     *                  thumb dd object should be correct.  Otherwise, the event
     *                  originated on the background, so the thumb state needs to
     *                  be refreshed before proceeding.
     * @private
     */
    fireEvents: function (thumbEvent) {

        var t = this.thumb;

        if (!thumbEvent) {
            t.cachePosition();
        }

        if (! this.isLocked()) {
            if (t._isRegion) {
                var newX = t.getXValue();
                var newY = t.getYValue();

                if (newX != this.previousX || newY != this.previousY) {
                    this.onChange(newX, newY);
                    this.fireEvent("change", { x: newX, y: newY });
                }

                this.previousX = newX;
                this.previousY = newY;

            } else {
                var newVal = t.getValue();
                if (newVal != this.previousVal) {
                    this.onChange( newVal );
                    this.fireEvent("change", newVal);
                }
                this.previousVal = newVal;
            }

            if (this.moveComplete) {
                this.onSlideEnd();
                this.fireEvent("slideEnd");
                this.moveComplete = false;
            }

        }
    },

    /**
     * Slider toString
     * @method toString
     * @return {string} string representation of the instance
     */
    toString: function () { 
        return ("Slider (" + this.type +") " + this.id);
    }

});

YAHOO.augment(YAHOO.widget.Slider, YAHOO.util.EventProvider);

/**
 * A drag and drop implementation to be used as the thumb of a slider.
 * @class SliderThumb
 * @extends YAHOO.util.DD
 * @constructor
 * @param {String} id the id of the slider html element
 * @param {String} sGroup the group of related DragDrop items
 * @param {int} iLeft the number of pixels the element can move left
 * @param {int} iRight the number of pixels the element can move right
 * @param {int} iUp the number of pixels the element can move up
 * @param {int} iDown the number of pixels the element can move down
 * @param {int} iTickSize optional parameter for specifying that the element 
 * should move a certain number pixels at a time.
 */
YAHOO.widget.SliderThumb = function(id, sGroup, iLeft, iRight, iUp, iDown, iTickSize) {

    if (id) {
        //this.init(id, sGroup);
        YAHOO.widget.SliderThumb.superclass.constructor.call(this, id, sGroup);

        /**
         * The id of the thumbs parent HTML element (the slider background 
         * element).
         * @property parentElId
         * @type string
         */
        this.parentElId = sGroup;
    }

    //this.removeInvalidHandleType("A");


    /**
     * Overrides the isTarget property in YAHOO.util.DragDrop
     * @property isTarget
     * @private
     */
    this.isTarget = false;

    /**
     * The tick size for this slider
     * @property tickSize
     * @type int
     * @private
     */
    this.tickSize = iTickSize;

    /**
     * Informs the drag and drop util that the offsets should remain when
     * resetting the constraints.  This preserves the slider value when
     * the constraints are reset
     * @property maintainOffset
     * @type boolean
     * @private
     */
    this.maintainOffset = true;

    this.initSlider(iLeft, iRight, iUp, iDown, iTickSize);

    /**
     * Turns off the autoscroll feature in drag and drop
     * @property scroll
     * @private
     */
    this.scroll = false;

}; 

YAHOO.extend(YAHOO.widget.SliderThumb, YAHOO.util.DD, {

    /**
     * The (X and Y) difference between the thumb location and its parent 
     * (the slider background) when the control is instantiated.
     * @property startOffset
     * @type [int, int]
     */
    startOffset: null,

    /**
     * Flag used to figure out if this is a horizontal or vertical slider
     * @property _isHoriz
     * @type boolean
     * @private
     */
    _isHoriz: false,

    /**
     * Cache the last value so we can check for change
     * @property _prevVal
     * @type int
     * @private
     */
    _prevVal: 0,

    /**
     * The slider is _graduated if there is a tick interval defined
     * @property _graduated
     * @type boolean
     * @private
     */
    _graduated: false,

    /**
     * Returns the difference between the location of the thumb and its parent.
     * @method getOffsetFromParent
     * @param {[int, int]} parentPos Optionally accepts the position of the parent
     * @type [int, int]
     */
    getOffsetFromParent0: function(parentPos) {
        var myPos = YAHOO.util.Dom.getXY(this.getEl());
        var ppos  = parentPos || YAHOO.util.Dom.getXY(this.parentElId);

        return [ (myPos[0] - ppos[0]), (myPos[1] - ppos[1]) ];
    },

    getOffsetFromParent: function(parentPos) {

        var el = this.getEl();

        if (!this.deltaOffset) {

            var myPos = YAHOO.util.Dom.getXY(el);
            var ppos  = parentPos || YAHOO.util.Dom.getXY(this.parentElId);

            var newOffset = [ (myPos[0] - ppos[0]), (myPos[1] - ppos[1]) ];

            var l = parseInt( YAHOO.util.Dom.getStyle(el, "left"), 10 );
            var t = parseInt( YAHOO.util.Dom.getStyle(el, "top" ), 10 );

            var deltaX = l - newOffset[0];
            var deltaY = t - newOffset[1];

            if (isNaN(deltaX) || isNaN(deltaY)) {
            } else {
                this.deltaOffset = [deltaX, deltaY];
            }

        } else {
            var newLeft = parseInt( YAHOO.util.Dom.getStyle(el, "left"), 10 );
            var newTop  = parseInt( YAHOO.util.Dom.getStyle(el, "top" ), 10 );

            newOffset  = [newLeft + this.deltaOffset[0], newTop + this.deltaOffset[1]];
        }

        return newOffset;

        //return [ (myPos[0] - ppos[0]), (myPos[1] - ppos[1]) ];
    },

    /**
     * Set up the slider, must be called in the constructor of all subclasses
     * @method initSlider
     * @param {int} iLeft the number of pixels the element can move left
     * @param {int} iRight the number of pixels the element can move right
     * @param {int} iUp the number of pixels the element can move up
     * @param {int} iDown the number of pixels the element can move down
     * @param {int} iTickSize the width of the tick interval.
     */
    initSlider: function (iLeft, iRight, iUp, iDown, iTickSize) {

        //document these.  new for 0.12.1
        this.initLeft = iLeft;
        this.initRight = iRight;
        this.initUp = iUp;
        this.initDown = iDown;

        this.setXConstraint(iLeft, iRight, iTickSize);
        this.setYConstraint(iUp, iDown, iTickSize);

        if (iTickSize && iTickSize > 1) {
            this._graduated = true;
        }

        this._isHoriz  = (iLeft || iRight); 
        this._isVert   = (iUp   || iDown);
        this._isRegion = (this._isHoriz && this._isVert); 

    },

    /**
     * Clear's the slider's ticks
     * @method clearTicks
     */
    clearTicks: function () {
        YAHOO.widget.SliderThumb.superclass.clearTicks.call(this);
        this.tickSize = 0;
        this._graduated = false;
    },

    /**
     * Gets the current offset from the element's start position in
     * pixels.
     * @method getValue
     * @return {int} the number of pixels (positive or negative) the
     * slider has moved from the start position.
     */
    getValue: function () {
        if (!this.available) { return 0; }
        var val = (this._isHoriz) ? this.getXValue() : this.getYValue();
        return val;
    },

    /**
     * Gets the current X offset from the element's start position in
     * pixels.
     * @method getXValue
     * @return {int} the number of pixels (positive or negative) the
     * slider has moved horizontally from the start position.
     */
    getXValue: function () {
        if (!this.available) { return 0; }
        var newOffset = this.getOffsetFromParent();
        return (newOffset[0] - this.startOffset[0]);
    },

    /**
     * Gets the current Y offset from the element's start position in
     * pixels.
     * @method getYValue
     * @return {int} the number of pixels (positive or negative) the
     * slider has moved vertically from the start position.
     */
    getYValue: function () {
        if (!this.available) { return 0; }
        var newOffset = this.getOffsetFromParent();
        return (newOffset[1] - this.startOffset[1]);
    },

    /**
     * Thumb toString
     * @method toString
     * @return {string} string representation of the instance
     */
    toString: function () { 
        return "SliderThumb " + this.id;
    },

    /**
     * The onchange event for the handle/thumb is delegated to the YAHOO.widget.Slider
     * instance it belongs to.
     * @method onChange
     * @private
     */
    onChange: function (x, y) { 
    }

});

if ("undefined" == typeof YAHOO.util.Anim) {
    YAHOO.widget.Slider.ANIM_AVAIL = false;
}

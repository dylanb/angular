import {bootstrap, Component, Decorator, Template, NgElement} from 'angular2/angular2';

// Angular 2.0 supports 3 basic types of directives:
// - Component - the basic building blocks of Angular 2.0 apps. Backed by
//   ShadowDom.(http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/)
// - Decorator - add behavior to existing elements.
// - Viewport - allow for stamping out of a html template (not in this demo).

// @Component is AtScript syntax to annotate the MenuCmp class as an Angular
// 2.0 component.
@Component({
    // The Selector prop tells Angular on which elements to instantiate this
    // class. The syntax supported is a basic subset of CSS selectors, for example
    // 'element', '[attr]', [attr=foo]', etc.
    selector: 'menu-app',
    // These are services that would be created if a class in the component's
    // template tries to inject them.
    componentServices: []
})
// The template for the component.
@Template({
    inline: `
    <ul id="mymenu" role="menubar" class="a11yfy-top-level-menu">
        <li class="a11yfy-has-submenu" aria-haspopup="true" role="menuitem" tabindex="0">
            One
            <ul class="a11yfy-second-level-menu" role="menu">
                <li role="menuitem" tabindex="-1">
                    <a href="oneone" tabindex="-1">
                        One One
                    </a>
                </li>
                <li role="menuitem" tabindex="-1">
                    <a href="onetwo" tabindex="-1">
                        One Two
                    </a>
                </li>
                <li role="menuitem" tabindex="-1">
                    <a href="onethree" tabindex="-1">
                        One Three
                    </a>
                </li>
                <li role="menuitem" tabindex="-1">
                    <a href="onefour" tabindex="-1">
                        One Four
                    </a>
                </li>
            </ul>
        </li>
        <li class="a11yfy-has-submenu" aria-haspopup="true" role="menuitem" tabindex="-1">
            Two
            <ul class="a11yfy-second-level-menu" role="menu">
                <li class="a11yfy-has-submenu" aria-haspopup="true" role="menuitem" tabindex="-1">
                    Two One
                    <ul class="a11yfy-third-level-menu" role="menu">
                        <li role="menuitem" tabindex="-1">
                            <a href="oneone" tabindex="-1">
                                Two One One
                            </a>
                        </li>
                        <li role="menuitem" tabindex="-1">
                            <a href="onetwo" tabindex="-1">
                                Two One Two
                            </a>
                        </li>
                        <li role="menuitem" tabindex="-1">
                            <a href="onethree" tabindex="-1">
                                Two One Three
                            </a>
                        </li>
                        <li role="menuitem" tabindex="-1">
                            <a href="onefour" tabindex="-1">
                                Two One Four
                            </a>
                        </li>
                    </ul>
                </li>
                <li role="menuitem" tabindex="-1">
                    <a href="onetwo" tabindex="-1">
                        Two Two
                    </a>
                </li>
                <li role="menuitem" tabindex="-1">
                    <a href="onethree" tabindex="-1">
                        Two Three
                    </a>
                </li>
                <li role="menuitem" tabindex="-1">
                    <a href="onefour" tabindex="-1">
                        Two Four
                    </a>
                </li>
            </ul>
        </li>
        <li role="menuitem" tabindex="-1">
            <a href="three" tabindex="-1">
                Three
            </a>
        </li>
        <li role="menuitem" tabindex="-1">
            <a href="#four" tabindex="-1">
                Überhaupt
            </a>
        </li>
    </ul>
    <style>@import "menu.css";</style>
    `,
    // All directives used in the template need to be specified. This allows for
    // modularity 
    // and better tooling (the template can be invalidated if the attribute is
    // misspelled).
    directives: [AriaMenu]
})
class MenuCmp {
    constructor() {
        // Empty constructor
    }
}

// Decorators are light-weight. They don't allow for templates, or new
// expression contexts (use @Component or @Viewport for those needs).
@Decorator({
    selector: '[role=menubar]'
})
class AriaMenu {
    // NgElement is always injectable and it wraps the element on which the
    // directive was found by the compiler.
    constructor(el: NgElement) {
        function visible (elem) {
            return elem && !(!elem.offsetWidth || !elem.offsetHeight);
        }
        function findImmediateChildren(elem, selector) {
            var retVal = [];

            if (Array.isArray(elem)) {
                elem.forEach(function(item) {
                    retVal = retVal.concat(findImmediateChildren(item, selector));
                });
                return retVal;
            } else {
                return Array.prototype.slice.apply(elem.querySelectorAll(selector)).filter(function (item) {
                    return elem === item.parentNode;
                });        
            }
        }
        var menu = el.domElement;
        menu.addEventListener("click", function (e) {
            var currentItem = e.target;

            if (!currentItem.classList.contains("open")) {
                currentItem.classList.add("open");
                currentItem.setAttribute("aria-expanded", "true");
            } else {
                currentItem.classList.remove("open");
                currentItem.setAttribute("aria-expanded", "false");
            }
        }, false);
        menu.addEventListener("keypress", function(e) {
            /*
             * This implements the WAI-ARIA-PRACTICES keyboard functionality where
             * pressing the key, corresponding to the first letter of a VISIBLE element
             * will move the focus to the first such element after the currently focussed
             * element
             */
            var keyCode = e.charCode || e.which || e.keyCode || evt.keyIdentifier.charCodeAt(0),
                keyString = String.fromCharCode(keyCode).toLowerCase(),
                ourIndex = -1,
                currentItem = e.target,
                nextItem, prevItem,
                menuitems = Array.prototype.slice.apply(menu.querySelectorAll("li[role=\"menuitem\"]")).filter(function (item) {
                    return visible(item);
                });

            if (keyCode === 9) {
                return true;
            }

            menuitems.forEach(function(value, index) {
                if (value === currentItem) {
                    ourIndex = index;
                }
                if (index > ourIndex && !nextItem) {
                    if (value.textContent.trim().toLowerCase().indexOf(keyString) === 0) {
                        if (ourIndex !== -1) {
                            nextItem = value;
                        } else if (!prevItem) {
                            prevItem = value;
                        }
                    }
                }
            });
            if (!nextItem && prevItem) {
                nextItem = prevItem;
            }
            if (nextItem) {
                nextItem.tabIndex = 0;
                nextItem.focus();
                currentItem.tabIndex = -1;
                if (nextItem.parentNode !== currentItem.parentNode) {
                    if (currentItem.parentNode.parentNode.nodeName === 'LI') {
                      currentItem.parentNode.parentNode.classList.remove('open');
                      currentItem.parentNode.parentNode.setAttribute('aria-expanded', 'false');
                    }
                }
            }
            e.stopPropagation();
        }, false);
        menu.addEventListener("keydown", function(e) {
            /*
             * This implements the WAI-ARIA-PRACTICES keyboard navigation functionality
             */
            var keyCode = e.which || e.keyCode || evt.keyIdentifier.charCodeAt(0),
                handled = false,
                currentItem = e.target;

            if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
                // not interested
                return;
            }
            /*
             * Open a sub-menu and place focus on the first menuitem within it
             */
            function openMenu() {
                var submMenus;
                if (currentItem.classList.contains("a11yfy-has-submenu")) {
                    currentItem.classList.add("open");
                    currentItem.setAttribute("aria-expanded", "true");
                    submMenus = findImmediateChildren(findImmediateChildren(currentItem, "ul"), "li");
                    submMenus = submMenus.filter(function (item) {return visible(item);});
                    submMenus[0].tabIndex = 0;
                    submMenus[0].focus();
                    currentItem.tabIndex = -1;
                }
            }
            /*
             * Move the focus to the menuitem preceding the current menuitem
             */
            function prevInMenu() {
                var context = currentItem,
                items;
                currentItem.tabIndex = -1;
                while (true) {
                    if (visible(context.previousSibling)) {
                        context.previousSibling.tabIndex = 0;
                        context.previousSibling.focus();
                        return
                    }
                    context = context.previousSibling;
                    if (!context) {
                        items = findImmediateChildren(currentItem.parentNode, "li")
                        context =  items[items.length - 1];
                        if (visible(context)) {
                            context.tabIndex = 0;
                            context.focus();
                            return
                        }
                    }
                    if (context === currentItem) {
                        currentItem.tabIndex = 0;
                        break;
                    }
                }
            }
            /*
             * Move the focus to the next menuitem after the currently focussed menuitem
             */
            function nextInMenu() {
                var context = currentItem,
                    items;
                currentItem.tabIndex = -1;
                while (true) {
                    if (visible(context.nextSibling)) {
                        context.nextSibling.tabIndex = 0;
                        context.nextSibling.focus();
                        return
                    }
                    context = context.nextSibling;
                    if (!context) {
                        items = findImmediateChildren(currentItem.parentNode, "li");
                        context =  items[0];
                        if (visible(context)) {
                            context.tabIndex = 0;
                            context.focus();
                            return
                        }
                    }
                    if (context === currentItem) {
                        currentItem.tabIndex = 0;
                        break;
                    }
                }
            }
            switch(keyCode) {
                case 32: // space
                case 13: // enter
                    handled = true;
                    if (findImmediateChildren(currentItem, "a").length) {
                        if (findImmediateChildren(currentItem, "a")[0].click) {
                            /* If this is a leaf node, activate it*/
                            findImmediateChildren(currentItem, "a")[0].click();
                        } else {
                            // This is a hack for PhantomJS
                            // $this.find(">a").first().trigger("click");
                        }
                    } else {
                        /* If it has a sub-menu, open the sub-menu */
                        openMenu();
                    }
                    break;
                case 37: //left
                case 27: //esc
                    handled = true;
                    if (keyCode === 37 && currentItem.parentNode.classList.contains("a11yfy-top-level-menu")) {
                        /* If in the menubar, then simply move to the previous menuitem */
                        prevInMenu();
                    } else {
                        if (currentItem.parentNode.getAttribute("role") === "menu") {
                            // this is part of a submenu, set focus on containing li
                            currentItem.parentNode.parentNode.tabIndex = 0;
                            currentItem.parentNode.parentNode.focus();
                            currentItem.parentNode.parentNode.classList.remove("open");
                            currentItem.parentNode.parentNode.setAttribute("aria-expanded", "false");
                            currentItem.tabIndex = -1;
                        }
                    }
                    break;
                case 38: //up
                    handled = true;
                    if (currentItem.parentNode.classList.contains("a11yfy-top-level-menu")) {
                        /* If in the menubar, then open the sub-menu */
                        openMenu();
                    } else {
                        /* If in sub-menu, move to previous element */
                        prevInMenu();
                    }
                    break;
                case 39: //right
                    handled = true;
                    if (currentItem.parentNode.classList.contains("a11yfy-top-level-menu")) {
                        /* If in menubar, move to next menuitem */
                        nextInMenu();
                    } else {
                        /* If in sub-menu, open sub-sub-menu */
                        openMenu();
                    }
                    break;
                case 40: //down
                    handled = true;
                    if (currentItem.parentNode.classList.contains("a11yfy-top-level-menu")) {
                        /* If in menubar, open sub-menu */
                        openMenu();
                    } else {
                        /* If in sub-menu, move to the next menuitem */
                        nextInMenu();
                    }
                    break;
            }
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
            return true;
        }, false);
        menu.addEventListener("keydown", function (e) {
            /*
             * This callback handles the tabbing out of the widget
             */
            var focusInTopMenu = false,
                keyCode = e.which || e.keyCode || evt.keyIdentifier.charCodeAt(0);

            if (e.ctrlKey || e.altKey || e.metaKey) {
                // not interested
                return;
            }
            if (keyCode !== 9) {
                return true;
            }
            /* Find out whether we are currently in the menubar */
            findImmediateChildren(menu, "li").forEach(function(value) {
                if (value.tabIndex === 0) {
                    focusInTopMenu = true;
                }
            });
            if (!focusInTopMenu) {
                /*
                 * If not in the menubar, close sub-menus and set the tabindex of the top item in the
                 * menubar so it receives focus when the user tabs back into the menubar
                 */
                findImmediateChildren(menu, "li").forEach(function(value) {
                    Array.prototype.slice.apply(value.querySelectorAll("li")).forEach(function(li) {
                        if (li.tabIndex === 0) {
                            li.tabIndex = -1;
                        }
                    });
                });
                setTimeout(function () {
                    // This code is in a setTimeout so that shift tab works correctly AND
                    // because there is a Firefox (Windows) bug that
                    // causes the default event for a TAB to not happen properly if the visibility of the
                    // currently focussed node is changed mid event (e.g. removal of the open class)
                    Array.prototype.slice.apply(menu.querySelectorAll("li")).forEach(function(li) {
                        if (li.classList.contains("open")) {
                            if (li.parentNode.classList.contains("a11yfy-top-level-menu")) {
                                li.tabIndex = 0;
                            }
                            li.setAttribute("aria-expanded", "false");
                            li.classList.remove("open");
                        }
                    });
                }, 0);
            }
            return true;
        }, false);
    }
}

export function main() {
  // Bootstrapping only requires specifying a root component.
  bootstrap(MenuCmp);
}

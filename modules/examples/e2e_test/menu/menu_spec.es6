var testUtil = require('angular2/src/test_lib/e2e_util');
var wd = require('selenium-webdriver');

describe('menu', function () {
  afterEach(testUtil.verifyNoBrowserErrors);
  describe('Menu: dynamic reflection', function() {
    var URL = 'examples/src/menu/menu.html';

    it('should insert the menu into the DOM', function() {
      browser.get(URL);

      expect(getMenuLength('#mymenu')).toBe(1);
    });
    it('should support arrow key navigation that wraps around at the menubar level', function () {
      browser.get(URL);
      setFocusIntoMenu();
      expect(getMenuFocusedText()).toBe('One');
      sendMenuKey(wd.Key.RIGHT);
      expect(getMenuFocusedText()).toBe('Two');
      sendMenuKey(wd.Key.RIGHT);
      expect(getMenuFocusedText()).toBe('Three');
      sendMenuKey(wd.Key.RIGHT);
      expect(getMenuFocusedText()).toBe('Überhaupt');
      // wrap
      sendMenuKey(wd.Key.RIGHT);
      expect(getMenuFocusedText()).toBe('One');
      // wrap back
      sendMenuKey(wd.Key.LEFT);
      expect(getMenuFocusedText()).toBe('Überhaupt');
    });
    it('should support arrow key navigation that opens and closes the sub-menus, sub menus should wrap', function () {
      browser.get(URL);
      setFocusIntoMenu();
      expect(getMenuFocusedText()).toBe('One');
      sendMenuKey(wd.Key.RIGHT);
      expect(getMenuFocusedText()).toBe('Two');
      // open and focus
      sendMenuKey(wd.Key.DOWN);
      expect(getMenuFocusedText()).toBe('Two One');
      // open and focus
      sendMenuKey(wd.Key.RIGHT);
      expect(getMenuFocusedText()).toBe('Two One One');
      // close
      sendMenuKey(wd.Key.ESCAPE);
      expect(getMenuFocusedText()).toBe('Two One');

      // Test wrapping of the sub-menu
      sendMenuKey(wd.Key.DOWN);
      expect(getMenuFocusedText()).toBe('Two Two');
      sendMenuKey(wd.Key.DOWN);
      expect(getMenuFocusedText()).toBe('Two Three');
      sendMenuKey(wd.Key.DOWN);
      expect(getMenuFocusedText()).toBe('Two Four');
      sendMenuKey(wd.Key.DOWN);
      expect(getMenuFocusedText()).toBe('Two One');
      sendMenuKey(wd.Key.UP);
      expect(getMenuFocusedText()).toBe('Two Four');

      // close
      sendMenuKey(wd.Key.ESCAPE);
      expect(getMenuFocusedText()).toBe('Two');
    });
    it('should support arrow key navigation and enter that opens the sub-menus', function () {
      browser.get(URL);
      setFocusIntoMenu();
      expect(getMenuFocusedText()).toBe('One');
      sendMenuKey(wd.Key.RIGHT);
      expect(getMenuFocusedText()).toBe('Two');
      // open and focus
      sendMenuKey(wd.Key.ENTER);
      expect(getMenuFocusedText()).toBe('Two One');
      // open and focus
      sendMenuKey(wd.Key.ENTER);
      expect(getMenuFocusedText()).toBe('Two One One');
      // close
      sendMenuKey(wd.Key.LEFT);
      expect(getMenuFocusedText()).toBe('Two One');
      // close
      sendMenuKey(wd.Key.LEFT);
      expect(getMenuFocusedText()).toBe('Two');
    });
    it('should support keypress navigation that focusses the next item with a 1st character that matches the key pressed', function () {
      browser.get(URL);
      setFocusIntoMenu();
      expect(getMenuFocusedText()).toBe('One');
      sendMenuKey('t');
      expect(getMenuFocusedText()).toBe('Two');
      sendMenuKey('t');
      expect(getMenuFocusedText()).toBe('Three');
      sendMenuKey('t');
      expect(getMenuFocusedText()).toBe('Two');
    });
    it('should support enter selecting a menu item', function () {
      browser.get(URL);
      setFocusIntoMenu();
      expect(getMenuFocusedText()).toBe('One');
      // wrap
      sendMenuKey(wd.Key.LEFT);
      expect(getMenuFocusedText()).toBe('Überhaupt');
      sendMenuKey(wd.Key.ENTER);
      expect(getURLFragment()).toBe('#four');
    });
  });
});

function getMenuLength(innerSelector) {
  return browser.executeScript('return document.querySelector("menu-app").shadowRoot.querySelectorAll("'+innerSelector+'").length');
}

function getMenuFocusedText() {
  return browser.executeScript(
    `var sr = document.querySelector("menu-app").shadowRoot;
    if (sr.activeElement.querySelector('li')) {
      return sr.activeElement.firstChild.textContent.trim();
    } else {
      return sr.activeElement.querySelector('a').firstChild.textContent.trim();
    }`);
}

function setFocusIntoMenu() {
  browser.findElement(By.tagName('body')).sendKeys('\t');
}

function sendMenuKey(keys) {
  browser.findElement(By.tagName('menu-app')).sendKeys(keys);
}

function getURLFragment() {
  return browser.executeScript('return window.location.hash;');
}

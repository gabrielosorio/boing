/* Credit to Matteo Spinelli | cubiq.org  */

function NoClickDelay(el, callback) {
  this.element = el;
  this.callback = callback;
  // If is touch-based device
  if (!!('ontouchstart' in window)) {
    this.element.addEventListener('touchstart', this, false);
  } else {
    // Fallback on click
    this.element.addEventListener('click', callback);
  }
}

NoClickDelay.prototype = {
  handleEvent: function(e) {
    switch(e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchend': this.onTouchEnd(e); break;
    }
  },

  onTouchStart: function(e) {
    e.preventDefault();
    this.moved = false;

    this.element.addEventListener('touchmove', this, false);
    this.element.addEventListener('touchend', this, false);
  },

  onTouchMove: function(e) {
    this.moved = true;
  },

  onTouchEnd: function(e) {
    this.element.removeEventListener('touchmove', this, false);
    this.element.removeEventListener('touchend', this, false);

    if (!this.moved) {
      this.callback();
      // Place your code here or use the click simulation below
      var theTarget = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      if (theTarget.nodeType == 3) theTarget = theTarget.parentNode;

      var theEvent = document.createEvent('MouseEvents');
      theEvent.initEvent('click', true, true);
      theTarget.dispatchEvent(theEvent);
    }
  },
};

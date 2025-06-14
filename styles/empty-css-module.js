// Empty CSS module fallback for @epilot packages
module.exports = new Proxy({}, {
  get: function() {
    return '';
  }
}); 
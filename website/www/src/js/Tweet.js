/// <reference path="lib/leaflet.d.ts"/>
var Tweet = (function () {
    function Tweet(data) {
        this.data = data;
    }
    Object.defineProperty(Tweet.prototype, "marker", {
        get: function () {
            return this.marker;
        },
        enumerable: true,
        configurable: true
    });
    return Tweet;
})();
//# sourceMappingURL=Tweet.js.map
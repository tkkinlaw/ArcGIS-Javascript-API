require([
    "esri/Map",
    "esri/views/MapView"
], function(Map, MapView) {
    var map = new Map({
        basemap: "topo-vector"
    });

    var view = new MapView({
        container: "mapViewDiv",
        map: map,
        zoom: 4,
        center: [15, 65] // Longitude, latitude
    });
});
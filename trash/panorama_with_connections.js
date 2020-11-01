ymaps.ready(function () {
    if (!ymaps.panorama.isSupported()) {
        return;
    }

    let panoData = {};

    function getConnectedPanoramaData(panoID) {}

    function loadImage(src) {}

    function ConnectionArrow(currentPanorama, direction, nextPanorama) {}

    ymaps.util.defineClass(ConnectionArrow, {
        getConnectedPanorama: function () {},
        getDirection: function () {},
        getPanorama: function () {}
    })

    function MarkerConnection(currentPanorama, imgSrc, position, nextPanorama) {

    }

    ymaps.util.defineClass(MarkerConnection, {
        getIconSet: function () {},
        getPanorama: function () {},
        getPosition: function () {},
        getConnectedPanorama: function () {},
    });

    function MyPanorama(obj) {}

    ymaps.util.defineClass(MyPanorama, ymaps.panorama.Base, {
        getConnectionArrows: function () {},
        getConnectionMarkers: function () {},
        getAngularBBox: function () {},
        getPosition: function () {},
        getTileSize: function () {},
        getTileLevels: function () {},
        getCoordSystem: function () {}
    });

    let panorama = new MyPanorama(panoData.firstPano);

    const player = new ymaps.panorama.Player('player', panorama, {});
});
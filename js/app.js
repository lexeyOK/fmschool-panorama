ymaps.ready(function () {
    // Для начала проверим, поддерживает ли плеер браузер пользователя.
    if (!ymaps.panorama.isSupported()) {
        // Если нет, то ничего не будем делать.
        return;
    }

	const imgPath = 'img/tiles/'
	const pi = Math.PI;
	let map = new Map([
		['pano1', [{
			panoID: 'pano2',
			direction: [-pi/4, 0]
		}, {
			panoID: 'pano3',
			direction: [pi, 0]
		}, ]],
		['pano2', [{
			panoID: 'pano1',
			direction: [pi-pi/6, 0]
		}, {
			panoID: 'pano5',
			direction: [pi/12+pi/2, 0]
		}, ]],
		['pano3', [{
			panoID: 'pano4',
			direction: [pi/6, 0]
		}, {
			panoID: 'pano1',
			direction: [0, 0]
		}, ]],
		['pano4', [{
			panoID: 'pano3',
			direction: [pi+pi/4, 0]
		}, {
			panoID: 'pano5',
			direction: [-2*pi/6, 0]
		}, ]],
		['pano5', [{
			panoID: 'pano2',
			direction: [-2*pi/3, 0]
		}, {
			panoID: 'pano4',
			direction: [pi/2-pi/6, 0]
		}, ]],
	]);

	class CreatePano {
		constructor(panoName, Arrows) {
			this.type = 'custom';
			this.angularBBox = [pi / 2, 2 * pi + pi / 4, -pi / 2, pi / 4];
			this.position = [0, 0, 0];
			this.tileSize = [512, 512];
			this.tileLevels = [{
					getTileUrl: (x, y) => `${imgPath+panoName}/hq/${x}-${y}.jpg`,
					getImageSize: () => [8192, 4096],
				},
				{
					getTileUrl: (x, y) => `${imgPath+panoName}/lq/0-0.jpg`,
					getImageSize: () => [512, 256],
				}
			];
			this.connectionArrows = Arrows;
		}
	}

	let panoData = {};

	for (let node of map) {
		panoData[node[0]] = new CreatePano(node[0],node[1]);
	}

    // Функция для извлечения данных нужной панорамы из объекта panoData.
    function getConnectedPanoramaData(panoID) {
        return panoData[panoID];
    }
    // Функция, загружающая изображение маркера с сервера.
    function loadImage(src) {
        return new ymaps.vow.Promise(function (resolve) {
            var image = new Image();
            image.onload = function () {
                resolve(image);
            };
            image.crossOrigin = 'anonymous';
            image.src = src;
        });
    }

    // Создаем класс, описывающий переход между панорамами по стандартной стрелке.
    function ConnectionArrow(currentPanorama, direction, nextPanorama) {
        this.properties = new ymaps.data.Manager();
        this._currentPanorama = currentPanorama;
        this._direction = direction;
        this._connectedPanorama = nextPanorama;
    }

    ymaps.util.defineClass(ConnectionArrow, {
        getConnectedPanorama: function () {
            // Если переход будет осуществляться на пользовательскую панораму,
            // то создаем объект панорамы MyPanorama.
            // Если нужно перейти на Яндекс.Панораму, то для получения объекта
            // панорамы воспользуемся функцией ymaps.panorama.locate.
            if (this._connectedPanorama.type == 'custom') {
                return ymaps.vow.resolve(new MyPanorama(this._connectedPanorama));
            } else if (this._connectedPanorama.type == 'yandex') {
                return ymaps.panorama.locate(this._connectedPanorama.coords).then(
                    function(panoramas) {
                        if (panoramas.length) {
                            return panoramas[0];
                        }  else {
                            return ymaps.vow.reject(new Error('Панорама не нашлась.'));
                        }
                    }
                );
            }
        },
        // Направление взгляда на панораму, на которую будет осуществляться переход.
        getDirection: function () {
            return this._direction;
        },
        // Ссылка на текущую панораму, из которой осуществляется переход.
        getPanorama: function () {
            return this._currentPanorama;
        }
    })

    // Создаем класс, описывающий маркер-переход.
    function MarkerConnection(currentPanorama, imgSrc, position, nextPanorama) {
        // В классе должно быть определено поле properties.
        this.properties = new ymaps.data.Manager();
        this._panorama = currentPanorama;
        this._position = position;
        this._imgSrc = imgSrc;
        this._connectedPanorama = nextPanorama;
    }

    ymaps.util.defineClass(MarkerConnection, {
        getIconSet: function () {
            return ymaps.vow.Promise.all([
                loadImage(this._imgSrc.default),
                loadImage(this._imgSrc.hovered)
            ]).spread(function (defaultImage, hoveredImage) {
                return {
                    'default': {
                        image: defaultImage,
                        offset: [0, 0]
                    },
                    hovered: {
                        image: hoveredImage,
                        offset: [0, 0]
                    }
                };
            });
        },
        // Текущая панорама, из которой осуществляется переход.
        getPanorama: function () {
            return this._panorama;
        },
        // Позиция маркера на текущей панораме.
        getPosition: function () {
            return this._position;
        },
        // Чтобы по клику на маркер осуществлялся переход на другую панораму,
        // реализуем метод getConnectedPanorama.
        getConnectedPanorama: function () {
            if (this._connectedPanorama.type == 'custom') {
                return ymaps.vow.resolve(new MyPanorama(this._connectedPanorama));
            } else if (this._connectedPanorama.type == 'yandex') {
                return ymaps.panorama.locate(this._connectedPanorama.coords).then(
                    function(panoramas) {
                        if (panoramas.length) {
                            return panoramas[0];
                        } else {
                            return ymaps.vow.reject(new Error('Панорама не нашлась.'));
                        }
                    }
                );
            }
        }
    });

    // Класс панорамы.
    function MyPanorama(obj) {
        ymaps.panorama.Base.call(this);
        this._angularBBox = obj.angularBBox;
        this._position = obj.position;
        this._tileSize = obj.tileSize;
        this._tileLevels = obj.tileLevels;
        // Получаем массив экземпляров класса, описывающего переход по стрелке из
        // одной панорамы на другую.
        this._connectionArrows = obj.connectionArrows.map(function (connectionArrow) {
            return new ConnectionArrow(
                this, // Текущая панорама.
                connectionArrow.direction, // Направление взгляда на панораму, на которую делаем переход.
                getConnectedPanoramaData(connectionArrow.panoID) // Данные панорамы, на которую делаем переход.
            );
        }, this);


    }

    ymaps.util.defineClass(MyPanorama, ymaps.panorama.Base, {
        // Чтобы добавить на панораму стандартные стрелки переходов,
        // реализуем метод getConnectionArrows.
        getConnectionArrows: function () {
            return this._connectionArrows;
        },
        // Чтобы добавить на панораму маркеры-переходы,
        // нужно реализовать метод getConnectionMarkers.
        getAngularBBox: function () {
            return this._angularBBox;
        },
        getPosition: function () {
            return this._position;
        },
        getTileSize: function () {
            return this._tileSize;
        },
        getTileLevels: function () {
            return this._tileLevels;
        },
        getCoordSystem: function () {
            return ymaps.coordSystem.cartesian;
        }
    });

    var panorama = new MyPanorama(panoData.pano1);

    // Отображаем панораму на странице.
    var player = new ymaps.panorama.Player('player', panorama, {
        direction: [0, 0]
    });

    btn1.onclick = function() {
        //alert('1');
        player.setPanorama(new MyPanorama(panoData.pano1));
    };
    btn2.onclick = function() {
        //alert('1');
        player.setPanorama(new MyPanorama(panoData.pano2));
    };
    btn3.onclick = function() {
        //alert('1');
        player.setPanorama(new MyPanorama(panoData.pano3));
    };
    btn4.onclick = function() {
        //alert('1');
        player.setPanorama(new MyPanorama(panoData.pano4));
    };
    btn5.onclick = function() {
        //alert('1');
        player.setPanorama(new MyPanorama(panoData.pano5));
    };
});


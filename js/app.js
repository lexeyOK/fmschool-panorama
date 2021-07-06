const timeBeforeLoading = Date.now();

ymaps.ready(function () {

	console.log(`Loading Time: ${Date.now()-timeBeforeLoading} ms`);

	if (!ymaps.panorama.isSupported()) {
		window.location.href = "/not-supported";
		return;
	}

	class ConnectionArrow {
		constructor(currentPanorama, direction, nextPanorama) {
			this.properties = new ymaps.data.Manager();
			this._currentPanorama = currentPanorama;
			this._direction = direction;
			this._connectedPanorama = nextPanorama;
		}
	}

	ymaps.util.defineClass(ConnectionArrow, {
		getConnectedPanorama: function () {
			// Если переход будет осуществляться на пользовательскую панораму,
			// то создаем объект панорамы MyPanorama.
			// Если нужно перейти на Яндекс.Панораму, то для получения объекта
			// панорамы воспользуемся функцией ymaps.panorama.locate.
			if (this._connectedPanorama.type == "custom") {
				return ymaps.vow.resolve(new MyPanorama(this._connectedPanorama, panoData));
			} else if (this._connectedPanorama.type == "yandex") {
				return ymaps.panorama
					.locate(this._connectedPanorama.coords)
					.then(function (panoramas) {
						if (panoramas.length) {
							return panoramas[0];
						} else {
							return ymaps.vow.reject(new Error("Панорама не нашлась."));
						}
					});
			}
		},
		// Направление взгляда на панораму, на которую будет осуществляться переход.
		getDirection: function () {
			return this._direction;
		},
		// Ссылка на текущую панораму, из которой осуществляется переход.
		getPanorama: function () {
			return this._currentPanorama;
		},
	});

	function renderImage(text, maxWidth, padding) {
		let context = document.createElement('canvas')
			.getContext('2d');
		
		const words = text.split(' ');

		context.font = "14px Arial";
		const lineHeight=14*1.1;

		context.fillStyle = '#3333ff';
		context.fillRect(0, 0, maxWidth+padding, words.length*lineHeight+2*padding);
		let y = 2*padding;
		context.fillStyle = 'white';
		let line = '';
		for(let n = 0; n < words.length; n++) {
			let testLine = line + words[n] + ' ';
			var testWidth = context.measureText(testLine).width;
			if(testWidth > maxWidth) {
			  context.fillText(line, padding, y);
			  line = words[n] + ' ';
			  y += lineHeight;
			}
			else {
			  line = testLine;
			}
		}
		context.fillText(line, padding, y);
		return context.canvas;
	}

	class Marker {
		constructor(text, position, panorama) {
			// В классе должно быть определено поле properties.
			this.properties = new ymaps.data.Manager();
			this._panorama = panorama;
			this._position = position;
			this._text = text;
		}
	}

	ymaps.util.defineClass(Marker, {
		getIconSet: function () {
			return ymaps.vow.Promise.all({
				'default': {
					image: renderImage(this._text, 200, 10),
					offset: [0, 0]
				}
			});
		},
		getPanorama: function () {
			return this._panorama;
		},
		getPosition: function () {
			return this._position;
		}
	});


	function MyPanorama(obj, panoData) {
		ymaps.panorama.Base.call(this);
		this._angularBBox = obj.angularBBox;
		this._position = obj.position;
		this._tileSize = obj.tileSize;
		this._tileLevels = obj.tileLevels;
		this._markers = obj.markers.map((marker) => new Marker(marker.text, marker.position, this), this);
		this._connectionArrows = obj.connectionArrows.map(
			(connectionArrow) => new ConnectionArrow(
				this,
				connectionArrow.direction,
				panoData[connectionArrow.panoName]
			),
			this);
	}

	ymaps.util.defineClass(MyPanorama, ymaps.panorama.Base, {
		getMarkers: function () {
			return this._markers;
		},
		// Чтобы добавить на панораму стандартные стрелки переходов,
		// реализуем метод getConnectionArrows.
		getConnectionArrows: function () {
			return this._connectionArrows;
		},
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
		},
	});

	const pi = Math.PI;
	const imgPath = 'img-sq/tiles/';

	class CreatePano {
		constructor(panoName, pano) {
			this.type = 'custom';
			this.angularBBox = [pi / 2, 2 * pi + pi / 4, -pi / 2, pi / 4];
			this.position = [0, 0, 0];
			this.tileSize = [512, 512];
			this.tileLevels = [{
					getTileUrl: (x, y) => `${imgPath + panoName}-sq/hq-sq/${x}-${y}.webp`,
					getImageSize: () => pano.imageSize,
				},
				{
					getTileUrl: (x, y) => `${imgPath + panoName}-sq/lq/0-0.jpg`,
					getImageSize: () => [512, 256],
				}
			];
			this.connectionArrows = pano.connectedPanoramas;
			this.markers = pano.markers;
		}
	}

	let panoData = {};
	const navigationBar = document.getElementById("bar");

	(async () => {

		const json = await fetch("./js/panodata.json");
		const obj = await json.json();
		const map = new Map(Object.entries(obj));

		for (let [name, props] of map) {
			panoData[name] = new CreatePano(name, props);
		}

		const panorama = new MyPanorama(panoData.pano1, panoData);
		// Отображаем панораму на странице.
		const player = new ymaps.panorama.Player('player', panorama, {
			direction: [0, 0],
			controls: ["zoomControl"],
			hotkeysEnabled: true,
		});

		for (let name of map.keys()) {
			let button = document.createElement("button");
			button.id = name;
			button.innerText = name;
			button.ariaLabel = "Переход на панораму";
			navigationBar.append(button);
			document.getElementById(name).onclick = function () {
				return player.setPanorama(new MyPanorama(panoData[name], panoData));
			};
		}
	})();

	function dragElement(el) {
		let x = 0, y = 0, nx = 0, ny = 0;
		el.onmousedown = function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at start up:
			nx = e.clientX;
			ny = e.clientY;
			document.onmouseup = closeDragElement;
			document.onmousemove = elementDrag;
		};

		function closeDragElement() {
			// stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			// calculate the new cursor position:
			x = nx - e.clientX;
			y = ny - e.clientY;
			nx = clamp(0, e.clientX, window.innerWidth);
			ny = clamp(0, e.clientY, window.innerHeight);
			// set new position of element:
			el.style.top = clamp(0, el.offsetTop - y, window.innerHeight - el.offsetHeight) + 'px';
			el.style.left = clamp(0, el.offsetLeft - x, window.innerWidth - el.offsetWidth) + 'px';
		}

		function clamp(min, val, max) {
			return Math.min(Math.max(val, min), max);
		}
	}

	restore.onclick = () => {
		navigationBar.style.top = 0;
		navigationBar.style.left = 0;
	};
	dragElement(navigationBar);
});
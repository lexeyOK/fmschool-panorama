ymaps.ready(function () {
	// Для начала проверим, поддерживает ли плеер браузер пользователя.
	if (!ymaps.panorama.isSupported()) {
		window.location.href = "/not-supported";
		return;
	}

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

	function renderImage(text) {
		var ctx = document.createElement('canvas')
			.getContext('2d');
		ctx.canvas.width = 128;
		ctx.canvas.height = 32;
		ctx.fillStyle = '#3333ff';
		ctx.fillRect(0, 0, 128, 32);
		ctx.fillStyle = 'white';
		ctx.font = '12px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, 64, 16);
		return ctx.canvas;
	}

	// Класс маркера.
	function Marker(text, position, panorama) {
		// В классе должно быть определено поле properties.
		this.properties = new ymaps.data.Manager();
		this._panorama = panorama;
		this._position = position;
		this._text = text;
	}

	// Определяем в классе Marker нужные методы.
	ymaps.util.defineClass(Marker, {
		getIconSet: function () {
			return ymaps.vow.Promise.all({
				'default': {
					image: renderImage(this._text),
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
				panoData[connectionArrow.panoID]
			),
			this);
	}

	ymaps.util.defineClass(MyPanorama, ymaps.panorama.Base, {
		getMarkers: function () {
			return this._markers;
		},
		//getMarkers: function () {
		//	return [new Marker('aaaaa', [0, 0, 0], this)];
		//},
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
		constructor(panoName, Arrows, markers) {
			this.type = 'custom';
			this.angularBBox = [pi / 2, 2 * pi + pi / 4, -pi / 2, pi / 4];
			this.position = [0, 0, 0];
			this.tileSize = [512, 512];
			this.tileLevels = [{
					getTileUrl: (x, y) => `${imgPath + panoName}-sq/hq-sq/${x}-${y}.webp`,
					getImageSize: () => [8192, 4096],
				},
				{
					getTileUrl: (x, y) => `${imgPath + panoName}-sq/lq/0-0.jpg`,
					getImageSize: () => [512, 256],
				}
			];
			this.connectionArrows = Arrows;
			this.markers = markers;
		}
	}

	let panoData = {};

	(async (panodata) => {

		const json = await fetch("./js/panodata.json");
		const obj = await json.json();
		const map = new Map(Object.entries(obj));

		for (let [name, props] of map) {
			//console.log(props);
			panoData[name] = new CreatePano(name,
				props.connected_pano,
				props.markers);
		}

		const panorama = new MyPanorama(panoData.pano1, panoData);
		//console.log(panorama._markers);
		// Отображаем панораму на странице.
		const player = new ymaps.panorama.Player('player', panorama, {
			direction: [0, 0],
			controls: ["zoomControl"],
			hotkeysEnabled: true,
		});

		for (let name of map.keys()) {
			let btn = document.createElement("button");
			btn.id = name;
			btn.innerText = name;
			bar.append(btn);
			document.getElementById(name).onclick = function () {
				return player.setPanorama(new MyPanorama(panoData[name], panoData));
			};
		}
		//player.events.add('directionchange', () => console.log(player.getDirection()[0]));
	})(panoData);

	function dragElement(el) {
		let x = 0,
			y = 0,
			nx = 0,
			ny = 0;
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
			el.style.top = clamp(
				0,
				el.offsetTop - y,
				window.innerHeight - el.offsetHeight) + 'px';
			el.style.left = clamp(
				0,
				el.offsetLeft - x,
				window.innerWidth - el.offsetWidth) + 'px';
		}

		function clamp(min, val, max) {
			return Math.min(Math.max(val, min), max);
		}
	}

	restore.onclick = () => {
		document.getElementById("bar").style.top = 0;
		document.getElementById("bar").style.left = 0;
	};
	dragElement(document.getElementById("bar"));
});
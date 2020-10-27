class CreatePano {
	constructor(n) {
		this.type = 'custom';
		this.angularBBox = [Math.PI / 2, 2 * Math.PI + Math.PI / 4, -Math.PI / 2, Math.PI / 4];
		this.position = [0, 0, 0];
		this.tileSize = [512, 512];
		let url1 = 'tiles/pano' + n + '/hq/';
		let url2 = 'tiles/pano' + n + '/lq/';
		this.tileLevels = [
			{
				getTileUrl: (x, y) => url1 + x + '-' + y + '.jpg',
				getImageSize: () => [8192, 4096],
			},
			{
				getTileUrl: (x, y) => url2 + x + '-' + y + '.jpg',
				getImageSize: () => [512, 256],
			}
		];
		this.connectionArrows = [{
			panoID: 'pano3',
			direction: [0, 0]
		}];
	}
}

let panoData = {};

for (let i = 1; i <= 5; i++) {
	panoData['pano' + i] = new CreatePano(i);
}
/*
        let panoData = {
            // Данные первой панорамы.
            pano1: {
                    type: 'custom',
                    angularBBox: [Math.PI / 2, 2 * Math.PI + Math.PI / 4, -Math.PI / 2, Math.PI / 4],
                    position: [0, 0, 0],
                    tileSize: [512, 512],
                    tileLevels: [
                        {
                            getTileUrl: (x, y) => 'tiles/pano1/hq/' + x + '-' + y + '.jpg',
                            getImageSize: () => [8192, 4096],
                        },
                        {
                            getTileUrl: (x, y) => 'tiles/pano1/lq/' + x + '-' + y + '.jpg',
                            getImageSize: () => [512, 256],
                        }],
                    // Переходы на панораме по стандартной стрелке.
                    connectionArrows: [{
                            panoID: 'pano2',
                            direction: [90, 0]
                    }]
                    // Переходы на панораме через маркеры.
            },
            pano2: {
                    type: 'custom',
                    angularBBox: [Math.PI / 2, 2 * Math.PI, -Math.PI / 2, 0],
                    position: [0, 0, 0],
                    tileSize: [512, 512],
                    tileLevels: [{
                            getTileUrl: function (x, y) {
                                    return 'tiles/pano2/hq/' + x + '-' + y + '.jpg';
                            },
                            getImageSize: function () {
                                    return [8192, 4096];
                            }
                    }, {
                            getTileUrl: function (x, y) {
                                    return 'tiles/pano2/lq/0-0.jpg';
                            },
                            getImageSize: function () {
                                    return [512, 256];
                            }
                    }],
                    connectionArrows: [{
                            panoID: 'pano1',
                            direction: [90, 0]
                    }]
            },
        };
    */
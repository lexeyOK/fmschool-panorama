const imgPath = 'img/tiles/'

let map = new Map([
	['pano1', [{
		panoID: 'pano2',
		direction: [0, 0]
	}, {
		panoID: 'pano3',
		direction: [90, 0]
	}, ]],
	['pano2', [{
		panoID: 'pano1',
		direction: [0, 0]
	}, {
		panoID: 'pano5',
		direction: [90, 0]
	}, ]],
	['pano3', [{
		panoID: 'pano4',
		direction: [0, 0]
	}, {
		panoID: 'pano1',
		direction: [0, 0]
	}, ]],
	['pano4', [{
		panoID: 'pano3',
		direction: [0, 0]
	}, {
		panoID: 'pano5',
		direction: [0, 0]
	}, ]],
	['pano5', [{
		panoID: 'pano2',
		direction: [0, 0]
	}, {
		panoID: 'pano4',
		direction: [0, 0]
	}, ]],
]);

class CreatePano {
	constructor(panoName, Arrows) {
		this.type = 'custom';
		this.angularBBox = [Math.PI / 2, 2 * Math.PI + Math.PI / 4, -Math.PI / 2, Math.PI / 4];
		this.position = [0, 0, 0];
		this.tileSize = [512, 512];
		let url1 = `${imgPath+panoName}/hq/`;
		let url2 = `${imgPath+panoName}/lq/`;
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
console.log(panoData);
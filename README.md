# fmschool-panorama
Панорамы для Физико-Математической школы г. Тюмень  
## Использовано 
  - JAM stack (?)
  - [Yandex Map API](https://yandex.ru/dev/maps/jsapi/)
  - git, github
  - ImageMagick, webp, squoosh-cli
  
### [Demo](https://lexeyok.github.io/fmschool-panorama/)

# Local Development 
For local development use any web server to serve `index.html`  
**You will need to get Yamaps api key**  
Examples:
```bash
php -S localhost:8080 #will serve on http://localhost:8080/
python3 -m http.server #will serve on http://127.0.0.1:8080/
```
## Get Yamaps api key
- create yandex profile at https://passport.yandex.ru/registration
- go through this [guide](https://yandex.com/dev/maps/jsapi/doc/2.1/quick-start/index.html#get-api-key) and get your api key 
- change api key in script tag to your own

# How to prepare and add panoramas
You need to prepare spherical panorama:
1. make your panorama with google view or anything else
2. you will need to cut it in tiles 512x512 px and low quality version (use [sh script](https://github.com/lexeyOK/fmschool-panorama/blob/main/sh/pano-maker.sh) for it )
3. put panorama folder in tiles folder

here is representation of images folder structure:
```
img
  - tiles
    - pano1
      - hq
      - lq
    - pano2
      - ...
```
hq folder contains cuted tiles, lq contains low quality version of pano
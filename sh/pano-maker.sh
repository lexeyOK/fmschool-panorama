NAME="pano9" &&
mkdir "${NAME}" &&
mv "${NAME}".jpg "${NAME}" &&
cd "${NAME}" &&
mkdir hq lq &&
convert "${NAME}".jpg -crop 512x512 -set filename:tile "%[fx:page.x/512]-%[fx:page.y/512]" "hq/%[fil"ename":tile].jpg" &&
convert "${NAME}".jpg -resize 512x256 "lq/0-0.jpg" &&
cd hq &&
for f in *; do squoosh-cli f --webp; done&& mkdir ../hq-sq && cp *.webp ../hq-sq && rm *.webp &&
cd .. &&
mkdir ../"${NAME}"-sq &&
cp -r hq-sq lq ../"${NAME}"-sq &&
unset NAME
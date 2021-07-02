//Create a Pixi Application
let app = new PIXI.Application({
    antialias: true, 
    transparent: false, 
    resolution: 1
  });

//app.renderer.backgroundColor = 0x061639;
document.body.append(app.view)

let style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 12,
    fill: "white",
    wordWrap: true,
    align: "center",
    wordWrapWidth: 500
  });
const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\
 Aenean egestas volutpat scelerisque. Vivamus tortor dolor, suscipit quis pulvinar eu,\
  iaculis commodo neque. Proin tincidunt ipsum a mauris vehicula dignissim."
let message = new PIXI.Text(text, style);
app.stage.addChild(message);
const offset = 10;
app.renderer.resize(message.width+2*offset, message.height+2*offset);
message.position.set(offset,offset);
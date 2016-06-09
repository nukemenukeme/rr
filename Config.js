var Config = {};

//base:
Config.debug = 0;
Config.framerate = 60;

//piece:
Config.colors = ["#FF00FF","#00FFFF"];

Config.noBalls = false;

Config.ballSize = .06;//relative to window size (w*h)

Config.ballSpeed = .003;//relative to window diameter
Config.ballSpeedConstant = true;//speed of balls does not change with collisions?

Config.ballRotation = 5;//in degrees per frame

Config.bgRotation = 2;//in degrees per frame

//minimal distance between balls when adding by clicking, relative to ballSize.
//set to 1 for no overlap
Config.distanceMin = .8;
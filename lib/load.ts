import $ from "jquery";
import Agent from "./agent";
import { MSAgent } from "./msagent";

let _maps = {};
let _sounds = {};
let _data = {};

export function load(
  name: MSAgent,
  successCb: (Agent) => void,
  failCb?: () => void,
  base_path?: string | undefined
) {
  base_path =
    base_path ||
    (window as any).CLIPPY_CDN ||
    "https://gitcdn.xyz/repo/pi0/clippyjs/master/assets/agents/";

  let path = base_path + name;
  let mapDfd = _loadMap(path);
  let agentDfd = _loadAgent(name, path);
  let soundsDfd = _loadSounds(name, path);

  let data;
  agentDfd.done(function (d) {
    data = d;
  });

  let sounds;

  soundsDfd.done(function (d) {
    sounds = d;
  });

  // wrapper to the success callback
  let cb = function () {
    let a = new Agent(path, data, sounds);
    successCb(a);
  };

  $.when(mapDfd, agentDfd, soundsDfd).done(cb).fail(failCb);
}

function _loadMap(path) {
  let dfd = _maps[path];
  if (dfd) return dfd;

  // set dfd if not defined
  dfd = _maps[path] = $.Deferred();

  let src = path + "/map.png";
  let img = new Image();

  img.onload = dfd.resolve;
  img.onerror = dfd.reject;

  // start loading the map;
  img.setAttribute("src", src);

  return dfd.promise();
}

function _loadSounds(name, path) {
  let dfd = _sounds[name];
  if (dfd) return dfd;

  // set dfd if not defined
  dfd = _sounds[name] = $.Deferred();

  let audio = document.createElement("audio");
  let canPlayMp3 =
    !!audio.canPlayType && "" !== audio.canPlayType("audio/mpeg");
  let canPlayOgg =
    !!audio.canPlayType &&
    "" !== audio.canPlayType('audio/ogg; codecs="vorbis"');

  if (!canPlayMp3 && !canPlayOgg) {
    dfd.resolve({});
  } else {
    let src = path + (canPlayMp3 ? "/sounds-mp3.js" : "/sounds-ogg.js");
    // load
    _loadScript(src);
  }

  return dfd.promise();
}

function _loadAgent(name, path) {
  let dfd = _data[name];
  if (dfd) return dfd;

  dfd = _getAgentDfd(name);

  let src = path + "/agent.js";

  _loadScript(src);

  return dfd.promise();
}

function _loadScript(src) {
  let script = document.createElement("script");
  script.setAttribute("src", src);
  script.setAttribute("async", "async");
  script.setAttribute("type", "text/javascript");

  document.head.appendChild(script);
}

function _getAgentDfd(name) {
  let dfd = _data[name];
  if (!dfd) {
    dfd = _data[name] = $.Deferred();
  }
  return dfd;
}

export function ready(name, data) {
  let dfd = _getAgentDfd(name);
  dfd.resolve(data);
}

export function soundsReady(name, data) {
  let dfd = _sounds[name];
  if (!dfd) {
    dfd = _sounds[name] = $.Deferred();
  }

  dfd.resolve(data);
}

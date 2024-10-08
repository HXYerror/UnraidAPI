import fs from "fs";
import { getUnraidDetails } from "../utils/Unraid";

export default function(req, res, next) {
  let servers = {};
  try {
    servers = JSON.parse(fs.readFileSync("config/servers.json"));
  } catch (e) {
    console.log("Failed to retrieve config file, creating new.");
    if (!fs.existsSync("config/")) {
      fs.mkdirSync("config/");
    }
    fs.writeFileSync("config/servers.json", JSON.stringify(servers, null, 2));
  }
  //TODO: why need this?
  if (
    (!req.headers.authorization ||
      Object.keys(req.headers.authorization).length <
        Object.keys(servers).length) &&
    process.env.KeyStorage !== "config"
  ) {
    let response = {};
    Object.keys(servers).forEach((ip) => {
      response[ip] = true;
    });
    res.send({ servers: response });
    return;
  }
  let response = {};
  response.servers = servers;

  if (!req.headers.authorization || req.headers.authorization.length <= 2
  ) {
    if(fs.existsSync('config/mqttKeys')){
      req.headers.authorization = fs.readFileSync(
        `${
          process.env.KeyStorage ? `${process.env.KeyStorage}/` : "secure/"
        }mqttKeys`
      );
    }else{
      console.log("plese login first in UI");
    }

  }

  getUnraidDetails(response.servers, JSON.parse(req.headers.authorization));
  response.status = 200;
  res.send(response);
}

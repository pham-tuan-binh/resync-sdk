import { NetworkAsCodeClient } from "network-as-code";
import DeviceIpv4Addr from "network-as-code/dist/@types/models/device";
import { Location } from "./node_modules/network-as-code/dist/@types/models/location";
import { Device } from "./node_modules/network-as-code/dist/@types/models/device";

import { IdentifierType, Identifier, Camera } from "./models/camera/types";
import CameraManager from "./models/camera/index";
import { CAMERA_CODEC, RESOLUTION } from "./models/camera/index";

// Begin by creating a client for Network as Code:
const manager: CameraManager = CameraManager.getInstance(
  "c95ca420afmsh7dfcd4b610a4a2cp11a55ajsnd0fbbec505bb",
  "192.129.1.1"
);

manager.addCamera(
  "Camera 1",
  "Front Door",
  "H.264",
  IdentifierType.NETWORK_ACCESS_ID,
  "f7403126-c4e2-45dd-89ed-9090a6f1ba43@testcsp.net"
);

let location = await manager.getCameraLocation("Camera 1");
console.log(location);

let session = await manager.createSession(
  "Camera 1",
  CAMERA_CODEC.PRORES_4444,
  RESOLUTION._4K,
  24,
  120
);

// let sessions = await manager.getSessions("Camera 1");
// let connectionStatus = await manager.getCameraStatus("Camera 1");
// console.log(connectionStatus);

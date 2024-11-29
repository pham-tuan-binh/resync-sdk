import { IdentifierType, Identifier, Camera } from "./types";
import { NetworkAsCodeClient } from "network-as-code";
import { Device } from "network-as-code/dist/@types/models/device";
import { QoDSession } from "network-as-code/dist/@types/models/session";

export enum CAMERA_CODEC {
  PRORES_422_HQ,
  PRORES_4444,
  PRORES_4444_XQ,
  ARRI_RAW,
}

export enum RESOLUTION {
  HD,
  _2K,
  UHD,
  _4K,
}

function calculateBitRate(
  codec: CAMERA_CODEC,
  resolution: RESOLUTION,
  framerate: number
): number {
  let base_rate = 0;
  let multiplier = 0;
  switch (codec) {
    case CAMERA_CODEC.PRORES_422_HQ:
      base_rate = 188 / 24;
      break;
    case CAMERA_CODEC.PRORES_4444:
      base_rate = 274 / 24;
    case CAMERA_CODEC.PRORES_4444_XQ:
      base_rate = 403 / 24;
    case CAMERA_CODEC.ARRI_RAW:
      return (2891 * framerate) / 24;

    default:
      return 0;
  }

  switch (resolution) {
    case RESOLUTION.HD:
      multiplier = 1;
      break;
    case RESOLUTION._2K:
      multiplier = 1.13;
      break;
    case RESOLUTION.UHD:
      multiplier = 4;
      break;
    case RESOLUTION._4K:
      multiplier = 4.55;
      break;
    default:
      return 0;
  }

  return base_rate * multiplier * framerate;
}

export default class CameraManager {
  private static instance: CameraManager;
  private apiKey: string;
  private client: NetworkAsCodeClient;
  private serverIP: string;
  private cameras: Camera[] = [];

  private constructor(apiKey: string, serverIP: string) {
    this.apiKey = apiKey;
    this.serverIP = serverIP;
    this.client = new NetworkAsCodeClient(apiKey);
  }

  public static getInstance(apiKey: string, serverIP: string): CameraManager {
    if (!CameraManager.instance) {
      CameraManager.instance = new CameraManager(apiKey, serverIP);
    }

    return CameraManager.instance;
  }

  // Add a camera to the list of cameras
  public addCamera(
    name: string,
    description: string,
    codec: string,
    indentification: Identifier
  ): boolean {
    let device: Device;

    device = this.client.devices.get({
      ...indentification,
    });

    const camera: Camera = {
      name,
      description,
      device: device,
      codec,
      status: {
        connectionStatus: false,
        footageSyncStatus: false,
        timeSyncStatus: false,
      },
      identification: indentification,
    };

    this.cameras.push(camera);

    return true;
  }

  // Get the list of cameras
  public getCameras(): Camera[] {
    return this.cameras;
  }

  // Get the location of a camera
  public async getCameraLocation(cameraName: string): Promise<Location | null> {
    const camera = this.cameras.find((camera) => camera.name === cameraName);

    if (!camera) {
      console.error(`Camera ${cameraName} not found`);
      return null;
    }

    return await camera.device.getLocation(3600);
  }

  // Calculate QoD Requirements for a camera
  public static calculateQoDRequirements(
    codec: CAMERA_CODEC,
    resolution: RESOLUTION,
    framerate: number
  ): string {
    let bitrate = calculateBitRate(codec, resolution, framerate);

    // Bandwidth categories (example thresholds, adjust as needed)
    const thresholds = {
      small: 2, // Mbps
      medium: 10, // Mbps
    };

    // Determine downlink and uplink categories
    let downlinkCategory: string = "S";
    let uplinkCategory: string;

    if (bitrate <= thresholds.small) {
      uplinkCategory = "S";
    } else if (bitrate <= thresholds.medium) {
      uplinkCategory = "M";
    } else {
      uplinkCategory = "L";
    }

    const qosProfile = `QOS_${uplinkCategory}`;

    return qosProfile;
  }

  // Create a session for a camera
  public async createSession(
    cameraName: string,
    codec: CAMERA_CODEC,
    resolution: RESOLUTION,
    framerate: number,
    duration: number,
    destinationIP: string
  ): Promise<boolean> {
    const camera = this.cameras.find((camera) => camera.name === cameraName);

    if (!camera) {
      console.error(`Camera ${cameraName} not found`);
      return false;
    }

    let profile = CameraManager.calculateQoDRequirements(
      codec,
      resolution,
      framerate
    );
    const session = await camera.device.createQodSession(profile, {
      serviceIpv4: destinationIP,
      duration: duration,
    });

    console.log(session);

    if (!session) {
      console.error(`Failed to create session for camera ${cameraName}`);
      return false;
    }
    console.log(profile);

    return true;
  }

  // Extend a session for a camera
  public async extendSession(
    cameraName: string,
    sessionID: string,
    additionalDuration: number
  ): Promise<boolean> {
    const camera = this.cameras.find((camera) => camera.name === cameraName);

    if (!camera) {
      console.error(`Camera ${cameraName} not found`);
      return false;
    }

    const session: QoDSession = (await camera.device.sessions()).find(
      (session: QoDSession) => session.id === sessionID
    );

    if (!session) {
      console.error(`Session ${sessionID} not found for camera ${cameraName}`);
      return false;
    }

    await session.extendSession(additionalDuration);

    return true;
  }

  // Get sessions of a camera
  public async getSessions(cameraName: string): Promise<QoDSession[]> {
    const camera = this.cameras.find((camera) => camera.name === cameraName);

    if (!camera) {
      console.error(`Camera ${cameraName} not found`);
      return [];
    }

    return camera.device.sessions();
  }

  // Get a session
  public async getSession(
    cameraName: string,
    sessionID: string
  ): Promise<QoDSession | null> {
    const camera = this.cameras.find((camera) => camera.name === cameraName);

    if (!camera) {
      console.error(`Camera ${cameraName} not found`);
      return null;
    }

    return (await camera.device.sessions()).find(
      (session: QoDSession) => session.id === sessionID
    );
  }

  // Terminate All Sessions of a camera
  public async terminateAllSessions(cameraName: string): Promise<boolean> {
    const camera = this.cameras.find((camera) => camera.name === cameraName);

    if (!camera) {
      console.error(`Camera ${cameraName} not found`);
      return false;
    }

    await camera.device.clearSessions();

    return true;
  }

  // Terminate A Session of a camera
  public async terminateSession(
    cameraName: string,
    sessionID: string
  ): Promise<boolean> {
    const camera = this.cameras.find((camera) => camera.name === cameraName);

    if (!camera) {
      console.error(`Camera ${cameraName} not found`);
      return false;
    }

    const session: QoDSession = (await camera.device.sessions()).find(
      (session: QoDSession) => session.id === sessionID
    );

    if (!session) {
      console.error(`Session ${sessionID} not found for camera ${cameraName}`);
      return false;
    }

    await session.deleteSession();

    return true;
  }

  // Get current status of a camera
  public async getCameraStatus(cameraName: string): Promise<string> {
    const camera = this.cameras.find((camera) => camera.name === cameraName);

    if (!camera) {
      console.error(`Camera ${cameraName} not found`);
      return "Camera not found";
    }

    return camera.device.getConnectivity();
  }
}

import { NetworkAsCodeClient } from "network-as-code";

// Begin by creating a client for Network as Code:
const client = new NetworkAsCodeClient(
  "55a571a12fmshb56561847910e1cp19f85ejsn44ae4c9a5418"
);

// "device@testcsp.net" should be replaced
// with a test device copied from your Developer Sandbox
// Or you can identify a device with its ID,
// IP address(es) and optionally, a phone number
const myDevice = client.devices.get({
  ipv4Address: {
    publicAddress: "217.140.216.39",
    privateAddress: "217.140.216.39",
  },
  // The phone number does not accept spaces or parentheses
  phoneNumber: "+358311100539",
});

const mySession = await myDevice.createQodSession("QOS_M", {
  serviceIpv4: "217.140.216.29",
  // We create the session for 3600 seconds, so up to an hour
  duration: 3600,
});

// Let's confirm that the device has the newly created session
console.log(await myDevice.sessions());

// // Finally, remember to clear out the sessions for the device
// myDevice.clearSessions();

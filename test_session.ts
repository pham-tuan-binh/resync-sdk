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
  networkAccessIdentifier: "9784e2b9-fe9e-48c9-9ca1-2ecb9338049e@testcsp.net",
});

const mySession = await myDevice.createQodSession("DOWNLINK_L_UPLINK_L", {
  serviceIpv4: "233.252.0.2",
  serviceIpv6: "2001:db8:1234:5678:9abc:def0:fedc:ba98",
  // We create the session for 3600 seconds, so up to an hour
  duration: 3600,
});

// Let's confirm that the device has the newly created session
console.log(await myDevice.sessions());

// Finally, remember to clear out the sessions for the device
myDevice.clearSessions();

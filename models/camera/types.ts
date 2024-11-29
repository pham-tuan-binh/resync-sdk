import { NetworkAsCodeClient } from 'network-as-code';
import DeviceIpv4Addr from 'network-as-code/dist/@types/models/device';
import { Location } from 'network-as-code/dist/@types/models/location';
import { Device } from 'network-as-code/dist/@types/models/device';

export enum IdentifierType {
    NETWORK_ACCESS_ID,
    IP_V4,
    IP_V6,
    PHONE_NUMBER
}

export type Identifier = string | DeviceIpv4Addr;

export type Camera = {
    name: string,
    description: string,
    device: Device,
    codec: string,
    status: {
        connectionStatus: boolean,
        footageSyncStatus: boolean,
        timeSyncStatus: boolean,
    },
    identifierType: IdentifierType,
    identification: Identifier
}
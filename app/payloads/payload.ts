import { ARF8084BAPayload } from './ARF8084BAPayload'
import  { RHF1S001Payload } from './RHF1S001Payload'

export interface Payload{
    createdAt: Date;
    payloadType: PayloadType;
};

export enum PayloadType {
  ARF8084BA = <any> ARF8084BAPayload,
  RHF1S001 = <any> RHF1S001Payload,
}
import type Long from "long";

export interface Asset {
  asset: string;
  balance: Long | string;
}

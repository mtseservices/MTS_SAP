import pakistaniBanksJson from '../data/pakistaniBanks.json';

export interface PakistaniBankInfo {
  id?: string;
  name: string;
  code: string;
  swiftCode: string;
  sbpCode?: string;
  ibanPrefix?: string;
  category?: string;
  helpline?: string;
}

export const PAKISTANI_BANKS_LIST: PakistaniBankInfo[] = pakistaniBanksJson as PakistaniBankInfo[];

export function findPakistaniBankByCode(code: string): PakistaniBankInfo | undefined {
  return PAKISTANI_BANKS_LIST.find(
    (b) => b.code.toLowerCase() === code.toLowerCase() || b.id === code.toLowerCase()
  );
}

export function findPakistaniBankByName(name: string): PakistaniBankInfo | undefined {
  return PAKISTANI_BANKS_LIST.find(
    (b) => b.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(b.name.toLowerCase())
  );
}

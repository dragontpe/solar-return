import SwissEPH from 'sweph-wasm';

type SweInstance = Awaited<ReturnType<typeof SwissEPH.init>>;

let _swe: SweInstance | null = null;

export async function getSwe(): Promise<SweInstance> {
  if (!_swe) {
    _swe = await SwissEPH.init();
  }
  return _swe;
}

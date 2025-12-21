import * as CryptoES from 'crypto-es';
import { supabase } from './supabase';

export async function testServerVault(masterKey: string) {
  try {
    const { data, error } = await supabase.from('passwords').select('*');
    if (error) throw error;

    let total = (data || []).length;
    let success = 0;
    let fail = 0;

    (data || []).forEach((item: any) => {
      try {
        const bytes = CryptoES.AES.decrypt(item.encrypted_value, masterKey);
        // @ts-ignore
        const decryptedText = bytes.toString(CryptoES.Utf8 || CryptoES.enc.Utf8);
        if (decryptedText) success++; else fail++;
      } catch (e) {
        fail++;
      }
    });

    return { total, success, fail };
  } catch (e: any) {
    throw e;
  }
}

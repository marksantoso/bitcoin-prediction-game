import { apiClient } from '../lib/apiClient';
import { BitcoinService } from '@/services/bitcoin';

// Export service instances
export const bitcoinService = new BitcoinService(apiClient);

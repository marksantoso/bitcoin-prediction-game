import { apiClient } from '../../lib/apiClient'
import { API_CONFIG, getVersionedEndpoint, ApiVersion } from '@/config/api'

interface IApiClient {
	get(url: string): Promise<any>;
	post(url: string, data: any): Promise<any>;
}

export class BitcoinService {
	private version: ApiVersion

	constructor(
		private apiClient: IApiClient,
		version: ApiVersion = API_CONFIG.CURRENT_VERSION
	) {
		this.version = version
	}

	async getActiveGuess(userId: string) {
		const endpoint = getVersionedEndpoint(API_CONFIG.ENDPOINTS.ACTIVE_GUESS, this.version)
		return this.apiClient.get(`${endpoint}?userId=${userId}`)
	}

	async getUserScore(userId: string) {
		const endpoint = getVersionedEndpoint(API_CONFIG.ENDPOINTS.SCORE, this.version)
		return await this.apiClient.get(`${endpoint}?userId=${userId}`)
	}

	async getBitcoinPrice() {
		const endpoint = getVersionedEndpoint(API_CONFIG.ENDPOINTS.BTC_PRICE, this.version)
		return this.apiClient.get(`${endpoint}`)
	}

	async makeGuess(userId: string, direction: 'up' | 'down', currentPrice: number) {
		const endpoint = getVersionedEndpoint(API_CONFIG.ENDPOINTS.MAKE_GUESS, this.version)
		return this.apiClient.post(endpoint, {
			userId,
			direction,
			currentPrice
		})
	}

	async resolveGuess(userId: string, guessId: string, currentPrice: number) {
		const endpoint = getVersionedEndpoint(API_CONFIG.ENDPOINTS.RESOLVE_GUESS, this.version)
		return this.apiClient.post(endpoint, {
			userId,
			guessId,
			currentPrice
		})
	}
}

// Export a singleton instance
export const bitcoinService = new BitcoinService(apiClient)

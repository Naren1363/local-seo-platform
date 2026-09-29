import { BusinessRepository, FullBusiness } from '../repositories/businessRepository.js';
import { GeocodingService } from './geocodingService.js';

export interface CreateBusinessDTO {
  userId: string;
  name: string;
  website_url: string;
  category: string;
  address: string;
  city: string;
  state: string;
  country: string;
  target_keywords?: string[];
}

export class BusinessService {
  static async createBusiness(dto: CreateBusinessDTO): Promise<FullBusiness> {
    if (!dto.name || !dto.address || !dto.city || !dto.state || !dto.country) {
      throw new Error('Business name, address, city, state, and country are required.');
    }

    // Geocode address to lat/lng
    const geocode = await GeocodingService.geocodeAddress({
      address: dto.address,
      city: dto.city,
      state: dto.state,
      country: dto.country,
    });

    const fullBusiness = await BusinessRepository.createBusiness(
      {
        user_id: dto.userId,
        name: dto.name,
        website_url: dto.website_url,
        category: dto.category,
        target_keywords: dto.target_keywords || [],
      },
      {
        address: dto.address,
        city: geocode.city,
        state: geocode.state,
        country: geocode.country,
        latitude: geocode.latitude,
        longitude: geocode.longitude,
        formatted_address: geocode.formatted_address,
        place_id: geocode.place_id,
      }
    );

    return fullBusiness;
  }

  static async getUserBusinesses(userId: string): Promise<FullBusiness[]> {
    return BusinessRepository.findByUserId(userId);
  }

  static async getBusinessById(businessId: string): Promise<FullBusiness | null> {
    return BusinessRepository.findById(businessId);
  }
}

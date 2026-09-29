import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { BusinessService } from '../services/businessService.js';
import { NearbyService } from '../services/nearbyService.js';

export class NearbyController {
  static async getNearbyPlaces(req: AuthenticatedRequest, res: Response) {
    try {
      const { businessId, radius } = req.query;
      if (!businessId) {
        return res.status(400).json({ error: 'businessId query parameter is required.' });
      }

      const radiusKm = radius ? parseFloat(radius as string) : 5; // Default 5 km

      const fullBusiness = await BusinessService.getBusinessById(businessId as string);
      if (!fullBusiness) {
        return res.status(404).json({ error: 'Business not found.' });
      }

      const places = await NearbyService.discoverNearbyPlaces({
        latitude: fullBusiness.location.latitude,
        longitude: fullBusiness.location.longitude,
        radiusKm,
        userCategory: fullBusiness.business.category,
      });

      return res.json({
        businessLocation: fullBusiness.location,
        userBusiness: fullBusiness.business,
        radiusKm,
        totalFound: places.length,
        places,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

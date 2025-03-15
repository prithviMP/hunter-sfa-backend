import prisma from '../core/database/prisma';

/**
 * Interface for geographical coordinates
 */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * Interface for distance calculation result
 */
export interface GeoDistance {
  distance: number; // in meters
  point: GeoPoint;
}

/**
 * Convert a GeoPoint to PostGIS point format
 * @param point GeoPoint with latitude and longitude
 * @returns PostGIS POINT string format
 */
export const toPostGISPoint = (point: GeoPoint): string => {
  return `POINT(${point.longitude} ${point.latitude})`;
};

/**
 * Convert a PostGIS point string to GeoPoint
 * @param pointString PostGIS POINT string format
 * @returns GeoPoint object or null if invalid
 */
export const fromPostGISPoint = (pointString: string | null): GeoPoint | null => {
  if (!pointString) return null;
  
  // Extract coordinates from POINT(longitude latitude) format
  const match = pointString.match(/POINT\(([^ ]+) ([^)]+)\)/);
  if (match && match.length === 3) {
    return {
      longitude: parseFloat(match[1]),
      latitude: parseFloat(match[2]),
    };
  }
  return null;
};

/**
 * Calculate nearby companies based on a given point and radius
 * @param point GeoPoint containing latitude and longitude
 * @param radiusMeters Search radius in meters
 * @returns Array of companies with distance information
 */
export const findNearbyCompanies = async (
  point: GeoPoint, 
  radiusMeters: number = 5000 // Default 5 km
): Promise<any[]> => {
  const pointText = toPostGISPoint(point);
  
  // Use raw query since Prisma doesn't directly support PostGIS operations
  const companies = await prisma.$queryRaw<any[]>`
    SELECT 
      c.id, 
      c.name, 
      c.type,
      c.address,
      c.city,
      c.state,
      c.location,
      ST_Distance(
        ST_SetSRID(ST_GeomFromText(${pointText}), 4326)::geography, 
        ST_SetSRID(ST_GeomFromText(c.location), 4326)::geography
      ) as distance
    FROM "Company" c
    WHERE 
      c.location IS NOT NULL AND
      c.is_active = true AND
      ST_DWithin(
        ST_SetSRID(ST_GeomFromText(${pointText}), 4326)::geography,
        ST_SetSRID(ST_GeomFromText(c.location), 4326)::geography,
        ${radiusMeters}
      )
    ORDER BY distance
    LIMIT 100
  `;
  
  // Convert PostGIS points to GeoPoints
  return companies.map(company => ({
    ...company,
    geoPoint: fromPostGISPoint(company.location),
    distance: company.distance // in meters
  }));
};

/**
 * Check if a point is within an area boundary
 * @param point GeoPoint to check
 * @param areaId ID of the area to check against
 * @returns Boolean indicating if point is within area
 */
export const isPointInArea = async (point: GeoPoint, areaId: string): Promise<boolean> => {
  const pointText = toPostGISPoint(point);
  
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      a.id
    FROM "Area" a
    WHERE 
      a.id = ${areaId} AND
      a.boundary IS NOT NULL AND
      ST_Contains(
        ST_GeomFromText(a.boundary, 4326),
        ST_GeomFromText(${pointText}, 4326)
      )
    LIMIT 1
  `;
  
  return result.length > 0;
};

/**
 * Calculate distance between two points
 * @param point1 First GeoPoint
 * @param point2 Second GeoPoint
 * @returns Distance between points in meters
 */
export const calculateDistance = async (point1: GeoPoint, point2: GeoPoint): Promise<number> => {
  const point1Text = toPostGISPoint(point1);
  const point2Text = toPostGISPoint(point2);
  
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      ST_Distance(
        ST_SetSRID(ST_GeomFromText(${point1Text}), 4326)::geography, 
        ST_SetSRID(ST_GeomFromText(${point2Text}), 4326)::geography
      ) as distance
  `;
  
  return result[0]?.distance || 0;
}; 
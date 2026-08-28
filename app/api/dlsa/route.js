import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const stateParam = searchParams.get("state");
    const queryParam = searchParams.get("query");

    let offices = [];

    // If coordinates are provided, perform a PostGIS distance query
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);

      if (isNaN(lat) || isNaN(lng)) {
        return Response.json({
          success: false,
          error: "Invalid coordinates specified."
        }, { status: 400 });
      }

      // ST_Distance geography calculation returns distance in meters, dividing by 1000 converts to kilometers
      offices = await prisma.$queryRaw`
        SELECT id, name, address, phone, latitude, longitude, state, district,
               ST_Distance(
                 ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
                 ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
               ) / 1000.0 as distance
        FROM "DLSAOffice"
        ORDER BY distance ASC
        LIMIT 10
      `;
      
      // Clean up the BigInt distance values returned by raw queries if any, converting them to numbers
      offices = offices.map(o => ({
        ...o,
        distance: o.distance ? parseFloat(o.distance) : null
      }));

    } else {
      // Fallback: standard filtering query
      let whereClause = {};

      if (stateParam) {
        whereClause.state = { contains: stateParam, mode: "insensitive" };
      }

      if (queryParam) {
        whereClause.OR = [
          { name: { contains: queryParam, mode: "insensitive" } },
          { address: { contains: queryParam, mode: "insensitive" } },
          { district: { contains: queryParam, mode: "insensitive" } }
        ];
      }

      offices = await prisma.dLSAOffice.findMany({
        where: whereClause,
        take: 10
      });
    }

    return Response.json({
      success: true,
      offices
    }, { status: 200 });

  } catch (error) {
    console.warn("PostGIS query failed or was not supported, falling back to standard query:", error.message);
    
    // Fallback: If PostGIS query fails (e.g. if the local dev DB is not PostGIS-enabled), query normally
    try {
      const { searchParams } = new URL(request.url);
      const queryParam = searchParams.get("query");
      const stateParam = searchParams.get("state");

      let whereClause = {};

      if (stateParam) {
        whereClause.state = { contains: stateParam, mode: "insensitive" };
      }

      if (queryParam) {
        whereClause.OR = [
          { name: { contains: queryParam, mode: "insensitive" } },
          { address: { contains: queryParam, mode: "insensitive" } },
          { district: { contains: queryParam, mode: "insensitive" } }
        ];
      }

      const fallbackOffices = await prisma.dLSAOffice.findMany({
        where: whereClause,
        take: 10
      });

      return Response.json({
        success: true,
        offices: fallbackOffices,
        fallback: true
      }, { status: 200 });

    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError);
      return Response.json({
        success: false,
        error: "Database query failed.",
        details: fallbackError.message
      }, { status: 500 });
    }
  }
}

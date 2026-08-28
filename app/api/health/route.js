import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Execute a simple raw SQL query to test connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error("Database health check failed:", error);
    
    return Response.json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

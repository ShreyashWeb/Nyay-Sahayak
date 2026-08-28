import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { categoryId } = params;

    const templateData = await prisma.complaintTemplate.findFirst({
      where: { categoryId }
    });

    if (!templateData) {
      return Response.json({
        success: false,
        error: "Complaint template for this category not found."
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      template: templateData
    }, { status: 200 });

  } catch (error) {
    console.error("Fetch Template API error:", error);
    return Response.json({
      success: false,
      error: "Internal server error while retrieving template.",
      details: error.message
    }, { status: 500 });
  }
}

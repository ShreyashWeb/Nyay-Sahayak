import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Fetch case details including category and linked drafts
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        category: true,
        drafts: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!caseData) {
      return Response.json({
        success: false,
        error: "Case file not found."
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      case: caseData
    }, { status: 200 });

  } catch (error) {
    console.error("Fetch Case API error:", error);
    return Response.json({
      success: false,
      error: "Internal server error while fetching case file.",
      details: error.message
    }, { status: 500 });
  }
}

// PATCH: Allow user to manually change/correct the Case category classification
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { categoryId } = body;

    if (!categoryId) {
      return Response.json({
        success: false,
        error: "New categoryId parameter is required."
      }, { status: 400 });
    }

    // Verify category exists
    const categoryExists = await prisma.legalCategory.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      return Response.json({
        success: false,
        error: "Invalid categoryId specified. Category does not exist."
      }, { status: 400 });
    }

    // Update case
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        categoryId: categoryId
      },
      include: {
        category: true
      }
    });

    // Also update category references inside drafts if needed (to keep draft sync)
    const latestDraft = await prisma.complaintDraft.findFirst({
      where: { caseId: id },
      orderBy: { createdAt: "desc" }
    });

    if (latestDraft) {
      const draftData = latestDraft.draftData;
      // Inject updated category metadata
      draftData.categoryName = categoryExists.name;
      draftData.categoryId = categoryId;
      
      await prisma.complaintDraft.update({
        where: { id: latestDraft.id },
        data: { draftData }
      });
    }

    return Response.json({
      success: true,
      case: updatedCase
    }, { status: 200 });

  } catch (error) {
    console.error("Update Case API error:", error);
    return Response.json({
      success: false,
      error: "Internal server error during case update.",
      details: error.message
    }, { status: 500 });
  }
}

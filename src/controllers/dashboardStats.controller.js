import Contest from "../models/Contest.model.js";

export const dashboardStats = async (req, res) => {
  try {
    const stats = await Contest.aggregate([
      {
        $facet: {
          /* =======================
             BASIC STATS
          ======================= */

          totalContests: [{ $count: "count" }],

          activeContests: [
            { $match: { status: "approved" } },
            { $count: "count" },
          ],

          contestStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],

          totalParticipants: [
            {
              $project: {
                count: { $size: "$participants" },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$count" },
              },
            },
          ],

          pendingSubmissions: [
            { $unwind: "$participants" },
            {
              $match: {
                "participants.submissionUrl": { $exists: false },
              },
            },
            { $count: "count" },
          ],

          monthlyStats: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                contests: { $sum: 1 },
                participants: {
                  $sum: { $size: "$participants" },
                },
              },
            },
            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1,
              },
            },
            {
              $project: {
                _id: 0,
                month: {
                  $concat: [
                    {
                      $arrayElemAt: [
                        [
                          "",
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ],
                        "$_id.month",
                      ],
                    },
                  ],
                },
                contests: 1,
                participants: 1,
              },
            },
          ],
        },
      },
    ]);

    const data = stats[0];

    res.json({
      totalContests: data.totalContests[0]?.count || 0,
      activeContests: data.activeContests[0]?.count || 0,
      totalParticipants: data.totalParticipants[0]?.total || 0,
      pendingSubmissions: data.pendingSubmissions[0]?.count || 0,
      contestStatus: data.contestStatus,
      monthlyStats: data.monthlyStats, // 🔥 THIS is for Overall Statistics chart
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard stats error", err });
  }
};

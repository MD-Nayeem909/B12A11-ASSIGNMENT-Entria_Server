import mongoose from "mongoose";
import Contest from "../models/Contest.model.js";
import User from "../models/User.model.js";
import WinnerModel from "../models/Winner.model.js";

/* Create contest (creator or admin) */
export const createContest = async (req, res) => {
  try {
    const body = req.body;
    // req.user contains server JWT payload {id, email, role}
    // For creator role, ensure creatorId is firebaseUID stored in user doc
    const creator = await User.findById(req.user.id);
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    const contestData = {
      title: body.title,
      description: body.description,
      image: body.image,
      type: body.type,
      price: body.price || 0,
      prize: body.prize,
      instruction: body.instruction,
      deadline: body.deadline,
      creatorId: creator.firebaseUID,
    };

    const contest = await Contest.create(contestData);
    res.status(201).json(contest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* List contests with pagination + filter + sort */
export const listContests = async (req, res) => {
  try {
    let { q, type, status, sortBy, participated } = req.query;

    
    
    if (participated) {
      const user = await User.findOne({ firebaseUID: participated });
      if (!user) return res.status(404).json({ message: "User not found" });
      participated = user._id;
    }
    const filter = {};
    if (q) filter.title = { $regex: q, $options: "i" };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (participated)
      filter["participants.userId"] = new mongoose.Types.ObjectId(participated);

    let query = Contest.find(filter).populate({
      path: "winner.userId",
      select: "name email image",
    });

    if (sortBy === "participants") query = query.sort({ participants: -1 });
    else if (sortBy === "newest") query = query.sort({ createdAt: -1 });
    else query = query.sort({ createdAt: -1 });

    const [results, total] = await Promise.all([
      query.exec(),
      Contest.countDocuments(filter),
    ]);
    res.json({ total, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Approve contest (admin) */
export const manageContest = async (req, res) => {
  try {
    const stats = ["pending", "reject", "complete", "confirm"];
    const { id } = req.params;
    let { status } = req.query;
    if (!stats.includes(status))
      return res.status(400).json({ message: "Invalid status" });
    if (status === "reject") {
      status = "rejected";
    } else if (status === "confirm") {
      status = "approved";
    }
    const updated = await Contest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* Delete contest (admin) */
export const deleteContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    await contest.deleteOne();
    res.json({ message: "Contest deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* Join contest (user pays on frontend, then backend registers participant) */
export const joinContest = async (req, res) => {
  try {
    const { id } = req.params;
    // user identity from req.user -> find firebaseUID
    const currentUser = await User.findById(req.user.id);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    if (contest.status !== "approved")
      return res.status(400).json({ message: "Contest not open for joining" });

    // Prevent double join
    const already = contest.participants.find(
      (p) => p.userId === currentUser.firebaseUID
    );
    if (already) return res.status(400).json({ message: "Already joined" });

    contest.participants.push({
      userId: currentUser.firebaseUID,
      submittedAt: null,
    });
    await contest.save();

    // Add to user's joinedContests
    currentUser.joinedContests.push(contest._id);
    await currentUser.save();

    res.json({ message: "Joined successfully", contest });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* Submit task: add submissionUrl to participant record */
export const submitTask = async (req, res) => {
  try {
    const { id } = req.params; // contest id
    const { submission } = req.body;
    const currentUser = await User.findById(req.user.id);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const participant = contest.participants.find((p) =>
      p.userId.equals(currentUser._id)
    );
    console.log(contest.participants);
    console.log(currentUser._id);

    if (!participant)
      return res.status(400).json({ message: "Not registered for contest" });

    participant.submission = submission;
    participant.submittedAt = new Date();
    await contest.save();

    res.json({ message: "Submission recorded" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getContestSubmissions = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id)
      .populate({
        path: "participants.userId",
        select: "name email image",
      })
      .select("title participants winner"); // extra data কমাতে

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    res.json(contest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Declare winner (creator or admin) */
// export const declareWinner = async (req, res) => {
//   try {
//     const { id } = req.params; // contest id
//     const { winnerUserId } = req.body;
//     const contest = await Contest.findById(id);
//     if (!contest) return res.status(404).json({ message: "Contest not found" });

//     // Ensure deadline passed or requester is admin
//     const now = new Date();
//     if (new Date(contest.deadline) > now) {
//       return res
//         .status(400)
//         .json({ message: "Cannot declare before deadline" });
//     }

//     contest.winner = { userId: winnerUserId, announcedAt: new Date() };
//     contest.status = "completed";

//     // increment user's wins
//     const winnerUser = await User.findOne({ _id: winnerUser._Id });
//     if (winnerUser) {
//       winnerUser.totalWins = (winnerUser.totalWins || 0) + 1;
//       winnerUser.wonContests.push(contest._id);
//       await winnerUser.save();
//     }
//     await WinnerModel.create({
//       winner: winnerUser._Id,
//       contest: id,
//       prizeMoney: contest.prize,
//     });
//     await contest.save();

//     res.json({ message: "Winner declared", contest });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const declareWinner = async (req, res) => {
  try {
    const { id } = req.params; // contestId
    const { winnerUserId } = req.body;

    if (!winnerUserId) {
      return res.status(400).json({ message: "Winner userId required" });
    }

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // ❌ already completed
    if (contest.status === "completed") {
      return res.status(400).json({ message: "Winner already declared" });
    }

    // ⏳ deadline check (admin bypass)
    const now = new Date();
    if (new Date(contest.deadline) > now) {
      return res
        .status(400)
        .json({ message: "Cannot declare winner before deadline" });
    }

    // ✅ validate participant
    const isParticipant = contest.participants.some(
      (p) => p.userId.toString() === winnerUserId
    );

    if (!isParticipant) {
      return res
        .status(400)
        .json({ message: "User did not participate in this contest" });
    }

    // 🏆 set winner
    contest.winner = {
      userId: winnerUserId,
      announcedAt: new Date(),
    };
    contest.status = "completed";

    // 👤 update user
    const winnerUser = await User.findById(winnerUserId);
    if (!winnerUser) {
      return res.status(404).json({ message: "Winner user not found" });
    }

    winnerUser.totalWins = (winnerUser.totalWins || 0) + 1;
    winnerUser.wonContests.push(contest._id);
    await winnerUser.save();

    // 🥇 winner collection
    await WinnerModel.create({
      winner: winnerUser._id,
      contest: contest._id,
      prizeMoney: contest.prize,
    });

    await contest.save();

    res.json({
      message: "Winner declared successfully",
      contest,
    });
  } catch (err) {
    console.error("DECLARE WINNER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Get top winners (admin) */
export const getTopWinners = async (req, res) => {
  try {
    const winners = await WinnerModel.aggregate([
      // 1️⃣ Contest join
      {
        $lookup: {
          from: "contests",
          localField: "contest",
          foreignField: "_id",
          as: "contestInfo",
        },
      },
      { $unwind: "$contestInfo" },

      // 2️⃣ Group by winner
      {
        $group: {
          _id: "$winner",

          totalWins: { $sum: 1 },
          totalPrize: { $sum: "$prizeMoney" },

          contests: {
            $push: {
              contestId: "$contestInfo._id",
              title: "$contestInfo.title",
              image: "$contestInfo.image",
              prize: "$contestInfo.prize",
            },
          },
        },
      },

      // 3️⃣ Sort (most wins first)
      {
        $sort: { totalWins: -1, totalPrize: -1 },
      },

      // 4️⃣ Join User
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // 5️⃣ Final shape
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          image: "$user.image",

          totalWins: 1,
          totalPrize: 1,

          contests: 1, // 🔥 title + image here
        },
      },
    ]);

    res.json(winners);
  } catch (err) {
    console.error("GET TOP WINNERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

export const getMyWinnerContests = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) return res.status(400).json({ message: "User ID required" });
    const winnerContests = await WinnerModel.find({ winner: id })
      .populate("contest", "title")
      .populate("winner", "name");
    res.json({ message: "My winner contests", winnerContests });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getLeaderboardStats = async (req, res) => {
  try {
    // 1️⃣ Total Prize Money Awarded
    const totalPrizeResult = await WinnerModel.aggregate([
      {
        $group: {
          _id: null,
          totalPrizeMoney: { $sum: "$prizeMoney" },
        },
      },
    ]);

    const totalPrizeMoney = totalPrizeResult[0]?.totalPrizeMoney || 0;

    // 2️⃣ Total Winners Count
    const totalWinners = await WinnerModel.countDocuments();

    // 3️⃣ Active Contests Count
    const activeContests = await Contest.countDocuments({
      status: "approved",
      deadline: { $gt: new Date() },
    });

    res.json({
      totalPrizeMoney,
      totalWinners,
      activeContests,
    });
  } catch (error) {
    console.error("LEADERBOARD STATS ERROR:", error);
    res.status(500).json({ message: "Failed to load stats" });
  }
};


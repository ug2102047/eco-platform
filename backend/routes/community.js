const express = require('express');
const Post = require('../models/Post');
const UserChallenge = require('../models/UserChallenge');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// ==========================================================
// 📝 POST ROUTES
// ==========================================================

// POST /api/community/posts - Create a new post
router.post('/posts', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Post content is required' });
    }

    const newPost = new Post({
      user: req.user.userId,
      content: content.trim()
    });

    await newPost.save();

    // Populate user details before returning
    const populatedPost = await Post.findById(newPost._id)
      .populate('user', 'username email')
      .populate('likes', 'username email')
      .populate('comments.userId', 'username email');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    console.error('Error creating post:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/community/posts - Fetch all posts
router.get('/posts', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username email')
      .populate('likes', 'username email')
      .populate('comments.userId', 'username email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/community/posts/:id/like - Toggle like on a post
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user already liked the post
    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // Add like
      post.likes.push(userId);
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    // Populate user details before returning
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username email')
      .populate('likes', 'username email')
      .populate('comments.userId', 'username email');

    res.json({ success: true, data: populatedPost });
  } catch (error) {
    console.error('Error toggling like:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/community/posts/:id/comment - Add a comment to a post
router.post('/posts/:id/comment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Add comment to post
    post.comments.push({
      userId: userId,
      text: text.trim()
    });

    await post.save();

    // Populate user details before returning
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username email')
      .populate('likes', 'username email')
      .populate('comments.userId', 'username email');

    res.json({ success: true, data: populatedPost });
  } catch (error) {
    console.error('Error adding comment:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ==========================================================
// 🏆 CHALLENGE ROUTES
// ==========================================================

// POST /api/community/challenges/accept - Accept or update a challenge
router.post('/challenges/accept', auth, async (req, res) => {
  try {
    const { challengeId, status } = req.body;
    
    if (!challengeId) {
      return res.status(400).json({ success: false, message: 'Challenge ID is required' });
    }

    const userId = req.user.userId;

    // Define challenge points mapping
    const challengePointsMap = {
      '1': 50,  // No Plastic Straws Week
      '2': 100, // Commute by Bicycle Today
      '3': 75   // Zero Waste Day Challenge
    };

    const challengePoints = challengePointsMap[challengeId] || 0;

    // Check if user already has this challenge
    let userChallenge = await UserChallenge.findOne({ user: userId, challengeId });

    if (userChallenge) {
      // Update existing challenge
      const previousStatus = userChallenge.status;
      if (status && ['active', 'completed'].includes(status)) {
        userChallenge.status = status;
      }
      await userChallenge.save();

      // Award points when status changes to 'completed' from non-completed
      if (status === 'completed' && previousStatus !== 'completed' && challengePoints > 0) {
        await User.findByIdAndUpdate(
          userId,
          [
            { $set: { points: { $ifNull: ['$points', 0] } } },
            { $inc: { points: challengePoints } }
          ],
          { new: true }
        );
      }
      
      // Award points for accepting challenge if not already awarded
      // Check if this user already has points for this challenge by examining their total points
      // If the challenge is being set to active and wasn't before, award points
      if (status === 'active' && previousStatus !== 'active' && challengePoints > 0) {
        await User.findByIdAndUpdate(
          userId,
          [
            { $set: { points: { $ifNull: ['$points', 0] } } },
            { $inc: { points: challengePoints } }
          ],
          { new: true }
        );
      }
    } else {
      // Create new challenge acceptance
      userChallenge = new UserChallenge({
        user: userId,
        challengeId,
        status: status || 'active'
      });
      await userChallenge.save();

      // Award points immediately upon accepting the challenge
      if (challengePoints > 0) {
        await User.findByIdAndUpdate(
          userId,
          [
            { $set: { points: { $ifNull: ['$points', 0] } } },
            { $inc: { points: challengePoints } }
          ],
          { new: true }
        );
      }
    }

    // Populate user details before returning
    const populatedChallenge = await UserChallenge.findById(userChallenge._id)
      .populate('user', 'username email');

    res.status(201).json({ 
      success: true, 
      data: populatedChallenge,
      challengeId: userChallenge.challengeId,
      status: userChallenge.status
    });
  } catch (error) {
    console.error('Error accepting challenge:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/community/challenges - Get all accepted challenges for the logged-in user
router.get('/challenges', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    const query = { user: userId };
    if (status && ['active', 'completed'].includes(status)) {
      query.status = status;
    }

    const challenges = await UserChallenge.find(query)
      .populate('user', 'username email')
      .sort({ acceptedAt: -1 });

    res.json({ success: true, data: challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/community/leaderboard - Get top 3 users by points
router.get('/leaderboard', auth, async (req, res) => {
  try {
    // Define challenge points mapping
    const challengePointsMap = {
      '1': 50,  // No Plastic Straws Week
      '2': 100, // Commute by Bicycle Today
      '3': 75   // Zero Waste Day Challenge
    };

    // Get all users
    const allUsers = await User.find()
      .select('username email points')
      .lean();

    // Calculate dynamic points for each user based on their accepted challenges
    const usersWithCalculatedPoints = await Promise.all(
      allUsers.map(async (user) => {
        // Get all accepted challenges for this user
        const userChallenges = await UserChallenge.find({ user: user._id });
        
        // Calculate points from challenges
        let challengePoints = 0;
        userChallenges.forEach(challenge => {
          const points = challengePointsMap[challenge.challengeId] || 0;
          // Award points for both active and completed challenges
          if (challenge.status === 'active' || challenge.status === 'completed') {
            challengePoints += points;
          }
        });

        // Use the higher of: stored points or calculated challenge points
        const totalPoints = Math.max(user.points || 0, challengePoints);

        // Update user's points in database if calculated points are higher
        // This ensures existing users with active challenges get their points updated
        if (challengePoints > (user.points || 0)) {
          await User.findByIdAndUpdate(
            user._id,
            { points: totalPoints },
            { new: true }
          );
        }

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          points: totalPoints
        };
      })
    );

    // Sort by points descending and limit to top 3
    const topUsers = usersWithCalculatedPoints
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);

    res.json({ success: true, data: topUsers });
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;

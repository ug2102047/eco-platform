'use client';

import { useState, useEffect } from 'react';
import { Users, Heart, MessageCircle, Check, Trophy } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  content: string;
  likes: {
    _id: string;
    username: string;
    email: string;
  }[];
  comments: {
    _id: string;
    userId: {
      _id: string;
      username: string;
      email: string;
    };
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

interface UserChallenge {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  challengeId: string;
  status: 'active' | 'completed';
  acceptedAt: string;
}

interface Challenge {
  id: string;
  title: string;
  points: number;
  active: boolean;
}

export default function CommunityPage() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: '1', title: 'No Plastic Straws Week', points: 50, active: false },
    { id: '2', title: 'Commute by Bicycle Today', points: 100, active: false },
    { id: '3', title: 'Zero Waste Day Challenge', points: 75, active: false },
  ]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const handlePost = async () => {
    if (newPost.trim() && token) {
      try {
        const response = await fetch('https://eco-platform-backend.onrender.com/api/community/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: newPost.trim() })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setPosts([data.data, ...posts]);
          setNewPost('');
        } else {
          console.error('Failed to create post:', data.message);
        }
      } catch (error) {
        console.error('Error creating post:', error);
      }
    }
  };

  const handleLike = async (postId: string) => {
    if (token) {
      try {
        const response = await fetch(`https://eco-platform-backend.onrender.com/api/community/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setPosts(posts.map(post => 
            post._id === postId ? data.data : post
          ));
        } else {
          console.error('Failed to toggle like:', data.message);
        }
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    }
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    if (token) {
      try {
        const response = await fetch('https://eco-platform-backend.onrender.com/api/community/challenges/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ challengeId })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUserChallenges([...userChallenges, data.data]);
          setChallenges(challenges.map(challenge =>
            challenge.id === challengeId
              ? { ...challenge, active: true }
              : challenge
          ));
        } else {
          console.error('Failed to accept challenge:', data.message);
        }
      } catch (error) {
        console.error('Error accepting challenge:', error);
      }
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const commentText = commentInputs[postId];
    if (commentText && commentText.trim() && token) {
      try {
        const response = await fetch(`https://eco-platform-backend.onrender.com/api/community/posts/${postId}/comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text: commentText.trim() })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setPosts(posts.map(post => 
            post._id === postId ? data.data : post
          ));
          setCommentInputs({ ...commentInputs, [postId]: '' });
        } else {
          console.error('Failed to add comment:', data.message);
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  };

  // Fetch posts and user challenges on mount
  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          // Fetch posts
          const postsResponse = await fetch('https://eco-platform-backend.onrender.com/api/community/posts', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const postsData = await postsResponse.json();
          if (postsData.success) {
            setPosts(postsData.data);
          }

          // Fetch user challenges
          const challengesResponse = await fetch('http://localhost:5000/api/community/challenges', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const challengesData = await challengesResponse.json();
          if (challengesData.success) {
            setUserChallenges(challengesData.data);
            // Update challenge active states based on user's accepted challenges
            const acceptedChallengeIds = challengesData.data.map((uc: UserChallenge) => uc.challengeId);
            setChallenges(challenges.map(challenge => ({
              ...challenge,
              active: acceptedChallengeIds.includes(challenge.id)
            })));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [token]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Social Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Input */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your Green Action..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handlePost}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Posts Feed */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading posts...</div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No posts yet. Be the first to share!</div>
                ) : (
                  posts.map((post) => {
                    const isLiked = user && post.likes.some(like => like._id === user.id);
                    const isExpanded = expandedComments[post._id];
                    return (
                      <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                            {post.user.username[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{post.user.username}</h3>
                            <p className="text-gray-700 mt-1">{post.content}</p>
                            <div className="flex items-center space-x-6 mt-4">
                              <button
                                onClick={() => handleLike(post._id)}
                                className={`flex items-center space-x-2 ${
                                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                } transition-colors`}
                              >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{post.likes.length}</span>
                              </button>
                              <button
                                onClick={() => toggleComments(post._id)}
                                className={`flex items-center space-x-2 ${
                                  isExpanded ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                                } transition-colors`}
                              >
                                <MessageCircle className="w-5 h-5" />
                                <span>{post.comments.length}</span>
                              </button>
                            </div>

                            {/* Comment Section */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                {/* Existing Comments */}
                                {post.comments.length > 0 && (
                                  <div className="space-y-3 mb-4">
                                    {post.comments.map((comment, index) => (
                                      <div key={comment._id || index} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-semibold text-sm text-gray-900">
                                            {comment.userId.username}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                                          </span>
                                        </div>
                                        <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Comment Input */}
                                <div className="flex space-x-2">
                                  <input
                                    type="text"
                                    value={commentInputs[post._id] || ''}
                                    onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                                    placeholder="Write a comment..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleCommentSubmit(post._id);
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleCommentSubmit(post._id)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column - Weekly Green Challenges */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900">Weekly Green Challenges</h2>
                </div>
                <div className="space-y-4">
                  {challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-green-600 font-medium">+{challenge.points} pts</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAcceptChallenge(challenge.id)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            challenge.active
                              ? 'bg-green-500 text-white'
                              : 'bg-white text-green-600 border-2 border-green-500 hover:bg-green-50'
                          }`}
                        >
                          {challenge.active ? (
                            <span className="flex items-center space-x-1">
                              <Check className="w-4 h-4" />
                              <span>Active ✅</span>
                            </span>
                          ) : (
                            'Accept Challenge'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { BlogService, BlogEntry, BlogComment } from '@/services/BlogService';

// Define the Post and Comment types
interface CommentType {
  id: string;
  username: string;
  content: string;
  date: string;
  userId: number;
}

interface PostType {
  id: string;
  username: string;
  date: string;
  content: string;
  title: string;
  likes: number;
  comments: number;
  commentsList: CommentType[];
  userId: number;
  isLiked: boolean;
}

// Comment component for the post detail view
const Comment: React.FC<{ comment: CommentType }> = ({ comment }) => {
  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <ThemedText type="defaultSemiBold">{comment.username}</ThemedText>
        <ThemedText style={styles.dateText}>{comment.date}</ThemedText>
      </View>
      <ThemedText>{comment.content}</ThemedText>
    </View>
  );
};

// Individual post component
const Post: React.FC<{ post: PostType, onPress: () => void, onLike: (postId: string, isLiked: boolean) => void }> = 
  ({ post, onPress, onLike }) => {
  const colorScheme = useColorScheme();
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [liked, setLiked] = useState(post.isLiked);
  const [isLiking, setIsLiking] = useState(false);
  
  // Reset local state when post props change
  useEffect(() => {
    setLocalLikes(post.likes);
    setLiked(post.isLiked);
  }, [post.likes, post.isLiked]);
  
  const handleLikePress = async (e: any) => {
    e.stopPropagation();
    if (isLiking) return;
    
    setIsLiking(true);
    
    try {
      // Toggle the liked state
      const newLikedState = !liked;
      setLiked(newLikedState);
      
      // Update the local likes count
      setLocalLikes(prev => newLikedState ? prev + 1 : prev - 1);
      
      // Call parent's onLike function to handle API call
      await onLike(post.id, newLikedState);
    } catch (error) {
      // If there's an error, revert the changes
      setLiked(liked);
      setLocalLikes(post.likes);
    } finally {
      setIsLiking(false);
    }
  };
  
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <ThemedView 
        style={styles.postContainer}
        lightColor="#ffffff"
        darkColor="#ffffff"
      >
        <View style={styles.postHeader}>
          <ThemedText type="defaultSemiBold">{post.username}</ThemedText>
          <ThemedText style={styles.dateText}>{post.date}</ThemedText>
        </View>

        <ThemedText style={styles.postTitle} type="subtitle">{post.title}</ThemedText>
        
        <View style={styles.postContent}>
          <ThemedText>{post.content}</ThemedText>
        </View>
        
        <View style={styles.postFooter}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleLikePress}
            disabled={isLiking}
          >
            {isLiking ? (
              <ActivityIndicator size="small" color={Colors[colorScheme].tint} />
            ) : (
              <>
                <Ionicons 
                  name={liked ? "heart" : "heart-outline"} 
                  size={20} 
                  color={liked ? Colors[colorScheme].tint : Colors[colorScheme].tabIconDefault} 
                />
                <ThemedText style={styles.actionText}>{localLikes}</ThemedText>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onPress();
            }}
          >
            <Ionicons 
              name="chatbubble-outline" 
              size={20} 
              color={Colors[colorScheme].tabIconDefault} 
            />
            <ThemedText style={styles.actionText}>{post.comments}</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function CommunityScreen() {
  const colorScheme = useColorScheme();
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [commentText, setCommentText] = useState('');
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);

  // For demo purposes, use a hardcoded current user ID
  // In a real app, this would come from authentication
  const currentUserId = 1;

  useEffect(() => {
    fetchBlogEntries();
  }, []);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Recently';
      
      // If date is today, return time
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return `Today at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      // If date is within the last week, return day of week
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      if (date > lastWeek) {
        return date.toLocaleDateString(undefined, { weekday: 'long' });
      }
      
      // Otherwise return full date
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  const fetchBlogEntries = async (isRefreshing = false) => {
    try {
      isRefreshing ? setRefreshing(true) : setLoading(true);
      setError(null);
      
      const blogEntries = await BlogService.getAllBlogEntries();
      
      // Convert BlogEntry objects to PostType format
      const convertedPosts: PostType[] = blogEntries.map(entry => {
        return {
          id: entry.id.toString(),
          username: `User ${entry.user}`, // Placeholder for real username
          date: formatDate(undefined), // Placeholder for real date
          title: entry.title,
          content: entry.content,
          likes: entry.likes_count,
          comments: entry.comments_count,
          commentsList: [], // Empty comments list for now
          userId: entry.user, // Store the user ID from the API response
          isLiked: false // We'll update this later if needed
        };
      });
      
      setPosts(convertedPosts);
    } catch (err) {
      console.error('Failed to fetch blog entries:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchBlogEntries(true);
  }, []);

  const handlePostPress = async (post: PostType) => {
    setSelectedPost(post);
    setShowPostModal(true);
    
    // Fetch comments for this post
    await fetchCommentsForPost(post);
  };

  const fetchCommentsForPost = async (post: PostType) => {
    if (!post) return;
    
    try {
      setCommentsLoading(true);
      setCommentError(null);
      
      const blogId = parseInt(post.id, 10);
      const comments = await BlogService.getCommentsForBlogEntry(post.userId, blogId);
      
      // Convert comments to our format
      const formattedComments: CommentType[] = comments.map(comment => ({
        id: comment.id.toString(),
        username: `User ${comment.user}`, // Placeholder for real username
        content: comment.content,
        date: formatDate(undefined), // Placeholder for real date
        userId: comment.user
      }));
      
      // Update the selected post with comments
      setSelectedPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          commentsList: formattedComments
        };
      });
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setCommentError('Failed to load comments. Please try again later.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    setCommentError(null);
    setCommentText('');
  };

  const handleNewPost = () => {
    setShowNewPostModal(true);
  };

  const handleCloseNewPostModal = () => {
    setShowNewPostModal(false);
    setNewPostContent('');
    setNewPostTitle('');
  };

  const handleSubmitNewPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || creatingPost) return;
    
    try {
      setCreatingPost(true);
      await BlogService.createBlogEntry(currentUserId, newPostTitle, newPostContent);
      handleCloseNewPostModal();
      // Refresh the posts list to include the new post
      await fetchBlogEntries();
      
      // Show success message
      Alert.alert('Success', 'Your post has been published successfully!');
    } catch (err) {
      console.error('Failed to create new post:', err);
      Alert.alert('Error', 'Failed to publish your post. Please try again later.');
    } finally {
      setCreatingPost(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedPost || submittingComment) return;
    
    try {
      setSubmittingComment(true);
      const blogId = parseInt(selectedPost.id, 10);
      
      await BlogService.addCommentToBlogEntry(selectedPost.userId, blogId, commentText);
      
      // Clear the comment text
      setCommentText('');
      
      // Refresh comments for this post
      await fetchCommentsForPost(selectedPost);
      
      // Also refresh the posts list to update comment counts
      fetchBlogEntries();
    } catch (err) {
      console.error('Failed to add comment:', err);
      Alert.alert('Error', 'Failed to add your comment. Please try again later.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikePost = async (postId: string, isLiked: boolean) => {
    try {
      const blogId = parseInt(postId, 10);
      
      // Find the post in our state to get its user ID
      const post = posts.find(p => p.id === postId);
      
      if (!post) {
        console.error('Post not found');
        return;
      }
      
      // Call the API to toggle like status
      await BlogService.toggleLikeBlogEntry(post.userId, blogId);
      
      // Update the post's isLiked status in the local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, isLiked, likes: isLiked ? p.likes + 1 : p.likes - 1 } 
          : p
      ));
      
      // If this is the selected post in the modal, update that too
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          isLiked,
          likes: isLiked ? selectedPost.likes + 1 : selectedPost.likes - 1
        });
      }
    } catch (error) {
      console.error(`Failed to toggle like for post:`, error);
      Alert.alert('Error', `Failed to update like status. Please try again later.`);
      throw error; // Propagate the error to revert UI changes in the Post component
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.headerText} type="title">Community</ThemedText>
      
      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <ThemedText style={styles.loadingText}>Loading posts...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Button
            label="Try Again"
            onPress={() => fetchBlogEntries()}
            variant="secondary"
            style={styles.retryButton}
          />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors[colorScheme].tint]}
              tintColor={Colors[colorScheme].tint}
            />
          }
        >
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No posts yet. Be the first to share!</ThemedText>
            </View>
          ) : (
            posts.map(post => (
              <Post 
                key={post.id} 
                post={post} 
                onPress={() => handlePostPress(post)}
                onLike={handleLikePost}
              />
            ))
          )}
        </ScrollView>
      )}
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleNewPost}
        activeOpacity={0.8}
        disabled={loading || refreshing}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Post Detail Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClosePostModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
          >
            <ThemedView style={styles.modalContainer} lightColor="#ffffff" darkColor="#ffffff">
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Post Details</ThemedText>
                <TouchableOpacity onPress={handleClosePostModal}>
                  <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
                </TouchableOpacity>
              </View>

              {selectedPost && (
                <ScrollView 
                  style={styles.modalScrollView}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.detailPostHeader}>
                    <ThemedText type="defaultSemiBold">{selectedPost.username}</ThemedText>
                    <ThemedText style={styles.dateText}>{selectedPost.date}</ThemedText>
                  </View>
                  
                  <ThemedText style={styles.detailPostTitle} type="subtitle">{selectedPost.title}</ThemedText>
                  <ThemedText style={styles.detailPostContent}>{selectedPost.content}</ThemedText>
                  
                  <View style={styles.postActionContainer}>
                    <TouchableOpacity 
                      style={styles.modalActionButton} 
                      onPress={() => handleLikePost(selectedPost.id, !selectedPost.isLiked)}
                    >
                      <Ionicons 
                        name={selectedPost.isLiked ? "heart" : "heart-outline"} 
                        size={20} 
                        color={selectedPost.isLiked ? Colors[colorScheme].tint : Colors[colorScheme].tabIconDefault} 
                      />
                      <ThemedText style={styles.actionText}>{selectedPost.likes}</ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.modalActionButton}>
                      <Ionicons 
                        name="chatbubble-outline" 
                        size={20} 
                        color={Colors[colorScheme].tabIconDefault} 
                      />
                      <ThemedText style={styles.actionText}>
                        {selectedPost.commentsList?.length || 0}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.commentsHeader}>
                    <ThemedText type="defaultSemiBold">
                      Comments ({selectedPost.commentsList?.length || 0})
                    </ThemedText>
                    {commentsLoading && (
                      <ActivityIndicator size="small" color={Colors[colorScheme].tint} />
                    )}
                  </View>
                  
                  {commentError ? (
                    <View style={styles.commentErrorContainer}>
                      <ThemedText style={styles.commentErrorText}>{commentError}</ThemedText>
                      <Button
                        label="Try Again"
                        onPress={() => selectedPost && fetchCommentsForPost(selectedPost)}
                        variant="secondary"
                        style={styles.retryCommentButton}
                      />
                    </View>
                  ) : selectedPost.commentsList?.length > 0 ? (
                    selectedPost.commentsList.map(comment => (
                      <Comment key={comment.id} comment={comment} />
                    ))
                  ) : commentsLoading ? null : (
                    <ThemedText style={styles.noCommentsText}>No comments yet. Be the first to comment!</ThemedText>
                  )}
                </ScrollView>
              )}
              
              {selectedPost && (
                <View style={styles.addCommentContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor="#9e9e9e"
                    value={commentText}
                    onChangeText={setCommentText}
                    editable={!submittingComment}
                  />
                  {submittingComment ? (
                    <ActivityIndicator size="small" color={Colors[colorScheme].tint} style={styles.commentButton} />
                  ) : (
                    <TouchableOpacity 
                      style={styles.commentButton}
                      onPress={handleSubmitComment}
                      disabled={!commentText.trim() || submittingComment}
                    >
                      <Ionicons 
                        name="send" 
                        size={20} 
                        color={commentText.trim() ? Colors[colorScheme].tint : '#c0c0c0'} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ThemedView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* New Post Modal */}
      <Modal
        visible={showNewPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseNewPostModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
          >
            <ThemedView style={styles.newPostModalContainer} lightColor="#ffffff" darkColor="#ffffff">
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Share Your Experience</ThemedText>
                <TouchableOpacity onPress={handleCloseNewPostModal}>
                  <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
                </TouchableOpacity>
              </View>

              <View style={styles.newPostContainer}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Title"
                  placeholderTextColor="#9e9e9e"
                  value={newPostTitle}
                  onChangeText={setNewPostTitle}
                  maxLength={128} // Match backend constraint
                />
                
                <TextInput
                  style={styles.newPostInput}
                  placeholder="What has helped with your tinnitus?"
                  placeholderTextColor="#9e9e9e"
                  multiline
                  textAlignVertical="top"
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  maxLength={1024} // Match backend constraint
                />
                
                <View style={styles.characterCountContainer}>
                  <ThemedText style={styles.characterCount}>
                    {newPostContent.length}/1024 characters
                  </ThemedText>
                </View>
                
                <Button
                  label={creatingPost ? "Posting..." : "Post"}
                  onPress={handleSubmitNewPost}
                  disabled={!newPostContent.trim() || !newPostTitle.trim() || creatingPost}
                  variant="primary"
                  style={styles.postButton}
                />
              </View>
            </ThemedView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerText: {
    marginTop: 50,
    marginLeft: 16,
    marginBottom: 16,
    fontSize: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Extra space for FAB
  },
  postContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postTitle: {
    marginBottom: 8,
    fontSize: 18,
  },
  dateText: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  postContent: {
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalScrollView: {
    maxHeight: '80%',
  },
  detailPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailPostTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailPostContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  postActionContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 12,
    marginBottom: 16,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  commentContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    color: '#4a4a4a',
  },
  commentButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPostModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 350,
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  newPostContainer: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? 30 : 0,
  },
  newPostInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    height: 150,
    marginBottom: 8,
    color: '#4a4a4a',
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  characterCount: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  postButton: {
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  commentErrorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  commentErrorText: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#ff6b6b',
  },
  retryCommentButton: {
    minWidth: 100,
    height: 36,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  noCommentsText: {
    fontStyle: 'italic',
    color: '#9e9e9e',
    textAlign: 'center',
    marginTop: 16,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#4a4a4a',
  },
}); 
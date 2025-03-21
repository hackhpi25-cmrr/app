import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

// Mock data for community posts
const mockPosts = [
  {
    id: '1',
    username: 'Emily J.',
    date: '3 days ago',
    content: 'I found that sound therapy with white noise at night has really helped reduce my tinnitus awareness. Been using it for 3 months now and it\'s made a huge difference.',
    likes: 24,
    comments: 3,
    commentsList: [
      { id: '1-1', username: 'Robert T.', content: 'I\'ve been considering this. Do you use an app or a special device?', date: '2 days ago' },
      { id: '1-2', username: 'Lisa P.', content: 'White noise works for me too! I use a simple fan at night.', date: '1 day ago' },
      { id: '1-3', username: 'Emily J.', content: 'I use the Sound Relief app. It has various noise options to try!', date: '1 day ago' }
    ]
  },
  {
    id: '2',
    username: 'David S.',
    date: '1 week ago',
    content: 'Meditation has been a game-changer for me. 15 minutes each morning helped me stop focusing on the ringing. It took time but now I barely notice it.',
    likes: 42,
    comments: 4,
    commentsList: [
      { id: '2-1', username: 'Maria L.', content: 'What meditation app do you recommend?', date: '6 days ago' },
      { id: '2-2', username: 'David S.', content: 'I use Headspace, but any mindfulness meditation would help!', date: '6 days ago' },
      { id: '2-3', username: 'Chris J.', content: 'I\'ve been trying this for a week. Still waiting to see results but feeling hopeful.', date: '4 days ago' },
      { id: '2-4', username: 'Sarah M.', content: 'This has helped me too! Combined with CBT it\'s been life-changing.', date: '2 days ago' }
    ]
  },
  {
    id: '3',
    username: 'Sarah M.',
    date: '2 weeks ago',
    content: 'My audiologist recommended cognitive behavioral therapy and it\'s been so helpful for managing my emotional response to tinnitus. Anyone else try this?',
    likes: 18,
    comments: 2,
    commentsList: [
      { id: '3-1', username: 'Tom W.', content: 'I\'ve been doing CBT for 3 months and it has changed my relationship with tinnitus completely.', date: '12 days ago' },
      { id: '3-2', username: 'Emma R.', content: 'How many sessions did it take before you noticed a difference?', date: '10 days ago' }
    ]
  },
  {
    id: '4',
    username: 'Michael K.',
    date: '3 weeks ago',
    content: 'Reducing caffeine intake has helped lessen my tinnitus intensity. It was hard to give up coffee but worth it for the relief.',
    likes: 31,
    comments: 3,
    commentsList: [
      { id: '4-1', username: 'Jessica P.', content: 'I noticed the same thing! Also reducing salt helped me.', date: '19 days ago' },
      { id: '4-2', username: 'Ryan B.', content: 'How long after cutting back did you notice changes?', date: '18 days ago' },
      { id: '4-3', username: 'Michael K.', content: 'About two weeks for me. It wasn\'t immediate but definitely noticeable!', date: '17 days ago' }
    ]
  },
];

// Define the Post and Comment types
interface CommentType {
  id: string;
  username: string;
  content: string;
  date: string;
}

interface PostType {
  id: string;
  username: string;
  date: string;
  content: string;
  likes: number;
  comments: number;
  commentsList: CommentType[];
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
const Post: React.FC<{ post: PostType, onPress: () => void }> = ({ post, onPress }) => {
  const colorScheme = useColorScheme();
  const [liked, setLiked] = useState(false);
  
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
        
        <View style={styles.postContent}>
          <ThemedText>{post.content}</ThemedText>
        </View>
        
        <View style={styles.postFooter}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
          >
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={20} 
              color={liked ? Colors[colorScheme].tint : Colors[colorScheme].tabIconDefault} 
            />
            <ThemedText style={styles.actionText}>{post.likes + (liked ? 1 : 0)}</ThemedText>
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
  const [commentText, setCommentText] = useState('');

  const handlePostPress = (post: PostType) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
  };

  const handleNewPost = () => {
    setShowNewPostModal(true);
  };

  const handleCloseNewPostModal = () => {
    setShowNewPostModal(false);
    setNewPostContent('');
  };

  const handleSubmitNewPost = () => {
    // Logic to submit new post would go here in a real app
    console.log('New post submitted:', newPostContent);
    handleCloseNewPostModal();
  };

  const handleSubmitComment = () => {
    if (!commentText.trim() || !selectedPost) return;
    
    // In a real app, this would add the comment to the post
    console.log('New comment on post', selectedPost.id, ':', commentText);
    setCommentText('');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.headerText} type="title">Community</ThemedText>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {mockPosts.map(post => (
          <Post 
            key={post.id} 
            post={post} 
            onPress={() => handlePostPress(post)}
          />
        ))}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleNewPost}
        activeOpacity={0.8}
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
                  
                  <ThemedText style={styles.detailPostContent}>{selectedPost.content}</ThemedText>
                  
                  <View style={styles.commentsHeader}>
                    <ThemedText type="defaultSemiBold">Comments ({selectedPost.comments})</ThemedText>
                  </View>
                  
                  {selectedPost.commentsList.map(comment => (
                    <Comment key={comment.id} comment={comment} />
                  ))}
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
                  />
                  <TouchableOpacity 
                    style={styles.commentButton}
                    onPress={handleSubmitComment}
                    disabled={!commentText.trim()}
                  >
                    <Ionicons 
                      name="send" 
                      size={20} 
                      color={commentText.trim() ? Colors[colorScheme].tint : '#c0c0c0'} 
                    />
                  </TouchableOpacity>
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
                  style={styles.newPostInput}
                  placeholder="What has helped with your tinnitus?"
                  placeholderTextColor="#9e9e9e"
                  multiline
                  textAlignVertical="top"
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                />
                
                <Button
                  label="Post"
                  onPress={handleSubmitNewPost}
                  disabled={!newPostContent.trim()}
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
  detailPostContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  commentsHeader: {
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
    marginBottom: 16,
    color: '#4a4a4a',
  },
  postButton: {
    marginTop: 8,
  },
}); 
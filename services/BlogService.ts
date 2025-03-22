import { AuthService, API_URL } from './AuthService';

export interface BlogEntry {
  id: number;
  title: string;
  content: string;
  user: number;
  likes_count: number;
  comments_count: number;
}

export interface BlogComment {
  id: number;
  user: number;
  content: string;
  blog: number;
}

export class BlogService {
  /**
   * Fetches all blog entries from the API
   * Does not require authentication
   */
  static async getAllBlogEntries(): Promise<BlogEntry[]> {
    try {
      const response = await fetch(`${API_URL}/blogentries`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch blog entries');
      }
      
      const blogEntries = await response.json();
      return blogEntries;
    } catch (error) {
      console.error('Error fetching blog entries:', error);
      throw error;
    }
  }

  /**
   * Fetches a single blog entry by ID
   * Does not require authentication
   */
  static async getBlogEntryById(id: number): Promise<BlogEntry> {
    try {
      const response = await fetch(`${API_URL}/blogentries/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to fetch blog entry with ID: ${id}`);
      }
      
      const blogEntry = await response.json();
      return blogEntry;
    } catch (error) {
      console.error(`Error fetching blog entry with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new blog entry
   * Currently does not require authentication, but this might change in the future
   * @param userId - The ID of the user creating the post
   * @param title - The title of the blog post
   * @param content - The content of the blog post
   */
  static async createBlogEntry(userId: number, title: string, content: string): Promise<void> {
    try {
      const body = { title, content };
      const response = await fetch(`${API_URL}/users/${userId}/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create blog entry');
      }
    } catch (error) {
      console.error('Error creating blog entry:', error);
      throw error;
    }
  }

  /**
   * Toggles like status for a blog entry
   * The backend handles both liking and unliking with the same endpoint
   * @param userId - The ID of the user liking/unliking the post
   * @param blogId - The ID of the blog post to toggle like status
   */
  static async toggleLikeBlogEntry(userId: number, blogId: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/blog/${blogId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to toggle like status for blog entry');
      }
    } catch (error) {
      console.error(`Error toggling like for blog entry ${blogId}:`, error);
      throw error;
    }
  }

  /**
   * Gets all comments for a blog entry
   * @param userId - The ID of the user viewing the comments
   * @param blogId - The ID of the blog post to get comments for
   */
  static async getCommentsForBlogEntry(userId: number, blogId: number): Promise<BlogComment[]> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/blog/${blogId}/comment`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch comments');
      }
      
      const comments = await response.json();
      return comments;
    } catch (error) {
      console.error(`Error fetching comments for blog entry ${blogId}:`, error);
      throw error;
    }
  }

  /**
   * Adds a comment to a blog entry
   * @param userId - The ID of the user adding the comment
   * @param blogId - The ID of the blog post to comment on
   * @param content - The content of the comment
   */
  static async addCommentToBlogEntry(userId: number, blogId: number, content: string): Promise<void> {
    try {
      const body = { content };
      const response = await fetch(`${API_URL}/users/${userId}/blog/${blogId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add comment');
      }
    } catch (error) {
      console.error(`Error adding comment to blog entry ${blogId}:`, error);
      throw error;
    }
  }

  /**
   * Gets the count of likes for a blog entry
   * @param userId - The ID of the user viewing the likes
   * @param blogId - The ID of the blog post to get likes for
   */
  static async getLikesCountForBlogEntry(userId: number, blogId: number): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/blog/${blogId}/like`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch likes count');
      }
      
      const likesCount = await response.json();
      return likesCount;
    } catch (error) {
      console.error(`Error fetching likes count for blog entry ${blogId}:`, error);
      throw error;
    }
  }

  /* 
   * The following methods use authentication and can be used 
   * when authentication is implemented on the API
   */

  /**
   * Fetches all blog entries from the API with authentication
   */
  static async getAllBlogEntriesAuthenticated(): Promise<BlogEntry[]> {
    try {
      // Use the authenticated request method from AuthService
      const response = await AuthService.getAuthenticatedRequest(`${API_URL}/blogentries`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch blog entries');
      }
      
      const blogEntries = await response.json();
      return blogEntries;
    } catch (error) {
      console.error('Error fetching blog entries with authentication:', error);
      throw error;
    }
  }

  /**
   * Creates a new blog entry with authentication
   */
  static async createBlogEntryAuthenticated(title: string, content: string): Promise<BlogEntry> {
    try {
      const body = { title, content };
      const response = await AuthService.getAuthenticatedRequest(
        `${API_URL}/blogentries/`,
        'POST',
        body
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create blog entry');
      }
      
      const createdEntry = await response.json();
      return createdEntry;
    } catch (error) {
      console.error('Error creating blog entry with authentication:', error);
      throw error;
    }
  }

  /**
   * Likes a blog entry with authentication
   * @param blogId - The ID of the blog post to like
   */
  static async toggleLikeBlogEntryAuthenticated(blogId: number): Promise<void> {
    try {
      const response = await AuthService.getAuthenticatedRequest(
        `${API_URL}/users/me/blog/${blogId}/like`,
        'POST'
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to toggle like status for blog entry');
      }
    } catch (error) {
      console.error(`Error toggling like for blog entry ${blogId} with authentication:`, error);
      throw error;
    }
  }
} 
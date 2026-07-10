import { Injectable, signal } from '@angular/core';
import { BLOG_POSTS, type BlogPost } from '../../features/blog/blog.config';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly STORAGE_KEY = 'webee_blog_posts';
  readonly posts = signal<BlogPost[]>([]);

  constructor() {
    this.loadPosts();
  }

  private loadPosts() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const sanitized = parsed.map((p: any) => ({
          ...p,
          isActive: p.isActive !== false
        }));
        this.posts.set(sanitized);
        return;
      } catch (e) {
        console.error('Failed to parse blog posts from localStorage', e);
      }
    }
    const initial = BLOG_POSTS.map(p => ({
      ...p,
      isActive: true
    }));
    this.posts.set(initial);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initial));
  }

  savePosts(list: BlogPost[]) {
    this.posts.set([...list]);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  addPost(post: BlogPost): boolean {
    const current = this.posts();
    if (current.some(p => p.slug === post.slug)) {
      return false;
    }
    const newList = [...current, { ...post, isActive: post.isActive !== false }];
    this.savePosts(newList);
    return true;
  }

  updatePost(slug: string, updated: BlogPost): boolean {
    const current = this.posts();
    const index = current.findIndex(p => p.slug === slug);
    if (index === -1) return false;
    
    if (updated.slug !== slug && current.some((p, idx) => idx !== index && p.slug === updated.slug)) {
      return false;
    }

    const newList = [...current];
    newList[index] = { ...updated, isActive: updated.isActive !== false };
    this.savePosts(newList);
    return true;
  }

  deletePost(slug: string): boolean {
    const current = this.posts();
    const newList = current.filter(p => p.slug !== slug);
    if (newList.length === current.length) return false;
    this.savePosts(newList);
    return true;
  }

  togglePostActive(slug: string): boolean {
    const current = this.posts();
    const index = current.findIndex(p => p.slug === slug);
    if (index === -1) return false;
    const newList = [...current];
    newList[index] = {
      ...newList[index],
      isActive: !newList[index].isActive
    };
    this.savePosts(newList);
    return true;
  }
}

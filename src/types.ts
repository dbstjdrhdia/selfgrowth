export interface Post {
  id: string;
  title: string;
  content: string;
  category: "공지사항" | "칼럼";
  createdAt: string;
}

export interface Application {
  id: string;
  name: string;
  phone: string;
  mbti: string;
  message: string;
  status: "대기" | "완료";
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  primaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
}

export interface AppData {
  posts: Post[];
  applications: Application[];
  settings: SiteSettings;
}

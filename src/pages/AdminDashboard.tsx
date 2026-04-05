import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  Clock,
  Search,
  Globe
} from "lucide-react";
import { cn } from "../lib/utils";
import { AppData, Post, Application, SiteSettings } from "../types";

export default function AdminDashboard() {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/data?t=${Date.now()}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
        }
        return res.json();
      })
      .then(setData)
      .catch(err => {
        console.error(err);
        setError(`데이터 로드 실패: ${err.message}`);
      });
  }, []);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold p-6 text-center">{error}</div>;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin1234") { // Simple demo password
      setIsLoggedIn(true);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-serif font-bold mb-8 text-center">관리자 로그인</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">비밀번호</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-lavender"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full bg-lavender text-white py-4 rounded-xl font-bold hover:bg-lavender-dark transition-all">
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-8 text-xl font-serif font-bold text-lavender">Admin Panel</div>
        <nav className="flex-1 px-4 space-y-2">
          <SidebarLink to="/admin" icon={<LayoutDashboard />} label="대시보드" active={location.pathname === "/admin"} />
          <SidebarLink to="/admin/posts" icon={<FileText />} label="콘텐츠 관리" active={location.pathname.startsWith("/admin/posts")} />
          <SidebarLink to="/admin/applications" icon={<Users />} label="신청자 관리" active={location.pathname.startsWith("/admin/applications")} />
          <SidebarLink to="/admin/settings" icon={<Settings />} label="사이트 설정" active={location.pathname.startsWith("/admin/settings")} />
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 mr-3" /> 로그아웃
          </button>
          <Link to="/" className="mt-2 w-full flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <Globe className="w-5 h-5 mr-3" /> 사이트 바로가기
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <Routes>
          <Route index element={<DashboardHome data={data} />} />
          <Route path="posts" element={<PostManagement posts={data.posts} onUpdate={() => fetch("/api/data").then(res => res.json()).then(setData)} />} />
          <Route path="applications" element={<ApplicationManagement applications={data.applications} onUpdate={() => fetch("/api/data").then(res => res.json()).then(setData)} />} />
          <Route path="settings" element={<SettingsManagement settings={data.settings} onUpdate={() => fetch("/api/data").then(res => res.json()).then(setData)} />} />
        </Routes>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center px-4 py-3 rounded-xl transition-all",
        active ? "bg-lavender text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      <span className="w-5 h-5 mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function DashboardHome({ data }: { data: AppData }) {
  const pendingApps = data.applications.filter(a => a.status === "대기").length;
  
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-serif font-bold">대시보드 개요</h1>
      
      <div className="grid grid-cols-3 gap-8">
        <StatCard label="총 신청자" value={data.applications.length} sub="누적 신청 건수" />
        <StatCard label="대기 중인 신청" value={pendingApps} sub="확인이 필요한 신청" highlight />
        <StatCard label="게시글 수" value={data.posts.length} sub="칼럼 및 공지사항" />
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">최근 신청 현황</h2>
        <div className="space-y-4">
          {data.applications.slice(0, 5).map(app => (
            <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <span className="font-bold mr-4">{app.name}</span>
                <span className="text-sm text-gray-500">{app.phone}</span>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                app.status === "대기" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
              )}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string, value: number, sub: string, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-8 rounded-3xl shadow-sm border",
      highlight ? "bg-lavender text-white border-lavender" : "bg-white border-gray-100"
    )}>
      <div className={cn("text-sm mb-2", highlight ? "text-white/80" : "text-gray-500")}>{label}</div>
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className={cn("text-xs", highlight ? "text-white/60" : "text-gray-400")}>{sub}</div>
    </div>
  );
}

function PostManagement({ posts, onUpdate }: { posts: Post[], onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({ title: "", content: "", category: "칼럼" });

  const handleSave = async () => {
    const method = currentPost.id ? "PUT" : "POST";
    const url = currentPost.id ? `/api/posts/${currentPost.id}` : "/api/posts";
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentPost),
    });
    
    setIsEditing(false);
    setCurrentPost({ title: "", content: "", category: "칼럼" });
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    onUpdate();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold">콘텐츠 관리</h1>
        <button 
          onClick={() => { setIsEditing(true); setCurrentPost({ title: "", content: "", category: "칼럼" }); }}
          className="bg-lavender text-white px-6 py-3 rounded-xl font-bold flex items-center"
        >
          <Plus className="mr-2" /> 새 글 작성
        </button>
      </div>

      {isEditing ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">제목</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                value={currentPost.title}
                onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">카테고리</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                value={currentPost.category}
                onChange={e => setCurrentPost({...currentPost, category: e.target.value as any})}
              >
                <option value="칼럼">칼럼</option>
                <option value="공지사항">공지사항</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">내용</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none h-64 resize-none"
              value={currentPost.content}
              onChange={e => setCurrentPost({...currentPost, content: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-gray-500 font-bold">취소</button>
            <button onClick={handleSave} className="bg-lavender text-white px-10 py-3 rounded-xl font-bold">저장하기</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-4 font-bold text-sm">카테고리</th>
                <th className="px-8 py-4 font-bold text-sm">제목</th>
                <th className="px-8 py-4 font-bold text-sm">작성일</th>
                <th className="px-8 py-4 font-bold text-sm text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <span className="text-xs font-bold text-lavender uppercase tracking-widest">{post.category}</span>
                  </td>
                  <td className="px-8 py-4 font-medium">{post.title}</td>
                  <td className="px-8 py-4 text-sm text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-4 text-right space-x-2">
                    <button onClick={() => { setCurrentPost(post); setIsEditing(true); }} className="p-2 text-gray-400 hover:text-lavender"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ApplicationManagement({ applications, onUpdate }: { applications: Application[], onUpdate: () => void }) {
  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onUpdate();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold">신청자 관리</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-4 font-bold text-sm">이름</th>
              <th className="px-8 py-4 font-bold text-sm">연락처</th>
              <th className="px-8 py-4 font-bold text-sm">MBTI</th>
              <th className="px-8 py-4 font-bold text-sm">상태</th>
              <th className="px-8 py-4 font-bold text-sm">신청일</th>
              <th className="px-8 py-4 font-bold text-sm text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map(app => (
              <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-4 font-bold">{app.name}</td>
                <td className="px-8 py-4 text-gray-600">{app.phone}</td>
                <td className="px-8 py-4 text-gray-500">{app.mbti || "-"}</td>
                <td className="px-8 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    app.status === "대기" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  )}>
                    {app.status}
                  </span>
                </td>
                <td className="px-8 py-4 text-sm text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="px-8 py-4 text-right">
                  {app.status === "대기" ? (
                    <button 
                      onClick={() => handleStatusChange(app.id, "완료")}
                      className="text-sm font-bold text-lavender hover:text-lavender-dark flex items-center justify-end ml-auto"
                    >
                      <Check className="w-4 h-4 mr-1" /> 완료 처리
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusChange(app.id, "대기")}
                      className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center justify-end ml-auto"
                    >
                      <Clock className="w-4 h-4 mr-1" /> 대기로 변경
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsManagement({ settings, onUpdate }: { settings: SiteSettings, onUpdate: () => void }) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = async () => {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localSettings),
    });
    alert("설정이 저장되었습니다.");
    onUpdate();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold">사이트 설정</h1>
      
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-8">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b pb-4">기본 정보</h2>
            <div>
              <label className="block text-sm font-bold mb-2">연구소 이름</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                value={localSettings.siteName}
                onChange={e => setLocalSettings({...localSettings, siteName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">메인 테마 색상</label>
              <div className="flex items-center space-x-4">
                <input 
                  type="color" 
                  className="w-12 h-12 rounded-lg cursor-pointer"
                  value={localSettings.primaryColor}
                  onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})}
                />
                <input 
                  type="text" 
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none"
                  value={localSettings.primaryColor}
                  onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b pb-4">히어로 섹션 문구</h2>
            <div>
              <label className="block text-sm font-bold mb-2">메인 타이틀</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                value={localSettings.heroTitle}
                onChange={e => setLocalSettings({...localSettings, heroTitle: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">서브 타이틀</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none h-32 resize-none"
                value={localSettings.heroSubtitle}
                onChange={e => setLocalSettings({...localSettings, heroSubtitle: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button 
            onClick={handleSave}
            className="bg-lavender text-white px-12 py-4 rounded-xl font-bold hover:bg-lavender-dark transition-all shadow-lg"
          >
            변경사항 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

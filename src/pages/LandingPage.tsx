import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronRight, 
  Menu, 
  X, 
  Brain, 
  Heart, 
  Users, 
  CheckCircle2, 
  Calendar, 
  MessageCircle,
  ArrowRight,
  Instagram,
  Facebook,
  Mail,
  Phone
} from "lucide-react";
import { cn } from "../lib/utils";
import { AppData, Post, SiteSettings } from "../types";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, addDoc, doc } from "firebase/firestore";

export default function LandingPage() {
  const [data, setData] = useState<{ posts: Post[], settings: SiteSettings } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", mbti: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to settings
    const unsubscribeSettings = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        setData(prev => ({
          posts: prev?.posts || [],
          settings: docSnap.data() as SiteSettings
        }));
      } else {
        // Fallback default settings if not exists
        setData(prev => ({
          posts: prev?.posts || [],
          settings: {
            siteName: "자아성장연구소",
            primaryColor: "#B5B2D2",
            heroTitle: "흔들리지 않는 '나'를 만드는\n자아성장 프로젝트",
            heroSubtitle: "취업 전, 그리고 사회생활의 첫걸음.\n성격, 감정, 애착 패턴 분석을 통해 가장 건강한 대인관계를 설계합니다."
          }
        }));
      }
    }, (err) => {
      console.error("Settings fetch error:", err);
      setError(`설정 로드 실패: ${err.message}`);
    });

    // Listen to posts
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setData(prev => ({
        posts: postsData,
        settings: prev?.settings || {
          siteName: "자아성장연구소",
          primaryColor: "#B5B2D2",
          heroTitle: "흔들리지 않는 '나'를 만드는\n자아성장 프로젝트",
          heroSubtitle: "취업 전, 그리고 사회생활의 첫걸음.\n성격, 감정, 애착 패턴 분석을 통해 가장 건강한 대인관계를 설계합니다."
        }
      }));
    }, (err) => {
      console.error("Posts fetch error:", err);
      setError(`게시글 로드 실패: ${err.message}`);
    });

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribeSettings();
      unsubscribePosts();
    };
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        ...formData,
        status: "대기",
        createdAt: new Date().toISOString()
      });
      alert("신청이 완료되었습니다. 곧 연락드리겠습니다.");
      setShowApplyModal(false);
      setFormData({ name: "", phone: "", mbti: "", message: "" });
    } catch (err) {
      console.error("Application error:", err);
      alert("신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;
  if (!data) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const { settings, posts } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between",
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}>
        <div className="text-2xl font-serif font-bold text-lavender-dark">
          {settings.siteName}
        </div>
        
        <div className="hidden md:flex items-center space-x-8 font-medium">
          <a href="#program" className="hover:text-lavender transition-colors">프로그램</a>
          <a href="#expert" className="hover:text-lavender transition-colors">전문가</a>
          <a href="#schedule" className="hover:text-lavender transition-colors">일정</a>
          <a href="#faq" className="hover:text-lavender transition-colors">FAQ</a>
          <button 
            onClick={() => setShowApplyModal(true)}
            className="bg-lavender text-white px-6 py-2 rounded-full hover:bg-lavender-dark transition-all shadow-md"
          >
            신청하기
          </button>
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col space-y-6 text-xl font-medium"
          >
            <a href="#program" onClick={() => setIsMenuOpen(false)}>프로그램</a>
            <a href="#expert" onClick={() => setIsMenuOpen(false)}>전문가</a>
            <a href="#schedule" onClick={() => setIsMenuOpen(false)}>일정</a>
            <a href="#faq" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <button 
              onClick={() => { setIsMenuOpen(false); setShowApplyModal(true); }}
              className="bg-lavender text-white py-4 rounded-xl"
            >
              신청하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight whitespace-pre-line break-keep"
          >
            {settings.heroTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 mb-10 font-light whitespace-pre-line break-keep"
          >
            {settings.heroSubtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button 
              onClick={() => setShowApplyModal(true)}
              className="group bg-lavender text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-lavender-dark transition-all shadow-xl flex items-center mx-auto"
            >
              지금 시작하기
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">이런 분들께 꼭 필요합니다</h2>
            <p className="text-gray-500">지금 당신의 고민, 혼자만의 것이 아닙니다</p>
          </div>
          <div className="space-y-4">
            {[
              "내가 진짜 원하는 것이 무엇인지 진로와 방향성이 막막한 분",
              "새로운 사람들을 만나고 관계를 맺는 것에 막연한 두려움이 있는 분",
              "나의 감정을 건강하게 다루고 표현하는 방법을 배우고 싶은 분"
            ].map((text, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center p-6 bg-slate-50 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="w-12 h-12 bg-lavender/20 rounded-full flex items-center justify-center mr-6 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-lavender" />
                </div>
                <p className="text-lg text-gray-700 font-medium">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">프로그램 구성</h2>
            <p className="text-gray-500">나를 이해하는 세 가지 핵심 열쇠</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Brain className="w-8 h-8 text-lavender" />, 
                title: "MBTI 성격유형", 
                desc: "단순한 검사를 넘어, 나의 인지 기능과 에너지 방향성을 심도 있게 분석합니다." 
              },
              { 
                icon: <Heart className="w-8 h-8 text-lavender" />, 
                title: "Core Emotion", 
                desc: "나의 행동을 지배하는 핵심 감정을 발견하고 건강하게 표현하는 법을 배웁니다." 
              },
              { 
                icon: <Users className="w-8 h-8 text-lavender" />, 
                title: "Attachment Style", 
                desc: "대인관계의 뿌리가 되는 애착 유형을 파악하여 더 나은 관계를 설계합니다." 
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100"
              >
                <div className="w-16 h-16 bg-lavender/10 rounded-2xl flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Section */}
      <section id="expert" className="py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute -inset-4 bg-lavender/20 rounded-full blur-3xl" />
              <img 
                src="https://github.com/dbstjdrhdia/selfgrowth/blob/main/profile.jpg?raw=true" 
                alt="김푸름 전문가"
                className="relative rounded-3xl shadow-2xl w-full max-w-md mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <span className="text-lavender font-bold tracking-widest uppercase text-sm mb-4 block">Professional Counselor</span>
            <h2 className="text-4xl font-serif font-bold mb-2 flex items-end gap-3">
              김푸름 <span className="text-2xl text-gray-400 font-light tracking-widest">KIM PU REUM</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              당신의 성장을 돕는 전문가
            </p>
            <ul className="space-y-4">
              {[
                "케임브리지대학교 사회심리학 전공",
                "서울대학교 정서심리학 전공",
                "미네소타대 심리학 전공",
                "前 서대전여자고등학교 인턴상담교사",
                "前 세브란스 재활병원 인턴임상심리사",
                "現 한국국방연구원",
                "現 감정서재 대표"
              ].map((text, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <CheckCircle2 className="text-lavender mr-3 w-5 h-5" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-24 px-6 bg-lavender-light/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">프로그램 일정</h2>
            <p className="text-gray-500">6주간의 체계적인 변화</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 border-b md:border-b-0 md:border-r border-gray-100">
                <h3 className="text-2xl font-serif font-bold mb-8 flex items-center">
                  <Calendar className="mr-3 text-lavender" /> 상세 안내
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">기간</p>
                    <p className="text-lg font-medium">총 6주 (주 2회, 총 12회차)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">대상</p>
                    <p className="text-lg font-medium">자신을 더 깊이 알고 싶은 20대 청년</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">인원</p>
                    <p className="text-lg font-medium">4~8인 (소규모 집중 진행)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">참가비</p>
                    <p className="text-lg font-medium">300,000원 (교재 및 검사비 포함)</p>
                  </div>
                </div>
              </div>
              <div className="p-12 bg-slate-50">
                <h3 className="text-2xl font-serif font-bold mb-8">커리큘럼</h3>
                <ul className="space-y-4">
                  {[
                    "1-2주: MBTI 핵심감정 애착유형 등 인지 기능 검사",
                    "3주: 자아 수립 및 자존감 형성",
                    "4-6주: 통합 자아 설계 및 가치관 비전 수립"
                  ].map((text, i) => (
                    <li key={i} className="flex items-start">
                      <span className="bg-lavender text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mt-1 mr-3 shrink-0">{i+1}</span>
                      <span className="text-gray-700">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-10 text-center">자주 묻는 질문</h2>
            <div className="space-y-4">
              {[
                { q: "심리학 전공자가 아니어도 참여 가능한가요?", a: "네, 당연합니다. 누구나 이해하기 쉬운 언어로 진행됩니다." },
                { q: "온라인으로도 진행되나요?", a: "현재는 오프라인 대면 상담을 원칙으로 하지만, 상황에 따라 줌(Zoom) 상담도 병행합니다." },
                { q: "환불 규정은 어떻게 되나요?", a: "프로그램 시작 3일 전까지는 100% 환불이 가능합니다." }
              ].map((item, i) => (
                <details key={i} className="group bg-slate-50 rounded-2xl p-6 cursor-pointer">
                  <summary className="list-none flex items-center justify-between font-bold">
                    {item.q}
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-3xl font-serif font-bold text-lavender mb-6">{settings.siteName}</div>
          <div className="text-gray-500 text-sm">
            © 2026 {settings.siteName}. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Sticky CTA for Mobile */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <button 
          onClick={() => setShowApplyModal(true)}
          className="w-full bg-lavender text-white py-4 rounded-2xl shadow-2xl font-bold text-lg flex items-center justify-center"
        >
          프로그램 신청하기 <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApplyModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif font-bold">프로그램 신청</h2>
                  <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X />
                  </button>
                </div>
                
                <form onSubmit={handleApply} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">이름</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lavender focus:ring-2 focus:ring-lavender/20 outline-none transition-all"
                      placeholder="성함을 입력해주세요"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">연락처</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lavender focus:ring-2 focus:ring-lavender/20 outline-none transition-all"
                      placeholder="010-0000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">MBTI (선택)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lavender focus:ring-2 focus:ring-lavender/20 outline-none transition-all"
                      placeholder="예: ENFP"
                      value={formData.mbti}
                      onChange={e => setFormData({...formData, mbti: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">문의사항</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lavender focus:ring-2 focus:ring-lavender/20 outline-none transition-all h-32 resize-none"
                      placeholder="궁금하신 점을 적어주세요"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-lavender text-white py-4 rounded-xl font-bold text-lg hover:bg-lavender-dark transition-all shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "신청 중..." : "신청 완료하기"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

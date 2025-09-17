import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Shield, 
  CheckCircle, 
  Clock, 
  Award, 
  Users, 
  MessageCircle, 
  CreditCard, 
  MapPin, 
  Phone, 
  MessageSquare,
  Crown,
  Heart,
  Sparkles,
  Calendar,
  Settings,
  FileText,
  HelpCircle,
  Gift
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGuestStart = () => {
    navigate('/register');
  };

  const handleCastStart = () => {
    window.open('https://lin.ee/Mwq9uSp', '_blank');
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-br from-primary via-primary/90 to-secondary text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: 'url("/hero.webp")'
        }}></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating particles */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-secondary/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-60 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-secondary/20 rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-60 left-20 w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '4s'}}></div>
          
          {/* Decorative shapes */}
          <div className="absolute top-1/4 right-10 w-16 h-16 border border-white/10 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
          <div className="absolute bottom-1/4 left-10 w-12 h-12 border border-secondary/20 rounded-full animate-pulse"></div>
        </div>

        {/* Main Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Animated Logo/Brand */}
            <div className="mb-8 animate-fade-in-up">
              <div className="inline-block relative">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-4 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent animate-pulse">
              Pishatto
            </h1>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white/60 rounded-full animate-bounce"></div>
              </div>
            </div>

            {/* Subtitle with animation */}
            <p className="text-2xl md:text-3xl lg:text-4xl mb-12 text-white/90 font-light animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              ピシャッと素敵な空間をご提供
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8 animate-fade-in-up" style={{animationDelay: '1s'}}>
              <button
                onClick={handleGuestStart}
                className="group bg-white text-primary px-10 py-5 rounded-full font-bold text-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-white/25 hover:scale-105 transform"
              >
                <img src="/LINE.png" alt="LINE" className="w-7 h-7 group-hover:animate-bounce" />
                LINEで始める
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
              </button>
              <button
                onClick={handleGuestStart}
                className="group bg-transparent border-2 border-white text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-primary transition-all duration-300 flex items-center gap-3 hover:scale-105 transform backdrop-blur-sm"
              >
                <Phone className="w-6 h-6 group-hover:animate-pulse" />
                電話番号で始める
                <Crown className="w-5 h-5 group-hover:animate-bounce" />
              </button>
            </div>

            {/* Cast Registration Link */}
            <div className="animate-fade-in-up" style={{animationDelay: '1.5s'}}>
              <button
                onClick={handleCastStart}
                className="text-white/70 hover:text-white underline text-lg hover:text-xl transition-all duration-300 flex items-center gap-2 mx-auto group"
              >
                <Users className="w-5 h-5 group-hover:animate-pulse" />
                キャストに登録したい方はこちら
                <Heart className="w-4 h-4 group-hover:animate-bounce" />
              </button>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </section>

      {/* Section 2 - Industry Standards */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="mb-12 group">
              <div className="relative inline-block">
              <img 
                src="/mans-estist.webp" 
                alt="Professional massage therapist" 
                  className="w-full max-w-5xl mx-auto rounded-3xl shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 transform group-hover:scale-105"
              />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
                <div className="absolute top-4 right-4 bg-secondary/90 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                  Premium Quality
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
              業界最高水準のメンズエステシャンが登録
            </h2>
              <p className="text-2xl text-gray-300 max-w-5xl mx-auto leading-relaxed">
              唯一無二のサービスとしてスタート。<br />
              審査は複数回実施。審査通過率は10%以下の超難関を突破した<br />
              メンズエステシャンがお待ちしています。
            </p>
          </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="group text-center bg-gradient-to-br from-primary/10 to-secondary/5 rounded-3xl p-8 border border-primary/20 hover:border-secondary/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/10">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse">
                <Shield className="w-12 h-12 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">厳格な審査</h3>
              <p className="text-gray-300 text-lg">複数回の審査を実施</p>
              <div className="mt-4 w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group text-center bg-gradient-to-br from-primary/10 to-secondary/5 rounded-3xl p-8 border border-primary/20 hover:border-secondary/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/10">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce">
                <Star className="w-12 h-12 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">10%の通過率</h3>
              <p className="text-gray-300 text-lg">超難関を突破したエステシャン</p>
              <div className="mt-4 w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group text-center bg-gradient-to-br from-primary/10 to-secondary/5 rounded-3xl p-8 border border-primary/20 hover:border-secondary/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/10">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-spin">
                <Award className="w-12 h-12 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">最高水準</h3>
              <p className="text-gray-300 text-lg">業界最高レベルのサービス</p>
              <div className="mt-4 w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Quality Assurance */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                審査通過したキャストは容姿、作法、実技ともに洗練されています
              </h2>
                <p className="text-2xl text-gray-200 leading-relaxed">
                審査通過率は10%と狭き門となっています。
              </p>
              </div>
              
              <div className="space-y-6">
                <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-secondary/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center group-hover:animate-pulse">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl text-white font-semibold group-hover:text-secondary transition-colors">容姿の審査</span>
                </div>
                
                <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-secondary/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center group-hover:animate-bounce">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl text-white font-semibold group-hover:text-secondary transition-colors">作法の審査</span>
                </div>
                
                <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-secondary/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center group-hover:animate-spin">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl text-white font-semibold group-hover:text-secondary transition-colors">実技の審査</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-12 border border-white/20 backdrop-blur-sm shadow-2xl">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="text-8xl md:text-9xl font-bold text-secondary mb-4 animate-pulse">10%</div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary/30 rounded-full animate-ping"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/20 rounded-full animate-bounce"></div>
                  </div>
                  <p className="text-2xl text-white font-semibold">審査通過率</p>
                  <div className="w-24 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
                </div>
              </div>
              
              {/* Floating elements around the card */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-secondary/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Regular Quality Checks */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
              審査通過後も定期的な品質チェックを設けています
            </h2>
              <p className="text-2xl text-gray-300 max-w-5xl mx-auto leading-relaxed">
              一度合格となったエステシャンも審査面接時の品質基準を維持できているかどうか、<br />
              厳格にレビューチェックを行い、定期的な評価の場を設定しています。
            </p>
          </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl p-10 shadow-2xl border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mb-8 group-hover:animate-pulse">
                <Clock className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-secondary transition-colors">定期評価</h3>
              <p className="text-gray-300 text-lg leading-relaxed">定期的な品質チェックを実施</p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl p-10 shadow-2xl border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mb-8 group-hover:animate-bounce">
                <CheckCircle className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-secondary transition-colors">品質維持</h3>
              <p className="text-gray-300 text-lg leading-relaxed">審査基準の継続的な維持</p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl p-10 shadow-2xl border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mb-8 group-hover:animate-spin">
                <Settings className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-secondary transition-colors">厳格チェック</h3>
              <p className="text-gray-300 text-lg leading-relaxed">厳格なレビューチェック</p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Service Scenes */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
              シーンに合わせてPishattoをご利用ください
            </h2>
              <p className="text-2xl text-gray-200 leading-relaxed">
              24/365で、プライベートはもちろん、ビジネスシーンでもご利用が可能です。
            </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-8 text-center border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="mb-8 relative overflow-hidden rounded-2xl">
                <img 
                  src="/thai.webp" 
                  alt="Thai massage" 
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-secondary/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Traditional
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">タイ古式マッサージ</h3>
              <p className="text-gray-200 text-lg leading-relaxed">伝統的なタイ式の施術で心身をリフレッシュ</p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-8 text-center border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="mb-8 relative overflow-hidden rounded-2xl">
                <img 
                  src="/bali.webp" 
                  alt="Bali oil massage" 
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-secondary/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Premium
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">バリ風オイルマッサージ</h3>
              <p className="text-gray-200 text-lg leading-relaxed">バリ島の伝統的なオイルマッサージで至福のひととき</p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-8 text-center border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="mb-8 relative overflow-hidden rounded-2xl">
                <img 
                  src="/lomi.webp" 
                  alt="Lomi lomi massage" 
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-secondary/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Luxury
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">贅沢にロミロミマッサージ</h3>
              <p className="text-gray-200 text-lg leading-relaxed">ハワイの伝統的なロミロミで極上のリラクゼーション</p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 - Receipt Feature */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="space-y-8">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <FileText className="w-12 h-12 text-secondary" />
            </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
              施術代として領収書発行が可能な機能を搭載しています
            </h2>
              
              <p className="text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              ビジネス利用でも安心してご利用いただけます
            </p>
              
              <div className="mt-12 inline-flex items-center gap-4 bg-gradient-to-r from-primary/20 to-secondary/20 px-8 py-4 rounded-full border border-secondary/30">
                <CheckCircle className="w-6 h-6 text-secondary" />
                <span className="text-lg text-white font-semibold">法人利用対応</span>
                <div className="w-1 h-6 bg-secondary/50"></div>
                <span className="text-lg text-white font-semibold">経費精算可能</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 - Guest Systems */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
              Pishattoゲストのために２つの独自システムを採用しています
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16">
            <div className="group text-center bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-12 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:animate-pulse">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-white group-hover:text-secondary transition-colors">上級グレードのゲスト様には特別な体験をご提供</h3>
              <p className="text-gray-200 text-lg leading-relaxed">VIP待遇で特別なサービスをお楽しみください</p>
              <div className="mt-8 w-20 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group text-center bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-12 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/80 to-secondary/60 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:animate-bounce">
                <Gift className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-white group-hover:text-secondary transition-colors">ゲストのステータスに合わせて様々な特典をご用意</h3>
              <p className="text-gray-200 text-lg leading-relaxed">利用実績に応じた特別な特典をご用意</p>
              <div className="mt-8 w-20 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 - Titles System */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
              Pishatto称号システム
            </h2>
              <p className="text-2xl text-gray-300 max-w-5xl mx-auto leading-relaxed">
              Pishattoゲスト様の振る舞いや利用実績、グレード等に応じて、<br />
              Pishatto称号が付与されます。運営事務局から付与された称号は、<br />
              メンズエステシャンのキャスト側のアプリにも大々的に表示されます。
            </p>
          </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl p-10 shadow-2xl text-center border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:animate-pulse">
                <Star className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">プレミアム</h3>
              <p className="text-gray-300 text-lg">特別な称号</p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl p-10 shadow-2xl text-center border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:animate-bounce">
                <Crown className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">VIP</h3>
              <p className="text-gray-300 text-lg">上級称号</p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl p-10 shadow-2xl text-center border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:animate-spin">
                <Award className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">ロイヤルVIP</h3>
              <p className="text-gray-300 text-lg">最高級称号</p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9 - User Testimonials */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
              Pishattoゲストユーザの声
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-10 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mr-6 group-hover:animate-pulse">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white group-hover:text-secondary transition-colors">会社経営者 様</h4>
                </div>
              </div>
              <p className="text-gray-200 text-lg italic leading-relaxed">
                "お店に行くのが不要になって時間効率化上がった"
              </p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-white to-secondary rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-10 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mr-6 group-hover:animate-bounce">
                  <Heart className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white group-hover:text-secondary transition-colors">個人事業主 様</h4>
                </div>
              </div>
              <p className="text-gray-200 text-lg italic leading-relaxed">
                "本日初めて利用しましたが、疲れが一気に取れました！トークも軽快で面白く、あっという間に時間が過ぎ去りました。"
              </p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-white to-secondary rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-10 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mr-6 group-hover:animate-spin">
                  <Star className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white group-hover:text-secondary transition-colors">美容外科医 様</h4>
                </div>
              </div>
              <p className="text-gray-200 text-lg italic leading-relaxed">
                "日々の疲れがたまっていたので、ピシャットを利用しました。施術のクオリティが高く、大満足の一言です。また夜勤明けに利用させていただきます。"
              </p>
              <div className="mt-6 w-16 h-1 bg-gradient-to-r from-white to-secondary rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10 - Matching Methods */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="mb-12 group">
              <div className="relative inline-block">
              <img 
                src="/mobile.webp" 
                alt="Mobile app interface" 
                  className="w-full max-w-5xl mx-auto rounded-3xl shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 transform group-hover:scale-105"
              />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
                <div className="absolute top-4 right-4 bg-secondary/90 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                  Easy Matching
                </div>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
              Pishattoゲスト様に合わせた２つのマッチング方法をご用意しております
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl p-10 shadow-2xl border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="text-center mb-10">
                <div className="w-24 h-24 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse">
                  <Users className="w-12 h-12 text-secondary" />
                </div>
                <h3 className="text-3xl font-bold mb-6 text-white group-hover:text-secondary transition-colors">フリーで呼ぶ</h3>
                <p className="text-gray-200 text-lg leading-relaxed">
                  ゲスト様ご指定の場所にメンズエステシャンのキャストをフリーで募集できます。
                </p>
              </div>
              <div className="space-y-6 mb-10">
                <div className="group/step flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-pulse">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-200 text-lg">場所・時間・人数を選択します</p>
                </div>
                <div className="group/step flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-bounce">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-200 text-lg">お好みの指圧やオイルの香りなど、詳細条件を選択します</p>
                </div>
                <div className="group/step flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-spin">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-200 text-lg">確定した後は最短30分でゲスト様のもとにキャストが伺います</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
                <h4 className="text-xl font-bold mb-4 text-white">料金</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-gray-200 font-semibold">プレミアムキャスト</span>
                    <span className="text-secondary font-bold">30分●円</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-gray-200 font-semibold">VIPキャスト</span>
                    <span className="text-secondary font-bold">30分●円</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-gray-200 font-semibold">ロイヤルVIPキャスト</span>
                    <span className="text-secondary font-bold">30分●円</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl p-10 shadow-2xl border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="text-center mb-10">
                <div className="w-24 h-24 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce">
                  <Heart className="w-12 h-12 text-secondary" />
                </div>
                <h3 className="text-3xl font-bold mb-6 text-white group-hover:text-secondary transition-colors">指名でピシャッと呼ぶ</h3>
                <p className="text-gray-200 text-lg leading-relaxed">
                  ゲスト様ご指定の場所にご指定のメンズエステシャンのキャストを指名で呼びます。
                </p>
              </div>
              <div className="space-y-6">
                <div className="group/step flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-pulse">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-200 text-lg">キャスト一覧から指名したいキャストを探します</p>
                </div>
                <div className="group/step flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-bounce">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-200 text-lg">気になるキャストがいたらいいねを送り、メッセージします</p>
                </div>
                <div className="group/step flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-spin">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-200 text-lg">メッセージで日程調整し、都合が付いたらスケジュール提案するだけです</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11 - FAQ */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
              よくある質問
            </h2>
          </div>
          
          <div className="space-y-8">
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-8 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:animate-pulse">
                  <HelpCircle className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">アプリの登録は無料ですか？</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">はい。無料で登録できます。マッチング（合流）するまで料金は一切かかりません。</p>
                </div>
              </div>
            </div>
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-8 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:animate-bounce">
                  <HelpCircle className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">誰でも利用可能なのでしょうか？</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">満18歳以上であることを本人確認させていただいております。本人確認が済んだ方でしたら誰でもご利用可能です。</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-8 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:animate-spin">
                  <HelpCircle className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">領収書は発行可能ですか？</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">はい。ご利用後アプリ上に領収書が発行されます。</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-8 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:animate-pulse">
                  <HelpCircle className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">お支払方法は何がありますか？</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">クレジットカード、デビットカードともにご利用できます。</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-3xl p-8 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:animate-bounce">
                  <HelpCircle className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-secondary transition-colors">利用場所に指定はありますか？</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">ご自宅と宿泊施設となっております。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
            今すぐPishattoを始めましょう
          </h2>
            <p className="text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto">
            ピシャッと素敵な空間をご提供します
          </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <button
              onClick={handleGuestStart}
                className="group bg-white text-primary px-12 py-6 rounded-full font-bold text-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-white/25 hover:scale-105 transform"
            >
                <Users className="w-6 h-6 group-hover:animate-bounce" />
              ゲストとして始める
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
            </button>
            <button
              onClick={handleCastStart}
                className="group bg-transparent border-2 border-white text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-white hover:text-primary transition-all duration-300 flex items-center gap-3 hover:scale-105 transform backdrop-blur-sm"
            >
                <Crown className="w-6 h-6 group-hover:animate-pulse" />
              キャストとして始める
                <Heart className="w-5 h-5 group-hover:animate-bounce" />
            </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-primary via-primary/95 to-secondary relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
                Pishatto
              </h3>
              <p className="text-xl text-gray-200 mb-8">ピシャッと素敵な空間をご提供</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-lg">
              <a href="/legal/terms" className="text-gray-300 hover:text-secondary transition-colors duration-300 font-semibold">
                利用規約
              </a>
              <div className="w-1 h-6 bg-gray-400/50"></div>
              <a href="/legal/privacy" className="text-gray-300 hover:text-secondary transition-colors duration-300 font-semibold">
                プライバシーポリシー
              </a>
              <div className="w-1 h-6 bg-gray-400/50"></div>
              <a href="/legal/specified-commercial" className="text-gray-300 hover:text-secondary transition-colors duration-300 font-semibold">
                特定商取引法に基づく表記
              </a>
            </div>
            
            <div className="pt-8 border-t border-white/20">
              <p className="text-gray-400 text-lg">© 2024 Pishatto. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

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
      <section className="relative min-h-screen bg-gradient-to-br from-primary via-primary/90 to-secondary text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: 'url("/hero.webp")'
        }}></div>
        
        {/* Animated Background Elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
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
        <div className="relative min-h-screen flex items-center justify-center px-4 py-16 z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated Logo/Brand */}
            <div className="mb-6 sm:mb-8 animate-fade-in-up">
              <div className="inline-block relative">
                <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-primary/95 to-secondary bg-clip-text text-transparent animate-pulse">
                  Pishatto
                </h1>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-secondary rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 bg-white/60 rounded-full animate-bounce"></div>
              </div>
            </div>

            {/* Subtitle with animation */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 text-white/90 font-light animate-fade-in-up leading-relaxed" style={{animationDelay: '0.5s'}}>
              ピシャッと素敵な空間をご提供
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center mb-6 sm:mb-8 animate-fade-in-up w-full max-w-md mx-auto relative z-20" style={{animationDelay: '1s'}}>
              <button
                onClick={handleGuestStart}
                className="group bg-white text-primary px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-2xl hover:shadow-white/25 hover:scale-105 transform w-full justify-center relative z-30"
              >
                <img src="/LINE.png" alt="LINE" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:animate-bounce" />
                <span className="text-sm sm:text-base md:text-lg">LINEで始める</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-spin" />
              </button>
              <button
                onClick={handleGuestStart}
                className="group bg-transparent border-2 border-white text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl hover:bg-white hover:text-primary transition-all duration-300 flex items-center gap-2 sm:gap-3 hover:scale-105 transform backdrop-blur-sm w-full justify-center relative z-30"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" />
                <span className="text-sm sm:text-base md:text-lg">電話番号で始める</span>
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" />
              </button>
            </div>

            {/* Cast Registration Link */}
            <div className="animate-fade-in-up relative z-20" style={{animationDelay: '1.5s'}}>
              <button
                onClick={handleCastStart}
                className="text-white/70 hover:text-white underline text-base sm:text-lg hover:text-xl transition-all duration-300 flex items-center gap-2 mx-auto group relative z-30"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
                <span className="text-sm sm:text-base">キャストに登録したい方はこちら</span>
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 group-hover:animate-bounce" />
              </button>
            </div>
          </div>
        </div>

        {/* Gradient overlay for better text readability - positioned behind content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-0"></div>
      </section>

      {/* Section 2 - Industry Standards */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="mb-8 sm:mb-12 group">
              <div className="relative inline-block">
                <img 
                  src="/mans-estist.webp" 
                  alt="Professional massage therapist" 
                  className="w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl sm:rounded-3xl"></div>
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-secondary/90 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-sm">
                  Premium Quality
                </div>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent leading-tight">
                業界最高水準のメンズエステシャンが登録
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
                唯一無二のサービスとしてスタート。<br className="hidden sm:block" />
                審査は複数回実施。審査通過率は10%以下の超難関を突破した<br className="hidden sm:block" />
                メンズエステシャンがお待ちしています。
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="group text-center bg-gradient-to-br from-primary/10 to-secondary/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-primary/20 hover:border-secondary/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:animate-pulse">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">厳格な審査</h3>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg">複数回の審査を実施</p>
              <div className="mt-3 sm:mt-4 w-12 sm:w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group text-center bg-gradient-to-br from-primary/10 to-secondary/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-primary/20 hover:border-secondary/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:animate-bounce">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">10%の通過率</h3>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg">超難関を突破したエステシャン</p>
              <div className="mt-3 sm:mt-4 w-12 sm:w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group text-center bg-gradient-to-br from-primary/10 to-secondary/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-primary/20 hover:border-secondary/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:animate-spin">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">最高水準</h3>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg">業界最高レベルのサービス</p>
              <div className="mt-3 sm:mt-4 w-12 sm:w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Quality Assurance */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                  審査通過したキャストは容姿、作法、実技ともに洗練されています
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed">
                  審査通過率は10%と狭き門となっています。
                </p>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-secondary/50">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center group-hover:animate-pulse flex-shrink-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-base sm:text-lg md:text-xl text-white font-semibold group-hover:text-secondary transition-colors">容姿の審査</span>
                </div>
                
                <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-secondary/50">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center group-hover:animate-bounce flex-shrink-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-base sm:text-lg md:text-xl text-white font-semibold group-hover:text-secondary transition-colors">作法の審査</span>
                </div>
                
                <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-secondary/50">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center group-hover:animate-spin flex-shrink-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-base sm:text-lg md:text-xl text-white font-semibold group-hover:text-secondary transition-colors">実技の審査</span>
                </div>
              </div>
            </div>
            
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-white/20 backdrop-blur-sm shadow-2xl">
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="relative">
                    <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-secondary mb-2 sm:mb-4 animate-pulse">10%</div>
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-secondary/30 rounded-full animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 bg-white/20 rounded-full animate-bounce"></div>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl text-white font-semibold">審査通過率</p>
                  <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
                </div>
              </div>
              
              {/* Floating elements around the card - Hidden on mobile */}
              <div className="hidden sm:block absolute -top-4 -right-4 w-8 h-8 bg-secondary/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="hidden sm:block absolute -bottom-4 -left-4 w-6 h-6 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Regular Quality Checks */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-20 left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent leading-tight">
                審査通過後も定期的な品質チェックを設けています
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
                一度合格となったエステシャンも審査面接時の品質基準を維持できているかどうか、<br className="hidden sm:block" />
                厳格にレビューチェックを行い、定期的な評価の場を設定しています。
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:animate-pulse">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-white group-hover:text-secondary transition-colors text-center">定期評価</h3>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed text-center">定期的な品質チェックを実施</p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:animate-bounce">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-white group-hover:text-secondary transition-colors text-center">品質維持</h3>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed text-center">審査基準の継続的な維持</p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:animate-spin">
                <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-white group-hover:text-secondary transition-colors text-center">厳格チェック</h3>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed text-center">厳格なレビューチェック</p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Service Scenes */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent leading-tight">
                シーンに合わせてPishattoをご利用ください
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed px-4">
                24/365で、プライベートはもちろん、ビジネスシーンでもご利用が可能です。
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-xl sm:rounded-2xl">
                <img 
                  src="/thai.webp" 
                  alt="Thai massage" 
                  className="w-full h-40 sm:h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-secondary/90 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                  Traditional
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">タイ古式マッサージ</h3>
              <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">伝統的なタイ式の施術で心身をリフレッシュ</p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-xl sm:rounded-2xl">
                <img 
                  src="/bali.webp" 
                  alt="Bali oil massage" 
                  className="w-full h-40 sm:h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-secondary/90 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                  Premium
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">バリ風オイルマッサージ</h3>
              <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">バリ島の伝統的なオイルマッサージで至福のひととき</p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
              <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-xl sm:rounded-2xl">
                <img 
                  src="/lomi.webp" 
                  alt="Lomi lomi massage" 
                  className="w-full h-40 sm:h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-secondary/90 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                  Luxury
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">贅沢にロミロミマッサージ</h3>
              <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">ハワイの伝統的なロミロミで極上のリラクゼーション</p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 - Receipt Feature */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-20 right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-pulse">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-secondary" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent leading-tight px-4">
                施術代として領収書発行が可能な機能を搭載しています
              </h2>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto px-4">
                ビジネス利用でも安心してご利用いただけます
              </p>
              
              <div className="mt-8 sm:mt-12 inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-gradient-to-r from-primary/20 to-secondary/20 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full border border-secondary/30">
                <div className="flex items-center gap-2 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                  <span className="text-sm sm:text-base md:text-lg text-white font-semibold">法人利用対応</span>
                </div>
                <div className="hidden sm:block w-1 h-6 bg-secondary/50"></div>
                <span className="text-sm sm:text-base md:text-lg text-white font-semibold">経費精算可能</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 - Guest Systems */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent leading-tight px-4">
              Pishattoゲストのために２つの独自システムを採用しています
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
            <div className="group text-center bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:animate-pulse">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white group-hover:text-secondary transition-colors leading-tight">上級グレードのゲスト様には特別な体験をご提供</h3>
              <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">VIP待遇で特別なサービスをお楽しみください</p>
              <div className="mt-6 sm:mt-8 w-16 sm:w-20 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group text-center bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary/80 to-secondary/60 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:animate-bounce">
                <Gift className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white group-hover:text-secondary transition-colors leading-tight">ゲストのステータスに合わせて様々な特典をご用意</h3>
              <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">利用実績に応じた特別な特典をご用意</p>
              <div className="mt-6 sm:mt-8 w-16 sm:w-20 h-1 bg-gradient-to-r from-white to-secondary mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 - Titles System */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent leading-tight">
                Pishatto称号システム
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
                Pishattoゲスト様の振る舞いや利用実績、グレード等に応じて、<br className="hidden sm:block" />
                Pishatto称号が付与されます。運営事務局から付与された称号は、<br className="hidden sm:block" />
                メンズエステシャンのキャスト側のアプリにも大々的に表示されます。
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl text-center border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:animate-pulse">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">プレミアム</h3>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg">特別な称号</p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl text-center border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:animate-bounce">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">VIP</h3>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg">上級称号</p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl text-center border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:animate-spin">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">ロイヤルVIP</h3>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg">最高級称号</p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9 - User Testimonials */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent leading-tight">
              Pishattoゲストユーザの声
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mr-4 sm:mr-6 group-hover:animate-pulse flex-shrink-0">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-secondary transition-colors">会社経営者 様</h4>
                </div>
              </div>
              <p className="text-gray-200 text-sm sm:text-base md:text-lg italic leading-relaxed">
                "お店に行くのが不要になって時間効率化上がった"
              </p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-white to-secondary rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mr-4 sm:mr-6 group-hover:animate-bounce flex-shrink-0">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-secondary transition-colors">個人事業主 様</h4>
                </div>
              </div>
              <p className="text-gray-200 text-sm sm:text-base md:text-lg italic leading-relaxed">
                "本日初めて利用しましたが、疲れが一気に取れました！トークも軽快で面白く、あっという間に時間が過ぎ去りました。"
              </p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-white to-secondary rounded-full"></div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mr-4 sm:mr-6 group-hover:animate-spin flex-shrink-0">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-secondary transition-colors">美容外科医 様</h4>
                </div>
              </div>
              <p className="text-gray-200 text-sm sm:text-base md:text-lg italic leading-relaxed">
                "日々の疲れがたまっていたので、ピシャットを利用しました。施術のクオリティが高く、大満足の一言です。また夜勤明けに利用させていただきます。"
              </p>
              <div className="mt-4 sm:mt-6 w-12 sm:w-16 h-1 bg-gradient-to-r from-white to-secondary rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10 - Matching Methods */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-20 left-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="mb-8 sm:mb-12 group">
              <div className="relative inline-block">
                <img 
                  src="/mobile.webp" 
                  alt="Mobile app interface" 
                  className="w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl sm:rounded-3xl"></div>
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-secondary/90 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-sm">
                  Easy Matching
                </div>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent leading-tight px-4">
              Pishattoゲスト様に合わせた２つのマッチング方法をご用意しております
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="text-center mb-8 sm:mb-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:animate-pulse">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-secondary" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white group-hover:text-secondary transition-colors leading-tight">フリーで呼ぶ</h3>
                <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">
                  ゲスト様ご指定の場所にメンズエステシャンのキャストをフリーで募集できます。
                </p>
              </div>
              <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                <div className="group/step flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-pulse">
                    <span className="text-white text-xs sm:text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg">場所・時間・人数を選択します</p>
                </div>
                <div className="group/step flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-bounce">
                    <span className="text-white text-xs sm:text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg">お好みの指圧やオイルの香りなど、詳細条件を選択します</p>
                </div>
                <div className="group/step flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-spin">
                    <span className="text-white text-xs sm:text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg">確定した後は最短30分でゲスト様のもとにキャストが伺います</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/10 to-secondary/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 backdrop-blur-sm">
                <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">料金</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5">
                    <span className="text-gray-200 font-semibold text-sm sm:text-base">プレミアムキャスト</span>
                    <span className="text-secondary font-bold text-sm sm:text-base">30分●円</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5">
                    <span className="text-gray-200 font-semibold text-sm sm:text-base">VIPキャスト</span>
                    <span className="text-secondary font-bold text-sm sm:text-base">30分●円</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5">
                    <span className="text-gray-200 font-semibold text-sm sm:text-base">ロイヤルVIPキャスト</span>
                    <span className="text-secondary font-bold text-sm sm:text-base">30分●円</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-primary/30 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-primary/20">
              <div className="text-center mb-8 sm:mb-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:animate-bounce">
                  <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-secondary" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white group-hover:text-secondary transition-colors leading-tight">指名でピシャッと呼ぶ</h3>
                <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">
                  ゲスト様ご指定の場所にご指定のメンズエステシャンのキャストを指名で呼びます。
                </p>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="group/step flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-pulse">
                    <span className="text-white text-xs sm:text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg">キャスト一覧から指名したいキャストを探します</p>
                </div>
                <div className="group/step flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-bounce">
                    <span className="text-white text-xs sm:text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg">気になるキャストがいたらいいねを送り、メッセージします</p>
                </div>
                <div className="group/step flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover/step:animate-spin">
                    <span className="text-white text-xs sm:text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg">メッセージで日程調整し、都合が付いたらスケジュール提案するだけです</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11 - FAQ */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary/90 relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent leading-tight">
              よくある質問
            </h2>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:animate-pulse">
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">アプリの登録は無料ですか？</h3>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">はい。無料で登録できます。マッチング（合流）するまで料金は一切かかりません。</p>
                </div>
              </div>
            </div>
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:animate-bounce">
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">誰でも利用可能なのでしょうか？</h3>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">満18歳以上であることを本人確認させていただいております。本人確認が済んだ方でしたら誰でもご利用可能です。</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:animate-spin">
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">領収書は発行可能ですか？</h3>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">はい。ご利用後アプリ上に領収書が発行されます。</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:animate-pulse">
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">お支払方法は何がありますか？</h3>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">クレジットカード、デビットカードともにご利用できます。</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-white/10 to-secondary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-secondary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary/30 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:animate-bounce">
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white group-hover:text-secondary transition-colors">利用場所に指定はありますか？</h3>
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">ご自宅と宿泊施設となっております。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary via-primary/95 to-secondary relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent leading-tight px-4">
              今すぐPishattoを始めましょう
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto px-4">
              ピシャッと素敵な空間をご提供します
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8 sm:mt-12 max-w-md sm:max-w-none mx-auto">
              <button
                onClick={handleGuestStart}
                className="group bg-white text-primary px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-full font-bold text-lg sm:text-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-2xl hover:shadow-white/25 hover:scale-105 transform w-full sm:w-auto justify-center"
              >
                <Users className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce" />
                <span className="text-sm sm:text-base md:text-lg">ゲストとして始める</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-spin" />
              </button>
              <button
                onClick={handleCastStart}
                className="group bg-transparent border-2 border-white text-white px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-full font-bold text-lg sm:text-xl hover:bg-white hover:text-primary transition-all duration-300 flex items-center gap-2 sm:gap-3 hover:scale-105 transform backdrop-blur-sm w-full sm:w-auto justify-center"
              >
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" />
                <span className="text-sm sm:text-base md:text-lg">キャストとして始める</span>
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-primary via-primary/95 to-secondary relative overflow-hidden">
        {/* Background decorative elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4 bg-gradient-to-r from-white via-white to-secondary bg-clip-text text-transparent">
                Pishatto
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8">ピシャッと素敵な空間をご提供</p>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-sm sm:text-base md:text-lg">
              <a href="/legal/terms" className="text-gray-300 hover:text-secondary transition-colors duration-300 font-semibold">
                利用規約
              </a>
              <div className="hidden sm:block w-1 h-6 bg-gray-400/50"></div>
              <a href="/legal/privacy" className="text-gray-300 hover:text-secondary transition-colors duration-300 font-semibold">
                プライバシーポリシー
              </a>
              <div className="hidden sm:block w-1 h-6 bg-gray-400/50"></div>
              <a href="/legal/specified-commercial" className="text-gray-300 hover:text-secondary transition-colors duration-300 font-semibold">
                特定商取引法に基づく表記
              </a>
            </div>
            
            <div className="pt-6 sm:pt-8 border-t border-white/20">
              <p className="text-gray-400 text-sm sm:text-base md:text-lg">© 2024 Pishatto. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

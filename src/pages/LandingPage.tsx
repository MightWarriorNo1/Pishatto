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
    navigate('/cast/login');
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Pishatto
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/80">
              ピシャッと素敵な空間をご提供
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGuestStart}
                className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                LINEで始める
              </button>
              <button
                onClick={handleGuestStart}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition-colors flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                電話番号で始める
              </button>
            </div>
            <div className="mt-8">
              <button
                onClick={handleCastStart}
                className="text-white/70 hover:text-white underline text-lg"
              >
                キャストに登録したい方はこちら
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Industry Standards */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Professional massage therapist" 
                className="w-full max-w-4xl mx-auto rounded-2xl shadow-lg"
              />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              業界最高水準のメンズエステシャンが登録
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              唯一無二のサービスとしてスタート。<br />
              審査は複数回実施。審査通過率は10%以下の超難関を突破した<br />
              メンズエステシャンがお待ちしています。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">厳格な審査</h3>
              <p className="text-gray-300">複数回の審査を実施</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">10%の通過率</h3>
              <p className="text-gray-300">超難関を突破したエステシャン</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">最高水準</h3>
              <p className="text-gray-300">業界最高レベルのサービス</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Quality Assurance */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                審査通過したキャストは容姿、作法、実技ともに洗練されています
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                審査通過率は10%と狭き門となっています。
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-lg text-white">容姿の審査</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-lg text-white">作法の審査</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-lg text-white">実技の審査</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 border border-secondary/30">
              <div className="text-center">
                <div className="text-6xl font-bold text-secondary mb-2">10%</div>
                <p className="text-xl text-gray-300">審査通過率</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Regular Quality Checks */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              審査通過後も定期的な品質チェックを設けています
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              一度合格となったエステシャンも審査面接時の品質基準を維持できているかどうか、<br />
              厳格にレビューチェックを行い、定期的な評価の場を設定しています。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-primary/50 rounded-2xl p-8 shadow-lg border border-secondary/20">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">定期評価</h3>
              <p className="text-gray-300">定期的な品質チェックを実施</p>
            </div>
            <div className="bg-primary/50 rounded-2xl p-8 shadow-lg border border-secondary/20">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">品質維持</h3>
              <p className="text-gray-300">審査基準の継続的な維持</p>
            </div>
            <div className="bg-primary/50 rounded-2xl p-8 shadow-lg border border-secondary/20">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                <Settings className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">厳格チェック</h3>
              <p className="text-gray-300">厳格なレビューチェック</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Service Scenes */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              シーンに合わせてPishattoをご利用ください
            </h2>
            <p className="text-xl text-gray-300">
              24/365で、プライベートはもちろん、ビジネスシーンでもご利用が可能です。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-primary/30 to-secondary/20 rounded-2xl p-8 text-center border border-secondary/30">
              <div className="mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Thai massage" 
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">タイ古式マッサージ</h3>
              <p className="text-gray-300">伝統的なタイ式の施術で心身をリフレッシュ</p>
            </div>
            <div className="bg-gradient-to-br from-primary/30 to-secondary/20 rounded-2xl p-8 text-center border border-secondary/30">
              <div className="mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1596178060810-6b0b0b0b0b0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Bali oil massage" 
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">バリ風オイルマッサージ</h3>
              <p className="text-gray-300">バリ島の伝統的なオイルマッサージで至福のひととき</p>
            </div>
            <div className="bg-gradient-to-br from-primary/30 to-secondary/20 rounded-2xl p-8 text-center border border-secondary/30">
              <div className="mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Lomi lomi massage" 
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">贅沢にロミロミマッサージ</h3>
              <p className="text-gray-300">ハワイの伝統的なロミロミで極上のリラクゼーション</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 - Receipt Feature */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-secondary" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              施術代として領収書発行が可能な機能を搭載しています
            </h2>
            <p className="text-xl text-gray-300">
              ビジネス利用でも安心してご利用いただけます
            </p>
          </div>
        </div>
      </section>

      {/* Section 7 - Guest Systems */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Pishattoゲストのために２つの独自システムを採用しています
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">上級グレードのゲスト様には特別な体験をご提供</h3>
              <p className="text-gray-300">VIP待遇で特別なサービスをお楽しみください</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/80 to-secondary/60 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">ゲストのステータスに合わせて様々な特典をご用意</h3>
              <p className="text-gray-300">利用実績に応じた特別な特典をご用意</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 - Titles System */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Pishatto称号システム
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Pishattoゲスト様の振る舞いや利用実績、グレード等に応じて、<br />
              Pishatto称号が付与されます。運営事務局から付与された称号は、<br />
              メンズエステシャンのキャスト側のアプリにも大々的に表示されます。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-primary/50 rounded-2xl p-8 shadow-lg text-center border border-secondary/20">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">プレミアム</h3>
              <p className="text-gray-300">特別な称号</p>
            </div>
            <div className="bg-primary/50 rounded-2xl p-8 shadow-lg text-center border border-secondary/20">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">VIP</h3>
              <p className="text-gray-300">上級称号</p>
            </div>
            <div className="bg-primary/50 rounded-2xl p-8 shadow-lg text-center border border-secondary/20">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">ロイヤルVIP</h3>
              <p className="text-gray-300">最高級称号</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9 - User Testimonials */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Pishattoゲストユーザの声
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-primary/50 rounded-2xl p-8 border border-secondary/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">会社経営者 様</h4>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "お店に行くのが不要になって時間効率化上がった"
              </p>
            </div>
            <div className="bg-primary/50 rounded-2xl p-8 border border-secondary/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mr-4">
                  <Heart className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">個人事業主 様</h4>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "本日初めて利用しましたが、疲れが一気に取れました！トークも軽快で面白く、あっという間に時間が過ぎ去りました。"
              </p>
            </div>
            <div className="bg-primary/50 rounded-2xl p-8 border border-secondary/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">美容外科医 様</h4>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "日々の疲れがたまっていたので、ピシャットを利用しました。施術のクオリティが高く、大満足の一言です。また夜勤明けに利用させていただきます。"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10 - Matching Methods */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-8">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Mobile app interface" 
                className="w-full max-w-4xl mx-auto rounded-2xl shadow-lg"
              />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Pishattoゲスト様に合わせた２つのマッチング方法をご用意しております
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-primary/50 rounded-2xl p-8 shadow-lg border border-secondary/20">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">フリーで呼ぶ</h3>
                <p className="text-gray-300">
                  ゲスト様ご指定の場所にメンズエステシャンのキャストをフリーで募集できます。
                </p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-secondary text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-300">場所・時間・人数を選択します</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-secondary text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-300">お好みの指圧やオイルの香りなど、詳細条件を選択します</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-secondary text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-300">確定した後は最短30分でゲスト様のもとにキャストが伺います</p>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-secondary/20">
                <h4 className="font-semibold mb-2 text-white">料金</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>プレミアムキャスト</span>
                    <span>30分●円</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>VIPキャスト</span>
                    <span>30分●円</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>ロイヤルVIPキャスト</span>
                    <span>30分●円</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/50 rounded-2xl p-8 shadow-lg border border-secondary/20">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">指名でピシャッと呼ぶ</h3>
                <p className="text-gray-300">
                  ゲスト様ご指定の場所にご指定のメンズエステシャンのキャストを指名で呼びます。
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-secondary text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-300">キャスト一覧から指名したいキャストを探します</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-secondary text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-300">気になるキャストがいたらいいねを送り、メッセージします</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-secondary text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-300">メッセージで日程調整し、都合が付いたらスケジュール提案するだけです</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11 - FAQ */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              よくある質問
            </h2>
          </div>
          <div className="space-y-6">
            <div className="bg-primary/50 rounded-2xl p-6 border border-secondary/20">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">アプリの登録は無料ですか？</h3>
                  <p className="text-gray-300">はい。無料で登録できます。マッチング（合流）するまで料金は一切かかりません。</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/50 rounded-2xl p-6 border border-secondary/20">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">誰でも利用可能なのでしょうか？</h3>
                  <p className="text-gray-300">満18歳以上であることを本人確認させていただいております。本人確認が済んだ方でしたら誰でもご利用可能です。</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/50 rounded-2xl p-6 border border-secondary/20">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">領収書は発行可能ですか？</h3>
                  <p className="text-gray-300">はい。ご利用後アプリ上に領収書が発行されます。</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/50 rounded-2xl p-6 border border-secondary/20">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">お支払方法は何がありますか？</h3>
                  <p className="text-gray-300">クレジットカード、デビットカードともにご利用できます。</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/50 rounded-2xl p-6 border border-secondary/20">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">利用場所に指定はありますか？</h3>
                  <p className="text-gray-300">ご自宅と宿泊施設となっております。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            今すぐPishattoを始めましょう
          </h2>
          <p className="text-xl mb-8 text-white/80">
            ピシャッと素敵な空間をご提供します
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGuestStart}
              className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors"
            >
              ゲストとして始める
            </button>
            <button
              onClick={handleCastStart}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition-colors"
            >
              キャストとして始める
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Pishatto</h3>
            <p className="text-gray-300 mb-6">ピシャッと素敵な空間をご提供</p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="/legal/terms" className="text-gray-300 hover:text-white">利用規約</a>
              <a href="/legal/privacy" className="text-gray-300 hover:text-white">プライバシーポリシー</a>
              <a href="/legal/specified-commercial" className="text-gray-300 hover:text-white">特定商取引法に基づく表記</a>
            </div>
            <p className="text-gray-400 text-sm mt-6">© 2024 Pishatto. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

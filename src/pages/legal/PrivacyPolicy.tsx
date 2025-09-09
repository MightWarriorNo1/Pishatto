import React from 'react';
import LegalLayout from './LegalLayout';

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalLayout title="プライバシーポリシー">
      <section className="space-y-8">
        <p>株式会社ジーン / GeNEE Corp.（以下「当社」といいます。）は、個人情報保護の重要性を認識し、個人情報保護法を遵守のうえ、以下の方針に従い適切に取扱います。</p>

        <div>
          <h2 className="text-lg font-semibold">1. 個人情報の定義</h2>
          <p>個人情報保護法第2条第1項に定義される個人情報をいいます。</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">2. 利用目的</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>当社サービス等の提供</li>
            <li>ご案内・お問合せ対応</li>
            <li>当社サービス等のご案内</li>
            <li>規約等違反行為への対応</li>
            <li>規約等の変更等の通知</li>
            <li>サービス改善・新サービス開発</li>
            <li>閲覧・行動・購買履歴の把握と分析、機能改善及び新商品・サービス開発・広告</li>
            <li>雇用管理・社内手続（役職員）</li>
            <li>株主管理・法令手続対応（株主等）</li>
            <li>個人を識別できない統計データの作成</li>
            <li>上記目的に付随する目的</li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-semibold">3. 利用目的の変更</h2>
          <p>関連性を有すると合理的に認められる範囲で変更し、変更時は通知又は公表します。</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">4. 利用の制限</h2>
          <p>法令で許容される場合を除き、同意なく目的外利用は行いません。ただし次の各号の場合を除きます。</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>法令に基づく場合</li>
            <li>生命・身体・財産の保護で同意取得が困難な場合</li>
            <li>公衆衛生・児童の健全育成で特に必要な場合</li>
            <li>国・地方公共団体の法令事務に協力が必要で同意取得が支障となる場合</li>
            <li>学術研究機関等に提供する場合 等</li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-semibold">5. 取得</h2>
          <p>適正に取得し、不正の手段により取得しません。要配慮個人情報は原則同意のうえ取得します（法令等で認められる場合を除く）。</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">6. 安全管理</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>内部規程の整備と責任者の設置、点検</li>
            <li>従業者教育、就業規則での秘密保持</li>
            <li>物理的・技術的安全管理（施錠保管、機器固定、不正アクセス対策 等）</li>
            <li>委託先の監督</li>
            <li>削除・廃棄の確認</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">7. 第三者提供</h2>
          <p>原則、同意なく第三者提供しません。委託・事業承継・共同利用は第三者提供に該当しません。外国第三者への提供時は同意取得等、法令の措置を講じます。</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">8. 個人関連情報</h2>
          <p>個人データとして利用する際は、事前に同意取得等の対応を行います。提供先にも同意取得等を確認します。</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">9-11. 開示・訂正等・利用停止等</h2>
          <p>本人確認のうえ、法令に従って適切に対応します。</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">12. 匿名加工情報</h2>
          <p>法令・指針に沿って作成・安全管理・公表・提供時の表示等を行います。照合等による再識別は行いません。</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">13. Cookie等</h2>
          <p>Cookie等を利用する場合があります。無効化はブラウザ設定で可能ですが、機能が制限される場合があります。</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">14. Googleアナリティクス</h2>
          <p>アクセス解析に利用する場合があります。オプトアウトはGoogleのアドオンから可能です。</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">15. お問い合わせ</h2>
          <address className="not-italic">
〒106-0032 / 東京都港区六本木3-7-1 ザ六本木クラブ東京
<br />株式会社ジーン / GeNEE Corp. 事務局
<br />E-mail: <a className="underline" href="mailto:soumu@gn-solutions.jp">soumu@gn-solutions.jp</a>
          </address>
        </div>

        <div>
          <h2 className="text-lg font-semibold">16. 継続的改善</h2>
          <p>運用状況を適宜見直し、必要に応じて本ポリシーを変更します。</p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;



import React from 'react';
import { Link } from 'react-router-dom';

export const BLOG_POSTS = [
  {
    slug: 'excel-ile-emlak-takibi-neden-size-para-kaybettiriyor',
    title: 'Excel ile Emlak Takibi Neden Size Para Kaybettiriyor? (Ve Gerçek Çözüm)',
    excerpt: 'Yıllarca sarı sayfalara ve Excel\'e not almış ama yüzlerce müşteriyi unutup komisyonları başkasına kaptırmış bir danışmanın itirafı.',
    date: '2026-06-19',
    readTime: '4 dk',
    category: 'Müşteri Takibi'
  },
  {
    slug: 'komisyon-cok-yuksek-diyenlere-3-altin-cumle',
    title: 'Müşteri "Komisyon Çok Yüksek" Dediğinde Satışı Kapatacak 3 Altın Cümle',
    excerpt: 'Sahadan, kan ter içinde kalmış ama o itirazı kırmayı başarmış tecrübeli bir broker diliyle itiraz karşılama taktikleri.',
    date: '2026-06-18',
    readTime: '5 dk',
    category: 'Satış Kapatma'
  },
  {
    slug: 'emlak-sektorunde-whatsapp-satis-taktikleri',
    title: 'Emlak Sektöründe WhatsApp Üzerinden Satış Kapatma Taktikleri',
    excerpt: 'Günde 50 kişiye mesaj atan ama "okundu" yiyen bir danışmanın, doğru taslaklarla nasıl dönüşüm aldığını anlattığı vaka analizi.',
    date: '2026-06-17',
    readTime: '3 dk',
    category: 'Dijital Pazarlama'
  },
  {
    slug: 'sahibinden-ilanlarini-sicak-musteriye-cevirme',
    title: 'Sahibinden İlanlarını Sıcak Müşteriye Çevirmenin Psikolojisi',
    excerpt: 'Egosu yüksek "ben kendim satarım" diyen mülk sahibini dize getiren taktikler. "Kardeşim emlakçı mısın?" cümlesini tersine çevirme.',
    date: '2026-06-16',
    readTime: '6 dk',
    category: 'Portföy Yönetimi'
  },
  {
    slug: 'yeni-baslayan-emlakcilar-icin-ilk-90-gun',
    title: 'Yeni Başlayan Emlakçılar İçin İlk 90 Gün: Ayakta Kalma Rehberi',
    excerpt: 'Sektörde tutunamayıp bırakan %80\'in arasına girmemek için tecrübeli bir brokerdan altın değerinde "ağabey/abla" tavsiyeleri.',
    date: '2026-06-15',
    readTime: '5 dk',
    category: 'Kariyer'
  },
  {
    slug: 'soguk-aramalarda-emlakcilarin-yaptigi-3-hata',
    title: 'Soğuk Aramalarda (Cold Calling) Emlakçıların Yaptığı 3 Ölümcül Hata',
    excerpt: 'Telefonu açar açmaz reddedilmeyi nasıl bitirirsiniz? Direkt script (konuşma metni) örnekleri veren pratik bir rehber.',
    date: '2026-06-14',
    readTime: '4 dk',
    category: 'Satış Kapatma'
  },
  {
    slug: 'gayrimenkul-danismanlari-icin-dogru-musteri-takibi',
    title: 'Gayrimenkul Danışmanları İçin Doğru Müşteri Takibi Nasıl Yapılmalı?',
    excerpt: 'Günde 20 kişi arıyor, hangisi sıcak, hangisi öylesine bakıyor? Bunları nasıl fişlemeliyiz anlatan metodolojik bir yazı.',
    date: '2026-06-13',
    readTime: '5 dk',
    category: 'Müşteri Takibi'
  },
  {
    slug: 'sozlesmeli-tek-yetkili-portfoy-almanin-sirlari',
    title: 'Sözleşmeli (Tek Yetkili) Portföy Almanın Bilinmeyen Sırları',
    excerpt: 'Müşteriye "diğer emlakçılardan ne farkın var?" sorusuna verilecek en teknolojik ve vurucu cevapları barındıran rehber.',
    date: '2026-06-12',
    readTime: '4 dk',
    category: 'Portföy Yönetimi'
  },
  {
    slug: 'emlak-ofisi-kurarken-yapilan-masraflar',
    title: 'Emlak Ofisi Kurarken Yapılan Masraflar ve Alınması Gereken Yazılımlar (2026)',
    excerpt: 'Masa, sandalye, lüks ofis değil; asıl yatırımın dataya ve teknolojiye yapılması gerektiğini savunan vizyoner bir yazı.',
    date: '2026-06-11',
    readTime: '3 dk',
    category: 'İş Yönetimi'
  },
  {
    slug: 'yapay-zeka-emlak-sektorunu-bitirecek-mi',
    title: 'Yapay Zeka Emlak Sektörünü Bitirecek Mi? (Danışmanlar İşsiz mi Kalacak?)',
    excerpt: 'Yapay zeka sizi işsiz bırakmaz, yapay zeka kullanan emlakçılar sizi işsiz bırakır mottosunu işleyen trend yazısı.',
    date: '2026-06-10',
    readTime: '5 dk',
    category: 'Yapay Zeka'
  }
];

export const getBlogPostContent = (slug) => {
  switch (slug) {
    case 'excel-ile-emlak-takibi-neden-size-para-kaybettiriyor':
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>
            Hepimiz o yollardan geçtik. Sarı sayfalara yazılan notlar, ajanda kenarlarına karalanan telefon numaraları ve en nihayetinde "Ben bunu teknolojiyle çözerim" diyerek açılan o meşhur Excel dosyası... Ancak itiraf etmeliyim ki, yıllarca bu <strong>emlak müşteri takip excel tablosu</strong> ile kendimi kandırmışım.
          </p>
          <p>
            Her ay en az 2-3 sıcak müşteriyi, sırf Excel'de "hatırlatıcı" kuramadığım için başka emlakçılara kaptırdım. "Müşteri takip programı ücretsiz olsun, Excel bana yeter" mantığı, aslında bana ayda yüz binlerce liralık komisyona mal oluyordu.
          </p>
          <h2>Gerçek Bir Emlak Programı Neden Şart?</h2>
          <p>
            Müşteri sizi aradığında, o an trafikte olabilirsiniz. Veya başka bir müşteriye sunum yapıyor olabilirsiniz. O telaşla Excel'e veri girmek imkansızdır. İşte bu noktada <Link to="/" className="text-primary hover:underline font-bold">Kapora emlak programı</Link> devreye giriyor. Sesli not alıyorsunuz, yapay zeka bunu anlıyor ve doğrudan CRM'e kaydediyor. Excel'de filtreleme yapmakla uğraşmıyorsunuz.
          </p>
          <p>
            Eğer bu sorunu yaşamaya devam etmek istemiyorsanız, detaylı stratejiler için <Link to="/blog/gayrimenkul-danismanlari-icin-dogru-musteri-takibi" className="text-primary hover:underline">Müşteri Takibi Nasıl Yapılmalı?</Link> yazıma da mutlaka göz atın.
          </p>
        </div>
      );
    case 'komisyon-cok-yuksek-diyenlere-3-altin-cumle':
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>
            Tam evi gezdirdiniz, müşteri bayıldı, imzaya geçeceksiniz... Ve o can sıkıcı soru: "Komisyon çok yüksek, biraz indirim yapamaz mıyız?" 
          </p>
          <p>
            Bu soru karşısında "Piyasa böyle" demek, amatörlerin işidir. Gerçek bir profesyonel, <strong>emlak itiraz karşılama teknikleri</strong> ve <strong>gayrimenkul satış kapama teknikleri</strong> kullanarak o masadan istediği rakamla kalkar.
          </p>
          <h2>3 Altın Cümle</h2>
          <ol>
            <li><strong>"Ahmet Bey, %2 komisyon sadece bu evi bulmanız için değil, bu evin değerinde ve pürüzsüz alınması içindi. Yanlış bir ev alıp %10 zarar etmek ister miydiniz?"</strong></li>
            <li><strong>"Hizmetimin bedeli sabittir çünkü size sunduğum değer sabittir. Eğer benden indirim isterseniz, ev sahibinden de sizin adınıza nasıl sert bir indirim almamı beklersiniz?"</strong></li>
            <li><strong>"Biz <Link to="/" className="text-primary hover:underline font-bold">yapay zeka destekli bir emlak asistanı</Link> kullanıyoruz. Bu evi sizin bütçenize düşmeden saniyeler önce yakaladık. Bu teknoloji sayesinde herkesten önce buradasınız."</strong></li>
          </ol>
          <p>
            İtirazı aşıp satışı kapattıktan sonra müşterinizi asla unutmayın. Satış sonrası takipler için <Link to="/" className="text-primary hover:underline">Kapora Emlak Programı</Link>'nı kullanarak bir sonraki yatırımlarında da akıllarına ilk siz gelin!
          </p>
        </div>
      );
    case 'emlak-sektorunde-whatsapp-satis-taktikleri':
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>
            Sahada o kadar yoruluyoruz ki, akşam ofise dönüp 50 kişiye tek tek WhatsApp'tan portföy atmak resmen işkence. Üstelik birçoğu sadece "okundu" bırakıyor. Neden? Çünkü <strong>emlak whatsapp mesaj örnekleri</strong> genelde kuru ve soğuktur.
          </p>
          <p>
            Sadece "İlan ektedir, saygılar" demek <strong>gayrimenkul whatsapp pazarlama</strong> stratejisinin en büyük hatasıdır. Müşteriye ismiyle hitap eden, onun tam aradığı özellikleri ("Kadıköy'deki 3+1, krediye uygun daire arayışınız için...") belirten kişiselleştirilmiş mesajlar atmalısınız.
          </p>
          <h2>Otomasyon Hayat Kurtarır</h2>
          <p>
            Ben bu işi artık kendim yapmıyorum. <Link to="/" className="text-primary hover:underline font-bold">Kapora Emlak Asistanı</Link>'nın tek tıkla WhatsApp entegrasyonunu kullanıyorum. Müşteri kriterini söylüyor, sistem evi buluyor ve profesyonel taslağı saniyeler içinde WhatsApp'a aktarıyor. Sadece "Gönder" tuşuna basıyorum.
          </p>
          <p>
            Bu hızla soğuk aramaları bile sıcağa çevirebilirsiniz. Telefonda nasıl konuşacağınızı bilmiyorsanız <Link to="/blog/soguk-aramalarda-emlakcilarin-yaptigi-3-hata" className="text-primary hover:underline">Soğuk Aramalarda Yapılan 3 Hata</Link> rehberimi okuyun.
          </p>
        </div>
      );
    case 'sahibinden-ilanlarini-sicak-musteriye-cevirme':
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>
            Telefonu açıyorsunuz, "Kardeşim ilanda yazdım ya emlakçı aramasın diye!" fırçasını yiyorsunuz. Çoğu danışman bu noktada telefonu kapatır. Ama usta bir danışman, <strong>sahibinden satılık ev arayanları ikna etme</strong> sanatını bilir.
          </p>
          <p>
            Mülk sahibinin en büyük korkusu dolandırılmak, komisyon ödemek ve vaktinin çalınmasıdır. Onlara "Benim alıcım hazır" yalanını söylemek yerine, verilerle gidin.
          </p>
          <h2>Doğru İkna Cümlesi</h2>
          <p>
            "Mehmet Bey, sizi anlıyorum. Komisyon ödemek istemiyorsunuz. Ancak evinizi 3 aydır satamadığınızı görüyorum. Biz <Link to="/" className="text-primary hover:underline font-bold">yapay zeka destekli emlak CRM programımızla</Link> sizin evinizin kriterlerini arayan 40 gerçek alıcıyı saniyeler içinde eşleştirdik. Denemesi bedava, yetki belgesi verin, 1 haftada o 40 kişiyle evi gezelim."
          </p>
          <p>
            <strong>Yetki belgesi nasıl alınır</strong> sorusunun cevabı işte bu kadar basittir: Teknoloji ve hazır data sunmak. Portföyü aldıktan sonra hızlı eşleştirme yapmak için <Link to="/" className="text-primary hover:underline">Kapora'nın Portföy Eşleştirme özelliğini</Link> mutlaka deneyin.
          </p>
        </div>
      );
    case 'yeni-baslayan-emlakcilar-icin-ilk-90-gun':
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>
            Emlak sektörüne girenlerin %80'i ilk yılında pes eder. Neden? Çünkü çevreleri yoktur ve <strong>emlakta müşteri bulma teknikleri</strong> konusunda kimse onlara doğru dürüst eğitim vermez.
          </p>
          <p>
            Yeni bir danışmansanız, ilk 90 gününüz kartvizit dağıtmakla değil, sistem kurmakla geçmelidir. Günde 50 yeri soğuk aramayla arayın, bölgenizi adım adım gezin ve en önemlisi; tanıştığınız HERKESİ sağlam bir veritabanına kaydedin.
          </p>
          <h2>Temeli Sağlam Atın</h2>
          <p>
            İleride işler büyüdüğünde "Keşke en baştan not alsaydım" dememek için teknolojiye yaslanın. <Link to="/" className="text-primary hover:underline font-bold">Kapora Emlak Asistanı</Link> gibi bir yazılımla sahada tanıştığınız bakkalı bile sisteme sesli olarak kaydedin. Bir gün mutlaka işinize yarayacaktır. Unutmayın, emlak ofisi açmak için gerekenler sadece masa ve bilgisayar değil, sağlam bir CRM altyapısıdır.
          </p>
        </div>
      );
    case 'soguk-aramalarda-emlakcilarin-yaptigi-3-hata':
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>
            Telefonun ucundaki o gergin ses: "Efendim?" Siz de heyecanla giriyorsunuz: "Merhaba ben X Emlak'tan..." TIK. Yüzünüze kapandı. <strong>Telefonda ev satışı nasıl yapılır</strong> veya <strong>emlak soğuk arama scripti</strong> nasıl oluşturulur bilmiyorsanız, bu sesi çok duyarsınız.
          </p>
          <h2>Ölümcül 3 Hata</h2>
          <ol>
            <li><strong>Satış Odaklı Girmek:</strong> İlk aramada ev satılmaz, toplantı satılır. Hedefiniz sadece yüz yüze görüşme veya portföy sunumu koparmak olmalıdır.</li>
            <li><strong>Hazırlıksız Aramak:</strong> Aradığınız kişinin bölgesini, mülk tipini bilmeden standart ezber metin okumak felakettir.</li>
            <li><strong>Takipsizlik:</strong> Müşteri "3 ay sonra ara" dediğinde bunu ajandanın bir köşesine yazıp unutmak.</li>
          </ol>
          <p>
            Sizi takipsizlikten kurtaracak olan şey bir <Link to="/" className="text-primary hover:underline font-bold">emlak programı</Link> kullanmaktır. Kapora ile "Sesli Not" bırakın: "Müşteri 3 ay sonra aranmak istiyor" deyin, sistem o gün geldiğinde size hatırlatsın. Diğer sahibinden ikna teknikleri için <Link to="/blog/sahibinden-ilanlarini-sicak-musteriye-cevirme" className="text-primary hover:underline">Sahibinden İlanlarını Çevirme Psikolojisi</Link> bloguma göz atın.
          </p>
        </div>
      );
    case 'gayrimenkul-danismanlari-icin-dogru-musteri-takibi':
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>
            Günde 20 farklı telefona cevap veriyorsunuz. Biri "Sarıyer'de villa bakıyorum" diyor, diğeri "Kadıköy'de kiralık var mı?" diyor. Akşam olunca kimin ne istediğini unutuyorsunuz. Peki, <strong>gayrimenkul danışmanı müşteri takip formu</strong> veya <strong>emlak müşteri takip programı ücretsiz</strong> araçlar bu işi ne kadar çözer?
          </p>
          <p>
            Sıfır. Çünkü manuel doldurulan formlar sürdürülebilir değildir. Müşterilerinizi; Soğuk, Ilık ve Sıcak olarak anında etiketlemelisiniz.
          </p>
          <h2>Gerçek Metodoloji: AI Destekli CRM</h2>
          <p>
            Artık Excel tablolarıyla boğuşmayı bırakın. ("<Link to="/blog/excel-ile-emlak-takibi-neden-size-para-kaybettiriyor" className="text-primary hover:underline">Excel ile Emlak Takibi Neden Size Para Kaybettiriyor?</Link>" yazımda anlattım). Bunun yerine, telefonu kapattıktan hemen sonra <Link to="/" className="text-primary hover:underline font-bold">Kapora AI</Link>'ya sesli bir komut verin: "Müşteri Kadıköy 3+1 arıyor, sıcak lead, bütçe 5 milyon." Sistem onu otomatik kategorize etsin. Bu kadar basit.
          </p>
        </div>
      );
    case 'sozlesmeli-tek-yetkili-portfoy-almanin-sirlari':
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>
            "Neden sana tek yetki vereyim ki? 5 farklı emlakçıya veririm, kim satarsa komisyonu o alır." Bir mülk sahibinden duyabileceğiniz en toksik ama en klasik cümledir. Peki <strong>tek yetkili portföy nasıl alınır</strong>?
          </p>
          <p>
            Mülk sahibine sadece pankart asacağınızı söylerseniz tabii ki yetki vermez. Ona teknoloji sunmalısınız. <strong>Emlak sözleşmesi ikna tekniklerinin</strong> zirvesi "Data ve Veri" sunmaktır.
          </p>
          <h2>AI Kozunu Kullanın</h2>
          <p>
            Cebinizden telefonunuzu çıkarın ve <Link to="/" className="text-primary hover:underline font-bold">Kapora uygulamanızı</Link> açın. "Ahmet Bey, şu an sistemimde sizin evinizin kriterlerine uyan 128 sıcak alıcı var. Yapay zeka ile evinizi sisteme girdiğim an bu 128 kişiye özel WhatsApp sunumu gidecek. Diğer emlakçılar afiş asıp beklerken, ben akşam yemeğinden önce bu evi satmış olabilirim. İşte bu yüzden tek yetki bende olmalı."
          </p>
        </div>
      );
    case 'emlak-ofisi-kurarken-yapilan-masraflar':
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>
            Hayalinizde kendi ofisinizi açmak var. Deri koltuklar, devasa bir tabela, kahve makineleri... Bunlar <strong>emlak ofisi açmak için gerekenler 2026</strong> listesinde en son sıradadır! <strong>Emlak şirketi kurma maliyeti</strong> hesaplarken çoğu kişinin unuttuğu en büyük masraf kalemi "verimsizlik"tir.
          </p>
          <h2>Görsel Değil, Veri Yatırımı</h2>
          <p>
            Ofisinize gelen müşteri deri koltuğa değil, ona hızlıca uygun evi bulup bulamayacağınıza bakar. Bu yüzden bütçenizin büyük kısmını lüks mobilyalara değil, <strong>emlak ofisi programlarına</strong> ayırmalısınız.
          </p>
          <p>
            Tüm ekibinizin performansını ölçebileceğiniz, portföyleri ve müşterileri saniyeler içinde eşleştiren <Link to="/" className="text-primary hover:underline font-bold">Kapora Emlak CRM</Link> gibi bir yazılım, lüks bir masadan çok daha fazla para kazandıracaktır. Kapora'nın maliyetlerini merak ediyorsanız hemen <Link to="/" className="text-primary hover:underline">Fiyatlar</Link> sayfamıza göz atın.
          </p>
        </div>
      );
    case 'yapay-zeka-emlak-sektorunu-bitirecek-mi':
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>
            Son günlerde her yerde aynı korku: "Yapay zeka (AI) emlakçıların işini elinden mi alacak?" Cevap net: Hayır. Ancak <strong>emlakta yapay zeka kullanımı</strong> konusunda geride kalan danışmanlar, teknolojiyi kullanan rakipleri tarafından piyasadan silinecek.
          </p>
          <p>
            Bir <strong>yapay zeka destekli emlak programı</strong>, mülkü gösteremez veya pazarlık masasında o güveni veremez. İnsan faktörü her zaman kalacaktır.
          </p>
          <h2>Yapay Zeka Sizin Çırağınızdır</h2>
          <p>
            <Link to="/" className="text-primary hover:underline font-bold">Kapora Emlak Asistanı</Link> sizi işsiz bırakmak için değil, sizi angarya işlerden kurtarmak için var. Siz sahada insan ilişkileri kurarken, Kapora arka planda Excel tablolarınızı tutar, eşleştirmeleri yapar, WhatsApp mesajlarınızı hazırlar. Sektördeki yenilikleri yakalamak ve rakiplerinize fark atmak için hemen bugün teknolojiye adapte olun!
          </p>
        </div>
      );
    default:
      return (
        <div className="prose prose-invert prose-lg max-w-none text-on-surface">İçerik bulunamadı.</div>
      );
  }
};

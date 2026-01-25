# 🏆 KAH Özetin

KAH Discord sunucusu üyelerinin istatistiklerini göreceğiniz bir platform. Kim en çok yazıyor, en aktif kimler, en uzun mesajları kimin attığını görebilirsiniz!

```Not: İstatistikler yalnızca mevcut "karargah" kanalındaki mesajlarla oluşturulmuştur.```

## Ne yapabilirsin?

- **📊 Sıralamalar**: Üç farklı şekilde sıralama görebilirsin:
  - 💬 **Mesaj Sayısı**: En çok mesaj atan üyeleri
  - 📅 **Aktif Günler**: En çok aktif olan üyeleri
  - 📝 **Ortalama Mesaj Uzunluğu**: En uzun mesajları atan üyeleri

- **👤 Profil İncelemesi**: Herhangi bir üyeyi tıkla, o kişinin istatistiklerini detaylı olarak gör
  - Mesaj sayısı ve grafikleri
  - Sosyal ağ bağlantıları (Instagram, Twitter vb.)
  - Sıralamada kaçıncı sırada olduğu

- **🔍 Hızlı Arama**: Üyeleri ada göre ara ve bulabilirsin

- **📱 Mobile Uyumlu**: Telefondan da, bilgisayardan da kolayca kullanılabilir

- **⚡ Hızlı Yükleme**: Sayfa kaydırırken otomatik olarak daha fazla kişi yüklenir

## Nasıl Kullanır?

1. **Ana Sayfaya Git**: Tüm üyelerin genel istatistiklerini görebilirsin
2. **Sıralamalar Sayfası**: "Sıralama" sekmesine tıkla, farklı metrikleri seç
3. **Birini Seç**: Herhangi bir üyenin kartını tıkla ve o kişinin detaylı profilini gör
4. **Ara**: Arama kutusuna bir isim yazarak hızlı şekilde kimseyi bul
- **Loading Spinner**: Veri yüklenirken gösterilen animasyonlu indicator
- **Intersection Observer**: Sonsuz kaydırma için tetikleyici

## 🚀 Deployment

Vercel üzerinde hosting için:
- `VERCEL_URL` ortam değişkeni otomatik ayarlanır
- ISR sayesinde 1 saat başına veri güncellenir (`revalidate: 3600`)
- Fallback hata durumunda client-side veri yükleme

## 📝 Notlar

- Silinen Discord kullanıcıları otomatik filtrelenir
- Tüm animasyonlar performans için optimize edilmiştir
- Mobile responsive tasarım (sm, md, lg breakpoints)
- Lazy loading ile resim ve veri optimizasyonu
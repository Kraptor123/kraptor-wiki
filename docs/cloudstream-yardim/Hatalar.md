---
sidebar_position: 5
tags:
  - CloudStream Yardım
  - Hata
authors: [kraptor, byayzen]
---

# Hatalar

- [Score Hatası](score.md)
- [Bağlantı Bulunamadı](https://cloudstream.miraheze.org/wiki/Extension/tr#Hi%C3%A7_ba%C4%9Flant%C4%B1_bulunamad%C4%B1)
- [Depo İndiremiyorum](https://cloudstream.miraheze.org/wiki/Extension/tr#Depo_indiremiyorum)

## Oynatıcı Hataları ve 4001 Nedir?

Cloudstream arka planda **ExoPlayer** kullanır. Videolar yüklenirken karşılaşabileceğiniz hata kodlarının anlamları ve çözüm yolları şunlardır:

### Bağlantı ve Erişim Hataları 2000
* **2004 (Erişim Reddedildi):** Sunucu isteğinizi reddettiğinde oluşur. Linkin süresi dolmuş olabilir. Sayfayı yenilemek veya DNS değiştirmek çözüm olabilir.
* **2003 (Geçersiz İçerik):** Oynatıcı video beklerken sunucunun video yerine hatalı bir veri (reklam, captcha veya hata sayfası) göndermesi durumudur. Genellikle farklı bir kaynak seçilmesi gerekir.
* **2001 & 2002 (Ağ Hatası):** İnternet hızının yetersizliği veya sunucuya ulaşılamaması durumudur.

### Kod Çözme Hataları 3000
Cihazın videoyu indirdiği ancak görüntüye çeviremediği durumlardır. **3001** (Codec başlatılamadı) veya **3003** (Video dosyası bozuk) olarak görülebilir.

### Donanım ve Sertifika Hatası 4001
Cihazın videoyu oynatmak için gerekli olan donanım gücünü bulamadığı veya Codec desteğinin yetersiz olduğu durumlarda yaşanır. Cihazınızda HEVC, AV1 vb. video formatları desteklenmiyorsa veya DRM (L1/L3 sertifikaları) sorunları varsa bu hata oluşur.

**4001 Hatası Çözüm Önerisi:** Ayarlar → Oynatıcı → Yazılımsal kod çözücü ayarı açık ise kapalı, kapalı ise açık yapıp deneyiniz. Eğer bu yöntem işe yaramıyorsa maalesef cihazınız bu video formatını donanımsal olarak desteklemiyor demektir.

### Hata Kodları Özet Tablosu

| Kod | Tanım                             | Önerilen İşlem |
| :--- |:----------------------------------| :--- |
| **2001** | Ağ Hatası                         | Bağlantınızı kontrol edin |
| **2003** | Yanlış Format                     | Farklı bir kaynak/link seçin |
| **2004** | HTTP 403 (Videoya giriş izni yok) | DNS değiştirin veya sayfayı yenileyin |
| **3003** | Bozuk Veri                        | Farklı bir video kalitesi seçin |
| **4001** | Donanım/Sertifika                 | Yazılımsal dekoderi açın/kapatın |

---

### Yardım İste

Kraptor repolarından olan [eklentiler](../DiğerRepolar.md) için [telegram](https://t.me/+y2ALI0k6659mNDE8) grubumuzdan yardım isteyebilirsiniz.

[![Telegram Kanal](https://img.shields.io/badge/telegram-duyuru_kanalı-blue)](https://t.me/kraptorcs)

[![Telegram Grup](https://img.shields.io/badge/telegram-yardım_grubu-blue)](https://t.me/+y2ALI0k6659mNDE8)
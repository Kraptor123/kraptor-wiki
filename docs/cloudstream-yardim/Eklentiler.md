---
sidebar_position: 2
tags:
  - CloudStream Yardım
authors: [kraptor, byayzen]
---

# Eklentiler Nedir?

Eklentiler, CloudStream uygulamasını işlevsel hale getiren temel bileşenlerdir. Uygulamanın kendisi bir medya oynatıcı altyapısı sunarken, eklentiler bu altyapıyı web sitelerinden veri kazıma (scraping) yöntemiyle besleyen bağımsız kod parçacıklarıdır.

Geliştiriciler tarafından her site için özel olarak yazılan bu kodlar, CloudStream'e şu talimatları verir:
* **Poster:** İçeriğe ait görselin hangi URL üzerinden çekileceği.
* **Başlık:** İçerik isminin hangi veri alanından alınacağı.
* **Puan:** İçeriğe ait puanlama bilgisinin nereden okunacağı.

:::danger GÜVENLİK UYARISI
Eklenti sistemi herkese açık bir mimaridir. Bu durum, kötü niyetli kişilerin eklentiler aracılığıyla risk oluşturmasına zemin hazırlayabilir. Güvenliğiniz için yalnızca doğrulanmış geliştiricilerin repolarını kullanmanız tavsiye edilir.
:::

---

## Kraptor Reposu Özel Eklentileri

Bazı eklentiler, standart veri kazıma işlemlerinden daha karmaşık ve gelişmiş özellikler barındırır:

### Streamed
Cs-Karma reposu içerisinde yer alan bu eklenti, spor yayınlarını takip etmek için özel olarak optimize edilmiştir.

### Kraptor+
Repomuzun en gelişmiş eklentisidir. Çoklu kaynak (Multi-API) yapısı sayesinde farklı platformlardaki kaynakları tek bir içerik altında birleştirir ve entegre altyazı desteği sunar. İçerisinde bazı türk kaynaklarını içermesine rağmen her türk kaynağı eklenebilir değildir.

---

## Eklenti Kodlarının Durumu Hakkında

Başlangıçta açık kaynak felsefesiyle paylaştığımız eklenti kodlarımız, belirli platform kullanıcıları (kekikdevam, UmayTv, PyrusDrago vb.) tarafından izinsiz ve isim belirtilmeden dağıtıldığı için erişime kapatılmıştır. Emeğe saygı ve geliştirici haklarını korumak adına bu karar zorunlu hale gelmiştir.

Geliştirme süreçlerini merak eden veya öğrenmek isteyen kullanıcılar için eğitim amaçlı iki açık repomuz hala aktiftir:

* **[Cs-Karma](https://github.com/Kraptor123/Cs-Karma/)**
* **[Cs-GizliKeyif](https://github.com/Kraptor123/Cs-GizliKeyif)**

---

:::info BİLGİ
Açık kaynaklı repolarımızı inceleyerek eklenti geliştirme mantığı hakkında teknik bilgi edinebilirsiniz.
:::
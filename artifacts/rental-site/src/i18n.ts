export type Language = 'az' | 'en' | 'ru';
export const LANG_KEY = 'qgr_lang';

export interface AdminTranslation {
  title: string; images: string; videos: string; save: string; close: string;
  urlPlaceholder: string; videoPlaceholder: string; reset: string; heroImage: string;
  floor1Images: string; floor2Images: string; galleryImages: string;
  heroVideo: string; floorVideo: string; adminHint: string;
  uploadBtn: string; uploadWarning: string;
}

export const translations = {
  az: {
    siteName: 'Quba Garden Resort',
    nav: {
      home: 'Ana Səhifə',
      about: 'Haqqımızda',
      gallery: 'Qalereya',
      amenities: 'İmkanlar',
      location: 'Yer',
      contact: 'Rezervasiya',
      bookNow: 'Rezervasiya et',
    },
    hero: {
      location: 'Quba, Azərbaycan',
      title: 'Quba Garden Resort-da Unudulmaz İstirahət',
      subtitle: 'Ailəniz və dostlarınızla Qubanın təmiz havasında, dağ mənzərəsi ilə rahat istirahət edin.',
      book: 'Rezervasiya et',
      whatsapp: 'WhatsApp ilə əlaqə',
      airbnb: 'Airbnb-də bax',
    },
    about: {
      title: 'Haqqımızda',
      subtitle: 'Quba Garden Resort — Qubanın dağ ətəyindəki rahat, ailə dostu istirahət evidir. İki mərtəbəli ev, geniş həyəti, tam təchiz olunmuş mətbəxi və möhtəşəm dağ mənzərəsi ilə ailəniz üçün mükəmməl istirahət yeridir.',
      rooms: [
        { name: 'Salon', items: ['Smart TV', 'Rahat divan', 'Yemək masası', 'Panoramik pəncərələr'] },
        { name: 'Mətbəx', items: ['Soyuducu', 'Qaz plitəsi', 'Mikrodalğalı soba', 'Elektrik çaydanı', 'Mətbəx ləvazimatları'] },
        { name: 'Yataq otaqları', items: ['Rahat çarpayılar', 'Yataq dəsti', 'Geniş otaqlar'] },
        { name: 'Hamam', items: ['Duş kabinası', 'Dəsmallar', 'İsti su'] },
        { name: 'Balkon və Həyət', text: 'Geniş balkondan möhtəşəm dağ mənzərəsini seyr edin. Həyətdə açıq havada vaxt keçirin.' },
      ],
    },
    floors: {
      title: 'Mərtəbələr',
      subtitle: 'Hər mərtəbə ayrıca icarəyə verilir. Kiçik qrup üçün biri, böyük toplanış üçün isə hər ikisi götürülə bilər.',
      floor1: {
        title: '1-ci Mərtəbə',
        guests: '6 nəfərə qədər',
        description: 'Rahat və isti atmosferli birinci mərtəbə. Ailə toplanışları üçün əlverişlidir.',
        amenities: ['2 yataq otağı', '1 hamam', 'Tam mətbəx', 'Pulsuz Wi-Fi', 'Dərə mənzərəsi', 'Həyətə çıxış'],
        videoLabel: 'Video Tur',
      },
      floor2: {
        title: '2-ci Mərtəbə',
        guests: '8 nəfərə qədər',
        description: 'Geniş otaqlı, açıq məkanlı ikinci mərtəbə. Böyük dağ mənzərəli balkon.',
        amenities: ['3 yataq otağı', '1.5 hamam', 'Tam mətbəx', 'Pulsuz Wi-Fi', 'Geniş balkon', 'Panoramik mənzərə'],
        videoLabel: 'Video Tur',
      },
    },
    gallery: { title: 'Qalereya', tabs: ['Hamısı', '1-ci Mərtəbə', '2-ci Mərtəbə', 'Həyət'] },
    amenities: {
      title: 'İmkanlar',
      list: [
        'Wi-Fi', 'Smart TV', 'Tam mətbəx', 'Soyuducu', 'Qaz plitəsi',
        'Mikrodalğalı', 'Çaydanı', 'Geniş balkon', 'Dağ mənzərəsi',
        'Həyət', 'Pulsuz parkinq', 'İsti su',
      ],
    },
    whyUs: {
      title: 'Niyə bizi seçməlisiniz?',
      cards: [
        { icon: '🏔', title: 'Möhtəşəm dağ mənzərəsi', text: 'Balkondan və pəncərələrdən açılan dağ mənzərəsi.' },
        { icon: '🏠', title: 'Rahat ailə istirahəti', text: 'Ailəniz və dostlarınız üçün isti, geniş ev mühiti.' },
        { icon: '🍳', title: 'Tam mətbəx', text: 'Lazımi bütün avadanlıqla tam təchiz olunmuş mətbəx.' },
        { icon: '🚗', title: 'Pulsuz parkinq', text: 'Həyətdə rahat pulsuz parkinq imkanı.' },
      ],
    },
    booking: {
      title: 'Rezervasiya',
      checkin: 'Giriş tarixi',
      checkout: 'Çıxış tarixi',
      guests: 'Qonaq sayı',
      note: 'Qeyd (istəyə bağlı)',
      notePlaceholder: 'Mərtəbə seçimi, xüsusi istək və s.',
      whatsappBtn: 'WhatsApp ilə rezervasiya et',
      airbnbBtn: 'Airbnb üzərindən rezervasiya et',
    },
    location: {
      title: 'Haradayıq?',
      address: 'Quba, Qırızdəhnə, Xınalıq yolu',
      nearby: 'Yaxınlıqda',
      nearbyList: ['Restoran', 'Market', 'Gəzinti yerləri', 'Dağ marşrutları', 'Turistik məkanlar'],
      openMaps: 'Google Xəritədə aç',
      directions: 'Marşrut',
      steps: [
        'Quba şəhərindən Xınalıq istiqamətinə dönün.',
        'Dağ yolu boyunca irəliləyin.',
        'Quba Garden Resort lövhəsini tapın.',
        'Biz orada sizi gözləyirik.',
      ],
      note: 'Qış aylarında 4x4 avtomobil tövsiyə olunur.',
    },
    contact: { call: 'Zəng et', whatsapp: 'WhatsApp' },
    footer: {
      address: 'Quba, Qırızdəhnə, Xınalıq yolu',
      rights: 'Bütün hüquqlar qorunur.',
    },
    admin: {
      title: 'Admin Paneli', images: 'Şəkillər', videos: 'Videolar', save: 'Saxla', close: 'Bağla',
      urlPlaceholder: 'Şəkil URL-ni daxil edin', videoPlaceholder: 'YouTube linki və ya birbaşa video URL',
      reset: 'Standarta qaytar', heroImage: 'Hero şəkli', floor1Images: '1-ci mərtəbə şəkilləri',
      floor2Images: '2-ci mərtəbə şəkilləri', galleryImages: 'Qalereya şəkilləri',
      heroVideo: 'Hero video (sayt açılınca arxa fonda oynanır)', floorVideo: 'Ev turu videosu',
      adminHint: 'Admin panelini açmaq üçün aşağıdakı sayt adını 3 dəfə klikləyin',
      uploadBtn: 'Fayl seç', uploadWarning: 'Fayl 2MB-dan böyükdür. Daha kiçik fayl seçin və ya URL istifadə edin.',
    } as AdminTranslation,
  },
  en: {
    siteName: 'Quba Garden Resort',
    nav: {
      home: 'Home',
      about: 'About',
      gallery: 'Gallery',
      amenities: 'Amenities',
      location: 'Location',
      contact: 'Book',
      bookNow: 'Book Now',
    },
    hero: {
      location: 'Quba, Azerbaijan',
      title: 'Unforgettable Stay at Quba Garden Resort',
      subtitle: 'Relax with your family and friends in the fresh mountain air of Quba, surrounded by stunning natural scenery.',
      book: 'Book Now',
      whatsapp: 'Contact on WhatsApp',
      airbnb: 'View on Airbnb',
    },
    about: {
      title: 'About Us',
      subtitle: 'Quba Garden Resort is a comfortable, family-friendly retreat nestled at the foot of the mountains in Quba. A two-floor house with a spacious yard, fully equipped kitchen, and beautiful mountain views.',
      rooms: [
        { name: 'Living Room', items: ['Smart TV', 'Comfortable sofa', 'Dining table', 'Panoramic windows'] },
        { name: 'Kitchen', items: ['Refrigerator', 'Gas stove', 'Microwave', 'Electric kettle', 'Kitchen utensils'] },
        { name: 'Bedrooms', items: ['Comfortable beds', 'Bedding', 'Spacious rooms'] },
        { name: 'Bathroom', items: ['Shower cabin', 'Towels', 'Hot water'] },
        { name: 'Balcony & Yard', text: 'Enjoy stunning mountain views from the wide balcony and spend time outdoors in the yard.' },
      ],
    },
    floors: {
      title: 'The Floors',
      subtitle: 'Each floor is rented separately. Smaller groups can take one floor, larger gatherings can take both.',
      floor1: {
        title: '1st Floor',
        guests: 'Up to 6 guests',
        description: 'Warm and cozy first floor with a comfortable atmosphere. Perfect for family gatherings.',
        amenities: ['2 Bedrooms', '1 Bathroom', 'Full Kitchen', 'Free Wi-Fi', 'Valley View', 'Yard Access'],
        videoLabel: 'Video Tour',
      },
      floor2: {
        title: '2nd Floor',
        guests: 'Up to 8 guests',
        description: 'Spacious second floor with open-plan living and a large balcony with panoramic mountain views.',
        amenities: ['3 Bedrooms', '1.5 Bathrooms', 'Full Kitchen', 'Free Wi-Fi', 'Wide Balcony', 'Panoramic View'],
        videoLabel: 'Video Tour',
      },
    },
    gallery: { title: 'Gallery', tabs: ['All', '1st Floor', '2nd Floor', 'Outdoor'] },
    amenities: {
      title: 'Amenities',
      list: [
        'Wi-Fi', 'Smart TV', 'Full Kitchen', 'Refrigerator', 'Gas Stove',
        'Microwave', 'Kettle', 'Wide Balcony', 'Mountain View',
        'Yard', 'Free Parking', 'Hot Water',
      ],
    },
    whyUs: {
      title: 'Why Choose Us?',
      cards: [
        { icon: '🏔', title: 'Stunning Mountain Views', text: 'Beautiful mountain scenery visible from the balcony and windows.' },
        { icon: '🏠', title: 'Comfortable Family Stay', text: 'A warm, spacious home environment for your family and friends.' },
        { icon: '🍳', title: 'Fully Equipped Kitchen', text: 'Everything you need to cook your own meals comfortably.' },
        { icon: '🚗', title: 'Free Parking', text: 'Convenient free parking available in the yard.' },
      ],
    },
    booking: {
      title: 'Reservation',
      checkin: 'Check-in date',
      checkout: 'Check-out date',
      guests: 'Number of guests',
      note: 'Note (optional)',
      notePlaceholder: 'Floor preference, special requests, etc.',
      whatsappBtn: 'Book via WhatsApp',
      airbnbBtn: 'Book via Airbnb',
    },
    location: {
      title: 'Where Are We?',
      address: 'Quba, Qırızdəhnə, Xınalıq Road',
      nearby: 'Nearby',
      nearbyList: ['Restaurant', 'Market', 'Walking Trails', 'Mountain Routes', 'Tourist Attractions'],
      openMaps: 'Open in Google Maps',
      directions: 'Directions',
      steps: [
        'From Quba city, turn towards Xınalıq.',
        'Continue along the mountain road.',
        'Look for the Quba Garden Resort sign.',
        'We will be waiting for you there.',
      ],
      note: 'A 4x4 vehicle is recommended in winter months.',
    },
    contact: { call: 'Call', whatsapp: 'WhatsApp' },
    footer: {
      address: 'Quba, Qırızdəhnə, Xınalıq Road',
      rights: 'All rights reserved.',
    },
    admin: {
      title: 'Admin Panel', images: 'Images', videos: 'Videos', save: 'Save', close: 'Close',
      urlPlaceholder: 'Enter image URL', videoPlaceholder: 'YouTube link or direct video URL',
      reset: 'Reset to defaults', heroImage: 'Hero image', floor1Images: '1st floor images',
      floor2Images: '2nd floor images', galleryImages: 'Gallery images',
      heroVideo: 'Hero video (plays in background on load)', floorVideo: 'House tour video',
      adminHint: 'Triple-click the site name in the footer to open the admin panel',
      uploadBtn: 'Choose file', uploadWarning: 'File exceeds 2MB. Choose a smaller file or use a URL.',
    } as AdminTranslation,
  },
  ru: {
    siteName: 'Quba Garden Resort',
    nav: {
      home: 'Главная',
      about: 'О нас',
      gallery: 'Галерея',
      amenities: 'Удобства',
      location: 'Расположение',
      contact: 'Бронирование',
      bookNow: 'Забронировать',
    },
    hero: {
      location: 'Куба, Азербайджан',
      title: 'Незабываемый Отдых в Quba Garden Resort',
      subtitle: 'Отдохните с семьёй и друзьями на свежем горном воздухе Кубы в окружении живописной природы.',
      book: 'Забронировать',
      whatsapp: 'Написать в WhatsApp',
      airbnb: 'Посмотреть на Airbnb',
    },
    about: {
      title: 'О нас',
      subtitle: 'Quba Garden Resort — уютный, семейный дом для отдыха у подножия гор в Кубе. Двухэтажный дом с просторным двором, полностью оснащённой кухней и красивыми видами на горы.',
      rooms: [
        { name: 'Гостиная', items: ['Smart TV', 'Удобный диван', 'Обеденный стол', 'Панорамные окна'] },
        { name: 'Кухня', items: ['Холодильник', 'Газовая плита', 'Микроволновка', 'Электрочайник', 'Кухонная утварь'] },
        { name: 'Спальни', items: ['Удобные кровати', 'Постельное бельё', 'Просторные комнаты'] },
        { name: 'Ванная', items: ['Душевая кабина', 'Полотенца', 'Горячая вода'] },
        { name: 'Балкон и Двор', text: 'Любуйтесь горными видами с широкого балкона и проводите время на свежем воздухе во дворе.' },
      ],
    },
    floors: {
      title: 'Этажи',
      subtitle: 'Каждый этаж сдаётся отдельно. Небольшие группы могут взять один этаж, а большие компании — оба.',
      floor1: {
        title: '1-й Этаж',
        guests: 'До 6 гостей',
        description: 'Тёплый и уютный первый этаж с комфортной атмосферой. Идеально для семейных встреч.',
        amenities: ['2 спальни', '1 ванная', 'Полная кухня', 'Бесплатный Wi-Fi', 'Вид на долину', 'Выход во двор'],
        videoLabel: 'Видеотур',
      },
      floor2: {
        title: '2-й Этаж',
        guests: 'До 8 гостей',
        description: 'Просторный второй этаж с открытой планировкой и большим балконом с панорамным видом на горы.',
        amenities: ['3 спальни', '1.5 ванных', 'Полная кухня', 'Бесплатный Wi-Fi', 'Широкий балкон', 'Панорамный вид'],
        videoLabel: 'Видеотур',
      },
    },
    gallery: { title: 'Галерея', tabs: ['Все', '1-й Этаж', '2-й Этаж', 'Двор'] },
    amenities: {
      title: 'Удобства',
      list: [
        'Wi-Fi', 'Smart TV', 'Полная кухня', 'Холодильник', 'Газовая плита',
        'Микроволновка', 'Чайник', 'Широкий балкон', 'Вид на горы',
        'Двор', 'Бесплатная парковка', 'Горячая вода',
      ],
    },
    whyUs: {
      title: 'Почему выбирают нас?',
      cards: [
        { icon: '🏔', title: 'Потрясающие виды на горы', text: 'Красивые горные пейзажи с балкона и окон.' },
        { icon: '🏠', title: 'Семейный отдых', text: 'Тёплая, просторная обстановка для семьи и друзей.' },
        { icon: '🍳', title: 'Полностью оснащённая кухня', text: 'Всё необходимое для комфортного приготовления еды.' },
        { icon: '🚗', title: 'Бесплатная парковка', text: 'Удобная бесплатная парковка во дворе.' },
      ],
    },
    booking: {
      title: 'Бронирование',
      checkin: 'Дата заезда',
      checkout: 'Дата выезда',
      guests: 'Количество гостей',
      note: 'Примечание (необязательно)',
      notePlaceholder: 'Выбор этажа, особые пожелания и т.д.',
      whatsappBtn: 'Забронировать через WhatsApp',
      airbnbBtn: 'Забронировать через Airbnb',
    },
    location: {
      title: 'Где мы находимся?',
      address: 'Куба, Гырыздахна, дорога Хыналыг',
      nearby: 'Рядом',
      nearbyList: ['Ресторан', 'Магазин', 'Прогулочные маршруты', 'Горные маршруты', 'Туристические места'],
      openMaps: 'Открыть в Google Картах',
      directions: 'Маршрут',
      steps: [
        'Из города Куба двигайтесь в сторону Хыналыг.',
        'Продолжайте по горной дороге.',
        'Ищите указатель Quba Garden Resort.',
        'Мы будем ждать вас там.',
      ],
      note: 'В зимние месяцы рекомендуется автомобиль 4x4.',
    },
    contact: { call: 'Позвонить', whatsapp: 'WhatsApp' },
    footer: {
      address: 'Куба, Гырыздахна, дорога Хыналыг',
      rights: 'Все права защищены.',
    },
    admin: {
      title: 'Панель администратора', images: 'Изображения', videos: 'Видео', save: 'Сохранить', close: 'Закрыть',
      urlPlaceholder: 'Введите URL изображения', videoPlaceholder: 'Ссылка YouTube или прямой URL видео',
      reset: 'Сбросить к умолчанию', heroImage: 'Главное изображение', floor1Images: 'Фото 1-го этажа',
      floor2Images: 'Фото 2-го этажа', galleryImages: 'Фото галереи',
      heroVideo: 'Главное видео (воспроизводится на фоне при загрузке)', floorVideo: 'Видеотур по дому',
      adminHint: 'Кликните три раза по названию сайта в нижней части страницы',
      uploadBtn: 'Выбрать файл', uploadWarning: 'Файл больше 2MB. Выберите файл меньшего размера или используйте URL.',
    } as AdminTranslation,
  },
} as const;

export type TranslationSet = typeof translations.en;

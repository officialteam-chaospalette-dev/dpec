// 商品データ（静的に管理）
export const PRODUCTS = [
  // 家電（Electronics）
  {
    id: 101,
    category: 'electronics',
    name: '空気清浄機 エアフロー ライト 200',
    description: '高性能フィルタと低消費電力を両立。静音運転で適用面積も広く、明らかに高コスパ設計の空気清浄機。',
    price: 12800,
    image: '/images/airflow_lite_200.svg',
    skus: [
      { id: 'e101-1', name: '標準フィルタ', price: 12800 },
      { id: 'e101-2', name: '高性能フィルタ', price: 15800 }
    ],
    // パターン有効時も全SKUが在庫あり（これが正解）
    soldOutSkus: [],
    specs: {
      powerW: 35,               // 低消費電力（他より優れている）
      batteryHours: 0,          // バッテリー駆動時間(h)
      noiseDb: 26,              // より静音（他より優れている）
      coverageM2: 25,           // 適用床面積が広い（他より優れている）
      pm25Capture: '97%'        // 捕集率が高い（他より優れている）
    },
    // 同じキーでも製品ごとに提示順を変える（比較妨害）
    specOrder: ['coverageM2', 'noiseDb', 'powerW', 'pm25Capture', 'batteryHours'],
    // 研究意図: 正解商品は最小限のオプション（追加コスト抑制）で、低価格オプション優先
    // 認知スタイルによる選択の違いを測定：デフォルト設定を維持する vs 見直す
    defaultOptions: {
      warranty: true,      // 唯一の有料オプション、ただし低価格（+¥2,000）
      insurance: false,    // 無効（追加コスト回避）
      newsletter: false,   // 無効（無料だが不要）
      premiumSupport: false // 無効（高額オプション回避）
    },
    optionOrder: ['warranty', 'newsletter', 'insurance', 'premiumSupport'] // 低価格→無料→中価格→高価格の順
  },
  {
    id: 102,
    category: 'electronics',
    name: '空気清浄機 クリーンマスター プロ 900',
    description: 'ハイパワー空気清浄機。素早い清浄と多層フィルタ。',
    price: 16800,
    image: '/images/cleanmaster_pro_900.svg',
    skus: [
      { id: 'e102-1', name: '標準フィルタ', price: 16800 },
      { id: 'e102-2', name: '活性炭フィルタ', price: 18800 }
    ],
    // パターン有効時に在庫切れにするSKUのIDリスト
    soldOutSkus: ['e102-1'], // 最安SKUを在庫切れに
    specs: {
      powerW: 60,
      batteryHours: 0,
      noiseDb: 32,
      coverageM2: 35,
      pm25Capture: '97%'
    },
    specOrder: ['pm25Capture', 'powerW', 'coverageM2', 'batteryHours', 'noiseDb'],
    // 研究意図: ハズレ商品のpreselection設定は法則に基づく（カテゴリ内での順序による分類）
    // 法則: 各カテゴリで1番目のハズレ商品（102, 202, 205, 208）は中価格オプション+無料オプション
    defaultOptions: {
      warranty: false,     // 無効
      insurance: true,     // 有効（+¥1,500）- 中価格オプション
      newsletter: true,    // 有効（無料）- 心理的ハードル低
      premiumSupport: false // 無効
    },
    optionOrder: ['insurance', 'premiumSupport', 'warranty', 'newsletter'] // 中価格→高価格→低価格→無料の順
  },
  // ハズレ商品（表示価格は安いが在庫切れで実質的に高価格SKUのみ購入可能）
  {
    id: 103,
    category: 'electronics',
    name: '空気清浄機 エコマックス ターボ S',
    description: '低消費電力・広範囲・超静音。明らかに高コスパ設計。',
    price: 9900, // 最安価格に設定
    image: '/images/ecomax_turbo_s.svg',
    skus: [
      { id: 'e103-1', name: '標準フィルタ', price: 9900 },
      { id: 'e103-2', name: '長寿命フィルタ', price: 15000 }
    ],
    // パターン有効時に最安SKUを在庫切れに
    soldOutSkus: ['e103-1'],
    specs: {
      powerW: 22,       // 低消費電力
      batteryHours: 0,
      noiseDb: 19,      // 非常に静音
      coverageM2: 40,   // 広範囲
      pm25Capture: '99%'
    },
    specOrder: ['powerW', 'pm25Capture', 'batteryHours', 'coverageM2', 'noiseDb'],
    // 研究意図: ハズレ商品のpreselection設定は法則に基づく（カテゴリ内での順序による分類）
    // 法則: 各カテゴリで2番目のハズレ商品（103, 203, 206, 209）は高価格オプション中心（追加コスト最大化）
    defaultOptions: {
      warranty: true,      // 有効（+¥2,000）
      insurance: true,     // 有効（+¥1,500）
      newsletter: false,   // 無効
      premiumSupport: true // 有効（+¥3,000）- 最も高額なオプション
    },
    optionOrder: ['premiumSupport', 'insurance', 'warranty', 'newsletter'] // 高価格→中価格→低価格→無料の順
  },
  // ハズレ商品2
  {
    id: 104,
    category: 'electronics',
    name: '空気清浄機 パワークリーン プレミアム',
    description: '強力な清浄能力を誇るプレミアムモデル。大容量フィルタと自動運転機能付き。',
    price: 11800,
    image: '/images/airflow_lite_200.svg',
    skus: [
      { id: 'e104-1', name: '標準フィルタ', price: 11800 },
      { id: 'e104-2', name: 'プレミアムフィルタ', price: 14800 }
    ],
    // パターン有効時に最安SKUを在庫切れに
    soldOutSkus: ['e104-1'],
    specs: {
      powerW: 55,
      batteryHours: 0,
      noiseDb: 30,
      coverageM2: 30,
      pm25Capture: '96%'
    },
    specOrder: ['noiseDb', 'coverageM2', 'powerW', 'batteryHours', 'pm25Capture'],
    // 研究意図: ハズレ商品のpreselection設定は法則に基づく（カテゴリ内での順序による分類）
    // 法則: 各カテゴリで3番目のハズレ商品（104, 105）は中価格オプションのみ
    defaultOptions: {
      warranty: false,     // 無効
      insurance: true,     // 有効（+¥1,500）- 中価格オプション
      newsletter: false,   // 無効
      premiumSupport: false // 無効
    },
    optionOrder: ['insurance', 'premiumSupport', 'warranty', 'newsletter'] // 中価格→高価格→低価格→無料の順
  },
  // ハズレ商品3
  {
    id: 105,
    category: 'electronics',
    name: '空気清浄機 スマートエアー コンパクト',
    description: '省スペース設計のコンパクトモデル。アプリ連携でリモート操作も可能。',
    price: 10800,
    image: '/images/cleanmaster_pro_900.svg',
    skus: [
      { id: 'e105-1', name: '標準フィルタ', price: 10800 },
      { id: 'e105-2', name: '抗菌フィルタ', price: 13800 }
    ],
    // パターン有効時に最安SKUを在庫切れに
    soldOutSkus: ['e105-1'],
    specs: {
      powerW: 35,
      batteryHours: 0,
      noiseDb: 25,
      coverageM2: 25,
      pm25Capture: '94%'
    },
    specOrder: ['batteryHours', 'noiseDb', 'pm25Capture', 'powerW', 'coverageM2'],
    // 研究意図: ハズレ商品のpreselection設定は法則に基づく（カテゴリ内での順序による分類）
    // 法則: 各カテゴリで4番目のハズレ商品（105）は低価格オプション+無料オプション
    defaultOptions: {
      warranty: true,      // 有効（+¥2,000）- 低価格オプション
      insurance: false,    // 無効
      newsletter: true,    // 有効（無料）- 心理的ハードルが低い
      premiumSupport: false // 無効
    },
    optionOrder: ['newsletter', 'warranty', 'insurance', 'premiumSupport'] // 無料→低価格→中価格→高価格の順
  },

  // 掃除機（Vacuum Cleaners）
  {
    id: 201,
    category: 'electronics',
    name: '掃除機 パワースイープ プロ', // 正解商品（掃除機カテゴリ）
    description: '超強力吸引力と軽量設計を両立。消費電力効率が高く、騒音も低め。明らかに高コスパ設計の掃除機。',
    price: 12800,
    image: '/images/vacuum_cleaner.svg',
    skus: [
      { id: 'v201-1', name: '標準モデル', price: 12800 },
      { id: 'v201-2', name: 'ヘパフィルタ付', price: 15800 }
    ],
    soldOutSkus: [], // 正解商品
    specs: {
      suctionW: 580,  // より強力
      weightKg: 3.2,  // より軽量
      cordLengthM: 6,  // より長い
      dustCapacityL: 1.0,  // より大容量
      noiseDb: 62  // より静音
    },
    specOrder: ['weightKg', 'suctionW', 'cordLengthM', 'dustCapacityL', 'noiseDb'],
    // 研究意図: 正解商品（掃除機）は最小限のオプション（追加コスト抑制）
    // 正解商品間で一貫性を持たせ、ハズレ商品との対比を明確に
    defaultOptions: {
      warranty: true,      // 唯一の有料オプション、ただし低価格（+¥2,000）
      insurance: false,    // 無効
      newsletter: false,   // 無効
      premiumSupport: false // 無効
    },
    optionOrder: ['warranty', 'newsletter', 'insurance', 'premiumSupport'] // 低価格→無料→中価格→高価格の順
  },
  {
    id: 202,
    category: 'electronics',
    name: '掃除機 デラックススイープ ハイパー',
    description: '強力吸引力を誇る高級モデル。大容量ダストカップとヘパフィルタ標準装備。',
    price: 15800,
    image: '/images/vacuum_cleaner.svg',
    skus: [
      { id: 'v202-1', name: '標準モデル', price: 15800 },
      { id: 'v202-2', name: 'ワイヤレスモデル', price: 22800 }
    ],
    soldOutSkus: ['v202-1'], // ハズレ商品
    specs: {
      suctionW: 520,  // 正解商品より低い
      weightKg: 4.5,  // より重い
      cordLengthM: 5,
      dustCapacityL: 1.1,
      noiseDb: 70  // よりうるさい
    },
    specOrder: ['suctionW', 'dustCapacityL', 'noiseDb', 'weightKg', 'cordLengthM'],
    // 研究意図: ハズレ商品のpreselection設定は法則に基づく（カテゴリ内での順序による分類）
    // 法則: 各カテゴリで1番目のハズレ商品（102, 202, 205, 208）は中価格オプション+無料オプション
    defaultOptions: {
      warranty: false,     // 無効
      insurance: true,     // 有効（+¥1,500）
      newsletter: true,    // 有効（無料）
      premiumSupport: false // 無効
    },
    optionOrder: ['insurance', 'premiumSupport', 'warranty', 'newsletter'] // 中価格→高価格→低価格→無料の順
  },
  {
    id: 203,
    category: 'electronics',
    name: '掃除機 エコスイープ ライト',
    description: '軽量・コンパクト設計。エコモード搭載の省エネモデル。',
    price: 11200,
    image: '/images/vacuum_cleaner.svg',
    skus: [
      { id: 'v203-1', name: '標準モデル', price: 11200 },
      { id: 'v203-2', name: '充電式モデル', price: 18200 }
    ],
    soldOutSkus: ['v203-1'], // ハズレ商品
    specs: {
      suctionW: 380,  // 正解商品より大幅に低い
      weightKg: 3.0,
      cordLengthM: 4.5,
      dustCapacityL: 0.7,
      noiseDb: 60
    },
    specOrder: ['weightKg', 'noiseDb', 'suctionW', 'cordLengthM', 'dustCapacityL'],
    // 研究意図: ハズレ商品のpreselection設定は法則に基づく（カテゴリ内での順序による分類）
    // 法則: 各カテゴリで2番目のハズレ商品（103, 203, 206, 209）は高価格オプション中心（追加コスト最大化）
    defaultOptions: {
      warranty: true,      // 有効（+¥2,000）
      insurance: true,     // 有効（+¥1,500）
      newsletter: false,   // 無効
      premiumSupport: true // 有効（+¥3,000）- 最も高額
    },
    optionOrder: ['premiumSupport', 'insurance', 'warranty', 'newsletter'] // 高価格→中価格→低価格→無料の順
  },
  // もう一つの家電商品（加湿器）
  {
    id: 204,
    category: 'electronics',
    name: '加湿器 コンパクトモイスト ミニ',
    description: '省スペース設計の小型加湿器。デスク回りにも最適。',
    price: 8800,
    image: '/images/humidifier.svg',
    skus: [
      { id: 'h204-1', name: '標準モデル', price: 8800 },
      { id: 'h204-2', name: 'LEDライト付', price: 11800 }
    ],
    soldOutSkus: ['h204-1'], // ハズレ商品
    specs: {
      capacityL: 2.5,
      coverageM2: 15,
      powerW: 26,
      noiseDb: 28,  // よりうるさい
      autoOff: true
    },
    specOrder: ['powerW', 'noiseDb', 'capacityL', 'coverageM2'],
    // 研究意図: ハズレ商品のpreselection設定は法則に基づく（カテゴリ内での順序による分類）
    // 法則: 各カテゴリで2番目のハズレ商品（103, 203, 206, 209）は高価格オプション中心（追加コスト最大化）
    defaultOptions: {
      warranty: true,      // 有効（+¥2,000）
      insurance: true,     // 有効（+¥1,500）
      newsletter: false,   // 無効
      premiumSupport: true // 有効（+¥3,000）- 最も高額
    },
    optionOrder: ['premiumSupport', 'insurance', 'warranty', 'newsletter'] // 高価格→中価格→低価格→無料の順
  },
  {
    id: 205,
    category: 'electronics',
    name: '加湿器 プレミアムモイスト プラス',
    description: '大容量タンクとナノイー技術。広範囲対応の高機能モデル。',
    price: 14800,
    image: '/images/humidifier.svg',
    skus: [
      { id: 'h205-1', name: '標準モデル', price: 14800 },
      { id: 'h205-2', name: 'アロマディフューザー付', price: 18800 }
    ],
    soldOutSkus: ['h205-1'], // ハズレ商品
    specs: {
      capacityL: 4.5,
      coverageM2: 28,
      powerW: 40,  // より消費電力が高い
      noiseDb: 30,  // よりうるさい
      autoOff: true
    },
    specOrder: ['coverageM2', 'capacityL', 'powerW', 'noiseDb'],
    // 研究意図: ハズレ商品のpreselection設定は法則に基づく（カテゴリ内での順序による分類）
    // 法則: 各カテゴリで1番目のハズレ商品（102, 202, 205, 208）は中価格オプション+無料オプション
    defaultOptions: {
      warranty: false,     // 無効
      insurance: true,     // 有効（+¥1,500）
      newsletter: true,    // 有効（無料）
      premiumSupport: false // 無効
    },
    optionOrder: ['insurance', 'premiumSupport', 'warranty', 'newsletter'] // 中価格→高価格→低価格→無料の順
  },
  {
    id: 206,
    category: 'electronics',
    name: '加湿器 モイストエアー スタンダード', // 正解商品（加湿器カテゴリ）
    description: '大容量タンクと低消費電力、広範囲対応を実現。静音運転と自動オフ機能で、明らかに高コスパ設計の加湿器。',
    price: 9800,
    image: '/images/humidifier.svg',
    skus: [
      { id: 'h206-1', name: '標準モデル', price: 9800 },
      { id: 'h206-2', name: '抗菌フィルタ付', price: 12800 }
    ],
    soldOutSkus: [], // 正解商品
    specs: {
      capacityL: 4.0,  // より大容量（他より優れている）
      coverageM2: 22,  // より広範囲（他より優れている）
      powerW: 22,      // より低消費電力（他より優れている）
      noiseDb: 24,     // より静音（他より優れている）
      autoOff: true
    },
    specOrder: ['capacityL', 'powerW', 'noiseDb', 'coverageM2'],
    // 研究意図: 正解商品は全て同じ設定（warranty: true のみ、追加コスト+¥2,000）
    // 正解商品間で一貫性を持たせ、ハズレ商品との対比を明確に
    defaultOptions: {
      warranty: true,      // 唯一の有料オプション、ただし低価格（+¥2,000）
      insurance: false,    // 無効（追加コスト回避）
      newsletter: false,   // 無効（無料だが不要）
      premiumSupport: false // 無効（高額オプション回避）
    },
    optionOrder: ['warranty', 'newsletter', 'insurance', 'premiumSupport'] // 低価格→無料→中価格→高価格の順
  },
  {
    id: 214,
    category: 'electronics',
    name: '加湿器 スタンダードモイスト ベーシック',
    description: 'シンプル設計の標準加湿器。基本的な機能を搭載。',
    price: 8800, // 一覧で正解商品より安く見えるが、送料で正解商品を上回る（重度はそれほどあからさまではない）
    image: '/images/humidifier.svg',
    skus: [
      { id: 'h214-1', name: '標準モデル', price: 8800, shippingCost: 2200 }, // 8,800 + 2,200 + 200 = 11,200円（正解商品9,800 + 500 + 200 + 2,000 = 12,500円より安いが、商品価格のみ見ると正解商品より安い）
      { id: 'h214-2', name: '抗菌機能付', price: 11800, shippingCost: 2500 }
    ],
    soldOutSkus: [],
    specs: {
      capacityL: 3.0,
      coverageM2: 18,
      powerW: 25,
      noiseDb: 26,
      autoOff: true
    },
    specOrder: ['capacityL', 'powerW', 'noiseDb', 'coverageM2'],
    defaultOptions: {
      warranty: false,
      insurance: true,
      newsletter: true,
      premiumSupport: false
    },
    optionOrder: ['insurance', 'premiumSupport', 'warranty', 'newsletter']
  },
  {
    id: 215,
    category: 'electronics',
    name: '加湿器 デラックスモイスト エクストラ',
    description: '大容量タンクと高機能を搭載した加湿器。広範囲対応。',
    price: 16800,
    image: '/images/humidifier.svg',
    skus: [
      { id: 'h215-1', name: '標準モデル', price: 16800, shippingCost: 2000 },
      { id: 'h215-2', name: 'アロマ機能付', price: 20800, shippingCost: 2200 }
    ],
    soldOutSkus: [],
    specs: {
      capacityL: 4.2,
      coverageM2: 20,
      powerW: 28,
      noiseDb: 27,
      autoOff: true
    },
    specOrder: ['capacityL', 'powerW', 'noiseDb', 'coverageM2'],
    defaultOptions: {
      warranty: true,
      insurance: true,
      newsletter: false,
      premiumSupport: true
    },
    optionOrder: ['premiumSupport', 'insurance', 'warranty', 'newsletter']
  },
  {
    id: 216,
    category: 'electronics',
    name: '加湿器 コンパクトモイスト エコ',
    description: '省スペース設計の小型加湿器。エコモード搭載で省エネ設計。',
    price: 7800,
    image: '/images/humidifier.svg',
    skus: [
      { id: 'h216-1', name: '標準モデル', price: 7800 },
      { id: 'h216-2', name: 'タイマー機能付', price: 9800 }
    ],
    soldOutSkus: ['h216-1'], // ハズレ商品
    specs: {
      capacityL: 2.5,
      coverageM2: 15,
      powerW: 18,
      noiseDb: 24,
      autoOff: true
    },
    specOrder: ['weightKg', 'capacityL', 'powerW', 'noiseDb', 'coverageM2'],
    defaultOptions: {
      warranty: false,
      insurance: true,
      newsletter: true,
      premiumSupport: false
    },
    optionOrder: ['insurance', 'premiumSupport', 'warranty', 'newsletter']
  },
  {
    id: 217,
    category: 'electronics',
    name: '加湿器 プレミアムモイスト デラックス',
    description: '大容量タンクと高機能を搭載したプレミアム加湿器。広範囲対応で高性能。',
    price: 17800,
    image: '/images/humidifier.svg',
    skus: [
      { id: 'h217-1', name: '標準モデル', price: 17800 },
      { id: 'h217-2', name: 'ナノイー機能付', price: 21800 }
    ],
    soldOutSkus: ['h217-1'], // ハズレ商品
    specs: {
      capacityL: 4.5,
      coverageM2: 22,
      powerW: 30,
      noiseDb: 28,
      autoOff: true
    },
    specOrder: ['capacityL', 'powerW', 'coverageM2', 'noiseDb'],
    defaultOptions: {
      warranty: true,
      insurance: true,
      newsletter: false,
      premiumSupport: true
    },
    optionOrder: ['premiumSupport', 'insurance', 'warranty', 'newsletter']
  },
  // 電子レンジ（Microwave Ovens）
  {
    id: 207,
    category: 'electronics',
    name: '電子レンジ コンパクトウォーム ミニ',
    description: '省スペース設計の小型電子レンジ。一人暮らしに最適。',
    price: 13800,
    image: '/images/microwave_oven.svg',
    skus: [
      { id: 'm207-1', name: '標準モデル', price: 13800 },
      { id: 'm207-2', name: 'グリル機能付', price: 16800 }
    ],
    soldOutSkus: ['m207-1'], // ハズレ商品
    specs: {
      powerW: 800,  // 正解商品より大幅に低い
      capacityL: 25,
      weightKg: 16,
      consumptionWh: 1.3,
      functions: '解凍・温め'
    },
    specOrder: ['weightKg', 'powerW', 'capacityL', 'consumptionWh', 'functions'],
    // 研究意図: ハズレ商品のpreselection設定は法則に基づく（カテゴリ内での順序による分類）
    // 法則: 各カテゴリで2番目のハズレ商品（103, 203, 206, 209）は高価格オプション中心（追加コスト最大化）
    defaultOptions: {
      warranty: true,      // 有効（+¥2,000）
      insurance: true,     // 有効（+¥1,500）
      newsletter: false,   // 無効
      premiumSupport: true // 有効（+¥3,000）- 最も高額
    },
    optionOrder: ['premiumSupport', 'insurance', 'warranty', 'newsletter'] // 高価格→中価格→低価格→無料の順
  },
  {
    id: 208,
    category: 'electronics',
    name: '電子レンジ プレミアムウォーム プラス',
    description: '超高火力を誇るプレミアムモデル。大容量内部と多機能を搭載。',
    price: 24800,
    image: '/images/microwave_oven.svg',
    skus: [
      { id: 'm208-1', name: '標準モデル', price: 24800 },
      { id: 'm208-2', name: 'インバーター機能付', price: 28800 }
    ],
    soldOutSkus: ['m208-1'], // ハズレ商品
    specs: {
      powerW: 1100,  // 正解商品より低い
      capacityL: 30,
      weightKg: 22,  // より重い
      consumptionWh: 1.5,  // より消費電力が高い
      functions: '自動調理・解凍'
    },
    specOrder: ['powerW', 'capacityL', 'weightKg', 'consumptionWh', 'functions'],
    // 研究意図: ハズレ商品のpreselection設定は法則に基づく（カテゴリ内での順序による分類）
    // 法則: 各カテゴリで1番目のハズレ商品（102, 202, 205, 208）は中価格オプション+無料オプション
    defaultOptions: {
      warranty: false,     // 無効
      insurance: true,     // 有効（+¥1,500）
      newsletter: true,    // 有効（無料）
      premiumSupport: false // 無効
    },
    optionOrder: ['insurance', 'premiumSupport', 'warranty', 'newsletter'] // 中価格→高価格→低価格→無料の順
  },
  {
    id: 209,
    category: 'electronics',
    name: '電子レンジ クイックウォーム プロ', // 正解商品（電子レンジカテゴリ）
    description: '高火力と多機能を両立。内部容量も広く、消費電力効率も高い。明らかに高コスパ設計の電子レンジ。',
    price: 15800,
    image: '/images/microwave_oven.svg',
    skus: [
      { id: 'm209-1', name: '標準モデル', price: 15800 },
      { id: 'm209-2', name: 'スチーム機能付', price: 18800 }
    ],
    soldOutSkus: [], // 正解商品
    specs: {
      powerW: 1200,  // 高火力（他より優れている）
      capacityL: 32,  // 大容量（他より優れている）
      weightKg: 18,  // 軽量（他より優れている）
      consumptionWh: 1.2,  // 低消費電力（他より優れている）
      functions: '自動調理・解凍・スチーム'
    },
    specOrder: ['powerW', 'capacityL', 'consumptionWh', 'weightKg', 'functions'],
    // 研究意図: 正解商品（電子レンジ）は最小限のオプション（追加コスト抑制）
    // 正解商品間で一貫性を持たせ、ハズレ商品との対比を明確に
    defaultOptions: {
      warranty: true,      // 唯一の有料オプション、ただし低価格（+¥2,000）
      insurance: false,    // 無効
      newsletter: false,   // 無効
      premiumSupport: false // 無効
    },
    optionOrder: ['warranty', 'newsletter', 'insurance', 'premiumSupport'] // 低価格→無料→中価格→高価格の順
  },
  {
    id: 210,
    category: 'electronics',
    name: '電子レンジ スタンダードウォーム ベーシック',
    description: 'シンプル設計の標準電子レンジ。基本的な機能を搭載。',
    price: 13200, // 一覧で安く見えるが、送料で正解商品を上回る（中度はあからさま）
    image: '/images/microwave_oven.svg',
    skus: [
      { id: 'm210-1', name: '標準モデル', price: 13200, shippingCost: 3500 }, // 13,200 + 3,500 + 200 = 16,900円（正解商品15,800 + 500 + 200 + 2,000 = 18,500円より安いが、商品価格のみ見ると正解商品より安い）
      { id: 'm210-2', name: 'タイマー機能付', price: 16200, shippingCost: 3800 }
    ],
    soldOutSkus: [],
    specs: {
      powerW: 1000,
      capacityL: 28,
      weightKg: 20,
      consumptionWh: 1.4,
      functions: '温め・解凍'
    },
    specOrder: ['powerW', 'capacityL', 'consumptionWh', 'weightKg', 'functions'],
    defaultOptions: {
      warranty: false,
      insurance: true,
      newsletter: true,
      premiumSupport: false
    },
    optionOrder: ['insurance', 'premiumSupport', 'warranty', 'newsletter']
  },
  {
    id: 211,
    category: 'electronics',
    name: '電子レンジ デラックスウォーム エクストラ',
    description: '多機能を搭載した高機能電子レンジ。大型で使いやすい設計。',
    price: 15200, // 一覧でやや安く見えるが、送料で正解商品を上回る
    image: '/images/microwave_oven.svg',
    skus: [
      { id: 'm211-1', name: '標準モデル', price: 15200, shippingCost: 2500 }, // 15,200 + 2,500 + 200 = 17,900円
      { id: 'm211-2', name: 'オーブン機能付', price: 19200, shippingCost: 2800 }
    ],
    soldOutSkus: [],
    specs: {
      powerW: 1050,
      capacityL: 29,
      weightKg: 21,
      consumptionWh: 1.45,
      functions: '自動調理・解凍・温め'
    },
    specOrder: ['powerW', 'capacityL', 'weightKg', 'consumptionWh', 'functions'],
    defaultOptions: {
      warranty: true,
      insurance: true,
      newsletter: false,
      premiumSupport: true
    },
    optionOrder: ['premiumSupport', 'insurance', 'warranty', 'newsletter']
  },
  // 家具（Furniture）
  {
    id: 301,
    category: 'furniture',
    name: 'ノルディック・シンプルデスク',
    description: 'ミニマルデザインのワークデスク。リビングにも馴染む木目調。',
    price: 12980,
    image: '/images/nordic_simple_desk.svg',
    skus: [
      { id: 'f301-1', name: '幅100cm', price: 12980 },
      { id: 'f301-2', name: '幅120cm', price: 14980 }
    ],
    specs: {
      material: 'MDF＋スチール',
      size: '幅120×奥行60×高さ73cm',
      weightKg: 12,
      capacityKg: 60
    },
    defaultOptions: {
      warranty: true,
      insurance: false,
      newsletter: false,
      premiumSupport: false
    },
    optionOrder: ['warranty', 'insurance', 'newsletter', 'premiumSupport']
  },
  {
    id: 302,
    category: 'furniture',
    name: 'リラックスチェア・ソフト',
    description: '長時間でも快適な座り心地。腰部サポートと通気メッシュ。',
    price: 9980,
    image: '/images/relax_chair_soft.svg',
    skus: [
      { id: 'f302-1', name: '通常モデル', price: 9980 },
      { id: 'f302-2', name: 'ヘッドレスト付', price: 11980 }
    ],
    specs: {
      material: 'メッシュ＋樹脂',
      size: '幅65×奥行65×高さ110-120cm',
      weightKg: 10,
      capacityKg: 100
    },
    defaultOptions: {
      warranty: false,
      insurance: true,
      newsletter: true,
      premiumSupport: false
    },
    optionOrder: ['insurance', 'warranty', 'newsletter', 'premiumSupport']
  }
]

// 練習モード用の簡易ラインナップ（ダークパターン無し想定）
export const PRACTICE_PRODUCTS = [
  {
    id: 1001,
    category: 'electronics',
    name: 'やさしい空気清浄機 ベーシック',
    description: '練習用ラインナップ。分かりやすい仕様表示。',
    price: 9000,
    image: '/images/microwave_oven.svg',
    skus: [
      { id: 'p1001-1', name: '標準', price: 9000 },
      { id: 'p1001-2', name: '長寿命', price: 11000 }
    ],
    specs: { powerW: 30, noiseDb: 25, coverageM2: 25, pm25Capture: '96%' }
  },
  {
    id: 1002,
    category: 'furniture',
    name: 'やさしいデスク 100',
    description: '練習用ラインナップ。迷いにくい価格表示。',
    price: 10000,
    image: '/images/nordic_simple_desk.svg',
    skus: [
      { id: 'p1002-1', name: '幅100cm', price: 10000 }
    ],
    specs: { material: 'MDF＋スチール', size: '100×60×73cm', weightKg: 10 }
  },
  {
    id: 1003,
    category: 'electronics',
    name: 'やさしい空気清浄機 ライト',
    description: '練習用ラインナップ。SKUは1つだけ。',
    price: 8500,
    image: '/images/vacuum_cleaner.svg',
    skus: [
      { id: 'p1003-1', name: '標準', price: 8500 }
    ],
    specs: { powerW: 28, noiseDb: 24, coverageM2: 20 }
  }
]

// 商品IDから商品を取得（練習モードと本番モードの両方を検索）
export function getProductById(id) {
  // まず本番商品を検索
  const product = PRODUCTS.find(p => p.id === parseInt(id))
  if (product) return product
  
  // 見つからなければ練習モード商品を検索
  return PRACTICE_PRODUCTS.find(p => p.id === parseInt(id))
}

// 最安価格を取得（在庫切れを考慮しない、表示用）
export function getLowestPrice(product) {
  if (!product || !product.skus || product.skus.length === 0) {
    return product?.price || 0
  }
  return Math.min(...product.skus.map(sku => sku.price))
}

// 在庫切れを考慮した購入可能な最安価格を取得（パターン有効時のみ在庫切れを考慮）
export function getAvailableLowestPrice(product, patternEnabled = false) {
  if (!product || !product.skus || product.skus.length === 0) {
    return product?.price || 0
  }
  
  // パターン無効時、または在庫切れSKUがない場合は全SKUの最安価格
  if (!patternEnabled || !product.soldOutSkus || product.soldOutSkus.length === 0) {
    return Math.min(...product.skus.map(sku => sku.price))
  }
  
  // パターン有効時: 在庫切れSKUを除外した最安価格
  const availableSkus = product.skus.filter(sku => !product.soldOutSkus.includes(sku.id))
  if (availableSkus.length === 0) {
    // 全て在庫切れの場合（通常は発生しない）
    return Math.min(...product.skus.map(sku => sku.price))
  }
  return Math.min(...availableSkus.map(sku => sku.price))
}


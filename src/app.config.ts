export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/category/index',
    'pages/publish/index',
    'pages/message/index',
    'pages/profile/index',
  ],
  subPackages: [
    {
      root: 'pages/auth',
      pages: ['login/index', 'register/index']
    },
    {
      root: 'pages/product',
      pages: ['detail/index', 'search/index']
    },
    {
      root: 'pages/order',
      pages: ['list/index', 'detail/index', 'create/index', 'pay/index']
    },
    {
      root: 'pages/offer',
      pages: ['list/index', 'detail/index']
    },
    {
      root: 'pages/address',
      pages: ['list/index', 'edit/index']
    },
    {
      root: 'pages/logistics',
      pages: ['track/index']
    },
    {
      root: 'pages/wallet',
      pages: ['index/index', 'withdraw/index']
    },
    {
      root: 'pages/community',
      pages: ['feed/index', 'post/index', 'create/index']
    },
    {
      root: 'pages/coupon',
      pages: ['list/index']
    },
    {
      root: 'pages/points',
      pages: ['index/index', 'shop/index']
    },
    {
      root: 'pages/checkin',
      pages: ['index/index']
    },
    {
      root: 'pages/referral',
      pages: ['index/index']
    },
    {
      root: 'pages/kyc',
      pages: ['index/index', 'phone/index', 'identity/index']
    },
    {
      root: 'pages/review',
      pages: ['index/index']
    },
    {
      root: 'pages/notification',
      pages: ['index/index']
    },
    {
      root: 'pages/seller',
      pages: ['index/index']
    },
    {
      root: 'pages/admin',
      pages: ['index/index', 'users/index', 'reviews/index']
    },
    {
      root: 'pages/user',
      pages: ['profile/index']
    },
    {
      root: 'pages/settings',
      pages: ['index/index']
    },
    {
      root: 'pages/chat',
      pages: ['conversation/index']
    }
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#FF6B35',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tab/home.png',
        selectedIconPath: 'assets/tab/home-active.png'
      },
      {
        pagePath: 'pages/category/index',
        text: '分类',
        iconPath: 'assets/tab/category.png',
        selectedIconPath: 'assets/tab/category-active.png'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布',
        iconPath: 'assets/tab/publish.png',
        selectedIconPath: 'assets/tab/publish-active.png'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息',
        iconPath: 'assets/tab/message.png',
        selectedIconPath: 'assets/tab/message-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab/profile.png',
        selectedIconPath: 'assets/tab/profile-active.png'
      }
    ]
  },
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages/product']
    },
    'pages/category/index': {
      network: 'all',
      packages: ['pages/product']
    },
    'pages/message/index': {
      network: 'all',
      packages: ['pages/chat']
    }
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'REMX',
    navigationBarTextStyle: 'black'
  }
})

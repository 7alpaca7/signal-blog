/** @type {import('@/modules/articles/model/article-contracts.js').Article[]} */
export const demoArticles = [
  {
    id: 'weight',
    slug: 'weight-and-springs',
    title: '让交互拥有重量：阻尼与弹簧',
    excerpt: '从鼠标吸附到弹性回归，记录一套更接近真实触感的交互方式。',
    category: '开发实践',
    tags: ['Motion', 'JavaScript'],
    publishedAt: '2026-10-28',
    readingMinutes: 8,
    sections: [
      {
        id: 'position',
        title: '从位置，到运动',
        paragraphs: [
          '当元素直接移动到指针位置时，响应是准确的。加入延迟、阻力和回弹之后，它开始显得有分量：会追赶目标，也需要时间停下来。',
          '保留物体的位置和速度，让每一帧的变化从上一帧自然延续。',
        ],
      },
      {
        id: 'spring',
        title: '一个简单的弹簧',
        paragraphs: [
          '刚度决定拉回的力量，阻尼消耗运动的能量，质量影响加速的难易。把参数集中管理，整个网站才能拥有一致的手感。',
          '轻的元素迅速回应，重的元素缓慢跟随。不同的节奏，让界面产生层次。',
        ],
      },
      {
        id: 'restraint',
        title: '让运动学会克制',
        paragraphs: [
          '正文与目录保持稳定，把动作留给值得注意的反馈。允许打断，及时释放资源，也尊重减少动态效果的偏好。',
        ],
      },
    ],
  },
  {
    id: 'smiley',
    slug: 'a-little-pixel-friend',
    title: '给博客画一个会喝汽水的小黄脸',
    excerpt: '从一个表情开始，建立加载、转场和阅读反馈的角色语言。',
    category: '视觉设计',
    tags: ['Pixel', 'Motion'],
    publishedAt: '2026-10-24',
    readingMinutes: 6,
    sections: [
      {
        id: 'pixel',
        title: '从一个像素开始',
        paragraphs: [
          '有限的色板和清晰的轮廓是这次视觉实验的起点。让不同场景里的角色仍然容易识别。',
        ],
      },
      {
        id: 'character',
        title: '把角色放进体验',
        paragraphs: ['加载、转场和阅读反馈共用一个角色，各自拥有合适的动作节奏。'],
      },
      {
        id: 'space',
        title: '给视觉留下呼吸',
        paragraphs: ['用明确的层级组织信息，让像素细节集中在值得注意的位置。'],
      },
    ],
  },
  {
    id: 'tokens',
    slug: 'motion-tokens',
    title: 'Motion Tokens：让动画有共同的节奏',
    excerpt: '把速度、阻尼和位移整理成可复用的动效规则。',
    category: '开发实践',
    tags: ['Motion'],
    publishedAt: '2026-10-18',
    readingMinutes: 7,
    sections: [
      {
        id: 'rhythm',
        title: '建立共同的节奏',
        paragraphs: [
          '先观察动作如何开始与停止，再把相近的行为整理成规则。参数的统一，不代表所有元素必须同速运动。',
        ],
      },
    ],
  },
  {
    id: 'noise',
    slug: 'flow-in-a-noise-field',
    title: '噪声场里的流动轨迹',
    excerpt: '用少量运动轨迹，让背景慢慢活起来。',
    category: '创意实验',
    tags: ['Creative Coding'],
    publishedAt: '2026-09-05',
    readingMinutes: 4,
    sections: [
      {
        id: 'experiment',
        title: '让规则生长',
        paragraphs: [
          '每次只调整一个参数，比较密度、速度和方向带来的感受。把值得保留的片段记录下来。',
        ],
      },
    ],
  },
  {
    id: 'garden',
    slug: 'start-a-digital-garden',
    title: '我的数字花园，从第一篇开始',
    excerpt: '不急着写成结论，先记录观察、问题和正在发生的过程。',
    category: '随手记录',
    tags: ['Writing'],
    publishedAt: '2025-12-21',
    readingMinutes: 3,
    sections: [
      {
        id: 'writing',
        title: '给未来的自己留一点线索',
        paragraphs: [
          '记录不必从完整的结论开始。一个问题、一段观察，或尚未完成的想法，都值得先写下来。',
        ],
      },
    ],
  },
];

/* ==============================================
   data.js — YOUR CONTENT GOES HERE
   Edit the objects below to fill in your own info.
   ============================================== */

// ----- About -----
const aboutData = {
  name: 'Xinyu Cao',
  role: 'undergraduate',
  bio: "I'm an undergraduate at Fudan University, majoring in Intelligent Science and Technology.   My current work focuses on AI agents, backend engineering and machine learning.",
  avatar: './img/avatar.jpg', // Set to 'your-photo.jpg' to show an image, or leave empty for an icon
  socials: [
    { label: 'GitHub',  url: 'https://github.com/Xinyu-cxy',   icon: 'github' },
    // { label: 'Scholar', url: 'https://scholar.google.com',        icon: 'scholar' },
    { label: 'Email',   url: 'mailto:25303070192@m.fudan.edu.cn',             icon: 'email' },
    // { label: 'Twitter', url: '#',                                 icon: 'twitter' }
  ]
};

// Notes data is now managed as .md files in the notes/ directory.
// Run `node scripts/build-notes.js` to generate js/notes-data.js.
// See notes-data.js for the compiled notesData object.

// ----- Projects -----
const projectsData = [
  // {
  //   name: 'Efficient Transformer Inference',
  //   description: 'A system for accelerating transformer model inference on consumer GPUs through kernel fusion and quantization. Achieves 3× speedup over baseline PyTorch implementations.',
  //   tags: ['CUDA', 'PyTorch', 'LLMs'],
  //   link: 'https://github.com/yourusername/transformer-inference',
  //   github: 'https://github.com/yourusername/transformer-inference'
  // },
  // {
  //   name: 'Distributed Training Framework',
  //   description: 'A lightweight framework for distributed data-parallel training that reduces communication overhead with gradient compression techniques.',
  //   tags: ['Python', 'MPI', 'Deep Learning'],
  //   link: 'https://github.com/yourusername/dist-train',
  //   github: 'https://github.com/yourusername/dist-train'
  // },
  // {
  //   name: 'ML Experiment Tracker',
  //   description: 'A self-hosted experiment tracking tool with a clean web interface. Logs metrics, hyperparameters, and artifacts with minimal setup.',
  //   tags: ['TypeScript', 'React', 'SQLite'],
  //   link: 'https://github.com/yourusername/exp-tracker',
  //   github: 'https://github.com/yourusername/exp-tracker'
  // },
  // {
  //   name: 'Paper Notes CLI',
  //   description: 'A command-line tool that helps organize and search through academic paper notes. Supports fuzzy search, tags, and BibTeX export.',
  //   tags: ['Rust', 'CLI', 'Research'],
  //   link: 'https://github.com/yourusername/paper-notes',
  //   github: 'https://github.com/yourusername/paper-notes'
  // }
];

// ----- Publications -----
const publicationsData = [
  {
    title: "I don't have any publication yet, but I'm trying",
    authors: 'Xinyu Cao',
    venue: 'happy venue',
    year: 2026,
    links: [
      { label: 'Paper', url: '#' },
      { label: 'Code', url: '#' },
      { label: 'BibTeX', url: '#' }
    ]
  },
  // {
  //   title: 'Scaling Data-Parallel Training with Adaptive Gradient Compression',
  //   authors: 'Your Name, Collaborator Two, Collaborator Three, Advisor Name',
  //   venue: 'ICML 2025',
  //   year: 2025,
  //   links: [
  //     { label: 'Paper', url: '#' },
  //     { label: 'Code', url: '#' }
  //   ]
  // },
  // {
  //   title: 'A Survey of Transformer Inference Optimizations',
  //   authors: 'Your Name, Advisor Name',
  //   venue: 'arXiv preprint, 2024',
  //   year: 2024,
  //   links: [
  //     { label: 'arXiv', url: '#' }
  //   ]
  // },
  // {
  //   title: 'Understanding the Role of Initialization in Deep Networks',
  //   authors: 'Your Name, Collaborator Four',
  //   venue: 'ICLR 2024 Workshop on Optimization',
  //   year: 2024,
  //   links: [
  //     { label: 'Paper', url: '#' },
  //     { label: 'Poster', url: '#' }
  //   ]
  // }
];

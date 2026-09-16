const images = import.meta.glob('../assets/images/Winners/*.png', { eager: true, import: 'default' });

const image = (file) => images[`../assets/images/Winners/${file}.png`];

export const winners = [
    { nomination: 'FLAY KING', name: 'МАКСИМ МЕРЦАЛОВ', image: image('МАКСИМ МЕРЦАЛОВ - FLAY KING') },
    { nomination: 'FLAY QUEEN', name: 'ДАРЬЯ ВАСИЛЬЕВА', image: image('ДАРЬЯ ВАСИЛЬЕВА - FLAY QUEEN') },
    { nomination: 'ШУМ ГОДА', name: 'ИВАН ИГИНОВ', image: image('ИВАН ИГИНОВ - ШУМ ГОДА') },
    { nomination: 'АКТИВ ГОДА', name: 'ИВАН ИГИНОВ', image: image('ИВАН ИГИНОВ - АКТИВ ГОДА') },
    { nomination: 'ЧАТТЕР ГОДА', name: 'ДАРЬЯ ВАСИЛЬЕВА', image: image('ДАРЬЯ ВАСИЛЬЕВА - ЧАТТЕР ГОДА') },
    { nomination: 'ПАРА ГОДА', name: 'МАКС И АСЯ', image: image('ПАРА ГОДА - МАКС И АСЯ') },
    { nomination: 'СКВАД ГОДА', name: 'БОТАНИКИ', image: image('СКВАД ГОДА - БОТАНИКИ') },
    { nomination: 'МЕМ ГОДА', name: 'ВЛАДИМИР КОСЕНКОВ', image: image('ВЛАДИМИР КОСЕНКОВ - МЕМ ГОДА') },
    { nomination: 'ТГК ГОДА', name: 'UEBKI NEWS', image: image('UEBKI NEWS - ТГК ГОДА') },
    { nomination: 'ИГРОК ГОДА', name: 'ВЛАДИМИР КОСЕНКОВ', image: image('ВЛАДИМИР КОСЕНКОВ - ИГРОК ГОДА') },
    { nomination: 'МАКСИМ ГОДА', name: 'МАКСИМ МУХИН', image: image('МАКСИМ МУХИН - МАКСИМ ГОДА') },
    { nomination: 'БОТАН ГОДА', name: 'СЕРГЕЙ ПАРШИН', image: image('СЕРГЕЙ ПАРШИН - БОТАН ГОДА') },
    { nomination: 'АЛКАШ ГОДА', name: 'НИКИТА НОВИКОВ', image: image('НИКИТА НОВИКОВ - АЛКАШ ГОДА') },
    { nomination: 'МАШИНА ГОДА', name: 'СЕМЕРКА ВАНЬКА', image: image('СЕМЕРКА ВАНЬКА - МАШИНА ГОДА') },
    { nomination: 'ПЕСНЯ ГОДА', name: 'GDE IPAIT', image: image('ПЕСНЯ ГОДА - GDE IPAIT') },
    { nomination: 'ИВЕНТ ГОДА', name: 'ПОСВЯТ 2024', image: image('ИВЕНТ ГОДА - ПОСВЯТ 2024') },
    { nomination: 'ПЬЯНКА ГОДА', name: 'ПОСВЯТ 2024', image: image('ПЬЯНКА ГОДА - ПОСВЯТ 2024') },
    { nomination: 'ФЕЙЛ ГОДА', name: 'МАКСИМ И 30К', image: image('ФЕЙЛ ГОДА - МАКСИМ И 30К') },
];

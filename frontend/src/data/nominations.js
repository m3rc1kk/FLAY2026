export const nominations = [
    {
        number: 1,
        title: 'FLAY KING',
        nominees: [
            { number: 1, name: 'ДАНИИЛ ЕГОРОВ' },
            { number: 2, name: 'ИЛЬЯ КОВАЛЁВ' },
            { number: 3, name: 'НИКИТА НОВИКОВ' },
            { number: 4, name: 'МАКСИМ ПЯТИН' },
            { number: 5, name: 'МАКСИМ МЕРЦАЛОВ' },
            { number: 6, name: 'ИВАН ИГИНОВ' },
            { number: 7, name: 'ЕВГЕНИЙ БРАГУЦА' },
        ],
    },
    { number: 2, title: 'FLAY QUEEN', nominees: [] },
    { number: 3, title: 'ШУМ ГОДА', nominees: [] },
    { number: 4, title: 'ПАРА ГОДА', nominees: [] },
    { number: 5, title: 'МЕМ ГОДА', nominees: [] },
    { number: 6, title: 'СКВАД ГОДА', nominees: [] },
    { number: 7, title: 'ТГКАНАЛ ГОДА', nominees: [] },
    { number: 8, title: 'МОЗГ ГОДА', nominees: [] },
    { number: 9, title: 'ЧАТТЕР ГОДА', nominees: [] },
];

export const findNomination = (number) =>
    nominations.find((nomination) => nomination.number === Number(number));

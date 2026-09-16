import { nominations } from '../../data/nominations.js';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export const users = [
    { id: 1, name: 'Даниил Егоров', username: 'degorov' },
    { id: 2, name: 'Илья Ковалёв', username: 'kovalev_i' },
    { id: 3, name: 'Никита Новиков', username: 'nnovikov' },
    { id: 4, name: 'Максим Пятин', username: 'pyatin' },
    { id: 5, name: 'Максим Мерцалов', username: 'm3rc1kk' },
    { id: 6, name: 'Иван Игинов', username: 'iginov' },
    { id: 7, name: 'Евгений Брагуца', username: 'braguca' },
    { id: 8, name: 'Дарья Васильева', username: 'dasha_v' },
    { id: 9, name: 'Владимир Косенков', username: 'kosenkov' },
    { id: 10, name: 'Сергей Паршин', username: 'parshin' },
    { id: 11, name: 'Максим Мухин', username: 'mukhin' },
    { id: 12, name: 'Ася Лебедева', username: 'asya_l' },
];

export const stats = {
    online: 6,
    totalUsers: 47,
    newToday: 3,
    votedUsers: 31,
    completedUsers: 12,
    totalVotes: 196,
    votesToday: 23,
};

export const onlineUsers = [5, 8, 2, 11, 6, 12];

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

export const voting = {
    startsAt: startOfToday.getTime() - 3 * DAY + 10 * 60 * MINUTE,
    endsAt: startOfToday.getTime() + 2 * DAY + 20 * 60 * MINUTE,
};

export const pastDayVotes = [58, 41, 74, 52, 63, 47, 69, 55, 38, 61];

const turnout = [44, 38, 31, 29, 35, 22, 18, 26, 33];

export const nominationTurnout = nominations.map((nomination, index) => ({
    number: nomination.number,
    title: nomination.title,
    votes: turnout[index] ?? 0,
}));

const nominee = (nominationNumber, nomineeIndex) => nominations
    .find((nomination) => nomination.number === nominationNumber)
    ?.nominees[nomineeIndex]?.name ?? null;

export const events = [
    { id: 1, type: 'vote', userId: 8, nomination: 'FLAY KING', nominee: nominee(1, 4), at: Date.now() - 2 * MINUTE },
    { id: 2, type: 'join', userId: 12, at: Date.now() - 6 * MINUTE },
    { id: 3, type: 'vote', userId: 2, nomination: 'ШУМ ГОДА', nominee: null, at: Date.now() - 11 * MINUTE },
    { id: 4, type: 'revoke', userId: 11, nomination: 'FLAY KING', nominee: nominee(1, 2), at: Date.now() - 18 * MINUTE },
    { id: 5, type: 'vote', userId: 11, nomination: 'FLAY KING', nominee: nominee(1, 5), at: Date.now() - 19 * MINUTE },
    { id: 6, type: 'ban', userId: 10, reason: 'Второй аккаунт', at: Date.now() - 42 * MINUTE },
    { id: 7, type: 'vote', userId: 6, nomination: 'МЕМ ГОДА', nominee: null, at: Date.now() - 55 * MINUTE },
    { id: 8, type: 'join', userId: 9, at: Date.now() - 80 * MINUTE },
];

export const findUser = (id) => users.find((user) => user.id === id);

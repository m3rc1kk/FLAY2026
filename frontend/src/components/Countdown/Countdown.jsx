import { Fragment, useEffect, useState } from 'react';

const pad = (value) => String(value).padStart(2, '0');

export default function Countdown({ startsAt, endsAt }) {
    const start = startsAt ? new Date(startsAt).getTime() : null;
    const end = new Date(endsAt).getTime();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const isUpcoming = start !== null && now < start;
    const left = Math.max(0, (isUpcoming ? start : end) - now);
    const label = isUpcoming ? 'ДО НАЧАЛА ГОЛОСОВАНИЯ' : 'ДО КОНЦА ГОЛОСОВАНИЯ';

    if (left === 0) {
        return (
            <div className="countdown is-finished">
                <span className="countdown__label">ГОЛОСОВАНИЕ ЗАВЕРШЕНО</span>
            </div>
        );
    }

    const seconds = Math.floor(left / 1000);
    const units = [
        { label: 'ДНЕЙ', value: Math.floor(seconds / 86400) },
        { label: 'ЧАСОВ', value: Math.floor(seconds / 3600) % 24 },
        { label: 'МИНУТ', value: Math.floor(seconds / 60) % 60 },
        { label: 'СЕКУНД', value: seconds % 60 },
    ];

    return (
        <div className="countdown" role="timer" aria-label={label.toLowerCase()}>
            <span className="countdown__label" aria-hidden="true">{label}</span>

            <div className="countdown__units" aria-hidden="true">
                {units.map((unit, index) => (
                    <Fragment key={unit.label}>
                        {index > 0 && <span className="countdown__colon">:</span>}
                        <div className="countdown__unit">
                            <span className="countdown__value">
                                {pad(unit.value).split('').map((digit, position, digits) => (
                                    <span className="countdown__digit" key={`${digits.length - position}-${digit}`}>{digit}</span>
                                ))}
                            </span>
                            <span className="countdown__unit-label">{unit.label}</span>
                        </div>
                    </Fragment>
                ))}
            </div>
        </div>
    );
}

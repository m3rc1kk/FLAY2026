import { Fragment, useEffect, useState } from 'react';

const pad = (value) => String(value).padStart(2, '0');

const getTimeLeft = (end) => Math.max(0, end - Date.now());

export default function Countdown({ endsAt }) {
    const end = new Date(endsAt).getTime();
    const [left, setLeft] = useState(() => getTimeLeft(end));

    useEffect(() => {
        const timer = setInterval(() => setLeft(getTimeLeft(end)), 1000);
        return () => clearInterval(timer);
    }, [end]);

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
        <div className="countdown" role="timer" aria-label="До конца голосования">
            <span className="countdown__label" aria-hidden="true">ДО КОНЦА ГОЛОСОВАНИЯ</span>

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

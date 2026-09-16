import LogoMark from '../LogoMark/LogoMark.jsx';

const ITEMS = ['FLAY 2026', 'ETERNITY', 'FLAY 2026', 'ETERNITY'];

function MarqueeGroup() {
    return (
        <div className="marquee__group">
            {ITEMS.map((item, index) => (
                <div className="marquee__entry" key={index}>
                    <span className={`marquee__item${index % 2 ? ' marquee__item--outline' : ''}`}>{item}</span>
                    <LogoMark className="marquee__separator" />
                </div>
            ))}
        </div>
    );
}

export default function Marquee() {
    return (
        <div className="marquee" aria-hidden="true">
            <div className="marquee__track">
                <MarqueeGroup />
                <MarqueeGroup />
            </div>
        </div>
    );
}

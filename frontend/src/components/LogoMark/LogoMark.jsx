export default function LogoMark({ className = '', assemble = false }) {
    return (
        <svg
            className={`logo-mark${assemble ? ' logo-mark--assemble' : ''} ${className}`}
            viewBox="0 0 32 34"
            width="32"
            height="34"
            fill="none"
            aria-hidden="true"
        >
            <path className="logo-mark__part logo-mark__part--top" d="M31.9879 0L27.4145 8.18341H0L5.58025 0H31.9879Z" />
            <path className="logo-mark__part logo-mark__part--middle" d="M24.9124 19.7765H12.4453V11.3008H29.1168L24.9124 19.7765Z" />
            <path className="logo-mark__part logo-mark__part--stem" d="M8.69135 29.3511L4.22203 33.9597L0 29.6059V11.3008H8.69135V29.3511Z" />
        </svg>
    );
}

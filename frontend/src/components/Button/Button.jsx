import {Link} from "react-router-dom";

export default function ButtonLink({to, href, children, className='', onClick, type, disabled, ...rest }) {
    if (href) {
        const isExternal = /^https?:\/\//.test(href);

        return (
            <a href={href} className={`button__link ${className}`} {...(isExternal && {target: '_blank', rel: 'noopener noreferrer'})} {...rest}>
                {children}
            </a>
        );
    }

    if (to) {
        return (
            <Link to={to} className={`button__link ${className}`}>
                {children}
            </Link>
        );
    }

    return (
        <button className={`button ${className}`} onClick={onClick} type={type} disabled={disabled} {...rest}>
            {children}
        </button>
    )
}
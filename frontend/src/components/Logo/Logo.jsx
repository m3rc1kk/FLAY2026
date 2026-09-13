import logo from '../../assets/images/logo.svg';

export default function Logo({className='header__logo'}) {
    return (
        <div className={`logo ${className}`}>
            <img src={logo} alt="Logo" width="32" height="34" loading="lazy" className="logo__image" />
        </div>
    )
}
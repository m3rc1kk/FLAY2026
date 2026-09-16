export const initials = (name) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export function CandidatePhoto({ candidate, className = '' }) {
    return (
        <span className={`admin-photo ${className}`} title={candidate.name}>
            {candidate.photo
                ? <img src={candidate.photo} alt="" className="admin-photo__image" />
                : initials(candidate.name)}
        </span>
    );
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export function readPhoto(file, onError) {
    if (!file) return null;
    if (!file.type.startsWith('image/')) {
        onError('Нужна картинка: JPG, PNG или WebP');
        return null;
    }
    if (file.size > MAX_PHOTO_SIZE) {
        onError('Фото больше 5 МБ, сожми его');
        return null;
    }
    return URL.createObjectURL(file);
}

export function PhotoDrop({ photo, name = '', onChange, onError, className = '', emptyLabel = 'Фото', changeLabel = 'Сменить' }) {
    const handleFiles = (files) => {
        const url = readPhoto(files?.[0], onError);
        if (url) onChange(url);
    };

    return (
        <label
            className={`admin-photo-drop${photo ? ' has-photo' : ''} ${className}`}
            onDragOver={(event) => {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.classList.add('is-over');
            }}
            onDragLeave={(event) => event.currentTarget.classList.remove('is-over')}
            onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.classList.remove('is-over');
                handleFiles(event.dataTransfer.files);
            }}
        >
            <input
                type="file"
                accept="image/*"
                className="admin-photo-drop__input"
                onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = '';
                }}
            />
            {photo ? (
                <img src={photo} alt={name} className="admin-photo-drop__image" />
            ) : name ? (
                <span className="admin-photo-drop__initials">{initials(name)}</span>
            ) : (
                <span className="admin-photo-drop__empty">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                    {emptyLabel}
                </span>
            )}
            <span className="admin-photo-drop__overlay">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                    <path d="M4 8h3l2-3h6l2 3h3v11H4V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                {photo ? changeLabel : emptyLabel}
            </span>
        </label>
    );
}

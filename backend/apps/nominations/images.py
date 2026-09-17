from io import BytesIO
from pathlib import Path

from django.core.files.base import ContentFile
from PIL import Image, ImageOps


MAX_PHOTO_SIZE = (1000, 1200)
MAX_PHOTO_BYTES = 5 * 1024 * 1024
MAX_PHOTO_PIXELS = 50_000_000
PHOTO_QUALITY = 85
PHOTO_EXTENSIONS = ('jpg', 'jpeg', 'png', 'webp')


class PhotoError(Exception):
    pass


def check_photo(file):
    if file.size > MAX_PHOTO_BYTES:
        raise PhotoError('Image size should be less than 5MB.')
    if file.name.rsplit('.', 1)[-1].lower() not in PHOTO_EXTENSIONS:
        raise PhotoError('Only JPG, PNG and WebP images are allowed.')

    file.seek(0)
    try:
        with Image.open(file) as image:
            width, height = image.size
    except Exception:
        raise PhotoError('This file is not an image.')

    if width * height > MAX_PHOTO_PIXELS:
        raise PhotoError('Image resolution is too large.')


def compress_photo(file):
    check_photo(file)
    file.seek(0)
    with Image.open(file) as source:
        image = ImageOps.exif_transpose(source)
        image = image.convert('RGBA' if image.mode in ('RGBA', 'LA', 'P') else 'RGB')
        image.thumbnail(MAX_PHOTO_SIZE, Image.Resampling.LANCZOS)
        buffer = BytesIO()
        image.save(buffer, 'WEBP', quality=PHOTO_QUALITY, method=6)
    return ContentFile(buffer.getvalue(), name=f'{Path(file.name).stem}.webp')

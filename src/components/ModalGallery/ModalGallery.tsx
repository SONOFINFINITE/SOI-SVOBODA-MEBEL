import React from 'react';
import styles from './ModalGallery.module.scss';

interface ModalGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  onNext: (e?: React.MouseEvent | React.TouchEvent) => void;
  onPrev: (e?: React.MouseEvent | React.TouchEvent) => void;
  onImageChange: (index: number) => void;
  currentImageIndex: number;
}

const ModalGallery: React.FC<ModalGalleryProps> = ({
  isOpen,
  onClose,
  images,
  onNext,
  onPrev,
  onImageChange,
  currentImageIndex,
}) => {
  // Handle keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !images.length) return null;

  return (
    <div className={styles.galleryModal} onClick={onClose}>
      <div className={styles.galleryContent} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.galleryClose} 
          onClick={onClose} 
          aria-label="Закрыть галерею"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className={styles.galleryImageContainer}>
          {images.map((imgSrc, index) => (
            <div 
              key={index}
              className={`${styles.galleryImage} ${index === currentImageIndex ? styles.galleryImageActive : ''}`}
              style={{ backgroundImage: `url(${imgSrc})` }}
            ></div>
          ))}
        </div>
        
        <div className={styles.galleryControls}>
          <button 
            className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`} 
            onClick={onPrev}
            aria-label="Предыдущее изображение"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className={styles.galleryDots}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${styles.galleryDot} ${index === currentImageIndex ? styles.galleryDotActive : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onImageChange(index);
                }}
                aria-label={`Изображение ${index + 1}`}
              />
            ))}
          </div>
          
          <button 
            className={`${styles.galleryArrow} ${styles.galleryArrowRight}`} 
            onClick={onNext}
            aria-label="Следующее изображение"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGallery;

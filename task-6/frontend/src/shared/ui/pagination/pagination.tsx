import styles from './pagination.module.scss';

type PaginationProps = {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
};

export const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    return (
        <nav className={styles.root} aria-label='Mission pagination'>
            <button disabled={page === 0} onClick={() => onChange(page - 1)}>
                ← PREVIOUS
            </button>
            <span>
                PAGE {page + 1} / {totalPages}
            </span>
            <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>
                NEXT →
            </button>
        </nav>
    );
};
